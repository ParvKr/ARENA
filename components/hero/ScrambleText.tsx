// components/hero/ScrambleText.tsx
// Text that starts as glitch noise and decodes left-to-right.
'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const GLYPHS = '^+\\_#<>[]{}=*/|'
const FRAME_MS = 45

function noisy(text: string, resolved: number) {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    out += c === ' ' || i < resolved ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  }
  return out
}

interface ScrambleTextProps {
  text: string
  /** ms before decoding starts (the text shows noise until then). */
  delay?: number
  /** ms the decode takes. */
  duration?: number
  className?: string
}

export function ScrambleText({ text, delay = 0, duration = 900, className }: ScrambleTextProps) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (reduce) return
    let raf = 0
    let start: number | null = null
    let last = 0

    const frame = (t: number) => {
      if (start === null) start = t
      if (t - last >= FRAME_MS) {
        last = t
        const p = Math.min(1, Math.max(0, (t - start - delay) / duration))
        setOut(p >= 1 ? text : noisy(text, Math.floor(p * text.length)))
        if (p >= 1) return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [text, delay, duration, reduce])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{reduce ? text : out}</span>
    </span>
  )
}
