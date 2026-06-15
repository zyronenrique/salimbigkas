import { useEffect, useRef } from "react";
import { doSetSaveLessonTimeSpent } from "../../api/functions";

interface UseLessonTimeTrackerParams {
  userId: string | undefined;
  yunitId: string;
  lessonId: string;
  gradeLevel?: string;
  saveInterval?: number; // Interval in ms to save time
}
/**
 * @param params.userId - Current user's UID
 * @param params.yunitId - Yunit ID
 * @param params.lessonId - Lesson ID
 * @param params.gradeLevel - Class grade
 * @param params.saveInterval - Interval in ms to save time (default: 60,000 ms)
 */

const useLessonTimeTracker = ({
  userId,
  yunitId,
  lessonId,
  gradeLevel,
  saveInterval = 60000,
}: UseLessonTimeTrackerParams) => {
  const startTimeRef = useRef<number | null>(null);
  const lastSavedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!userId || !yunitId || !lessonId) return;
    startTimeRef.current = Date.now();
    lastSavedRef.current = Date.now();
    const saveTime = async () => {
      if (!userId) return;
      const now = Date.now();
      const elapsed = Math.floor((now - lastSavedRef.current) / 1000); // seconds
      if (elapsed > 0) {
        try {
          const response = (await doSetSaveLessonTimeSpent(
            userId,
            yunitId,
            lessonId,
            gradeLevel,
            elapsed,
          )) as any;
          if (response?.success) {
            return;
          }
          lastSavedRef.current = now;
        } catch (e) {
          // Silently ignore error
        }
      }
    };
    intervalRef.current = setInterval(saveTime, saveInterval);
    const handleUnload = () => {
      saveTime();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      saveTime();
      window.removeEventListener("beforeunload", handleUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, yunitId, lessonId, saveInterval]);
};

export default useLessonTimeTracker;
