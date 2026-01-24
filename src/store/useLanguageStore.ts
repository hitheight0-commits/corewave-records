import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'fr' | 'de' | 'es';

interface LanguageState {
    language: Language;
    translations: Record<string, Record<string, string>>;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const TRANSLATIONS = {
    en: {
        home: 'Home',
        explore: 'Explore',
        artists: 'Artists',
        upload: 'Upload',
        search: 'Search everything...',
        controlCenter: 'Control Center',
        save: 'Save Changes'
    },
    fr: {
        home: 'Accueil',
        explore: 'Explorer',
        artists: 'Artistes',
        upload: 'Téléverser',
        search: 'Tout rechercher...',
        controlCenter: 'Centre de Contrôle',
        save: 'Enregistrer'
    },
    de: {
        home: 'Startseite',
        explore: 'Entdecken',
        artists: 'Künstler',
        upload: 'Hochladen',
        search: 'Alles durchsuchen...',
        controlCenter: 'Kontrollzentrum',
        save: 'Speichern'
    },
    es: {
        home: 'Inicio',
        explore: 'Explorar',
        artists: 'Artistas',
        upload: 'Subir',
        search: 'Buscar todo...',
        controlCenter: 'Centro de Control',
        save: 'Guardar'
    }
};

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'en',
            translations: TRANSLATIONS,
            setLanguage: (language) => set({ language }),
            t: (key) => {
                const { language, translations } = get();
                return translations[language]?.[key] || translations['en'][key] || key;
            }
        }),
        {
            name: 'language-storage',
        }
    )
);
