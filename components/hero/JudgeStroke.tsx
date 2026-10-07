// components/hero/JudgeStroke.tsx
// A red "judge's mark" drawn across the hero. Every few seconds an ice-blue comet sweeps
// along it, the one cold note in an otherwise red/black/white hero. Purely decorative.
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimationFrame, useInView, useMotionValue } from 'framer-motion'
import { Comet } from './Comet'
import { toSpline, type Pt } from './path'
import { EASE } from './shared'

const POINTS: Pt[] = [
  { x: -0.06, y: 0.5 },
  { x: 0.12, y: 0.26 },
  { x: 0.33, y: 0.56 },
  { x: 0.55, y: 0.22 },
  { x: 0.78, y: 0.54 },
  { x: 0.93, y: 0.28 },
  { x: 1.06, y: 0.4 },
]

const FIRST_RIDE_MS = 3400 // after the line has finished drawing
const TRAVEL_MS = 2600
const PERIOD_MS = 7000

const smooth = (t: number) => t * t * (3 - 2 * t)

export function JudgeStroke({ reduce }: { reduce: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef)
  const progress = useMotionValue(0)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // On narrow screens the headline sits in a thin band at the top, so squash the line into it
  // (otherwise it cuts across the copy).
  const squash = size.w > 0 && size.w < 640
  const view = useMemo(
    () => POINTS.map((p) => ({ x: p.x, y: squash ? 0.15 + (p.y - 0.2) * 0.5 : p.y })),
    [squash]
  )
  const ready = size.w > 0
  const path = ready ? toSpline(view, size.w, size.h) : ''

  useAnimationFrame((time) => {
    if (reduce || !inView) return
    const e = time - FIRST_RIDE_MS
    const p = e < 0 ? 2 : (e % PERIOD_MS) / TRAVEL_MS
    progress.set(p > 1 ? 0 : smooth(p))
  })

  const draw = reduce ? { duration: 0 } : { duration: 1.7, delay: 1.0, ease: EASE }

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      viewBox={ready ? `0 0 ${size.w} ${size.h}` : undefined}
    >
      {ready && (
        <>
          {/* Wide faint stroke under the line = glow, without a per-frame SVG filter */}
          <motion.path
            d={path}
            fill="none"
            stroke="rgba(255,43,28,0.22)"
            strokeWidth={14}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={draw}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="#FF2B1C"
            strokeWidth={4}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={draw}
          />

          {/* Anchor dots */}
          {view.slice(1, -1).map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x * size.w}
              cy={p.y * size.h}
              r={6}
              strokeWidth={2.5}
              className="fill-void stroke-signal"
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{ delay: 1.4 + i * 0.12, type: 'spring', stiffness: 400, damping: 18 }}
            />
          ))}

          <Comet d={path} progress={progress} />
        </>
      )}
    </svg>
  )
}
