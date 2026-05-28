// components/ui/rankBadge.tsx
// High-performance rank badge component backstopped against dictionary key lookups and string evaluation faults.
import type { Profile } from '@/types/api.types';

type Tier = Profile['rank_tier'];
type Size = 'sm' | 'md' | 'lg';

const TIER_CONFIG: Record<
  Tier,
  {
    text: string;
    color: string;
    border: string;
    glow: string;
    extra?: string;
  }
> = {
  Contender: {
    text: 'text-arena-gray',
    border: 'border-arena-gray/30',
    glow: '',
    color: '',
  },

  Rising: {
    text: 'text-teal-400',
    border: 'border-teal-400/40',
    glow: '',
    color: '',
  },

  Ranked: {
    text: 'text-blue-400',
    border: 'border-blue-400/50',
    glow: 'shadow-cyan',
    color: '',
  },

  Elite: {
    text: 'text-arena-purple',
    border: 'border-arena-purple/60',
    glow: 'shadow-purple',
    color: '',
  },

  Legend: {
    text: 'text-arena-gold',
    border: 'border-arena-gold/80',
    glow: 'glow-gold animate-gold-pulse',
    extra: 'animate-gold-pulse',
    color: '',
  },
};

const SIZE_CONFIG: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5 tracking-widest',
  md: 'text-sm px-3 py-1 tracking-widest',
  lg: 'text-base px-4 py-1.5 tracking-widest',
};

interface RankBadgeProps {
  tier: Tier;
  size?: Size;
  className?: string;
}

export function RankBadge({
  tier,
  size = 'md',
  className = '',
}: RankBadgeProps) {
  // Logical Fix 1: Bulletproof fallback safety guard stops runtime null pointer evaluation errors
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.Contender;
  const szCl = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Logical Fix 2: Move array interpolation out of JSX execution scope to normalize string typing
  const compiledClassName = [
    'font-display font-bold uppercase rounded-sm border',
    'inline-flex items-center gap-1',
    cfg.text,
    cfg.border,
    cfg.glow,
    cfg.extra ?? '',
    szCl,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={compiledClassName} aria-label={`Rank tier: ${tier}`}>
      {tier === 'Legend' && <span aria-hidden>★</span>}
      {tier}
    </span>
  );
}