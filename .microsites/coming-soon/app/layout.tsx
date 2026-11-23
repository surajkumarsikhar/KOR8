import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Geist_Mono } from 'next/font/google';
import './globals.css';

const display = Inter_Tight({ subsets: ['latin'], weight: ['400', '500', '900'], variable: '--font-display', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], weight: '400', variable: '--font-mono', display: 'swap' });
const title = 'KOR8 | Film Production & Creative Studio';
const description = 'KOR8 is an independent creative production studio working across film, photography, brand campaigns and creative direction. Explore our work and get in touch.';
export const metadata: Metadata = {
  metadataBase: new URL('https://kor8.in'),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, type: 'website', url: '/', siteName: 'KOR8', locale: 'en_US', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'KOR8. Independent creative production. The next frame is infinite.' }] },
  twitter: { card: 'summary_large_image', title, description, images: [{ url: '/og-image.png', alt: 'KOR8. The next frame is infinite.' }] },
  icons: { icon: [{ url: '/images/brand-symbol.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: '#050505', colorScheme: 'dark' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${display.variable} ${mono.variable}`}><body>{children}</body></html>;
}
