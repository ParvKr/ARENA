// components/profile/record.ts
// Everything on the profile is derived from the real sprint history. No placeholders.
import type { RankTier } from '@/types/api.types'
import { TIER_THRESHOLDS } from '@/types/api.types'

export const TIER_ORDER: RankTier[] = ['Contender', 'Rising', 'Ranked', 'Elite', 'Legend']

/** One row of the match log, already normalised from the API shape. */
export interface RecordEntry {
  id: string
  sprintNumber: number
  title: string
  discipline: string
  sprintStatus: string
  submittedAt: string
  /** null until the sprint has been judged */
  result: { rank: number; score: number; points: number } | null
}

interface RawResult {
  rank: number
  normalized_score: number
  points_awarded: number
}

/** The shape /api/profile/[username] returns for one submission. */
export interface RawHistoryEntry {
  id: string
  submitted_at: string
  // PostgREST gives an object for a one-to-one join and an array otherwise; accept both.
  results: RawResult | RawResult[] | null
  sprints: { sprint_number: number; title: string; discipline: string; sprint_status: string } | null
}

export function normaliseHistory(raw: RawHistoryEntry[]): RecordEntry[] {
  const out: RecordEntry[] = []
  for (const r of raw) {
    // `!inner` should always supply the sprint; skip a row rather than invent a title for it.
    if (!r.sprints) continue
    const res = Array.isArray(r.results) ? r.results[0] : r.results
    out.push({
      id: r.id,
      sprintNumber: r.sprints.sprint_number,
      title: r.sprints.title,
      discipline: r.sprints.discipline,
      sprintStatus: r.sprints.sprint_status,
      submittedAt: r.submitted_at,
      result: res ? { rank: res.rank, score: res.normalized_score, points: res.points_awarded } : null,
    })
  }
  // Newest sprint first, whatever order the API used.
  return out.sort((a, b) => b.sprintNumber - a.sprintNumber)
}

export interface RecordStats {
  entries: number
  /** Best (lowest) finishing rank, with the sprint it came from. */
  best: { rank: number; sprintNumber: number } | null
  /** Longest run of consecutive sprint numbers entered. */
  bestStreak: number
  scored: number
}

export function computeStats(history: RecordEntry[]): RecordStats {
  let best: RecordStats['best'] = null
  let scored = 0
  for (const e of history) {
    if (!e.result) continue
    scored += 1
    if (!best || e.result.rank < best.rank) best = { rank: e.result.rank, sprintNumber: e.sprintNumber }
  }

  const nums = [...new Set(history.map((e) => e.sprintNumber))].sort((a, b) => a - b)
  let bestStreak = 0
  let run = 0
  let prev: number | null = null
  for (const n of nums) {
    run = prev !== null && n === prev + 1 ? run + 1 : 1
    if (run > bestStreak) bestStreak = run
    prev = n
  }

  return { entries: history.length, best, bestStreak, scored }
}

export interface Medal {
  id: string
  label: string
  how: string
  earned: boolean
}

export function computeMedals(history: RecordEntry[], stats: RecordStats): Medal[] {
  const ranks = history.flatMap((e) => (e.result ? [e.result.rank] : []))
  return [
    { id: 'first-step', label: 'First step', how: 'Enter a sprint', earned: stats.entries >= 1 },
    { id: 'on-the-board', label: 'On the board', how: 'Get a scored result', earned: stats.scored >= 1 },
    { id: 'podium', label: 'Podium', how: 'Finish in the top 3', earned: ranks.some((r) => r <= 3) },
    { id: 'champion', label: 'Champion', how: 'Win a sprint', earned: ranks.some((r) => r === 1) },
    { id: 'hat-trick', label: 'Hat trick', how: 'Enter 3 sprints in a row', earned: stats.bestStreak >= 3 },
    { id: 'five-alive', label: 'Five alive', how: 'Enter 5 sprints', earned: stats.entries >= 5 },
  ]
}

export function isTier(value: string): value is RankTier {
  return (TIER_ORDER as string[]).includes(value)
}

export interface RankProgress {
  /** 0 to 1 along the track. Stations are evenly spaced; XP is interpolated between them. */
  position: number
  next: RankTier | null
  /** XP still needed for the next tier; 0 at the top. */
  xpToNext: number
}

export function rankProgress(points: number, tier: RankTier): RankProgress {
  const xp = Math.max(0, points)
  const idx = TIER_ORDER.indexOf(tier)
  const next = TIER_ORDER[idx + 1] ?? null

  // Position comes from the XP itself so the marker is right even if the stored tier lags.
  let position = 1
  for (let i = 0; i < TIER_ORDER.length - 1; i++) {
    const lo = TIER_THRESHOLDS[TIER_ORDER[i]!]
    const hi = TIER_THRESHOLDS[TIER_ORDER[i + 1]!]
    if (xp < hi) {
      position = (i + (xp - lo) / (hi - lo)) / (TIER_ORDER.length - 1)
      break
    }
  }

  return { position, next, xpToNext: next ? Math.max(0, TIER_THRESHOLDS[next] - xp) : 0 }
}
