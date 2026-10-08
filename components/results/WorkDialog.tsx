// components/results/WorkDialog.tsx
// A winning work, full size, with the winner's own words about it.
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, FileText, X } from 'lucide-react'
import type { ResultRow } from './types'

export function WorkDialog({ work, onClose }: { work: ResultRow; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const isImage = work.fileType.startsWith('image/')

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${work.displayName}'s winning work`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-4 bottom-4 top-16 z-[70] mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-void lg:flex-row"
      >
        <div className="relative min-h-[40%] flex-1 bg-black lg:min-h-0">
          {isImage ? (
            <Image src={work.fileUrl} alt={`Submission by ${work.displayName}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
          ) : (
            <div className="grid h-full place-items-center">
              <FileText className="h-16 w-16 text-smoke" />
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-5 overflow-y-auto p-6 lg:w-[22rem]">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-void/80 text-white/80 hover:border-chalk hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </button>

          <div>
            <p className="font-poster text-6xl leading-none text-signal">#{work.rank}</p>
            <p className="mt-3 font-display text-xl font-bold">{work.displayName}</p>
            {work.username && <p className="font-mono text-sm text-smoke">@{work.username}</p>}
            <p className="mt-3 font-mono text-sm text-white/80">
              {work.score.toFixed(1)}% · +{work.points} XP
            </p>
          </div>

          {work.interpretation && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">How they read the brief</h3>
              <p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed text-white/85">{work.interpretation}</p>
            </div>
          )}
          {work.tools && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-smoke">Tools</h3>
              <p className="mt-2 break-words text-base text-white/85">{work.tools}</p>
            </div>
          )}

          <a
            href={work.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 font-display text-sm font-bold text-chalk transition-colors hover:border-chalk hover:bg-white/10"
          >
            Open the original <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </>
  )
}
