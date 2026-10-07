// components/auth/Badge.tsx
// The competitor badge that sits beside the auth forms. It mirrors what you type, and a
// stamp lands on it (username cleared / taken, access granted). Decorative: the form
// carries the real status for screen readers.
'use client'

import { useEffect, useRef } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

export type BadgeStamp = 'cleared' | 'taken' | 'granted' | null

export interface BadgeState {
  mode: 'signin' | 'signup'
  /** Display name typed so far (sign up). */
  name?: string
  /** Handle (sign up) or the identifier typed so far (sign in). */
  handle?: string
  stamp?: BadgeStamp
  /** Sign in: badge is greyed out until access is granted. */
  locked?: boolean
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function handleText(handle: string) {
  if (!handle) return '@handle'
  return handle.includes('@') ? handle : `@${handle.replace(/^@/, '')}`
}

/** Deterministic bar widths from a string, so the barcode shifts as you type. */
function barsFor(seed: string) {
  let h = 2166136261
  const widths: number[] = []
  const src = seed || 'arena'
  for (let i = 0; i < 38; i++) {
    h ^= src.charCodeAt(i % src.length)
    h = Math.imul(h, 16777619)
    widths.push(1 + ((h >>> 24) % 3))
  }
  return widths
}

function Barcode({ seed, className = '' }: { seed: string; className?: string }) {
  const widths = barsFor(seed)
  // Pure running offsets: each bar starts after the previous bar plus a 2-unit gap.
  const xs = widths.map((_, i) => widths.slice(0, i).reduce((sum, w) => sum + w + 2, 0))
  const total = (xs[xs.length - 1] ?? 0) + (widths[widths.length - 1] ?? 1)
  return (
    <svg aria-hidden viewBox={`0 0 ${total} 36`} preserveAspectRatio="none" className={`h-9 w-full fill-current ${className}`}>
      {widths.map((w, i) => (
        <rect key={i} x={xs[i]} y={0} width={w} height={36} />
      ))}
    </svg>
  )
}

const STAMPS = {
  cleared: { text: ['Cleared'], cls: 'border-void text-void' },
  taken: { text: ['Taken'], cls: 'border-signal text-signal' },
  granted: { text: ['Access', 'granted'], cls: 'border-signal text-signal' },
} as const

function Stamp({ stamp, reduce }: { stamp: Exclude<BadgeStamp, null>; reduce: boolean }) {
  const s = STAMPS[stamp]
  return (
    <motion.div
      key={stamp}
      initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -26 }}
      animate={{ scale: 1, opacity: 1, rotate: -11 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ z: 22 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      className={`pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 rounded-md border-4 bg-white/85 px-4 py-1.5 text-center font-poster text-4xl uppercase leading-[0.95] ${s.cls}`}
    >
      {s.text.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </motion.div>
  )
}

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

// Resting pose: the card lies back at an angle with a casual twist, as if on a lit surface.
const REST_TILT = 44 // degrees back from facing the viewer
const REST_TWIST = -11 // degrees within the card's own plane

// Stacked "edge" layers just under the face give it thickness along the near edge.
const EDGES = [
  { z: -3, cls: 'bg-[#d4d4d4]' },
  { z: -6, cls: 'bg-[#b3b3b3]' },
  { z: -9, cls: 'bg-[#8e8e8e]' },
  { z: -12, cls: 'bg-[#6a6a6a]' },
]

export function Badge({ mode, name = '', handle = '', stamp = null, locked = false }: BadgeState) {
  const reduce = useReducedMotion() ?? false
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage)
  const lastMove = useRef(0)

  // The card settles onto the surface when the page loads.
  const tilt = useMotionValue(reduce ? REST_TILT : 84)
  useEffect(() => {
    if (reduce) return
    const controls = animate(tilt, REST_TILT, { type: 'spring', stiffness: 70, damping: 12, delay: 0.15 })
    return () => controls.stop()
  }, [reduce, tilt])

  // -1..1 targets: where the cursor is relative to the card (or a slow idle drift).
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const sx = useSpring(targetX, { stiffness: 110, damping: 16, mass: 0.6 })
  const sy = useSpring(targetY, { stiffness: 110, damping: 16, mass: 0.6 })
  const rotateX = useTransform([tilt, sy], ([t, y]: number[]) => (t ?? REST_TILT) - (y ?? 0) * 7)
  const rotateY = useTransform(sx, (v) => v * 10)
  const sheenX = useTransform(sx, (v) => v * 90)

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = stage.current?.getBoundingClientRect()
      if (!r) return
      targetX.set(clamp1((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)))
      targetY.set(clamp1((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)))
      lastMove.current = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, targetX, targetY])

  // No cursor for a few seconds (or touch): drift very slowly so the pose never looks frozen.
  useAnimationFrame((t) => {
    if (reduce || !inView) return
    if (performance.now() - lastMove.current > 3000) {
      targetX.set(0.4 * Math.sin(t / 2600))
      targetY.set(0.3 * Math.sin(t / 2100 + 1))
    }
  })

  const granted = stamp === 'granted'
  const signin = mode === 'signin'
  const dim = signin && locked && !granted

  const title = signin
    ? granted
      ? 'Welcome back'
      : 'Identify yourself'
    : name.trim() || 'Your name'
  const hasTitle = signin || name.trim().length > 0

  return (
    <div ref={stage} aria-hidden className="relative w-[340px] select-none" style={{ perspective: 1200 }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
        <div style={{ transform: `rotateZ(${REST_TWIST}deg) scale(1.14)`, transformStyle: 'preserve-3d' }} className="relative">
          {/* A pool of light on the surface under the card (no table, just where the light lands) */}
          <div
            className="absolute -inset-16 rounded-[50%]"
            style={{
              transform: 'translateZ(-14px)',
              backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.13), transparent 68%)',
            }}
          />

          {/* Thickness */}
          {EDGES.map((e) => (
            <div
              key={e.z}
              className={`absolute inset-0 rounded-3xl ${e.cls}`}
              style={{ transform: `translateZ(${e.z}px)` }}
            />
          ))}

          {/* Face */}
          <div
            className={`relative rounded-3xl bg-chalk p-5 text-void transition-shadow duration-500 ${
              granted ? 'ring-4 ring-signal' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="mx-auto mb-4 h-2.5 w-16 rounded-full bg-void/15" />

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-4 w-2 -skew-x-[18deg] bg-signal" />
                <span className="font-poster text-lg uppercase tracking-[0.1em]">Arena</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-void/60">Competitor</span>
            </div>

            <div style={{ transform: 'translateZ(5px)' }}>
              <div
                className={`relative mt-4 grid h-40 place-items-center overflow-hidden rounded-2xl transition-colors duration-500 ${
                  granted ? 'bg-signal text-chalk' : dim ? 'bg-void/20 text-void/40' : 'bg-void text-chalk'
                }`}
              >
                <span className="font-poster text-7xl leading-none">
                  {signin && !granted ? '?' : initialsOf(name)}
                </span>
                <span className="absolute right-0 top-0 h-0 w-0 border-l-[34px] border-t-[34px] border-l-transparent border-t-signal" />
              </div>
            </div>

            <div>
              <p
                className={`mt-4 truncate font-poster text-3xl uppercase leading-none ${
                  hasTitle && !dim ? 'text-void' : 'text-void/30'
                }`}
              >
                {title}
              </p>
              <p className={`mt-1.5 truncate font-mono text-sm ${handle ? 'text-void' : 'text-void/35'}`}>
                {handleText(handle)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t-2 border-void pt-3">
              <span className="rounded-full border-2 border-void px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider">
                {signin ? (granted ? 'Cleared' : 'Locked') : 'Contender'}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-void/60">
                {signin ? 'Sprint entrant' : '0 pts'}
              </span>
            </div>

            <Barcode seed={handle || name} className="mt-4 text-void" />

            <AnimatePresence>{stamp && <Stamp stamp={stamp} reduce={reduce} />}</AnimatePresence>

            {/* Glare: a pre-rendered gradient that slides across as the card tilts (no filters) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <motion.div
                style={{
                  x: sheenX,
                  backgroundImage:
                    'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.5) 50%, transparent 62%)',
                }}
                className="absolute -inset-x-1/2 inset-y-0"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/** Phones: the same idea as a slim strip above the form. */
export function BadgeStrip({ mode, name = '', handle = '', stamp = null, locked = false }: BadgeState) {
  const signin = mode === 'signin'
  const granted = stamp === 'granted'
  const dim = signin && locked && !granted
  const title = signin ? (granted ? 'Welcome back' : 'Identify yourself') : name.trim() || 'Your name'
  const chip = stamp ? STAMPS[stamp].text.join(' ') : signin ? 'Locked' : 'Contender'

  return (
    <div aria-hidden className="flex items-center gap-3 rounded-2xl bg-chalk p-3 text-void">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-poster text-2xl ${
          granted ? 'bg-signal text-chalk' : dim ? 'bg-void/20 text-void/40' : 'bg-void text-chalk'
        }`}
      >
        {signin && !granted ? '?' : initialsOf(name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-poster text-xl uppercase leading-none">{title}</span>
        <span className="mt-1 block truncate font-mono text-xs text-void/70">{handleText(handle)}</span>
      </span>
      <span
        className={`shrink-0 rounded-full border-2 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
          stamp === 'taken' || granted ? 'border-signal text-signal' : 'border-void'
        }`}
      >
        {chip}
      </span>
    </div>
  )
}
