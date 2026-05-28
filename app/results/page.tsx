'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Target, TrendingUp } from 'lucide-react';

export default function ResultsPage() {
  const completedSprints = [
    {
      id: 1,
      number: 47,
      title: 'UI Design Mastery',
      discipline: 'UI/UX Design',
      status: 'Complete',
      winners: [
        { rank: 1, name: 'SkyWalker', score: 94.5, points: 500 },
        { rank: 2, name: 'PhoenixRise', score: 91.2, points: 350 },
        { rank: 3, name: 'VortexMind', score: 88.7, points: 200 },
      ],
      participants: 342,
    },
    {
      id: 2,
      number: 46,
      title: 'Motion Graphics Challenge',
      discipline: 'Animation',
      status: 'Complete',
      winners: [
        { rank: 1, name: 'NovaLight', score: 96.1, points: 500 },
        { rank: 2, name: 'CrimsonEdge', score: 92.8, points: 350 },
        { rank: 3, name: 'SonicBurst', score: 89.3, points: 200 },
      ],
      participants: 218,
    },
    {
      id: 3,
      number: 45,
      title: 'Brand Identity Sprint',
      discipline: 'Branding',
      status: 'Complete',
      winners: [
        { rank: 1, name: 'IceStorm', score: 95.2, points: 500 },
        { rank: 2, name: 'SilverArrow', score: 90.6, points: 350 },
        { rank: 3, name: 'PhoenixRise', score: 87.9, points: 200 },
      ],
      participants: 267,
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    return '🥉';
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-amber-500';
    if (rank === 2) return 'from-gray-400 to-slate-500';
    return 'from-orange-500 to-red-500';
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
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">
              Completed Sprints
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-3">
            Sprint Results
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl">
            View all completed sprints, final rankings, and winner announcements.
          </p>
        </motion.div>

        {/* Results Cards */}
        <motion.div
          variants={containerVariants}
          className="space-y-8"
        >
          {completedSprints.map((sprint, sprintIdx) => (
            <motion.div
              key={sprint.id}
              variants={itemVariants}
              className="rounded-2xl border border-white/10 glass overflow-hidden"
            >
              {/* Sprint Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-red-500/10 border-b border-white/10 px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold uppercase tracking-widest text-cyan-400">
                        Sprint #{sprint.number}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold">
                        {sprint.status}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-1">
                      {sprint.title}
                    </h2>
                    <p className="text-gray-400">{sprint.discipline}</p>
                  </div>

                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-cyan-400 font-display">
                        {sprint.participants}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Participants</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winners Podium */}
              <div className="p-8">
                <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Top 3 Winners
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {sprint.winners.map((winner) => (
                    <motion.div
                      key={winner.rank}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: winner.rank * 0.1 }}
                      whileHover={{ y: -8, scale: 1.05 }}
                      className={`relative rounded-xl border bg-gradient-to-br ${getMedalColor(
                        winner.rank
                      )} border-white/10 p-6 overflow-hidden group`}
                    >
                      <div className="absolute top-4 right-4 text-4xl opacity-80">
                        {getMedalIcon(winner.rank)}
                      </div>

                      <div className="mb-4">
                        <div className="text-5xl font-black text-white font-display mb-2">
                          #{winner.rank}
                        </div>
                        <h4 className="text-white font-bold text-lg">{winner.name}</h4>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Score</span>
                          <span className="font-bold text-white text-lg">{winner.score}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ delay: winner.rank * 0.1 + 0.2 }}
                            className="h-full bg-white rounded-full"
                            style={{ width: `${winner.score}%`, originX: 0 }}
                          />
                        </div>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: winner.rank * 0.1 + 0.3 }}
                        className="inline-block px-4 py-2 rounded-lg bg-white/20 text-white font-bold"
                      >
                        +{winner.points} Points
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* View Full Results Button */}
              <div className="border-t border-white/10 px-8 py-4 bg-white/5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  View Full Rankings
                  <TrendingUp className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* All Time Stats */}
        <motion.div variants={itemVariants} className="mt-12 grid md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sprints Completed', value: '47', icon: Target },
            { label: 'Total Competitors', value: '2,847', icon: Trophy },
            { label: 'Total Prize Money', value: '$125K+', icon: '💰' },
            { label: 'Avg Participants', value: '287', icon: '👥' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-xl border border-white/10 glass p-6 text-center"
            >
              <div className="mb-3 flex justify-center">
                {typeof stat.icon === 'string' ? (
                  <span className="text-3xl">{stat.icon}</span>
                ) : (
                  <stat.icon className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div className="text-2xl font-black text-white font-display">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-2 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
