'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ templates: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [templatesRes, reportsRes] = await Promise.all([
          fetch('/api/templates'),
          fetch('/api/reports'),
        ]);

        let templatesCount = 0;
        let reportsCount = 0;

        if (templatesRes.ok) {
          const data = await templatesRes.json();
          templatesCount = data.templates?.length || 0;
        }

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          reportsCount = data.reports?.length || 0;
        }

        setStats({ templates: templatesCount, reports: reportsCount });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <div className="header">
        <h1>Valuation Report Automation</h1>
        <p>Streamline your property valuation process</p>
      </div>

      <div className="container">
        <div className="upload-section">
          <h2>Welcome to Your Valuation System</h2>
          <p>
            Automate your property valuation reports by creating templates once and
            reusing them multiple times. Organize your templates by bank or format,
            fill in data, and generate professional reports instantly.
          </p>

          {/* Stats Cards */}
          {!loading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '30px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #90caf9',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
                  {stats.templates}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>Saved Templates</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #ce93d8',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7b1fa2' }}>
                  {stats.reports}
                </div>
                <div style={{ color: '#666', marginTop: '5px' }}>Generated Reports</div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '40px',
            }}
          >
            <Link href="/upload" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  backgroundColor: '#f0f8ff',
                  border: '2px solid #3498db',
                  borderRadius: '8px',
                  padding: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 12px rgba(52, 152, 219, 0.3)';
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
                <h3 style={{ margin: '10px 0', color: '#3498db' }}>Manage Templates</h3>
                <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                  Upload new templates or select existing ones
                </p>
              </div>
            </Link>

            <Link href="/reports" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  backgroundColor: '#f0fff0',
                  border: '2px solid #27ae60',
                  borderRadius: '8px',
                  padding: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 12px rgba(39, 174, 96, 0.3)';
                  (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                <h3 style={{ margin: '10px 0', color: '#27ae60' }}>Generated Reports</h3>
                <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                  View, download, or manage your reports
                </p>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
            <h3>Key Features</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <div>
                <h4 style={{ color: '#3498db', marginBottom: '10px' }}>
                  ✓ Template Management
                </h4>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Create, organize, and reuse templates for different banks and formats
                </p>
              </div>
              <div>
                <h4 style={{ color: '#3498db', marginBottom: '10px' }}>
                  ✓ One-Click Generation
                </h4>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Fill data and generate professional reports in seconds
                </p>
              </div>
              <div>
                <h4 style={{ color: '#3498db', marginBottom: '10px' }}>
                  ✓ Report History
                </h4>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Access all generated reports with full history and details
                </p>
              </div>
              <div>
                <h4 style={{ color: '#3498db', marginBottom: '10px' }}>
                  ✓ Easy Backup
                </h4>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  All templates and reports are automatically saved
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div
            style={{
              marginTop: '50px',
              paddingTop: '30px',
              borderTop: '1px solid #eee',
            }}
          >
            <h3>How It Works</h3>
            <ol style={{ paddingLeft: '20px', lineHeight: '2', color: '#666' }}>
              <li>
                <strong>Create a Template</strong> - Use Word to create your valuation
                report template with placeholder fields like &#123;property_address&#125;
              </li>
              <li>
                <strong>Name and Upload</strong> - Upload the template and give it a
                descriptive name so you can reuse it later
              </li>
              <li>
                <strong>Save Templates</strong> - Once uploaded, templates are saved
                permanently and appear in your templates list
              </li>
              <li>
                <strong>Fill Data</strong> - Select a template and fill in the valuation
                data through the dynamic form
              </li>
              <li>
                <strong>Generate Report</strong> - Click generate to create a Word
                document with all your data
              </li>
              <li>
                <strong>Download & Access</strong> - Download the report and view all
                previous reports in your history
              </li>
            </ol>
          </div>

          {/* Quick Start */}
          <div
            style={{
              marginTop: '40px',
              padding: '20px',
              backgroundColor: '#fff3e0',
              borderLeft: '4px solid #ff9800',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>🚀 Quick Start</h4>
            <p style={{ margin: '0' }}>
              New user?{' '}
              <Link href="/upload">
                <strong style={{ color: '#3498db', cursor: 'pointer' }}>
                  Click here to upload your first template
                </strong>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
