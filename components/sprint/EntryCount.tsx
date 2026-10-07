// components/sprint/EntryCount.tsx
'use client'

import useSWR from 'swr'

interface EntryCountResponse {
  data: { count: number }
}

const fetcher = async (url: string): Promise<EntryCountResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch entry count: ${res.statusText}`)
  return res.json()
}

export function EntryCount({ count, sprintId, live }: { count: number; sprintId: string; live: boolean }) {
  const { data } = useSWR<EntryCountResponse>(sprintId ? `/api/sprint/${sprintId}/entry-count` : null, fetcher, {
    refreshInterval: live ? 60_000 : 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    fallbackData: { data: { count } },
  })
  const total = data?.data?.count ?? count

  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke">Entries</p>
      <p className="flex items-center gap-3">
        {live && <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-signal" />}
        <span className="font-poster text-4xl tabular-nums leading-none">{total.toLocaleString()}</span>
        <span className="text-sm text-smoke">{total === 1 ? 'entry received' : 'entries received'}</span>
      </p>
    </div>
  )
}
