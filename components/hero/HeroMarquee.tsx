// components/hero/HeroMarquee.tsx
// Red band that closes the hero. It crawls on its own and speeds up (and flips
// direction) with scroll velocity. Pauses on hover and while off-screen.
'use client'

import { useRef } from 'react'
import {
  motion,
  useInView,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

const ITEMS = ['Visual design', 'Copywriting', 'UI/UX design', 'No-code', 'Video editing', 'Strategy']
const REPEATS = 4 // the track is 4 copies wide; we wrap at one copy (25%)

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

export function HeroMarquee({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const paused = useRef(false)
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const boost = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const direction = useMotionValue(-1)
  const x = useTransform(baseX, (v) => `${wrap(-100 / REPEATS, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || paused.current) return
    const v = boost.get()
    if (v < -0.05) direction.set(1)
    else if (v > 0.05) direction.set(-1)
    const move = direction.get() * 0.95 * (delta / 1000)
    baseX.set(baseX.get() + move + direction.get() * Math.abs(v) * (delta / 1000) * 0.95)
  })

  const row = ITEMS.map((item, i) => (
    <span key={item} className="flex shrink-0 items-center gap-8 pr-8">
      <span
        className={`font-poster text-4xl uppercase leading-none sm:text-6xl ${
          i % 2 === 0 ? 'text-chalk' : 'text-transparent [-webkit-text-stroke:2px_#fff]'
        }`}
      >
        {item}
      </span>
      <span aria-hidden className="h-3 w-3 rotate-45 bg-void" />
    </span>
  ))

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      className="relative z-10 -mx-[5%] mb-5 mt-8 w-[110%] -rotate-[1.4deg] overflow-hidden bg-signal py-2.5 sm:mt-10 sm:py-3"
    >
      <motion.div style={{ x, willChange: 'transform' }} className="flex w-max">
        {Array.from({ length: REPEATS }, (_, n) => (
          <div key={n} className="flex shrink-0">
            {row}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
