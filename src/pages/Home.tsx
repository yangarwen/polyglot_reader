import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useStore } from '../store/useStore';
import { BookPlus, BookOpen, ClipboardPaste, X } from 'lucide-react';

export const Home = () => {
  const books = useLiveQuery(() => db.books.toArray());
  const setCurrentBook = useStore((state) => state.setCurrentBook);
  
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      const newBook = {
        title: file.name.replace('.txt', ''),
        content: text,
        language: 'en' as const, // Defaulting to en for now
        lastReadDate: Date.now(),
        progress: 0
      };
      
      const id = await db.books.add(newBook);
      const savedBook = await db.books.get(id);
      if (savedBook) {
        setCurrentBook(savedBook);
      }
    } else {
      alert('Only .txt files are supported in Phase 1.');
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteTitle.trim() || !pasteContent.trim()) return;
    
    const newBook = {
      title: pasteTitle.trim(),
      content: pasteContent.trim(),
      language: 'en' as const,
      lastReadDate: Date.now(),
      progress: 0
    };
    
    const id = await db.books.add(newBook);
    const savedBook = await db.books.get(id);
    if (savedBook) {
      setCurrentBook(savedBook);
      setShowPasteModal(false);
      setPasteTitle('');
      setPasteContent('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12">
      <div className="flex justify-between items-center mb-12 border-b border-gray-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-serif italic text-gray-900 dark:text-white/90">Library</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowPasteModal(true)}
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm"
          >
            <ClipboardPaste size={16} />
            <span>Paste Text</span>
          </button>
          <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm">
            <BookPlus size={16} />
            <span>Import .txt</span>
            <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {books === undefined ? (
        <p className="text-[11px] uppercase tracking-widest font-bold text-gray-500">Loading library...</p>
      ) : books.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-[#0F0F0F] border border-gray-200 dark:border-white/10">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-gray-800 dark:text-gray-300 font-serif italic text-2xl mb-3">Your library is empty</h2>
          <p className="text-gray-500 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">Import a .txt file or paste text to start reading</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              className="bg-white dark:bg-[#0F0F0F] p-6 border border-gray-200 dark:border-white/10 hover:border-amber-600/50 dark:hover:border-amber-500/50 transition-colors cursor-pointer flex flex-col h-48 group shadow-sm"
              onClick={() => {
                db.books.update(book.id!, { lastReadDate: Date.now() });
                setCurrentBook(book);
              }}
            >
              <h3 className="font-serif italic text-2xl text-gray-900 dark:text-white/90 line-clamp-2 mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{book.title}</h3>
              <div className="mt-auto">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                   <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-amber-600 dark:text-amber-500">{book.language}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                  <div className="bg-amber-600 h-1 rounded-full" style={{ width: `${book.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-white/10 p-8 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setShowPasteModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif italic text-gray-900 dark:text-white/90 mb-6">Paste New Material</h2>
            
            <div className="space-y-6 overflow-y-auto pr-2 pb-2 flex-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Title</label>
                <input 
                  type="text" 
                  value={pasteTitle}
                  onChange={e => setPasteTitle(e.target.value)}
                  placeholder="e.g., L'Étranger - Chapitre 1"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Content</label>
                <textarea 
                  value={pasteContent}
                  onChange={e => setPasteContent(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full flex-1 min-h-[300px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:border-amber-500 transition-colors resize-y font-serif leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-4">
              <button 
                onClick={() => setShowPasteModal(false)}
                className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePasteSubmit}
                disabled={!pasteTitle.trim() || !pasteContent.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
