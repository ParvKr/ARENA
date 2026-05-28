// Arena V0.1
'use client';

import useSWR from 'swr';

// Enforce an explicit type contract matching our server endpoint payload geometry
interface EntryCountResponse {
  data: {
    count: number;
  };
}

const fetcher = async (url: string): Promise<EntryCountResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch entry count ticker: ${res.statusText}`);
  }
  return res.json();
};

interface EntryCountTickerProps {
  count: number;
  sprintId: string;
}

export function EntryCountTicker({ count, sprintId }: EntryCountTickerProps) {
  // Safe validation key initialization targeting our API contract maps
  const cacheKey = `/api/sprint/${sprintId}/entry-count`;

  const { data } = useSWR<EntryCountResponse>(
    sprintId ? cacheKey : null,
    fetcher,
    {
      refreshInterval: 60_000, // Poll every 60 seconds for active live changes
      revalidateOnFocus: true, // Auto-update data immediately when a user refocuses their tab
      revalidateOnReconnect: true, // Smooth recovery when transitioning from offline states
      keepPreviousData: true, // Prevents layout layout flashing when refreshing cache keys
      fallbackData: {
        data: {
          count,
        },
      },
    }
  );

  // Enforced compile-time path resolution using safe defaults
  const liveCount = data?.data?.count ?? count;

  return (
    <div className="flex items-center gap-3 text-sm text-arena-gray">
      <span
        className="w-2 h-2 rounded-full bg-arena-red animate-pulse"
        aria-hidden="true"
      />

      <span>
        <span className="font-display font-bold text-arena-offwhite">
          {liveCount.toLocaleString()}
        </span>{' '}
        entries received
      </span>
    </div>
  );
}