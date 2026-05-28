// Arena V0.1
'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base professional placeholder block.
 * Enforces standardized dark-brand background variables and consistent pulse loops.
 */
function Sk({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-arena-card/60 border border-arena-border/20', className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SprintPageSkeleton() {
  // Deterministic heights used explicitly for layout box constraints
  const structuralHeights = [100, 60, 80, 120, 40];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pt-24">
      <div className="space-y-3">
        <div className="flex gap-3">
          <Sk className="h-5 w-24" />
          <Sk className="h-5 w-32" />
        </div>

        <Sk className="h-10 w-2/3" />
        <Sk className="h-10 w-40" />
      </div>

      <Sk className="h-16 w-full" />

      <div className="space-y-4">
        {structuralHeights.map((h, i) => (
          <Sk
            key={`sprint-sk-${i}`}
            className="w-full"
            style={{ height: h }}
          />
        ))}
      </div>

      <Sk className="h-14 w-full" />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-24">
      <Sk className="h-5 w-48" />
      <Sk className="h-64 w-full" />

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`results-row-${i}`}
            className="flex gap-4 items-center p-4 border border-arena-border rounded-lg bg-arena-card/30"
          >
            <Sk className="h-8 w-8 rounded-full shrink-0" />

            <Sk className="h-12 w-12 rounded shrink-0" />

            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-32" />
              <Sk className="h-2 w-full" />
            </div>

            <Sk className="h-6 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  const segmentWidths = [60, 100, 40, 40, 40];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pt-24">
      <div className="flex gap-6">
        <Sk className="w-20 h-20 rounded-full shrink-0" />

        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <Sk className="h-7 w-40" />
            <Sk className="h-6 w-24" />
          </div>

          <Sk className="h-4 w-28" />

          <div className="flex gap-6">
            <Sk className="h-5 w-20" />
            <Sk className="h-5 w-20" />
          </div>

          <Sk className="h-2 w-full" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`profile-sk-card-${i}`}
            className="flex gap-4 p-4 border border-arena-border rounded-lg bg-arena-card/30"
          >
            {segmentWidths.map((w, j) => (
              <Sk
                key={`segment-${i}-${j}`}
                className="h-5"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}