// components/landing/Disciplines.tsx
// The loud section: solid red, huge poster rows. Hover flips a row to black.
'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { EASE } from '@/components/hero/shared'

const DISCIPLINES = [
  { title: 'Visual design', desc: 'Motion, identity, product UI. If it hits the eye, it belongs here.' },
  { title: 'Copywriting', desc: 'Words that sell, persuade and stick. The brief is real. So is the pressure.' },
  { title: 'UI/UX design', desc: 'Systems thinking under a deadline. Ship a prototype worth shipping.' },
  { title: 'No-code building', desc: 'Webflow. Framer. Glide. Build fast or get left behind.' },
]

export function Disciplines() {
  return (
    <section className="bg-signal px-5 py-24 text-chalk sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="font-poster text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.88]">
            Pick your
            <br />
            battlefield.
          </h2>
          <p className="max-w-xs text-base leading-relaxed text-void">
            Not everyone fights the same fight. Choose a discipline, compete against your peers and
            build a body of work that speaks for itself.
          </p>
        </div>

        <ul className="border-t-2 border-void">
          {DISCIPLINES.map((d, i) => (
            <li key={d.title} className="group border-b-2 border-void">
              <div className="flex items-center justify-between gap-6 px-2 py-5 transition-colors duration-200 hover:bg-void sm:px-4 sm:py-7">
                <div className="flex min-w-0 items-baseline gap-4 sm:gap-8">
                  <span className="font-mono text-xs text-void transition-colors group-hover:text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* The wrapper (not the clipped child) is what the viewport observer watches */}
                  <motion.span
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ staggerChildren: 0 }}
                    className="block overflow-hidden"
                  >
                    <motion.span
                      variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                      className="block font-poster text-[clamp(2.5rem,9vw,8rem)] uppercase leading-[1.02] transition-transform duration-300 group-hover:translate-x-3"
                    >
                      {d.title}
                    </motion.span>
                  </motion.span>
                </div>
                <div className="flex shrink-0 items-center gap-6">
                  <p className="hidden max-w-[26ch] text-sm leading-snug text-void transition-colors group-hover:text-white/70 lg:block">
                    {d.desc}
                  </p>
                  <ArrowUpRight className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-10 sm:w-10" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
