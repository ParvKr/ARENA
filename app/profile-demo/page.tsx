'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Award } from 'lucide-react';

export default function ProfileDemoPage() {
  const profile = {
    displayName: 'Alex Chen',
    username: 'SkyWalker',
    bio: 'UI Designer | Creative Technologist | Pushing Boundaries',
    avatar: '⚡',
    joinDate: 'Jan 2023',
    rank: 1,
    tier: 'Legendary',
    totalPoints: 4850,
    sprints: 12,
    wins: 3,
    submissions: 32,
    achievements: ['First Win', 'Top 3 Streak', 'Community Champion', 'Perfect Score'],
    recentSubmissions: [
      { sprintId: 47, title: 'UI Design Mastery', score: 94.5, rank: 1 },
      { sprintId: 46, title: 'Brand Refresh Challenge', score: 92.1, rank: 2 },
      { sprintId: 45, title: 'Motion Graphics Sprint', score: 88.7, rank: 5 },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
        className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-16 space-y-12"
      >
        {/* Profile Header */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/10 glass overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-red-500/20" />

          <div className="relative px-8 py-12">
            <motion.div
              initial={{ scale: 0, y: -80 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="absolute -top-16 left-8 w-32 h-32 rounded-full border-4 border-[#0A0A0F] bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-6xl shadow-2xl"
            >
              {profile.avatar}
            </motion.div>

            <div className="ml-40">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl font-black text-white">
                  {profile.displayName}
                </h1>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold">
                  {profile.tier}
                </span>
              </div>

              <p className="text-gray-400 text-lg mb-4">@{profile.username}</p>
              <p className="text-gray-300 text-base mb-6 max-w-2xl">{profile.bio}</p>

              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-cyan-400 font-display">#{profile.rank}</div>
                  <div className="text-gray-400">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-400 font-display">
                    {profile.joinDate}
                  </div>
                  <div className="text-gray-400">Joined</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Trophy, label: 'Total Points', value: profile.totalPoints, color: 'from-yellow-500 to-amber-500' },
            { icon: Target, label: 'Sprints', value: profile.sprints, color: 'from-cyan-500 to-blue-500' },
            { icon: Flame, label: 'Wins', value: profile.wins, color: 'from-red-500 to-orange-500' },
            { icon: Award, label: 'Submissions', value: profile.submissions, color: 'from-purple-500 to-pink-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -8 }}
              className={`rounded-xl border border-white/10 glass p-6 bg-gradient-to-br ${stat.color} bg-opacity-5`}
            >
              <stat.icon className="w-6 h-6 text-gray-400 mb-3" />
              <div className="text-3xl font-black text-white font-display mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Achievements</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {profile.achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="rounded-xl border border-white/10 glass p-6 text-center group hover:border-white/20 transition-colors"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {idx === 0 ? '🏆' : idx === 1 ? '🔥' : idx === 2 ? '👑' : '⭐'}
                </div>
                <p className="font-semibold text-white">{achievement}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Submissions */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {profile.recentSubmissions.map((submission, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border border-white/10 glass p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-cyan-400 font-bold">Sprint #{submission.sprintId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        submission.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : submission.rank === 2
                          ? 'bg-gray-500/20 text-gray-300'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        #{submission.rank}
                      </span>
                    </div>
                    <p className="text-white font-semibold">{submission.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-cyan-400 font-display">
                      {submission.score}%
                    </div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${submission.score}%`, originX: 0 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
