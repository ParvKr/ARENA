// components/plans/ArenaMap.tsx
// A top-down view of the arena: the outer ring is the free tier, each ring inward is a
// higher tier, around a plain floor in the middle. Hover or tap a ring
// to light it. Decorative: the tier buttons beside it are the accessible control.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '@/components/hero/shared'

const CX = 300
const CY = 200
// [rx, ry] outer edge of each tier's ring, outermost (free) first.
const RINGS: [number, number][] = [
  [288, 188],
  [222, 146],
  [156, 104],
  [90, 62],
]
const FLOOR: [number, number] = [56, 34]

interface ArenaMapProps {
  labels: string[]
  active: number
  onHover: (i: number | null) => void
  onSelect: (i: number) => void
}

export function ArenaMap({ labels, active, onHover, onSelect }: ArenaMapProps) {
  const reduce = useReducedMotion() ?? false

  return (
    <svg aria-hidden viewBox="0 0 600 400" className="h-auto w-full touch-manipulation select-none">
      {RINGS.map(([rx, ry], i) => {
        const [nrx, nry] = RINGS[i + 1] ?? FLOOR
        const lit = i === active
        return (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            onPointerEnter={() => onHover(i)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onSelect(i)}
            className="cursor-pointer"
          >
            <ellipse
              cx={CX}
              cy={CY}
              rx={rx}
              ry={ry}
              strokeWidth={2}
              style={{
                fill: lit ? '#FF2B1C' : '#101010',
                stroke: lit ? '#FF2B1C' : 'rgba(255,255,255,0.22)',
                transition: 'fill 0.25s ease, stroke 0.25s ease',
              }}
            />
            {/* Seat rows */}
            {[0.34, 0.67].map((t) => (
              <ellipse
                key={t}
                cx={CX}
                cy={CY}
                rx={rx - (rx - nrx) * t}
                ry={ry - (ry - nry) * t}
                fill="none"
                stroke={lit ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}
                strokeWidth={5}
                strokeDasharray="2 7"
                style={{ transition: 'stroke 0.25s ease' }}
              />
            ))}
            <text
              x={CX}
              y={CY - (ry + nry) / 2 + 6}
              textAnchor="middle"
              className="font-poster"
              fontSize={19}
              letterSpacing={2}
              style={{ fill: lit ? '#FFFFFF' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}
            >
              {labels[i]}
            </text>
          </motion.g>
        )
      })}

      {/* The floor: a plain dark oval in the middle */}
      <ellipse cx={CX} cy={CY} rx={FLOOR[0]} ry={FLOOR[1]} fill="#050505" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
    </svg>
  )
}
