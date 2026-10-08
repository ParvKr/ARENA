import { describe, it, expect } from 'vitest'
import {
  computeMedals,
  computeStats,
  normaliseHistory,
  rankProgress,
  type RawHistoryEntry,
  type RecordEntry,
} from '../components/profile/record'

const raw = (n: number, res: RawHistoryEntry['results']): RawHistoryEntry => ({
  id: `s${n}`,
  submitted_at: '2026-01-01T00:00:00Z',
  results: res,
  sprints: { sprint_number: n, title: `Sprint ${n}`, discipline: 'Visual Design', sprint_status: 'complete' },
})

const res = (rank: number) => ({ rank, normalized_score: 80, points_awarded: 50 })

describe('normaliseHistory', () => {
  it('reads the joined sprint and a single result object', () => {
    const [e] = normaliseHistory([raw(7, res(2))])
    expect(e?.title).toBe('Sprint 7')
    expect(e?.result).toEqual({ rank: 2, score: 80, points: 50 })
  })

  it('accepts a results array and an empty or null result', () => {
    expect(normaliseHistory([raw(1, [res(3)])])[0]?.result?.rank).toBe(3)
    expect(normaliseHistory([raw(1, [])])[0]?.result).toBeNull()
    expect(normaliseHistory([raw(1, null)])[0]?.result).toBeNull()
  })

  it('skips rows with no sprint and sorts newest first', () => {
    const noSprint: RawHistoryEntry = { ...raw(9, null), sprints: null }
    const out = normaliseHistory([raw(1, null), noSprint, raw(3, null)])
    expect(out.map((e) => e.sprintNumber)).toEqual([3, 1])
  })
})

describe('computeStats', () => {
  const hist = (nums: number[], ranks: Record<number, number> = {}): RecordEntry[] =>
    normaliseHistory(nums.map((n) => raw(n, ranks[n] ? res(ranks[n]!) : null)))

  it('handles an empty history', () => {
    expect(computeStats([])).toEqual({ entries: 0, best: null, bestStreak: 0, scored: 0 })
  })

  it('finds the best placement and the sprint it came from', () => {
    const s = computeStats(hist([1, 2, 3], { 1: 5, 3: 2 }))
    expect(s.best).toEqual({ rank: 2, sprintNumber: 3 })
    expect(s.scored).toBe(2)
  })

  it('counts the longest run of consecutive sprint numbers', () => {
    expect(computeStats(hist([1, 2, 4, 5, 6, 9])).bestStreak).toBe(3)
    expect(computeStats(hist([4])).bestStreak).toBe(1)
  })
})

describe('computeMedals', () => {
  const earned = (h: RecordEntry[]) => computeMedals(h, computeStats(h)).filter((m) => m.earned).map((m) => m.id)

  it('earns nothing with no entries', () => {
    expect(earned([])).toEqual([])
  })

  it('earns First step with one unscored entry only', () => {
    expect(earned(normaliseHistory([raw(1, null)]))).toEqual(['first-step'])
  })

  it('earns podium, champion, hat trick and five alive from real data', () => {
    const h = normaliseHistory([1, 2, 3, 4, 5].map((n) => raw(n, res(n === 5 ? 1 : 9))))
    expect(earned(h)).toEqual(['first-step', 'on-the-board', 'podium', 'champion', 'hat-trick', 'five-alive'])
  })
})

describe('rankProgress', () => {
  it('starts at zero for a new competitor', () => {
    const p = rankProgress(0, 'Contender')
    expect(p.position).toBe(0)
    expect(p.next).toBe('Rising')
    expect(p.xpToNext).toBe(50)
  })

  it('sits on a station at its threshold', () => {
    expect(rankProgress(150, 'Ranked').position).toBeCloseTo(0.5)
  })

  it('interpolates between stations', () => {
    expect(rankProgress(25, 'Contender').position).toBeCloseTo(0.125)
  })

  it('tops out at Legend', () => {
    const p = rankProgress(1200, 'Legend')
    expect(p.position).toBe(1)
    expect(p.next).toBeNull()
    expect(p.xpToNext).toBe(0)
  })
})
