import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

const ASSET_TEMPLATES_DIR = path.join(process.cwd(), 'assets', 'templates');
const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');
const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const FIELD_REGEX =
  /\$\s*([a-zA-Z_][a-zA-Z0-9_ -]*?)\s*\$|\{\s*([a-zA-Z_][a-zA-Z0-9_ -]*?)\s*\}/g;

interface TemplateMetadata {
  id: string;
  name: string;
  fileName: string;
  fields: Array<{ name: string; type: string }>;
  createdAt: string;
  updatedAt: string;
  fieldCount: number;
}

interface Database {
  templates: TemplateMetadata[];
  reports: Array<{
    id: string;
    templateId: string;
    templateName: string;
    fileName: string;
    createdAt: string;
    data: Record<string, string>;
  }>;
}

// Initialize directories
async function initializeDirs() {
  try {
    await fs.mkdir(ASSET_TEMPLATES_DIR, { recursive: true });
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  } catch (error) {
    console.error('Error initializing directories:', error);
  }
}

// Read or create database
async function getDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    const defaultDb: Database = { templates: [], reports: [] };
    await saveDatabase(defaultDb);
    return defaultDb;
  }
}

// Save database
async function saveDatabase(db: Database): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function getTemplateName(fileName: string): string {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferFieldType(name: string): string {
  const lowerName = name.toLowerCase();
  return lowerName.includes('description') ||
    lowerName.includes('notes') ||
    lowerName.includes('remarks') ||
    lowerName.includes('comments')
    ? 'textarea'
    : 'text';
}

async function extractFields(buffer: Buffer): Promise<Array<{ name: string; type: string }>> {
  const result = await mammoth.extractRawText({ buffer });
  const fieldsSet = new Set<string>();

  for (const match of result.value.matchAll(FIELD_REGEX)) {
    fieldsSet.add((match[1] || match[2]).trim());
  }

  return Array.from(fieldsSet).map((name) => ({
    name,
    type: inferFieldType(name),
  }));
}

function getAssetTemplatePath(id: string): string {
  return path.join(ASSET_TEMPLATES_DIR, path.basename(decodeURIComponent(id)));
}

// Save template
export async function saveTemplate(
  id: string,
  name: string,
  fileName: string,
  buffer: Buffer,
  fields: Array<{ name: string; type: string }>
): Promise<TemplateMetadata> {
  await initializeDirs();

  const templatePath = path.join(TEMPLATES_DIR, `${id}.docx`);
  await fs.writeFile(templatePath, buffer);

  const db = await getDatabase();
  const metadata: TemplateMetadata = {
    id,
    name,
    fileName,
    fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fieldCount: fields.length,
  };

  // Remove if already exists, then add
  db.templates = db.templates.filter((t) => t.id !== id);
  db.templates.push(metadata);

  await saveDatabase(db);
  return metadata;
}

// Get all templates
export async function getAllTemplates(): Promise<TemplateMetadata[]> {
  await initializeDirs();
  const files = await fs.readdir(ASSET_TEMPLATES_DIR);
  const templates = (
    await Promise.all(
    files
      .filter((fileName) => fileName.toLowerCase().endsWith('.docx'))
      .map(async (fileName) => {
        try {
          const templatePath = path.join(ASSET_TEMPLATES_DIR, fileName);
          const [buffer, stats] = await Promise.all([
            fs.readFile(templatePath),
            fs.stat(templatePath),
          ]);
          const fields = await extractFields(buffer);
          const updatedAt = stats.mtime.toISOString();

          return {
            id: encodeURIComponent(fileName),
            name: getTemplateName(fileName),
            fileName,
            fields,
            createdAt: updatedAt,
            updatedAt,
            fieldCount: fields.length,
          };
        } catch (error) {
          console.warn(`Skipping invalid DOCX template "${fileName}":`, error);
          return null;
        }
      })
    )
  ).filter((template): template is TemplateMetadata => template !== null);

  return templates.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get template by ID
export async function getTemplate(id: string): Promise<TemplateMetadata | null> {
  await initializeDirs();
  try {
    const templatePath = getAssetTemplatePath(id);
    const [buffer, stats] = await Promise.all([
      fs.readFile(templatePath),
      fs.stat(templatePath),
    ]);
    const fileName = path.basename(templatePath);
    const fields = await extractFields(buffer);
    const updatedAt = stats.mtime.toISOString();

    return {
      id: encodeURIComponent(fileName),
      name: getTemplateName(fileName),
      fileName,
      fields,
      createdAt: updatedAt,
      updatedAt,
      fieldCount: fields.length,
    };
  } catch {
    return null;
  }
}

// Get template buffer
export async function getTemplateBuffer(id: string): Promise<Buffer> {
  return await fs.readFile(getAssetTemplatePath(id));
}

// Delete template
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${id}.docx`);
    await fs.unlink(templatePath);

    const db = await getDatabase();
    db.templates = db.templates.filter((t) => t.id !== id);
    await saveDatabase(db);

    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}

// Save report
export async function saveReport(
  templateId: string,
  templateName: string,
  reportName: string,
  buffer: Buffer,
  data: Record<string, string>
): Promise<string> {
  await initializeDirs();

  const reportId = Date.now().toString();
  const reportPath = path.join(REPORTS_DIR, `${reportId}.docx`);

  await fs.writeFile(reportPath, buffer);

  const db = await getDatabase();
  db.reports.push({
    id: reportId,
    templateId,
    templateName,
    fileName: reportName,
    createdAt: new Date().toISOString(),
    data,
  });

  await saveDatabase(db);
  return reportId;
}

// Get all reports
export async function getAllReports() {
  await initializeDirs();
  const db = await getDatabase();
  return db.reports.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get report buffer
export async function getReportBuffer(id: string): Promise<Buffer> {
  const reportPath = path.join(REPORTS_DIR, `${id}.docx`);
  return await fs.readFile(reportPath);
}

// Delete report
export async function deleteReport(id: string): Promise<boolean> {
  try {
    const reportPath = path.join(REPORTS_DIR, `${id}.docx`);
    await fs.unlink(reportPath);

    const db = await getDatabase();
    db.reports = db.reports.filter((r) => r.id !== id);
    await saveDatabase(db);

    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    return false;
  }
}
