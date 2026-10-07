// components/sprint/SubmitPanel.tsx
// The one action for the current state of the sprint.
'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Profile, Sprint } from '@/types/api.types'
import type { SprintSubmission } from '@/hooks/useSprint'
import type { SprintPhase } from './useSprintPhase'

const primary =
  'group flex w-full items-center justify-center gap-2 rounded-full bg-signal px-6 py-4 font-display text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-void'
const outline =
  'group flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-4 font-display text-base font-bold text-chalk transition-colors hover:border-chalk hover:bg-white/10'

function Arrow() {
  return <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
}

interface SubmitPanelProps {
  sprint: Sprint
  phase: SprintPhase
  user: Profile | null
  existingSubmission: SprintSubmission | null | undefined
}

export function SubmitPanel({ sprint, phase, user, existingSubmission }: SubmitPanelProps) {
  const hasSubmitted = !!existingSubmission

  if (phase === 'draft') {
    return (
      <p className="rounded-full border border-white/20 px-6 py-4 text-center font-display text-sm font-semibold text-white/60">
        Internal review. Draft only.
      </p>
    )
  }

  if (phase !== 'open') {
    return (
      <div className="space-y-3">
        {hasSubmitted && <p className="text-center text-sm text-smoke">Your entry is in.</p>}
        <Link href="/results" className={phase === 'complete' ? primary : outline}>
          See the results <Arrow />
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <Link href="/signup" className={primary}>
          Sign up to compete <Arrow />
        </Link>
        <p className="text-center text-sm text-smoke">You need a free account to submit.</p>
      </div>
    )
  }

  return (
    <Link href={`/sprint/submit?id=${sprint.id}`} className={hasSubmitted ? outline : primary}>
      {hasSubmitted ? 'Update your submission' : 'Submit entry'} <Arrow />
    </Link>
  )
}
