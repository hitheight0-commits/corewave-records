import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ trackId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { trackId } = await params;

        await prisma.favorite.deleteMany({
            where: {
                userId: session.user.id,
                trackId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove Favorite Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
