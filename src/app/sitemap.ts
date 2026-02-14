import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://corewave-records.vercel.app';

    // Static pages
    const staticPages = [
        '',
        '/explore',
        '/artists',
        '/trending',
        '/new-releases',
        '/upload',
        '/distribution',
        '/analytics',
        '/pro',
        '/community',
        '/help',
        '/terms',
        '/privacy',
        '/login',
        '/signup',
    ];

    const staticRoutes = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // TODO: Add dynamic routes for tracks and artists
    // You can fetch these from your database
    // const tracks = await prisma.track.findMany({ where: { status: 'APPROVED' } });
    // const trackRoutes = tracks.map((track) => ({
    //   url: `${baseUrl}/tracks/${track.id}`,
    //   lastModified: track.updatedAt,
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.6,
    // }));

    return [...staticRoutes];
}
