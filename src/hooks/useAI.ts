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
    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    
    return {
      word,
      translation: `Mock translation for ${word}`,
      pos: 'Noun',
      grammar_note: 'Masculine singular. Nominative case.',
      example: `This is a mock example sentence with ${word}.`
    };
  };

  const translateSentence = async (sentence: string, context: string, lang: string): Promise<SentenceTranslation> => {
    setLoading(true);
    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    return {
      translation: `Mock translation for the sentence.`,
      grammar_note: `Mock grammar structure breakdown: Subject - Verb - Object.`
    };
  };

  return { translateWord, translateSentence, loading };
};
