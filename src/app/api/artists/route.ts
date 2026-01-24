import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const artists = await prisma.user.findMany({
            where: { role: 'ARTIST' },
            select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                isVerified: true,
                _count: {
                    select: {
                        followedBy: true,
                    }
                }
            }
        });

        return NextResponse.json({ artists });
    } catch (error) {
        console.error('Fetch artists error:', error);
        return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
    }
}
