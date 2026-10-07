// components/hero/HeroDock.tsx
// Floating pill with the live sprint state and the two entry points.
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { CountdownTimer } from '@/components/CountdownTimer'
import type { Sprint } from '@/types/api.types'
import { Magnetic } from './Magnetic'
import { EASE } from './shared'

export function HeroDock({ sprint, reduce }: { sprint: Sprint | null; reduce: boolean }) {
  const live = sprint?.sprint_status === 'live'
  // Captured once at mount: the sprint arrives client-side, so this never runs during SSR.
  const [mountedAt] = useState(() => Date.now())
  const windowOpen = !!sprint?.close_at && new Date(sprint.close_at).getTime() > mountedAt

  return (
    <motion.div
      initial={reduce ? false : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 1.9, ease: EASE }}
      className="mx-auto flex w-full max-w-full flex-col items-stretch gap-1.5 rounded-[2rem] border border-white/15 bg-black/85 p-1.5 sm:w-fit sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className="flex items-center gap-3 px-4 py-2 sm:py-0">
        <span className="relative flex h-2 w-2">
          {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-signal' : 'bg-smoke'}`} />
        </span>
        <span className="font-mono text-xs text-chalk">
          {live && sprint ? `Sprint ${sprint.sprint_number} is live` : 'Next sprint dropping soon'}
        </span>
        {live && sprint?.close_at && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-smoke">
            {windowOpen ? (
              <>
                closes in <CountdownTimer targetDate={sprint.close_at} compact />
              </>
            ) : (
              'submissions closed'
            )}
          </span>
        )}
      </div>

      <Magnetic reduce={reduce}>
        <Link
          href="/sprint"
          data-cursor="Enter"
          className="group flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3.5 font-display text-sm font-bold text-chalk transition-colors hover:bg-chalk hover:text-void"
        >
          {live ? 'Enter the sprint' : 'See the sprint'}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </Magnetic>

      <Link
        href="/signup"
        data-cursor="Join"
        className="flex items-center justify-center rounded-full border border-white/25 px-5 py-3.5 font-display text-sm font-bold text-chalk transition-colors hover:border-chalk hover:bg-white/10"
      >
        Create account, it&apos;s free
      </Link>
    </motion.div>
  )
}
