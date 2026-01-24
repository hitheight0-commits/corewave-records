import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { checkAndVerifyArtist } from "@/lib/verification";

// ... (existing imports)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Access denied: Platform admin credentials required." }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify track existence prior to orchestration
        const existingTrack = await prisma.track.findUnique({ where: { id } });
        if (!existingTrack) {
            return NextResponse.json({ error: "Sonic asset not localized in the ecosystem." }, { status: 404 });
        }

        const track = await prisma.track.update({
            where: { id },
            data: { status: 'APPROVED' },
        });

        // [EXPERTISE] Trigger Verification Protocol
        // Check if this approval was the tipping point (e.g. the 10th track)
        await checkAndVerifyArtist(existingTrack.artistId);

        console.log(`[ADMIN_ORCHESTRATION] Track ${id} approved and publicized.`);
        return NextResponse.json({ success: true, track });
    } catch (error: any) {
        console.error("[ADMIN_ORCHESTRATION_ERROR] Approval failure:", error);
        return NextResponse.json({ error: `Orchestration failure: ${error.message}` }, { status: 500 });
    }
}
