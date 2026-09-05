// components/dashboard/WelcomeRow.tsx
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Profile, Sprint } from '@/types/api.types';

interface WelcomeRowProps {
  profile: Profile;
  currentSprint: Sprint | null;
}

export function WelcomeRow({ profile, currentSprint }: WelcomeRowProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-arena-border pb-6"
    >
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-arena-white tracking-tight">
          Welcome back, {profile.display_name}
        </h1>
        <p className="text-arena-gray text-sm mt-1 font-body">
          {currentSprint 
            ? `Sprint #${String(currentSprint.sprint_number).padStart(3, '0')} is live — compete now.`
            : 'No active sprint running. Get ready for the next drop.'}
        </p>
      </div>
      {currentSprint && (
        <Link href="/sprint">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-arena-red text-white font-display font-bold text-sm rounded-md shadow-lg shadow-arena-red-dim hover:bg-red-500 transition-colors duration-150"
          >
            View Brief →
          </motion.button>
        </Link>
      )}
    </motion.div>
  );
}
