// components/hero/ArenaBackdrop.tsx
// The hero's moving background: a looping, muted video of the arena. The plate drifts
// against the pointer and a soft light follows it (transform-only, so it stays on the
// compositor). The video pauses off-screen; reduced-motion and data-saver users get the
// poster frame instead. No CSS filters, blend modes or per-frame masks.
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView, useTransform } from 'framer-motion'
import { EASE, type HeroPointer } from './shared'

const LIGHT = 560 // px diameter of the pointer light
const VIDEO = '/arena-hero.mp4'
const POSTER = '/arena-hero-poster.jpg'

// One static layer: red glow behind the subject, edge falloff, bottom fade, scanlines.
const STATIC_OVERLAY = [
  'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)',
  'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(10,10,10,0.8) 100%)',
  'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.7) 22%, transparent 55%)',
].join(', ')

export function ArenaBackdrop({ pointer, reduce }: { pointer: HeroPointer; reduce: boolean }) {
  const { x, y, nx, ny } = pointer
  const driftX = useTransform(nx, (v) => (reduce ? 0 : v * -30))
  const driftY = useTransform(ny, (v) => (reduce ? 0 : v * -18))
  const lightX = useTransform(x, (v) => v - LIGHT / 2)
  const lightY = useTransform(y, (v) => v - LIGHT / 2)

  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrapRef)
  const [saveData, setSaveData] = useState(false)
  const [playing, setPlaying] = useState(false)
  const still = reduce || saveData

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (!conn?.saveData) return
    const raf = requestAnimationFrame(() => setSaveData(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Autoplay needs the *property* muted. Play while the hero is on screen; pause when it isn't.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    if (still) {
      v.pause()
      return
    }
    if (inView) void v.play().catch(() => {})
    else if (v.currentTime > 0) v.pause()
  }, [still, inView])

  // Browsers can refuse autoplay (Safari in Low Power Mode, for one). If so, the first click,
  // tap or key press starts it, which counts as the user gesture the browser wants.
  useEffect(() => {
    if (still || playing) return
    const kick = () => void videoRef.current?.play().catch(() => {})
    const events = ['pointerdown', 'keydown', 'touchend'] as const
    events.forEach((e) => window.addEventListener(e, kick, { once: true, passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, kick))
  }, [still, playing])

  return (
    <div ref={wrapRef} aria-hidden className="absolute inset-0 -z-10 bg-void">
      <motion.div
        style={{ x: driftX, y: driftY, willChange: 'transform' }}
        initial={reduce ? false : { opacity: 0, scale: 1.12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        className="absolute -inset-[4%]"
      >
        {still ? (
          <Image src={POSTER} alt="" fill sizes="110vw" preload className="object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={POSTER}
            disablePictureInPicture
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="hero-video absolute inset-0 h-full w-full object-cover"
          >
            <source src={VIDEO} type="video/mp4" />
          </video>
        )}
      </motion.div>

      <motion.div
        style={{
          x: lightX,
          y: lightY,
          width: LIGHT,
          height: LIGHT,
          willChange: 'transform',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,60,40,0.07) 35%, transparent 70%)',
        }}
        className="absolute left-0 top-0 rounded-full"
      />

      <div className="absolute inset-0" style={{ backgroundImage: STATIC_OVERLAY }} />
    </div>
  )
}
