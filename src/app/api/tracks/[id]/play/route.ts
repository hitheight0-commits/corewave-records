import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            }
        });

        return NextResponse.json({ success: true, plays: track.plays });
    } catch (error) {
        console.error("Increment play error:", error);
        return NextResponse.json({ error: "Failed to increment play count" }, { status: 500 });
    }
}
