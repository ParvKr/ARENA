import { z } from 'zod';
import { ALLOWED_SUBMISSION_FORMATS } from './submission.schema';

// ─── STORAGE CONSTANTS ──────────────────────────────────────────────────────
const MAX_MAIN_FILE_SIZE = 10 * 1024 * 1024;    // 10MB maximum target limit
const MAX_PROCESS_FILE_SIZE = 5 * 1024 * 1024;  // 5MB maximum target limit

// ─── ADMIN CRITERIA VALIDATIONS ─────────────────────────────────────────────

export const AssignJudgeSchema = z.object({
  sprint_id: z.uuid({
    message: 'Invalid sprint target UUID format',
  }),

  judge_user_id: z.uuid({
    message: 'Invalid judge account UUID format',
  }),
});

export const DisqualifySchema = z.object({
  submission_id: z.uuid({
    message: 'Invalid submission targeted for modification',
  }),

  reason: z
    .string()
    .trim()
    .min(10, {
      message:
        'Disqualification reason must supply at least 10 descriptive characters',
    })
    .max(500, {
      message:
        'Disqualification description cannot exceed 500 characters',
    }),
});

export const PublishResultsSchema = z.object({
  sprint_id: z.uuid({
    message: 'Invalid target sprint context payload',
  }),

  confirm_key: z.string().refine(
    (val) => val === 'PUBLISH',
    {
      message:
        "Critical action validation failed: You must type 'PUBLISH' exactly to execute",
    }
  ),
});

// ─── SECURED STORAGE PRESIGN VALIDATION ─────────────────────────────────────

export const PresignSchema = z.object({
  file_name: z
    .string()
    .trim()
    .min(1, {
      message:
        'File name tracking reference cannot be left blank',
    })
    .max(255, {
      message:
        'File identification path string is too long',
    })
    // Sanitize unsafe structural or folder path characters
    .transform((name) =>
      name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    ),

  file_type: z.enum(ALLOWED_SUBMISSION_FORMATS),

  file_size: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .int({
        message:
          'Data allocation counts must evaluate to a whole integer',
      })
      .positive({
        message:
          'File size metrics must be greater than zero bytes',
      })
  ),

  is_process_doc: z.boolean(),
}).refine(
  (data) => {
    const boundaryLimit = data.is_process_doc
      ? MAX_PROCESS_FILE_SIZE
      : MAX_MAIN_FILE_SIZE;

    return data.file_size <= boundaryLimit;
  },
  {
    message:
      'Selected asset payload size violates maximum file upload policies',
    path: ['file_size'],
  }
);

// ─── DATA LAYERING TYPING HOOK INFRASTRUCTURE ──────────────────────────────

export type AssignJudgeInput = z.input<typeof AssignJudgeSchema>;
export type AssignJudgeOutput = z.output<typeof AssignJudgeSchema>;

export type DisqualifyInput = z.input<typeof DisqualifySchema>;
export type DisqualifyOutput = z.output<typeof DisqualifySchema>;

export type PublishResultsInput = z.input<typeof PublishResultsSchema>;
export type PublishResultsOutput = z.output<typeof PublishResultsSchema>;

export type PresignInput = z.input<typeof PresignSchema>;
export type PresignOutput = z.output<typeof PresignSchema>;