// components/sprint/PrizePodium.tsx
import type { PrizeData } from '@/types/api.types'

/** The data stores amounts inconsistently (a number, a numeric string, or a sponsor name). */
function formatAward(cash?: number, sponsor?: string): string | null {
  if (typeof cash === 'number') return `$${cash.toLocaleString('en-US')}`
  if (sponsor && /^\d+$/.test(sponsor.trim())) return `$${Number(sponsor).toLocaleString('en-US')}`
  return sponsor?.trim() || null
}

export function PrizePodium({ prize }: { prize: PrizeData }) {
  const rows = [
    { place: '1st', amount: formatAward(prize.first?.cash_amount, prize.first?.sponsor), text: prize.first?.description, big: true },
    { place: '2nd', amount: formatAward(undefined, prize.second?.sponsor), text: prize.second?.description, big: false },
    { place: '3rd', amount: formatAward(undefined, prize.third?.sponsor), text: prize.third?.description, big: false },
  ].filter((r) => r.amount || r.text)

  if (rows.length === 0) return null

  return (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-smoke">Prizes</p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.place} className="flex items-baseline gap-4">
            <span className={`w-9 shrink-0 font-mono text-xs ${r.big ? 'text-signal' : 'text-smoke'}`}>{r.place}</span>
            <span className="min-w-0">
              {r.amount && (
                <span
                  className={`block font-poster leading-none ${r.big ? 'text-5xl text-signal' : 'text-3xl text-chalk'}`}
                >
                  {r.amount}
                </span>
              )}
              {r.text && <span className="mt-1 block break-words text-sm leading-snug text-white/70">{r.text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
