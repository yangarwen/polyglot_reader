import { useState } from 'react';

interface WordTranslation {
  word: string;
  translation: string;
  pos: string;
  grammar_note: string;
  example: string;
}

interface SentenceTranslation {
  translation: string;
  grammar_note: string;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const translateWord = async (word: string, context: string, lang: string): Promise<WordTranslation> => {
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
