// components/results/ResultsEmpty.tsx
import Link from 'next/link'

export function ResultsEmpty({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl flex-col justify-center px-5 pt-24 sm:px-8">
      <h1 className="font-poster text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.88]">
        No results
        <br />
        <span className="text-signal">yet.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">{message}</p>
      <div className="mt-8">
        <Link
          href="/sprint"
          className="inline-block rounded-full bg-signal px-7 py-3.5 font-display text-base font-bold text-chalk transition-colors hover:bg-chalk hover:text-void"
        >
          See the current sprint
        </Link>
      </div>
    </div>
  )
}

export function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8" aria-busy="true" aria-label="Loading results">
      <div className="h-4 w-48 animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-5 h-24 w-2/3 animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-white/[0.07]" />
        ))}
      </div>
    </div>
  )
}
