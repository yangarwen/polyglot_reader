/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Home } from './pages/Home';
import { Reader } from './pages/Reader';
import { Notes } from './pages/Notes';
import { useStore } from './store/useStore';
import { Library, NotebookPen, Moon, Sun } from 'lucide-react';

export default function App() {
  const { view, setView, theme, toggleTheme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  let Content;
  switch (view) {
    case 'home':
      Content = Home;
      break;
    case 'reader':
      Content = Reader;
      break;
    case 'notes':
      Content = Notes;
      break;
    default:
      Content = Home;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-200 font-sans text-gray-900 dark:text-[#E5E5E5]">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0D0D0D]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center font-bold text-white text-sm">P</div>
             <div className="font-serif italic text-lg tracking-wide text-gray-900 dark:text-white/90">
               Polyglot Reader
             </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setView('home')} 
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${view === 'home' || view === 'reader' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Library size={16} />
              Read
            </button>
            <button 
              onClick={() => setView('notes')} 
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${view === 'notes' ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <NotebookPen size={16} />
              Notes
            </button>
            
            <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-2"></div>
            
            <button onClick={toggleTheme} className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Content />
      </main>
    </div>
  );
}
