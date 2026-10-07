// components/NavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X, ArrowRight, Bell } from 'lucide-react';

import { RankBadge } from './RankBadge';
import { CountdownTimer } from './CountdownTimer';

import { useArenaStore } from '@/lib/store';
import { useCurrentSprint } from '@/hooks/useSprint';

const NAV_LINKS = [
  { href: '/sprint', label: 'Sprint' },
  { href: '/results', label: 'Results' },
  { href: '/plans', label: 'Plans' },
];

export function NavBar() {
  const pathname = usePathname();
  const { user } = useArenaStore();
  const { sprint } = useCurrentSprint();

  const [mobileOpen, setMobileOpen] = useState(false);

  // On the homepage the bar floats transparent over the hero, then turns solid once you scroll.
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  const overHero = pathname === '/' && !scrolled && !mobileOpen;

  const isJudge = user?.arena_role === 'judge';
  const isAdmin = user?.arena_role === 'admin';

  const initial = (user?.display_name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={[
          'fixed top-0 left-0 right-0 z-50 h-14 border-b transition-[background-color,border-color] duration-300',
          overHero ? 'border-transparent bg-transparent' : 'border-white/10 bg-void/95',
        ].join(' ')}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">

          {/* ── Logo ── */}
          <Link href="/" className="group flex items-center gap-2.5" onClick={closeMobile}>
            <span aria-hidden className="h-4 w-2 -skew-x-[18deg] bg-signal transition-transform duration-200 group-hover:scale-y-125" />
            <span className="font-poster text-xl tracking-[0.1em] uppercase text-chalk">
              ARENA
            </span>
            {sprint?.sprint_status === 'live' && (
              <span className="rounded-sm bg-signal px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-chalk">
                Live
              </span>
            )}
          </Link>

          {/* ── Desktop Center Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {isJudge ? (
              <NavLink href="/judge" label="Judge Dashboard" pathname={pathname} />
            ) : (
              <>
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                ))}
                {isAdmin && <NavLink href="/admin" label="Admin" pathname={pathname} />}
              </>
            )}
            {sprint?.close_at && sprint.sprint_status === 'live' && (
              <div className="ml-4 flex items-center gap-2 rounded-sm border border-white/15 bg-white/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
                <CountdownTimer targetDate={sprint.close_at} compact />
              </div>
            )}
          </nav>

          {/* ── Desktop Right ── */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Bell */}
                <Link
                  href="/plans"
                  aria-label="Announcements & plans"
                  className="relative flex h-8 w-8 items-center justify-center rounded-sm border border-white/15 bg-white/5 text-smoke transition-all hover:border-signal/60 hover:text-chalk"
                >
                  <Bell className="h-4 w-4" />
                  {/* Unread dot — static for now, wire to announcements later */}
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal" />
                </Link>

                {/* Avatar → direct link to profile */}
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 rounded-sm border border-white/15 bg-white/5 px-3 py-1.5 transition-all hover:border-signal/60 group"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal font-poster text-[11px] text-chalk">
                    {initial}
                  </div>
                  <span className="font-mono text-xs text-smoke group-hover:text-chalk transition-colors">
                    @{user.username}
                  </span>
                  <RankBadge tier={user.rank_tier} size="sm" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-body text-sm text-smoke transition-colors hover:text-chalk"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="group flex items-center gap-1.5 rounded-sm bg-signal px-4 py-1.5 font-body text-xs font-semibold text-chalk transition-all hover:bg-chalk hover:text-void"
                >
                  Join
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 text-smoke hover:text-chalk transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-14 z-40 border-b border-white/10 bg-void px-6 py-6 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {isJudge ? (
                <MobileNavLink href="/judge" label="Judge Dashboard" pathname={pathname} onNavigate={closeMobile} />
              ) : (
                <>
                  {NAV_LINKS.map((link) => (
                    <MobileNavLink key={link.href} href={link.href} label={link.label} pathname={pathname} onNavigate={closeMobile} />
                  ))}
                  {isAdmin && <MobileNavLink href="/admin" label="Admin" pathname={pathname} onNavigate={closeMobile} />}
                </>
              )}
            </nav>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
              {user ? (
                <Link
                  href={`/profile/${user.username}`}
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-sm border border-white/15 bg-white/5 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal font-poster text-sm text-chalk">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-body text-sm font-semibold text-chalk">{user.display_name}</p>
                    <p className="truncate font-mono text-xs text-smoke">@{user.username}</p>
                  </div>
                  <RankBadge tier={user.rank_tier} size="sm" />
                </Link>
              ) : (
                <>
                  <Link href="/signin" onClick={closeMobile} className="rounded-sm border border-white/15 px-4 py-3 text-center font-body text-sm text-smoke hover:text-chalk">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={closeMobile} className="flex items-center justify-center gap-2 rounded-sm bg-signal px-4 py-3 font-body text-sm font-semibold text-chalk">
                    Join Arena <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={[
        'group relative px-3 py-1.5 font-body text-sm transition-colors duration-150',
        active ? 'text-chalk' : 'text-smoke hover:text-chalk',
      ].join(' ')}
    >
      {label}
      <span
        aria-hidden
        className={[
          'absolute inset-x-3 bottom-0 h-0.5 origin-left bg-signal transition-transform duration-300',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        ].join(' ')}
      />
    </Link>
  );
}

function MobileNavLink({ href, label, pathname, onNavigate }: { href: string; label: string; pathname: string; onNavigate: () => void }) {
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        'flex items-center justify-between rounded-sm px-4 py-3 font-body text-sm transition-colors',
        active ? 'bg-signal/15 text-chalk border border-signal/40' : 'text-smoke hover:bg-white/5 hover:text-chalk',
      ].join(' ')}
    >
      {label}
      {active && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
    </Link>
  );
}
