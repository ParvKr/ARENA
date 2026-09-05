'use client';

import { useEffect, useRef, useState } from 'react';

import { playSound } from '@/lib/sound';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Whole seconds remaining, rounded up so the timer never closes early. */
  total: number;
  phase: 'default' | 'warning' | 'urgent' | 'critical' | 'closed';
}

export interface CountdownConfig {
  targetDate: string | null | undefined;
  /** Difference in milliseconds between server time and the browser clock. */
  serverOffset?: number;
  /** Use animation frames for the final ten seconds. */
  enableRafCritical?: boolean;
}

const CLOSED_STATE: CountdownState = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, phase: 'closed' };
const SECOND = 1_000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RAF_WINDOW_SECONDS = 10;

function getPhase(total: number): CountdownState['phase'] {
  if (total <= 0) return 'closed';
  if (total <= 10 * MINUTE) return 'critical';
  if (total <= HOUR) return 'urgent';
  if (total <= 6 * HOUR) return 'warning';
  return 'default';
}

function toCountdownState(remainingMilliseconds: number): CountdownState {
  const total = Math.max(0, Math.ceil(remainingMilliseconds / SECOND));

  return {
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: total % MINUTE,
    total,
    phase: getPhase(total),
  };
}

function statesMatch(a: CountdownState, b: CountdownState): boolean {
  return a.days === b.days && a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds && a.total === b.total && a.phase === b.phase;
}

/** Recalculates from the deadline on every update, preventing timer drift. */
export function useCountdown({ targetDate, serverOffset = 0, enableRafCritical = false }: CountdownConfig): CountdownState {
  const [state, setState] = useState<CountdownState>(CLOSED_STATE);
  const previousTotalRef = useRef<number | null>(null);

  useEffect(() => {
    const targetTime = targetDate ? new Date(targetDate).getTime() : Number.NaN;
    const offset = Number.isFinite(serverOffset) ? serverOffset : 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let frameId: number | undefined;
    let disposed = false;

    // A new deadline is a new countdown, not a continuation of the old one.
    previousTotalRef.current = null;

    const cancelScheduledUpdate = () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      timeoutId = undefined;
      frameId = undefined;
    };

    const commit = (next: CountdownState) => {
      setState((current) => (statesMatch(current, next) ? current : next));
    };

    if (!Number.isFinite(targetTime)) {
      previousTotalRef.current = null;
      commit(CLOSED_STATE);
      return cancelScheduledUpdate;
    }

    const update = () => {
      const next = toCountdownState(targetTime - (Date.now() + offset));
      const previousTotal = previousTotalRef.current;

      if (enableRafCritical && previousTotal !== null && next.total < previousTotal && next.total > 0 && next.total <= RAF_WINDOW_SECONDS) {
        playSound('tick');
      }

      previousTotalRef.current = next.total;
      commit(next);
    };

    const schedule = () => {
      if (disposed || document.hidden) return;

      cancelScheduledUpdate();
      const remainingMilliseconds = targetTime - (Date.now() + offset);

      if (remainingMilliseconds <= 0) {
        update();
        return;
      }

      const next = toCountdownState(remainingMilliseconds);
      if (enableRafCritical && next.total <= RAF_WINDOW_SECONDS) {
        frameId = requestAnimationFrame(() => {
          update();
          schedule();
        });
        return;
      }

      // The value changes at the deadline's next whole-second boundary.
      const delay = Math.max(16, remainingMilliseconds % SECOND || SECOND);
      timeoutId = setTimeout(() => {
        update();
        schedule();
      }, delay);
    };

    const refresh = () => {
      if (disposed || document.hidden) return;
      update();
      schedule();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelScheduledUpdate();
        previousTotalRef.current = null;
      } else {
        refresh();
      }
    };

    refresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      cancelScheduledUpdate();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableRafCritical, serverOffset, targetDate]);

  return state;
}
