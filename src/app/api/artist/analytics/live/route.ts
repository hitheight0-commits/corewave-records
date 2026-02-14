import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events (SSE) endpoint for real-time analytics
 * GET /api/artist/analytics/live
 * 
 * Streams real-time updates to the analytics dashboard
 */
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const artistId = session.user.id;

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection event
            controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

            // Poll for updates every 5 seconds
            const interval = setInterval(async () => {
                try {
                    // Get real-time stats
                    const now = new Date();
                    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

                    const [recentPlays, liveEvents] = await Promise.all([
                        // Recent plays in last 5 minutes
                        prisma.playEvent.count({
                            where: {
                                track: { artistId },
                                createdAt: { gte: fiveMinutesAgo }
                            }
                        }),
                        // Latest events
                        prisma.playEvent.findMany({
                            where: {
                                track: { artistId },
                                createdAt: { gte: fiveMinutesAgo }
                            },
                            include: {
                                track: {
                                    select: { title: true, coverUrl: true }
                                }
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 3
                        })
                    ]);

                    // Format latest events
                    const formattedEvents = liveEvents.map(event => ({
                        type: 'PLAY',
                        trackTitle: event.track.title,
                        geo: event.geo,
                        coverUrl: event.track.coverUrl,
                        timestamp: event.createdAt
                    }));

                    // Send update event
                    const update = {
                        type: 'update',
                        liveNow: recentPlays,
                        recentEvents: formattedEvents,
                        timestamp: new Date().toISOString()
                    };

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));

                } catch (error: any) {
                    console.error('[SSE_ERROR]', error);
                    controller.enqueue(encoder.encode(`data: {"type":"error","message":"${error.message}"}\n\n`));
                }
            }, 5000); // Update every 5 seconds

            // Clean up on client disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
