import catalog from './hu.json';
import type { Language } from './language';

const messages: Record<string, string> = catalog;
const englishMessages = new Map(Object.entries(messages).map(([english, hungarian]) => [hungarian, english]));
export function translateMetadata(text: string, language: Language): string {
  return translate(englishMessages.get(text) ?? text, language);
}
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const patterns = Object.entries(messages).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => ({
  expression: new RegExp('^' + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$'),
  value,
  slots: [...key.matchAll(/\{(\d+)\}/g)].map(match => Number(match[1])),
}));

export function translate(text: string, language: Language): string {
  if (language === 'en' || !text.trim()) return text;
  const key = normalize(text);
  let translated = messages[key];
  if (translated === undefined) {
    for (const pattern of patterns) {
      const match = key.match(pattern.expression);
      if (!match) continue;
      translated = pattern.value.replace(/\{(\d+)\}/g, (_, slot: string) => {
        const index = pattern.slots.indexOf(Number(slot));
        return translate(match[index + 1] ?? '', language);
      });
      break;
    }
  }
  if (translated === undefined) return text;
  return (text.match(/^\s*/)?.[0] ?? '') + translated + (text.match(/\s*$/)?.[0] ?? '');
}