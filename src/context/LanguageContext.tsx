"use client";

import React, { createContext, useContext, useState } from "react";
import { Language, TranslationDictionary, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("skm_bridal_lang") as Language;
        if (saved === "en" || saved === "ta") {
          return saved;
        }
      } catch {
        // localStorage may not be available in SSR or private mode
      }
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("skm_bridal_lang", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: translations.en,
      toggleLanguage: () => {},
    };
  }
  return context;
}
