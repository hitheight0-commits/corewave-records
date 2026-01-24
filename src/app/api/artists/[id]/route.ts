import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    try {
        const artist = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        tracks: true,
                        followedBy: true,
                    }
                },
                tracks: {
                    where: session?.user?.id === id ? {} : { status: 'APPROVED' },
                    orderBy: [
                        { plays: 'desc' },
                        { createdAt: 'desc' }
                    ],
                }
            }
        });

        if (!artist || artist.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
        }

        return NextResponse.json({ artist });
    } catch (error) {
        console.error('Fetch artist error:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json({ error: 'Failed to fetch artist', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
