import { db } from './db';
import { Book, WordCard, SentenceNote } from '../types';
import { SUPPORTED_LANGUAGES } from './languages';

const sanitizeCell = (value: string | undefined): string =>
  (value ?? '').replace(/[\t\r\n]+/g, ' ').trim();

const languageName = (code: string): string =>
  SUPPORTED_LANGUAGES.find(l => l.code === code)?.name ?? code;

const sourceLabel = (sourceName: string, page?: number): string =>
  page != null ? `${sourceName} 第${page}頁` : sourceName;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const dateStamp = () => new Date().toISOString().slice(0, 10);

export const exportVocabTSV = async () => {
  const cards = await db.wordCards.orderBy('createdAt').toArray();
  const header = ['語言', '原文單詞', '詞性', '中文翻譯', '例句', '例句中文翻譯', '文法筆記', '出處', '加入日期'];
  const rows = cards.map(c => [
    languageName(c.language),
    sanitizeCell(c.word),
    sanitizeCell(c.pos),
    sanitizeCell(c.translation),
    sanitizeCell(c.example),
    sanitizeCell(c.exampleZh),
    sanitizeCell(c.grammarNote),
    sanitizeCell(sourceLabel(c.sourceName, c.page)),
    new Date(c.createdAt).toISOString().slice(0, 10)
  ]);
  const tsv = [header, ...rows].map(r => r.join('\t')).join('\n');
  downloadBlob(new Blob(['\uFEFF' + tsv], { type: 'text/tab-separated-values;charset=utf-8' }), `polyglot-vocab-${dateStamp()}.tsv`);
  return cards.length;
};

interface BackupFile {
  app: 'polyglot-reader';
  version: 2;
  exportedAt: string;
  books: Omit<Book, 'fileBlob'>[];
  wordCards: WordCard[];
  sentenceNotes: SentenceNote[];
}

export const exportBackupJSON = async () => {
  const [books, wordCards, sentenceNotes] = await Promise.all([
    db.books.toArray(),
    db.wordCards.toArray(),
    db.sentenceNotes.toArray()
  ]);
  const backup: BackupFile = {
    app: 'polyglot-reader',
    version: 2,
    exportedAt: new Date().toISOString(),
    // PDF blobs are too large for JSON; books keep metadata only
    books: books.map(({ fileBlob: _fileBlob, ...rest }) => rest),
    wordCards,
    sentenceNotes
  };
  downloadBlob(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }), `polyglot-backup-${dateStamp()}.json`);
  return wordCards.length + sentenceNotes.length;
};

export interface ImportResult {
  books: number;
  wordCards: number;
  sentenceNotes: number;
}

// Additive merge: existing records are kept, duplicates skipped.
export const importBackupJSON = async (file: File): Promise<ImportResult> => {
  const data = JSON.parse(await file.text()) as Partial<BackupFile>;
  if (data.app !== 'polyglot-reader' || !Array.isArray(data.wordCards)) {
    throw new Error('不是有效的 Polyglot Reader 備份檔');
  }

  const result: ImportResult = { books: 0, wordCards: 0, sentenceNotes: 0 };

  await db.transaction('rw', db.books, db.wordCards, db.sentenceNotes, async () => {
    const existingTitles = new Set((await db.books.toArray()).map(b => b.title));
    for (const { id: _id, ...book } of data.books ?? []) {
      if (existingTitles.has(book.title)) continue;
      await db.books.add({ type: 'text', sourceName: book.title, ...book } as Book);
      result.books++;
    }

    const existingCards = new Set((await db.wordCards.toArray()).map(c => `${c.language}:${c.word}:${c.createdAt}`));
    for (const { id: _id, ...card } of data.wordCards ?? []) {
      if (existingCards.has(`${card.language}:${card.word}:${card.createdAt}`)) continue;
      await db.wordCards.add({ sourceName: card.bookTitle, synced: false, ...card });
      result.wordCards++;
    }

    const existingNotes = new Set((await db.sentenceNotes.toArray()).map(n => `${n.language}:${n.createdAt}:${n.sentence}`));
    for (const { id: _id, ...note } of data.sentenceNotes ?? []) {
      if (existingNotes.has(`${note.language}:${note.createdAt}:${note.sentence}`)) continue;
      await db.sentenceNotes.add({ sourceName: note.bookTitle, synced: false, ...note });
      result.sentenceNotes++;
    }
  });

  return result;
};
