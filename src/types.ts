export type LanguageCode =
  | 'ru'
  | 'fr'
  | 'es'
  | 'de'
  | 'cs'
  | 'ja'
  | 'ko'
  | 'it'
  | 'pt'
  | 'la'
  | 'he'
  | 'el'
  | 'tr'
  | 'th'
  | 'ar'
  | 'en';

export interface Book {
  id?: number;
  title: string;
  content: string;
  language: LanguageCode | 'auto';
  lastReadDate: number;
  progress: number; // percentage or character index
}

export interface WordCard {
  id?: number;
  word: string;
  translation: string;
  pos: string;
  grammarNote: string;
  example: string;
  contextSentence: string;
  bookTitle: string;
  language: LanguageCode;
  createdAt: number;
  status: 'new' | 'learning' | 'mastered';
}

export interface SentenceNote {
  id?: number;
  sentence: string;
  translation: string;
  grammarNote: string;
  bookTitle: string;
  language: LanguageCode;
  createdAt: number;
  status: 'new' | 'learning' | 'mastered';
}
