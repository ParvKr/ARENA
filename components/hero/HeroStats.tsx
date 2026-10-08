// components/hero/HeroStats.tsx
// The live sprint's real numbers (prize pool, entries so far) as plain type, not stickers.
// Shown only while a sprint is open; hidden otherwise rather than quoting a stale figure.
'use client'

import { motion } from 'framer-motion'
import { totalPrize } from '@/components/sprint/prize'
import { useSprintPhase } from '@/components/sprint/useSprintPhase'
import type { PrizeData, Sprint } from '@/types/api.types'
import { EASE } from './shared'

interface HeroStatsProps {
  sprint: Sprint | null
  entryCount: number
  reduce: boolean
  /** Phones: a single inline row under the copy instead of the right-hand column. */
  inline?: boolean
}

export function HeroStats({ sprint, entryCount, reduce, inline = false }: HeroStatsProps) {
  return sprint ? <Stats sprint={sprint} entryCount={entryCount} reduce={reduce} inline={inline} /> : null
}

function Stats({ sprint, entryCount, reduce, inline }: Required<HeroStatsProps> & { sprint: Sprint }) {
  const phase = useSprintPhase(sprint)
  if (phase !== 'open') return null

  const pool = totalPrize(sprint.prize_data as PrizeData | null)
  const items = [
    pool !== null ? { label: 'Prize pool', value: `$${pool.toLocaleString('en-US')}` } : null,
    // A "0" says less than nothing; show entries once there are some.
    entryCount > 0
      ? { label: entryCount === 1 ? 'Entry so far' : 'Entries so far', value: entryCount.toLocaleString('en-US') }
      : null,
  ].filter((i): i is { label: string; value: string } => i !== null)

  return (
    <motion.dl
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 2.1, ease: EASE }}
      className={
        inline
          ? 'mt-6 flex gap-8 border-t border-white/15 pt-4 sm:hidden'
          : 'pointer-events-none absolute right-5 top-[88px] z-20 hidden text-right sm:block sm:right-8 lg:top-[120px]'
      }
    >
      {items.map((item, i) => (
        <div key={item.label} className={inline ? '' : `${i > 0 ? 'mt-5 border-t border-white/20 pt-5' : ''}`}>
          <dt className="font-mono text-xs text-smoke">{item.label}</dt>
          <dd className={`mt-1 font-poster leading-none tabular-nums ${inline ? 'text-3xl' : 'text-5xl lg:text-6xl'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </motion.dl>
  )
}
