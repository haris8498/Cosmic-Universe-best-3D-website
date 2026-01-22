import { useCallback, useRef, useEffect } from 'react';

// Sound URLs (using free sound effects)
const SOUND_URLS = {
  ambience: 'https://assets.mixkit.co/active_storage/sfx/2513/2513-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  whoosh: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3',
  hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
};

type SoundType = keyof typeof SOUND_URLS;

interface UseSoundReturn {
  play: (sound: SoundType, volume?: number) => void;
  playAmbience: () => void;
  stopAmbience: () => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

export const useSpaceSound = (): UseSoundReturn => {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;

      if (key === 'ambience') {
        audio.loop = true;
        audio.volume = 0.3;
        ambienceRef.current = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const play = useCallback((sound: SoundType, volume = 0.5) => {
    if (isMutedRef.current) return;
    
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  const playAmbience = useCallback(() => {
    if (ambienceRef.current && !isMutedRef.current) {
      ambienceRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  const stopAmbience = useCallback(() => {
    if (ambienceRef.current) {
      ambienceRef.current.pause();
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    if (muted && ambienceRef.current) {
      ambienceRef.current.pause();
    }
  }, []);

  return {
    play,
    playAmbience,
    stopAmbience,
    setMuted,
    isMuted: isMutedRef.current,
  };
};

export default useSpaceSound;
