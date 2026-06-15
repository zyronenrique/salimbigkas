import { useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useMusic } from './musicPlayer';

interface UseStepAudioProps {
    visible: boolean;
    currentStepNumber: number | undefined;
    audioSources: Record<string, any>;
    keyPrefix: 'quizStep' | 'bigkasStep';
}

export const useStepAudio = ({
    visible,
    currentStepNumber,
    audioSources,
    keyPrefix,
}: UseStepAudioProps) => {
    const { duck, unduck } = useMusic();
    const stepAudioPlayer = useAudioPlayer(null);
    const previousStepRef = useRef<number | null>(null);
    const stepAudioStatus = useAudioPlayerStatus(stepAudioPlayer);

    // Handle step changes
    useEffect(() => {
        if (!visible) {
            stepAudioPlayer.pause();
            stepAudioPlayer.seekTo(0);
            unduck();
            previousStepRef.current = null;
            return;
        }

        if (currentStepNumber === previousStepRef.current) return;
        previousStepRef.current = currentStepNumber || null;

        const key = `${keyPrefix}${currentStepNumber}` as keyof typeof audioSources;
        const src = audioSources[key];

        if (typeof currentStepNumber === "number" && src) {
            duck();
            stepAudioPlayer.replace(src);
            stepAudioPlayer.play();
        } else {
            unduck();
        }
    }, [visible, currentStepNumber, stepAudioPlayer, duck, unduck, audioSources, keyPrefix]);

    // Monitor playback status
    useEffect(() => {
        if (!visible) return;
        if (stepAudioStatus.isLoaded && !stepAudioStatus.playing && stepAudioStatus.currentTime > 0) {
            unduck();
        }
    }, [stepAudioStatus.playing, stepAudioStatus.isLoaded, stepAudioStatus.currentTime, visible, unduck]);

    // Cleanup
    useEffect(() => {
        return () => {
            try {
                stepAudioPlayer.pause();
            } catch {}
            unduck();
        };
    }, [stepAudioPlayer, unduck]);

    return { stepAudioPlayer, stepAudioStatus };
};