import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight hook that plays Spotify 30-second previews.
 * Only one preview plays at a time — starting a new one stops the old one.
 *
 * Uses refs alongside state so async callbacks always see the latest
 * values without stale-closure issues.
 */
export function useAudioPlayer() {
  const [activeId, _setActiveId] = useState<string | null>(null);
  const [isPlaying, _setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const setActiveId = (id: string | null) => {
    activeIdRef.current = id;
    _setActiveId(id);
  };
  const setIsPlaying = (v: boolean) => {
    isPlayingRef.current = v;
    _setIsPlaying(v);
  };

  const unload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        /* already unloaded */
      }
      soundRef.current = null;
    }
    setActiveId(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false
    }).catch(() => {});
    return () => {
      void unload();
    };
  }, [unload]);

  const togglePlay = useCallback(
    async (itemId: string, previewUrl?: string) => {
      if (activeIdRef.current === itemId && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        }
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      }

      await unload();
      if (!previewUrl) return;

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: previewUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 250 },
          (status) => {
            if (!status.isLoaded) return;
            const dur = status.durationMillis ?? 1;
            setProgress(dur > 0 ? status.positionMillis / dur : 0);
            if (status.didJustFinish) {
              soundRef.current = null;
              setActiveId(null);
              setIsPlaying(false);
              setProgress(0);
              sound.unloadAsync().catch(() => {});
            }
          }
        );
        soundRef.current = sound;
        setActiveId(itemId);
        setIsPlaying(true);
      } catch (err) {
        console.warn("[useAudioPlayer] playback failed:", err);
        await unload();
      }
    },
    [unload]
  );

  return { activeId, isPlaying, progress, togglePlay };
}
