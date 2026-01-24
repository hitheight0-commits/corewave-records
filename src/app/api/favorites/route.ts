import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const favorites = await prisma.favorite.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                track: {
                    include: {
                        artist: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formattedFavorites = favorites.map((fav: any) => ({
            id: fav.id,
            track: {
                id: fav.track.id,
                title: fav.track.title,
                artist: fav.track.artist.name,
                artistId: fav.track.artistId,
                coverUrl: fav.track.coverUrl,
                audioUrl: fav.track.audioUrl,
                genre: fav.track.genre,
                mood: fav.track.mood,
                duration: fav.track.duration,
            },
        }));

        return NextResponse.json({ favorites: formattedFavorites });
    } catch (error) {
        console.error("Get Favorites Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { trackId } = await req.json();

        if (!trackId) {
            return NextResponse.json({ error: "Track ID required" }, { status: 400 });
        }

        const existing = await prisma.favorite.findUnique({
            where: {
                userId_trackId: {
                    userId: session.user.id,
                    trackId,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ message: "Already favorited", favorite: existing });
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: session.user.id,
                trackId,
            },
        });

        return NextResponse.json({ favorite });
    } catch (error) {
        console.error("Add Favorite Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
