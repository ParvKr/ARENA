// components/sprint/StatusStamp.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { SprintPhase } from './useSprintPhase'

const STAMPS: Record<SprintPhase, { label: string; cls: string }> = {
  open: { label: 'Live', cls: 'border-signal text-signal' },
  closed: { label: 'Closed', cls: 'border-white/60 text-white/80' },
  judging: { label: 'Judging', cls: 'border-chalk text-chalk' },
  complete: { label: 'Done', cls: 'border-white/60 text-white/80' },
  draft: { label: 'Draft', cls: 'border-white/40 text-white/60' },
}

export function StatusStamp({ phase }: { phase: SprintPhase }) {
  const reduce = useReducedMotion() ?? false
  const { label, cls } = STAMPS[phase]
  return (
    <motion.span
      role="status"
      aria-label={`Sprint status: ${label}`}
      initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -22 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ type: 'spring', stiffness: 360, damping: 17, delay: 0.5 }}
      className={`inline-flex items-center gap-2 rounded-md border-4 px-4 py-1 font-poster text-3xl uppercase leading-none sm:text-4xl ${cls}`}
    >
      {phase === 'open' && <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-signal" />}
      {label}
    </motion.span>
  )
}
