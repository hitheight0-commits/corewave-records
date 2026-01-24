import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tracks = await prisma.track.findMany({
            where: {
                artistId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ tracks });
    } catch (error) {
        console.error("Fetch User Tracks Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
