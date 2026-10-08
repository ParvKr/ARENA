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
