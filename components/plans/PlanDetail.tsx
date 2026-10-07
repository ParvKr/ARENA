// components/plans/PlanDetail.tsx
'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Plan } from './plans'

interface PlanDetailProps {
  plan: Plan
  signedIn: boolean
}

export function PlanDetail({ plan, signedIn }: PlanDetailProps) {
  const reduce = useReducedMotion() ?? false

  return (
    <div aria-live="polite" className="rounded-2xl border border-white/15 bg-white/[0.03] p-6 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={plan.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="font-poster text-5xl uppercase leading-none sm:text-6xl">{plan.name}</h2>

          <p className="mt-5 flex items-baseline gap-2">
            <span className="font-poster text-6xl leading-none text-signal">{plan.price}</span>
            {plan.period && <span className="font-mono text-sm text-smoke">{plan.period}</span>}
          </p>

          <p className="mt-4 text-base leading-relaxed text-white/75">{plan.description}</p>

          <ul className="mt-6 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-3 text-base text-white/85">
                <span aria-hidden className="font-mono text-signal">/</span>
                <span className="min-w-0">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {plan.available ? (
              signedIn ? (
                <p className="rounded-full border border-white/25 px-6 py-4 text-center font-display text-base font-bold text-chalk">
                  This is your plan
                </p>
              ) : (
                <Link
                  href="/signup"
                  className="block rounded-full bg-signal px-6 py-4 text-center font-display text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-void"
                >
                  Create a free account
                </Link>
              )
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-white/20 px-6 py-4 font-display text-base font-bold text-white/50"
                >
                  Coming soon
                </button>
                <p className="mt-3 text-center text-sm text-smoke">Paid plans aren&apos;t open yet.</p>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
