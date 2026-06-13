import { Volume2, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { db } from '../lib/db';
import { LanguageCode } from '../types';

interface WordCardProps {
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
  onSpeak: () => void;
  onClose: () => void;
}

export const WordCard = ({ word, translation, pos, grammarNote, example, exampleZh, contextSentence, bookTitle, sourceName, page, language, onSpeak, onClose }: WordCardProps) => {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const existing = await db.wordCards
      .where('[word+language]')
      .equals([word, language])
      .first();

    if (existing?.id != null) {
      // Same lemma already saved — refresh the translation content but keep
      // the existing learning progress (status) and original createdAt.
      await db.wordCards.update(existing.id, {
        translation,
        pos,
        grammarNote,
        example,
        exampleZh,
        contextSentence,
        bookTitle,
        sourceName,
        page,
        synced: false
      });
    } else {
      await db.wordCards.add({
        word,
        translation,
        pos,
        grammarNote,
        example,
        exampleZh,
        contextSentence,
        bookTitle,
        sourceName,
        page,
        language,
        createdAt: Date.now(),
        status: 'new',
        synced: false
      });
    }
    setSaved(true);
  };

  return (
    <div className="absolute z-50 bg-white dark:bg-[#1C1C1C] p-5 rounded-xl shadow-2xl border border-gray-200 dark:border-white/20 w-80 text-left top-full mt-2 left-0 font-sans">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold font-serif italic text-gray-900 dark:text-white/90">{word}</h3>
        <div className="flex gap-1">
          <button onClick={onSpeak} className="text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 p-1.5 rounded transition-colors">
            <Volume2 size={16} />
          </button>
          <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded transition-colors">×</button>
        </div>
      </div>

      <div className="text-[15px] text-gray-700 dark:text-gray-300 font-serif mb-4">{translation}</div>

      <div className="bg-gray-50 dark:bg-black/30 p-3 rounded text-[11px] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5 space-y-1.5 mb-4">
        <p><span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mr-2">POS</span> {pos}</p>
        <p><span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mr-2">Rules</span> {grammarNote}</p>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
        <p className="italic">"{example}"</p>
        {exampleZh && <p className="mt-1.5 not-italic text-gray-500 dark:text-gray-500">{exampleZh}</p>}
      </div>

      <button
        onClick={handleSave}
        disabled={saved}
        className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors ${
          saved
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        }`}
      >
        {saved ? <><Check size={14} /> Saved Unit</> : <><Plus size={14} /> Add to Notebook</>}
      </button>
    </div>
  );
};
