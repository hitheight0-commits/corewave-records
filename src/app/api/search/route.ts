import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { helpArticles } from '@/app/help/articles';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ artists: [], tracks: [], articles: [] });
    }

    try {
        const [artists, tracks] = await Promise.all([
            prisma.user.findMany({
                where: {
                    role: 'ARTIST',
                    name: { contains: query }
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
                take: 5
            }),
            prisma.track.findMany({
                where: {
                    status: 'APPROVED',
                    OR: [
                        { title: { contains: query } },
                        { genre: { contains: query } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                    artist: { select: { name: true } },
                    audioUrl: true,
                },
                take: 5
            })
        ]);

        // Search local help articles
        const articles = Object.entries(helpArticles)
            .filter(([slug, art]: [string, any]) =>
                art.title.toLowerCase().includes(query.toLowerCase()) ||
                art.content.toLowerCase().includes(query.toLowerCase())
            )
            .map(([slug, art]: [string, any]) => ({
                id: slug,
                title: art.title,
                type: 'article'
            }))
            .slice(0, 3);

        const formattedTracks = tracks.map(t => ({
            ...t,
            artist: t.artist.name
        }));

        return NextResponse.json({ artists, tracks: formattedTracks, articles });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
