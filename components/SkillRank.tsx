// components/dashboard/SkillRank.tsx
'use client';
import { motion } from 'framer-motion';
import { XPBar } from '@/components/XPBar';
import type { Profile } from '@/types/api.types';

interface SkillRankProps {
  profile: Profile;
}

export function SkillRank({ profile }: SkillRankProps) {
  const tiers = ['Contender', 'Rising', 'Ranked', 'Elite', 'Legend'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-arena-card border border-arena-border rounded-lg p-6 space-y-6 flex flex-col justify-between"
    >
      <div className="space-y-4">
        <h2 className="text-xs font-display font-bold text-arena-gray uppercase tracking-wider">
          Skill Rank Progression
        </h2>
        {/* Reusing your production core XP component */}
        <XPBar totalPoints={profile.total_points} tier={profile.rank_tier} />
      </div>

      {/* Interactive Visual Timeline Dots */}
      <div className="grid grid-cols-5 gap-1 pt-4 border-t border-arena-border/50">
        {tiers.map((tier) => {
          const isCurrent = profile.rank_tier === tier;
          return (
            <div key={tier} className="flex flex-col items-center space-y-1.5 text-center">
              <div 
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-arena-cyan border-arena-cyan shadow-[0_0_8px_#00F5FF]' 
                    : 'bg-arena-surface border-arena-border'
                }`}
              />
              <span className={`text-[10px] font-display font-medium tracking-tight truncate w-full ${
                isCurrent ? 'text-arena-cyan font-bold' : 'text-arena-gray'
              }`}>
                {tier}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}