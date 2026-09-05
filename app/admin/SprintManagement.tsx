'use client';

// app/admin/SprintManagement.tsx
// Right-panel sprint management — shows actionable controls per sprint lifecycle state.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Archive, Trash2, Pencil, BarChart2, Trophy,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Loader2, Eye, RefreshCcw, Lock
} from 'lucide-react';
import type { SprintStatus } from '@/types/api.types';
import { EditSprintModal } from './EditSprintModal';

export interface SprintRow {
  id: string;
  sprint_number: number;
  title: string;
  discipline: string;
  sprint_status: SprintStatus;
  open_at: string;
  close_at: string;
  results_at: string | null;
  brief_content?: { context: string; challenge: string; constraints: string; criteria: string; timeline: string; } | null;
  prize_data?: { first: { description: string; cash_amount?: number; sponsor?: string }; second: { description: string; sponsor?: string }; third: { description: string; sponsor?: string } } | null;
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_META: Record<SprintStatus, { label: string; dot: string; border: string; bg: string; text: string }> = {
  draft:    { label: 'Draft',    dot: '#737380', border: '#2C2C3A', bg: '#0A0A0F',       text: '#737380' },
  live:     { label: 'Live',     dot: '#4ADE80', border: '#4ADE80', bg: '#4ADE8008',     text: '#4ADE80' },
  judging:  { label: 'Judging', dot: '#45B7D1', border: '#45B7D1', bg: '#45B7D108',     text: '#45B7D1' },
  complete: { label: 'Complete', dot: '#FFD700', border: '#FFD700', bg: '#FFD70008',     text: '#FFD700' },
};

// ─── API HELPER ───────────────────────────────────────────────────────────────
async function callAction(url: string, method = 'POST'): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
  const json = await res.json();
  if (!res.ok) return { ok: false, message: json.error ?? `Error ${res.status}` };
  return { ok: true, message: json.data?.message ?? 'Done.' };
}

