import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tracks = await prisma.track.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                artist: true, // Changed from { select: { name: true, email: true } } to true
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // Format for admin dashboard
        const formattedTracks = tracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist.name || "Unknown Artist",
            artistEmail: track.artist.email,
            coverUrl: track.coverUrl,
            audioUrl: track.audioUrl,
            genre: track.genre,
            mood: track.mood,
            submittedAt: track.createdAt,
        }));

        return NextResponse.json({ tracks: formattedTracks });
    } catch (error) {
        console.error("Admin Fetch Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
