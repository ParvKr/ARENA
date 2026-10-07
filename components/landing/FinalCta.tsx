// components/landing/FinalCta.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Magnetic } from '@/components/hero/Magnetic'
import { EASE } from '@/components/hero/shared'
import { useCurrentSprint } from '@/hooks/useSprint'

export function FinalCta() {
  const reduce = useReducedMotion() ?? false
  const { sprint } = useCurrentSprint()
  // Captured once at mount: the sprint arrives client-side, so this never runs during SSR.
  const [mountedAt] = useState(() => Date.now())
  const open =
    sprint?.sprint_status === 'live' && !!sprint.close_at && new Date(sprint.close_at).getTime() > mountedAt

  return (
    <section className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:px-8 sm:py-40">
      {/* The red line again, drawn once as you arrive */}
      <svg
        aria-hidden
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[60%] w-full -translate-y-1/2 sm:block"
      >
        <motion.path
          d="M-20,300 C150,60 300,60 450,220 S760,380 900,160 S1100,60 1220,140"
          fill="none"
          stroke="#FF2B1C"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '0px 0px -30% 0px' }}
          transition={{ duration: 2, ease: EASE }}
        />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <h2 className="font-poster text-[clamp(3rem,12vw,10.5rem)] uppercase leading-[0.84]">
          Stop learning.
          <br />
          <span className="text-signal">Start competing.</span>
        </h2>

        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <Magnetic reduce={reduce}>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 rounded-full bg-chalk px-10 py-5 font-display text-lg font-bold text-void transition-colors hover:bg-signal hover:text-chalk"
            >
              Join the Arena
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
          <p className="max-w-sm text-base leading-relaxed text-smoke">
            {open && sprint
              ? `Sprint ${sprint.sprint_number} is live right now. Make an account and get in before it closes.`
              : 'The next sprint is on its way. Make an account now and be ready when the brief drops.'}
          </p>
        </div>
      </div>
    </section>
  )
}
