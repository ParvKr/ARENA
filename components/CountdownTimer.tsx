// components/ui/CountdownTimer.tsx
// High-precision countdown display component protected against initial mount hydration state flashes.
'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean; // true = nav bar mode (smaller)
}

const PHASE_STYLES = {
  default: 'text-arena-offwhite',
  warning: 'text-arena-gold',
  urgent: 'text-arena-gold animate-pulse',
  critical: 'text-arena-red animate-pulse',
  closed: 'text-arena-gray',
};

export function CountdownTimer({
  targetDate,
  compact = false,
}: CountdownTimerProps) {
  const {
    days,
    hours,
    minutes,
    seconds,
    phase,
    total,
  } = useCountdown({
    targetDate,
    enableRafCritical: true,
  });

  // Logical Fix: Block layout flash during async initialization if targetDate has bytes but timer hasn't ticked yet
  const isInitializing = targetDate && total === 0 && phase === 'closed';

  if (phase === 'closed' && !isInitializing) {
    return (
      <span
        className={cn(
          'font-mono font-medium text-arena-gray',
          compact ? 'text-sm' : 'text-2xl'
        )}
      >
        CLOSED
      </span>
    );
  }

  const phaseClass = PHASE_STYLES[phase] || PHASE_STYLES.default;
  const sizeClass = compact ? 'text-sm' : 'text-4xl';

  return (
    <div
      className={cn(
        'font-mono font-bold tabular-nums flex items-center gap-1 transition-opacity duration-200',
        isInitializing ? 'opacity-0' : 'opacity-100', // Gracefully clip layout flickers on mounting sweeps
        phaseClass,
        sizeClass
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`}
    >
      {days > 0 && (
        <>
          <Segment value={days} label="d" />
          <Colon />
        </>
      )}

      <Segment value={hours} label="h" />
      <Colon />

      <Segment value={minutes} label="m" />
      <Colon />

      <Segment value={seconds} label="s" />
    </div>
  );
}

function Segment({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <span className="tabular-nums">
      {String(value).padStart(2, '0')}
      <span className="text-[0.5em] opacity-50 ml-0.5">
        {label}
      </span>
    </span>
  );
}

function Colon() {
  return (
    <span className="animate-colon-blink opacity-70 mx-0.5">
      :
    </span>
  );
}