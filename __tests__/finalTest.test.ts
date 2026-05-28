// __tests__/ultimate-engine.test.ts
import { describe, it, expect } from 'vitest';
import { 
  anonymiseSubmission, 
  assertAnonymised, 
  isAnonymised 
} from '@/lib/utils/anonymise';
import {
  pointsForPlacement,
  computeRawScore,
  normaliseScore,
  tierFromPoints,
  pointsToNextTier,
} from '@/lib/utils/scoring';
import { SubmissionSchema } from '@/lib/validators/submission.schema';
import { ScoreSchema } from '@/lib/validators/judging.schema';
import type { Submission, Score } from '@/types/api.types';

// ==========================================
// 1. MOCK DATA FACTORY PRIMITIVES
// ==========================================

const createMockSubmission = (overrides: Partial<Submission> = {}): Submission => ({
  id: 'sub-123',
  sprint_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'user-789',
  main_file_url: 'https://storage.supabase.co/assets/render.png',
  main_file_type: 'image/png',
  process_file_urls: ['https://s.co/wip1.png', 'https://s.co/wip2.png'],
  brief_interpretation: 'This structural design interprets the minimal core requirements of the platform brief perfectly.'.repeat(2),
  tools_used: 'Figma, Cinema4D',
  time_spent_hours: 14,
  note_to_judges: 'Rendered at 4k resolution with high-fidelity meshes.',
  is_disqualified: false,
  disqualify_reason: null,
  disqualified_at: null,
  disqualified_by: null,
  submitted_at: '2026-04-25T18:00:00Z',
  ...overrides,
});

const createMockScore = (overrides: Partial<Score> = {}): Score => ({
  id: 'score-999',
  submission_id: 'sub-123',
  judge_user_id: 'judge-alpha',
  concept_score: 8,
  craft_score: 7,
  adherence_score: 9,
  originality_score: 6,
  impact_score: 8,
  feedback: 'Excellent execution. The alignment across tracking elements shows master-level proficiency.'.repeat(2),
  raw_total_score: 38,
  scored_at: '2026-04-28T12:00:00Z',
  updated_at: '2026-04-28T12:00:00Z',
  ...overrides,
});

// ==========================================
// 2. SECURITY & ANONYMIZATION REGRESSIONS
// ==========================================

describe('Security Anonymization Engine', () => {
  const targetSubmission = createMockSubmission();

  it('completely strips high-risk tracking keys and structural metadata parameters', () => {
    const anon = anonymiseSubmission(targetSubmission);
    expect('user_id' in anon).toBe(false);
    expect('id' in anon).toBe(false);
    expect('is_disqualified' in anon).toBe(false);
    expect('disqualify_reason' in anon).toBe(false);
    expect('submitted_at' in anon).toBe(false);
  });

  it('safely maps pristine exhibition-safe properties down to components', () => {
    const anon = anonymiseSubmission(targetSubmission);
    expect(anon.sprint_id).toBe(targetSubmission.sprint_id);
    expect(anon.main_file_url).toBe(targetSubmission.main_file_url);
    expect(anon.tools_used).toBe(targetSubmission.tools_used);
  });

  it('asserts fail-closed execution by identifying security leakage exceptions', () => {
    expect(() => assertAnonymised({ user_id: 'malicious-leak-vector' })).toThrow(/user_id/);
    expect(() => assertAnonymised({ username: 'competitor_01' })).toThrow(/username/);
    expect(() => assertAnonymised({ email: 'leak@arena.com' })).toThrow(/email/);
    
    const cleanAnon = anonymiseSubmission(targetSubmission);
    expect(() => assertAnonymised(cleanAnon as Record<string, unknown>)).not.toThrow();
    expect(isAnonymised(cleanAnon)).toBe(true);
  });
});

// ==========================================
// 3. TOURNAMENT SCORING MATRICES
// ==========================================

