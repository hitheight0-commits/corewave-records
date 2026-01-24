import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const following = await prisma.follows.findMany({
            where: { followerId: session.user.id },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        bio: true,
                        _count: {
                            select: {
                                followedBy: true,
                            }
                        }
                    }
                }
            }
        });

        const artists = following.map(f => f.following);

        return NextResponse.json({ artists });
    } catch (error) {
        console.error('Fetch following error:', error);
        return NextResponse.json({ error: 'Failed to fetch followed artists' }, { status: 500 });
    }
}
