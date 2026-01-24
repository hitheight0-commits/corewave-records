import prisma from "@/lib/prisma";

/**
 * Checks if an artist meets the 3-point criteria for the Blue Badge.
 * If met, automatically updates the user record.
 * 
 * Criteria:
 * 1. Has Profile Image
 * 2. Has Bio
 * 3. Has >= 10 Approved Tracks
 */
export async function checkAndVerifyArtist(userId: string) {
    console.log(`[VERIFICATION_PROTOCOL] Initiating check for Node ${userId}...`);

    try {
        // 1. Fetch User Data & Track Count in parallel for speed
        const [user, trackCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { image: true, bio: true, isVerified: true }
            }),
            prisma.track.count({
                where: {
                    artistId: userId,
                    status: 'APPROVED'
                }
            })
        ]);

        if (!user) return { verified: false, error: "User not found" };
        if (user.isVerified) return { verified: true, alreadyVerified: true };

        // 2. Evaluate Criteria
        const hasImage = !!user.image && user.image.length > 0;
        const hasBio = !!user.bio && user.bio.length > 10; // Minimal length check for quality
        const hasTracks = trackCount >= 10;

        console.log(`[VERIFICATION_PROTOCOL] Status: Image=${hasImage}, Bio=${hasBio}, Tracks=${trackCount}/10`);

        // 3. Grant Badge if all pass
        if (hasImage && hasBio && hasTracks) {
            await prisma.user.update({
                where: { id: userId },
                data: { isVerified: true }
            });
            console.log(`[VERIFICATION_PROTOCOL] SUCCESS. Node ${userId} upgraded to Verified status.`);
            return { verified: true, newlyVerified: true };
        }

        return {
            verified: false,
            status: { hasImage, hasBio, currentTracks: trackCount, requiredTracks: 10 }
        };

    } catch (error) {
        console.error("[VERIFICATION_PROTOCOL] System Failure:", error);
        return { verified: false, error: "Internal Check Error" };
    }
}
