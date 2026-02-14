import { Metadata } from 'next';

interface SEOConfig {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'music.song' | 'music.album' | 'music.playlist' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

const SITE_NAME = 'COREWAVE RECORDS';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://corewave-records.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        keywords = [],
        image = DEFAULT_IMAGE,
        url,
        type = 'website',
        author,
        publishedTime,
        modifiedTime,
    } = config;

    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

    const metadata: Metadata = {
        title: fullTitle,
        description,
        keywords: [
            'music streaming',
            'music distribution',
            'independent artists',
            'upload music',
            'music platform',
            'AI music',
            'music discovery',
            'artist platform',
            ...keywords,
        ],
        authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
        creator: SITE_NAME,
        publisher: SITE_NAME,
        applicationName: SITE_NAME,

        // Robots
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

        // Open Graph
        openGraph: {
            type,
            siteName: SITE_NAME,
            title: fullTitle,
            description,
            url: canonicalUrl,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            site: '@CorewaveRecords',
            creator: '@CorewaveRecords',
            title: fullTitle,
            description,
            images: [image],
        },

        // Alternate URLs
        alternates: {
            canonical: canonicalUrl,
        },

        // Icons
        icons: {
            icon: '/favicon.ico',
            apple: '/apple-touch-icon.png',
        },

        // Verification (add your codes)
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
            // yandex: 'your-yandex-verification-code',
            // bing: 'your-bing-verification-code',
        },

        // Other metadata
        metadataBase: new URL(SITE_URL),
        category: 'Music',
    };

    return metadata;
}

// JSON-LD Structured Data Generators
export function generateWebsiteSchema() {
    return {
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
}

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'Music distribution and streaming platform for independent artists',
        sameAs: [
            // Add your social media URLs
            'https://twitter.com/CorewaveRecords',
            'https://instagram.com/CorewaveRecords',
            'https://facebook.com/CorewaveRecords',
        ],
    };
}

export function generateMusicRecordingSchema(track: {
    id: string;
    title: string;
    artist: string;
    genre?: string;
    duration?: number;
    coverUrl?: string;
    audioUrl?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: track.title,
        url: `${SITE_URL}/tracks/${track.id}`,
        ...(track.coverUrl && { image: track.coverUrl }),
        ...(track.audioUrl && { audio: track.audioUrl }),
        byArtist: {
            '@type': 'MusicGroup',
            name: track.artist,
        },
        ...(track.genre && { genre: track.genre }),
        ...(track.duration && { duration: `PT${track.duration}S` }),
        inAlbum: {
            '@type': 'MusicAlbum',
            name: 'Singles',
        },
    };
}

export function generatePersonSchema(artist: {
    id: string;
    name: string;
    bio?: string;
    image?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: artist.name,
        url: `${SITE_URL}/artists/${artist.id}`,
        ...(artist.image && { image: artist.image }),
        ...(artist.bio && { description: artist.bio }),
        jobTitle: 'Musician',
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
        })),
    };
}
