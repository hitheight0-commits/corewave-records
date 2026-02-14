import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Exports analytics data as CSV
 * GET /api/artist/analytics/export
 */
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const artistId = session.user.id;

    try {
        // Get all play events for the artist
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const events = await prisma.playEvent.findMany({
            where: {
                track: { artistId },
                createdAt: { gte: thirtyDaysAgo }
            },
            include: {
                track: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Create CSV content
        const headers = ['Date', 'Time', 'Track', 'Country', 'Position (seconds)'];
        const rows = events.map(event => [
            new Date(event.createdAt).toLocaleDateString(),
            new Date(event.createdAt).toLocaleTimeString(),
            event.track.title,
            event.geo || 'Unknown',
            Math.floor(event.position).toString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error: any) {
        console.error('[ANALYTICS_EXPORT_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to export analytics' },
            { status: 500 }
        );
    }
}
