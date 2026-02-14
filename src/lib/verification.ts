import prisma from "@/lib/prisma";

/**
 * Checks if an artist meets the 5-point criteria for the Blue Badge.
 * If met, automatically updates the user record.
 * 
 * Criteria:
 * 1. Has Profile Image
 * 2. Has Bio (> 10 chars)
 * 3. Has >= 10 Approved Tracks
 * 4. Has >= 25 Followers
 * 5. Has >= 1,000 Total Plays
 */
export async function checkAndVerifyArtist(userId: string) {
    try {
        // 1. Fetch all relevant metrics in parallel
        const [user, trackCount, followerCount, tracks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { image: true, bio: true, isVerified: true }
            }),
            prisma.track.count({
                where: { artistId: userId, status: 'APPROVED' }
            }),
            prisma.follows.count({
                where: { followingId: userId }
            }),
            prisma.track.findMany({
                where: { artistId: userId },
                select: { plays: true }
            })
        ]);

        if (!user) return { verified: false, error: "User not found" };

        const totalPlays = tracks.reduce((sum, t) => sum + t.plays, 0);

        // 2. Evaluate Criteria
        const status = {
            hasImage: !!user.image && user.image.length > 0,
            hasBio: !!user.bio && user.bio.length > 10,
            approvedTracks: { current: trackCount, required: 10, pass: trackCount >= 10 },
            followers: { current: followerCount, required: 25, pass: followerCount >= 25 },
            plays: { current: totalPlays, required: 1000, pass: totalPlays >= 1000 }
        };

        const meetsAllCriteria = status.hasImage &&
            status.hasBio &&
            status.approvedTracks.pass &&
            status.followers.pass &&
            status.plays.pass;

        // 3. Update Badge Status if necessary
        if (meetsAllCriteria && !user.isVerified) {
            await prisma.user.update({
                where: { id: userId },
                data: { isVerified: true }
            });
            return { verified: true, newlyVerified: true, status };
        } else if (!meetsAllCriteria && user.isVerified) {
            // [SECURITY] Revoke badge if criteria no longer met (e.g. track deletion)
            await prisma.user.update({
                where: { id: userId },
                data: { isVerified: false }
            });
            return { verified: false, revoked: true, status };
        }

        return {
            verified: user.isVerified,
            status
        };

    } catch (error) {
        console.error("[VERIFICATION_PROTOCOL] System Failure:", error);
        return { verified: false, error: "Internal Check Error" };
    }
}
