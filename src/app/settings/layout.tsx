import { Metadata } from 'next';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'fr';

    return {
        title: lang === 'fr' ? 'Paramètres - Gérer Votre Compte' : 'Settings - Manage Your Account',
        description: lang === 'fr'
            ? 'Gérez les paramètres de votre compte CoreWave Records, votre sécurité, vos notifications et vos préférences de langue.'
            : 'Manage your CoreWave Records account settings, security, notifications, and language preferences.',
    };
}

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
