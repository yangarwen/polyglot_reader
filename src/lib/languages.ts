import { LanguageCode } from '../types';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; name: string; ttsCode: string | null }[] = [
  { code: 'ru', name: 'Russian', ttsCode: 'ru-RU' },
  { code: 'fr', name: 'French', ttsCode: 'fr-FR' },
  { code: 'es', name: 'Spanish', ttsCode: 'es-ES' },
  { code: 'de', name: 'German', ttsCode: 'de-DE' },
  { code: 'cs', name: 'Czech', ttsCode: 'cs-CZ' },
  { code: 'ja', name: 'Japanese', ttsCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', ttsCode: 'ko-KR' },
  { code: 'it', name: 'Italian', ttsCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', ttsCode: 'pt-PT' }, // or pt-BR
  { code: 'la', name: 'Latin', ttsCode: null },
  { code: 'he', name: 'Hebrew', ttsCode: 'he-IL' },
  { code: 'el', name: 'Greek', ttsCode: 'el-GR' },
  { code: 'tr', name: 'Turkish', ttsCode: 'tr-TR' },
  { code: 'th', name: 'Thai', ttsCode: 'th-TH' },
  { code: 'ar', name: 'Arabic', ttsCode: 'ar-SA' },
  { code: 'en', name: 'English', ttsCode: 'en-US' }
];

export const getTTSCode = (langCode: LanguageCode | 'auto'): string | null => {
  if (langCode === 'auto') return null;
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return lang ? lang.ttsCode : null;
};
