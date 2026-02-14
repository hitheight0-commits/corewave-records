import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import PlaylistModal from "@/components/player/PlaylistModal";
import AudioEngine from "@/components/player/AudioEngine";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { ToastContainer } from "@/components/Toast";

import CommandPalette from "@/components/CommandPalette";
import CustomCursor from "@/components/common/CustomCursor";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { cookies } from "next/headers";
import I18nProvider from "@/components/providers/I18nProvider";

const SITE_NAME = 'COREWAVE RECORDS';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://corewave-records.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Next-Generation Music Distribution Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Empowering independent artists worldwide. Upload, distribute, and stream music on the next-generation platform built for artists. Discover emerging talent, AI-generated music, and exclusive releases.",
  keywords: [
    'music streaming',
    'music distribution',
    'independent artists',
    'upload music online',
    'music platform',
    'AI music',
    'music discovery',
    'artist platform',
    'music upload',
    'distribute music',
    'streaming service',
    'artist analytics',
    'music monetization',
    'emerging artists',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'Music',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Where Artists and Sound Evolve`,
    description: 'Upload. Distribute. Stream. Experience music at its core. Join the next generation of independent artists.',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Music Distribution Platform`,
      },
    ],
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@CorewaveRecords',
    creator: '@CorewaveRecords',
    title: `${SITE_NAME} | Next-Generation Music Distribution`,
    description: 'Upload. Distribute. Stream. Join the evolution of independent music.',
    images: [`${SITE_URL}/og-image.png`],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Next-generation music streaming and distribution platform empowering independent artists worldwide.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Music distribution and streaming platform for independent artists',
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <AudioEngine />
              <GlobalPlayer />
              <PlaylistModal />
              <CommandPalette />
              <CustomCursor />
              <ToastContainer />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
