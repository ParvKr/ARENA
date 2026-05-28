import {
  PLACEMENT_POINTS,
  ENTRY_POINTS,
  TIER_THRESHOLDS,
  type RankTier,
} from '@/types/api.types';
import type { Score } from '@/types/api.types';

export interface ScoreGroup {
  submission_id: string;
  scores: Score[];
}

export interface RankedEntry {
  submission_id: string;
  normalised_score: number;
  rank: number;
  points_awarded: number;
}

/**
 * Returns Sprint points awarded for a given placement rank.
 * Unranked entries (> 10) or lower tiers receive the base ENTRY_POINTS.
 */
export function pointsForPlacement(rank: number): number {
  if (rank <= 0) return ENTRY_POINTS;
  return PLACEMENT_POINTS[rank as keyof typeof PLACEMENT_POINTS] ?? ENTRY_POINTS;
}

/**
 * Returns the raw total score for a single judge's evaluation.
 * Range: 0 to 50 (5 criteria × Max 10 points per category)
 */
export function computeRawScore(score: Score): number {
  return (
    (score.concept_score ?? 0) +
    (score.craft_score ?? 0) +
    (score.adherence_score ?? 0) +
    (score.originality_score ?? 0) +
    (score.impact_score ?? 0)
  );
}

/**
 * Normalizes a raw score sum (0-50) to a standard percentage range (0-100).
 * Rounded cleanly to exactly 2 decimal places.
 */
export function normaliseScore(rawScore: number): number {
  if (rawScore <= 0) return 0;
  if (rawScore >= 50) return 100;
  return Math.round((rawScore / 50) * 10000) / 100;
}

/**
 * Computes the final rankings from all judge scores safely.
 */
export function computeRankings(groups: ScoreGroup[]): RankedEntry[] {
  if (!Array.isArray(groups) || groups.length === 0) return [];

  const withAverages = groups.map(group => {
    const totalJudges = group.scores?.length ?? 0;

    // Defensive Check: Protect against division-by-zero if a submission has no scores yet
    if (totalJudges === 0) {
      return {
        submission_id: group.submission_id,
        avg_raw_exact: 0,
        avg_adherence: 0,
      };
    }

    const rawTotalsSum = group.scores.map(computeRawScore).reduce((a, b) => a + b, 0);
    const adherenceSum = group.scores.reduce((a, s) => a + (s.adherence_score ?? 0), 0);

    return {
      submission_id: group.submission_id,
      // Retain precise float values to prevent mathematical tiebreaker drift
      avg_raw_exact: rawTotalsSum / totalJudges,
      avg_adherence: adherenceSum / totalJudges,
    };
  });

  // Sort defensively without mutating the underlying data structure
  const sorted = [...withAverages].sort((a, b) => {
    // Primary Sort: Exact un-rounded raw aggregate averages descending
    if (Math.abs(b.avg_raw_exact - a.avg_raw_exact) > Number.EPSILON) {
      return b.avg_raw_exact - a.avg_raw_exact;
    }
    // Secondary Sort (Tiebreaker): Average adherence score descending
    return b.avg_adherence - a.avg_adherence;
  });

  return sorted.map((entry, index) => ({
    submission_id: entry.submission_id,
    normalised_score: normaliseScore(entry.avg_raw_exact),
    rank: index + 1,
    points_awarded: pointsForPlacement(index + 1),
  }));
}

/**
 * Determines the rank tier from total accumulated points.
 */
export function tierFromPoints(totalPoints: number): RankTier {
  // Sort thresholds dynamically descending to avoid configuration reliance assumptions
  const tiers = Object.entries(TIER_THRESHOLDS) as [RankTier, number][];
  const sortedTiers = [...tiers].sort(([, a], [, b]) => b - a);

  for (const [tier, threshold] of sortedTiers) {
    if (totalPoints >= threshold) {
      return tier;
    }
  }

  return 'Contender';
}

/**
 * Returns the exact points needed to reach the next tier milestones.
 */
export function pointsToNextTier(currentPoints: number): number | null {
  const thresholds = [...Object.values(TIER_THRESHOLDS)].sort((a, b) => a - b);
  const nextTargetMilestone = thresholds.find(t => t > currentPoints);
  
  return nextTargetMilestone !== undefined ? nextTargetMilestone - currentPoints : null;
}