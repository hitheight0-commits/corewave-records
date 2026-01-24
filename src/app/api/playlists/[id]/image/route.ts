import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: playlistId } = await params;

    try {
        const formData = await req.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "Image file required" }, { status: 400 });
        }

        // Verify ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            select: { userId: true }
        });

        if (!playlist || playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Identity access denied" }, { status: 403 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP" }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum 5MB" }, { status: 400 });
        }

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "playlists");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        // Process image
        const imageBytes = await imageFile.arrayBuffer();
        const imageBuffer = Buffer.from(imageBytes);
        const imageName = `${Date.now()}-${playlistId}.${imageFile.type.split('/')[1]}`;
        const imagePath = join(uploadDir, imageName);
        await writeFile(imagePath, imageBuffer);
        const imageUrl = `/uploads/playlists/${imageName}`;

        // Update playlist in database
        const updatedPlaylist = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                coverUrl: imageUrl,
            },
        });

        console.log(`[PLAYLIST_IMAGE_SYNC] Node ${playlistId} updated with new visual identity: ${imageUrl}`);
        return NextResponse.json({ imageUrl: updatedPlaylist.coverUrl });
    } catch (error: any) {
        console.error("[PLAYLIST_IMAGE_CRITICAL] Internal failure:", error);
        return NextResponse.json({ error: `Synchronization error: ${error.message}` }, { status: 500 });
    }
}
