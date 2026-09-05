import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ArenaRole, SprintStatus } from '@/types/api.types';
import { CreateSprintForm } from './CreateSprintForm';
import { SprintManagement } from './SprintManagement';

type AdminSprintRow = {
  id: string;
  sprint_number: number;
  title: string;
  discipline: string;
  sprint_status: SprintStatus;
  open_at: string;
  close_at: string;
  results_at: string | null;
  brief_content: unknown;
  prize_data: unknown;
};

const STATUS_STYLES: Record<SprintStatus, string> = {
  draft:    'border-[#2C2C3A] text-[#737380] bg-[#0A0A0F]',
  live:     'border-[#4ADE80]/40 text-[#4ADE80] bg-[#4ADE80]/5',
  judging:  'border-[#45B7D1]/40 text-[#45B7D1] bg-[#45B7D1]/5',
  complete: 'border-[#FFD700]/40 text-[#FFD700] bg-[#FFD700]/5',
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/signin?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('arena_role, display_name')
    .eq('user_id', session.user.id)
    .single();

  if ((profile?.arena_role as ArenaRole | undefined) !== 'admin') redirect('/sprint');

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
  const sprints = (recentSprints ?? []) as AdminSprintRow[];

  return (
    <div className="min-h-screen bg-[#050507] pt-14 pb-20 text-[#F5F5F7]">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">

        {/* ── Header ── */}
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7C5CFF]">Admin Console</p>
          <h1 className="mt-2 font-display text-4xl font-black text-white">Arena Operations</h1>
          <p className="mt-1 text-sm text-[#737380]">Welcome back, {profile?.display_name ?? 'admin'}.</p>
        </header>

        {/* ── Metrics ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sprints', value: sprintCount ?? 0, glow: '#7C5CFF' },
            { label: 'Submissions', value: submissionCount ?? 0, glow: '#45B7D1' },
            { label: 'Judges', value: judgeCount ?? 0, glow: '#FFD700' },
          ].map(({ label, value, glow }) => (
            <div key={label} className="relative overflow-hidden rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-6">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: glow }} />
              <p className="font-mono text-xs uppercase tracking-widest text-[#737380]">{label}</p>
              <p className="mt-3 font-display text-4xl font-black text-white">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* ── Two-column: Create Sprint + Recent Sprints ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* ── Create Sprint Form ── */}
          <div className="xl:col-span-7">
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#1C1C26] px-6 py-4 bg-[#101017]">
                <div className="h-2 w-2 rounded-full bg-[#7C5CFF]" />
                <h2 className="font-display text-base font-bold text-white">Create New Sprint</h2>
                <span className="ml-auto font-mono text-xs text-[#737380]">Sprint #{nextSprintNumber}</span>
              </div>
              <div className="p-6">
                <CreateSprintForm nextSprintNumber={nextSprintNumber} />
              </div>
            </div>
          </div>

          {/* ── Sprint Management panel ── */}
          <div className="xl:col-span-5">
            <SprintManagement sprints={sprints as any} />
          </div>

        </div>
      </div>
    </div>
  );
}
