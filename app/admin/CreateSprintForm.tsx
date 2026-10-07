'use client';

// app/admin/CreateSprintForm.tsx
// Full create-sprint form wired to POST /api/admin/sprint.
// Mirrors CreateSprintSchema field-for-field.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { SPRINT_DISCIPLINES } from '@/lib/validators/sprint.schema';

// ─── CLIENT-SIDE FORM SCHEMA ──────────────────────────────────────────
// Uses string datetimes (HTML datetime-local input), API route validates/coerces to ISO.
const FormSchema = z.object({
  sprint_number: z.number().int().positive(),
  title: z.string().trim().min(5, 'At least 5 characters').max(120),
  discipline: z.enum(SPRINT_DISCIPLINES),
  open_at: z.string().min(1, 'Required'),
  close_at: z.string().min(1, 'Required'),
  results_at: z.string().min(1, 'Required'),
  // Brief
  brief_context: z.string().trim().min(200, 'Min 200 chars').max(600),
  brief_challenge: z.string().trim().min(50, 'Min 50 chars').max(200),
  brief_constraints: z.string().trim().min(100, 'Min 100 chars').max(500),
  brief_criteria: z.string().trim().min(100, 'Min 100 chars').max(600),
  brief_timeline: z.string().trim().min(20, 'Min 20 chars').max(200),
  // Prize
  prize_first_desc: z.string().trim().min(5).max(200),
  prize_first_cash: z.number().int().positive().max(10_000_000).optional(),
  prize_first_sponsor: z.string().trim().max(100).optional(),
  prize_second_desc: z.string().trim().min(5).max(200),
  prize_second_sponsor: z.string().trim().max(100).optional(),
  prize_third_desc: z.string().trim().min(5).max(200),
  prize_third_sponsor: z.string().trim().max(100).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

// Converts a local datetime-local string to a UTC ISO string
function toUTC(local: string): string {
  return new Date(local).toISOString();
}

// ─── FIELD WRAPPERS ───────────────────────────────────────────────────
function Field({ label, hint, error, children }: {
  label: string;
  hint?: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-white/75">{label}</label>
        {hint && <span className="font-mono text-[10px] text-white/45">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-mono text-[11px] text-signal">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-white/15 bg-void px-3 py-2.5 text-sm text-chalk placeholder-white/45 outline-none transition focus:border-signal focus:ring-1 focus:ring-signal/30';
const textareaCls = `${inputCls} resize-none leading-relaxed`;

// ─── SECTION TOGGLE ───────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/15 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 bg-white/[0.05] text-left hover:bg-white/10 transition-colors"
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-smoke">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-smoke" /> : <ChevronDown className="h-4 w-4 text-smoke" />}
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

// ─── MAIN FORM ────────────────────────────────────────────────────────
export function CreateSprintForm({ nextSprintNumber, onCreated }: { nextSprintNumber: number; onCreated?: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { sprint_number: nextSprintNumber },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setStatus('loading');
    setServerError(null);

    // Shape the body to match CreateSprintSchema
    const body = {
      sprint_number: values.sprint_number,
      title: values.title,
      discipline: values.discipline,
      open_at: toUTC(values.open_at),
      close_at: toUTC(values.close_at),
      results_at: toUTC(values.results_at),
      brief_content: {
        context: values.brief_context,
        challenge: values.brief_challenge,
        constraints: values.brief_constraints,
        criteria: values.brief_criteria,
        timeline: values.brief_timeline,
      },
      prize_data: {
        first: {
          description: values.prize_first_desc,
          ...(values.prize_first_cash ? { cash_amount: values.prize_first_cash } : {}),
          ...(values.prize_first_sponsor ? { sponsor: values.prize_first_sponsor } : {}),
        },
        second: {
          description: values.prize_second_desc,
          ...(values.prize_second_sponsor ? { sponsor: values.prize_second_sponsor } : {}),
        },
        third: {
          description: values.prize_third_desc,
          ...(values.prize_third_sponsor ? { sponsor: values.prize_third_sponsor } : {}),
        },
      },
    };

    try {
      const res = await fetch('/api/admin/sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      setStatus('success');
      reset({ sprint_number: nextSprintNumber + 1 });
      router.refresh(); // Refresh the server component to update the sprints list
      if (onCreated) setTimeout(onCreated, 1200);
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Core fields ── */}
      <Section title="Core Details" defaultOpen>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sprint #" error={errors.sprint_number?.message}>
            <input type="number" {...register('sprint_number', { valueAsNumber: true })} className={inputCls} />
          </Field>
          <Field label="Discipline" error={errors.discipline?.message}>
            <select {...register('discipline')} className={inputCls}>
              <option value="">Select…</option>
              {SPRINT_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Sprint Title" hint="5–120 chars" error={errors.title?.message}>
          <input type="text" {...register('title')} placeholder="e.g. Rebrand a D2C organic food startup..." className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Opens" error={errors.open_at?.message}>
            <input type="datetime-local" {...register('open_at')} className={inputCls} />
          </Field>
          <Field label="Closes" error={errors.close_at?.message}>
            <input type="datetime-local" {...register('close_at')} className={inputCls} />
          </Field>
          <Field label="Results" error={errors.results_at?.message}>
            <input type="datetime-local" {...register('results_at')} className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* ── Brief ── */}
      <Section title="Brief Content" defaultOpen>
        <Field label="Context" hint="200–600 chars" error={errors.brief_context?.message}>
          <textarea rows={4} {...register('brief_context')} placeholder="Set the scene — brand, market, audience, background..." className={textareaCls} />
        </Field>
        <Field label="Challenge" hint="50–200 chars" error={errors.brief_challenge?.message}>
          <textarea rows={2} {...register('brief_challenge')} placeholder="The specific task to complete..." className={textareaCls} />
        </Field>
        <Field label="Constraints" hint="100–500 chars" error={errors.brief_constraints?.message}>
          <textarea rows={3} {...register('brief_constraints')} placeholder="Deliverable format, tools, scope, don'ts..." className={textareaCls} />
        </Field>
        <Field label="Judging Criteria" hint="100–600 chars" error={errors.brief_criteria?.message}>
          <textarea rows={3} {...register('brief_criteria')} placeholder="What judges will look for: strategy, craft, clarity..." className={textareaCls} />
        </Field>
        <Field label="Timeline" hint="20–200 chars" error={errors.brief_timeline?.message}>
          <input type="text" {...register('brief_timeline')} placeholder="e.g. 72 hours from Friday 6pm — Sunday 6pm IST" className={inputCls} />
        </Field>
      </Section>

      {/* ── Prizes ── */}
      <Section title="Prize Data" defaultOpen={false}>
        <div className="space-y-4">
          <div className="rounded-lg border border-signal/20 bg-signal/5 p-4 space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-signal">1st Place</span>
            <Field label="Description" error={errors.prize_first_desc?.message}>
              <input type="text" {...register('prize_first_desc')} placeholder="$5,000 cash + Adobe CC annual license" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cash amount (USD)" error={errors.prize_first_cash?.message}>
                <input type="number" {...register('prize_first_cash', { valueAsNumber: true })} placeholder="5000" className={inputCls} />
              </Field>
              <Field label="Sponsor (optional)">
                <input type="text" {...register('prize_first_sponsor')} placeholder="e.g. Adobe" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/5 p-4 space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/75">2nd Place</span>
            <Field label="Description" error={errors.prize_second_desc?.message}>
              <input type="text" {...register('prize_second_desc')} placeholder="$2,000 cash + 6 months Pro membership" className={inputCls} />
            </Field>
            <Field label="Sponsor (optional)">
              <input type="text" {...register('prize_second_sponsor')} className={inputCls} />
            </Field>
          </div>

          <div className="rounded-lg border border-smoke/20 bg-smoke/5 p-4 space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-smoke">3rd Place</span>
            <Field label="Description" error={errors.prize_third_desc?.message}>
              <input type="text" {...register('prize_third_desc')} placeholder="$1,000 cash" className={inputCls} />
            </Field>
            <Field label="Sponsor (optional)">
              <input type="text" {...register('prize_third_sponsor')} className={inputCls} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Server-level error ── */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-lg border border-signal/30 bg-signal/5 p-4"
          >
            <AlertCircle className="h-4 w-4 text-signal mt-0.5 shrink-0" />
            <p className="font-mono text-xs text-signal">{serverError}</p>
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-lg border border-chalk/30 bg-chalk/5 p-4"
          >
            <CheckCircle2 className="h-4 w-4 text-chalk shrink-0" />
            <p className="font-mono text-xs text-chalk">Sprint created successfully. It&apos;s now in draft — publish it when ready.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-signal py-3.5 font-display text-sm font-bold text-white transition-all hover:bg-signal disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 0 24px rgba(124,92,255,0.35)' }}
      >
        {status === 'loading' ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creating Sprint…</>
        ) : (
          'Create Sprint (Draft)'
        )}
      </button>

      <p className="text-center font-mono text-[11px] text-white/45">
        Sprint will be saved as draft. Use publish controls to make it live.
      </p>
    </form>
  );
}
