import { usePathname, useSegments } from 'expo-router';
import { useMusic } from '@/hooks/musicPlayer';
import { useEffect, useMemo } from 'react';

// Centralized tracks
const TRACKS = {
  lobby: require('@/assets/background music/lobbyBgMusic.mp3'),
  lesson: require('@/assets/background music/lessonBgMusic.mp3'),
  quiz: require('@/assets/background music/quiztimer.mp3'),
} as const;

// Ordered rules: first match wins
const pickTrack = (pathname: string | null, seg0?: string) => {
    const p = pathname || '';
    const rules: Array<{ test: () => boolean; track: number | null }> = [
        { test: () => /^\/lessons\/lesson/.test(p), track: TRACKS.lesson },
        { test: () => /^\/TakeSeatworkQuiz/.test(p), track: TRACKS.quiz },
        { test: () => /^\/bigkas\/playBigkas/.test(p), track: null },
        { test: () => p === '/' || p === '/index', track: TRACKS.lobby },
        { test: () => seg0 === '(tabs)', track: TRACKS.lobby },
        { test: () => true, track: TRACKS.lobby },
    ];
    return rules.find(r => r.test())!.track;
};

const AppMusicController = () => {
    const segments = useSegments();
    const pathname = usePathname();
    const { setTrack, stop } = useMusic();
    const track = useMemo(
        () => pickTrack(pathname, segments[0]),
        [pathname, segments]
    );
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            if (track) {
                await setTrack(track, { loop: true, fadeInMs: 300, fadeOutMs: 200, delayMs: 0 });
            } else {
                await stop(150);
            }
        })();
        return () => { mounted = false; };
    }, [track, setTrack, stop]);
    return null;
};

export default AppMusicController;
