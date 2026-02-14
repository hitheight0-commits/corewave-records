import { Metadata } from 'next';

import { cookies } from 'next/headers';
import en from '../../../public/locales/en/common.json';
import fr from '../../../public/locales/fr/common.json';

const translations: any = { en, fr };

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'fr';
    const t = translations[lang] || en;

    return {
        title: lang === 'fr' ? 'Explorer la Musique - Découvrez de Nouveaux Artistes' : 'Explore Music - Discover New Artists',
        description: lang === 'fr'
            ? 'Explorez les derniers titres d\'artistes indépendants du monde entier. Découvrez de nouvelles musiques dans des genres comme l\'Électronique, le Hip Hop, le Lo-Fi, l\'Ambiance et plus encore.'
            : 'Explore the latest tracks from independent artists worldwide. Discover new music across genres like Electronic, Hip Hop, Lo-Fi, Ambient, and more.',
    };
}

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
