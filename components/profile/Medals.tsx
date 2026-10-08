// components/profile/Medals.tsx
// Earned medals light up; locked ones say exactly how to get them.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { EASE } from '@/components/hero/shared'
import type { Medal } from './record'

export function Medals({ medals }: { medals: Medal[] }) {
  const reduce = useReducedMotion() ?? false
  const count = medals.filter((m) => m.earned).length

  return (
    <section aria-labelledby="medals-heading" className="border-t border-white/15 py-16 sm:py-24">
      <div className="flex items-end justify-between gap-6">
        <h2 id="medals-heading" className="font-poster text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.9]">
          Medals
        </h2>
        <p className="font-mono text-sm text-smoke">
          <span className="text-chalk">{count}</span> / {medals.length}
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {medals.map((m, i) => (
          <motion.li
            key={m.id}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
            className={`flex min-h-36 flex-col justify-between p-4 transition-transform duration-300 sm:min-h-44 sm:p-6 ${
              m.earned
                ? 'bg-signal text-chalk hover:-translate-y-1'
                : 'border border-dashed border-white/25 text-white/60'
            }`}
          >
            <span aria-hidden className={`grid h-8 w-8 place-items-center rounded-full ${m.earned ? 'bg-void text-signal' : 'border border-white/30'}`}>
              {m.earned ? <Check className="h-4 w-4" strokeWidth={3} /> : <Lock className="h-3.5 w-3.5" />}
            </span>
            <div className="mt-6 min-w-0">
              <p className="break-words font-poster text-2xl uppercase leading-none sm:text-3xl">{m.label}</p>
              <p className={`mt-2 text-sm ${m.earned ? 'text-white/90' : 'text-smoke'}`}>
                {m.earned ? 'Earned' : m.how}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
