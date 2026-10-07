// components/sprint/SprintSkeleton.tsx
function Bar({ className, height }: { className: string; height?: number }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.07] ${className}`}
      {...(height ? { style: { height } } : {})}
    />
  )
}

export function SprintSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8" aria-busy="true" aria-label="Loading sprint">
      <Bar className="h-4 w-48" />
      <Bar className="mt-5 h-20 w-2/3" />
      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {[140, 220, 120, 100].map((h, i) => (
            <Bar key={i} className="w-full" height={h} />
          ))}
        </div>
        <Bar className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}
