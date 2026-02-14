import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import common_en from '../../public/locales/en/common.json';
import common_fr from '../../public/locales/fr/common.json';

const resources = {
    en: {
        common: common_en,
    },
    fr: {
        common: common_fr,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['cookie', 'localStorage', 'navigator'],
            caches: ['cookie', 'localStorage'],
            lookupCookie: 'NEXT_LOCALE',
            cookieMinutes: 10080, // 7 days
        },
    });

export default i18n;
