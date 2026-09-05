'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Medal } from 'lucide-react';

// Placeholder results page — will be wired to real data once results API is ready
const MOCK_RESULTS = [
  { rank: 1, username: 'parv_g', display_name: 'Parv G.', discipline: 'Visual Design', score: 94.2, points: 100, tier: 'Legend' },
  { rank: 2, username: 'lena_k', display_name: 'Lena K.', discipline: 'Visual Design', score: 91.0, points: 80, tier: 'Elite' },
  { rank: 3, username: 'mochii', display_name: 'Mochi', discipline: 'Visual Design', score: 88.5, points: 65, tier: 'Elite' },
  { rank: 4, username: 'jaye_s', display_name: 'Jaye S.', discipline: 'Visual Design', score: 85.1, points: 50, tier: 'Ranked' },
  { rank: 5, username: 'nova_x', display_name: 'Nova X', discipline: 'Visual Design', score: 82.4, points: 50, tier: 'Ranked' },
  { rank: 6, username: 'crlmn', display_name: 'Crimson', discipline: 'Visual Design', score: 79.8, points: 50, tier: 'Rising' },
];

const rankColor = (r: number) =>
  r === 1 ? '#FFD700' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : '#737380';

const rankIcon = (r: number) =>
  r === 1 ? <Trophy className="h-4 w-4" /> : r === 2 ? <Star className="h-4 w-4" /> : r === 3 ? <Medal className="h-4 w-4" /> : null;

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-[#050507] pt-14">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[#7C5CFF]">Sprint 13 · Complete</p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white">
            Results
          </h1>
          <p className="mt-4 text-[#737380]">
            Sprint 13 — Visual Design. 48 submissions judged blind by 3 experts.
          </p>
        </motion.div>

        {/* Podium top 3 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10 grid grid-cols-3 gap-3"
        >
          {MOCK_RESULTS.slice(0, 3).map((r, i) => (
            <div
              key={r.username}
              className="flex flex-col items-center gap-3 rounded-xl border bg-[#0A0A0F] p-6 text-center"
              style={{ borderColor: `${rankColor(r.rank)}30`, boxShadow: `0 0 30px ${rankColor(r.rank)}10` }}
            >
              <div style={{ color: rankColor(r.rank) }}>{rankIcon(r.rank)}</div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 font-display text-lg font-black text-white"
                style={{ borderColor: `${rankColor(r.rank)}60`, backgroundColor: `${rankColor(r.rank)}12` }}
              >
                {r.display_name[0]}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">{r.display_name}</p>
                <p className="font-mono text-xs text-[#737380]">@{r.username}</p>
              </div>
              <p className="font-mono text-xl font-bold" style={{ color: rankColor(r.rank) }}>
                {r.score}%
              </p>
              <p className="font-mono text-xs text-[#737380]">+{r.points} XP</p>
            </div>
          ))}
        </motion.div>

        {/* Full table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-[#1C1C26] bg-[#0A0A0F]"
        >
          <div className="border-b border-[#1C1C26] px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[#737380]">Full Leaderboard</p>
          </div>
          <div className="divide-y divide-[#1C1C26]">
            {MOCK_RESULTS.map((r, i) => (
              <motion.div
                key={r.username}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#101017] transition-colors"
              >
                <span
                  className="w-8 font-mono text-sm font-bold"
                  style={{ color: rankColor(r.rank) }}
                >
                  #{r.rank}
                </span>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm font-bold text-white"
                  style={{ borderColor: '#2C2C3A', background: '#101017' }}
                >
                  {r.display_name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-[#F5F5F7]">{r.display_name}</p>
                  <p className="font-mono text-xs text-[#737380]">@{r.username}</p>
                </div>
                <span className="hidden font-mono text-sm text-[#737380] sm:block">{r.discipline}</span>
                <span className="font-mono text-sm font-bold text-[#F5F5F7]">{r.score}%</span>
                <span className="font-mono text-sm font-bold text-[#7C5CFF]">+{r.points}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
