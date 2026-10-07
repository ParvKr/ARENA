// components/hero/Stickers.tsx
// Tilted "sticker" badges that carry the platform stats. Each floats at its own
// depth against the pointer.
'use client'

import { motion, useTransform } from 'framer-motion'
import type { HeroPointer } from './shared'

function starPoints(spikes: number, outer: number, inner: number) {
  const pts: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI * i) / spikes - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}
const STAR = starPoints(14, 50, 41)

interface StickerProps {
  pointer: HeroPointer
  reduce: boolean
  /** px of parallax travel across the full pointer range. */
  depth: number
  rotate: number
  delay: number
  className: string
  children: React.ReactNode
}

function Sticker({ pointer, reduce, depth, rotate, delay, className, children }: StickerProps) {
  const x = useTransform(pointer.nx, (v) => (reduce ? 0 : v * depth))
  const y = useTransform(pointer.ny, (v) => (reduce ? 0 : v * depth * 0.7))
  return (
    <motion.div style={{ x, y }} className={`pointer-events-none absolute z-[25] will-change-transform ${className}`}>
      <motion.div
        initial={reduce ? false : { scale: 0, rotate: rotate - 50, opacity: 0 }}
        animate={{ scale: 1, rotate: rotate, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 13, delay }}
      >
        <div className="hero-float" style={{ '--float-d': `${4 + delay}s` } as React.CSSProperties}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Stickers({ pointer, reduce }: { pointer: HeroPointer; reduce: boolean }) {
  const base = { pointer, reduce }
  return (
    <>
      <Sticker {...base} depth={70} rotate={8} delay={1.7} className="right-[1%] top-[12%] sm:right-[7%] sm:top-[17%]">
        <div className="relative grid h-28 w-28 place-items-center sm:h-40 sm:w-40">
          <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 animate-[spin_40s_linear_infinite] motion-reduce:animate-none">
            <polygon points={STAR} className="fill-signal" />
          </svg>
          <div className="relative text-center font-poster uppercase leading-none text-chalk">
            <div className="text-[1.7rem] sm:text-5xl">$5K+</div>
            <div className="mt-1 font-display text-[0.6rem] font-bold tracking-wide sm:text-xs">in prizes</div>
          </div>
        </div>
      </Sticker>

      <Sticker {...base} depth={90} rotate={5} delay={2.1} className="bottom-[40%] right-[17%] hidden lg:block">
        <div className="border-2 border-signal bg-void px-4 py-2 font-poster text-xl uppercase leading-none text-chalk">
          1,200+
          <span className="ml-2 font-display text-xs font-bold normal-case text-smoke">competitors</span>
        </div>
      </Sticker>

    </>
  )
}
