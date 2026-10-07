'use client';

// app/admin/AdminConsole.tsx
// Toolbar + attention strip + pipeline board + the new/edit slide-overs.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, RefreshCcw } from 'lucide-react';
import { EditSprintModal } from './EditSprintModal';
import { NewSprintPanel } from './NewSprintPanel';
import { callAction, SprintBoard } from './SprintBoard';
import type { SprintRow } from './types';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function AdminConsole({ sprints, nextSprintNumber }: { sprints: SprintRow[]; nextSprintNumber: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SprintRow | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Captured once on mount; the strip is about "was the close date already past when you opened this".
  const [now] = useState(() => Date.now());

  const refresh = () => startTransition(() => router.refresh());

  // A sprint the database still calls live although its window has already ended.
  const stuck = sprints.filter((s) => s.sprint_status === 'live' && new Date(s.close_at).getTime() <= now);

  async function closeStuck(id: string) {
    setClosingId(id);
    setError(null);
    const r = await callAction(`/api/admin/sprint/${id}/close-submissions`);
    setClosingId(null);
    if (r.ok) refresh();
    else setError(r.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-poster text-4xl uppercase leading-none">Sprint pipeline</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-chalk hover:text-chalk"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-chalk transition-colors hover:bg-chalk hover:text-void"
          >
            <Plus className="h-4 w-4" /> New sprint
          </button>
        </div>
      </div>

      {stuck.length > 0 && (
        <div role="alert" className="rounded-xl border border-signal/60 bg-signal/10 p-4">
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <AlertTriangle className="h-5 w-5 text-signal" />
            Needs attention
          </p>
          <ul className="mt-3 space-y-3">
            {stuck.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 text-sm leading-relaxed text-white/85">
                  Sprint #{s.sprint_number}, &ldquo;{s.title}&rdquo;, is still live but closed on{' '}
                  <span suppressHydrationWarning>{fmt(s.close_at)}</span>. Close it to start judging.
                </p>
                <button
                  type="button"
                  onClick={() => closeStuck(s.id)}
                  disabled={closingId === s.id}
                  className="rounded-full bg-signal px-4 py-2 text-sm font-bold text-chalk transition-colors hover:bg-chalk hover:text-void disabled:opacity-50"
                >
                  {closingId === s.id ? 'Closing…' : 'Close submissions'}
                </button>
              </li>
            ))}
          </ul>
          {error && <p className="mt-3 text-sm font-medium text-signal">{error}</p>}
        </div>
      )}

      <SprintBoard sprints={sprints} onRefresh={refresh} onEdit={setEditing} now={now} />

      <AnimatePresence>
        {creating && <NewSprintPanel nextSprintNumber={nextSprintNumber} onClose={() => setCreating(false)} />}
        {editing && (
          <EditSprintModal
            sprint={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
