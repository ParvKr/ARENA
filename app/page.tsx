'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useArenaStore } from '@/lib/store';
import { useCurrentSprint } from '@/hooks/useSprint';
import { ArrowRight, Zap, Trophy, Users, Flame, Target, Crown, Sparkles } from 'lucide-react';

// Animated counter component
const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);

    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(Math.floor(end));
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
};

export default function Home() {
  const { user } = useArenaStore();
  const { sprint } = useCurrentSprint();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Enhanced Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 40, -25, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, -30, 0],
            y: [0, 25, -40, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
        />
        {/* Additional floating accent orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/3 right-1/3 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-20"
      >
        {/* Main Hero Section */}
        <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="text-center mb-24">
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

        {/* Live Stats Section */}
        <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Competitors', value: 2847, icon: Crown, color: 'from-cyan-500 to-blue-500' },
              { label: 'Prizes Available', value: 125000, isMoney: true, icon: Trophy, color: 'from-yellow-500 to-amber-500' },
              { label: 'Completed Sprints', value: 47, icon: Target, color: 'from-purple-500 to-pink-500' },
              { label: 'Community Rating', value: 98, isSuffix: '%', icon: Sparkles, color: 'from-red-500 to-orange-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative rounded-2xl p-6 border border-white/10 overflow-hidden group cursor-pointer`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Animated background glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 blur-2xl`}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <stat.icon className="w-6 h-6 text-gray-400 mb-3 mx-auto" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-2"
                  >
                    {stat.isMoney ? '$' : ''}<AnimatedCounter end={stat.value} />
                    {stat.isSuffix || ''}
                  </motion.div>

                  <p className="text-xs md:text-sm text-gray-400 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Current Sprint Highlight */}
        {sprint && (
          <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="mb-24">
            <div className="relative rounded-3xl border border-white/10 glass p-10 overflow-hidden group hover:border-white/20 transition-colors duration-300">
              {/* Animated gradient border glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                  <span className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    LIVE NOW
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center mb-8">
                  <div className="md:col-span-2">
                    <h2 className="font-display text-5xl font-black text-white mb-4">
                      {sprint.title}
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                      Step into the arena. Compete against the best. Prove your worth and claim your prize.
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/sprint"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-display font-bold text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 text-white hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
                      >
                        Enter Now
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Sprint Info Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.05 }}
                      className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-center group/card"
                    >
                      <div className="text-4xl font-black text-cyan-400 mb-2 font-display">
                        #{sprint.sprint_number}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Sprint</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -8, scale: 1.05 }}
                      className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-center group/card"
                    >
                      <div className="text-2xl font-black text-purple-400 mb-2 font-display">
                        {sprint.discipline}
                      </div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Category</div>
                    </motion.div>
                  </div>
                </div>

                {/* Progress indicator */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1.5 }}
                  className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 rounded-full origin-left"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div variants={itemVariants} transition={{ duration: 0.6 }} className="mb-24">
          <div className="text-center mb-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <Flame className="w-8 h-8 text-orange-400" />
            </motion.div>
            <h2 className="font-display text-5xl font-black text-white mb-4">
              Why <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-red-400 bg-clip-text text-transparent">ARENA</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join thousands of competitors building their future in the most exciting creative battleground
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Trophy,
                title: 'Real Prizes',
                description: 'Win cash, merchandise, and career-launching opportunities',
                color: 'from-amber-500 to-orange-500',
                stat: '$1M+',
                statLabel: 'In Prizes',
              },
              {
                icon: Users,
                title: 'Top Community',
                description: 'Connect with talented creators and industry professionals',
                color: 'from-cyan-500 to-blue-500',
                stat: '2.8K+',
                statLabel: 'Competitors',
              },
              {
                icon: Target,
                title: 'Build Portfolio',
                description: 'Create competition-grade work that showcases your skills',
                color: 'from-purple-500 to-pink-500',
                stat: '47',
                statLabel: 'Past Sprints',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -12, scale: 1.05 }}
                className={`relative rounded-2xl border border-white/10 glass p-8 group overflow-hidden cursor-pointer`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                {/* Animated accent line */}
                <motion.div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.6 }}
                  style={{ originX: 0 }}
                />

                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block p-3 rounded-xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors"
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 text-base mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stat card */}
                  <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <div className={`text-2xl font-black bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.stat}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">{feature.statLabel}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call-to-Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-red-500/20 blur-2xl" />

          <div className="relative z-10 rounded-3xl border border-white/20 glass p-12 md:p-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-5xl font-black text-white mb-6"
            >
              Ready to Compete?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              The next battle awaits. Show the world what you can do and claim your place at the top.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={user ? '/sprint' : '/signup'}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  {user ? 'Enter Sprint Now' : 'Join Now'}
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-lg border border-white/30 text-white hover:border-white/60 hover:bg-white/10 transition-all duration-300"
                >
                  View Results
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
