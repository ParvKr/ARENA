'use client';

// app/admin/SprintBoard.tsx
// The sprint pipeline: Draft → Live → Judging → Complete. Each sprint sits in its stage and
// shows only the actions that are valid there, with the next step as the primary button.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, BarChart2, CheckCircle2, ChevronRight, Eye, Loader2, Lock, Pencil, RefreshCcw, Send,
  Archive, Trash2, Trophy,
} from 'lucide-react';
import type { SprintStatus } from '@/types/api.types';
import type { SprintRow } from './types';

export type { SprintRow };

// ─── STAGES ───────────────────────────────────────────────────────────────────
const STAGES: { status: SprintStatus; title: string; hint: string }[] = [
  { status: 'draft', title: 'Draft', hint: 'Not visible to competitors' },
  { status: 'live', title: 'Live', hint: 'Accepting submissions' },
  { status: 'judging', title: 'Judging', hint: 'Submissions closed' },
  { status: 'complete', title: 'Complete', hint: 'Results published' },
];

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';

// ─── API ──────────────────────────────────────────────────────────────────────
export async function callAction(url: string, method = 'POST'): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: (typeof json.error === 'string' ? json.error : null) ?? `Error ${res.status}` };
    return { ok: true, message: json.data?.message ?? 'Done.' };
  } catch {
    return { ok: false, message: 'Network error. Check your connection and try again.' };
  }
}

// ─── BUTTONS ──────────────────────────────────────────────────────────────────
type Variant = 'primary' | 'ghost' | 'danger';

