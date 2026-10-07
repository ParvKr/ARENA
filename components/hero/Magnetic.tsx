// components/hero/Magnetic.tsx
// Pulls its child a little toward the mouse while hovered. Mouse only; off for reduced motion.
'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function Magnetic({
  children,
  reduce,
  strength = 0.28,
}: {
  children: React.ReactNode
  reduce: boolean
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 16 })
  const y = useSpring(my, { stiffness: 220, damping: 16 })

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - (r.left + r.width / 2)) * strength)
        my.set((e.clientY - (r.top + r.height / 2)) * strength * 1.4)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
