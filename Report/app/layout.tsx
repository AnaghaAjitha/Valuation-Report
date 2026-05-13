import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Valuation Report Automation',
  description: 'Automate property valuation reports for banks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
