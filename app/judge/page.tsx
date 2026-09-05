'use client';

import { motion } from 'framer-motion';
import { useArenaStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export default function JudgePage() {
  const { user } = useArenaStore();
  const router = useRouter();

  // Redirect non-judges away
  useEffect(() => {
    if (user && user.arena_role !== 'judge') router.push('/sprint');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#050507] pt-14">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[#7C5CFF]">Judge Panel</p>
          <h1 className="font-display text-5xl font-bold text-white">Dashboard</h1>
          <p className="mt-4 text-[#737380]">
            Review and score submissions for the active sprint. All judging is blind.
          </p>
        </motion.div>

        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: ClipboardList, label: 'Assigned', value: '12', color: '#7C5CFF' },
            { icon: CheckCircle2, label: 'Scored', value: '7', color: '#4ADE80' },
            { icon: Clock, label: 'Remaining', value: '5', color: '#FFD700' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl border border-[#1C1C26] bg-[#0A0A0F] px-6 py-5">
              <Icon className="h-5 w-5" style={{ color }} />
              <div>
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-[#737380]">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Submissions queue placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[#1C1C26] px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-[#737380]">Submission Queue</p>
            <span className="rounded-full bg-[#7C5CFF]/10 px-3 py-0.5 font-mono text-xs text-[#7C5CFF] border border-[#7C5CFF]/20">
              5 remaining
            </span>
          </div>
          <div className="p-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-[#2C2C3A] mb-4" />
            <p className="font-body text-sm text-[#737380]">
              Connect your judge session to begin reviewing submissions.
            </p>
            <p className="mt-2 font-mono text-xs text-[#3A3A50]">
              Judging interface coming soon.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
