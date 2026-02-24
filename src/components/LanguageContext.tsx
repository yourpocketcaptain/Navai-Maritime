"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any; // Translation helper
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import { translations } from "@/lib/translations";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const detectLanguage = async () => {
            // 1. Check localStorage first
            const savedLang = localStorage.getItem("navai-language") as Language;
            if (savedLang && (savedLang === "en" || savedLang === "es")) {
                setLanguageState(savedLang);
                setMounted(true);
                return;
            }

            // 2. Check browser language as fallback
            const browserLang = navigator.language.split("-")[0];
            if (browserLang === "es") {
                setLanguageState("es");
                localStorage.setItem("navai-language", "es");
            }

            // 3. Geolocation check specifically for Spain (ES)
            try {
                const response = await fetch("/api/geolocate");
                const data = await response.json();
                if (data.country === "ES") {
                    setLanguageState("es");
                    localStorage.setItem("navai-language", "es");
                }
            } catch (error) {
                console.error("Geolocation failed:", error);
            }

            setMounted(true);
        };

        detectLanguage();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("navai-language", lang);
    };

    const t = translations[language];

    // Avoid hydration mismatch by only rendering children after mount if needed, 
    // or just providing the default. Since it's a provider, we just provide.
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
