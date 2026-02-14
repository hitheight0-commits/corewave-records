import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndVerifyArtist } from "@/lib/verification";

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // [EXPERTISE] Extracting requester IP for anonymous tracking
        const xForwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = xForwardedFor ? xForwardedFor.split(',')[0] : '127.0.0.1';

        // 1. AUTHENTICATED USER PATH
        if (session?.user?.id) {
            const userId = session.user.id;

            const existingPlay = await prisma.trackPlay.findUnique({
                where: {
                    userId_trackId: {
                        userId,
                        trackId: id
                    }
                }
            });

            if (existingPlay) {
                const track = await prisma.track.findUnique({
                    where: { id },
                    select: { plays: true }
                });
                return NextResponse.json({ success: false, plays: track?.plays || 0, message: "Already counted for profile" });
            }

            // Record unique play for profile
            await prisma.trackPlay.create({
                data: {
                    userId,
                    trackId: id
                }
            });
        }
        // 2. ANONYMOUS USER PATH
        else {
            const existingAnonPlay = await prisma.anonymousTrackPlay.findUnique({
                where: {
                    ipAddress_trackId: {
                        ipAddress,
                        trackId: id
                    }
                }
            });

            if (existingAnonPlay) {
                const track = await prisma.track.findUnique({
                    where: { id },
                    select: { plays: true }
                });
                return NextResponse.json({ success: false, plays: track?.plays || 0, message: "Already counted for IP" });
            }

            // Record unique play for IP
            await prisma.anonymousTrackPlay.create({
                data: {
                    ipAddress,
                    trackId: id
                }
            });
        }

        // [EXPERTISE] Final Orchestration: Incrementing the Global Counter
        const track = await prisma.track.update({
            where: { id },
            data: {
                plays: {
                    increment: 1
                }
            },
            select: { id: true, artistId: true, plays: true }
        });

        // [ANALYTICS] Capture detailed play event for artist dashboard
        // Fire-and-forget to not block response
        const geo = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
        prisma.playEvent.create({
            data: {
                trackId: id,
                userId: session?.user?.id || null,
                geo,
                position: 0, // Start of track
            }
        }).catch((err) => console.error('[PLAY_EVENT_ERROR]', err));

        // [EXPERTISE] Trigger Verification Protocol based on play count tipping points
        // We trigger this asynchronously for performance.
        checkAndVerifyArtist(track.artistId).catch((err: any) => console.error("Play-triggered verification failed", err));

        return NextResponse.json({ success: true, plays: track.plays });
    } catch (error: any) {
        console.error("Increment play error:", error);
        return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
    }
}
