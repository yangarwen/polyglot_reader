import { Volume2, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { db } from '../lib/db';
import { LanguageCode } from '../types';

interface SentencePanelProps {
  sentence: string;
  translation: string;
  grammarNote: string;
  bookTitle: string;
  sourceName: string;
  page?: number;
  language: LanguageCode | 'auto';
  onSpeak: () => void;
  onClose: () => void;
}

export const SentencePanel = ({ sentence, translation, grammarNote, bookTitle, sourceName, page, language, onSpeak, onClose }: SentencePanelProps) => {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await db.sentenceNotes.add({
      sentence,
      translation,
      grammarNote,
      bookTitle,
      sourceName,
      page,
      language,
      createdAt: Date.now(),
      status: 'new',
      synced: false
    });
    setSaved(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0D0D0D] border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-0 z-50 transform transition-transform font-sans">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-4 right-4 md:right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors z-10">×</button>
        
        <div className="flex-1 p-8 md:p-10">
          <div className="flex items-center gap-4 mb-4">
             <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold">Analysis</span>
             <button onClick={onSpeak} className="text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/10 p-1.5 rounded transition-colors"><Volume2 size={16} /></button>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif italic text-gray-900 dark:text-white/90 pr-8 leading-relaxed mb-6">{sentence}</h3>
          <div className="h-px bg-gray-200 dark:bg-white/10 w-full max-w-sm mb-6"></div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-serif leading-relaxed">{translation}</p>
        </div>

        <div className="md:w-[380px] bg-gray-50 dark:bg-black/20 p-8 md:p-10 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 flex flex-col justify-between">
           <div>
             <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-5 font-bold">Grammar Notes</label>
             <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 space-y-3 whitespace-pre-wrap">
               {grammarNote}
             </div>
           </div>

           <div className="mt-8">
             <button 
                onClick={handleSave}
                disabled={saved}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  saved 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {saved ? <><Check size={16} /> Saved Pattern</> : <><Plus size={16} /> Save Pattern</>}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
