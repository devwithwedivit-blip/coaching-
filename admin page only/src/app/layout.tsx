import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Antigravity — CBT Administration Portal | Sarvottam Institutes',
  description: 'Enterprise Administrative Portal for Antigravity CBT Online Examination platform. Secure two-step server authentication and live proctoring telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
