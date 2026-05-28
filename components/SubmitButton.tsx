// Arena V0.1
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Sprint, Profile } from '@/types/api.types';
import type { SprintSubmission } from '@/hooks/useSprint';

interface SubmitButtonProps {
  sprint: Sprint;
  user: Profile | null;
  // Aligned with the active hook payload payload structure to resolve ts(2322)
  existingSubmission: SprintSubmission | null | undefined;
}

export function SubmitButton({ sprint, user, existingSubmission }: SubmitButtonProps) {
  const router = useRouter();
  const currentStatus = sprint.sprint_status;

  // 1. Unauthenticated State Handler
  if (!user) {
    return (
      <button
        onClick={() => router.push('/signup')}
        className="w-full py-4 px-6 font-display font-black text-center text-sm tracking-wider uppercase border border-arena-cyan/30 bg-arena-cyan-dim hover:bg-arena-cyan/20 text-arena-cyan rounded-xl transition duration-200 shadow-[0_0_20px_rgba(78,205,196,0.1)] active:scale-[0.99]"
      >
        Sign Up to Compete in Sprint #{sprint.sprint_number}
      </button>
    );
  }

  // 2. Non-Live Lifecycle Guard States
  if (currentStatus === 'judging') {
    return (
      <div className="w-full py-4 px-6 text-center font-display font-bold text-sm tracking-wide text-arena-gray bg-arena-card border border-arena-border rounded-xl cursor-not-allowed">
        Sprint Locked • Judging In Progress
      </div>
    );
  }

  if (currentStatus === 'complete') {
    return (
      <div className="w-full py-4 px-6 text-center font-display font-bold text-sm tracking-wide text-arena-gray bg-arena-card border border-arena-border rounded-xl cursor-not-allowed">
        Sprint Finished • Submissions Closed
      </div>
    );
  }

  if (currentStatus === 'draft') {
    return (
      <div className="w-full py-4 px-6 text-center font-display font-bold text-sm tracking-wide text-arena-gold/50 bg-arena-gold-dim border border-arena-gold/20 rounded-xl cursor-not-allowed">
        Internal Review • Draft Mode Only
      </div>
    );
  }

  // 3. Active Sprint Handling Matrices (New Submission vs. Iterative Update)
  const hasSubmitted = !!existingSubmission;
  const targetRoute = `/sprint/submit?id=${sprint.id}`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push(targetRoute)}
      className={`w-full py-4 px-6 font-display font-black text-sm tracking-widest uppercase rounded-xl transition duration-200 shadow-xl border ${
        hasSubmitted
          ? 'bg-arena-card border-arena-gold text-arena-gold hover:bg-arena-gold/5'
          : 'bg-arena-white border-arena-white text-black hover:bg-arena-offwhite'
      }`}
    >
      {hasSubmitted ? 'Update Your Submission' : 'Submit Entry'}
    </motion.button>
  );
}
