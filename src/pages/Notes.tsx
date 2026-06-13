import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { WordCard, SentenceNote } from '../types';
import { Notebook, Trash2, Volume2, FileSpreadsheet, FileJson, Upload } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { exportVocabTSV, exportBackupJSON, importBackupJSON } from '../lib/export';

interface EditableTextProps {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

const EditableText = ({ value, onSave, multiline, placeholder, className = '' }: EditableTextProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => { setDraft(value); setEditing(true); };
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value) onSave(next);
  };
  const cancel = () => { setEditing(false); setDraft(value); };

  if (editing) {
    const shared = {
      autoFocus: true,
      value: draft,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Escape') cancel();
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
      },
      className: `${className} block w-full bg-amber-50 dark:bg-amber-500/10 outline-none ring-1 ring-amber-400/60 rounded px-1.5 py-0.5`,
    };
    return multiline
      ? <textarea {...shared} rows={Math.max(2, draft.split('\n').length)} className={`${shared.className} resize-y whitespace-pre-wrap`} />
      : <input type="text" {...shared} />;
  }

  return (
    <span
      onClick={start}
      title="點擊編輯"
      className={`${className} cursor-text rounded px-0.5 -mx-0.5 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors ${multiline ? 'whitespace-pre-wrap' : ''}`}
    >
      {value || <span className="text-gray-400 dark:text-gray-600 italic font-sans">{placeholder ?? '（點擊編輯）'}</span>}
    </span>
  );
};

