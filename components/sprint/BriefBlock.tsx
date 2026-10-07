// components/sprint/BriefBlock.tsx
// One chapter of the brief. A red bar covers the text and wipes away once as it scrolls in
// ("declassified"). The wrapper, not the clipped child, is what the viewport observer watches.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/components/hero/shared'

interface BriefBlockProps {
  label: string
  content: string | null | undefined
  /** The challenge: set large, with a red rule. */
  lead?: boolean
  /** Constraints: one line per constraint. */
  list?: boolean
}

export function BriefBlock({ label, content, lead = false, list = false }: BriefBlockProps) {
  const reduce = useReducedMotion() ?? false
  const text = (content ?? '').trim()
  if (!text) return null

  const lines = list ? text.split('\n').map((l) => l.trim()).filter(Boolean) : []

  return (
    <motion.section
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      className={`border-l-4 pl-5 sm:pl-7 ${lead ? 'border-signal' : 'border-white/15'}`}
    >
      <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">{label}</h2>

      <div className="relative overflow-hidden">
        {list && lines.length > 1 ? (
          <ul className="space-y-2 font-mono text-sm leading-relaxed text-white/85">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="text-signal">/</span>
                <span className="min-w-0 break-words">{line.replace(/^[-•*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={`whitespace-pre-line break-words ${
              lead
                ? 'font-display text-2xl font-bold leading-snug text-chalk sm:text-4xl'
                : list
                  ? 'font-mono text-sm leading-relaxed text-white/85'
                  : 'text-lg leading-relaxed text-white/75'
            }`}
          >
            {text}
          </p>
        )}

        {!reduce && (
          <motion.span
            aria-hidden
            variants={{ hidden: { scaleX: 1 }, shown: { scaleX: 0 } }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            style={{ transformOrigin: 'right' }}
            className="absolute inset-0 bg-signal"
          />
        )}
      </div>
    </motion.section>
  )
}
