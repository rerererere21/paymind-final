'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, getDir } from '@/lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  dir: 'ltr',
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('paymind_language') as Language;
      if (stored === 'en' || stored === 'ar') {
        setLanguageState(stored);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('paymind_language', lang);
    } catch {}
    const dir = getDir(lang);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  };

  useEffect(() => {
    const dir = getDir(language);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const dir = getDir(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, isRTL: dir === 'rtl' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
