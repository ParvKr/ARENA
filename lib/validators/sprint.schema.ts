import { z } from 'zod';

// ─── CENTRALIZED CONSTANTS ──────────────────────────────────────────────────
export const SPRINT_DISCIPLINES = [
  'Visual Design',
  'Copywriting',
  'Video Editing',
  'UI/UX Design',
  'No-Code Building',
] as const;

export type SprintDiscipline = typeof SPRINT_DISCIPLINES[number];

// ─── REUSABLE VALIDATION SNIPPETS ───────────────────────────────────────────
// Enforces strict UTC offset structure and normalizes date formatting
const UtcDateTimeSchema = z
  .iso
  .datetime({ message: 'Must be a valid ISO 8601 datetime string ending with Z (UTC)' })
  .transform((val) => new Date(val).toISOString());

// Standard text field sanitizer
const TrimmedString = (min: number, max: number, scope: string) => 
  z.string()
    .trim()
    .min(min, { message: `${scope} must be at least ${min} characters after trimming` })
    .max(max, { message: `${scope} cannot exceed ${max} characters` });

// ─── NESTED BRIEF MATERIAL SCHEMA ───────────────────────────────────────────
export const BriefContentSchema = z.object({
  context: TrimmedString(200, 600, 'Context description'),
  challenge: TrimmedString(50, 200, 'Challenge overview'),
  constraints: TrimmedString(100, 500, 'Operational constraints'),
  criteria: TrimmedString(100, 600, 'Evaluation criteria'),
  timeline: TrimmedString(20, 200, 'Timeline breakdown'),
});

// ─── NESTED PRIZE LAYOUT SCHEMA ─────────────────────────────────────────────
export const PrizeDataSchema = z.object({
  first: z.object({
    description: TrimmedString(5, 200, 'First place description'),
    sponsor: z.string().trim().max(100).optional(),
    cash_amount: z.number().int().positive().max(10_000_000).optional(),
  }),
  second: z.object({
    description: TrimmedString(5, 200, 'Second place description'),
    sponsor: z.string().trim().max(100).optional(),
  }),
  third: z.object({
    description: TrimmedString(5, 200, 'Third place description'),
    sponsor: z.string().trim().max(100).optional(),
  }),
});

// ─── CORE SCHEMA SCHEMATIC ──────────────────────────────────────────────────
const CoreSprintFields = {
  sprint_number: z.number().int().positive().max(99999),
  title: TrimmedString(5, 120, 'Sprint title'),
  discipline: z.enum(SPRINT_DISCIPLINES,),
  brief_content: BriefContentSchema,
  prize_data: PrizeDataSchema,
  open_at: UtcDateTimeSchema,
  close_at: UtcDateTimeSchema,
  results_at: UtcDateTimeSchema,
};

// ─── CREATE ACTION VALIDATION ───────────────────────────────────────────────
export const CreateSprintSchema = z.object(CoreSprintFields).refine(
  (data) => new Date(data.close_at) > new Date(data.open_at),
  { message: 'Submission closure date must be set after the sprint opening window', path: ['close_at'] }
).refine(
  (data) => new Date(data.results_at) > new Date(data.close_at),
  { message: 'Results publication date must be set after the sprint submission deadline', path: ['results_at'] }
);

// ─── UPDATE ACTION VALIDATION ───────────────────────────────────────────────
export const UpdateSprintSchema = z.object(CoreSprintFields)
  .omit({ sprint_number: true })
  .partial()
  .refine(
    (data) => {
      if (!data.open_at || !data.close_at) return true;
      return new Date(data.close_at) > new Date(data.open_at);
    },
    { message: 'Submission closure date must be set after the sprint opening window', path: ['close_at'] }
  )
  .refine(
    (data) => {
      if (!data.close_at || !data.results_at) return true;
      return new Date(data.results_at) > new Date(data.close_at);
    },
    { message: 'Results publication date must be set after the sprint submission deadline', path: ['results_at'] }
  );

// ─── INFERRED TYPE EXPORTS ──────────────────────────────────────────────────
export type CreateSprintInput = z.input<typeof CreateSprintSchema>;
export type CreateSprintOutput = z.output<typeof CreateSprintSchema>;

export type UpdateSprintInput = z.input<typeof UpdateSprintSchema>;
export type UpdateSprintOutput = z.output<typeof UpdateSprintSchema>;