// components/dashboard/LiveSprintCard.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CountdownTimer } from '@/components/CountdownTimer';
import { DisciplineChip } from '@/components/DisciplineChip';
import type { Sprint } from '@/types/api.types';

interface LiveSprintCardProps {
  sprint: Sprint | null;
}

export function LiveSprintCard({ sprint }: LiveSprintCardProps) {
  if (!sprint) {
    return (
      <div className="bg-arena-card border border-arena-border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-2xl">⏳</span>
        <h3 className="font-display font-bold text-arena-white text-sm">Next Challenge Pending</h3>
        <p className="text-arena-gray text-xs max-w-xs font-body">
          We are currently preparing the next active competition brief. Check back soon!
        </p>
      </div>
    );
  }

  const prize = sprint.prize_data as { first?: { description: string } };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-arena-card border border-arena-border rounded-lg overflow-hidden flex flex-col justify-between"
    >
      {/* Structural Inner Header */}
      <div className="bg-arena-surface/50 border-b border-arena-border px-5 py-3.5 flex items-center justify-between">
        <span className="font-mono text-xs text-arena-gray tracking-wider">
          Sprint #{String(sprint.sprint_number).padStart(3, '0')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-display font-black text-arena-red tracking-widest bg-arena-red-dim border border-arena-red/30 px-2 py-0.5 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-arena-red animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Main Context Panel Body */}
      <div className="p-5 flex-1 space-y-4">
        <h3 className="font-display font-extrabold text-base sm:text-lg text-arena-white leading-snug">
          {sprint.title}
        </h3>
        
        <div className="flex flex-wrap gap-2 items-center">
          <DisciplineChip discipline={sprint.discipline} />
          {prize?.first?.description && (
            <span className="text-[11px] font-display font-bold text-arena-gold bg-arena-gold-dim border border-arena-gold/20 px-2 py-0.5 rounded-sm">
              🏆 {prize.first.description}
            </span>
          )}
        </div>

        {/* Dynamic Countdown Block */}
        {sprint.close_at && (
          <div className="bg-arena-surface border border-arena-border rounded p-4 flex items-center justify-between">
            <span className="text-xs font-body text-arena-gray">Time Remaining:</span>
            <CountdownTimer targetDate={sprint.close_at} compact />
          </div>
        )}
      </div>

      {/* Footer Interactive Actions Section */}
      <div className="border-t border-arena-border/60 px-5 py-4 bg-arena-surface/20 flex items-center justify-between">
        <span className="text-xs text-arena-gray font-body">
          Closes Sunday 6:00 PM
        </span>
        <Link href={`/sprint/${sprint.id}`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-arena-red text-white font-display font-bold text-xs rounded hover:bg-red-500 transition-all duration-150 shadow-sm"
          >
            Enter Sprint →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}