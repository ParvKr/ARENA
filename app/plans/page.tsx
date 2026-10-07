'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { LogOut, Plus } from 'lucide-react';
import { useArenaStore } from '@/lib/store';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { EASE } from '@/components/hero/shared';
import { ArenaMap } from '@/components/plans/ArenaMap';
import { PlanDetail } from '@/components/plans/PlanDetail';
import { FAQ, PLANS } from '@/components/plans/plans';

export default function PlansPage() {
  const reduce = useReducedMotion() ?? false;
  const { user, setUser } = useArenaStore();
  const router = useRouter();

  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  // Hover previews a tier; leaving the diagram returns to the selected one.
  const active = hover ?? selected;
  const plan = PLANS[active] ?? PLANS[0]!;

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8">
      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <motion.header
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h1 className="font-poster text-[clamp(3rem,7vw,6rem)] uppercase leading-[0.88]">
              Choose
              <br />
              your <span className="text-signal">seat.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              Free to compete. Judging is blind, so your plan never touches your score.
            </p>
            {user && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-mono text-xs text-smoke">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                Your plan: <span className="font-bold text-chalk">Free</span>
              </p>
            )}
          </motion.header>

          <div className="mt-10">
            <ArenaMap
              labels={PLANS.map((p) => p.name)}
              active={active}
              onHover={setHover}
              onSelect={setSelected}
            />
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-smoke">
              Everyone competes in the same arena. Higher seats give you a closer view: more feedback and more
              visibility.
            </p>

            {/* The accessible control for the diagram; it mirrors the rings, hover included */}
            <div role="group" aria-label="Choose a plan" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLANS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={i === selected}
                  onClick={() => setSelected(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                    i === active
                      ? 'border-signal bg-signal text-chalk'
                      : 'border-white/20 text-chalk hover:border-white/50'
                  }`}
                >
                  <span className="block font-poster text-xl uppercase leading-none">{p.name}</span>
                  <span className={`mt-1 block font-mono text-xs ${i === active ? 'text-white/85' : 'text-smoke'}`}>
                    {p.price}
                    {p.period ? ' / mo' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:pt-2">
          <PlanDetail plan={plan} signedIn={!!user} />
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-poster text-4xl uppercase leading-none sm:text-5xl">Good to know</h2>
        <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-bold marker:hidden [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="h-5 w-5 shrink-0 text-signal transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/75">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {user && (
        <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/15 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-base font-semibold">
              Signed in as <span className="text-signal">@{user.username}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-smoke">
              {user.rank_tier} · {user.total_points.toLocaleString()} XP
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-display text-sm font-bold text-chalk transition-colors hover:border-signal hover:bg-signal"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