// ─── ACTION BUTTON ────────────────────────────────────────────────────────────
function ActionButton({
  icon, label, variant = 'ghost', disabled, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: 'ghost' | 'accent' | 'danger' | 'warn';
  disabled?: boolean;
  onClick: () => void;
}) {
  const styles = {
    ghost:  'border-[#1C1C26] text-[#A3A3B0] hover:border-[#2C2C3A] hover:text-white hover:bg-[#101017]',
    accent: 'border-[#7C5CFF]/40 text-[#7C5CFF] bg-[#7C5CFF]/5 hover:bg-[#7C5CFF]/15 hover:border-[#7C5CFF]',
    danger: 'border-[#FF2D55]/30 text-[#FF2D55] hover:bg-[#FF2D55]/10 hover:border-[#FF2D55]/60',
    warn:   'border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700]/60',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {icon}{label}
    </button>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({
  message, onConfirm, onCancel,
}: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-3 flex items-start gap-3 rounded-lg border border-[#FF2D55]/30 bg-[#FF2D55]/5 p-3"
    >
      <AlertTriangle className="h-4 w-4 text-[#FF2D55] mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-mono text-xs text-[#FF2D55]">{message}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={onConfirm} className="rounded bg-[#FF2D55] px-3 py-1 font-mono text-[10px] font-bold text-white hover:bg-[#FF2D55]/80">
            Confirm
          </button>
          <button onClick={onCancel} className="rounded border border-[#2C2C3A] px-3 py-1 font-mono text-[10px] text-[#737380] hover:text-white">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SINGLE SPRINT ROW ────────────────────────────────────────────────────────
function SprintCard({ sprint, onRefresh, onEdit }: { sprint: SprintRow; onRefresh: () => void; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState<'delete' | 'recall' | 'close' | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const meta = STATUS_META[sprint.sprint_status];

  async function act(action: () => Promise<{ ok: boolean; message: string }>) {
    setBusy(true);
    setConfirm(null);
    setResult(null);
    const r = await action();
    setResult(r);
    setBusy(false);
    if (r.ok) setTimeout(onRefresh, 800);
  }

  const publish  = () => act(() => callAction(`/api/admin/sprint/${sprint.id}/publish`));
  const recall   = () => act(() => callAction(`/api/admin/sprint/${sprint.id}/recall`));
  const close    = () => act(() => callAction(`/api/admin/sprint/${sprint.id}`, 'DELETE').then(() => 
                       callAction(`/api/admin/sprint/${sprint.id}/close-submissions`)));
  const compute  = () => act(() => callAction(`/api/admin/sprint/${sprint.id}/compute-results`));
  const pubRes   = () => act(() => callAction(`/api/admin/sprint/${sprint.id}/publish-results`));
  const del      = () => act(() => callAction(`/api/admin/sprint/${sprint.id}`, 'DELETE'));

  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors"
      style={{ borderColor: meta.border + '60', background: meta.bg }}
    >
      {/* ── Sprint header row ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-mono text-xs font-bold" style={{ color: meta.dot }}>
          #{sprint.sprint_number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-white">{sprint.title}</p>
          <p className="text-xs" style={{ color: '#737380' }}>{sprint.discipline}</p>
        </div>

        {/* Status pill */}
        <span
          className="shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
          style={{ borderColor: meta.border + '50', color: meta.text, background: meta.bg }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot, boxShadow: sprint.sprint_status === 'live' ? `0 0 6px ${meta.dot}` : 'none' }} />
          {meta.label}
        </span>

        {expanded
          ? <ChevronUp className="h-4 w-4 shrink-0 text-[#737380]" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-[#737380]" />}
      </button>

      {/* ── Expanded actions ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: '#1C1C26' }}>

              {/* ── Timing info ── */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-[#737380]">
                <div><span className="text-[#3A3A50]">Opens </span>{new Date(sprint.open_at).toLocaleString()}</div>
                <div><span className="text-[#3A3A50]">Closes </span>{new Date(sprint.close_at).toLocaleString()}</div>
              </div>

              {/* ── Status-gated actions ── */}
              {sprint.sprint_status === 'draft' && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#3A3A50]">Draft Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      icon={<Radio className="h-3.5 w-3.5" />}
                      label="Publish"
                      variant="accent"
                      disabled={busy}
                      onClick={publish}
                    />
                    <ActionButton
                      icon={<Pencil className="h-3.5 w-3.5" />}
                      label="Edit"
                      variant="ghost"
                      disabled={busy}
                      onClick={onEdit}
                    />
                    <ActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      label="Delete"
                      variant="danger"
                      disabled={busy}
                      onClick={() => setConfirm('delete')}
                    />
                  </div>
                  <AnimatePresence>
                    {confirm === 'delete' && (
                      <ConfirmDialog
                        message="Permanently delete this draft sprint? This cannot be undone."
                        onConfirm={del}
                        onCancel={() => setConfirm(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {sprint.sprint_status === 'live' && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#3A3A50]">Live Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      icon={<Eye className="h-3.5 w-3.5" />}
                      label="View Brief"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => window.open('/sprint', '_blank')}
                    />
                    <ActionButton
                      icon={<Pencil className="h-3.5 w-3.5" />}
                      label="Edit"
                      variant="ghost"
                      disabled={busy}
                      onClick={onEdit}
                    />
                    <ActionButton
                      icon={<Archive className="h-3.5 w-3.5" />}
                      label="Close Submissions"
                      variant="warn"
                      disabled={busy}
                      onClick={() => setConfirm('close')}
                    />
                    <ActionButton
                      icon={<RefreshCcw className="h-3.5 w-3.5" />}
                      label="Recall to Draft"
                      variant="danger"
                      disabled={busy}
                      onClick={() => setConfirm('recall')}
                    />
                  </div>
                  <AnimatePresence>
                    {confirm === 'recall' && (
                      <ConfirmDialog
                        message="Recall this sprint back to Draft? It will be hidden from competitors immediately."
                        onConfirm={recall}
                        onCancel={() => setConfirm(null)}
                      />
                    )}
                    {confirm === 'close' && (
                      <ConfirmDialog
                        message="Close submissions now and move to Judging phase?"
                        onConfirm={close}
                        onCancel={() => setConfirm(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {sprint.sprint_status === 'judging' && (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#3A3A50]">Judging Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      icon={<Eye className="h-3.5 w-3.5" />}
                      label="View Submissions"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => window.open('/judge', '_blank')}
                    />
                    <ActionButton
                      icon={<BarChart2 className="h-3.5 w-3.5" />}
                      label="Compute Results"
                      variant="accent"
                      disabled={busy}
                      onClick={compute}
                    />
                    <ActionButton
                      icon={<Trophy className="h-3.5 w-3.5" />}
                      label="Publish Results"
                      variant="warn"
                      disabled={busy}
                      onClick={pubRes}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-[#3A3A50]">
                    Compute results first — requires all judges to have completed scoring.
                  </p>
                </div>
              )}

              {sprint.sprint_status === 'complete' && (
                <div className="flex items-center gap-2 text-[#737380]">
                  <Lock className="h-4 w-4" />
                  <span className="font-mono text-xs">Sprint is complete and locked.</span>
                </div>
              )}

              {/* ── Feedback banner ── */}
              <AnimatePresence>
                {busy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 font-mono text-xs text-[#A3A3B0]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
                  </motion.div>
                )}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs ${result.ok ? 'border-[#4ADE80]/30 text-[#4ADE80] bg-[#4ADE80]/5' : 'border-[#FF2D55]/30 text-[#FF2D55] bg-[#FF2D55]/5'}`}
                  >
                    {result.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                    {result.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function SprintManagement({ sprints }: { sprints: SprintRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingSprint, setEditingSprint] = useState<SprintRow | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  // Group by status for visual ordering: live → judging → draft → complete
  const ORDER: SprintStatus[] = ['live', 'judging', 'draft', 'complete'];
  const sorted = [...sprints].sort(
    (a, b) => ORDER.indexOf(a.sprint_status) - ORDER.indexOf(b.sprint_status)
  );

  const counts = Object.fromEntries(
    ORDER.map(s => [s, sprints.filter(sp => sp.sprint_status === s).length])
  ) as Record<SprintStatus, number>;

  return (
    <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden">
      <div className="border-b border-[#1C1C26] bg-[#101017] px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">Sprint Management</h2>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-lg border border-[#1C1C26] px-2.5 py-1.5 font-mono text-[10px] text-[#737380] hover:text-white hover:border-[#2C2C3A] transition-colors"
          >
            <RefreshCcw className="h-3 w-3" /> Refresh
          </button>
        </div>
        {/* Status summary pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {ORDER.map(s => counts[s] > 0 && (
            <span key={s} className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px]"
              style={{ borderColor: STATUS_META[s].border + '40', color: STATUS_META[s].text }}>
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: STATUS_META[s].dot }} />
              {counts[s]} {STATUS_META[s].label}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#0A0A0F] p-3 space-y-2">
        {sorted.length > 0 ? (
          sorted.map(sprint => (
            <SprintCard key={sprint.id} sprint={sprint} onRefresh={refresh} onEdit={() => setEditingSprint(sprint)} />
          ))
        ) : (
          <div className="py-10 text-center font-mono text-xs text-[#3A3A50]">
            No sprints yet. Create one →
          </div>
        )}
      </div>
      <AnimatePresence>
        {editingSprint && (
          <EditSprintModal
            sprint={editingSprint}
            onClose={() => setEditingSprint(null)}
            onSaved={() => { setEditingSprint(null); refresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
