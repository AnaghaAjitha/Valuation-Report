import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { saveTemplate } from '@/lib/database';

// Regex to find placeholder fields like {field_name}
const FIELD_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateName = formData.get('templateName') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!templateName || templateName.trim().length === 0) {
      return NextResponse.json(
        { message: 'Template name is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from Word document
    const result = await mammoth.extractRawText({ arrayBuffer: bytes });
    const text = result.value;

    // Extract all fields using regex
    const matches = text.matchAll(FIELD_REGEX);
    const fieldsSet = new Set<string>();

    for (const match of matches) {
      fieldsSet.add(match[1]);
    }

    const fields = Array.from(fieldsSet).map((name) => ({
      name,
      type: name.includes('description') || name.includes('notes') ? 'textarea' : 'text',
    }));

    if (fields.length === 0) {
      return NextResponse.json(
        { message: 'No placeholder fields found in the document. Use {field_name} format.' },
        { status: 400 }
      );
    }

    // Generate a unique template ID
    const templateId = Date.now().toString();

    // Save template to database
    const metadata = await saveTemplate(
      templateId,
      templateName.trim(),
      file.name,
      buffer,
      fields
    );

    return NextResponse.json({
      templateId,
      fieldCount: fields.length,
      fields,
      fileName: file.name,
      templateName: metadata.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Failed to process the document' },
      { status: 500 }
    );
  }
}
