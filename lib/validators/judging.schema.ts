import { z } from 'zod';

// ─── REUSABLE REPETITIVE FIELD FACTORIES ────────────────────────────────────
  const ScoreField = (label: string) =>
  z.preprocess(
    (val) => Number(val),
    z
      .number()
      .int({
        message: `${label} score must be logged as a standard whole integer`,
      })
      .min(0, {
        message: `${label} score lower limit threshold is 0`,
      })
      .max(10, {
        message: `${label} score maximum allowed allocation is 10`,
      })
  );

// ─── SCORE RECORD VALIDATION SCHEMATIC ──────────────────────────────────────
export const ScoreSchema = z.object({
  submission_id: z.uuid({ message: 'Invalid target submission identifier' }),
  concept_score: ScoreField('Concept'),
  craft_score: ScoreField('Craft'),
  adherence_score: ScoreField('Adherence'),
  originality_score: ScoreField('Originality'),
  impact_score: ScoreField('Impact'),
  comment: z
    .string()
    .trim()
    .min(10, { message: 'Judge analysis comments must provide at least 10 descriptive characters' })
    .max(500, { message: 'Judge analysis comments cannot exceed a 500 character maximum limit' }),
});

// ─── EXTENDED TRANSFORM SCHEMA FOR BACKEND CALCULATIONS ─────────────────────
// Calculates the total score value right at the input parsing gateway
export const ScoreSchemaWithCalculatedTotal = ScoreSchema.transform((data) => ({
  ...data,
  total_score: 
    data.concept_score + 
    data.craft_score + 
    data.adherence_score + 
    data.originality_score + 
    data.impact_score, // Max possible score: 50
}));

// ─── BULK CLOSURE EVALUATION VALIDATION ─────────────────────────────────────
export const CompleteEvaluationSchema = z.object({
  sprint_id: z.string().uuid({ message: 'Invalid sprint selection identifier' }),
});

// ─── INFERRED TYPING HOOKS EXPORTS ──────────────────────────────────────────
export type ScoreInput = z.input<typeof ScoreSchema>;
export type ScoreOutput = z.output<typeof ScoreSchema>;

export type ScoreWithCalculatedTotalOutput = z.output<typeof ScoreSchemaWithCalculatedTotal>;

export type CompleteEvaluationInput = z.input<typeof CompleteEvaluationSchema>;
export type CompleteEvaluationOutput = z.output<typeof CompleteEvaluationSchema>;
