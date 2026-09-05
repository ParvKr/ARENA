import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Syne } from 'next/font/google';

import { NavBar } from '@/components/NavBar';
import ToastSystem from '@/components/ToastSystem';
import { AuthProvider } from '@/components/AuthProvider';
import '@/app/globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: "Arena - Prove What You're Made Of",
  description: 'Biweekly skill competitions. Real prizes. Real careers.',
  openGraph: {
    title: 'Arena',
    description: 'Competitive Skills. Real Stakes. Real Careers.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FF2D55',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${syne.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-arena-bg text-arena-offwhite font-body antialiased">
        <AuthProvider>
          <Suspense fallback={<div className="h-14" />}>
            <NavBar />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <ToastSystem />
        </AuthProvider>
      </body>
    </html>
  );
}
