import { NextRequest, NextResponse } from 'next/server';
import { getTemplate } from '@/lib/database';

export async function GET(
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

    const template = await getTemplate(templateId);

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      fields: template.fields,
      fieldCount: template.fieldCount,
      createdAt: template.createdAt,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { message: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
