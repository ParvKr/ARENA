// components/profile/MatchLog.tsx
// The career record: one row per sprint entered, straight from the database.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { EASE } from '@/components/hero/shared'
import type { RecordEntry } from './record'

const PAGE = 8
type Filter = 'all' | 'top3'

function Row({ entry }: { entry: RecordEntry }) {
  const reduce = useReducedMotion() ?? false
  const r = entry.result
  const podium = !!r && r.rank <= 3
  // Only a finished sprint has a results page worth opening.
  const href = entry.sprintStatus === 'complete' ? `/results?sprint=${entry.sprintNumber}` : null

  const body = (
    <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-4 gap-y-3 px-2 py-5 transition-colors duration-200 group-hover:bg-white/[0.04] sm:grid-cols-[5rem_1fr_9rem_6rem] sm:gap-x-8 sm:px-4 sm:py-6">
      <p
        className={`font-poster text-4xl leading-none transition-colors sm:text-6xl ${
          podium ? 'text-signal' : r ? 'text-chalk' : 'text-white/30'
        }`}
      >
        {r ? r.rank : '·'}
      </p>

      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold sm:text-xl">{entry.title}</p>
        <p className="mt-1 truncate font-mono text-xs text-smoke">
          Sprint {String(entry.sprintNumber).padStart(3, '0')} · {entry.discipline}
        </p>
      </div>

      <div className="hidden sm:block">
        {r ? (
          <>
            <div className="h-1 w-full overflow-hidden bg-white/15">
              <motion.div
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
                style={{ width: `${Math.min(100, Math.max(0, r.score))}%` }}
                className={`h-full origin-left ${podium ? 'bg-signal' : 'bg-chalk'}`}
              />
            </div>
            <p className="mt-2 font-mono text-xs text-smoke">{r.score.toFixed(1)}%</p>
          </>
        ) : (
          <p className="font-mono text-xs text-smoke">Awaiting results</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 text-right">
        <p className="font-mono text-sm font-bold">
          {r ? `+${r.points} XP` : <span className="sm:hidden text-xs font-normal text-smoke">Pending</span>}
        </p>
        {href && (
          <ArrowUpRight
            aria-hidden
            className="hidden h-5 w-5 text-smoke transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal sm:block"
          />
        )}
      </div>
    </div>
  )

  return (
    <li className="group border-b border-white/15">
      {href ? (
        <Link href={href} aria-label={`${entry.title}, view results`} className="block focus-visible:outline-2 focus-visible:outline-signal">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  )
}

export function MatchLog({
  history,
  isOwner,
  name,
}: {
  history: RecordEntry[]
  isOwner: boolean
  name: string
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [showAll, setShowAll] = useState(false)

  const top3 = history.filter((e) => e.result && e.result.rank <= 3)
  const rows = filter === 'top3' ? top3 : history
  const shown = showAll ? rows : rows.slice(0, PAGE)

  return (
    <section aria-labelledby="log-heading" className="border-t border-white/15 py-16 sm:py-24">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <h2 id="log-heading" className="font-poster text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.9]">
          Match log
        </h2>
        {history.length > 0 && (
          <div role="group" aria-label="Filter sprints" className="flex gap-2">
            {(
              [
                ['all', `All ${history.length}`],
                ['top3', `Top 3 · ${top3.length}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id)
                  setShowAll(false)
                }}
                className={`rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                  filter === id ? 'border-signal bg-signal text-chalk' : 'border-white/25 text-chalk hover:border-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-10 border border-dashed border-white/25 px-6 py-14 text-center">
          <p className="font-poster text-3xl uppercase sm:text-4xl">No entries yet</p>
          <p className="mx-auto mt-3 max-w-sm text-base text-smoke">
            {isOwner ? 'Your first sprint will show up here.' : `${name} hasn't entered a sprint yet.`}
          </p>
          {isOwner && (
            <Link
              href="/sprint"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-7 py-3 font-display text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5"
            >
              See the current sprint <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 border border-dashed border-white/25 px-6 py-12 text-center text-smoke">
          No podium finishes yet.
        </p>
      ) : (
        <>
          <ul className="mt-10 border-t border-white/15">
            {shown.map((e) => (
              <Row key={e.id} entry={e} />
            ))}
          </ul>
          {rows.length > PAGE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-8 rounded-full border border-white/25 px-6 py-3 font-mono text-xs transition-colors hover:border-signal hover:bg-signal"
            >
              {showAll ? 'Show fewer' : `Show all ${rows.length}`}
            </button>
          )}
        </>
      )}
    </section>
  )
}
