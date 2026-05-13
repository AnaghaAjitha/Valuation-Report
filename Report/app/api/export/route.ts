import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import { getTemplateBuffer, saveReport } from '@/lib/database';

const FIELD_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

async function replacePlaceholders(
  arrayBuffer: ArrayBuffer,
  data: Record<string, string>
): Promise<ArrayBuffer> {
  try {
    // Extract the document's HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    let html = result.value;

    // Replace placeholders with actual data
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      html = html.replace(regex, value || '');
    }

    // Create a new document with the replaced content
    const paragraphs = html
      .split(/<\/?p[^>]*>/g)
      .filter((text) => text.trim())
      .map(
        (text) =>
          new Paragraph({
            children: [
              new TextRun({
                text: text.replace(/<[^>]*>/g, ''), // Remove HTML tags
              }),
            ],
          })
      );

    const doc = new Document({
      sections: [
        {
          children: paragraphs.length > 0 ? paragraphs : [new Paragraph('Document generated successfully')],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, templateName, reportName, data } = body;

    if (!templateId || !data) {
      return NextResponse.json(
        { message: 'Missing templateId or data' },
        { status: 400 }
      );
    }

    // Read the template file from database
    let templateBuffer: Buffer;
    try {
      templateBuffer = await getTemplateBuffer(templateId);
    } catch {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Replace placeholders with actual data
    const resultBuffer = await replacePlaceholders(templateBuffer, data);

    // Save report to database
    try {
      const reportFileName = reportName || `valuation_report_${Date.now()}`;
      await saveReport(
        templateId,
        templateName || 'Unnamed Template',
        reportFileName,
        Buffer.from(resultBuffer),
        data
      );
    } catch (error) {
      console.error('Error saving report:', error);
      // Don't fail the export if saving fails, just log it
    }

    // Return the file as a download
    const response = new NextResponse(resultBuffer);
    response.headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${reportName || 'valuation_report'}_${Date.now()}.docx"`
    );

    return response;
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Failed to generate the report' },
      { status: 500 }
    );
  }
}
