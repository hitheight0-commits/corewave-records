import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: playlistId } = await params;

    try {
        const { trackId } = await request.json();
        if (!trackId) return NextResponse.json({ error: 'Track ID required' }, { status: 400 });

        console.log(`[ORCHESTRATION_SYNC] User ${session.user.id} targeting playlist ${playlistId} with track ${trackId}`);

        // Verify playlist ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            select: { userId: true }
        });

        if (!playlist) {
            console.error(`[ORCHESTRATION_ERROR] Playlist ${playlistId} not detected.`);
            return NextResponse.json({ error: 'Playlist node not found' }, { status: 404 });
        }

        if (playlist.userId !== session.user.id) {
            console.error(`[ORCHESTRATION_SECURITY] Unauthorized sync attempt on ${playlistId}`);
            return NextResponse.json({ error: 'Identity access denied' }, { status: 403 });
        }

        // Check for existing sync
        const existingSync = await prisma.playlistTrack.findUnique({
            where: {
                playlistId_trackId: {
                    playlistId: playlistId,
                    trackId
                }
            }
        });

        if (existingSync) {
            return NextResponse.json({ error: 'Identity already synchronized with this node.', success: false }, { status: 409 });
        }

        // Determine orchestration order
        const lastTrack = await prisma.playlistTrack.findFirst({
            where: { playlistId: playlistId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const order = (lastTrack?.order ?? 0) + 1;

        await prisma.playlistTrack.create({
            data: {
                playlistId: playlistId,
                trackId,
                order
            }
        });

        console.log(`[ORCHESTRATION_SUCCESS] Track ${trackId} synchronized with node ${playlistId}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[ORCHESTRATION_CRITICAL] Internal failure:", error);
        return NextResponse.json({ error: `Synchronization error: ${error.message || 'Unknown protocol violation'}` }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: playlistId } = await params;

    try {
        const { trackId } = await request.json();

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            select: { userId: true }
        });

        if (!playlist || playlist.userId !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await prisma.playlistTrack.delete({
            where: {
                playlistId_trackId: {
                    playlistId: playlistId,
                    trackId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Orchestration purge failure' }, { status: 500 });
    }
}
