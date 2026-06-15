import { useRef, useState, useCallback } from "react";

export type AudioJob = 
  | { type: "letter"; letter: string }
  | { type: "tts"; text: string; speed: number };

// Provider that returns a ready-to-play HTMLAudioElement for a job
export type CreateAudioForJob = (job: AudioJob) => Promise<HTMLAudioElement | null>;

export function useAudioQueue(createAudioForJob: CreateAudioForJob) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [total, setTotal] = useState(0);

    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const seqRef = useRef(0); // run token

    const clearCurrentAudio = () => {
        const a = currentAudioRef.current;
        if (!a) return;
        a.onended = null;
        a.onerror = null;
        a.onpause = null;
        a.onplay = null;
        currentAudioRef.current = null;
    };

    const stop = useCallback(() => {
        seqRef.current += 1; // invalidate any running loop
        const a = currentAudioRef.current;
        if (a) {
            try { a.pause(); } catch {}
            try { a.currentTime = 0; } catch {}
        }
        clearCurrentAudio();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(null);
        setTotal(0);
    }, []);

    const playQueue = useCallback(async (jobs: AudioJob[]) => {
        // Start a new run
        stop();
        const mySeq = seqRef.current;
        setIsPlaying(true);
        setIsPaused(false);
        setTotal(jobs.length);
        setCurrentIndex(0);

        // Pre-create all audio elements in parallel
        const audios = (await Promise.all(
            jobs.map(async job => {
                try {
                    return await createAudioForJob(job);
                } catch {
                    return null;
                }
            })
        )).filter((audio): audio is HTMLAudioElement => !!audio);

        for (let i = 0; i < jobs.length; i++) {
            if (seqRef.current !== mySeq) break;
            setCurrentIndex(i);

            const audio = audios[i];

            clearCurrentAudio();
            currentAudioRef.current = audio;

            await new Promise<void>((resolve) => {
                const onEnded = () => { cleanup(); resolve(); };
                const onError = () => { cleanup(); resolve(); };
                const onPause = () => setIsPaused(true);
                const onPlay = () => setIsPaused(false);

                const cleanup = () => {
                    if (audio) {
                        audio.onended = null;
                        audio.onerror = null;
                        audio.onpause = null;
                        audio.onplay = null;
                    }
                };

                audio.onended = onEnded;
                audio.onerror = onError;
                audio.onpause = onPause;
                audio.onplay = onPlay;

                // Try to play (user gesture should already exist)
                audio.play().catch(() => resolve());
            });

            if (seqRef.current !== mySeq) break;
        }

        if (seqRef.current === mySeq) {
            clearCurrentAudio();
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentIndex(null);
            setTotal(0);
        }
    }, [createAudioForJob, stop]);

    const pause = useCallback(() => {
        const a = currentAudioRef.current;
        if (!a) return;
        try { a.pause(); } catch {}
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        const a = currentAudioRef.current;
        if (!a) return;
        if (a.paused) {
            a.play().catch(() => {});
            setIsPaused(false);
        }
    }, []);

  return { playQueue, pause, resume, stop, isPlaying, isPaused, currentIndex, total };
}