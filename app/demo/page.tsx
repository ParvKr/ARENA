'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Eye } from 'lucide-react';

export default function DemoPage() {
  const demoPages = [
    {
      title: 'Sprint Page',
      description: 'View current sprint, submit entries, track deadlines',
      href: '/sprint',
      color: 'from-cyan-500 to-blue-500',
      icon: '⚡',
    },
    {
      title: 'Admin Dashboard',
      description: 'Manage sprints, view metrics, monitor submissions',
      href: '/admin',
      color: 'from-purple-500 to-pink-500',
      icon: '⚙️',
    },
    {
      title: 'Leaderboard',
      description: 'Rankings, scores, achievements, and competition history',
      href: '/leaderboard',
      color: 'from-amber-500 to-orange-500',
      icon: '🏆',
    },
    {
      title: 'User Profile',
      description: 'View competitor profiles, stats, and submission history',
      href: '/profile/demo-user',
      color: 'from-red-500 to-rose-500',
      icon: '👤',
    },
  ];

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
      transition: { duration: 0.5 },
    },
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
        transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
        className="relative z-10 max-w-6xl mx-auto px-4 py-32"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="font-display text-6xl font-black text-white mb-4">
            ARENA Demo Pages
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Explore all the pages of the ARENA platform. Click any card to view the page.
          </p>
        </motion.div>

        {/* Demo Pages Grid */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {demoPages.map((page, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link href={page.href}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative rounded-2xl border border-white/10 glass p-8 overflow-hidden group cursor-pointer h-full`}
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  {/* Animated accent line */}
                  <motion.div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${page.color}`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ originX: 0 }}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{page.icon}</span>
                      <Eye className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>

                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {page.title}
                    </h2>

                    <p className="text-gray-400 text-base mb-6 flex-grow">
                      {page.description}
                    </p>

                    <motion.div
                      className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all"
                    >
                      View Page
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/10 p-8">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Note: Demo Access
          </h2>
          <p className="text-gray-400 leading-relaxed">
            These pages are shown without full backend data since Supabase credentials aren't configured. 
            The UI design is fully functional and ready for deployment. Once you add your Supabase API keys 
            to your environment, all pages will load with real data from your database.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
