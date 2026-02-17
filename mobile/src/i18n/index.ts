/**
 * i18n setup for multi-language support.
 * Supports English (default), Italian, and German.
 * Language persisted in localStorage (LANGUAGE_KEY).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import it from './locales/it/translation.json';
import de from './locales/de/translation.json';

export const LANGUAGE_KEY = 'pos_app_language';
export const SUPPORTED_LANGUAGES = ['en', 'it', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  it: 'Italiano',
  de: 'Deutsch',
};

export function getStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    de: { translation: de },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
