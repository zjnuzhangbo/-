import type { LocalizedString } from './types';

export function localName(name: LocalizedString, lang: string): string {
  if (lang === 'en' && name.en) return name.en;
  if (lang === 'ru' && name.ru) return name.ru;
  return name.zh || name.en || name.ru || '';
}
