import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Artist Analytics API
 * GET /api/artist/analytics
 * 
 * Returns comprehensive analytics for the authenticated artist
 * Calculates stats from PlayEvent data and Track metadata
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const artistId = session.user.id;

        // Calculate time ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Parallel data fetching
        const [
            totalStreams,
            recentEvents,
            allTracks,
            followerCount,
            topCountries,
            last30DaysEvents,
            last7DaysEvents
        ] = await Promise.all([
            // Total streams from PlayEvent table
            prisma.playEvent.count({
                where: {
                    track: { artistId }
                }
            }),

            // Recent 100 play events for activity feed
            prisma.playEvent.findMany({
                where: {
                    track: { artistId }
                },
                include: {
                    track: {
                        select: { title: true, coverUrl: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            }),

            // All artist tracks for aggregation
            prisma.track.findMany({
                where: { artistId },
                select: { id: true, title: true, plays: true, coverUrl: true }
            }),

            // Follower count
            prisma.follows.count({
                where: { followingId: artistId }
            }),

            // Top countries (grouped from PlayEvent.geo)
            prisma.playEvent.groupBy({
                by: ['geo'],
                where: {
                    track: { artistId },
                    createdAt: { gte: thirtyDaysAgo }
                },
                _count: { geo: true },
                orderBy: { _count: { geo: 'desc' } },
                take: 10
            }),

            // Last 30 days play events
            prisma.playEvent.count({
                where: {
                    track: { artistId },
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),

            // Last 7 days play events
            prisma.playEvent.count({
                where: {
                    track: { artistId },
                    createdAt: { gte: sevenDaysAgo }
                }
            })
        ]);

        // Calculate growth percentage
        const previousPeriodStreams = Math.max(1, totalStreams - last30DaysEvents);
        const growthPercentage = ((last30DaysEvents / previousPeriodStreams) * 100).toFixed(1);

        // Top 5 tracks by plays
        const topTracks = allTracks
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5)
            .map(track => ({
                id: track.id,
                title: track.title,
                plays: track.plays,
                coverUrl: track.coverUrl
            }));

        // Format country demographics
        const demographics = topCountries.map(item => ({
            country: item.geo || 'Unknown',
            count: item._count.geo,
            percentage: ((item._count.geo / last30DaysEvents) * 100).toFixed(1)
        }));

        // Generate trend data (last 30 days, by day)
        const trendData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

            const count = await prisma.playEvent.count({
                where: {
                    track: { artistId },
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            trendData.push({
                date: date.toISOString().split('T')[0],
                plays: count
            });
        }

        // Format stats for dashboard
        const stats = [
            {
                label: 'Total Streams',
                value: totalStreams >= 1000 ? `${(totalStreams / 1000).toFixed(1)}k` : totalStreams.toString(),
                growth: `+${growthPercentage}%`,
                rawValue: totalStreams
            },
            {
                label: 'Monthly Listeners',
                value: last30DaysEvents >= 1000 ? `${(last30DaysEvents / 1000).toFixed(1)}k` : last30DaysEvents.toString(),
                growth: last7DaysEvents > 0 ? `+${((last7DaysEvents / last30DaysEvents) * 100).toFixed(0)}%` : '0%',
                rawValue: last30DaysEvents
            },
            {
                label: 'Followers',
                value: followerCount.toString(),
                growth: '+0%', // TODO: Calculate follower growth
                rawValue: followerCount
            },
            {
                label: 'Tracks',
                value: allTracks.length.toString(),
                growth: '',
                rawValue: allTracks.length
            }
        ];

        // Recent activity (last 20 events formatted)
        const recentActivity = recentEvents.slice(0, 20).map(event => ({
            type: 'PLAY',
            trackTitle: event.track.title,
            geo: event.geo,
            timestamp: event.createdAt,
            coverUrl: event.track.coverUrl
        }));

        return NextResponse.json({
            stats,
            trends: trendData,
            demographics,
            topTracks,
            recentActivity,
            liveNow: 0 // Placeholder for real-time listeners (would need SSE)
        });

    } catch (error: any) {
        console.error('[ANALYTICS_API_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
