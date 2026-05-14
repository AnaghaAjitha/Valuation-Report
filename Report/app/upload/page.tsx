'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssetTemplate {
  id: string;
  name: string;
  fileName: string;
  fieldCount: number;
  createdAt: string;
}

export default function UploadPage() {
  const [templates, setTemplates] = useState<AssetTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to load templates');
        }

        const data = await response.json();
        setTemplates(data.templates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load templates';
        setError(message);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const handleSelectTemplate = (id: string) => {
    router.push(`/form?templateId=${id}`);
  };

  return (
    <>
      <div className="header">
        <h1>Select Template</h1>
        <p>Choose a Word template from the assets folder</p>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Select Template
        </div>

        <div className="upload-section">
          {error && <div className="error">{error}</div>}

          <div style={{ marginBottom: '30px' }}>
            <h2>Available Templates</h2>
            <p style={{ color: '#666', marginTop: '8px' }}>
              Add `.docx` files with placeholders like $property_address$ to
              `assets/templates`, then restart or refresh the app.
            </p>
          </div>

          {loadingTemplates ? (
            <div className="loading">Loading templates...</div>
          ) : templates.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px',
              }}
            >
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    {template.name}
                  </h3>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Fields:</strong> {template.fieldCount}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                    <strong>File:</strong> {template.fileName}
                  </p>
                  <p style={{ margin: '5px 0 15px 0', fontSize: '11px', color: '#999' }}>
                    Updated {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    style={{
                      width: '100%',
                      backgroundColor: '#3498db',
                      padding: '8px 12px',
                      fontSize: '13px',
                    }}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <p style={{ color: '#999', fontSize: '16px', marginBottom: '12px' }}>
                No asset templates found.
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Put your `.docx` template files in `assets/templates`.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
