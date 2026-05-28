'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RankBadge } from '@/components/RankBadge';
import { XPBar } from '@/components/XPBar';
import { ProfileSkeleton } from '@/components/SkeletonLoaders';
import type { Profile, Submission, Result, Sprint, RankTier } from '@/types/api.types';
import { TIER_THRESHOLDS } from '@/types/api.types';

// Structured relational types
interface HistoryJoinEntry extends Submission {
  sprint?: Pick<Sprint, 'sprint_number' | 'discipline'>;
  results?: Pick<Result, 'rank' | 'normalized_score' | 'points_awarded'>[];
}

interface ProfileApiResponse {
  success: boolean;
  data: {
    profile: Profile;
    sprint_history: HistoryJoinEntry[];
  };
}

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Failed to download profile bundle');
  return r.json();
});

/**
 * Clean helper function determining the delta required to level up.
 * Safely handles out-of-bounds index lookup exceptions for maximum tier thresholds.
 */
function calculatePointsToNextTier(totalPoints: number, currentTier: RankTier): { pointsNeeded: number; nextTier: RankTier | null } {
  const tiers = Object.entries(TIER_THRESHOLDS).sort(([, a], [, b]) => a - b) as [RankTier, number][];
  const currentIdx = tiers.findIndex(([t]) => t === currentTier);
  
  if (currentIdx === -1 || currentIdx === tiers.length - 1) {
    return { pointsNeeded: 0, nextTier: null };
  }
  
const nextTierEntry = tiers[currentIdx + 1];

if (!nextTierEntry) {
  return {
    pointsNeeded: 0,
    nextTier: null,
  };
}

const [, nextThreshold] = nextTierEntry;
const [nextTierName] = nextTierEntry;
  
  return {
    pointsNeeded: Math.max(0, nextThreshold - totalPoints),
    nextTier: nextTierName
  };
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { data, error, isLoading } = useSWR<ProfileApiResponse>(
    `/api/profile/${encodeURIComponent(username)}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const profile = data?.data?.profile;
  const history = data?.data?.sprint_history ?? [];

  if (isLoading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-32 min-h-screen flex items-center justify-center px-4"
        role="alert"
      >
        <div className="text-center">
          <h2 className="font-display text-4xl font-black text-white mb-3">Profile Not Found</h2>
          <p className="text-gray-400">The competitor profile you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </motion.div>
    );
  }

const fallbackInitial = (profile.display_name?.[0] ?? profile.username?.[0] ?? '?').toUpperCase();
  
  // Calculate the level up gap metrics locally
  const progression = calculatePointsToNextTier(profile.total_points, profile.rank_tier as RankTier);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 space-y-10">

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-colors duration-300"
        >
          <div className="flex flex-col sm:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-display font-black text-5xl text-white shrink-0 shadow-lg shadow-cyan-500/30">
              {fallbackInitial}
            </div>

            <div className="flex-1 w-full space-y-6">
              {/* Name and Badge */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display font-black text-4xl text-white">
                    {profile.display_name}
                  </h1>
                  <RankBadge tier={profile.rank_tier} size="md" />
                </div>

                <p className="font-mono text-base text-gray-400">
                  @{profile.username}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/10">
                {[
                  { label: 'Sprints Entered', val: profile.sprint_count },
                  { label: 'Total XP', val: profile.total_points.toLocaleString() },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      {stat.val}
                    </div>
                    <div className="text-sm text-gray-400 font-semibold mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* XP Progress */}
              <div className="space-y-3">
                <XPBar totalPoints={profile.total_points} tier={profile.rank_tier} />
                
                {/* Level Up Info */}
                {progression.nextTier && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-gray-400 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3"
                  >
                    <span className="text-cyan-400 font-bold">{progression.pointsNeeded.toLocaleString()} XP</span>
                    <span>to reach</span>
                    <span className="text-cyan-400 font-bold">{progression.nextTier}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Competition History */}
        {history.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="font-display font-black text-3xl text-white">
              Sprint History
            </h2>

            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr className="text-left text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                      <th className="px-6 py-4 font-bold">Sprint</th>
                      <th className="px-6 py-4 font-bold">Discipline</th>
                      <th className="px-6 py-4 font-bold">Rank</th>
                      <th className="px-6 py-4 font-bold">Score</th>
                      <th className="px-6 py-4 font-bold">XP Earned</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {history.map((entry, idx) => {
                      const result = entry.results?.[0];
                      const isTopThree = result && result.rank <= 3;
                      
                      return (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                            #{String(entry.sprint?.sprint_number ?? 0).padStart(3, '0')}
                          </td>

                          <td className="px-6 py-4 text-white font-medium">
                            {entry.sprint?.discipline ?? 'General'}
                          </td>

                          <td className="px-6 py-4">
                            {result ? (
                              <span
                                className={`font-display font-black text-lg ${
                                  isTopThree ? 'text-amber-400' : 'text-white'
                                }`}
                              >
                                #{result.rank}
                                {isTopThree && <span className="ml-2 text-lg">🏆</span>}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs italic">Judging...</span>
                            )}
                          </td>

                          <td className="px-6 py-4 font-mono text-gray-300">
                            {result ? `${Number(result.normalized_score).toFixed(1)}%` : '—'}
                          </td>

                          <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                            {result ? `+${result.points_awarded}` : '+10'}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass rounded-2xl border border-white/10 p-12"
          >
            <p className="text-gray-400 font-medium text-lg">No sprints entered yet</p>
            <p className="text-gray-500 mt-2">This competitor hasn&apos;t participated in any sprints.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
