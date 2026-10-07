// components/hero/Comet.tsx
// An ice-blue comet that travels along an SVG path. Drive it with a 0→1 motion value
// (0 and 1 are hidden). Positioned via refs on each change: no React renders, no SVG filters.
'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'

const ICE = '#4F86FF'
const ICE_CORE = '#D6E4FF'
// Tail layers, longest/faintest first; stacked to fake a taper.
const TAILS = [
  { len: 300, width: 12, color: ICE, opacity: 0.35 },
  { len: 190, width: 7, color: ICE, opacity: 0.92 },
  { len: 90, width: 4, color: ICE_CORE, opacity: 1 },
] as const

export function Comet({ d, progress }: { d: string; progress: MotionValue<number> }) {
  const measureRef = useRef<SVGPathElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const tailRefs = useRef<(SVGPathElement | null)[]>([])
  const lengthRef = useRef(0)

  const update = useCallback((p: number) => {
    const measure = measureRef.current
    const group = groupRef.current
    const head = headRef.current
    const len = lengthRef.current
    if (!measure || !group || !head || !len) return
    if (p <= 0 || p >= 1) return group.setAttribute('opacity', '0')

    const pos = p * len
    const pt = measure.getPointAtLength(pos)
    head.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
    group.setAttribute('opacity', Math.min(1, p / 0.06, (1 - p) / 0.06).toFixed(2))
    TAILS.forEach((tail, i) => {
      const el = tailRefs.current[i]
      if (!el) return
      el.setAttribute('stroke-dasharray', `${tail.len} ${len * 2}`)
      el.setAttribute('stroke-dashoffset', (-(pos - tail.len)).toFixed(1))
    })
  }, [])

  useEffect(() => {
    lengthRef.current = measureRef.current?.getTotalLength() ?? 0
    update(progress.get())
  }, [d, progress, update])

  useMotionValueEvent(progress, 'change', update)

  return (
    <>
      <path ref={measureRef} d={d} fill="none" stroke="none" />
      <g ref={groupRef} opacity={0}>
        {TAILS.map((tail, i) => (
          <path
            key={tail.len}
            ref={(el) => {
              tailRefs.current[i] = el
            }}
            d={d}
            fill="none"
            stroke={tail.color}
            strokeOpacity={tail.opacity}
            strokeWidth={tail.width}
            strokeLinecap="round"
          />
        ))}
        <g ref={headRef}>
          <circle r={16} fill={ICE} fillOpacity={0.35} />
          <circle r={7} fill={ICE_CORE} />
        </g>
      </g>
    </>
  )
}
