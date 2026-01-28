import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * [EXPERTISE] Unified Storage Interface
 * 
 * Orchestrates file persistence across local (Development) and cloud (Production) environments.
 * Uses Vercel Blob for global scale and local filesystem for rapid prototyping.
 */
export async function uploadFile(
    file: File,
    path: string,
    filename: string
): Promise<string> {
    const isProduction = process.env.NODE_ENV === 'production';
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (isProduction && blobToken) {
        // [EXPERTISE] Production Pipeline: Global Content Delivery
        console.log(`[STORAGE_ORCHESTRATION] Uploading to global blob store: ${filename}`);
        const { url } = await put(`${path}/${filename}`, file, {
            access: 'public',
            addRandomSuffix: true,
        });
        return url;
    } else if (isProduction && !blobToken) {
        // [EXPERTISE] Fallback Protocol: Prevent Silent Failures
        throw new Error("STORAGE_MISCONFIGURATION: BLOB_READ_WRITE_TOKEN is missing in production environment.");
    } else {
        // [EXPERTISE] Development Pipeline: Local Iteration
        console.log(`[STORAGE_DEVELOPMENT] Writing to local filesystem: ${filename}`);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fullPath = join(process.cwd(), "public", path);

        // Ensure directory exists
        if (!existsSync(fullPath)) {
            await mkdir(fullPath, { recursive: true });
        }

        const filePath = join(fullPath, filename);
        await writeFile(filePath, buffer);

        return `/${path}/${filename}`;
    }
}
