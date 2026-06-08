import Dexie, { Table } from 'dexie';
import { Book, WordCard, SentenceNote } from '../types';

export class AppDatabase extends Dexie {
  books!: Table<Book, number>;
  wordCards!: Table<WordCard, number>;
  sentenceNotes!: Table<SentenceNote, number>;

  constructor() {
    super('PolyglotReaderDB');
    this.version(1).stores({
      books: '++id, title, language, lastReadDate',
      wordCards: '++id, word, language, createdAt, status',
      sentenceNotes: '++id, language, createdAt, status'
    });
  }
}

export const db = new AppDatabase();
