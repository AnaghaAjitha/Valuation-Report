import { NextRequest, NextResponse } from 'next/server';
import { deleteTemplate } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

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
