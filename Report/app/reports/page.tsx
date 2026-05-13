'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  templateName: string;
  fileName: string;
  createdAt: string;
  templateId: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(
          data.reports.sort(
            (a: Report, b: Report) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } else {
        setError('Failed to load reports');
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_${reportId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download report');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error downloading report';
      setError(message);
    }
  };

  const handleDelete = async (reportId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== reportId));
        setSuccess(`Report "${fileName}" deleted successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete report');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting report';
      setError(message);
    }
  };

  return (
    <>
      <div className="header">
        <h1>Generated Reports</h1>
        <p>View and manage your valuation reports</p>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Generated Reports
        </div>

        <div className="upload-section">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <Link href="/upload">
              <button>New Report</button>
            </Link>
            {reports.length > 0 && (
              <button
                onClick={loadReports}
                className="secondary"
                style={{ marginLeft: 'auto' }}
              >
                Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#666' }}>
                  <strong>Total Reports: {reports.length}</strong>
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '30px',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                        Report Name
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                        Template
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                        Created
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        style={{ borderBottom: '1px solid #eee' }}
                      >
                        <td style={{ padding: '12px', color: '#333' }}>
                          {report.fileName}
                        </td>
                        <td style={{ padding: '12px', color: '#666' }}>
                          {report.templateName}
                        </td>
                        <td style={{ padding: '12px', color: '#999', fontSize: '14px' }}>
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={() =>
                              handleDownload(report.id, report.fileName)
                            }
                            style={{
                              backgroundColor: '#27ae60',
                              padding: '6px 12px',
                              fontSize: '12px',
                            }}
                          >
                            Download
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(report.id, report.fileName)
                            }
                            className="danger"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <p style={{ color: '#999', fontSize: '16px', marginBottom: '20px' }}>
                No reports generated yet
              </p>
              <Link href="/upload">
                <button>Create Your First Report</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
