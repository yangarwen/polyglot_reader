import { useCallback } from 'react';
import { getTTSCode } from '../lib/languages';
import { LanguageCode } from '../types';

export const useTTS = () => {
  const speak = useCallback((text: string, langCode: LanguageCode | 'auto', rate: number = 1.0) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text to speech');
      return;
    }

    const ttsCode = getTTSCode(langCode);
    if (!ttsCode) {
      console.warn('TTS not supported for this language');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsCode;
    utterance.rate = rate;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};
