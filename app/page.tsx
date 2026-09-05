'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

const WORDS = ['DESIGNERS', 'WRITERS', 'BUILDERS', 'CREATORS', 'STRATEGISTS']

const STATS = [
  { value: '72h', label: 'Sprint Window' },
  { value: '$5K+', label: 'In Prizes' },
  { value: '1,200+', label: 'Competitors' },
  { value: 'Top 10%', label: 'Get Ranked' },
]

const DISCIPLINES = [
  { number: '01', title: 'Visual Design', desc: 'Motion, identity, product UI. If it hits the eye, it belongs here.' },
  { number: '02', title: 'Copywriting', desc: 'Words that sell, persuade, and stick. The brief is real. The pressure is real.' },
  { number: '03', title: 'UI/UX Design', desc: 'Systems thinking under a deadline. Ship a prototype worth shipping.' },
  { number: '04', title: 'No-Code Building', desc: 'Webflow. Framer. Glide. Build fast or get left behind.' },
]

const RANKS = [
  { name: 'Contender', pts: '0 pts', color: '#737380', glow: 'rgba(115,115,128,0.4)' },
  { name: 'Rising', pts: '50+ pts', color: '#4ADE80', glow: 'rgba(74,222,128,0.4)' },
  { name: 'Ranked', pts: '150+ pts', color: '#60A5FA', glow: 'rgba(96,165,250,0.4)' },
  { name: 'Elite', pts: '350+ pts', color: '#A78BFA', glow: 'rgba(167,139,250,0.4)' },
  { name: 'Legend', pts: '700+ pts', color: '#FFD700', glow: 'rgba(255,215,0,0.5)' },
]

