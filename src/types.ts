export interface Track {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    coverUrl: string;
    audioUrl: string;
    duration: number;
    plays: number;
    genre?: string | null;
    mood?: string | null;
    status?: string;
    isVerified?: boolean;
    isAI?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    isVerified: boolean;
    bio?: string;
}
