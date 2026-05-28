import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';

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
  draft: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
  live: 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse',
  judging: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  complete: 'border-green-500/50 bg-green-500/10 text-green-400',
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
    <div className="min-h-screen bg-[#0A0A0F] px-4 pb-16 pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
              Admin
            </span>
            <span className="font-mono text-xs text-gray-500">Control Panel</span>
          </div>

          <h1 className="font-display text-5xl font-black text-white mb-3">
            Arena Operations
          </h1>

          <p className="text-gray-400 text-base">
            Welcome back, <span className="text-cyan-400 font-semibold">{profile?.display_name ?? 'admin'}</span>. Manage sprints, submissions, and judges.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Sprints" value={sprintCount ?? 0} icon="📋" />
          <MetricCard label="Submissions" value={submissionCount ?? 0} icon="📤" />
          <MetricCard label="Active Judges" value={judgeCount ?? 0} icon="⚖️" />
        </div>

        {/* Recent Sprints Section */}
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Recent Sprints</h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 glass">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
              <h3 className="font-semibold text-white">Sprint Directory</h3>
              <span className="text-xs text-gray-500">Last 6 sprints</span>
            </div>

            <div className="divide-y divide-white/10">
              {sprints.length > 0 ? (
                sprints.map((sprint, idx) => (
                  <motion.div
                    key={sprint.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid gap-4 px-6 py-4 sm:grid-cols-[100px_1fr_120px_140px] items-center hover:bg-white/5 transition-colors duration-200"
                  >
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      #{sprint.sprint_number}
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {sprint.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {sprint.discipline}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatDate(sprint.open_at)}
                    </span>
                    <span
                      className={[
                        'inline-flex h-fit px-3 py-1 rounded-lg border text-xs font-bold uppercase w-fit',
                        statusClasses[sprint.sprint_status],
                      ].join(' ')}
                    >
                      {sprint.sprint_status}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-400 font-medium">No sprints have been created yet</p>
                  <p className="text-gray-500 text-sm mt-1">Create your first sprint to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-xl border border-white/10 glass px-6 py-5 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="font-mono text-xs uppercase tracking-widest text-gray-400 font-bold">
          {label}
        </div>
        {icon && <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
      </div>

      <div className="font-display text-4xl font-black text-white">
        {value.toLocaleString()}
      </div>

      <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-300" />
    </motion.div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
