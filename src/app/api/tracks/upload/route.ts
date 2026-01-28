import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    console.log('=== UPLOAD API DEBUG ===');
    console.log('Session:', JSON.stringify(session, null, 2));
    console.log('User role:', session?.user?.role);
    console.log('Is ARTIST?', session?.user?.role === 'ARTIST');

    if (!session) {
        console.log('ERROR: No session found');
        return NextResponse.json({ error: "Unauthorized - Not logged in" }, { status: 401 });
    }

    if (session.user.role !== 'ARTIST') {
        console.log('ERROR: User is not an ARTIST, role is:', session.user.role);
        return NextResponse.json({ error: `Unauthorized - Role is ${session.user.role}, must be ARTIST` }, { status: 401 });
    }

    console.log('Authorization passed, proceeding with upload...');

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
