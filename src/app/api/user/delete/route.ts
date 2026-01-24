import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Cascade delete is handled by Prisma schema if specified, 
        // but we'll be thorough here for safety if needed.
        // The schema shows some relations already have onDelete: Cascade.

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
