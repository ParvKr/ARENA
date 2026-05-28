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
      <div className="pt-24 text-center font-body text-arena-gray" role="alert">
        Target competitor context profile could not be located.
      </div>
    );
  }

const fallbackInitial = (profile.display_name?.[0] ?? profile.username?.[0] ?? '?').toUpperCase();
  
  // Calculate the level up gap metrics locally
  const progression = calculatePointsToNextTier(profile.total_points, profile.rank_tier as RankTier);

  return (
    <div className="pt-16 min-h-screen bg-arena-bg">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-start gap-6 bg-arena-card border border-arena-border/30 p-6 rounded-xl relative overflow-hidden shadow-2xl"
        >
          {/* Avatar frame container */}
          <div className="w-20 h-20 rounded-full bg-arena-surface border-2 border-arena-border flex items-center justify-center font-display font-extrabold text-3xl text-arena-red shrink-0 select-none">
            {fallbackInitial}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-start">
              <div className="flex items-center gap-3">
                <h1 className="font-display font-extrabold text-2xl text-arena-white tracking-tight">
                  {profile.display_name}
                </h1>
                <RankBadge tier={profile.rank_tier} size="md" />
              </div>
              
              {/* Dynamic Promotion Target Notification Box */}
              {progression.nextTier && (
                <div className="text-[11px] font-mono bg-arena-surface border border-arena-border px-2.5 py-1 rounded text-arena-gray sm:ml-auto">
                  Need <span className="text-arena-cyan font-bold">{progression.pointsNeeded.toLocaleString()} XP</span> to reach <span className="text-arena-white font-bold">{progression.nextTier}</span>
                </div>
              )}
            </div>

            <p className="font-mono text-sm text-arena-gray tracking-tight">
              @{profile.username}
            </p>

            {/* Core Metrics Grid */}
            <div className="flex gap-6 text-sm border-t border-b border-arena-border/40 py-2.5 my-2">
              {[
                { label: 'Sprints', val: profile.sprint_count },
                { label: 'XP', val: profile.total_points.toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-1">
                  <span className="font-display font-black text-arena-offwhite text-base">
                    {stat.val}
                  </span>
                  <span className="text-arena-gray text-xs uppercase tracking-wider font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Centralized Global XP Progression Component */}
            <XPBar totalPoints={profile.total_points} tier={profile.rank_tier} />
          </div>
        </motion.div>

        {/* Competition History Table Ledger */}
        {history.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-arena-white tracking-wide">
              Sprint Competition History
            </h2>

            <div className="border border-arena-border rounded-lg overflow-hidden bg-arena-card shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-125">
                  <thead className="bg-arena-surface">
                    <tr className="text-left text-arena-gray text-xs uppercase tracking-widest border-b border-arena-border">
                      <th className="px-5 py-3.5 font-bold">Sprint</th>
                      <th className="px-5 py-3.5 font-bold">Discipline</th>
                      <th className="px-5 py-3.5 font-bold">Rank</th>
                      <th className="px-5 py-3.5 font-bold">Score</th>
                      <th className="px-5 py-3.5 font-bold">XP Modifier</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-arena-border/60 font-body">
                    {history.map((entry) => {
                      const result = entry.results?.[0];
                      
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-arena-surface/40 transition-colors duration-150"
                        >
                          <td className="px-5 py-3.5 font-mono text-arena-gray font-medium">
                            #{String(entry.sprint?.sprint_number ?? 0).padStart(3, '0')}
                          </td>

                          <td className="px-5 py-3.5 text-arena-grayL font-medium">
                            {entry.sprint?.discipline ?? 'General'}
                          </td>

                          <td className="px-5 py-3.5">
                            {result ? (
                              <span
                                className={`font-display font-black text-sm ${
                                  result.rank <= 3 ? 'text-arena-gold' : 'text-arena-offwhite'
                                }`}
                              >
                                #{result.rank}
                              </span>
                            ) : (
                              <span className="text-arena-gray/50 text-xs italic">Evaluating</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 font-mono text-arena-gray">
                            {result ? `${Number(result.normalized_score).toFixed(1)}%` : '—'}
                          </td>

                          <td className="px-5 py-3.5 font-mono text-arena-cyan font-bold">
                            {result ? `+${result.points_awarded}` : '+10'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <div className="text-center bg-arena-card/50 border border-arena-border/30 rounded-lg p-8 text-arena-gray font-body text-sm">
            No professional sprint logs captured under this handle yet.
          </div>
        )}
      </div>
    </div>
  );
}