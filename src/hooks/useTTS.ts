import { useEffect, useRef, useState, useCallback } from 'react';
import Tts from 'react-native-tts';
import { Platform } from 'react-native';
import i18n from 'i18next';
import { applyBestVoice, speakable } from './ttsVoice';


const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const isSpeakingRef = useRef(false);
  const speakingIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const pendingIdRef = useRef<string | null>(null);
  const currentUtteranceRef = useRef<string | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Best-sounding installed voice in the app's language, at a natural speed; again whenever the language changes.
    applyBestVoice(i18n.language);

    const eventUid = (evt: any): string | null =>
      evt != null && evt.utteranceId != null ? String(evt.utteranceId) : null;

    const onStart = (evt: any) => {
      currentUtteranceRef.current = eventUid(evt);
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      if (pendingIdRef.current !== null) {
        speakingIdRef.current = pendingIdRef.current;
        setSpeakingId(pendingIdRef.current);
      }
    };

    const settle = (evt: any) => {
      const uid = eventUid(evt);
      if (currentUtteranceRef.current === null) return;
      if (uid !== null && uid !== currentUtteranceRef.current) return;
      currentUtteranceRef.current = null;
      isSpeakingRef.current = false;
      speakingIdRef.current = null;
      pendingIdRef.current = null;
      setIsSpeaking(false);
      setSpeakingId(null);
    };

    Tts.addEventListener('tts-start', onStart);
    Tts.addEventListener('tts-finish', settle);
    Tts.addEventListener('tts-cancel', settle);
  }, []);

  // Switch voice when the app language changes.
  useEffect(() => {
    const onLanguage = (lng: string) => { applyBestVoice(lng); };
    i18n.on('languageChanged', onLanguage);
    return () => { i18n.off('languageChanged', onLanguage); };
  }, []);

  // Always stop TTS when the component unmounts
  useEffect(() => {
    return () => {
      try { Tts.stop(); } catch (_) {}
    };
  }, []);


  const cleanTextForSpeech = useCallback((text: string): string => speakable(text), []);

  const forceStopNative = useCallback(() => {
    try { Tts.stop(); } catch (_) {}
  }, []);

  const safeStop = useCallback(() => {
    // Update refs synchronously first so any in-flight speak() sees correct state
    currentUtteranceRef.current = null;
    isSpeakingRef.current = false;
    speakingIdRef.current = null;
    pendingIdRef.current = null;
    setIsSpeaking(false);
    setSpeakingId(null);
    forceStopNative();
  }, [forceStopNative]);

  const speak = useCallback(
    (text: string, id?: string) => {
      if (!text?.trim()) return;

      if (isSpeakingRef.current && speakingIdRef.current === id) {
        safeStop();
        if (Platform.OS === 'ios') {
          setTimeout(forceStopNative, 50);
          setTimeout(forceStopNative, 150);
        }
        return;
      }

      safeStop();

      const cleaned = cleanTextForSpeech(text);
      const targetId = id ?? null;

      isSpeakingRef.current = true;
      speakingIdRef.current = targetId;
      pendingIdRef.current = targetId;
      setIsSpeaking(true);
      if (id) setSpeakingId(id);

      try {
        const result: any = Tts.speak(cleaned);
        if (result && typeof result.then === 'function') {
          result
            .then((uid: any) => {
              if (uid != null && pendingIdRef.current === targetId) {
                currentUtteranceRef.current = String(uid);
              }
            })
            .catch(() => {});
        }
      } catch {
        currentUtteranceRef.current = null;
        isSpeakingRef.current = false;
        speakingIdRef.current = null;
        pendingIdRef.current = null;
        setIsSpeaking(false);
        setSpeakingId(null);
      }
    },
    [cleanTextForSpeech, safeStop, forceStopNative],
  );

  const stop = useCallback(() => {
    safeStop();
    if (Platform.OS === 'ios') {
      setTimeout(forceStopNative, 50);
      setTimeout(forceStopNative, 150);
    }
  }, [safeStop, forceStopNative]);

  return { speak, stop, isSpeaking, speakingId };
};

export default useTTS;
