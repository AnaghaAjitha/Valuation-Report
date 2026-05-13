/**
 * Auto-fill suggestions based on field names
 */

export interface FieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  dataType: 'text' | 'date' | 'number' | 'textarea';
}

/**
 * Get suggested values and data types for common field names
 */
export function getAutoFillSuggestion(fieldName: string): {
  suggestedValue: string;
  dataType: 'text' | 'date' | 'number' | 'textarea';
} {
  const lowerField = fieldName.toLowerCase();

  // Date fields - auto-populate with today's date
  if (
    lowerField.includes('date') ||
    lowerField.includes('_on') ||
    lowerField.includes('dated')
  ) {
    return {
      suggestedValue: new Date().toISOString().split('T')[0],
      dataType: 'date',
    };
  }

  // Numeric fields
  if (
    lowerField.includes('amount') ||
    lowerField.includes('value') ||
    lowerField.includes('price') ||
    lowerField.includes('area') ||
    lowerField.includes('sqft') ||
    lowerField.includes('square') ||
    lowerField.includes('rate') ||
    lowerField.includes('cost')
  ) {
    return {
      suggestedValue: '0',
      dataType: 'number',
    };
  }

  // Textarea fields - for descriptions and remarks
  if (
    lowerField.includes('description') ||
    lowerField.includes('remarks') ||
    lowerField.includes('notes') ||
    lowerField.includes('comments') ||
    lowerField.includes('details') ||
    lowerField.includes('observation')
  ) {
    return {
      suggestedValue: '',
      dataType: 'textarea',
    };
  }

  // Name fields
  if (
    lowerField.includes('name') ||
    lowerField.includes('owner') ||
    lowerField.includes('client') ||
    lowerField.includes('surveyor') ||
    lowerField.includes('appraiser')
  ) {
    return {
      suggestedValue: '',
      dataType: 'text',
    };
  }

  // Contact fields
  if (
    lowerField.includes('email') ||
    lowerField.includes('phone') ||
    lowerField.includes('contact') ||
    lowerField.includes('address')
  ) {
    return {
      suggestedValue: '',
      dataType: 'text',
    };
  }

  // License/ID fields
  if (
    lowerField.includes('license') ||
    lowerField.includes('number') ||
    lowerField.includes('id') ||
    lowerField.includes('code') ||
    lowerField.includes('ref')
  ) {
    return {
      suggestedValue: '',
      dataType: 'text',
    };
  }

  // Default to text
  return {
    suggestedValue: '',
    dataType: 'text',
  };
}

/**
 * Get quick-fill templates based on field names in the form
 */
export function getQuickFillPresets(fieldNames: string[]): Record<string, string> {
  const presets: Record<string, string> = {};

  fieldNames.forEach((fieldName) => {
    const suggestion = getAutoFillSuggestion(fieldName);
    presets[fieldName] = suggestion.suggestedValue;
  });

  return presets;
}

/**
 * Get common quick-fill templates (templates for different scenarios)
 */
export function getCommonTemplates(fieldNames: string[]): {
  name: string;
  data: Record<string, string>;
}[] {
  const templates = [];

  // Template 1: Empty template with all fields
  templates.push({
    name: 'Clear All',
    data: fieldNames.reduce(
      (acc, field) => {
        acc[field] = '';
        return acc;
      },
      {} as Record<string, string>
    ),
  });

  // Template 2: Fill dates and numbers only
  const dateNumTemplate: Record<string, string> = {};
  fieldNames.forEach((field) => {
    const suggestion = getAutoFillSuggestion(field);
    if (suggestion.dataType === 'date' || suggestion.dataType === 'number') {
      dateNumTemplate[field] = suggestion.suggestedValue;
    } else {
      dateNumTemplate[field] = '';
    }
  });
  templates.push({
    name: 'Auto-fill Dates & Numbers',
    data: dateNumTemplate,
  });

  // Template 3: Sample data for testing
  const sampleTemplate: Record<string, string> = {};
  fieldNames.forEach((field) => {
    const lowerField = field.toLowerCase();

    if (lowerField.includes('address')) {
      sampleTemplate[field] = '123 Main Street, City, State 12345';
    } else if (lowerField.includes('property_type') || lowerField.includes('type')) {
      sampleTemplate[field] = 'Residential';
    } else if (
      lowerField.includes('area') ||
      lowerField.includes('sqft') ||
      lowerField.includes('square')
    ) {
      sampleTemplate[field] = '5,000';
    } else if (lowerField.includes('value') || lowerField.includes('amount')) {
      sampleTemplate[field] = '$250,000';
    } else if (
      lowerField.includes('surveyor') ||
      lowerField.includes('appraiser') ||
      lowerField.includes('name')
    ) {
      sampleTemplate[field] = 'John Smith';
    } else if (lowerField.includes('date')) {
      sampleTemplate[field] = new Date().toISOString().split('T')[0];
    } else if (lowerField.includes('license') || lowerField.includes('number')) {
      sampleTemplate[field] = 'LIC-2024-001';
    } else if (lowerField.includes('email')) {
      sampleTemplate[field] = 'surveyor@example.com';
    } else if (lowerField.includes('phone') || lowerField.includes('contact')) {
      sampleTemplate[field] = '+1 (555) 123-4567';
    } else if (
      lowerField.includes('description') ||
      lowerField.includes('remarks')
    ) {
      sampleTemplate[field] = 'Property is in good condition with no major issues.';
    } else {
      sampleTemplate[field] = '';
    }
  });
  templates.push({
    name: 'Sample Data (for testing)',
    data: sampleTemplate,
  });

  return templates;
}

/**
 * Get field display name from field name (for UI)
 */
export function getFieldDisplayName(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get field placeholder text based on field name
 */
export function getFieldPlaceholder(fieldName: string): string {
  const suggestion = getAutoFillSuggestion(fieldName);
  const displayName = getFieldDisplayName(fieldName);

  if (suggestion.dataType === 'date') {
    return `Enter ${displayName} (e.g., ${new Date().toISOString().split('T')[0]})`;
  } else if (suggestion.dataType === 'number') {
    return `Enter ${displayName} (e.g., 1000)`;
  } else if (suggestion.dataType === 'textarea') {
    return `Enter ${displayName}...`;
  }

  return `Enter ${displayName}`;
}
