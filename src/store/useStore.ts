import { create } from 'zustand';
import { Book, LanguageCode } from '../types';

interface AppState {
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  view: 'home' | 'reader' | 'notes';
  setView: (view: 'home' | 'reader' | 'notes') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentBook: null,
  setCurrentBook: (book) => set({ currentBook: book, view: 'reader' }),
  view: 'home',
  setView: (view) => set({ view }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