function ActionButton({
  icon, label, variant = 'ghost', disabled, onClick, full = false,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: Variant;
  disabled?: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  const styles: Record<Variant, string> = {
    primary: 'bg-signal text-chalk hover:bg-chalk hover:text-void border-transparent',
    ghost: 'border-white/20 text-white/80 hover:border-white/50 hover:text-chalk',
    danger: 'border-signal/50 text-signal hover:bg-signal hover:text-chalk',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${full ? 'w-full py-2.5 text-sm' : ''} ${styles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      role="alertdialog"
      aria-label={message}
      className="mt-3 flex items-start gap-3 rounded-lg border border-signal/50 bg-signal/10 p-3"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
      <div className="flex-1">
        <p className="text-xs leading-relaxed text-chalk">{message}</p>
        <div className="mt-2.5 flex gap-2">
          <button type="button" onClick={onConfirm} className="rounded-md bg-signal px-3 py-1.5 text-xs font-bold text-chalk hover:bg-chalk hover:text-void">
            Confirm
          </button>
          <button type="button" onClick={onCancel} className="rounded-md border border-white/25 px-3 py-1.5 text-xs text-white/75 hover:text-chalk">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ONE SPRINT ───────────────────────────────────────────────────────────────
type Confirm = 'delete' | 'recall' | 'close' | null;

function SprintCard({
  sprint, onRefresh, onEdit, windowPassed,
}: {
  sprint: SprintRow;
  onRefresh: () => void;
  onEdit: () => void;
  windowPassed: boolean;
}) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const status = sprint.sprint_status;

  async function act(url: string, method = 'POST') {
    setBusy(true);
    setConfirm(null);
    setResult(null);
    const r = await callAction(url, method);
    setResult(r);
    setBusy(false);
    if (r.ok) setTimeout(onRefresh, 800);
  }

  const base = `/api/admin/sprint/${sprint.id}`;
  const publish = () => act(`${base}/publish`);
  const recall = () => act(`${base}/recall`);
  const close = () => act(`${base}/close-submissions`);
  const compute = () => act(`${base}/compute-results`);
  const publishResults = () => act(`${base}/publish-results`);
  const del = () => act(base, 'DELETE');

  const when =
    status === 'draft'
      ? `Opens ${fmt(sprint.open_at)}`
      : status === 'live'
        ? `${windowPassed ? 'Closed' : 'Closes'} ${fmt(sprint.close_at)}`
        : status === 'judging'
          ? `Closed ${fmt(sprint.close_at)}`
          : `Results ${fmt(sprint.results_at)}`;

  return (
    <article className="rounded-xl border border-white/15 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-bold text-signal">#{sprint.sprint_number}</span>
        <span className="truncate rounded-full border border-white/20 px-2.5 py-0.5 font-mono text-[10px] text-white/70">
          {sprint.discipline}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 break-words font-display text-base font-bold leading-snug">{sprint.title}</h3>
      <p suppressHydrationWarning className={`mt-1 font-mono text-xs ${status === 'live' && windowPassed ? 'text-signal' : 'text-smoke'}`}>
        {when}
      </p>

      <div className="mt-4 space-y-2">
        {status === 'draft' && (
          <>
            <ActionButton full variant="primary" icon={<Send className="h-4 w-4" />} label="Publish" disabled={busy} onClick={publish} />
            <div className="flex gap-2">
              <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit" disabled={busy} onClick={onEdit} />
              <ActionButton variant="danger" icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" disabled={busy} onClick={() => setConfirm('delete')} />
            </div>
          </>
        )}

        {status === 'live' && (
          <>
            <ActionButton
              full
              variant="primary"
              icon={<Archive className="h-4 w-4" />}
              label="Close submissions"
              disabled={busy}
              onClick={() => setConfirm('close')}
            />
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={<Eye className="h-3.5 w-3.5" />} label="View brief" disabled={busy} onClick={() => window.open('/sprint', '_blank')} />
              <ActionButton icon={<Pencil className="h-3.5 w-3.5" />} label="Edit" disabled={busy} onClick={onEdit} />
              <ActionButton variant="danger" icon={<RefreshCcw className="h-3.5 w-3.5" />} label="Recall" disabled={busy} onClick={() => setConfirm('recall')} />
            </div>
          </>
        )}

        {status === 'judging' && (
          <>
            <ActionButton full variant="primary" icon={<BarChart2 className="h-4 w-4" />} label="Compute results" disabled={busy} onClick={compute} />
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={<Eye className="h-3.5 w-3.5" />} label="Submissions" disabled={busy} onClick={() => window.open('/judge', '_blank')} />
              <ActionButton icon={<Trophy className="h-3.5 w-3.5" />} label="Publish results" disabled={busy} onClick={publishResults} />
            </div>
            <p className="text-xs leading-relaxed text-smoke">Compute first. It needs every judge to have finished scoring.</p>
          </>
        )}

        {status === 'complete' && (
          <div className="flex items-center gap-2 text-smoke">
            <Lock className="h-4 w-4" />
            <span className="text-xs">Complete and locked.</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirm === 'delete' && <ConfirmDialog message="Delete this draft permanently? This can't be undone." onConfirm={del} onCancel={() => setConfirm(null)} />}
        {confirm === 'recall' && <ConfirmDialog message="Recall to Draft? It disappears for competitors immediately." onConfirm={recall} onCancel={() => setConfirm(null)} />}
        {confirm === 'close' && <ConfirmDialog message="Close submissions now and move this sprint to Judging?" onConfirm={close} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>

      <div aria-live="polite">
        {busy && (
          <p className="mt-3 flex items-center gap-2 text-xs text-white/75">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…
          </p>
        )}
        {result && (
          <p
            role="status"
            className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
              result.ok ? 'border-white/30 bg-white/5 text-chalk' : 'border-signal/60 bg-signal/10 text-chalk'
            }`}
          >
            {result.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />}
            {result.message}
          </p>
        )}
      </div>
    </article>
  );
}

// ─── THE BOARD ────────────────────────────────────────────────────────────────
export function SprintBoard({
  sprints, onRefresh, onEdit, now,
}: {
  sprints: SprintRow[];
  onRefresh: () => void;
  onEdit: (sprint: SprintRow) => void;
  now: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage, i) => {
        const items = sprints.filter((s) => s.sprint_status === stage.status);
        const isLive = stage.status === 'live';
        return (
          <section key={stage.status} aria-label={`${stage.title} sprints`} className="min-w-0">
            <div className={`mb-3 flex items-center justify-between border-t-4 pt-3 ${isLive ? 'border-signal' : 'border-white/25'}`}>
              <div>
                <h3 className="font-poster text-2xl uppercase leading-none">
                  {stage.title}
                  <span className="ml-2 font-mono text-sm text-smoke">{items.length}</span>
                </h3>
                <p className="mt-1 text-xs text-smoke">{stage.hint}</p>
              </div>
              {i < STAGES.length - 1 && <ChevronRight aria-hidden className="hidden h-5 w-5 text-white/30 xl:block" />}
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-xs text-white/45">
                  No sprints here
                </p>
              ) : (
                items.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onRefresh={onRefresh}
                    onEdit={() => onEdit(sprint)}
                    windowPassed={new Date(sprint.close_at).getTime() <= now}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
