import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { checkAndVerifyArtist } from '@/lib/verification';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ following: false });
    }

    try {
        const { id } = await params;
        const follow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: id,
                }
            }
        });

        return NextResponse.json({ following: !!follow });
    } catch (error) {
        return NextResponse.json({ following: false });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.follows.create({
            data: {
                followerId: session.user.id,
                followingId: id,
            }
        });

        // [EXPERTISE] Trigger Verification Protocol for the artist being followed
        checkAndVerifyArtist(id).catch(err => console.error("Follow-triggered verification failed", err));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Follow error:', error);
        return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: id,
                }
            }
        });

        // [EXPERTISE] Re-evaluate verification status (may have dropped below threshold)
        checkAndVerifyArtist(id).catch(err => console.error("Unfollow-triggered verification failed", err));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unfollow error:', error);
        return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
    }
}
