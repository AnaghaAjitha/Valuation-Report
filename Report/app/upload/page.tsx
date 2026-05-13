'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavedTemplate {
  id: string;
  name: string;
  fileName: string;
  fieldCount: number;
  createdAt: string;
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load saved templates
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setSavedTemplates(data.templates);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (
      !file.name.endsWith('.docx') &&
      !file.name.endsWith('.doc') &&
      !file.name.endsWith('.docm')
    ) {
      setError('Please upload a Word document (.docx, .doc, or .docm)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check if template name is provided
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('templateName', templateName.trim());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }

      const data = await response.json();
      setSuccess(`Template "${data.templateName}" uploaded successfully! ${data.fieldCount} fields found.`);
      setTemplateName('');
      
      // Reload templates
      const templatesResponse = await fetch('/api/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setSavedTemplates(templatesData.templates);
      }

      // Redirect to form page after 2 seconds
      setTimeout(() => {
        router.push(`/form?templateId=${data.templateId}`);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (id: string) => {
    router.push(`/form?templateId=${id}`);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedTemplates(savedTemplates.filter((t) => t.id !== id));
        setSuccess(`Template "${name}" deleted successfully`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete template');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    }
  };

  return (
    <>
      <div className="header">
        <h1>Manage Templates</h1>
        <p>Upload new templates or use existing ones</p>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Manage Templates
        </div>

        <div className="upload-section">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {/* Saved Templates Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2>Saved Templates</h2>
            {loadingTemplates ? (
              <div className="loading">Loading templates...</div>
            ) : savedTemplates.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '15px',
                  marginTop: '20px',
                }}
              >
                {savedTemplates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f9f9f9',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.15)';
                      (e.currentTarget as HTMLElement).style.transform =
                        'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform =
                        'translateY(0)';
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                      {template.name}
                    </h3>
                    <p
                      style={{
                        margin: '5px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong>Fields:</strong> {template.fieldCount}
                    </p>
                    <p
                      style={{
                        margin: '5px 0',
                        fontSize: '12px',
                        color: '#999',
                      }}
                    >
                      <strong>File:</strong> {template.fileName}
                    </p>
                    <p
                      style={{
                        margin: '5px 0 15px 0',
                        fontSize: '11px',
                        color: '#999',
                      }}
                    >
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleSelectTemplate(template.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#3498db',
                          padding: '8px 12px',
                          fontSize: '13px',
                        }}
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteTemplate(template.id, template.name)
                        }
                        className="danger"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '13px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', marginTop: '20px' }}>
                No templates saved yet. Upload your first template below.
              </p>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: '2px solid #eee',
              margin: '40px 0',
              paddingTop: '40px',
            }}
          >
            <h2>Upload New Template</h2>
          </div>

          {/* Upload Form */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="templateName">Template Name *</label>
            <input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Bank ABC Valuation Template"
              disabled={loading}
            />
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '5px',
              }}
            >
              Give your template a descriptive name so you can find it easily later.
            </p>
          </div>

          <div className="upload-box" onClick={handleFileClick}>
            <div className="icon">📄</div>
            <p>
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>
              Word files (.docx, .doc, .docm) up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.docm"
              onChange={handleFileChange}
              disabled={loading || !templateName.trim()}
            />
          </div>

          {loading && (
            <div className="loading">
              Processing your template...
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3>Instructions:</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>
                Use curly braces to mark placeholder fields: &#123;field_name&#125;
              </li>
              <li>
                Example: &#123;property_address&#125;, &#123;valuation_amount&#125;,
                &#123;surveyor_name&#125;
              </li>
              <li>Field names should be descriptive and unique</li>
              <li>
                You can use the same field multiple times in the document
              </li>
              <li>
                Save your template in Word format before uploading
              </li>
              <li>
                <strong>Template names</strong> help you organize and find templates later
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
