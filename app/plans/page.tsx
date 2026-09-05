'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, LogOut, Zap, Trophy, Crown, Star } from 'lucide-react';
import { useArenaStore } from '@/lib/store';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/api.types';

type RankTier = Profile['rank_tier'];

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: RankTier | null;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'contender',
    name: 'Contender',
    price: 'Free',
    period: 'forever',
    badge: 'Contender',
    icon: <Zap className="h-5 w-5" />,
    accentColor: '#737380',
    glowColor: 'rgba(115,115,128,0.15)',
    description: 'Enter the arena. Compete, earn XP, and climb the ranks.',
    features: [
      'Access to all public sprints',
      'Unlimited submissions',
      'Public rank & profile',
      'Sprint history & XP tracking',
      'Community leaderboard',
    ],
    cta: 'Current Free Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per month',
    badge: null,
    icon: <Star className="h-5 w-5" />,
    accentColor: '#7C5CFF',
    glowColor: 'rgba(124,92,255,0.15)',
    description: 'Unlock detailed feedback, analytics, and priority judging.',
    features: [
      'Everything in Contender',
      'Judge feedback on every submission',
      'Score breakdown & percentile rank',
      'Early sprint brief access (+24h)',
      'Priority submission queue',
      'Monthly 1:1 critique session',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$29',
    period: 'per month',
    badge: 'Elite',
    icon: <Trophy className="h-5 w-5" />,
    accentColor: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.15)',
    description: 'For serious competitors building a body of work that opens doors.',
    features: [
      'Everything in Pro',
      'Featured portfolio showcase',
      'Recruiter visibility & job board access',
      'Private elite-only sprint track',
      'Mentor office hours (2x/month)',
      'Arena certification on LinkedIn',
    ],
    cta: 'Upgrade to Elite',
  },
  {
    id: 'legend',
    name: 'Legend',
    price: '$79',
    period: 'per month',
    badge: 'Legend',
    icon: <Crown className="h-5 w-5" />,
    accentColor: '#FFD700',
    glowColor: 'rgba(255,215,0,0.12)',
    description: 'The highest tier. For those who compete to win — and get hired for it.',
    features: [
      'Everything in Elite',
      'Guaranteed judge panel seat offer',
      'White-glove portfolio review',
      'Direct recruiter introductions',
      'Legend badge & profile crown',
      'Lifetime Hall of Fame entry (Top 3 finishes)',
    ],
    cta: 'Upgrade to Legend',
  },
];

// Map rank tier to which plan they're currently on
const TIER_TO_PLAN: Record<RankTier, string> = {
  Contender: 'contender',
  Rising: 'contender',
  Ranked: 'contender',
  Elite: 'elite',
  Legend: 'legend',
};

import type { Variants } from 'framer-motion';

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function PlansPage() {
  const { user, setUser } = useArenaStore();
  const router = useRouter();

  const currentPlanId = user ? TIER_TO_PLAN[user.rank_tier as RankTier] ?? 'contender' : null;

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#050507] pt-14">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-14 h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(124,92,255,0.05),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[#7C5CFF]">Plans & Pricing</p>
          <h1 className="font-display text-5xl font-bold text-white md:text-6xl">
            Compete at your level.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[#737380]">
            Start free. Upgrade when you're ready to get serious about being seen.
          </p>

          {/* Current plan pill (logged-in users) */}
          {user && currentPlanId && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1C1C26] bg-[#0A0A0F] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
              <span className="font-mono text-xs text-[#A3A3B0]">
                You're on the{' '}
                <span className="font-bold text-white">
                  {PLANS.find((p) => p.id === currentPlanId)?.name}
                </span>{' '}
                plan
              </span>
            </div>
          )}
        </motion.div>

        {/* ── Plan cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className="relative flex flex-col rounded-2xl border bg-[#0A0A0F] p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: isCurrent
                    ? plan.accentColor + '60'
                    : plan.popular
                    ? '#7C5CFF40'
                    : '#1C1C26',
                  boxShadow: isCurrent || plan.popular
                    ? `0 0 40px ${plan.glowColor}`
                    : 'none',
                }}
              >
                {/* Popular badge */}
                {plan.popular && !isCurrent && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ background: '#7C5CFF', boxShadow: '0 0 16px rgba(124,92,255,0.5)' }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ background: plan.accentColor, boxShadow: `0 0 16px ${plan.glowColor}` }}
                  >
                    Your Plan
                  </div>
                )}

                {/* Plan icon + name */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: plan.glowColor, color: plan.accentColor }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-white">{plan.name}</h2>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="font-display text-4xl font-black text-white">{plan.price}</span>
                  {plan.price !== 'Free' && (
                    <span className="ml-1.5 font-mono text-xs text-[#737380]">/{plan.period}</span>
                  )}
                </div>

                <p className="mb-6 text-sm leading-relaxed text-[#737380]">{plan.description}</p>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#A3A3B0]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: plan.accentColor }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  disabled={isCurrent}
                  className="w-full rounded-lg py-2.5 font-body text-sm font-semibold transition-all"
                  style={
                    isCurrent
                      ? { background: plan.accentColor + '20', color: plan.accentColor, cursor: 'default' }
                      : { background: plan.accentColor, color: '#fff', boxShadow: `0 0 20px ${plan.glowColor}` }
                  }
                >
                  {isCurrent ? '✓ Current Plan' : plan.cta}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── FAQ strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 rounded-2xl border border-[#1C1C26] bg-[#0A0A0F] p-8"
        >
          <h3 className="mb-6 font-display text-xl font-bold text-white">Frequently asked</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { q: 'Can I change plans anytime?', a: 'Yes — upgrade or downgrade at any time. Billing is prorated.' },
              { q: 'Do free users compete against paid users?', a: 'Yes. Judging is blind. Your work is judged, not your plan.' },
              { q: 'What happens to my rank if I downgrade?', a: 'Your XP and rank are yours permanently — they never reset.' },
              { q: 'Is there a student discount?', a: 'Yes. Email us with your student ID for 50% off Pro or Elite.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-body text-sm font-semibold text-[#F5F5F7]">{q}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#737380]">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Sign out section ── */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#1C1C26] bg-[#0A0A0F] px-6 py-4"
          >
            <div>
              <p className="font-body text-sm font-medium text-[#F5F5F7]">Signed in as <span className="text-[#B06AFF]">@{user.username}</span></p>
              <p className="font-mono text-xs text-[#737380]">{user.rank_tier} · {user.total_points.toLocaleString()} XP</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-[#FF2D55]/20 bg-transparent px-5 py-2.5 font-body text-sm font-medium text-[#FF2D55] transition-all hover:bg-[#FF2D55]/10 hover:border-[#FF2D55]/50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
