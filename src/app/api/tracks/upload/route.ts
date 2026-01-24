import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";
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
        const formData = await req.formData();
        const audioFile = formData.get("audio") as File;
        const coverFile = formData.get("cover") as File;
        const title = formData.get("title") as string;
        const genre = formData.get("genre") as string;
        const mood = formData.get("mood") as string;
        const isAI = formData.get("isAI") === "true";

        if (!audioFile || !title) {
            return NextResponse.json({ error: "Audio and Title are required" }, { status: 400 });
        }

        // Process Audio
        const audioBytes = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(audioBytes);
        const audioName = `${Date.now()}-${audioFile.name.replace(/\s+/g, '-')}`;
        const audioPath = join(process.cwd(), "public", "uploads", "audio", audioName);
        await writeFile(audioPath, audioBuffer);
        const audioUrl = `/uploads/audio/${audioName}`;

        // Process Cover
        let coverUrl = "/default-cover.jpg"; // Fallback
        if (coverFile && coverFile.size > 0) {
            const coverBytes = await coverFile.arrayBuffer();
            const coverBuffer = Buffer.from(coverBytes);
            const coverName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '-')}`;
            const coverPath = join(process.cwd(), "public", "uploads", "covers", coverName);
            await writeFile(coverPath, coverBuffer);
            coverUrl = `/uploads/covers/${coverName}`;
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
