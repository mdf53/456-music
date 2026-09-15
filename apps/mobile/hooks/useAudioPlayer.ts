import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus
} from "expo-audio";
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

  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);
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

  const unload = useCallback(() => {
    statusSubRef.current?.remove();
    statusSubRef.current = null;
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.release();
      } catch {
        /* already released */
      }
      playerRef.current = null;
    }
    setActiveId(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false
    }).catch(() => {});
    return () => {
      unload();
    };
  }, [unload]);

  const togglePlay = useCallback(
    (itemId: string, previewUrl?: string) => {
      if (activeIdRef.current === itemId && playerRef.current) {
        const player = playerRef.current;
        if (player.playing) {
          player.pause();
          setIsPlaying(false);
          return;
        }
        // Replay from start if the preview already finished.
        if (player.currentTime > 0 && player.duration > 0 && player.currentTime >= player.duration - 0.05) {
          void player.seekTo(0).then(() => player.play());
        } else {
          player.play();
        }
        setIsPlaying(true);
        return;
      }

      unload();
      if (!previewUrl) return;

      try {
        const player = createAudioPlayer(
          { uri: previewUrl },
          { updateInterval: 250 }
        );
        statusSubRef.current = player.addListener(
          "playbackStatusUpdate",
          (status: AudioStatus) => {
            const dur = status.duration ?? 0;
            setProgress(dur > 0 ? status.currentTime / dur : 0);
            if (status.didJustFinish) {
              statusSubRef.current?.remove();
              statusSubRef.current = null;
              try {
                player.release();
              } catch {
                /* already released */
              }
              if (playerRef.current === player) {
                playerRef.current = null;
              }
              setActiveId(null);
              setIsPlaying(false);
              setProgress(0);
            }
          }
        );
        playerRef.current = player;
        player.play();
        setActiveId(itemId);
        setIsPlaying(true);
      } catch (err) {
        console.warn("[useAudioPlayer] playback failed:", err);
        unload();
      }
    },
    [unload]
  );

  return { activeId, isPlaying, progress, togglePlay };
}
