"use client";

import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Ensure direction is set correctly for the language
        const dir = i18n.dir();
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;

        const handleLanguageChange = (lng: string) => {
            document.documentElement.lang = lng;
            document.documentElement.dir = i18n.dir(lng);
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
