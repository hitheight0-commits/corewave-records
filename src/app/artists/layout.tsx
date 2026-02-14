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
        title: lang === 'fr' ? 'Parcourir les Artistes - Musiciens Indépendants' : 'Browse Artists - Independent Musicians',
        description: lang === 'fr'
            ? 'Rencontrez les créateurs de l\'écosystème COREWAVE. Découvrez et suivez des artistes indépendants du monde entier. Parcourez les artistes vérifiés et les nouveaux talents.'
            : 'Meet the creators of the COREWAVE ecosystem. Discover and follow independent artists from around the world. Browse verified artists and emerging talent.',
    };
}

export default function ArtistsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
