// components/sprint/prize.ts
import type { PrizeData } from '@/types/api.types'

const asAmount = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return Number(v)
  return null
}

/**
 * Total prize money for a sprint, from the same fields the podium reads (the first prize's
 * cash amount, plus numeric values stored in the sponsor fields). Null if none are numeric.
 */
export function totalPrize(prize: PrizeData | null | undefined): number | null {
  if (!prize) return null
  const parts = [
    asAmount(prize.first?.cash_amount) ?? asAmount(prize.first?.sponsor),
    asAmount(prize.second?.sponsor),
    asAmount(prize.third?.sponsor),
  ].filter((n): n is number => n !== null)
  return parts.length ? parts.reduce((a, b) => a + b, 0) : null
}
