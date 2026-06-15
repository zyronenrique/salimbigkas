import { useCallback, useEffect, useRef } from 'react';

interface UseTimerProps {
  timer: number;
  isActive: boolean;
  onTick: () => void;
  onTimeout: () => void;
}

const useTimer = ({ timer, isActive, onTick, onTimeout }: UseTimerProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(onTick);
  const onTimeoutRef = useRef(onTimeout);

  onTickRef.current = onTick;
  onTimeoutRef.current = onTimeout;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    clearTimer();
    if (!isActive) {
      return;
    }
    if (timer <= 0) {
      onTimeoutRef.current();
      return;
    }
    intervalRef.current = setInterval(() => {
      onTickRef.current();
    }, 1000);

    return clearTimer;
  }, [isActive, timer, clearTimer]);

  return { timer, clearTimer };
};

export default useTimer;
