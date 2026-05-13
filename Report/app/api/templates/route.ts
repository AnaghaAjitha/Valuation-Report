import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, deleteTemplate } from '@/lib/database';

export async function GET() {
  try {
    const templates = await getAllTemplates();
    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        fileName: t.fileName,
        fieldCount: t.fieldCount,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { message: 'Template ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteTemplate(templateId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { message: 'Failed to delete template' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
