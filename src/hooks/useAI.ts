import { useState } from 'react';
import { db } from '../lib/db';
import { LanguageCode } from '../types';

interface WordTranslation {
  word: string;
  translation: string;
  pos: string;
  grammar_note: string;
  example: string;
  example_zh?: string;
}

interface SentenceTranslation {
  translation: string;
  grammar_note: string;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const translateWord = async (word: string, context: string, lang: string): Promise<WordTranslation> => {
    const saved = await db.wordCards
      .where({ word, language: lang as LanguageCode })
      .first();
    if (saved) {
      return {
        word: saved.word,
        translation: saved.translation,
        pos: saved.pos,
        grammar_note: saved.grammarNote,
        example: saved.example,
        example_zh: saved.exampleZh,
      };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/translate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context, lang }),
      });
      if (!response.ok) throw new Error('Failed to translate word');
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        word,
        translation: 'Error translating word',
        pos: 'Error',
        grammar_note: 'An error occurred while fetching the translation.',
        example: 'N/A'
      };
    } finally {
      setLoading(false);
    }
  };

  const translateSentence = async (sentence: string, context: string, lang: string): Promise<SentenceTranslation> => {
    setLoading(true);
    try {
      const response = await fetch('/api/translate-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, context, lang }),
      });
      if (!response.ok) throw new Error('Failed to translate sentence');
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        translation: 'Error translating sentence.',
        grammar_note: 'An error occurred while fetching the translation.'
      };
    } finally {
      setLoading(false);
    }
  };

  return { translateWord, translateSentence, loading };
};
