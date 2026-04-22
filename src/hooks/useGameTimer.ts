import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const TICK_INTERVAL_MS = 100;

/**
 * useGameTimer — drives tickClock and tickRestMinute via setInterval.
 * Uses Date.now() wall-clock deltas so the timer stays accurate even
 * when the window is hidden or in the background.
 */
export function useGameTimer() {
  const tickClock = useGameStore((s) => s.tickClock);
  const tickRestMinute = useGameStore((s) => s.tickRestMinute);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const restMinute = useGameStore((s) => s.restMinute);

  const lastTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const active = clockRunning || restMinute !== null;

    if (!active) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    lastTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        if (clockRunning) tickClock(delta);
        if (restMinute !== null) tickRestMinute(delta);
      }
      lastTimeRef.current = now;
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [clockRunning, restMinute, tickClock, tickRestMinute]);
}
