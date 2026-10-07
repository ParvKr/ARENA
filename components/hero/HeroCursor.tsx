// components/hero/HeroCursor.tsx
// A trailing ring that follows the pointer inside the hero and grows into a labelled
// disc over anything marked data-cursor="…". The native cursor stays visible.
'use client'

import { motion, useSpring } from 'framer-motion'
import type { HeroPointer } from './shared'

interface HeroCursorProps {
  pointer: HeroPointer
  /** Label of the hovered data-cursor target, or null. */
  label: string | null
  visible: boolean
}

export function HeroCursor({ pointer, label, visible }: HeroCursorProps) {
  const x = useSpring(pointer.rawX, { stiffness: 420, damping: 34, mass: 0.4 })
  const y = useSpring(pointer.rawY, { stiffness: 420, damping: 34, mass: 0.4 })
  const grown = label !== null

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute left-0 top-0 z-30 hidden pointer-fine:block"
    >
      <motion.div
        animate={{ scale: grown ? 1 : 34 / 92, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className={`-translate-x-1/2 -translate-y-1/2 h-[92px] w-[92px] rounded-full border ${
          grown ? 'border-signal bg-signal' : 'border-white'
        }`}
      />
      {grown && (
        <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-widest text-chalk">
          {label}
        </span>
      )}
    </motion.div>
  )
}
