import { NextRequest, NextResponse } from 'next/server';
import { getTemplateBuffer, saveReport } from '@/lib/database';
import { fillDocxTemplate } from '@/lib/docxTemplate';

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

    // Replace placeholders in the original DOCX package so formatting is preserved.
    const resultBuffer = await fillDocxTemplate(templateBuffer, data);

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
    const responseBody = resultBuffer.buffer.slice(
      resultBuffer.byteOffset,
      resultBuffer.byteOffset + resultBuffer.byteLength
    ) as ArrayBuffer;
    const response = new NextResponse(responseBody);
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
