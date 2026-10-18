export type Language = 'en' | 'hu';
export const LANGUAGE_STORAGE_KEY = 'circuit-playground-language';

export function readLanguage(storage: Pick<Storage, 'getItem'>): Language {
  try { return storage.getItem(LANGUAGE_STORAGE_KEY) === 'hu' ? 'hu' : 'en'; }
  catch { return 'en'; }
}

export function saveLanguage(storage: Pick<Storage, 'setItem'>, language: Language) {
  try { storage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Session-only when storage is blocked. */ }
}