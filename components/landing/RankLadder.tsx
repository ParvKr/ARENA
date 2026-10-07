// components/landing/RankLadder.tsx
// Ranks as a staircase. On first view the ice-blue comet climbs it once, ending on Legend.
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { Comet } from '@/components/hero/Comet'
import { toSpline } from '@/components/hero/path'
import { EASE } from '@/components/hero/shared'

const RANKS = [
  { name: 'Contender', pts: '0 pts', height: 0.24 },
  { name: 'Rising', pts: '50+ pts', height: 0.4 },
  { name: 'Ranked', pts: '150+ pts', height: 0.57 },
  { name: 'Elite', pts: '350+ pts', height: 0.76 },
  { name: 'Legend', pts: '700+ pts', height: 1 },
]

export function RankLadder() {
  const reduce = useReducedMotion() ?? false
  const stairsRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stairsRef, { once: true, margin: '-25% 0px' })
  const progress = useMotionValue(0)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = stairsRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Path along the top of each step, from just below the first step up to the Legend step.
  const path = useMemo(() => {
    if (!size.w) return ''
    const n = RANKS.length
    const pts = [
      { x: -0.02, y: 0.98 },
      ...RANKS.map((r, i) => ({ x: (i + 0.5) / n, y: 1 - r.height - 0.045 })),
    ]
    return toSpline(pts, size.w, size.h)
  }, [size])

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(progress, [0, 1], { duration: 2.6, delay: 0.9, ease: [0.45, 0, 0.2, 1] })
    return () => controls.stop()
  }, [inView, reduce, progress])

  return (
    <section className="border-t border-white/10 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-end gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="font-poster text-[clamp(2.5rem,6vw,5rem)] uppercase leading-[0.88]">
            Your rank is public.
            <br />
            <span className="text-signal">Earn it.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-smoke">
            Points compound across sprints. Show up consistently, beat your peers, and your rank becomes
            the credential that follows you.
          </p>
        </div>

        <div ref={stairsRef} className="relative h-[clamp(300px,52vw,430px)]">
          <div className="absolute inset-0 grid grid-cols-5 items-end gap-1.5 sm:gap-2">
            {RANKS.map((rank, i) => {
              const legend = i === RANKS.length - 1
              return (
                <motion.div
                  key={rank.name}
                  initial={reduce ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: '0px 0px -20% 0px' }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
                  style={{ height: `${rank.height * 100}%`, transformOrigin: 'bottom' }}
                  className={`relative flex flex-col justify-end overflow-hidden p-2 sm:p-3 ${
                    legend ? 'border-2 border-signal bg-void' : 'border-t-2 border-white/40 bg-white/[0.06]'
                  }`}
                >
                  {legend && (
                    <div className="relative mb-auto aspect-square w-full">
                      <Image
                        src="/arena-emblem-duotone.jpg"
                        alt="Arena Legend emblem"
                        fill
                        sizes="(max-width: 640px) 18vw, 120px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p
                    className={`font-poster text-[0.8rem] uppercase leading-none sm:text-lg ${
                      legend ? 'text-signal' : 'text-chalk'
                    }`}
                  >
                    {rank.name}
                  </p>
                  <p className="mt-1 font-mono text-[9px] text-smoke sm:text-xs">{rank.pts}</p>
                </motion.div>
              )
            })}
          </div>

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={size.w ? `0 0 ${size.w} ${size.h}` : undefined}
          >
            {path && <Comet d={path} progress={progress} />}
          </svg>
        </div>
      </div>
    </section>
  )
}