describe('Tournament Scoring & Tier Mathematics', () => {
  it('accurately resolves placement metrics against database configuration limits', () => {
    expect(pointsForPlacement(1)).toBe(100);
    expect(pointsForPlacement(2)).toBe(80);
    expect(pointsForPlacement(3)).toBe(65);
    [4, 5, 6].forEach(rank => expect(pointsForPlacement(rank as 4 | 5 | 6)).toBe(50));
    [7, 8, 9, 10].forEach(rank => expect(pointsForPlacement(rank as 7 | 8 | 9 | 10)).toBe(35));
    expect(pointsForPlacement(11)).toBe(10); // Standard submission participation index
  });

  it('computes criteria aggregation blocks safely with flawless ceiling values', () => {
    const score38 = createMockScore();
    expect(computeRawScore(score38)).toBe(38);

    const flawlessScore = createMockScore({
      concept_score: 10, craft_score: 10, adherence_score: 10, originality_score: 10, impact_score: 10
    });
    expect(computeRawScore(flawlessScore)).toBe(50);
  });

  it('scales evaluate matrices to percentage blocks cleanly without precision drift', () => {
    expect(normaliseScore(50)).toBe(100);
    expect(normaliseScore(25)).toBe(50);
    expect(normaliseScore(0)).toBe(0);
    expect(normaliseScore(33)).toBe(66);
  });

  it('maps profile rating milestones cleanly across ladder progression brackets', () => {
    expect(tierFromPoints(0)).toBe('Contender');
    expect(tierFromPoints(50)).toBe('Rising');
    expect(tierFromPoints(150)).toBe('Ranked');
    expect(tierFromPoints(350)).toBe('Elite');
    expect(tierFromPoints(700)).toBe('Legend');
    expect(tierFromPoints(1500)).toBe('Legend');
  });

  it('evaluates distance values to the upcoming tier checkpoint threshold', () => {
    expect(pointsToNextTier(0)).toBe(50);    // Contender -> Rising
    expect(pointsToNextTier(100)).toBe(50);  // 150 (Ranked) - 100
    expect(pointsToNextTier(700)).toBeNull(); // Legend status caps progression loops
  });
});

// ==========================================
// 4. DATA INGESTION FIREWALL INGRESS
// ==========================================

describe('Inbound Validation Firewall Guardrails', () => {
  const validSubmissionPayload = {
    sprint_id: '550e8400-e29b-41d4-a716-446655440000',
    main_file_url: 'https://storage.supabase.co/file.png',
    main_file_type: 'image/png',
    process_file_urls: ['https://s.co/w1.png', 'https://s.co/w2.png'],
    brief_interpretation: 'A'.repeat(60),
    tools_used: 'Figma',
    time_spent_hours: 12,
    ownership_confirmed: true,
  };

  const validScorePayload = {
    submission_id: '550e8400-e29b-41d4-a716-446655440001',
    concept_score: 8,
    craft_score: 7,
    adherence_score: 9,
    originality_score: 6,
    impact_score: 8,
    comment: 'A'.repeat(55),
  };

  it('accepts perfectly initialized submission configurations', () => {
    expect(() => SubmissionSchema.parse(validSubmissionPayload)).not.toThrow();
  });

  it('enforces multi-part work-in-progress array bounds strictly', () => {
    // FIXED: Formulated absolute validations to intercept empty and incomplete array submissions
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, process_file_urls: [] })).toThrow();
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, process_file_urls: ['https://s.co/w1.png'] })).toThrow();
  });

  it('intercepts banned or un-sanitized asset extensions at the gate', () => {
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, main_file_type: 'image/gif' })).toThrow();
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, main_file_type: 'video/mp4' })).toThrow();
  });

  it('rejects extreme workload allocation entries outside human thresholds', () => {
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, time_spent_hours: 0 })).toThrow();
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, time_spent_hours: 49 })).toThrow();
  });

  it('enforces character minimum constraints for text validation blocks', () => {
    expect(() => SubmissionSchema.parse({ ...validSubmissionPayload, brief_interpretation: 'too short' })).toThrow();
    expect(() => ScoreSchema.parse({ ...validScorePayload, comment: 'too short' })).toThrow();
  });

  it('locks evaluation parameters inside a strict integer matrix', () => {
    expect(() => ScoreSchema.parse(validScorePayload)).not.toThrow();
    
    expect(() => ScoreSchema.parse({ ...validScorePayload, concept_score: 0 })).not.toThrow(); 
    
    expect(() => ScoreSchema.parse({ ...validScorePayload, craft_score: 11 })).toThrow();
    expect(() => ScoreSchema.parse({ ...validScorePayload, impact_score: 8.5 })).toThrow(); // Rejects fractional floats
  });
});
