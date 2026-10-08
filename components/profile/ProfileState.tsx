// components/profile/ProfileState.tsx
// Loading and failure states for the profile page.
import Link from 'next/link'

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/10 ${className}`} />
}

export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading profile" className="mx-auto max-w-6xl px-5 pb-28 pt-28 sm:px-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
        <Bar className="h-24 w-24 shrink-0 rounded-full sm:h-32 sm:w-32" />
        <div className="flex-1 space-y-4">
          <Bar className="h-3 w-28" />
          <Bar className="h-16 w-full max-w-md sm:h-24" />
          <Bar className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div className="mt-24 grid grid-cols-2 gap-6 border-y border-white/15 py-10 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Bar className="h-14 w-24" />
            <Bar className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-16 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Bar key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}

export function ProfileMissing({ username, notFound }: { username: string; notFound: boolean }) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-center px-5 pt-28 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
        {notFound ? 'No such competitor' : 'Could not load'}
      </p>
      <h1 className="mt-4 break-words font-poster text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.9]">
        {notFound ? (
          <>
            Nobody goes by <span className="break-all text-signal">@{username}</span>
          </>
        ) : (
          'Try that again'
        )}
      </h1>
      <p className="mt-5 max-w-md text-lg text-white/75">
        {notFound
          ? 'Check the spelling, or see who has been winning.'
          : 'The profile did not come back. Refresh the page in a moment.'}
      </p>
      <Link
        href="/results"
        className="mt-10 inline-flex w-fit items-center rounded-full bg-signal px-8 py-4 font-display text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5"
      >
        See the results
      </Link>
    </div>
  )
}
