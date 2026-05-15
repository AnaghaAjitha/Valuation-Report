import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'];

function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 10MB' },
        { status: 413 }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    let text = '';

    if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else if (fileName.endsWith('.txt')) {
      text = new TextDecoder().decode(arrayBuffer);
    } else if (isImageFile(fileName)) {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');

      try {
        const result = await worker.recognize(Buffer.from(arrayBuffer));
        text = result.data.text;
      } finally {
        await worker.terminate();
      }
    } else {
      return NextResponse.json(
        {
          message:
            'Only .docx, .txt, .png, .jpg, .jpeg, .webp, and .bmp files are supported',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      fileName: file.name,
      text: text.trim(),
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { message: 'Failed to extract text from the document' },
      { status: 500 }
    );
  }
}
