import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, deleteReport } from '@/lib/database';

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        templateId: r.templateId,
        templateName: r.templateName,
        fileName: r.fileName,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

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
