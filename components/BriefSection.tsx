// Arena V0.1
'use client';

import { cn } from '@/lib/utils';

interface BriefSectionProps {
  label: string;
  content: string | null | undefined;
  accent?: boolean; // Highlighted prompt context
  mono?: boolean; // Layout configuration constraints
}

export function BriefSection({
  label,
  content,
  accent = false,
  mono = false,
}: BriefSectionProps) {
  // Safe default initialization to protect against missing dataset values
  const safeContent = content ?? '';

  return (
    <div
      className={cn(
        'border-l-2 pl-4 space-y-2',
        accent ? 'border-arena-red' : 'border-arena-border'
      )}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-arena-gray">
        {label}
      </p>

      <p
        className={cn(
          'leading-relaxed whitespace-pre-line wrap-break-word',
          accent ? 'text-arena-offwhite text-lg font-medium' : 'text-arena-grayL',
          mono ? 'font-mono text-sm text-arena-cyan' : ''
        )}
      >
        {safeContent}
      </p>
    </div>
  );
}