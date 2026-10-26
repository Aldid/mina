import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mina — AI Skin Diagnostics & Skincare Protocol',
  description: 'Instant facial skin analysis and dermatological skincare protocol inspired by Asian beauty-tech kiosks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-rose-100 selection:text-rose-900">
        {children}
      </body>
    </html>
  );
}
