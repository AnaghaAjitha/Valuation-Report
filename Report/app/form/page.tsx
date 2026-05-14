'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAutoFillSuggestion,
  getCommonTemplates,
  getFieldDisplayName,
  getFieldPlaceholder,
} from '@/lib/autoFill';

interface FormField {
  name: string;
  type?: string;
}

interface TemplateData {
  id: string;
  name: string;
  fields: FormField[];
}

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('templateId');
  const extractFileInputRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [reportName, setReportName] = useState('');
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [quickFillOptions, setQuickFillOptions] = useState<
    { name: string; data: Record<string, string> }[]
  >([]);
  const [extractingText, setExtractingText] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractedFileName, setExtractedFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');

  useEffect(() => {
    if (!templateId) {
      setError('No template selected');
      setLoading(false);
      return;
    }

    // Fetch template from database
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${templateId}/data`);
        if (!response.ok) {
          throw new Error('Template not found');
        }

        const data: TemplateData = await response.json();
        setFields(data.fields);
        setTemplateName(data.name);

        // Initialize form data with auto-fill suggestions
        const initialData: Record<string, string> = {};
        const fieldNames: string[] = [];
        data.fields.forEach((field: FormField) => {
          const suggestion = getAutoFillSuggestion(field.name);
          initialData[field.name] = suggestion.suggestedValue;
          fieldNames.push(field.name);
        });
        setFormData(initialData);

        // Generate quick-fill options
        const templates = getCommonTemplates(fieldNames);
        setQuickFillOptions(templates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load template';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const applyQuickFill = (template: { name: string; data: Record<string, string> }) => {
    setFormData(template.data);
    setShowQuickFill(false);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError('');

      if (!reportName.trim()) {
        setError('Please enter a report name');
        setExporting(false);
        return;
      }

      // Validate all fields are filled
      const emptyFields = Object.entries(formData)
        .filter(([, value]) => !value.trim())
        .map(([key]) => key);

      if (emptyFields.length > 0) {
        setError(`Please fill all fields. Missing: ${emptyFields.join(', ')}`);
        setExporting(false);
        return;
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          templateName,
          reportName: reportName.trim(),
          data: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName.trim()}_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      alert('Report generated and saved successfully!');
      setReportName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    const initialData: Record<string, string> = {};
    fields.forEach((field) => {
      const suggestion = getAutoFillSuggestion(field.name);
      initialData[field.name] = suggestion.suggestedValue;
    });
    setFormData(initialData);
  };

  const handleNewTemplate = () => {
    router.push('/');
  };

  const handleExtractFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExtractingText(true);
      setExtractError('');
      setExtractedText('');
      setExtractedFileName('');

      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract text');
      }

      setExtractedFileName(data.fileName);
      setExtractedText(data.text || 'No text was found in this document.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      setExtractError(message);
    } finally {
      setExtractingText(false);
      e.target.value = '';
    }
  };

  const handleCopyExtractedText = async () => {
    if (!extractedText) return;
    await navigator.clipboard.writeText(extractedText);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading form...</div>
      </div>
    );
  }

  if (!templateId || fields.length === 0) {
    return (
      <>
        <div className="header">
          <h1>Form Not Available</h1>
        </div>
        <div className="container">
          <div className="error">{error || 'No template data found'}</div>
          <div style={{ marginTop: '20px' }}>
            <Link href="/">
              <button>Go Home</button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <h1>Valuation Report Form</h1>
        <p>Template: {templateName}</p>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Form
        </div>

        <div className="form-workspace">
          <div className="form-section">
            {error && <div className="error">{error}</div>}

            <div style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="reportName">
                  Report Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  id="reportName"
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter a name for this report"
                  required
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  This name will be used to save and identify your report
                </small>
              </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowQuickFill(!showQuickFill)}
                title="Auto-fill common field patterns"
              >
                ⚡ Quick Fill ({quickFillOptions.length} presets)
              </button>
            </div>

            {showQuickFill && (
              <div
                style={{
                  background: '#f0f8ff',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  border: '1px solid #b3d9ff',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>Quick Fill Options:</h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {quickFillOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="secondary"
                      onClick={() => applyQuickFill(option)}
                      style={{ textAlign: 'left', padding: '8px 12px', fontSize: '13px' }}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExport();
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                }}
              >
                {fields.map((field) => {
                  const suggestion = getAutoFillSuggestion(field.name);
                  const displayName = getFieldDisplayName(field.name);
                  const placeholder = getFieldPlaceholder(field.name);

                  return (
                    <div key={field.name} className="form-group">
                      <label htmlFor={field.name}>
                        {displayName}
                        <span style={{ color: 'red' }}>*</span>
                        {suggestion.dataType === 'date' && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#666',
                              marginLeft: '8px',
                              fontWeight: 'normal',
                            }}
                          >
                            (Date)
                          </span>
                        )}
                        {suggestion.dataType === 'number' && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#666',
                              marginLeft: '8px',
                              fontWeight: 'normal',
                            }}
                          >
                            (Number)
                          </span>
                        )}
                      </label>

                      {suggestion.dataType === 'textarea' ? (
                        <textarea
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={placeholder}
                          required
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={suggestion.dataType === 'date' ? 'date' : 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={placeholder}
                          required
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="info" style={{ marginTop: '30px' }}>
                <strong>💡 Tip:</strong> Use the Quick Fill button to auto-populate
                dates, numbers, and sample data. Edit as needed for your specific report.
              </div>

              <div className="btn-group">
                <button
                  type="button"
                  className="secondary"
                  onClick={handleReset}
                  disabled={exporting}
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleNewTemplate}
                  disabled={exporting}
                >
                  Change Template
                </button>
                <button type="submit" disabled={exporting}>
                  {exporting ? 'Generating...' : '📄 Generate Report'}
                </button>
              </div>
            </form>
          </div>

          <aside className="extract-panel">
            <div className="extract-panel-header">
              <h2>Extract Text</h2>
              <p>Upload a source document and use its text while filling the form.</p>
            </div>

            {extractError && <div className="error">{extractError}</div>}

            <input
              ref={extractFileInputRef}
              type="file"
              accept=".docx,.txt,.png,.jpg,.jpeg,.webp,.bmp,image/png,image/jpeg,image/webp,image/bmp"
              onChange={handleExtractFileChange}
              disabled={extractingText}
            />

            <button
              type="button"
              className="secondary"
              onClick={() => extractFileInputRef.current?.click()}
              disabled={extractingText}
              style={{ width: '100%', marginLeft: 0 }}
            >
              {extractingText ? 'Extracting...' : 'Upload Document'}
            </button>

            {extractedFileName && (
              <p className="extract-file-name">
                <strong>Source:</strong> {extractedFileName}
              </p>
            )}

            {extractedText ? (
              <>
                <textarea
                  className="extract-textarea"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  spellCheck={false}
                />
                <div className="extract-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={handleCopyExtractedText}
                    style={{ marginLeft: 0 }}
                  >
                    Copy Text
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setExtractedText('');
                      setExtractedFileName('');
                    }}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div className="extract-empty">
                Supported files: `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="loading">Loading form...</div>
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
