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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4"
      >
        <p className="font-display text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          No Active Sprint
        </p>

        <p className="text-gray-400 text-lg max-w-xl">
          The next sprint drops Friday at 6pm. Get ready to compete.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold cursor-pointer"
        >
          Notify Me
        </motion.div>
      </motion.div>
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
      className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-10"
    >
      {/* Sprint header */}
      <motion.div variants={item} className="flex flex-col gap-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-gray-500 text-sm font-medium tracking-widest uppercase">
            Sprint #{sprint.sprint_number}
          </span>

          <DisciplineChip discipline={sprint.discipline} />

          <StatusBadge status={currentStatus} />
        </div>

        <h1 className="font-display font-black text-5xl md:text-6xl leading-tight text-white">
          {sprint.title}
        </h1>

        {sprint.close_at && (
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-medium text-gray-400">Closes in:</span>

            <CountdownTimer targetDate={sprint.close_at} />
          </div>
        )}
      </motion.div>

      {/* Prize banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-yellow-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">🏆</span>
            <p className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              First Place Prize
            </p>
          </div>

          <p className="text-white font-semibold text-lg">
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
  const cfg = {
    live: {
      label: 'LIVE',
      cls: 'text-red-400 border-red-500/50 bg-red-500/10',
      dot: 'bg-red-500',
    },
    judging: {
      label: 'JUDGING',
      cls: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
      dot: 'bg-cyan-500',
    },
    complete: {
      label: 'COMPLETE',
      cls: 'text-green-400 border-green-500/50 bg-green-500/10',
      dot: null,
    },
    draft: {
      label: 'DRAFT',
      cls: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
      dot: null,
    },
  }[status] ?? {
    label: status.toUpperCase(),
    cls: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
    dot: null,
  };

  return (
    <span
      className={`text-xs font-bold font-display border rounded-lg px-3 py-1 flex items-center gap-2 w-fit ${cfg.cls}`}
      aria-label={`Sprint status: ${status}`}
    >
      {cfg.dot && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${cfg.dot} animate-pulse`}
          aria-hidden="true"
        />
      )}

      {cfg.label}
    </span>
  );
}
