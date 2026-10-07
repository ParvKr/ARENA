// components/hero/Hero.tsx
// Homepage hero — "the arena floor": black / signal red / white.
'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useTransform } from 'framer-motion'
import { useCurrentSprint } from '@/hooks/useSprint'
import { ArenaBackdrop } from './ArenaBackdrop'
import { HeroCursor } from './HeroCursor'
import { HeroDock } from './HeroDock'
import { HeroMarquee } from './HeroMarquee'
import { JudgeStroke } from './JudgeStroke'
import { ScrambleText } from './ScrambleText'
import { EASE, useHeroPointer } from './shared'
import { StepBars } from './StepBars'
import { Stickers } from './Stickers'

const WORDS = ['designers', 'writers', 'builders', 'creators', 'strategists']

function Letters({ word, delay, reduce, alt = false }: { word: string; delay: number; reduce: boolean; alt?: boolean }) {
  return (
    <span aria-hidden className="inline-flex">
      {word.split('').map((ch, i) => (
        <span key={i} className="-mb-[0.06em] -mt-[0.1em] inline-block overflow-hidden pb-[0.06em] pt-[0.1em]">
          <motion.span
            className={`${alt ? 'hero-letter-alt' : 'hero-letter'} inline-block`}
            initial={reduce ? false : { y: '112%', rotate: 7 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 1, delay: delay + i * 0.07, ease: EASE }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function RollingWord({ reduce }: { reduce: boolean }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(t)
  }, [reduce])

  return (
    <span className="relative inline-block h-[1.25em] overflow-hidden bg-chalk px-2 align-bottom text-void">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="block leading-[1.25]"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const reduce = useReducedMotion() ?? false
  const ref = useRef<HTMLElement>(null)
  const pointer = useHeroPointer(ref)
  const { sprint } = useCurrentSprint()

  const [cursorLabel, setCursorLabel] = useState<string | null>(null)
  const [inside, setInside] = useState(false)

  const coords = useTransform([pointer.nx, pointer.ny], ([a = 0, b = 0]: number[]) =>
    `x ${(a + 0.5).toFixed(2)}  y ${(b + 0.5).toFixed(2)}`
  )

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-void text-chalk"
      onPointerEnter={() => setInside(true)}
      onPointerLeave={() => {
        setInside(false)
        setCursorLabel(null)
      }}
      onPointerOver={(e) => {
        const target = (e.target as Element).closest('[data-cursor]')
        setCursorLabel(target?.getAttribute('data-cursor') ?? null)
      }}
    >
      <ArenaBackdrop pointer={pointer} reduce={reduce} />

      <div className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-[84px] sm:px-8">
        {/* HUD */}
        <div className="flex items-start justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
          <ScrambleText text="Biweekly creative sprints" delay={300} />
          <div className="hidden text-right sm:block">
            <motion.span className="block tabular-nums">{coords}</motion.span>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-1 items-center py-6">
          <div className="relative w-full">
            <h1
              aria-label="Prove it."
              className="font-poster uppercase leading-[0.82] tracking-tight"
              style={{ fontSize: 'clamp(4.5rem, min(26vw, calc((100svh - 32.5rem) / 1.75)), 24rem)' }}
            >
              <span className="block">
                <Letters word="PROVE" delay={0.45} reduce={reduce} />
              </span>
              <span className="block text-right text-signal">
                <Letters word="IT." delay={0.85} reduce={reduce} alt />
              </span>
            </h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.5, ease: EASE }}
              className="mt-6 max-w-[34ch] md:absolute md:bottom-3 md:left-0 md:mt-0"
            >
              <p className="font-display text-xl font-bold leading-tight sm:text-2xl">
                Built for <RollingWord reduce={reduce} />
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/75">
                Real briefs. Real deadlines. Real judgment. Biweekly sprints where the best work rises
                and gets rewarded.
              </p>
            </motion.div>
          </div>
        </div>

        <HeroDock sprint={sprint} reduce={reduce} />

        <div className="mt-6 sm:mt-8">
          <StepBars reduce={reduce} />
        </div>
      </div>

      <HeroMarquee reduce={reduce} />

      <Stickers pointer={pointer} reduce={reduce} />
      <JudgeStroke reduce={reduce} />
      <HeroCursor pointer={pointer} label={cursorLabel} visible={inside} />
    </section>
  )
}
