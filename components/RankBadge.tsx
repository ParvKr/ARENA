// components/RankBadge.tsx
// Tier badge in the black / red / white system.
import type { Profile } from '@/types/api.types';

type Tier = Profile['rank_tier'];
type Size = 'sm' | 'md' | 'lg';

// Tiers climb from a quiet outline to solid signal red. No glows or pulses.
const TIER_CONFIG: Record<Tier, string> = {
  Contender: 'border-white/25 text-smoke',
  Rising: 'border-white/60 text-chalk',
  Ranked: 'border-chalk bg-chalk text-void',
  Elite: 'border-signal text-signal',
  Legend: 'border-signal bg-signal text-chalk',
};

const SIZE_CONFIG: Record<Size, string> = {
  sm: 'text-[10px] px-2 py-0.5 tracking-[0.15em]',
  md: 'text-xs px-3 py-1 tracking-[0.15em]',
  lg: 'text-sm px-4 py-1.5 tracking-[0.15em]',
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
  const tone = TIER_CONFIG[tier] ?? TIER_CONFIG.Contender;
  const compiledClassName = [
    'inline-flex items-center gap-1 rounded-sm border font-mono font-bold uppercase',
    tone,
    SIZE_CONFIG[size] ?? SIZE_CONFIG.md,
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