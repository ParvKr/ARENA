// components/hero/shared.ts
// Pointer state shared by the hero layers (backdrop flashlight, parallax, cursor, HUD).
'use client'

import { useEffect, useRef, type RefObject } from 'react'
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'

export const EASE = [0.16, 1, 0.3, 1] as const

export interface HeroPointer {
  /** Raw pointer position in px, relative to the hero. */
  rawX: MotionValue<number>
  rawY: MotionValue<number>
  /** Spring-smoothed position in px. */
  x: MotionValue<number>
  y: MotionValue<number>
  /** Smoothed position normalised to -0.5 … 0.5 (0 = centre). */
  nx: MotionValue<number>
  ny: MotionValue<number>
}

/**
 * Tracks the pointer inside `ref`. Mouse/pen move the point directly; on touch
 * devices (no hover) the point drifts on its own so the hero still feels alive.
 * Reduced-motion users get a fixed point.
 */
export function useHeroPointer(ref: RefObject<HTMLElement | null>): HeroPointer {
  const reduce = useReducedMotion()
  const size = useRef({ w: 1, h: 1 })

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 120, damping: 22, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 120, damping: 22, mass: 0.6 })
  const nx = useTransform(x, (v) => v / size.current.w - 0.5)
  const ny = useTransform(y, (v) => v / size.current.h - 0.5)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const r = el.getBoundingClientRect()
      size.current = { w: r.width || 1, h: r.height || 1 }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    const place = (px: number, py: number) => {
      rawX.set(px)
      rawY.set(py)
    }
    const home = () => {
      place(size.current.w * 0.5, size.current.h * 0.42)
      x.jump(rawX.get())
      y.jump(rawY.get())
    }
    home()

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      place(e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerdown', onMove, { passive: true })

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })
    io.observe(el)

    const touchOnly = window.matchMedia('(hover: none)').matches
    if (touchOnly && !reduce) {
      const t0 = performance.now()
      const loop = (t: number) => {
        if (visible) {
          const s = (t - t0) / 1000
          const { w, h } = size.current
          place(w * (0.5 + 0.3 * Math.sin(s * 0.55)), h * (0.42 + 0.2 * Math.sin(s * 0.85 + 1)))
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onMove)
    }
  }, [ref, reduce, rawX, rawY, x, y])

  return { rawX, rawY, x, y, nx, ny }
}
