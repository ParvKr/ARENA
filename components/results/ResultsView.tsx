// components/results/ResultsView.tsx
// The results as a gallery wall: the top three works framed on a dark wall with museum
// placards, then the full leaderboard with a score bar per row.
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { EASE } from '@/components/hero/shared'
import { WorkDialog } from './WorkDialog'
import type { ArchiveItem, ResultRow, ResultsSprint } from './types'

interface ResultsViewProps {
  sprint: ResultsSprint
  archive: ArchiveItem[]
  results: ResultRow[]
  entryCount: number
}

function Work({ work, featured, index, onOpen }: { work: ResultRow; featured: boolean; index: number; onOpen: () => void }) {
  const reduce = useReducedMotion() ?? false
  const isImage = work.fileType.startsWith('image/')

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      className="min-w-0"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${work.displayName}'s work, rank ${work.rank}`}
        className="group block w-full bg-chalk p-3 text-left transition-transform duration-300 hover:-translate-y-1 sm:p-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-void">
          {isImage ? (
            <Image
              src={work.fileUrl}
              alt={`Submission by ${work.displayName}`}
              fill
              sizes={featured ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 1024px) 30vw, 100vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <div className="text-center text-smoke">
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em]">PDF</p>
              </div>
            </div>
          )}
        </div>
      </button>

      <figcaption className="mt-5">
        <div className="flex items-end justify-between gap-4">
          <p className={`font-poster leading-[0.8] ${featured ? 'text-8xl text-signal' : 'text-7xl text-chalk'}`}>
            {work.rank}
          </p>
          <p className="pb-1 text-right font-mono text-sm text-white/80">
            <span className="block text-lg font-bold text-chalk">{work.score.toFixed(1)}%</span>+{work.points} XP
          </p>
        </div>
        <p className="mt-4 truncate font-display text-lg font-bold">{work.displayName}</p>
        {work.username && <p className="font-mono text-xs text-smoke">@{work.username}</p>}
        {work.interpretation && (
          <p className="mt-3 line-clamp-2 break-words text-sm italic leading-relaxed text-white/65">
            &ldquo;{work.interpretation}&rdquo;
          </p>
        )}
      </figcaption>
    </motion.figure>
  )
}

function Avatar({ row }: { row: ResultRow }) {
  return row.avatarUrl ? (
    // Plain img: avatars come from any OAuth provider, which next/image would reject.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={row.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25 font-poster text-lg">
      {row.displayName.charAt(0).toUpperCase()}
    </span>
  )
}

export function ResultsView({ sprint, archive, results, entryCount }: ResultsViewProps) {
  const reduce = useReducedMotion() ?? false
  const [open, setOpen] = useState<ResultRow | null>(null)
  const podium = results.slice(0, 3)
  const cols =
    podium.length === 3 ? 'lg:grid-cols-[1.3fr_1fr_1fr]' : podium.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1 lg:max-w-md'

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-28 sm:px-8">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          Sprint {String(sprint.number).padStart(2, '0')} · {sprint.discipline}
        </p>
        <h1 className="mt-3 font-poster text-[clamp(3.5rem,11vw,9rem)] uppercase leading-[0.85]">Results</h1>
        <p className="mt-5 max-w-2xl break-words font-display text-xl font-bold leading-snug sm:text-2xl">{sprint.title}</p>
        <p className="mt-3 text-base text-smoke">
          {entryCount.toLocaleString('en-US')} {entryCount === 1 ? 'entry' : 'entries'}, judged blind by industry designers.
        </p>
      </motion.header>

      {archive.length > 1 && (
        <nav aria-label="Sprint archive" className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {archive.map((a) => {
            const active = a.number === sprint.number
            return (
              <Link
                key={a.number}
                href={`/results?sprint=${a.number}`}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? 'border-chalk bg-chalk text-void' : 'border-white/25 text-white/80 hover:border-chalk hover:text-chalk'
                }`}
              >
                Sprint {a.number}
              </Link>
            )
          })}
        </nav>
      )}

      {/* The wall */}
      {podium.length > 0 && (
        <section aria-label="Top three works" className={`mt-14 grid items-end gap-10 ${cols}`}>
          {podium.map((w, i) => (
            <Work key={w.rank} work={w} featured={i === 0} index={i} onOpen={() => setOpen(w)} />
          ))}
        </section>
      )}

      {/* Full leaderboard */}
      <section aria-label="Full leaderboard" className="mt-24">
        <h2 className="font-poster text-4xl uppercase leading-none sm:text-5xl">Leaderboard</h2>
        <ol className="mt-8 divide-y divide-white/10 border-y border-white/15">
          {results.map((r) => (
            <motion.li
              key={r.rank}
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: '0px 0px -5% 0px' }}
              className="grid grid-cols-[2.75rem_2.25rem_1fr_auto] items-center gap-3 py-4 transition-colors hover:bg-white/[0.04] sm:grid-cols-[3.5rem_2.25rem_minmax(8rem,1fr)_minmax(6rem,2fr)_4.5rem_4rem] sm:gap-4 sm:px-2"
            >
              <span className={`font-poster text-3xl leading-none ${r.rank === 1 ? 'text-signal' : ''}`}>{r.rank}</span>
              <Avatar row={r} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{r.displayName}</p>
                {r.username && <p className="truncate font-mono text-xs text-smoke">@{r.username}</p>}
              </div>
              <div className="hidden h-1.5 overflow-hidden bg-white/10 sm:block" aria-hidden>
                <motion.div
                  variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                  transition={{ duration: 0.9, ease: EASE }}
                  style={{ width: `${Math.max(2, Math.min(100, r.score))}%`, transformOrigin: 'left' }}
                  className={`h-full ${r.rank <= 3 ? 'bg-signal' : 'bg-white/60'}`}
                />
              </div>
              <span className="text-right font-mono text-sm font-bold tabular-nums">{r.score.toFixed(1)}%</span>
              <span className="hidden text-right font-mono text-sm text-smoke tabular-nums sm:block">+{r.points}</span>
            </motion.li>
          ))}
        </ol>
      </section>

      <AnimatePresence>{open && <WorkDialog work={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}
