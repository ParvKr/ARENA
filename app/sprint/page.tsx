// Arena V0.1
'use client';

import { motion, type Variants } from 'framer-motion';
import { useCurrentSprint, useMySubmission } from '@/hooks/useSprint';
import { useArenaStore } from '@/lib/store';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SubmitButton } from '@/components/SubmitButton';
import { BriefSection } from '@/components/BriefSection';
import { EntryCountTicker } from '@/components/EntryCountTicker';
import { SprintPageSkeleton } from '@/components/SkeletonLoaders';
import { DisciplineChip } from '@/components/DisciplineChip';
import type { BriefContent, PrizeData, Sprint } from '@/types/api.types';

// Hardened animation configurations mapped using explicit Framer Motion types 
// to ensure values like ease: 'easeOut' do not widen to a generic primitive string
const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function SprintPage() {
  const { sprint, entryCount, isLoading } = useCurrentSprint();
  const { user } = useArenaStore();
  const { submission } = useMySubmission(sprint?.id ?? null);

  if (isLoading) return <SprintPageSkeleton />;

  // Structural Guard: Narrowing down types so sprint is guaranteed non-null downstream
  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="font-display text-4xl font-extrabold text-arena-offwhite">
          No active sprint.
        </p>

        <p className="text-arena-gray">
          Next Sprint drops Friday 6pm. Sign up to be notified.
        </p>
      </div>
    );
  }

  // Type Safety Mapping: Safe type alignment from our full-stack interface registries
  const brief = sprint.brief_content as BriefContent;
  const prize = sprint.prize_data as PrizeData;
  const currentStatus = sprint.sprint_status; // Aligns perfectly with 001_initial_schema.sql

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Sprint header */}
      <motion.div variants={item} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-arena-gray text-sm">
            Sprint #{sprint.sprint_number}
          </span>

          <DisciplineChip discipline={sprint.discipline} />

          <StatusBadge status={currentStatus} />
        </div>

        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-arena-white">
          {sprint.title}
        </h1>

        {sprint.close_at && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-arena-gray">Closes in:</span>

            <CountdownTimer targetDate={sprint.close_at} />
          </div>
        )}
      </motion.div>

      {/* Prize banner */}
      <motion.div
        box-target="prize-banner"
        variants={item}
        className="border border-arena-gold/30 rounded-lg p-4 bg-arena-gold-dim flex items-center gap-4"
      >
        <div>
          <p className="text-xs text-arena-gold font-bold tracking-widest uppercase">
            First Place Award
          </p>

          <p className="text-arena-offwhite font-medium">
            {prize.first?.description}
          </p>
        </div>
      </motion.div>

      {/* Brief content */}
      <motion.div variants={item} className="space-y-6">
        <BriefSection
          label="Context"
          content={brief.context}
        />

        <BriefSection
          label="Challenge"
          content={brief.challenge}
          accent
        />

        <BriefSection
          label="Constraints"
          content={brief.constraints}
          mono
        />

        <BriefSection
          label="Criteria"
          content={brief.criteria}
        />

        <BriefSection
          label="Timeline"
          content={brief.timeline}
        />
      </motion.div>

      {/* Entry count tracking telemetry */}
      {currentStatus === 'live' && (
        <motion.div variants={item}>
          <EntryCountTicker
            count={entryCount}
            sprintId={sprint.id}
          />
        </motion.div>
      )}

      {/* Submit CTA */}
      <motion.div
        variants={item}
        className="sticky bottom-4 md:static"
      >
        <SubmitButton
          sprint={sprint} // Narrowed to a confirmed non-null object context
          user={user}
          existingSubmission={submission}
        />
      </motion.div>
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: Sprint['sprint_status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  // Config mapping completely synchronized with Postgres enum declarations
  const cfg = {
    live: {
      label: 'LIVE',
      cls: 'text-arena-red border-arena-red/50 bg-arena-red-dim',
    },
    judging: {
      label: 'JUDGING',
      cls: 'text-arena-cyan border-arena-cyan/50 bg-arena-cyan-dim',
    },
    complete: {
      label: 'DONE',
      cls: 'text-arena-gray border-arena-border',
    },
    draft: {
      label: 'DRAFT',
      cls: 'text-arena-gray border-arena-border',
    },
  }[status] ?? {
    label: status.toUpperCase(),
    cls: 'text-arena-gray border-arena-border',
  };

  return (
    <span
      className={`text-xs font-bold font-display border rounded px-2 py-0.5 ${cfg.cls}`}
      aria-label={`Sprint status: ${status}`}
    >
      {status === 'live' && (
        <span
          className="mr-1 animate-pulse inline-block w-1.5 h-1.5 rounded-full bg-arena-red"
          aria-hidden="true"
        />
      )}

      {cfg.label}
    </span>
  );
}
