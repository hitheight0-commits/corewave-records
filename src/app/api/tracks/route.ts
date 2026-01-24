import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        if (mode === 'trending') {
            // [EXPERTISE] Universal Calendar Synchronization
            // Calculate exact 7-day window from current server time (UTC)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // 1. Aggregation: Get top played trackIDs in the last week
            const trendingPlays = await prisma.trackPlay.groupBy({
                by: ['trackId'],
                where: {
                    createdAt: {
                        gte: sevenDaysAgo
                    }
                },
                _count: {
                    trackId: true
                },
                orderBy: {
                    _count: {
                        trackId: 'desc'
                    }
                },
                take: 20 // Top 20 trending
            });

            // 2. Fetch full track details for these IDs
            const trackIds = trendingPlays.map(p => p.trackId);
            const tracks = await prisma.track.findMany({
                where: {
                    id: { in: trackIds },
                    status: 'APPROVED'
                },
                include: {
                    artist: { select: { name: true } }
                }
            });

            // 3. Sort tracks to match the aggregation order (Prisma 'in' does not guarantee order)
            const sortedTracks = trackIds
                .map(id => tracks.find(t => t.id === id))
                .filter(Boolean) as any[]; // Filter out nulls if any

            // 4. Fallback: If not enough recent data, fill with global hits to keep UI alive
            if (sortedTracks.length < 5) {
                const globalHits = await prisma.track.findMany({
                    where: {
                        status: 'APPROVED',
                        id: { notIn: trackIds }
                    },
                    orderBy: { plays: 'desc' },
                    take: 10 - sortedTracks.length,
                    include: { artist: { select: { name: true } } }
                });
                sortedTracks.push(...globalHits);
            }

            return formatResponse(sortedTracks);
        }

        // Default: Chronological feed
        const tracks = await prisma.track.findMany({
            where: {
                status: 'APPROVED',
            },
            include: {
                artist: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return formatResponse(tracks);

    } catch (error) {
        console.error("Fetch tracks error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function formatResponse(tracks: any[]) {
    const formattedTracks = tracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name || "Unknown Artist",
        artistId: track.artistId,
        coverUrl: track.coverUrl,
        audioUrl: track.audioUrl,
        genre: track.genre,
        mood: track.mood,
        duration: track.duration,
        plays: track.plays
    }));
    return NextResponse.json({ tracks: formattedTracks });
}
