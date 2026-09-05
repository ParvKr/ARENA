'use client';

// app/admin/EditSprintModal.tsx
// Full-screen slide-in panel (from right) for editing an existing sprint.
// Uses plain useState — no react-hook-form — for simplicity.

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { SPRINT_DISCIPLINES } from '@/lib/validators/sprint.schema';
import type { SprintRow } from './SprintManagement';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Converts a UTC ISO string to a value safe for datetime-local inputs. */
function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converts a datetime-local string back to a UTC ISO string. */
function toUTC(local: string): string {
  return new Date(local).toISOString();
}

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
function Field({ label, hint, error, children }: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3B0]">{label}</label>
        {hint && <span className="font-mono text-[10px] text-[#3A3A50]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-mono text-[11px] text-[#FF2D55]">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-[#1C1C26] bg-[#050507] px-3 py-2.5 text-sm text-[#F5F5F7] placeholder-[#3A3A50] outline-none transition focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/30';
const textareaCls = `${inputCls} resize-none leading-relaxed`;

// ─── COLLAPSIBLE SECTION ──────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#1C1C26] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 bg-[#101017] text-left hover:bg-[#1C1C26] transition-colors"
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#737380]">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#737380]" /> : <ChevronDown className="h-4 w-4 text-[#737380]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface EditSprintModalProps {
  sprint: SprintRow;
  onClose: () => void;
  onSaved: () => void;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function EditSprintModal({ sprint, onClose, onSaved }: EditSprintModalProps) {
  // ── Core fields ──
  const [title, setTitle] = useState(sprint.title);
  const [discipline, setDiscipline] = useState(sprint.discipline);
  const [openAt, setOpenAt] = useState(toLocalDatetime(sprint.open_at));
  const [closeAt, setCloseAt] = useState(toLocalDatetime(sprint.close_at));
  const [resultsAt, setResultsAt] = useState(sprint.results_at ? toLocalDatetime(sprint.results_at) : '');

  // ── Brief fields ──
  const [briefContext, setBriefContext] = useState(sprint.brief_content?.context ?? '');
  const [briefChallenge, setBriefChallenge] = useState(sprint.brief_content?.challenge ?? '');
  const [briefConstraints, setBriefConstraints] = useState(sprint.brief_content?.constraints ?? '');
  const [briefCriteria, setBriefCriteria] = useState(sprint.brief_content?.criteria ?? '');
  const [briefTimeline, setBriefTimeline] = useState(sprint.brief_content?.timeline ?? '');

  // ── Prize fields ──
  const [firstDesc, setFirstDesc] = useState(sprint.prize_data?.first?.description ?? '');
  const [firstCash, setFirstCash] = useState<string>(
    sprint.prize_data?.first?.cash_amount != null ? String(sprint.prize_data.first.cash_amount) : ''
  );
  const [firstSponsor, setFirstSponsor] = useState(sprint.prize_data?.first?.sponsor ?? '');
  const [secondDesc, setSecondDesc] = useState(sprint.prize_data?.second?.description ?? '');
  const [secondSponsor, setSecondSponsor] = useState(sprint.prize_data?.second?.sponsor ?? '');
  const [thirdDesc, setThirdDesc] = useState(sprint.prize_data?.third?.description ?? '');
  const [thirdSponsor, setThirdSponsor] = useState(sprint.prize_data?.third?.sponsor ?? '');

  // ── Submit state ──
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setServerError(null);

    const body = {
      title,
      discipline,
      open_at: toUTC(openAt),
      close_at: toUTC(closeAt),
      results_at: toUTC(resultsAt),
      brief_content: {
        context: briefContext,
        challenge: briefChallenge,
        constraints: briefConstraints,
        criteria: briefCriteria,
        timeline: briefTimeline,
      },
      prize_data: {
        first: {
          description: firstDesc,
          ...(firstCash ? { cash_amount: Number(firstCash) } : {}),
          ...(firstSponsor ? { sponsor: firstSponsor } : {}),
        },
        second: {
          description: secondDesc,
          ...(secondSponsor ? { sponsor: secondSponsor } : {}),
        },
        third: {
          description: thirdDesc,
          ...(thirdSponsor ? { sponsor: thirdSponsor } : {}),
        },
      },
    };

    try {
      const res = await fetch(`/api/admin/sprint/${sprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? `Server error ${res.status}`);
      setStatus('success');
      setTimeout(() => onSaved(), 800);
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="edit-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <motion.div
        key="edit-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-[#0A0A0F] border-l border-[#1C1C26] shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#1C1C26] bg-[#101017] px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#7C5CFF]">Admin • Sprint #{sprint.sprint_number}</p>
            <h2 className="font-display text-base font-bold text-white">Edit Sprint</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#1C1C26] p-2 text-[#737380] transition-colors hover:border-[#2C2C3A] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-5 p-6">

            {/* ── Core Details ── */}
            <Section title="Core Details" defaultOpen>
              <Field label="Sprint Title" hint="5–120 chars">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Discipline">
                <select
                  value={discipline}
                  onChange={e => setDiscipline(e.target.value)}
                  className={inputCls}
                >
                  {SPRINT_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Opens">
                  <input
                    type="datetime-local"
                    value={openAt}
                    onChange={e => setOpenAt(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Closes">
                  <input
                    type="datetime-local"
                    value={closeAt}
                    onChange={e => setCloseAt(e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Results">
                  <input
                    type="datetime-local"
                    value={resultsAt}
                    onChange={e => setResultsAt(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {/* ── Brief Content ── */}
            <Section title="Brief Content" defaultOpen>
              <Field label="Context" hint="200–600 chars">
                <textarea
                  rows={4}
                  value={briefContext}
                  onChange={e => setBriefContext(e.target.value)}
                  className={textareaCls}
                />
              </Field>
              <Field label="Challenge" hint="50–200 chars">
                <textarea
                  rows={2}
                  value={briefChallenge}
                  onChange={e => setBriefChallenge(e.target.value)}
                  className={textareaCls}
                />
              </Field>
              <Field label="Constraints" hint="100–500 chars">
                <textarea
                  rows={3}
                  value={briefConstraints}
                  onChange={e => setBriefConstraints(e.target.value)}
                  className={textareaCls}
                />
              </Field>
              <Field label="Judging Criteria" hint="100–600 chars">
                <textarea
                  rows={3}
                  value={briefCriteria}
                  onChange={e => setBriefCriteria(e.target.value)}
                  className={textareaCls}
                />
              </Field>
              <Field label="Timeline" hint="20–200 chars">
                <input
                  type="text"
                  value={briefTimeline}
                  onChange={e => setBriefTimeline(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </Section>

            {/* ── Prize Data ── */}
            <Section title="Prize Data" defaultOpen={false}>
              <div className="space-y-4">
                <div className="rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/5 p-4 space-y-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">1st Place</span>
                  <Field label="Description">
                    <input type="text" value={firstDesc} onChange={e => setFirstDesc(e.target.value)} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cash amount (USD)">
                      <input
                        type="number"
                        value={firstCash}
                        onChange={e => setFirstCash(e.target.value)}
                        placeholder="5000"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Sponsor (optional)">
                      <input type="text" value={firstSponsor} onChange={e => setFirstSponsor(e.target.value)} placeholder="e.g. Adobe" className={inputCls} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-lg border border-[#A3A3B0]/20 bg-[#A3A3B0]/5 p-4 space-y-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A3A3B0]">2nd Place</span>
                  <Field label="Description">
                    <input type="text" value={secondDesc} onChange={e => setSecondDesc(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Sponsor (optional)">
                    <input type="text" value={secondSponsor} onChange={e => setSecondSponsor(e.target.value)} className={inputCls} />
                  </Field>
                </div>

                <div className="rounded-lg border border-[#CD7F32]/20 bg-[#CD7F32]/5 p-4 space-y-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#CD7F32]">3rd Place</span>
                  <Field label="Description">
                    <input type="text" value={thirdDesc} onChange={e => setThirdDesc(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Sponsor (optional)">
                    <input type="text" value={thirdSponsor} onChange={e => setThirdSponsor(e.target.value)} className={inputCls} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ── Status banner ── */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 rounded-lg border border-[#FF2D55]/30 bg-[#FF2D55]/5 p-4"
                >
                  <AlertCircle className="h-4 w-4 text-[#FF2D55] mt-0.5 shrink-0" />
                  <p className="font-mono text-xs text-[#FF2D55]">{serverError}</p>
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 rounded-lg border border-[#4ADE80]/30 bg-[#4ADE80]/5 p-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#4ADE80] shrink-0" />
                  <p className="font-mono text-xs text-[#4ADE80]">Sprint updated successfully.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sticky footer ── */}
          <div className="shrink-0 border-t border-[#1C1C26] bg-[#0A0A0F] px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#1C1C26] py-3 font-display text-sm font-bold text-[#737380] transition-all hover:border-[#2C2C3A] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#7C5CFF] py-3 font-display text-sm font-bold text-white transition-all hover:bg-[#9070FF] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 0 24px rgba(124,92,255,0.35)' }}
            >
              {status === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
