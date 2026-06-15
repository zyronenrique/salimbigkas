import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useMusic } from "./musicPlayer";

export type AudioJob =
    | { type: "letter"; letter: string }
    | { type: "tts"; text: string; speed: number };

export type CreateAudioForJob = (
    job: AudioJob
) => Promise<string | number | { uri: string } | null>;

export const useAudioQueue = (CreateAudioForJob: CreateAudioForJob) => {
    const [queue, setQueue] = useState<AudioJob[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [source, setSource] = useState<string | number | { uri: string } | null>(null);
    const player = useAudioPlayer(source as any, 500);
    const status = useAudioPlayerStatus(player);

    const seqRef = useRef(0); // cancels in-flight job loads
    const hasStartedRef = useRef(false);

    const { duck, unduck } = useMusic();
    useEffect(() => {
        if (isPlaying && !isPaused) {
            duck();
        } else {
            unduck();
        }
        return () => {
            unduck();
        };
    }, [isPlaying, isPaused, duck, unduck]);

    // Auto-play whenever a loaded source is present and we’re playing
    useEffect(() => {
        if (!isPlaying || isPaused) return;
        if (!source) return;
        if (status.isLoaded) {
            try { player.play(); } catch {}
        }
    }, [source, status.isLoaded, isPlaying, isPaused, player]);

    // Mark when playback actually starts, to ignore stale didJustFinish from previous player
    useEffect(() => {
        if (!isPlaying) return;
        if (!source) return;
        if (status?.playing) {
            hasStartedRef.current = true;
        }
    }, [status?.playing, isPlaying, source]);

    // Prepare/play current job (skip null sources)
    useEffect(() => {
        if (!isPlaying) return;
        if (index < 0 || index >= queue.length) return;

        const mySeq = ++seqRef.current;
        let cancelled = false;

        (async () => {
            // Prepare all jobs in parallel
            const jobs = queue.slice(index);
            const results = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        return await CreateAudioForJob(job);
                    } catch {
                        return null;
                    }
                })
            );
            // Find the first playable source
            const foundIdx = results.findIndex(src => !!src);
            if (cancelled || seqRef.current !== mySeq || !isPlaying) return;

            if (foundIdx !== -1) {
                const j = index + foundIdx;
                const src = results[foundIdx];
                if (j !== index) setIndex(j); // reflect skipped items
                hasStartedRef.current = false; // reset; will flip true when player actually starts
                setSource(src);
                setIsPaused(false);
                return;
            }
            stop(); // Nothing playable left
        })();

        return () => { cancelled = true; };
    }, [index, queue, isPlaying, CreateAudioForJob]); // stop is stable below

    // Advance when current finishes
    useEffect(() => {
        if (!isPlaying || !source || !hasStartedRef.current || !status?.didJustFinish) return;
        setIndex(prev => {
            const next = prev + 1;
            if (next >= queue.length) {
                stop(); // end of queue
                return prev;
            }
            return next;
        });
    }, [status?.didJustFinish, isPlaying, source, queue.length]);

    const stop = useCallback(() => {
        return new Promise<void>((resolve) => {
            seqRef.current += 1;
            hasStartedRef.current = false;
            try {
                if (status.isLoaded) player.remove();
            } catch {}
            setSource(null);
            setQueue([]);
            setIndex(-1);
            setIsPlaying(false);
            setIsPaused(false);
            resolve();
        });
    }, [player, status.isLoaded]);

    const playQueue = useCallback(async (jobs: AudioJob[]) => {
        await stop(); // hard reset to avoid races
        if (!jobs || jobs.length === 0) return;

        hasStartedRef.current = false;
        setQueue(jobs);
        setIndex(0);
        setIsPlaying(true);
        setIsPaused(false);
    }, [stop]);

    const pause = useCallback(() => {
        try { player.pause(); } catch {}
        setIsPaused(true);
    }, [player]);

    const resume = useCallback(() => {
        try { player.play(); } catch {}
        setIsPaused(false);
    }, [player]);

    return {
        playQueue,
        pause,
        resume,
        stop,
        isPlaying,
        isPaused,
        currentIndex: index >= 0 ? index : null,
        total: queue.length,
    };
};

export default useAudioQueue;
