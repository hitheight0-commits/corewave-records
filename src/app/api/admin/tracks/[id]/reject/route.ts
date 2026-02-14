import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Access denied: Platform admin credentials required." }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify track existence prior to removal
        const existingTrack = await prisma.track.findUnique({ where: { id } });
        if (!existingTrack) {
            return NextResponse.json({ error: "Sonic asset not localized in the ecosystem." }, { status: 404 });
        }

        await prisma.track.delete({
            where: { id },
        });

        // Track rejected
        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Track approved:", error);
        return NextResponse.json({ error: `Orchestration failure: ${error.message}` }, { status: 500 });
    }
}