function AnimatedWord() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % WORDS.length), 2400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="h-[1.05em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="block bg-gradient-to-r from-[#7C5CFF] to-[#B06AFF] bg-clip-text text-transparent"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Vertical lines */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: `${(i + 1) * (100 / 7)}%`,
            background: 'linear-gradient(to bottom, transparent, rgba(124,92,255,0.06) 30%, rgba(124,92,255,0.06) 70%, transparent)',
          }}
        />
      ))}
      {/* Horizontal line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: '50%',
          background: 'linear-gradient(to right, transparent, rgba(124,92,255,0.08) 20%, rgba(124,92,255,0.08) 80%, transparent)',
        }}
      />
    </div>
  )
}

function TickerBar() {
  const items = ['VISUAL DESIGN', '·', 'COPYWRITING', '·', 'UI/UX DESIGN', '·', 'NO-CODE', '·', 'VIDEO EDITING', '·', 'STRATEGY', '·']
  const repeated = [...items, ...items, ...items]
  return (
    <div className="overflow-hidden border-y border-[#1C1C26] py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [0, '-33.33%'] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="font-mono text-xs tracking-[0.25em] uppercase text-[#737380]">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div ref={containerRef} className="relative bg-[#050507] text-[#F5F5F7] overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col pt-14">
        {/* Hero BG image with parallax */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <Image
            src="/arena-hero.jpg"
            alt="Arena"
            fill
            className="object-cover object-center opacity-70"
            priority
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/30 via-[#050507]/20 to-[#050507]" />
          {/* Subtle violet vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(124,92,255,0.08),transparent)]" />
        </motion.div>

        <GridLines />

        {/* Ticker at very top */}
        <TickerBar />

        {/* Main hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-[#2C2C3A] bg-[#0A0A0F]/80 backdrop-blur-sm px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C5CFF] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C5CFF]" />
            </span>
            <span className="font-mono text-xs tracking-widest uppercase text-[#A3A3B0]">Sprint 14 — Now Live</span>
          </motion.div>

          {/* Giant headline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-5xl"
          >
            <h1 className="font-display font-bold leading-[0.88] tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(4rem,12vw,9rem)] text-white"
              >
                THE ARENA
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(2.4rem,7vw,5.5rem)] font-semibold text-[#737380] mt-2"
              >
                FOR
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block text-[clamp(4rem,12vw,9rem)]"
              >
                <AnimatedWord />
              </motion.span>
            </h1>
          </motion.div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-10 max-w-xl text-lg leading-relaxed text-[#737380]"
          >
            Real briefs. Real deadlines. Real judgment. 
            {' '}<span className="text-[#A3A3B0] font-medium">Biweekly sprints</span> where the best work rises—and gets rewarded.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/sprint"
              className="group relative flex items-center gap-3 overflow-hidden rounded-lg bg-[#7C5CFF] px-8 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-[#9070FF]"
              style={{ boxShadow: '0 0 40px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              <span>View Live Sprint</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg border border-[#2C2C3A] bg-transparent px-8 py-3.5 font-body text-sm font-medium text-[#A3A3B0] transition-all hover:border-[#7C5CFF]/50 hover:text-white hover:bg-[#7C5CFF]/5"
            >
              Create Account — Free
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-20 flex items-center divide-x divide-[#1C1C26]"
          >
            {STATS.map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0 text-center">
                <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                <div className="mt-0.5 font-mono text-xs uppercase tracking-widest text-[#737380]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="relative z-10 flex justify-center pb-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-[#3A3A50]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="relative py-28 px-6 border-t border-[#1C1C26]">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#7C5CFF] mb-4">How it works</p>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] text-white">
              72 hours.<br />
              <span className="text-[#737380]">No excuses.</span>
            </h2>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1C1C26]">
            {[
              { n: '01', title: 'Get the Brief', body: 'Every sprint drops a real creative brief—client-grade, unambiguous, and on a countdown. Check your email.' },
              { n: '02', title: 'Do the Work', body: 'No tutorials. No hand-holding. 72 hours, your tools, your skills. Show up or get outranked.' },
              { n: '03', title: 'Get Judged. Rise.', body: 'Expert judges score every submission blind. Top performers earn points, prizes, and a public rank.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="bg-[#050507] p-8 group hover:bg-[#0A0A0F] transition-colors"
              >
                <span className="font-mono text-xs tracking-widest text-[#3A3A50]">{step.n}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-white group-hover:text-[#B06AFF] transition-colors">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#737380]">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCIPLINES ──────────────────────────────────────── */}
      <section className="relative py-28 px-6 border-t border-[#1C1C26]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#7C5CFF] mb-4">Disciplines</p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] text-white">
                Pick your<br /><span className="text-[#737380]">battlefield.</span>
              </h2>
            </motion.div>
            <p className="max-w-xs text-sm leading-relaxed text-[#737380]">
              Not everyone fights the same fight. Choose your discipline, compete against your peers, and build a body of work that speaks for itself.
            </p>
          </div>

          <div className="space-y-px bg-[#1C1C26]">
            {DISCIPLINES.map((d, i) => (
              <motion.div
                key={d.number}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex items-center justify-between gap-8 bg-[#050507] hover:bg-[#0A0A0F] px-8 py-7 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <span className="font-mono text-xs text-[#3A3A50] group-hover:text-[#7C5CFF] transition-colors w-6">{d.number}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#B06AFF] transition-colors">{d.title}</h3>
                    <p className="mt-1 text-sm text-[#737380] hidden sm:block">{d.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#3A3A50] group-hover:text-[#7C5CFF] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RANK SYSTEM ──────────────────────────────────────── */}
      <section className="relative py-28 px-6 border-t border-[#1C1C26] overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#7C5CFF] mb-4">Rank System</p>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] text-white">
              Your rank is public.<br />
              <span className="text-[#737380]">Earn it.</span>
            </h2>
            <p className="mt-6 max-w-lg mx-auto text-sm leading-relaxed text-[#737380]">
              Points compound across sprints. Show up consistently, beat your peers, and your rank becomes the credential that follows you.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {RANKS.map((rank, i) => (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="flex flex-col items-center gap-3 rounded-xl border border-[#1C1C26] bg-[#0A0A0F] px-8 py-6 transition-colors"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: rank.color, boxShadow: `0 0 12px ${rank.glow}` }}
                />
                <span className="font-display text-base font-bold text-white">{rank.name}</span>
                <span className="font-mono text-xs text-[#737380]">{rank.pts}</span>
              </motion.div>
            ))}
          </div>

          {/* Emblem showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 flex flex-col items-center gap-8"
          >
            <div className="relative">
              <div
                className="absolute inset-0 blur-3xl rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 70%)' }}
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/arena-emblem.jpg"
                  alt="Arena Legend Emblem"
                  width={180}
                  height={180}
                  className="relative z-10 rounded-2xl"
                  style={{ boxShadow: '0 0 60px rgba(124,92,255,0.3), 0 0 120px rgba(124,92,255,0.1)' }}
                />
              </motion.div>
            </div>
            <p className="font-mono text-xs tracking-widest uppercase text-[#3A3A50]">Legend Rank Emblem</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative py-40 px-6 border-t border-[#1C1C26] overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(124,92,255,0.06),transparent)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#7C5CFF] mb-8">Ready?</p>
          <h2 className="font-display text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.85] tracking-tight text-white">
            STOP LEARNING.
            <br />
            <span className="text-[#737380]">START</span>
            <br />
            COMPETING.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-[#737380] max-w-md mx-auto">
            The next sprint drops in <span className="text-white font-semibold">48 hours</span>. Your first entry is free. 
            There's no better time to find out where you actually stand.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#7C5CFF] px-10 py-4 font-body text-base font-semibold text-white transition-all hover:bg-[#9070FF]"
              style={{ boxShadow: '0 0 60px rgba(124,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              <span>Join the Arena</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[#1C1C26] px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold text-[#3A3A50] tracking-widest uppercase">Arena</span>
          <p className="font-mono text-xs text-[#3A3A50]">
            © 2026 Arena. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
