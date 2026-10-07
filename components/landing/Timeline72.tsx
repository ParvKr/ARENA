// components/landing/Timeline72.tsx
// "How it works" as a 72-hour clock. The section is tall and its inner stage is sticky, so
// scrolling is the clock: the hours count down and the three stages light up in turn.
// (Sticky only; no scroll hijacking. The `sticky` needs no overflow-hidden ancestor.)
'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'

const STEPS = [
  {
    when: 'Hour 0',
    title: 'Get the brief',
    body: 'Every sprint drops a real, client-grade brief with a countdown attached. Check your email.',
  },
  {
    when: 'Hours 1 to 71',
    title: 'Do the work',
    body: 'No tutorials, no hand-holding. Your tools, your skills, your call. Show up or get outranked.',
  },
  {
    when: 'Hour 72',
    title: 'Get judged. Rise.',
    body: 'Expert judges score every submission blind. Top performers earn points, prizes and a public rank.',
  },
]

const stageAt = (p: number) => (p < 0.22 ? 0 : p < 0.8 ? 1 : 2)
const pad = (n: number) => String(n).padStart(2, '0')

export function Timeline72() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [stage, setStage] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStage(stageAt(p)))

  // Big number changes at most 72 times; the small mm:ss readout is a tiny text node.
  const hours = useTransform(scrollYProgress, (p) => pad(Math.max(0, Math.ceil(72 * (1 - p)))))
  const clock = useTransform(scrollYProgress, (p) => {
    const s = Math.max(0, Math.floor(72 * 3600 * (1 - p)))
    return `${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`
  })

  return (
    <section ref={ref} className="relative h-[320vh] border-t border-white/10">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-5 pt-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h2 className="font-poster text-[clamp(1.75rem,4vw,3rem)] uppercase leading-[0.9]">
              72 hours. No excuses.
            </h2>
            <div
              aria-hidden
              className="mt-4 font-poster tabular-nums leading-[0.8] text-chalk"
              style={{ fontSize: 'clamp(7rem, min(30vw, 38svh), 22rem)' }}
            >
              <motion.span>{hours}</motion.span>
            </div>
            <p className="mt-3 flex items-center gap-3 font-mono text-xs text-smoke">
              <span className="h-2 w-2 rounded-full bg-signal" />
              hours left in the sprint
              <motion.span className="tabular-nums text-chalk">{clock}</motion.span>
            </p>
          </div>

          <ol className="relative pl-8">
            <span aria-hidden className="absolute bottom-0 left-0 top-0 w-[3px] bg-white/15" />
            <motion.span
              aria-hidden
              className="absolute bottom-0 left-0 top-0 w-[3px] origin-top bg-signal"
              style={{ scaleY: scrollYProgress }}
            />
            {STEPS.map((step, i) => {
              const active = i === stage
              return (
                <li key={step.title} aria-current={active ? 'step' : undefined} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden
                    className={`absolute -left-[39px] top-2 h-3 w-3 rotate-45 transition-colors duration-300 ${
                      i <= stage ? 'bg-signal' : 'bg-void ring-2 ring-white/25'
                    }`}
                  />
                  <p className="font-mono text-xs text-signal">{step.when}</p>
                  <h3
                    className={`mt-1 font-poster text-[clamp(1.75rem,4.5vw,3.25rem)] uppercase leading-none transition-colors duration-300 ${
                      active ? 'text-chalk' : 'text-white/30'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <p className="overflow-hidden pt-2 text-base leading-relaxed text-smoke">{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
