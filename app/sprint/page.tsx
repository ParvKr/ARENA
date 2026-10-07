// The current sprint, presented as a case file: a reading column on the left and a sticky
// rail (clock, prizes, entries, the one action) on the right.
'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useCurrentSprint, useMySubmission } from '@/hooks/useSprint';
import { useArenaStore } from '@/lib/store';
import { EASE } from '@/components/hero/shared';
import { BriefBlock } from '@/components/sprint/BriefBlock';
import { Clock } from '@/components/sprint/Clock';
import { EntryCount } from '@/components/sprint/EntryCount';
import { PrizePodium } from '@/components/sprint/PrizePodium';
import { SprintSkeleton } from '@/components/sprint/SprintSkeleton';
import { StatusStamp } from '@/components/sprint/StatusStamp';
import { SubmitPanel } from '@/components/sprint/SubmitPanel';
import { useSprintPhase } from '@/components/sprint/useSprintPhase';
import type { BriefContent, PrizeData, Sprint } from '@/types/api.types';

export default function SprintPage() {
  const { sprint, entryCount, isLoading } = useCurrentSprint();

  if (isLoading) return <SprintSkeleton />;
  if (!sprint) return <NoSprint />;
  return <SprintView sprint={sprint} entryCount={entryCount} />;
}

function SprintView({ sprint, entryCount }: { sprint: Sprint; entryCount: number }) {
  const reduce = useReducedMotion() ?? false;
  const { user } = useArenaStore();
  const { submission } = useMySubmission(sprint.id);
  const phase = useSprintPhase(sprint);

  const brief = sprint.brief_content as BriefContent;
  const prize = sprint.prize_data as PrizeData;

  const action = <SubmitPanel sprint={sprint} phase={phase} user={user} existingSubmission={submission} />;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-32 pt-24 sm:px-8 lg:pb-24">
      <header className="relative">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke">
          <span>Sprint {String(sprint.sprint_number).padStart(2, '0')}</span>
          <span className="rounded-full border border-white/25 px-3 py-1 text-chalk">{sprint.discipline}</span>
        </p>
        <h1 className="mt-5 max-w-4xl break-words font-poster text-[clamp(2.75rem,8vw,6.5rem)] uppercase leading-[0.9]">
          {sprint.title}
        </h1>
        <div className="mt-6 lg:absolute lg:right-0 lg:top-0 lg:mt-0">
          <StatusStamp phase={phase} />
        </div>
      </header>

      <div className="mt-12 flex flex-col gap-12 lg:grid lg:grid-cols-[1fr_340px] lg:gap-16">
        {/* The rail: first on phones (clock and prizes before the reading), sticky on desktop */}
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="space-y-6 rounded-2xl border border-white/15 bg-white/[0.03] p-6 max-lg:order-first lg:sticky lg:top-24 lg:order-last lg:self-start"
        >
          <Clock closeAt={sprint.close_at} phase={phase} />
          <div className="border-t border-white/10 pt-6">
            <PrizePodium prize={prize} />
          </div>
          <div className="border-t border-white/10 pt-6">
            <EntryCount count={entryCount} sprintId={sprint.id} live={phase === 'open'} />
          </div>
          <div className="hidden border-t border-white/10 pt-6 lg:block">{action}</div>
        </motion.aside>

        <article className="min-w-0 space-y-12">
          <BriefBlock label="Context" content={brief.context} />
          <BriefBlock label="Challenge" content={brief.challenge} lead />
          <BriefBlock label="Constraints" content={brief.constraints} list />
          <BriefBlock label="Criteria" content={brief.criteria} />
          <BriefBlock label="Timeline" content={brief.timeline} />
        </article>
      </div>

      {/* Phones: the action stays within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-void/95 p-4 lg:hidden">{action}</div>
    </div>
  );
}

function NoSprint() {
  const { user } = useArenaStore();
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl flex-col justify-center px-5 pt-24 sm:px-8">
      <h1 className="font-poster text-[clamp(2.75rem,8vw,6rem)] uppercase leading-[0.9]">
        No sprint is live
        <br />
        <span className="text-signal">right now.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
        The next brief hasn&apos;t dropped yet. {user ? 'Look back at the last results while you wait.' : 'Make an account so you\'re ready, or look back at the last results.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {!user && (
          <Link
            href="/signup"
            className="rounded-full bg-signal px-7 py-3.5 font-display text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-void"
          >
            Create a free account
          </Link>
        )}
        <Link
          href="/results"
          className="rounded-full border border-white/30 px-7 py-3.5 font-display text-base font-bold text-chalk transition-colors hover:border-chalk hover:bg-white/10"
        >
          See the results
        </Link>
      </div>
    </div>
  );
}
