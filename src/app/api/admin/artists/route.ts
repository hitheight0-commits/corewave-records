import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    try {
        const artists = await prisma.user.findMany({
            where: { role: 'ARTIST' },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        tracks: true,
                        followedBy: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ artists });
    } catch (error) {
        console.error("Fetch artists error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
