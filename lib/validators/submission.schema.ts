import { z } from 'zod';

// ─── EXTRACT SHARABLE CONFIGURATIONS ────────────────────────────────────────
export const ALLOWED_SUBMISSION_FORMATS = ['image/png', 'image/jpeg', 'application/pdf'] as const;
export type AllowedSubmissionFormat = typeof ALLOWED_SUBMISSION_FORMATS[number];

// Standardized text sanitizer component
const CleanString = (min: number, max: number, fieldName: string) =>
  z.string()
    .trim()
    .min(min, { message: `${fieldName} must be at least ${min} characters after trimming` })
    .max(max, { message: `${fieldName} cannot exceed ${max} characters` });

// ─── SUBMISSION VALIDATION SCHEMA ───────────────────────────────────────────
export const SubmissionSchema = z.object({
  sprint_id: z.string().uuid({ message: 'Invalid sprint selection identifier' }),
  
  main_file_url: z
    .string()
    .url({ message: 'Main file link must point to a valid secure URL destination' })
    .max(512, { message: 'Main file storage path URL is too long' }),
    
  main_file_type: z.enum(ALLOWED_SUBMISSION_FORMATS,),
  
  process_file_urls: z
    .array(
      z.string()
        .url({ message: 'Process links must point to a valid secure URL destination' })
        .max(512, { message: 'Process asset storage path URL is too long' })
    )
    .min(2, { message: 'You must upload at least 2 separate work-in-progress screenshots' })
    .max(10, { message: 'You cannot exceed 10 process documentation files total' }),
    
  brief_interpretation: CleanString(50, 300, 'Brief interpretation description'),
  
  tools_used: CleanString(1, 100, 'List of tools used'),
  
    time_spent_hours: z.preprocess(
    (val) => Number(val),
    z.number()
        .int({ message: 'Time logged must be reported as a standard whole integer' })
        .min(1, { message: 'Minimum allocation duration is 1 hour' })
        .max(48, { message: 'Maximum continuous tracking limits cap out at 48 hours' })
    ),
    
  note_to_judges: z
    .string()
    .trim()
    .max(500, { message: 'Optional comments to judges cannot exceed 500 characters' })
    .optional()
    .transform(val => val === '' ? undefined : val), // Standardizes empty values to undefined
    
    ownership_confirmed: z.boolean().refine((val) => val === true, {
    message:
        'You must formally confirm this deliverable is exclusively your original work',
    }),
});

// ─── EXPORTED TYPE INFERENCES ──────────────────────────────────────────────
export type SubmissionInput = z.input<typeof SubmissionSchema>;
export type SubmissionOutput = z.output<typeof SubmissionSchema>;