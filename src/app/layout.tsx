import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WealthPilot 財富領航 — 個人理財一條龍管理平台',
  description: '從審視個人開銷到資產淨值與投資規劃，一站式守護與增進您的個人財富',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
