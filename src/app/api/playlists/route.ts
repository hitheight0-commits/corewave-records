import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: session.user.id },
            include: {
                _count: { select: { tracks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ playlists });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, coverUrl, isPublic } = await request.json();
        const playlist = await prisma.playlist.create({
            data: {
                name,
                coverUrl,
                isPublic: isPublic ?? true,
                userId: session.user.id
            }
        });
        return NextResponse.json({ playlist });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
