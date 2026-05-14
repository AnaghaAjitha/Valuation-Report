import JSZip from 'jszip';

const WORD_TEXT_NODE_REGEX = /<w:t\b[^>]*>[\s\S]*?<\/w:t>/g;
const WORD_TEXT_CONTENT_REGEX = /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/;
const WORD_CONTENT_XML_REGEX =
  /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes|comments)\.xml$/;

interface TextNode {
  fullMatch: string;
  start: number;
  end: number;
  text: string;
  textStart: number;
  textEnd: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function replaceTextNodeContent(node: TextNode, text: string): string {
  return node.fullMatch.replace(WORD_TEXT_CONTENT_REGEX, `$1${text}$3`);
}

function getTextNodes(xml: string): TextNode[] {
  const nodes: TextNode[] = [];
  const matches = xml.matchAll(WORD_TEXT_NODE_REGEX);

  for (const match of matches) {
    const fullMatch = match[0];
    const contentMatch = fullMatch.match(WORD_TEXT_CONTENT_REGEX);

    if (!contentMatch || match.index === undefined) {
      continue;
    }

    const text = contentMatch[2];
    const textOffset = contentMatch[1].length;
    const textStart = match.index + textOffset;

    nodes.push({
      fullMatch,
      start: match.index,
      end: match.index + fullMatch.length,
      text,
      textStart,
      textEnd: textStart + text.length,
    });
  }

  return nodes;
}

function findNodeAt(nodes: TextNode[], textIndex: number): TextNode | undefined {
  return nodes.find((node) => textIndex >= node.textStart && textIndex < node.textEnd);
}

function replacePlaceholderInXml(
  xml: string,
  placeholder: string,
  replacement: string
): string {
  let updatedXml = xml;
  let nodes = getTextNodes(updatedXml);
  let combinedText = nodes.map((node) => node.text).join('');
  let placeholderIndex = combinedText.indexOf(placeholder);

  while (placeholderIndex !== -1) {
    const placeholderEnd = placeholderIndex + placeholder.length;
    let runningLength = 0;
    const positionedNodes = nodes.map((node) => {
      const start = runningLength;
      runningLength += node.text.length;
      return {
        ...node,
        textStart: start,
        textEnd: runningLength,
      };
    });

    const startNode = findNodeAt(positionedNodes, placeholderIndex);
    const endNode = findNodeAt(positionedNodes, placeholderEnd - 1);

    if (!startNode || !endNode) {
      break;
    }

    const replacementByStart: Record<number, string> = {};
    const startOffset = placeholderIndex - startNode.textStart;
    const endOffset = placeholderEnd - endNode.textStart;

    for (const node of positionedNodes) {
      if (node.textEnd <= placeholderIndex || node.textStart >= placeholderEnd) {
        continue;
      }

      if (node.start === startNode.start && node.start === endNode.start) {
        replacementByStart[node.start] =
          node.text.slice(0, startOffset) + replacement + node.text.slice(endOffset);
      } else if (node.start === startNode.start) {
        replacementByStart[node.start] = node.text.slice(0, startOffset) + replacement;
      } else if (node.start === endNode.start) {
        replacementByStart[node.start] = node.text.slice(endOffset);
      } else {
        replacementByStart[node.start] = '';
      }
    }

    const changedNodes = positionedNodes
      .filter((node) => Object.prototype.hasOwnProperty.call(replacementByStart, node.start))
      .sort((a, b) => b.start - a.start);

    for (const node of changedNodes) {
      const newNode = replaceTextNodeContent(node, replacementByStart[node.start]);
      updatedXml = updatedXml.slice(0, node.start) + newNode + updatedXml.slice(node.end);
    }

    nodes = getTextNodes(updatedXml);
    combinedText = nodes.map((node) => node.text).join('');
    placeholderIndex = combinedText.indexOf(placeholder);
  }

  return updatedXml;
}

export async function fillDocxTemplate(
  templateBuffer: Buffer,
  data: Record<string, string>
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(templateBuffer);
  const replacements = Object.entries(data).flatMap(([key, value]) => {
    const replacement = escapeXml(value || '');

    return [
      { placeholder: `$${key}$`, replacement },
      { placeholder: `$ ${key} $`, replacement },
      { placeholder: `{${key}}`, replacement },
      { placeholder: `{ ${key} }`, replacement },
    ];
  });

  const xmlFiles = Object.values(zip.files).filter(
    (file) => !file.dir && WORD_CONTENT_XML_REGEX.test(file.name)
  );

  for (const file of xmlFiles) {
    let xml = await file.async('string');

    for (const { placeholder, replacement } of replacements) {
      xml = replacePlaceholderInXml(xml, placeholder, replacement);
    }

    zip.file(file.name, xml);
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}
