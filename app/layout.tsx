import './globals.css';
import type { Metadata } from 'next';
import { ClientProviders } from './providers';

export const metadata: Metadata = {
  title: 'Sahha EAP Dashboard Demo',
  description: 'Employee Assistance Program Dashboard showcasing Sahha behavioral intelligence for organizational wellbeing',
  keywords: 'sahha, eap, employee assistance, wellbeing, behavioral intelligence, organizational health',
  authors: [{ name: 'Sahha Development Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0066CC',
  openGraph: {
    title: 'Sahha EAP Dashboard Demo',
    description: 'Transforming organizational wellbeing through behavioral intelligence',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}