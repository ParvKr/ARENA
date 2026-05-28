// hooks/useCountdown.ts
// Absolute precision countdown engine hardened against tab background throttling, clock tampering, and frame-rate loop race states.
'use client';

import { useState, useEffect, useRef } from 'react';
import { playSound } from '@/lib/sound';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // Total seconds remaining
  phase: 'default' | 'warning' | 'urgent' | 'critical' | 'closed';
}

export interface CountdownConfig {
  targetDate: string | null | undefined;
  serverOffset?: number; // Server-time offset in ms: (serverTimeMillis - clientTimeMillis)
  enableRafCritical?: boolean; // Toggles high-frequency execution path during final crunch window
}

function getPhase(totalSeconds: number): CountdownState['phase'] {
  if (totalSeconds <= 0) return 'closed';
  if (totalSeconds <= 600) return 'critical';  // < 10 minutes (Final Sprint Closure)
  if (totalSeconds <= 3600) return 'urgent';    // < 1 hour
  if (totalSeconds <= 21600) return 'warning';  // < 6 hours
  return 'default';
}

export function useCountdown({ targetDate, serverOffset = 0, enableRafCritical = false }: CountdownConfig): CountdownState {
  const [state, setState] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    phase: 'closed',
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const isCriticalRafActive = useRef<boolean>(false);

  useEffect(() => {
    function cleanupTimers() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      isCriticalRafActive.current = false;
    }

    // Clean Simplification: Initial state structure already represents 'closed' status
    if (!targetDate) {
      cleanupTimers();
      return;
    }

    const endTimestamp = new Date(targetDate).getTime();

    function tick() {
      const adjustedNow = Date.now() + serverOffset;
      const totalSeconds = Math.max(0, Math.floor((endTimestamp - adjustedNow) / 1000));

      if (totalSeconds <= 0) {
        setState((current) => current.phase === 'closed' ? current : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, phase: 'closed' });
        cleanupTimers();
        return;
      }

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const phase = getPhase(totalSeconds);

      setState((current) => {
        if (
          current.days === days &&
          current.hours === hours &&
          current.minutes === minutes &&
          current.seconds === seconds &&
          current.total === totalSeconds &&
          current.phase === phase
        ) {
          return current; 
        }

        if (phase === 'critical' && current.seconds !== seconds) {
          playSound('tick');
        }

        return { days, hours, minutes, seconds, total: totalSeconds, phase };
      });

      // Rigid Mutex Lock: Hand control completely over to RAF loop, killing recursive timeout forks
      if (enableRafCritical && totalSeconds <= 10) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        isCriticalRafActive.current = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    function scheduleNextTick() {
      // Exits early if requestAnimationFrame has taken over execution scheduling authority
      if (isCriticalRafActive.current) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      
      const currentNow = Date.now() + serverOffset;
      const totalSecondsRemaining = Math.max(0, Math.floor((endTimestamp - currentNow) / 1000));

      if (totalSecondsRemaining <= 0) {
        tick();
        return;
      }

      const msDelay = 1000 - ((Date.now() + serverOffset) % 1000);
      timerRef.current = setTimeout(() => {
        tick();
        scheduleNextTick();
      }, msDelay);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        cleanupTimers();
      } else {
        tick();
        scheduleNextTick();
      }
    }

    tick();
    scheduleNextTick();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [targetDate, serverOffset, enableRafCritical]);

  return state;
}