import { NextResponse } from "next/server";
import { join } from "path";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "Image file required" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP" }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum 5MB" }, { status: 400 });
        }

        // Process image using Unified Storage Interface
        const imageName = `${Date.now()}-${session.user.id}.${imageFile.type.split('/')[1]}`;
        const imageUrl = await uploadFile(imageFile, "uploads/avatars", imageName);

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                image: imageUrl,
            },
        });

        return NextResponse.json({ imageUrl: updatedUser.image });
    } catch (error) {
        console.error("Image Upload Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
