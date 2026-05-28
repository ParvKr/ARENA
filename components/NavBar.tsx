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
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled || !isSprintPage
          ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-black text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tighter"
        >
          ARENA
        </Link>

        {/* Center — countdown on sprint page, nav links elsewhere */}
        <div className="hidden md:flex items-center gap-8">
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
              Judge
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
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <RankBadge
                tier={user.rank_tier}
                size="sm"
              />

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/profile/${user.username}`}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-display font-black text-white hover:shadow-lg hover:shadow-cyan-500/40 transition-all border border-white/10"
                >
                  {user.username?.[0]?.toUpperCase() ?? 'U'}
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="text-sm px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  Sign up
                </Link>
              </motion.div>
            </>
          )}
        </div>
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
    'text-sm font-semibold transition-all duration-200 pb-2 border-b-2',
    active
      ? 'text-cyan-400 border-cyan-400'
      : 'text-gray-400 border-transparent hover:text-white hover:border-white/20',
  ].join(' ');
}
