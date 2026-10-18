import { describe, expect, it } from 'vitest';
import { LANGUAGE_STORAGE_KEY, readLanguage, saveLanguage } from './language';

describe('English and Hungarian language preference', () => {
  it('defaults to English without a saved language', () => {
    expect(readLanguage({ getItem: () => null })).toBe('en');
  });
  it('restores Hungarian after saving it', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    saveLanguage(storage, 'hu');
    expect(values.get(LANGUAGE_STORAGE_KEY)).toBe('hu');
    expect(readLanguage(storage)).toBe('hu');
    saveLanguage(storage, 'en');
    expect(readLanguage(storage)).toBe('en');
  });
  it('uses English for unsupported stored languages or blocked storage', () => {
    expect(readLanguage({ getItem: () => 'de' })).toBe('en');
    expect(readLanguage({ getItem: () => { throw new Error('blocked'); } })).toBe('en');
  });
});