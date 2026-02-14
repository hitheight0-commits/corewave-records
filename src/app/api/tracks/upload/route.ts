import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Check authentication

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'ARTIST') {
        // User is not an artist
        return NextResponse.json({ error: `Unauthorized - Role is ${session.user.role}, must be ARTIST` }, { status: 401 });
    }

    // Authorization passed

    try {
        const { audioUrl, coverUrl, title, genre, mood, isAI } = await req.json();

        if (!audioUrl || !title) {
            return NextResponse.json({ error: "Remote Audio URL and Title are required" }, { status: 400 });
        }

        // Save to Database
        const track = await prisma.track.create({
            data: {
                title,
                genre,
                mood,
                isAI,
                audioUrl,
                coverUrl,
                artistId: session.user.id,
                duration: 0, // In a real app, you'd extract this from the audio file
            },
        });

        return NextResponse.json({ track });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
