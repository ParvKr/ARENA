'use client';

import { motion } from 'framer-motion';

export default function AdminDemoPage() {
  const mockSprints = [
    {
      id: '1',
      sprint_number: 47,
      title: 'UI Design Mastery',
      discipline: 'UI/UX Design',
      sprint_status: 'complete' as const,
      open_at: '2024-05-18',
    },
    {
      id: '2',
      sprint_number: 48,
      title: 'Motion Graphics Challenge',
      discipline: 'Animation',
      sprint_status: 'judging' as const,
      open_at: '2024-05-25',
    },
    {
      id: '3',
      sprint_number: 49,
      title: 'Brand Identity Sprint',
      discipline: 'Branding',
      sprint_status: 'live' as const,
      open_at: '2024-06-01',
    },
    {
      id: '4',
      sprint_number: 50,
      title: 'Web Development Challenge',
      discipline: 'Development',
      sprint_status: 'draft' as const,
      open_at: '2024-06-08',
    },
  ];

  const statusClasses: Record<string, string> = {
    draft: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    live: 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse',
    judging: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
    complete: 'border-green-500/50 bg-green-500/10 text-green-400',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
        className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16 space-y-12"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
              Admin
            </span>
            <span className="font-mono text-xs text-gray-500">Control Panel</span>
          </div>

          <h1 className="font-display text-5xl font-black text-white mb-3">
            Arena Operations
          </h1>

          <p className="text-gray-400 text-base">
            Welcome back, <span className="text-cyan-400 font-semibold">Admin</span>. Manage sprints, submissions, and judges.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Sprints', value: 50, icon: '📋' },
            { label: 'Submissions', value: 3847, icon: '📤' },
            { label: 'Active Judges', value: 24, icon: '⚖️' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-xl border border-white/10 glass px-6 py-5 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="font-mono text-xs uppercase tracking-widest text-gray-400 font-bold">
                  {metric.label}
                </div>
                <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                  {metric.icon}
                </span>
              </div>

              <div className="font-display text-4xl font-black text-white">
                {metric.value.toLocaleString()}
              </div>

              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Sprints Section */}
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Recent Sprints</h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 glass">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
              <h3 className="font-semibold text-white">Sprint Directory</h3>
              <span className="text-xs text-gray-500">Last 4 sprints</span>
            </div>

            <div className="divide-y divide-white/10">
              {mockSprints.map((sprint, idx) => (
                <motion.div
                  key={sprint.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid gap-4 px-6 py-4 sm:grid-cols-[100px_1fr_120px_140px] items-center hover:bg-white/5 transition-colors duration-200"
                >
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    #{sprint.sprint_number}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {sprint.title}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {sprint.discipline}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDate(sprint.open_at)}
                  </span>
                  <span
                    className={`inline-flex h-fit px-3 py-1 rounded-lg border text-xs font-bold uppercase w-fit ${statusClasses[sprint.sprint_status]}`}
                  >
                    {sprint.sprint_status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Create New Sprint', description: 'Set up a new competition sprint', action: '→' },
            { title: 'Review Submissions', description: 'View and manage competition entries', action: '→' },
            { title: 'Manage Judges', description: 'Assign and track judge assignments', action: '→' },
            { title: 'Publish Results', description: 'Announce winners and distribute prizes', action: '→' },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02, y: -5 }}
              className="rounded-xl border border-white/10 glass p-6 group cursor-pointer hover:border-white/20 transition-colors"
            >
              <h3 className="font-display text-lg font-bold text-white mb-2">
                {action.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{action.description}</p>
              <span className="text-cyan-400 font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                View {action.action}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
