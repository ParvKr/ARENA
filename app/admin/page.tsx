import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ArenaRole, SprintStatus } from '@/types/api.types';

export const dynamic = 'force-dynamic';

type AdminSprintRow = {
  id: string;
  sprint_number: number;
  title: string;
  discipline: string;
  sprint_status: SprintStatus;
  open_at: string;
  close_at: string;
};

const statusClasses: Record<SprintStatus, string> = {
  draft: 'border-arena-border text-arena-gray',
  live: 'border-arena-green/40 bg-arena-green-dim text-arena-green',
  judging: 'border-arena-cyan/40 bg-arena-cyan-dim text-arena-cyan',
  complete: 'border-arena-gold/40 bg-arena-gold-dim text-arena-gold',
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin?next=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('arena_role, display_name')
    .eq('user_id', session.user.id)
    .single();

  if ((profile?.arena_role as ArenaRole | undefined) !== 'admin') {
    redirect('/dashboard');
  }

  const [
    { count: sprintCount },
    { count: submissionCount },
    { count: judgeCount },
    { data: recentSprints },
  ] = await Promise.all([
    supabase.from('sprints').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('arena_role', 'judge'),
    supabase
      .from('sprints')
      .select('id, sprint_number, title, discipline, sprint_status, open_at, close_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const sprints = (recentSprints ?? []) as AdminSprintRow[];

  return (
    <div className="min-h-screen bg-arena-bg px-4 pb-12 pt-24 text-arena-offwhite sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="border-b border-arena-border pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-arena-red">
              Admin Console
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-arena-white sm:text-4xl">
              Arena Operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-arena-gray">
              Welcome back, {profile?.display_name ?? 'admin'}.
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Sprints" value={sprintCount ?? 0} />
          <MetricCard label="Submissions" value={submissionCount ?? 0} />
          <MetricCard label="Judges" value={judgeCount ?? 0} />
        </section>

        <section className="overflow-hidden rounded-md border border-arena-border bg-arena-card">
          <div className="flex items-center justify-between border-b border-arena-border px-5 py-4">
            <h2 className="font-display text-lg font-bold text-arena-white">
              Recent Sprints
            </h2>
          </div>

          <div className="divide-y divide-arena-border">
            {sprints.length > 0 ? (
              sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[96px_1fr_140px_120px]"
                >
                  <span className="font-mono text-sm text-arena-gray">
                    #{sprint.sprint_number}
                  </span>
                  <span>
                    <span className="block font-semibold text-arena-white">
                      {sprint.title}
                    </span>
                    <span className="mt-1 block text-sm text-arena-gray">
                      {sprint.discipline}
                    </span>
                  </span>
                  <span className="text-sm text-arena-gray">
                    {formatDate(sprint.open_at)}
                  </span>
                  <span
                    className={[
                      'inline-flex h-7 w-fit items-center rounded-md border px-2.5 text-xs font-semibold uppercase',
                      statusClasses[sprint.sprint_status],
                    ].join(' ')}
                  >
                    {sprint.sprint_status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-sm text-arena-gray">
                No sprints have been created yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-arena-border bg-arena-card px-5 py-4">
      <div className="font-mono text-xs uppercase tracking-widest text-arena-gray">
        {label}
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold text-arena-white">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
