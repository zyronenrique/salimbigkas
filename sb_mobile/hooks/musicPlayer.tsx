import React, { createContext, useCallback, useEffect, useContext, useMemo, useRef, ReactNode } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

type MusicSource = number | string | { uri: string };

type SetTrackOptions = {
  loop?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
  delayMs?: number;
};

type MusicContextValue = {
  setTrack: (src: MusicSource | null, opts?: SetTrackOptions) => Promise<void>;
  stop: (fadeOutMs?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentSource: MusicSource | null;
  duck: () => void;
  unduck: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

const normalizeSource = (s: MusicSource | null) => {
  if (s == null) return "null";
  if (typeof s === "number") return `asset:${s}`;
  if (typeof s === "string") return s;
  if (typeof (s as any).uri === "string") return (s as any).uri;
  return JSON.stringify(s);
};

const DUCK_VOLUME = 0.2;
const NORMAL_VOLUME = 1.0;

function useFade() {
  const rafRef = useRef<number | null>(null);
  const opRef = useRef(0);

  const cancel = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const fadeVolume = useCallback(
    async (get: () => number, set: (v: number) => void, to: number, durationMs: number, opIdAtStart: number) => {
      cancel();
      if (durationMs <= 0) {
        set(to);
        return;
      }
      const from = get();
      const start = performance.now();
      return new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (opRef.current !== opIdAtStart) return resolve();
          const t = Math.min(1, (now - start) / durationMs);
          set(from + (to - from) * t);
          if (t < 1) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            rafRef.current = null;
            resolve();
          }
        };
        rafRef.current = requestAnimationFrame(step);
      });
    },
    []
  );

  return { fadeVolume, opRef, cancel };
}

export function MusicProvider({ children }: { children: ReactNode }) {
  // Two players for seamless crossfades
  const a = useAudioPlayer();
  const b = useAudioPlayer();
  const statusA = useAudioPlayerStatus(a);
  const statusB = useAudioPlayerStatus(b);

  const { fadeVolume, opRef } = useFade();

  const currentIdxRef = useRef<0 | 1>(0);
  const currentSrcRef = useRef<MusicSource | null>(null);
  const keyByIdxRef = useRef<[string, string]>(["null", "null"]);
  const volsRef = useRef<[number, number]>([NORMAL_VOLUME, NORMAL_VOLUME]);
  const isDuckedRef = useRef(false);
  const normalVolumeRef = useRef(NORMAL_VOLUME);

  const getPlayer = (i: 0 | 1) => (i === 0 ? a : b);
  const getOther = (i: 0 | 1): 0 | 1 => (i === 0 ? 1 : 0);

  const setVol = (i: 0 | 1, v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    try {
      getPlayer(i).volume = clamped;
    } catch {}
    volsRef.current[i] = clamped;
  };
  const getVol = (i: 0 | 1) => volsRef.current[i];

  const duck = useCallback(() => {
    if (isDuckedRef.current) return;
    isDuckedRef.current = true;
    normalVolumeRef.current = NORMAL_VOLUME;
    setVol(0, getVol(0) * DUCK_VOLUME);
    setVol(1, getVol(1) * DUCK_VOLUME);
  }, []);

  const unduck = useCallback(() => {
    if (!isDuckedRef.current) return;
    isDuckedRef.current = false;
    const target = normalVolumeRef.current;
    setVol(0, target);
    setVol(1, target);
  }, []);

  const stop = useCallback(
    async (fadeOutMs: number = 300) => {
      const opId = ++opRef.current;
      const cur = currentIdxRef.current;
      await fadeVolume(() => getVol(cur), (v) => setVol(cur, v), 0, fadeOutMs, opId);
      try { getPlayer(cur).pause(); } catch {}
      try { getPlayer(cur).seekTo(0); } catch {}
      keyByIdxRef.current[cur] = "null";
      currentSrcRef.current = null;
    },
    [fadeVolume, opRef]
  );

  const pause = useCallback(() => {
    try { getPlayer(0).pause(); } catch {}
    try { getPlayer(1).pause(); } catch {}
  }, []);

  const resume = useCallback(() => {
    try { getPlayer(currentIdxRef.current).play(); } catch {}
  }, []);

  const setTrack = useCallback(
    async (src: MusicSource | null, opts?: SetTrackOptions) => {
      const { loop = true, fadeInMs = 300, fadeOutMs = 200, delayMs = 0 } = opts || {};
      const opId = ++opRef.current;

      if (!src) {
        await stop(fadeOutMs);
        return;
      }

      const nextKey = normalizeSource(src);
      const cur = currentIdxRef.current;
      const curKey = keyByIdxRef.current[cur];
      const next = getOther(cur);

      // If same track as current, ensure it's playing and looped
      if (nextKey === curKey) {
        try {
          getPlayer(cur).loop = loop;
          getPlayer(cur).play();
        } catch {}
        return;
      }

      try {
        // Prepare next player
        try { getPlayer(next).loop = loop; } catch {}
        setVol(next, 0);
        getPlayer(next).replace(src as any);
        keyByIdxRef.current[next] = nextKey;

        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
          if (opRef.current !== opId) return;
        }

        normalVolumeRef.current = NORMAL_VOLUME;
        const targetVol = isDuckedRef.current ? DUCK_VOLUME : NORMAL_VOLUME;

        // Start next, crossfade both
        try { getPlayer(next).play(); } catch {}

        await Promise.all([
          fadeVolume(() => getVol(cur), (v) => setVol(cur, v), 0, fadeOutMs, opId),
          fadeVolume(() => getVol(next), (v) => setVol(next, v), targetVol, fadeInMs, opId),
        ]);

        if (opRef.current !== opId) return;

        // Stop old and swap
        try { getPlayer(cur).pause(); } catch {}
        try { getPlayer(cur).seekTo(0); } catch {}
        keyByIdxRef.current[cur] = "null";

        currentIdxRef.current = next;
        currentSrcRef.current = src;
      } catch (e) {
        console.warn("Error during crossfade setTrack:", e);
      }
    },
    [fadeVolume, opRef, stop]
  );

  const status = currentIdxRef.current === 0 ? statusA : statusB;

  const value = useMemo<MusicContextValue>(() => ({
    setTrack,
    stop,
    pause,
    resume,
    duck,
    unduck,
    isPlaying: !!status.playing,
    isPaused: status.isLoaded && !status.playing,
    currentSource: currentSrcRef.current,
  }), [setTrack, stop, pause, resume, duck, unduck, status]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within a MusicProvider");
  return ctx;
}

export function ScreenMusic({
  source,
  play = true,
  loop = true,
  fadeInMs = 300,
  fadeOutMs = 200,
  delayMs = 0,
  stopOnUnmount = false,
}: {
  source: MusicSource | null;
  play?: boolean;
  loop?: boolean;
  fadeInMs?: number;
  fadeOutMs?: number;
  delayMs?: number;
  stopOnUnmount?: boolean;
}) {
  const { setTrack, stop } = useMusic();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      if (play) {
        await setTrack(source, { loop, fadeInMs, fadeOutMs, delayMs });
      } else {
        await stop(fadeOutMs);
      }
    })();
    return () => {
      mounted = false;
      if (stopOnUnmount) stop(fadeOutMs);
    };
  }, [play, source, loop, fadeInMs, fadeOutMs, delayMs, stopOnUnmount, setTrack, stop]);

  return null;
}