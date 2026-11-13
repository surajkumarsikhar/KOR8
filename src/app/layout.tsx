import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Inter_Tight, Newsreader } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import FilmGrain from '@/components/ui/FilmGrain';
import ViewfinderHUD from '@/components/ui/ViewfinderHUD';
import TimecodeRail from '@/components/ui/TimecodeRail';
import CursorPill from '@/components/ui/CursorPill';
import Preloader from '@/components/layout/Preloader';
import Navigation from '@/components/layout/Navigation';
import { site } from '@/content/site';

const geistSans = Geist({
  variable: '--font-body-face',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-mono-face',
  subsets: ['latin'],
  display: 'swap',
});

// Interim display face until the Monk web licence is in place
// (swap to next/font/local with the same variable name).
const display = Inter_Tight({
  variable: '--font-display-face',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const serifAccent = Newsreader({
  variable: '--font-serif-face',
  subsets: ['latin'],
  style: ['italic', 'normal'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'KOR8 — Creative Agency & Production House | Bhubaneswar',
    template: '%s | KOR8',
  },
  description:
    'KOR8 is a creative agency and production house in Bhubaneswar. We plan, shoot, design, and build brand identity, creative ads, websites, and SEO under one roof.',
  keywords: [
    'creative agency Bhubaneswar',
    'video production Bhubaneswar',
    'branding agency Odisha',
    'production house Odisha',
    'KOR8',
    'film production',
    'creative studio Bhubaneswar',
  ],
  authors: [{ name: 'KOR8' }],
  creator: 'KOR8',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: 'KOR8',
    title: 'KOR8 — Creative Agency & Production House',
    description:
      'We build brands people can’t scroll past. Creative ads, brand identity, websites and SEO in Bhubaneswar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOR8 — Creative Agency & Production House',
    description:
      'We build brands people can’t scroll past. Creative ads, brand identity, websites and SEO in Bhubaneswar.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      email: site.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bhubaneswar',
        addressRegion: 'Odisha',
        addressCountry: 'IN',
      },
      sameAs: [site.instagram],
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${site.url}/#localbusiness`,
      name: site.name,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bhubaneswar',
        addressRegion: 'Odisha',
        addressCountry: 'IN',
      },
      priceRange: '₹₹₹',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serifAccent.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-white selection:bg-[#F00001] selection:text-white">
        <SmoothScroll />
        <Preloader />
        <FilmGrain opacity={0.05} />
        <ViewfinderHUD />
        <TimecodeRail />
        <CursorPill />
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
