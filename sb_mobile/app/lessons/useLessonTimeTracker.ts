import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { doSetSaveLessonTimeSpent } from "@/api/functions";

interface UseLessonTimeTrackerParams {
    userId: string | undefined;
    yunitId: string;
    lessonId: string;
    gradeLevel?: string;
    saveInterval?: number; // Interval in ms to save time
}

const useLessonTimeTracker = ({
    userId,
    yunitId,
    lessonId,
    gradeLevel,
    saveInterval = 60000,
}: UseLessonTimeTrackerParams) => {
    const lastSavedRef = useRef<number>(Date.now());
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!userId || !yunitId || !lessonId) return;

        const saveTime = async () => {
            if (!userId) return;
            const now = Date.now();
            const elapsed = Math.floor((now - lastSavedRef.current) / 1000); // seconds
            if (elapsed > 0) {
                try {
                    const response = await doSetSaveLessonTimeSpent(
                        userId,
                        yunitId,
                        lessonId,
                        gradeLevel,
                        elapsed,
                    ) as any;
                    if (response?.success) {
                        lastSavedRef.current = now;
                    }
                } catch (e) {
                    // Silently ignore error
                }
            }
        };

        intervalRef.current = setInterval(saveTime, saveInterval);

        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState !== "active") {
                saveTime();
            }
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            saveTime();
            subscription.remove();
        };
    }, [userId, yunitId, lessonId, saveInterval, gradeLevel]);
};

export default useLessonTimeTracker;