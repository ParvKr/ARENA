// components/profile/RankTrack.tsx
// Five stations at their real XP thresholds. The red fill runs from the start to the competitor.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { RankTier } from '@/types/api.types'
import { TIER_THRESHOLDS } from '@/types/api.types'
import { EASE } from '@/components/hero/shared'
import { TIER_ORDER, rankProgress } from './record'

export function RankTrack({ points, tier, isOwner }: { points: number; tier: RankTier; isOwner: boolean }) {
  const reduce = useReducedMotion() ?? false
  const { position, next, xpToNext } = rankProgress(points, tier)
  const pct = position * 100

  return (
    <section aria-labelledby="rank-heading" className="border-t border-white/15 py-16 sm:py-24">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h2 id="rank-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-smoke">
            Rank
          </h2>
          <p className="mt-3 font-poster text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.9]">
            {points.toLocaleString()} <span className="text-signal">XP</span>
          </p>
        </div>
        <p className="font-mono text-sm text-white/80 sm:text-right">
          {next ? (
            <>
              <span className="text-chalk">{xpToNext.toLocaleString()} XP</span> to {next}
            </>
          ) : (
            'Top tier reached'
          )}
        </p>
      </div>

      {/* The track. Fill grows with scaleX only; stations are plain absolutely placed marks. */}
      <div className="mt-14 px-1 sm:mt-20">
        <motion.div
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          className="relative h-3"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25" />
          <motion.div
            variants={{ hidden: { scaleX: reduce ? 1 : 0 }, shown: { scaleX: 1 } }}
            transition={{ duration: 1.4, ease: EASE }}
            style={{ width: `${pct}%` }}
            className="absolute left-0 top-1/2 h-1 origin-left -translate-y-1/2 bg-signal"
          />
          {TIER_ORDER.map((t, i) => (
            <span
              key={t}
              aria-hidden
              className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 ${
                i / (TIER_ORDER.length - 1) <= position ? 'bg-signal' : 'border border-white/40 bg-void'
              }`}
              style={{ left: `${(i / (TIER_ORDER.length - 1)) * 100}%` }}
            />
          ))}
          {/* the competitor */}
          <motion.span
            variants={{ hidden: { opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }, shown: { opacity: 1, scale: 1 } }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 1.2, ease: EASE }}
            aria-hidden
            className="absolute top-1/2 z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-chalk"
            style={{ left: `${pct}%` }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-signal" />
          </motion.span>
        </motion.div>

        <div className="relative mt-5 h-10">
          {TIER_ORDER.map((t, i) => {
            const at = i / (TIER_ORDER.length - 1)
            const here = t === tier
            const shift = i === 0 ? '' : i === TIER_ORDER.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
            const align = i === 0 ? 'text-left' : i === TIER_ORDER.length - 1 ? 'text-right' : 'text-center'
            return (
              <div key={t} className={`absolute top-0 ${shift} ${align}`} style={{ left: `${at * 100}%` }}>
                <p
                  className={`font-mono text-[9px] uppercase tracking-normal sm:text-xs sm:tracking-[0.2em] ${
                    here ? 'text-signal sm:font-bold' : 'text-smoke'
                  }`}
                >
                  {t}
                </p>
                <p className="mt-1 font-mono text-[10px] text-white/50">{TIER_THRESHOLDS[t]}</p>
              </div>
            )
          })}
        </div>
      </div>

      <p className="sr-only">
        {isOwner ? 'You are' : 'This competitor is'} ranked {tier} with {points} XP.
      </p>
    </section>
  )
}
