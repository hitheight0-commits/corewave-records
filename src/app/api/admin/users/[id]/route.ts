import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // [EXPERTISE] Nuclear Option
        // Deleting a user cascades to all their tracks, playlists, etc. via Prisma relation.
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "User permanently purged." });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
    }
}
