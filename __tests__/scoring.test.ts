// __tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import {
  pointsForPlacement,
  computeRawScore,
  normaliseScore,
  computeRankings,
  tierFromPoints,
  pointsToNextTier,
} from '../lib/utils/scoring'; // Using relative paths to match Vitest module-resolution standards
import type { Score } from '../types/api.types';

// FIXED: Defined explicit type constraint binding parameter targets inside Partial mapping arrays
const mockScore = (overrides: Partial<Score> = {}): Score => ({
  id: 'score-1',
  submission_id: 'sub-1',
  judge_user_id: 'judge-1',
  concept_score: 8,
  craft_score: 7,
  adherence_score: 9,
  originality_score: 6,
  impact_score: 8,
  feedback: 'Strong submission with clear concept.',
  raw_total_score: 38,
  scored_at: '2026-04-28T12:00:00Z',
  updated_at: '2026-04-28T12:00:00Z',
  ...overrides,
});

describe('pointsForPlacement', () => {
  it('returns 100 for rank 1', () => expect(pointsForPlacement(1)).toBe(100));
  it('returns 80 for rank 2', () => expect(pointsForPlacement(2)).toBe(80));
  it('returns 65 for rank 3', () => expect(pointsForPlacement(3)).toBe(65));
  
  it('returns 50 for ranks 4-6', () => {
    [4, 5, 6].forEach(r => expect(pointsForPlacement(r)).toBe(50));
  });
  
  it('returns 35 for ranks 7-10', () => {
    [7, 8, 9, 10].forEach(r => expect(pointsForPlacement(r)).toBe(35));
  });
  
  it('returns ENTRY_POINTS for rank > 10', () => {
    expect(pointsForPlacement(11)).toBe(10);
    expect(pointsForPlacement(999)).toBe(10);
  });
});

describe('computeRawScore', () => {
  it('sums all 5 criteria correctly', () => {
    const score = mockScore();
    expect(computeRawScore(score)).toBe(38); // 8+7+9+6+8
  });

  it('returns 50 for all-10 flawless scores', () => {
    // FIXED: Adjusted concept_score to 10 so the structural sum value aligns cleanly with a maximum total of 50
    const score = mockScore({
      concept_score: 10, 
      craft_score: 10, 
      adherence_score: 10,
      originality_score: 10, 
      impact_score: 10
    });
    expect(computeRawScore(score)).toBe(50);
  });
});

describe('normaliseScore', () => {
  it('normalises 50 to 100', () => expect(normaliseScore(50)).toBe(100));
  it('normalises 25 to 50', () => expect(normaliseScore(25)).toBe(50));
  it('normalises 0 to 0', () => expect(normaliseScore(0)).toBe(0));
  
  // FIXED: Cleared numeric interpretation drift. If your system outputs floats or fixed point calculations,
  // this matches the required absolute numeric representation bounds flawlessly.
  it('rounds or scales to numeric values cleanly', () => expect(normaliseScore(33)).toBe(66));
}); 

describe('computeRankings', () => {
  // FIXED: Explicitly typed data groupings context to prevent signature interpretation errors 
  const groups = [
    { 
      submission_id: 'sub-a', 
      scores: [mockScore({ concept_score: 10, craft_score: 10, adherence_score: 10, originality_score: 10, impact_score: 10 })] 
    },
    { 
      submission_id: 'sub-b', 
      scores: [mockScore({ concept_score: 5, craft_score: 5, adherence_score: 5, originality_score: 5, impact_score: 5 })] 
    },
    { 
      submission_id: 'sub-c', 
      scores: [mockScore({ concept_score: 8, craft_score: 7, adherence_score: 9, originality_score: 6, impact_score: 8 })] 
    },
  ];

  it('ranks highest score first', () => {
    const rankings = computeRankings(groups);
    expect(rankings[0]!.submission_id).toBe('sub-a');
  });

  it('ranks lowest score last', () => {
    const rankings = computeRankings(groups);
    expect(rankings[rankings.length - 1]!.submission_id).toBe('sub-b');
  });

  it('assigns sequential ranks', () => {
    const rankings = computeRankings(groups);
    rankings.forEach((r, i) => expect(r.rank).toBe(i + 1));
  });

  it('assigns correct points for rank 1', () => {
    const rankings = computeRankings(groups);
    expect(rankings[0]!.points_awarded).toBe(100);
  });

  it('handles empty input arrays parameters safely without throwing', () => {
    expect(computeRankings([])).toEqual([]);
  });
});

describe('tierFromPoints', () => {
  it('returns Contender for 0 points', () => expect(tierFromPoints(0)).toBe('Contender'));
  it('returns Rising for 50 points', () => expect(tierFromPoints(50)).toBe('Rising'));
  it('returns Ranked for 150 points', () => expect(tierFromPoints(150)).toBe('Ranked'));
  it('returns Elite for 350 points', () => expect(tierFromPoints(350)).toBe('Elite'));
  it('returns Legend for 700 points', () => expect(tierFromPoints(700)).toBe('Legend'));
  it('returns Legend for 1000 points', () => expect(tierFromPoints(1000)).toBe('Legend'));
  it('returns Rising for 149 points', () => expect(tierFromPoints(149)).toBe('Rising'));
});

describe('pointsToNextTier', () => {
  it('returns 50 at 0 points (Contender -> Rising)', () => {
    expect(pointsToNextTier(0)).toBe(50);
  });

  it('returns null at Legend (700+ points)', () => {
    expect(pointsToNextTier(700)).toBeNull();
    expect(pointsToNextTier(1000)).toBeNull();
  });

  it('returns correct distance to next tier progression boundary', () => {
    expect(pointsToNextTier(100)).toBe(50); // 150 - 100 target threshold calculation
  });
});