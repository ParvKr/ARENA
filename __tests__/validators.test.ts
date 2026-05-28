// __tests__/validators.test.ts
import { describe, it, expect } from 'vitest';
import { SubmissionSchema } from '@/lib/validators/submission.schema';
import { ScoreSchema } from '@/lib/validators/judging.schema';

describe('SubmissionSchema', () => {
  const valid = {
    sprint_id: '550e8400-e29b-41d4-a716-446655440000',
    main_file_url: 'https://storage.supabase.co/file.png',
    main_file_type: 'image/png',
    process_file_urls: ['https://s.co/w1.png', 'https://s.co/w2.png'],
    brief_interpretation: 'A'.repeat(50),
    tools_used: 'Figma',
    time_spent_hours: 8,
    ownership_confirmed: true,
  };

  it('accepts valid submission configurations', () => {
    expect(() => SubmissionSchema.parse(valid)).not.toThrow();
  });

  // FIXED: Filled the empty test shell block to explicitly enforce the minimum work-in-progress array bounds
  it('rejects without process files', () => {
    expect(() => SubmissionSchema.parse({ ...valid, process_file_urls: [] })).toThrow();
  });

  it('rejects with only 1 process file', () => {
    expect(() => SubmissionSchema.parse({ ...valid, process_file_urls: ['https://s.co/w1.png'] })).toThrow();
  });

  it('rejects brief interpretation under 50 chars', () => {
    expect(() => SubmissionSchema.parse({ ...valid, brief_interpretation: 'too short' })).toThrow();
  });

  it('rejects ownership not confirmed', () => {
    expect(() => SubmissionSchema.parse({ ...valid, ownership_confirmed: false })).toThrow();
  });

  it('rejects time_spent_hours of 0', () => {
    expect(() => SubmissionSchema.parse({ ...valid, time_spent_hours: 0 })).toThrow();
  });

  it('rejects time_spent_hours over 48', () => {
    expect(() => SubmissionSchema.parse({ ...valid, time_spent_hours: 49 })).toThrow();
  });

  it('rejects disallowed file type', () => {
    expect(() => SubmissionSchema.parse({ ...valid, main_file_type: 'image/gif' })).toThrow();
  });
}); 

describe('ScoreSchema', () => {
  const valid = {
    submission_id: '550e8400-e29b-41d4-a716-446655440001',
    concept_score: 8,
    craft_score: 7,
    adherence_score: 9,
    originality_score: 6,
    impact_score: 8,
    comment: 'A'.repeat(50),
  };

  it('accepts valid score sheets', () => {
    expect(() => ScoreSchema.parse(valid)).not.toThrow();
  });

  it('accepts score of 0', () => {
    expect(() => ScoreSchema.parse({ ...valid, concept_score: 0 })).not.toThrow();
  });

  it('rejects score of 11', () => {
    expect(() => ScoreSchema.parse({ ...valid, craft_score: 11 })).toThrow();
  });

  it('rejects comment under 10 chars', () => {
    expect(() => ScoreSchema.parse({ ...valid, comment: 'too short' })).toThrow();
  });

  it('rejects non-integer score decimals', () => {
    expect(() => ScoreSchema.parse({ ...valid, impact_score: 7.5 })).toThrow();
  });
});
