// components/hero/StepBars.tsx
// The three stages of a sprint as segmented progress bars. Advances on its own
// (paused on hover/focus, off for reduced motion); each segment is also a button.
'use client'

import { useState } from 'react'

const STEPS = [
  { title: 'Get the brief', body: 'A real, client-grade brief drops on a countdown.' },
  { title: 'Do the work', body: '72 hours, your tools, your skills.' },
  { title: 'Get judged', body: 'Blind scoring. Top work earns points, prizes and a public rank.' },
]

export function StepBars({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0)
  const next = () => setActive((a) => (a + 1) % STEPS.length)

  return (
    <div className="step-bars grid grid-cols-3 gap-3 sm:gap-6" role="group" aria-label="How a sprint works">
      {STEPS.map((step, i) => {
        const isActive = i === active
        const done = i < active
        return (
          <button
            key={step.title}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={isActive}
            data-cursor="View"
            className="group text-left outline-none"
          >
            <span className="relative block h-[3px] w-full bg-white/20 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-white">
              {done && <span className="absolute inset-0 bg-chalk" />}
              {isActive && (
                <span
                  key={active}
                  className="step-fill absolute inset-0 bg-signal"
                  onAnimationEnd={reduce ? undefined : next}
                />
              )}
            </span>
            <span
              className={`mt-3 flex items-baseline gap-2 font-poster text-lg uppercase leading-none transition-colors sm:text-2xl ${
                isActive ? 'text-chalk' : 'text-white/35 group-hover:text-white/70'
              }`}
            >
              <span className="font-mono text-[10px] tracking-widest text-signal sm:text-xs">0{i + 1}</span>
              {step.title}
            </span>
            <span
              className={`mt-2 hidden max-w-[34ch] text-sm leading-snug transition-colors sm:block ${
                isActive ? 'text-smoke' : 'text-transparent'
              }`}
            >
              {step.body}
            </span>
          </button>
        )
      })}
    </div>
  )
}
