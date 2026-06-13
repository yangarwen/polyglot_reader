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
  type: 'text' | 'pdf';
  content: string; // plain text for 'text' books; empty for 'pdf'
  fileBlob?: Blob; // original file for 'pdf' books
  sourceName: string; // user-editable citation label, defaults to title
  language: LanguageCode | 'auto';
  lastReadDate: number;
  progress: number; // percentage or character index
  lastPage?: number; // for 'pdf' books
}

export interface WordCard {
  id?: number;
  word: string;
  translation: string;
  pos: string;
  grammarNote: string;
  example: string;
  exampleZh?: string;
  contextSentence: string;
  bookTitle: string;
  sourceName: string;
  page?: number;
  language: LanguageCode | 'auto';
  createdAt: number;
  status: 'new' | 'learning' | 'mastered';
  synced: boolean;
}

export interface SentenceNote {
  id?: number;
  sentence: string;
  translation: string;
  grammarNote: string;
  bookTitle: string;
  sourceName: string;
  page?: number;
  language: LanguageCode | 'auto';
  createdAt: number;
  status: 'new' | 'learning' | 'mastered';
  synced: boolean;
}
