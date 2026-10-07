// components/auth/AuthShell.tsx
// Shared layout for sign in and sign up: a sticky column with the live competitor badge on
// the left (desktop), the form on the right. On phones the badge becomes a slim strip.
'use client'

import Link from 'next/link'
import { Badge, BadgeStrip, type BadgeState } from './Badge'

interface AuthShellProps {
  badge: BadgeState
  blurb: string
  children: React.ReactNode
}

const DOT_GRID = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Arena, home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="h-5 w-2.5 -skew-x-[18deg] bg-signal" />
      <span className="font-poster text-2xl uppercase tracking-[0.1em] text-chalk">Arena</span>
    </Link>
  )
}

export function AuthShell({ badge, blurb, children }: AuthShellProps) {
  return (
    <div className="min-h-svh bg-void text-chalk lg:grid lg:grid-cols-[1fr_1.05fr]" style={DOT_GRID}>
      {/* Desktop: sticky badge column, so a tall form can never stretch or clip it */}
      <aside className="hidden p-10 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:items-center lg:justify-between xl:p-14">
        <Logo className="self-start" />
        <div className="-mt-6">
          <Badge {...badge} />
        </div>
        <p className="max-w-xs text-center text-base leading-relaxed text-white/70">{blurb}</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-5 lg:hidden">
            <Logo />
            <BadgeStrip {...badge} />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
