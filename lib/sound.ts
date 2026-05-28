// lib/sound.ts
// Low-latency, multi-voice audio engine built on top of pre-cached asset instances.
import { useArenaStore } from '@/lib/store';

const SOUNDS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  tick: '/sounds/tick.mp3',
  rankUp: '/sounds/rank-up.mp3',
  victory: '/sounds/victory.mp3',
  achievement: '/sounds/achievement.mp3',
} as const;

type SoundKey = keyof typeof SOUNDS;

const audioCache: Record<string, HTMLAudioElement> = {};

if (typeof window !== 'undefined') {
  Object.entries(SOUNDS).forEach(([key, path]) => {
    const audio = new Audio(path);
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioCache[key] = audio;
  });
}

export function playSound(key: SoundKey): void {
  if (typeof window === 'undefined') return;

  const soundEnabled = useArenaStore.getState().soundEnabled;
  if (!soundEnabled) return;

  const cachedAudio = audioCache[key];
  if (!cachedAudio) return;

  try {
    const playInstance = cachedAudio.cloneNode(true) as HTMLAudioElement;
    playInstance.volume = cachedAudio.volume;
    
    // Explicit play-head snap back prevents multi-voice lag clipping across browser engine profiles
    playInstance.currentTime = 0;
    
    playInstance.play().catch(() => {
      // Gracefully swallow autoplay policy rejections
    });
  } catch (error) {
    console.warn(`Arena Sound Dispatch Failed for key: ${key}`, error);
  }
}