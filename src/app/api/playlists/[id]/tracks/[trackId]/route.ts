import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; trackId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: playlistId, trackId } = await params;

    try {
        // Verify ownership of the playlist
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            select: { userId: true }
        });

        if (!playlist || playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Identity access denied" }, { status: 403 });
        }

        // Remove track from playlist using composite key
        await prisma.playlistTrack.delete({
            where: {
                playlistId_trackId: {
                    playlistId,
                    trackId
                }
            }
        });

        console.log(`[PLAYLIST_TRACK_SYNC] Track ${trackId} removed from node ${playlistId}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[PLAYLIST_TRACK_CRITICAL] Internal failure:", error);
        return NextResponse.json({ error: `Synchronization error: ${error.message}` }, { status: 500 });
    }
}
