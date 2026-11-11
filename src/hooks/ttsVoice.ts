import Tts from 'react-native-tts';

/** App language code → the speech locale to ask the phone for. */
const SPEECH_LOCALE: Record<string, string> = {
  en: 'en-US', ar: 'ar-SA', es: 'es-US', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP',
  ko: 'ko-KR', hi: 'hi-IN', ru: 'ru-RU', it: 'it-IT', du: 'nl-NL', po: 'pl-PL', tu: 'tr-TR', th: 'th-TH',
  id: 'id-ID', vt: 'vi-VN', he: 'he-IL', ur: 'ur-PK',
};

export const speechLocaleFor = (appLanguage?: string | null): string =>
  SPEECH_LOCALE[(appLanguage || 'en').split('-')[0]] ?? 'en-US';

/** Normal speaking speed; react-native-tts maps 0.01–0.99 to each platform's own scale, so 0.5 is normal on both. */
export const NATURAL_RATE = 0.5;

interface Voice {
  id: string;
  name?: string;
  language?: string;
  quality?: number;
  latency?: number;
  networkConnectionRequired?: boolean;
  notInstalled?: boolean;
}

/** iOS novelty and robotic voices (Zarvox, Bells, Eloquence…) — never pick these. */
const isNovelty = (v: Voice) => /eloquence|speech\.synthesis\.voice|novelty/i.test(v.id);

/** Higher is better: Premium/Neural voices first, then Enhanced, then the default compact voice. */
function score(v: Voice, locale: string): number {
  const lang = (v.language || '').replace('_', '-').toLowerCase();
  const want = locale.toLowerCase();
  let s = 0;
  if (lang === want) s += 1000;
  else if (lang.split('-')[0] === want.split('-')[0]) s += 600;
  else return -1;
  const id = `${v.id} ${v.name ?? ''}`.toLowerCase();
  if (/premium|neural|wavenet/.test(id)) s += 300;
  else if (/enhanced|siri/.test(id)) s += 200;
  s += Math.min(Number(v.quality) || 0, 500) / 5; // 300 = normal, 500 = enhanced / very high
  if (v.notInstalled) s -= 800;
  if (v.networkConnectionRequired) s -= 40; // great quality but needs signal; prefer an offline voice when it's as good
  return s;
}

let chosenFor: string | null = null;

/** Picks the best installed voice for the app's language and sets it as the default. Safe to call often. */
export async function applyBestVoice(appLanguage?: string | null): Promise<void> {
  const locale = speechLocaleFor(appLanguage);
  if (chosenFor === locale) return;
  try { await Tts.getInitStatus(); } catch { /* Android without a TTS engine: speak() will report it */ }
  try { await Tts.setDefaultLanguage(locale); } catch { /* language not installed: the phone's default is used */ }
  try { await Tts.setDefaultRate(NATURAL_RATE); } catch { /* ignore */ }
  try { await Tts.setDefaultPitch(1.0); } catch { /* ignore */ }
  try {
    const voices = ((await Tts.voices()) as Voice[]).filter((v) => !isNovelty(v));
    const best = voices
      .map((v) => ({ v, s: score(v, locale) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)[0];
    if (best) await Tts.setDefaultVoice(best.v.id);
  } catch { /* voice list unavailable: keep the language default */ }
  chosenFor = locale;
}

/** Text as it should be spoken: no markdown, emojis, or symbols read out letter by letter. */
export function speakable(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s*[|→•·]\s*/g, ', ')
    .replace(/\s+&\s+/g, ' and ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
