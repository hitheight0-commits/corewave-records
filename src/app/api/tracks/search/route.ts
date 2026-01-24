import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ tracks: [] });
    }

    try {
        const tracks = await prisma.track.findMany({
            where: {
                title: {
                    contains: query,
                },
                status: 'APPROVED',
            },
            include: {
                artist: {
                    select: {
                        name: true,
                    }
                }
            },
            take: 10,
        });

        // Map to normalized Track type
        const normalizedTracks = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist.name,
            artistId: t.artistId,
            audioUrl: t.audioUrl,
            coverUrl: t.coverUrl,
            duration: t.duration,
        }));

        return NextResponse.json({ tracks: normalizedTracks });
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
