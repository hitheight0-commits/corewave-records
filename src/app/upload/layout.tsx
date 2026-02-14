import { Metadata } from 'next';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'fr';

    return {
        title: lang === 'fr' ? 'Téléverser de la Musique - Distribuez vos Titres' : 'Upload Music - Distribute Your Tracks',
        description: lang === 'fr'
            ? 'Téléversez votre musique sur COREWAVE Records. Distribuez vos titres dans le monde entier avec notre plateforme de nouvelle génération.'
            : 'Upload your music to COREWAVE Records. Distribute your tracks worldwide with our next-generation platform.',
    };
}

export default function UploadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
