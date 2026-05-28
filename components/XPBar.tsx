'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import type { RankTier } from '@/types/api.types';
import { TIER_THRESHOLDS } from '@/types/api.types';

// Strict typing for design system colors mapped directly to your Tailwind tokens
const TIER_COLOURS: Record<RankTier, string> = {
  Contender: '#8888AA',
  Rising: '#4ECDC4',
  Ranked: '#45B7D1',
  Elite: '#9B5DE5',
  Legend: '#FFD700',
};

interface XPBarProps {
  totalPoints: number;
  tier: RankTier;
  prevPoints?: number; // If provided, animates smoothly from prevPoints -> totalPoints
}

export function XPBar({ totalPoints, tier, prevPoints }: XPBarProps) {
  // Sort thresholds numerically to accurately trace the user's progress ladder segment
  const tiers = Object.entries(TIER_THRESHOLDS).sort(([, a], [, b]) => a - b) as [RankTier, number][];
  const tierIdx = tiers.findIndex(([t]) => t === tier);
  
  const current = tiers[tierIdx]?.[1] ?? 0;
  const next = tiers[tierIdx + 1]?.[1] ?? null;

  // Calculate percentage progress inside the boundaries of the user's current tier segment
  const progress = next !== null
    ? Math.min(100, ((totalPoints - current) / (next - current)) * 100)
    : 100;

  // Derive initial value for the motion tracking state safely
  const from = prevPoints !== undefined && next !== null
    ? Math.min(100, ((prevPoints - current) / (next - current)) * 100)
    : progress;

  const width = useMotionValue(from);
  const colour = TIER_COLOURS[tier];

  useEffect(() => {
    // Smooth, performance-optimized layout animation on totalPoints updates
    const controls = animate(width, progress, {
      duration: 1.4,
      ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier matching Arena layout transitions
    });
    return controls.stop;
  }, [progress, width]);

  // Map the animated motion state directly to readable percentage units
  const widthPct = useTransform(width, (v) => `${v}%`);

  return (
    <div className="w-full space-y-1.5">
      {/* Metrics Row */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-display font-bold text-arena-offwhite">
          {totalPoints.toLocaleString()} XP
        </span>
        
        {next !== null ? (
          <span className="text-arena-gray font-body">
            {(next - totalPoints).toLocaleString()} to {tiers[tierIdx + 1]?.[0]}
          </span>
        ) : (
          <span className="text-arena-gold font-display font-black tracking-wider animate-gold-pulse">
            LEGEND MAX
          </span>
        )}
      </div>

      {/* Progress Track Background */}
      <div className="h-1.5 w-full bg-arena-surface rounded-full overflow-hidden">
        {/* Animated Fill Indicator */}
        <motion.div
          className="h-full rounded-full"
          style={{ 
            width: widthPct, 
            backgroundColor: colour 
          }}
        />
      </div>
    </div>
  );
}