export const Notes = () => {
  const words = useLiveQuery(() => db.wordCards.toArray());
  const sentences = useLiveQuery(() => db.sentenceNotes.toArray());
  const { speak } = useTTS();
  const [status, setStatus] = useState<string | null>(null);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 4000);
  };

  const updateWord = (id: number, patch: Partial<WordCard>) =>
    db.wordCards.update(id, { ...patch, synced: false });
  const updateNote = (id: number, patch: Partial<SentenceNote>) =>
    db.sentenceNotes.update(id, { ...patch, synced: false });

  const handleExportTSV = async () => {
    const count = await exportVocabTSV();
    flash(`已匯出 ${count} 筆生詞（TSV，可直接貼入 Google Sheets）`);
  };

  const handleExportJSON = async () => {
    const count = await exportBackupJSON();
    flash(`已備份 ${count} 筆筆記（JSON）`);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const r = await importBackupJSON(file);
      flash(`匯入完成：${r.wordCards} 筆生詞、${r.sentenceNotes} 筆句型、${r.books} 本書`);
    } catch (e: any) {
      flash(`匯入失敗：${e.message}`);
    }
  };

  const toolButtonClass = "cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors";

  return (
    <div className="max-w-5xl mx-auto p-8 pt-12">
      <div className="flex flex-wrap items-center gap-4 mb-12 border-b border-gray-200 dark:border-white/10 pb-8">
        <div className="w-12 h-12 bg-amber-600 rounded flex items-center justify-center text-white">
           <Notebook size={24} />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-serif italic text-gray-900 dark:text-white/90">Your Notebook</h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-2">Saved Vocabulary & Patterns · 點擊文字即可編輯</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportTSV} className={toolButtonClass}>
            <FileSpreadsheet size={14} /> TSV
          </button>
          <button onClick={handleExportJSON} className={toolButtonClass}>
            <FileJson size={14} /> Backup
          </button>
          <label className={toolButtonClass}>
            <Upload size={14} /> Import
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {status && (
        <div className="mb-8 -mt-4 text-[11px] tracking-widest uppercase font-bold text-amber-600 dark:text-amber-500">{status}</div>
      )}

      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-300">Vocabulary Flashcards</h2>
            <div className="text-[10px] text-amber-600 dark:text-amber-500 font-bold tracking-widest uppercase">{words?.length || 0} Units</div>
        </div>
        {words?.length === 0 ? (
          <p className="text-sm font-serif italic text-gray-500">No words saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {words?.map(word => (
              <div key={word.id} className="bg-white dark:bg-[#0F0F0F] p-6 border border-gray-200 dark:border-white/10 hover:border-amber-600/50 dark:hover:border-amber-500/50 transition-colors relative group shadow-sm">
                <button
                  onClick={() => db.wordCards.delete(word.id!)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-3 mb-3 pr-8">
                  <EditableText
                    value={word.word}
                    onSave={(v) => updateWord(word.id!, { word: v })}
                    className="text-2xl font-serif italic text-gray-900 dark:text-white/90 flex-1"
                  />
                  <button onClick={() => speak(word.word, word.language)} className="flex-shrink-0 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 p-1.5 rounded transition-colors"><Volume2 size={16}/></button>
                </div>
                <div className="text-[15px] font-serif text-gray-700 dark:text-gray-300 mb-4">
                  <EditableText
                    value={word.translation}
                    onSave={(v) => updateWord(word.id!, { translation: v })}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-black/30 p-3 text-[11px] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5 space-y-1.5 mb-5">
                  <p className="flex"><span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mr-2 flex-shrink-0">POS</span>
                    <EditableText value={word.pos} onSave={(v) => updateWord(word.id!, { pos: v })} className="flex-1" />
                  </p>
                  <p className="flex"><span className="text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mr-2 flex-shrink-0">Rules</span>
                    <EditableText multiline value={word.grammarNote} onSave={(v) => updateWord(word.id!, { grammarNote: v })} className="flex-1" />
                  </p>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 italic font-serif leading-relaxed">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600/70 dark:text-amber-500/60 block mb-1 not-italic font-sans">Context</span>
                  <EditableText multiline value={word.contextSentence} onSave={(v) => updateWord(word.id!, { contextSentence: v })} />
                  <span className="block mt-1 not-italic font-sans text-gray-500">
                    <EditableText value={word.exampleZh ?? ''} onSave={(v) => updateWord(word.id!, { exampleZh: v })} placeholder="（點擊新增例句翻譯）" />
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <EditableText value={word.sourceName || word.bookTitle} onSave={(v) => updateWord(word.id!, { sourceName: v })} />
                  {word.page != null ? <span>· P.{word.page}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-300">Pattern Notes</h2>
            <div className="text-[10px] text-amber-600 dark:text-amber-500 font-bold tracking-widest uppercase">{sentences?.length || 0} Units</div>
        </div>
        {sentences?.length === 0 ? (
          <p className="text-sm font-serif italic text-gray-500">No sentences saved yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {sentences?.map(note => (
              <div key={note.id} className="bg-white dark:bg-[#0F0F0F] p-8 border border-gray-200 dark:border-white/10 hover:border-amber-600/50 dark:hover:border-amber-500/50 transition-colors relative group flex flex-col md:flex-row gap-8 shadow-sm">
                <button
                   onClick={() => db.sentenceNotes.delete(note.id!)}
                   className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={14} />
                </button>

                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <button onClick={() => speak(note.sentence, note.language)} className="mt-1 flex-shrink-0 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 p-1.5 rounded transition-colors"><Volume2 size={16}/></button>
                    <h3 className="text-2xl font-serif italic text-gray-900 dark:text-white/90 leading-relaxed pr-8 flex-1">
                      <EditableText multiline value={note.sentence} onSave={(v) => updateNote(note.id!, { sentence: v })} />
                    </h3>
                  </div>
                  <div className="text-lg font-serif text-gray-700 dark:text-gray-300 pl-11">
                    <EditableText multiline value={note.translation} onSave={(v) => updateNote(note.id!, { translation: v })} />
                  </div>
                </div>

                <div className="md:w-80 bg-gray-50 dark:bg-black/20 p-5 border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-500 block mb-3">Grammar Breakdown</span>
                  <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    <EditableText multiline value={note.grammarNote} onSave={(v) => updateNote(note.id!, { grammarNote: v })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
