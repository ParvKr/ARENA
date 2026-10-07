// components/hero/ArenaBackdrop.tsx
// Pre-graded black → red duotone photo (see scripts/bake-hero.mjs). Everything that moves
// here is transform-only so it stays on the compositor: the plate drifts against the pointer
// and a soft light follows it. No CSS filters, blend modes or per-frame masks.
'use client'

import Image from 'next/image'
import { motion, useTransform } from 'framer-motion'
import { EASE, type HeroPointer } from './shared'

const LIGHT = 560 // px diameter of the pointer light

// One static layer: red glow behind the subject, edge falloff, bottom fade, scanlines.
const STATIC_OVERLAY = [
  'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px)',
  'radial-gradient(circle at 50% 42%, rgba(255,43,28,0.2), transparent 55%)',
  'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(10,10,10,0.85) 100%)',
  'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.7) 22%, transparent 55%)',
].join(', ')

export function ArenaBackdrop({ pointer, reduce }: { pointer: HeroPointer; reduce: boolean }) {
  const { x, y, nx, ny } = pointer
  const driftX = useTransform(nx, (v) => (reduce ? 0 : v * -40))
  const driftY = useTransform(ny, (v) => (reduce ? 0 : v * -26))
  const lightX = useTransform(x, (v) => v - LIGHT / 2)
  const lightY = useTransform(y, (v) => v - LIGHT / 2)

  return (
    <div aria-hidden className="absolute inset-0 -z-10 bg-void">
      <motion.div
        style={{ x: driftX, y: driftY, willChange: 'transform' }}
        initial={reduce ? false : { opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        className="absolute -inset-[5%]"
      >
        <Image
          src="/arena-hero-duotone.jpg"
          alt=""
          fill
          sizes="110vw"
          preload
          className="object-cover"
        />
      </motion.div>

      <motion.div
        style={{
          x: lightX,
          y: lightY,
          width: LIGHT,
          height: LIGHT,
          willChange: 'transform',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,60,40,0.12) 35%, transparent 70%)',
        }}
        className="absolute left-0 top-0 rounded-full"
      />

      <div className="absolute inset-0" style={{ backgroundImage: STATIC_OVERLAY }} />
    </div>
  )
}
