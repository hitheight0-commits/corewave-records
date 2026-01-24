import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const playlist = await prisma.playlist.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, image: true } },
                tracks: {
                    include: {
                        track: {
                            include: { artist: { select: { name: true } } }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

        // Flatten tracks for frontend consumption (consistent with core API)
        const formattedTracks = playlist.tracks.map((pt: any) => ({
            id: pt.track.id,
            title: pt.track.title,
            artist: pt.track.artist.name || "Unknown Artist",
            artistId: pt.track.artistId,
            coverUrl: pt.track.coverUrl,
            audioUrl: pt.track.audioUrl,
            genre: pt.track.genre,
            mood: pt.track.mood,
            duration: pt.track.duration,
            order: pt.order
        }));

        const formattedPlaylist = {
            ...playlist,
            tracks: formattedTracks
        };

        return NextResponse.json({ playlist: formattedPlaylist });
    } catch (error) {
        console.error("[PLAYLIST_GET_ERROR]", error);
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, coverUrl, isPublic } = await request.json();

        // Verify ownership
        const existing = await prisma.playlist.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const playlist = await prisma.playlist.update({
            where: { id },
            data: { name, coverUrl, isPublic }
        });

        return NextResponse.json({ playlist });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const existing = await prisma.playlist.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.playlist.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
    }
}
