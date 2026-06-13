import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { useStore } from '../store/useStore';
import { useAI } from '../hooks/useAI';
import { useTTS } from '../hooks/useTTS';
import { WordCard } from '../components/WordCard';
import { SentencePanel } from '../components/SentencePanel';
import { db } from '../lib/db';
import { ArrowLeft, Pencil, Check, X } from 'lucide-react';

export const Reader = () => {
  const { currentBook, setView } = useStore();
  const { translateWord, translateSentence, loading } = useAI();
  const { speak } = useTTS();
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordData, setWordData] = useState<any>(null);
  const [activeWordRect, setActiveWordRect] = useState<{ top: number; left: number } | null>(null);
  
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [sentenceData, setSentenceData] = useState<any>(null);

  const [sourceName, setSourceName] = useState(currentBook?.sourceName ?? currentBook?.title ?? '');

  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(currentBook?.content ?? '');

  const containerRef = useRef<HTMLDivElement>(null);

  const startEditing = () => {
    setDraftContent(currentBook?.content ?? '');
    setSelectedWord(null);
    setSelectedSentence(null);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveContent = async () => {
    if (currentBook?.id && draftContent !== currentBook.content) {
      await db.books.update(currentBook.id, { content: draftContent });
      currentBook.content = draftContent;
    }
    setEditing(false);
  };

  const commitSourceName = async () => {
    if (!currentBook?.id) return;
    const trimmed = sourceName.trim() || currentBook.title;
    setSourceName(trimmed);
    if (trimmed !== currentBook.sourceName) {
      await db.books.update(currentBook.id, { sourceName: trimmed });
      currentBook.sourceName = trimmed;
    }
  };

  // If we try to click on a word
  const handleWordClick = async (e: MouseEvent, word: string, contextSentence: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    // Reset sentence panel if open
    setSelectedSentence(null);
    setSentenceData(null);
    
    setSelectedWord(word);
    setWordData(null);
    setActiveWordRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });

    if (currentBook) {
      const data = await translateWord(word, contextSentence, currentBook.language);
      setWordData({ ...data, contextSentence });
    }
  };

  // Click outside to close Tooltip
  useEffect(() => {
    const handleClickOutside = () => setSelectedWord(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelection = async () => {
    if (editing) return; // No sentence translation while editing the text
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length < 10) return; // Ignore small selections (probably word click)

    const sentence = selection.toString().trim();
    setSelectedSentence(sentence);
    setSentenceData(null);
    setSelectedWord(null); // Close word card

    if (currentBook) {
      const data = await translateSentence(sentence, sentence, currentBook.language);
      setSentenceData(data);
    }
  };

  if (!currentBook) return null;

  // Simple splitting by paragraphs
  const paragraphs = currentBook.content.split('\n').filter(p => p.trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto p-6 pb-40 pt-12" ref={containerRef} onMouseUp={handleSelection}>
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
        {editing ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={cancelEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={14} /> 取消
            </button>
            <button
              onClick={saveContent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              <Check size={14} /> 完成
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); startEditing(); }}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            <Pencil size={14} /> 編輯內文
          </button>
        )}
      </div>

      <div className="text-center mb-16 border-b border-gray-200 dark:border-white/10 pb-12">
         <p className="text-[11px] uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500 mb-4 font-bold">Chapter</p>
         <h1 className="text-4xl font-serif italic text-gray-900 dark:text-white/90">{currentBook.title}</h1>
         <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
           <span>Source</span>
           <input
             value={sourceName}
             onChange={(e) => setSourceName(e.target.value)}
             onBlur={commitSourceName}
             onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
             onClick={(e) => e.stopPropagation()}
             className="bg-transparent border-b border-dashed border-gray-300 dark:border-white/20 focus:border-amber-500 outline-none text-center font-serif italic normal-case tracking-normal text-sm text-gray-700 dark:text-gray-300 min-w-[12rem]"
           />
         </div>
      </div>

      {editing ? (
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          autoFocus
          className="w-full min-h-[60vh] bg-transparent border border-gray-200 dark:border-white/15 focus:border-amber-500 outline-none rounded-lg p-6 text-[1.35rem] leading-[2] text-gray-800 dark:text-gray-300 font-serif resize-y"
          placeholder="在此編輯內文……"
        />
      ) : (
      <div className="space-y-8 text-[1.35rem] leading-[2] text-gray-800 dark:text-gray-300 font-serif">
        {paragraphs.map((p, pIndex) => {
          let segments: any[] = [];
          try {
            // Use Intl.Segmenter for proper CJK support (Japanese, Chinese, etc.)
            const segmenter = new (Intl as any).Segmenter(
              currentBook.language === 'auto' ? undefined : currentBook.language, 
              { granularity: 'word' }
            );
            segments = Array.from(segmenter.segment(p));
          } catch (e) {
            // Fallback for browsers that don't support Intl.Segmenter
            const words = p.split(/(\b[^\s]+\b)/).filter(Boolean);
            segments = words.map(w => ({ segment: w, isWordLike: /\w+/.test(w) }));
          }
          
          return (
            <p key={pIndex} className="text-justify">
              {segments.map((s, wIndex) => {
                if (s.isWordLike) {
                  return (
                    <span 
                      key={wIndex}
                      onClick={(e) => handleWordClick(e, s.segment, p)}
                      className="cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-500/20 dark:hover:border-b-2 dark:hover:border-amber-500 hover:text-amber-900 dark:hover:text-white transition-all inline-block px-[1px] rounded-sm"
                    >
                      {s.segment}
                    </span>
                  );
                }
                return <span key={wIndex}>{s.segment}</span>;
              })}
            </p>
          );
        })}
      </div>
      )}

      {selectedWord && activeWordRect && (
        <div style={{ position: 'absolute', top: activeWordRect.top, left: activeWordRect.left }} onClick={e => e.stopPropagation()}>
          {loading && !wordData ? (
             <div className="bg-white dark:bg-[#1C1C1C] p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-white/20 w-48 text-center text-[10px] tracking-widest uppercase font-bold text-amber-600 dark:text-amber-500 mt-2">
               Analyzing...
             </div>
          ) : wordData ? (
            <WordCard 
              word={wordData.word}
              translation={wordData.translation}
              pos={wordData.pos}
              example={wordData.example}
              exampleZh={wordData.example_zh}
              grammarNote={wordData.grammar_note}
              contextSentence={wordData.contextSentence}
              bookTitle={currentBook.title}
              sourceName={sourceName}
              language={currentBook.language}
              onSpeak={() => speak(wordData.word, currentBook.language)}
              onClose={() => setSelectedWord(null)}
            />
          ) : null}
        </div>
      )}

      {selectedSentence && (
         loading && !sentenceData ? (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0D0D0D] border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-8 z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-center h-32 text-[11px] tracking-[0.2em] uppercase font-bold text-amber-600 dark:text-amber-500">
              Analyzing sentence structure...
            </div>
          </div>
         ) : sentenceData ? (
           <SentencePanel 
             sentence={selectedSentence}
             translation={sentenceData.translation}
             grammarNote={sentenceData.grammar_note}
             bookTitle={currentBook.title}
             sourceName={sourceName}
             language={currentBook.language}
             onSpeak={() => speak(selectedSentence, currentBook.language)}
             onClose={() => setSelectedSentence(null)}
           />
         ) : null
      )}
    </div>
  );
};
