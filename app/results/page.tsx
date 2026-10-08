// Results: real published results for a completed sprint (latest by default, ?sprint=N for
// the archive). Server-rendered; the interactive gallery is a client component.
import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getEntryCount, getCompletedSprints } from '@/lib/services/sprint.service';
import { getPublishedResults } from '@/lib/services/results.service';
import { ResultsEmpty, ResultsSkeleton } from '@/components/results/ResultsEmpty';
import { ResultsView } from '@/components/results/ResultsView';
import type { ResultRow } from '@/components/results/types';

export default function ResultsPage({ searchParams }: { searchParams: Promise<{ sprint?: string }> }) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function ResultsLoader({ searchParams }: { searchParams: Promise<{ sprint?: string }> }) {
  const { sprint: sprintParam } = await searchParams;
  const client = await createSupabaseServerClient();

  const completed = await getCompletedSprints(client);
  const wanted = Number(sprintParam);
  const current = completed.find((s) => s.sprint_number === wanted) ?? completed[0];

  if (!current) {
    // Say what is actually happening instead of showing a blank page
    const { data: active } = await client
      .from('sprints')
      .select('sprint_number, sprint_status')
      .in('sprint_status', ['live', 'judging'])
      .order('sprint_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    let message = "The first sprint hasn't finished yet. Results appear here once its entries have been judged.";
    if (active?.sprint_status === 'judging') {
      message = `Sprint ${active.sprint_number} is being judged. Results appear here once they're published.`;
    } else if (active?.sprint_status === 'live') {
      message = `Sprint ${active.sprint_number} is the current sprint. Results appear here once it's been judged and published.`;
    }
    return <ResultsEmpty message={message} />;
  }

  const [published, entryCount] = await Promise.all([
    getPublishedResults(current.id, client),
    getEntryCount(current.id, client),
  ]);

  const results: ResultRow[] = published
    .filter((r) => r.submissions)
    .map((r) => ({
      rank: r.rank,
      score: Number(r.normalized_score),
      points: r.points_awarded,
      username: r.submissions?.profiles?.username ?? null,
      displayName: r.submissions?.profiles?.display_name ?? 'Competitor',
      avatarUrl: r.submissions?.profiles?.avatar_url ?? null,
      fileUrl: r.submissions?.main_file_url ?? '',
      fileType: r.submissions?.main_file_type ?? '',
      interpretation: r.submissions?.brief_interpretation ?? '',
      tools: r.submissions?.tools_used ?? '',
    }));

  return (
    <ResultsView
      sprint={{ id: current.id, number: current.sprint_number, title: current.title, discipline: current.discipline }}
      archive={completed.map((s) => ({ number: s.sprint_number, title: s.title }))}
      results={results}
      entryCount={entryCount}
    />
  );
}
