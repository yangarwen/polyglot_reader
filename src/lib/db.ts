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
    this.version(2).stores({
      books: '++id, title, language, lastReadDate',
      wordCards: '++id, word, language, createdAt, status, [word+language]',
      sentenceNotes: '++id, language, createdAt, status'
    }).upgrade(async (tx) => {
      await tx.table('books').toCollection().modify((book: Book) => {
        book.type ??= 'text';
        book.sourceName ??= book.title;
      });
      await tx.table('wordCards').toCollection().modify((card: WordCard) => {
        card.sourceName ??= card.bookTitle;
        card.synced ??= false;
      });
      await tx.table('sentenceNotes').toCollection().modify((note: SentenceNote) => {
        note.sourceName ??= note.bookTitle;
        note.synced ??= false;
      });
    });
  }
}

export const db = new AppDatabase();
