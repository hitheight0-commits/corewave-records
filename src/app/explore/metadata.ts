import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
    title: 'Explore Music - Discover New Artists',
    description: 'Explore the latest tracks from independent artists worldwide. Discover new music across genres like Electronic, Hip Hop, Lo-Fi, Ambient, and more. Stream high-quality music from emerging talent.',
    keywords: [
        'discover music',
        'new music',
        'explore tracks',
        'electronic music',
        'hip hop',
        'lo-fi music',
        'ambient music',
        'indie artists',
        'music genres',
    ],
    url: '/explore',
    type: 'website',
});

// ... rest of the explore page component
