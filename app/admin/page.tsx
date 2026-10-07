import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/middleware/auth';
import { requireProfileRole, RoleError } from '@/lib/middleware/roles';
import { AuthError } from '@/lib/middleware/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminConsole } from './AdminConsole';
import type { SprintRow } from './types';

export default async function AdminPage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) redirect('/signin?next=/admin');
    throw error;
  }

  let profile;
  try {
    profile = await requireProfileRole(user.id, 'admin');
  } catch (error) {
    if (error instanceof RoleError) redirect('/sprint');
    throw error;
  }

  const supabase = await createSupabaseServerClient();

  const [
    { count: sprintCount },
    { count: submissionCount },
    { count: judgeCount },
    { data: recentSprints },
  ] = await Promise.all([
    supabase.from('sprints').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('user_id', { count: 'exact', head: true }).eq('arena_role', 'judge'),
    supabase.from('sprints').select('id, sprint_number, title, discipline, sprint_status, open_at, close_at, results_at, brief_content, prize_data').order('created_at', { ascending: false }).limit(8),
  ]);

  // Next sprint number to pre-populate the form
  const nextSprintNumber = (sprintCount ?? 0) + 1;
  const sprints = (recentSprints ?? []) as unknown as SprintRow[];

  const metrics = [
    { label: 'Sprints', value: sprintCount ?? 0 },
    { label: 'Submissions', value: submissionCount ?? 0 },
    { label: 'Judges', value: judgeCount ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Admin console</p>
          <h1 className="mt-2 font-poster text-[clamp(2.75rem,6vw,5rem)] uppercase leading-[0.9]">Arena operations</h1>
          <p className="mt-3 text-base text-smoke">Welcome back, {profile?.display_name ?? 'admin'}.</p>
        </div>

        <dl className="grid grid-cols-3 gap-3 sm:gap-4">
          {metrics.map(({ label, value }) => (
            <div key={label} className="min-w-[6.5rem] rounded-xl border border-white/15 px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke">{label}</dt>
              <dd className="mt-1 font-poster text-4xl leading-none tabular-nums">{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-12">
        <AdminConsole sprints={sprints} nextSprintNumber={nextSprintNumber} />
      </div>
    </div>
  );
}
