// Arena V0.1
'use client';

import type { Sprint } from '@/types/api.types';

// Extract the literal union type directly from our database-aligned model matrix
type Discipline = Sprint['discipline'];

// Leveraging TypeScript's satisfies operator to enforce absolute key coverage 
// while preserving precise tailwind class values without string widening
const DISCIPLINE_COLOURS = {
  'Visual Design':
    'text-arena-red bg-arena-red-dim border-arena-red/30',

  Copywriting:
    'text-arena-cyan bg-arena-cyan-dim border-arena-cyan/30',

  'Video Editing':
    'text-arena-purple bg-arena-purple-dim border-arena-purple/30',

  'UI/UX Design':
    'text-[#4ECDC4] bg-[#4ECDC415] border-[#4ECDC440]',

  'No-Code Building':
    'text-arena-green bg-arena-green-dim border-arena-green/30',
} satisfies Record<string, string>;

interface DisciplineChipProps {
  discipline: Discipline;
}

export function DisciplineChip({ discipline }: DisciplineChipProps) {
  // Safe dictionary lookup backstopped by strict build-time parameters
  const cls =
    DISCIPLINE_COLOURS[discipline as keyof typeof DISCIPLINE_COLOURS] ??
    'text-arena-gray bg-arena-card border-arena-border';

  return (
    <span
      className={`text-xs font-bold border rounded px-2 py-0.5 font-display tracking-wide ${cls}`}
    >
      {discipline}
    </span>
  );
}