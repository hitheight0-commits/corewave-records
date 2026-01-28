import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * [EXPERTISE] Secure Storage Handshake
 * 
 * This endpoint generates signed tokens for client-side uploads.
 * By moving the actual data transmission to the browser, we bypass the 
 * 4.5MB serverless payload limit for high-fidelity audio (WAV/FLAC).
 */
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                /* clientPayload */
            ) => {
                // 1. Verify Authentication
                const session = await getServerSession(authOptions);
                if (!session) {
                    throw new Error('UNAUTHORIZED_ORCHESTRATION: Identity not verified.');
                }

                console.log(`[STORAGE_HANDSHAKE] Generating token for identity ${session.user.id} targeting path: ${pathname}`);

                // 2. Security Protocol (Allow uploads based on user role if needed)
                return {
                    allowedContentTypes: [
                        'audio/mpeg',
                        'audio/wav',
                        'audio/flac',
                        'image/jpeg',
                        'image/png',
                        'image/webp'
                    ],
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                        role: session.user.role
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called after the client successfully uploads to the blob store
                console.log(`[STORAGE_COMPLETE] Blob synchronized: ${blob.url}`);

                try {
                    const { userId } = JSON.parse(tokenPayload!);
                    // Note: In an elite system, you'd trigger database updates here.
                    // For now, we'll let the client finalize the DB entry after its upload finishes.
                } catch (error) {
                    throw new Error('PARSING_FAILURE: Failed to decode storage metadata.');
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('[STORAGE_CRITICAL] Token generation failure:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
