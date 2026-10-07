// components/sprint/Clock.tsx
// Big countdown while the sprint is open; "closed on <date>" once it isn't.
'use client'

import { useCountdown } from '@/hooks/useCountdown'
import type { SprintPhase } from './useSprintPhase'

const pad = (n: number) => String(n).padStart(2, '0')

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-poster text-5xl tabular-nums leading-none sm:text-6xl">{pad(value)}</div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-smoke">{label}</div>
    </div>
  )
}

function LiveClock({ closeAt }: { closeAt: string }) {
  const c = useCountdown({ targetDate: closeAt })
  const hot = c.phase === 'urgent' || c.phase === 'critical'
  return (
    <div
      role="timer"
      aria-label={`Time remaining: ${c.days} days ${c.hours} hours ${c.minutes} minutes ${c.seconds} seconds`}
      // useCountdown starts at zero for one tick; stay invisible until it has real time.
      className={`flex items-start justify-between gap-2 transition-opacity duration-300 ${
        c.total > 0 ? 'opacity-100' : 'opacity-0'
      } ${hot ? 'text-signal' : 'text-chalk'}`}
    >
      <Unit value={c.days} label="days" />
      <Unit value={c.hours} label="hrs" />
      <Unit value={c.minutes} label="min" />
      <Unit value={c.seconds} label="sec" />
    </div>
  )
}

export function Clock({ closeAt, phase }: { closeAt: string | null; phase: SprintPhase }) {
  if (phase === 'open' && closeAt) {
    return (
      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">Closes in</p>
        <LiveClock closeAt={closeAt} />
      </div>
    )
  }

  const when = closeAt
    ? new Date(closeAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null
  const heading =
    phase === 'judging' ? 'Judging in progress' : phase === 'draft' ? 'Not open yet' : 'Submissions closed'

  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke">Status</p>
      <p className="font-poster text-4xl uppercase leading-none">{heading}</p>
      {when && phase !== 'draft' && <p className="mt-2 font-mono text-sm text-smoke">Closed {when}</p>}
    </div>
  )
}
