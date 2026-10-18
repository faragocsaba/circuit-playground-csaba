import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readLanguage, saveLanguage, type Language } from './language';
import { translateMetadata } from './translate';

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
  useEffect(() => {
    function syncMetadata() {
      const title = translateMetadata(document.title, language);
      if (document.title !== title) document.title = title;
      document.head.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(node => {
        const current = node.getAttribute('content') ?? '';
        const next = translateMetadata(current, language);
        if (current !== next) node.setAttribute('content', next);
      });
    }
    syncMetadata();
    const observer = new MutationObserver(syncMetadata);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['content'] });
    return () => observer.disconnect();
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}