import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Event Ingestion API for Analytics
 * POST /api/events/track-play
 * 
 * Captures high-granularity play events for analytics dashboard
 * Non-blocking design - returns 202 Accepted immediately
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { trackId, position, context } = await request.json();

        // Validate required fields
        if (!trackId) {
            return NextResponse.json(
                { error: 'trackId is required' },
                { status: 400 }
            );
        }

        // Extract geographic data from request headers
        const xForwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = xForwardedFor ? xForwardedFor.split(',')[0] : '127.0.0.1';

        // Simple geo extraction (country code from Vercel header if available)
        const geo = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';

        // Create play event asynchronously (fire-and-forget for performance)
        // We don't await this to ensure fast response time
        prisma.playEvent.create({
            data: {
                trackId,
                userId: session?.user?.id || null,
                geo,
                position: position || 0,
            }
        }).catch((err) => {
            console.error('[EVENT_INGESTION_ERROR]', err);
        });

        // Return immediately with 202 Accepted
        return NextResponse.json(
            { success: true, message: 'Event captured' },
            { status: 202 }
        );

    } catch (error: any) {
        console.error('[EVENT_API_ERROR]', error);
        // Even on error, return 202 to not block playback
        return NextResponse.json(
            { success: true, message: 'Event queued' },
            { status: 202 }
        );
    }
}
