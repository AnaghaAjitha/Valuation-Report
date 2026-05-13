import { NextRequest, NextResponse } from 'next/server';
import { getReportBuffer, deleteReport } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const reportBuffer = await getReportBuffer(reportId);

    const response = new NextResponse(reportBuffer);
    response.headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="report_${reportId}.docx"`
    );

    return response;
  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { message: 'Report not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteReport(reportId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { message: 'Failed to delete report' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { message: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
