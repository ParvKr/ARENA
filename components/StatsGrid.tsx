// components/dashboard/StatsGrid.tsx
'use client';
import { motion } from 'framer-motion';
import type { Profile } from '@/types/api.types';

interface StatsGridProps {
  profile: Profile;
}

export function StatsGrid({ profile }: StatsGridProps) {
  const cards = [
    {
      label: 'Sprints Entered',
      value: profile.sprint_count,
      sub: 'Active competitor',
      color: 'border-arena-red',
    },
    {
      label: 'Total XP Earned',
      value: profile.total_points.toLocaleString(),
      sub: 'Cumulative score',
      color: 'border-arena-purple',
    },
    {
      label: 'Current Rank Tier',
      value: profile.rank_tier,
      sub: 'Skill Placement',
      color: 'border-arena-cyan',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className={`bg-arena-card border border-arena-border border-t-2 ${card.color} rounded-lg p-5 flex flex-col justify-between`}
        >
          <span className="text-xs font-display font-bold text-arena-gray uppercase tracking-wider">
            {card.label}
          </span>
          <span className="font-display font-black text-2xl sm:text-3xl text-arena-white my-2 leading-none">
            {card.value}
          </span>
          <span className="text-xs text-arena-gray/80 font-body">
            {card.sub}
          </span>
        </motion.div>
      ))}
    </div>
  );
}