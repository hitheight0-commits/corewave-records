import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                _count: {
                    select: { followedBy: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

import { checkAndVerifyArtist } from "@/lib/verification";

// ... (existing imports)

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, bio } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: name || session.user.name,
                bio: bio !== undefined ? bio : undefined,
            },
        });

        // [EXPERTISE] Trigger Verification Protocol (Async)
        // We do not await this to keep the UI snappy. The badge will appear on next refresh/visit.
        if (session.user.role === 'ARTIST' && !updatedUser.isVerified) {
            checkAndVerifyArtist(updatedUser.id).catch(err => console.error("Verification trigger failed", err));
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
