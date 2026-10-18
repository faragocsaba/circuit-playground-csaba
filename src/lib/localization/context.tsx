import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readLanguage, saveLanguage, type Language } from './language';

export const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: 'en', setLanguage: () => {} });
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>('en');
  useEffect(() => { try { updateLanguage(readLanguage(window.localStorage)); } catch { /* English fallback. */ } }, []);
  function setLanguage(value: Language) {
    updateLanguage(value);
    try { saveLanguage(window.localStorage, value); } catch { /* Keep session choice. */ }
  }
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}