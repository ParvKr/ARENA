'use client';

import { motion } from 'framer-motion';
import { Crown, Flame, Target } from 'lucide-react';

export default function LeaderboardPage() {
  // Mock leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      username: 'SkyWalker',
      displayName: 'Alex Chen',
      points: 4850,
      sprints: 12,
      wins: 3,
      tier: 'Legendary',
      avatar: '⚡',
    },
    {
      rank: 2,
      username: 'PhoenixRise',
      displayName: 'Jordan Martinez',
      points: 4320,
      sprints: 10,
      wins: 2,
      tier: 'Elite',
      avatar: '🔥',
    },
    {
      rank: 3,
      username: 'VortexMind',
      displayName: 'Sam Park',
      points: 3890,
      sprints: 9,
      wins: 2,
      tier: 'Elite',
      avatar: '🌀',
    },
    {
      rank: 4,
      username: 'SonicBurst',
      displayName: 'Taylor Swift',
      points: 3450,
      sprints: 8,
      wins: 1,
      tier: 'Master',
      avatar: '⚡',
    },
    {
      rank: 5,
      username: 'NovaLight',
      displayName: 'Casey Johnson',
      points: 3120,
      sprints: 7,
      wins: 1,
      tier: 'Master',
      avatar: '✨',
    },
    {
      rank: 6,
      username: 'CrimsonEdge',
      displayName: 'Riley Thompson',
      points: 2890,
      sprints: 6,
      wins: 0,
      tier: 'Expert',
      avatar: '🗡️',
    },
    {
      rank: 7,
      username: 'IceStorm',
      displayName: 'Morgan Davis',
      points: 2650,
      sprints: 5,
      wins: 0,
      tier: 'Expert',
      avatar: '❄️',
    },
    {
      rank: 8,
      username: 'SilverArrow',
      displayName: 'Jamie Wilson',
      points: 2400,
      sprints: 4,
      wins: 0,
      tier: 'Veteran',
      avatar: '🏹',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary':
        return 'from-yellow-500 to-amber-500';
      case 'Elite':
        return 'from-purple-500 to-pink-500';
      case 'Master':
        return 'from-cyan-500 to-blue-500';
      case 'Expert':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    if (rank === 2) return 'from-gray-500/20 to-slate-500/20 border-gray-500/50';
    if (rank === 3) return 'from-orange-500/20 to-red-500/20 border-orange-500/50';
    return 'from-white/10 to-white/5 border-white/10';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 25, 0], y: [0, 40, -25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">
              Global Rankings
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-3">
            Leaderboard
          </h1>

          <p className="text-gray-400 text-lg">
            The best competitors on ARENA. Earn points, climb the ranks, reach legend status.
          </p>
        </motion.div>

        {/* Top 3 Showcase */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mb-12">
          {leaderboardData.slice(0, 3).map((competitor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative rounded-2xl border bg-gradient-to-br ${getRankBg(
                competitor.rank
              )} p-8 overflow-hidden group`}
            >
              {/* Rank indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`text-4xl font-black ${getRankColor(
                    competitor.rank
                  )} font-display`}
                >
                  #{competitor.rank}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-6xl mb-4">{competitor.avatar}</div>
                <h2 className="font-display text-2xl font-bold text-white">
                  {competitor.displayName}
                </h2>
                <p className="text-gray-400 text-sm mt-1">@{competitor.username}</p>
              </div>

              {/* Tier badge */}
              <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${getTierColor(
                competitor.tier
              )} text-white text-xs font-bold mb-6`}>
                {competitor.tier}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Points</span>
                  <span className="text-white font-bold text-lg">
                    {competitor.points.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Sprints</span>
                  <span className="text-white font-bold">{competitor.sprints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Wins</span>
                  <span className="text-white font-bold">{competitor.wins}</span>
                </div>
              </div>

              {/* Progress bar */}
              <motion.div
                className="mt-6 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                style={{ originX: 0 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-white/10 glass overflow-hidden">
            <div className="bg-white/5 border-b border-white/10 px-6 py-4">
              <h2 className="font-display text-2xl font-bold text-white">Top 100 Rankings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Competitor
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Points
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Sprints
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Wins
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {leaderboardData.map((competitor, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className={`font-display text-lg font-black ${getRankColor(competitor.rank)}`}>
                          #{competitor.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-white">{competitor.displayName}</div>
                          <div className="text-sm text-gray-400">@{competitor.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getTierColor(
                            competitor.tier
                          )} text-white`}
                        >
                          {competitor.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-cyan-400">
                          {competitor.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">{competitor.sprints}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {competitor.wins > 0 && <Flame className="w-4 h-4 text-orange-400" />}
                          <span className="text-white font-semibold">{competitor.wins}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
