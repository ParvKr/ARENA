// components/NavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isJudge = user?.arena_role === 'judge';
  const isAdmin = user?.arena_role === 'admin';
  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled && !mobileOpen;

  const initial = (user?.display_name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={[
          'fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300',
          isTransparent
            ? 'bg-transparent border-transparent'
            : 'bg-[#050507]/90 backdrop-blur-xl border-b border-[#1C1C26]',
        ].join(' ')}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">

          {/* ── Logo ── */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-display text-base font-black tracking-[0.2em] uppercase text-white group-hover:text-[#B06AFF] transition-colors duration-200">
              ARENA
            </span>
            {sprint?.sprint_status === 'live' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C5CFF] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
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
              <div className="ml-4 flex items-center gap-2 rounded-md border border-[#1C1C26] bg-[#0A0A0F] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF] animate-pulse" />
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
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#1C1C26] bg-[#0A0A0F] text-[#737380] transition-all hover:border-[#7C5CFF]/40 hover:text-[#B06AFF] hover:bg-[#101017]"
                >
                  <Bell className="h-4 w-4" />
                  {/* Unread dot — static for now, wire to announcements later */}
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
                </Link>

                {/* Avatar → direct link to profile */}
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 rounded-lg border border-[#1C1C26] bg-[#0A0A0F] px-3 py-1.5 transition-all hover:border-[#7C5CFF]/40 hover:bg-[#101017] group"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#B06AFF] font-display text-[11px] font-black text-white">
                    {initial}
                  </div>
                  <span className="font-mono text-xs text-[#A3A3B0] group-hover:text-[#F5F5F7] transition-colors">
                    @{user.username}
                  </span>
                  <RankBadge tier={user.rank_tier} size="sm" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-body text-sm text-[#737380] transition-colors hover:text-[#F5F5F7]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="group flex items-center gap-1.5 rounded-md bg-[#7C5CFF] px-4 py-1.5 font-body text-xs font-semibold text-white transition-all hover:bg-[#9070FF]"
                  style={{ boxShadow: '0 0 20px rgba(124,92,255,0.3)' }}
                >
                  Join
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 text-[#737380] hover:text-white transition-colors"
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
            className="fixed inset-x-0 top-14 z-40 border-b border-[#1C1C26] bg-[#050507]/98 backdrop-blur-xl px-6 py-6 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {isJudge ? (
                <MobileNavLink href="/judge" label="Judge Dashboard" pathname={pathname} />
              ) : (
                <>
                  {NAV_LINKS.map((link) => (
                    <MobileNavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                  ))}
                  {isAdmin && <MobileNavLink href="/admin" label="Admin" pathname={pathname} />}
                </>
              )}
            </nav>

            <div className="mt-6 flex flex-col gap-3 border-t border-[#1C1C26] pt-6">
              {user ? (
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 rounded-lg border border-[#1C1C26] bg-[#0A0A0F] px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#B06AFF] font-display text-sm font-black text-white">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-body text-sm font-semibold text-[#F5F5F7]">{user.display_name}</p>
                    <p className="truncate font-mono text-xs text-[#737380]">@{user.username}</p>
                  </div>
                  <RankBadge tier={user.rank_tier} size="sm" />
                </Link>
              ) : (
                <>
                  <Link href="/signin" className="rounded-lg border border-[#1C1C26] px-4 py-3 text-center font-body text-sm text-[#737380] hover:text-white">
                    Sign in
                  </Link>
                  <Link href="/signup" className="flex items-center justify-center gap-2 rounded-lg bg-[#7C5CFF] px-4 py-3 font-body text-sm font-semibold text-white" style={{ boxShadow: '0 0 20px rgba(124,92,255,0.3)' }}>
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
        'relative px-3 py-1.5 font-body text-sm transition-colors duration-150 rounded-md',
        active ? 'text-[#F5F5F7] bg-[#0A0A0F]' : 'text-[#737380] hover:text-[#F5F5F7] hover:bg-[#0A0A0F]/60',
      ].join(' ')}
    >
      {label}
      {active && (
        <motion.span layoutId="nav-indicator" className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 rounded-full bg-[#7C5CFF]" />
      )}
    </Link>
  );
}

function MobileNavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={[
        'flex items-center justify-between rounded-md px-4 py-3 font-body text-sm transition-colors',
        active ? 'bg-[#7C5CFF]/10 text-[#B06AFF] border border-[#7C5CFF]/20' : 'text-[#737380] hover:bg-[#0A0A0F] hover:text-white',
      ].join(' ')}
    >
      {label}
      {active && <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />}
    </Link>
  );
}
