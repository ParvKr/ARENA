// components/sprint/useSprintPhase.ts
// What the sprint really is right now. The database status can say "live" after the close
// date has passed, so the UI derives its state from both.
'use client'

import { useState } from 'react'
import type { Sprint } from '@/types/api.types'

export type SprintPhase = 'open' | 'closed' | 'judging' | 'complete' | 'draft'

export function useSprintPhase(sprint: Sprint): SprintPhase {
  // Captured once when the sprint appears (it loads client-side, so this never runs during SSR).
  const [mountedAt] = useState(() => Date.now())
  if (sprint.sprint_status === 'judging') return 'judging'
  if (sprint.sprint_status === 'complete') return 'complete'
  if (sprint.sprint_status === 'draft') return 'draft'
  const closes = sprint.close_at ? new Date(sprint.close_at).getTime() : Infinity
  return closes > mountedAt ? 'open' : 'closed'
}
