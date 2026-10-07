// components/landing/Footer.tsx
import Link from 'next/link'

const LINKS = [
  { href: '/sprint', label: 'Sprint' },
  { href: '/results', label: 'Results' },
  { href: '/plans', label: 'Plans' },
  { href: '/signin', label: 'Sign in' },
  { href: '/signup', label: 'Create account' },
]

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-white/10 px-5 pt-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-smoke transition-colors hover:text-chalk">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-xs text-smoke">© 2026 Arena. All rights reserved.</p>
      </div>
      {/* Wordmark, cropped by the bottom of the page */}
      <p
        aria-hidden
        className="mx-auto mt-6 max-w-6xl translate-y-[14%] select-none text-center font-poster uppercase leading-[0.8] text-signal"
        style={{ fontSize: 'clamp(7rem, 30vw, 26rem)' }}
      >
        Arena
      </p>
    </footer>
  )
}
