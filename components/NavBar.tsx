// components/ui/NavBar.tsx
// Global application layout navigation hub featuring real-time sprint timers and role-based link paths.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { RankBadge } from './RankBadge';
import { CountdownTimer } from './CountdownTimer';

import { useArenaStore } from '@/lib/store';
import { useCurrentSprint } from '@/hooks/useSprint';

export function NavBar() {
  const pathname = usePathname();

  // ── Context Slices & Structured Queries Data Hub ───────────────────────
  const { user } = useArenaStore();
  const { sprint } = useCurrentSprint();

  const [scrolled, setScrolled] = useState(false);

  // Structural Role and Routing Computations
  const isSprintPage = pathname === '/sprint';
  const isJudge = user?.arena_role === 'judge';
  const isAdmin = user?.arena_role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay: 0.2,
      }}
      className={[
        'fixed top-0 left-0 right-0 z-50 h-16',
        'flex items-center justify-between px-6',
        'border-b border-arena-border',
        'transition-all duration-300',
        scrolled || !isSprintPage
          ? 'bg-arena-bg/90 backdrop-blur-md'
          : 'bg-transparent border-transparent',
      ].join(' ')}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display font-extrabold text-xl text-arena-red tracking-wider hover:opacity-80 transition-opacity"
      >
        ARENA
      </Link>

      {/* Center — countdown on sprint page, nav links elsewhere */}
      <div className="flex items-center gap-6">
        {/* Logical Fix 1: Maps directly to authoritative close_at database schemas */}
        {isSprintPage && sprint?.close_at ? (
          <CountdownTimer
            targetDate={sprint.close_at}
            compact
          />
        ) : isJudge ? (
          <Link
            href="/judge"
            className={navLinkClass('/judge', pathname)}
          >
            Judge Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sprint"
              className={navLinkClass('/sprint', pathname)}
            >
              Sprint
            </Link>

            {!isJudge && (
              <Link
                href="/results"
                className={navLinkClass('/results', pathname)}
              >
                Results
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={navLinkClass('/admin', pathname)}
              >
                Admin
              </Link>
            )}
          </>
        )}
      </div>

      {/* Right — auth / profile */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <RankBadge
              tier={user.rank_tier}
              size="sm"
            />

            <Link
              href={`/profile/${user.username}`}
              className="w-8 h-8 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center text-xs font-display font-bold text-arena-gray hover:border-arena-red transition-colors"
            >
              {/* Logical Fix 2: Optional chaining prevents string evaluation crashes */}
              {user.username?.[0]?.toUpperCase() ?? 'U'}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="text-sm text-arena-gray hover:text-arena-offwhite transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="text-sm px-4 py-1.5 bg-arena-red text-white font-semibold rounded hover:bg-red-500 transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

function navLinkClass(
  href: string,
  pathname: string
): string {
  const active =
    pathname === href ||
    pathname.startsWith(href + '/');

  return [
    'text-sm font-medium transition-colors duration-150 pb-0.5',
    active
      ? 'text-arena-white border-b-2 border-arena-red'
      : 'text-arena-gray hover:text-arena-offwhite',
  ].join(' ');
}