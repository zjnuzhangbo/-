import { useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function useVoiceCommands() {
  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const startListening = useCallback(() => {
    resetTranscript();
    SpeechRecognition.startListening({ language: i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-US' : 'zh-CN' });
  }, [i18n.language]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  useEffect(() => {
    if (!transcript) return;
    const text = transcript.toLowerCase();

    if (text.includes('搜索')) {
      const query = text.replace(/搜索/g, '').trim();
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="搜索"]');
      if (searchInput) searchInput.value = query;
    }

    if (text.includes('去购物车') || text.includes('cart') || text.includes('корзина')) {
      navigate('/order');
    }

    if (text.includes('切换中文') || text.includes('chinese')) {
      i18n.changeLanguage('zh');
      localStorage.setItem('tricycle_lang', 'zh');
    }
    if (text.includes('切换英文') || text.includes('english') || text.includes('switch to english')) {
      i18n.changeLanguage('en');
      localStorage.setItem('tricycle_lang', 'en');
    }
    if (text.includes('切换俄语') || text.includes('russian') || text.includes('русский')) {
      i18n.changeLanguage('ru');
      localStorage.setItem('tricycle_lang', 'ru');
    }

    if (text.includes('首页') || text.includes('home') || text.includes('главная')) {
      navigate('/');
    }
  }, [transcript]);

  return {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  };
}
