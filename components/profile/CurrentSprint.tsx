// components/profile/CurrentSprint.tsx
// Owner only: where the competitor stands in the sprint that is running now. Real data, real state.
'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useCurrentSprint, useMySubmission } from '@/hooks/useSprint'
import { useSprintPhase } from '@/components/sprint/useSprintPhase'
import type { Sprint } from '@/types/api.types'

function Strip({ sprint, entered }: { sprint: Sprint; entered: boolean }) {
  const phase = useSprintPhase(sprint)
  const open = phase === 'open'
  const label = open
    ? entered
      ? 'Entered. Your work is in.'
      : 'Open now. You have not entered yet.'
    : phase === 'draft'
      ? 'Not open yet.'
      : entered
        ? 'Closed. Your entry is in and waiting on the judges.'
        : 'Closed. Entries are in and waiting on the judges.'

  return (
    <Link
      href="/sprint"
      className="group flex flex-col gap-4 border border-white/20 p-5 transition-colors duration-200 hover:border-signal sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
          {open && <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-signal" />}
          Sprint {String(sprint.sprint_number).padStart(3, '0')}
        </p>
        <p className="mt-2 truncate font-display text-xl font-bold sm:text-2xl">{sprint.title}</p>
        <p className="mt-1 text-sm text-white/75">{label}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 font-display text-sm font-bold text-chalk transition-colors group-hover:text-signal">
        {open && !entered ? 'Enter now' : 'Open sprint'}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function CurrentSprint() {
  const { sprint } = useCurrentSprint()
  const { submission } = useMySubmission(sprint?.id)
  // Nothing running, or still loading: render nothing rather than a placeholder.
  if (!sprint) return null
  return <Strip sprint={sprint} entered={!!submission} />
}
