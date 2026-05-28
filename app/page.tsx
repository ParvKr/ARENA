'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useArenaStore } from '@/lib/store';
import { useCurrentSprint } from '@/hooks/useSprint';
import { ArrowRight, Zap, Trophy, Users } from 'lucide-react';

export default function Home() {
  const { user } = useArenaStore();
  const { sprint } = useCurrentSprint();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-20"
      >
        {/* Main Hero Section */}
        <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-block mb-6 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5"
          >
            <span className="text-sm font-semibold text-cyan-400">Welcome to ARENA</span>
          </motion.div>

          <h1 className="font-display text-7xl md:text-8xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-red-400 bg-clip-text text-transparent">
              Prove What You&apos;re Made Of
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            Biweekly skill competitions. Real prizes. Real careers. Join the next generation of competitive creators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/sprint"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                  >
                    Enter Sprint
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg border border-white/20 text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                  >
                    My Profile
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg border border-white/20 text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Current Sprint Highlight */}
        {sprint && (
          <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="mb-20">
            <div className="rounded-2xl border border-white/10 glass p-8 hover:border-white/20 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">
                  Current Sprint
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-4xl font-bold text-white mb-3">
                    {sprint.title}
                  </h2>
                  <p className="text-gray-400 text-base mb-6">
                    Join the competition and showcase your skills.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/sprint"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-6 text-center"
                  >
                    <div className="text-3xl font-black text-cyan-400 mb-2">
                      #{sprint.sprint_number}
                    </div>
                    <div className="text-sm text-gray-400">Sprint Number</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-6 text-center"
                  >
                    <div className="text-3xl font-black text-purple-400 mb-2">
                      {sprint.discipline}
                    </div>
                    <div className="text-sm text-gray-400">Discipline</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div variants={itemVariants} transition={{ duration: 0.6 }}>
          <h2 className="font-display text-4xl font-black text-white text-center mb-12">
            Why ARENA?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Trophy,
                title: 'Real Prizes',
                description: 'Win cash, merchandise, and career-launching opportunities',
                color: 'amber',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Connect with talented creators and industry professionals',
                color: 'cyan',
              },
              {
                icon: Zap,
                title: 'Portfolio',
                description: 'Build your creative portfolio with competition-grade work',
                color: 'purple',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`rounded-xl border border-${feature.color}-500/30 bg-${feature.color}-500/5 p-6 group hover:border-${feature.color}-500/50 transition-colors duration-300`}
              >
                <feature.icon className={`w-8 h-8 text-${feature.color}-400 mb-4`} />
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
