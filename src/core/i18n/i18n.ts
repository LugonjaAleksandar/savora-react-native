import { getLocales } from 'expo-localization';
import { createInstance, TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { AppFailure } from '@/core/network/result';
import type { AppLanguage } from '@/features/settings/settingsStore';

import en from './locales/en.json';
import sr from './locales/sr.json';

/**
 * Copy is generated from the same ARB files as the Flutter app. Plurals use
 * i18next's `_zero/_one/_few/_other` suffixes, resolved by `Intl.PluralRules`
 * (Serbian has one/few/other).
 */
export const SUPPORTED_LANGUAGES = ['en', 'sr'] as const;

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sr: { translation: sr } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Maps the Settings choice to a concrete language; "System" follows the device when supported. */
export function resolveLanguage(choice: AppLanguage): (typeof SUPPORTED_LANGUAGES)[number] {
  if (choice !== 'system') {
    return choice;
  }
  const device = getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.find((language) => language === device) ?? 'en';
}

export function failureMessage(t: TFunction, failure: AppFailure): string {
  switch (failure.kind) {
    case 'network':
      return t('error_network');
    case 'server':
      return t('error_server');
    case 'notFound':
      return t('error_not_found');
    case 'parsing':
    case 'unknown':
      return t('error_unknown');
  }
}

export const ratingLabel = (t: TFunction, rating: number) => t(`review_rating_label_${rating}`);

/** The app's Serbian copy is Latin script, but `sr` alone formats dates in Cyrillic. */
export const formattingLocale = (language: string) => (language === 'sr' ? 'sr-Latn' : language);
