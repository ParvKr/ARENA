'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Star, Medal, Zap, LayoutDashboard, Crown, Sparkles, TrendingUp, ChevronRight, Clock, Target } from 'lucide-react';
import { XPBar } from '@/components/XPBar';
import { ProfileSkeleton } from '@/components/SkeletonLoaders';
import type { Profile, Submission, Result, Sprint, RankTier } from '@/types/api.types';
import { TIER_THRESHOLDS } from '@/types/api.types';
import Link from 'next/link';

// ─── TYPES ─────────────────────────────────────────────────────────────
interface HistoryJoinEntry extends Submission {
  sprint?: Pick<Sprint, 'sprint_number' | 'discipline' | 'title'>;
  results?: Pick<Result, 'rank' | 'normalized_score' | 'points_awarded'>[];
}
interface ProfileApiResponse {
  success: boolean;
  data: {
    profile: Profile;
    sprint_history: HistoryJoinEntry[];
  };
}

// ─── UTILS ─────────────────────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Failed to download profile bundle');
  return r.json();
});

function getRankColor(tier: RankTier) {
  switch (tier) {
    case 'Legend': return '#FFD700';
    case 'Elite': return '#A78BFA';
    case 'Ranked': return '#45B7D1';
    case 'Rising': return '#4ECDC4';
    default: return '#737380';
  }
}

// ─── MOCK DATA (Until APIs provide these) ──────────────────────────────
const MOCK_ACHIEVEMENTS = [
  { id: 1, label: 'First Step', icon: <Medal className="h-5 w-5" />, active: true },
  { id: 2, label: 'On the Board', icon: <Target className="h-5 w-5" />, active: true },
  { id: 3, label: 'Streak: 4', icon: <Zap className="h-5 w-5" />, active: true },
  { id: 4, label: 'Elite', icon: <Star className="h-5 w-5" />, active: true },
  { id: 5, label: 'Hat Trick', icon: <Trophy className="h-5 w-5" />, active: false },
  { id: 6, label: 'The Chosen', icon: <Crown className="h-5 w-5" />, active: false },
];

const MOCK_TOP_5 = [
  { rank: 1, user: 'arjun_d', tier: 'Ranked', initial: 'A', score: 100 },
  { rank: 2, user: 'kavya.creates', tier: 'Rising', initial: 'K', score: 80 },
  { rank: 3, user: 'priya.des (you)', tier: 'Elite', initial: 'P', score: 65, isSelf: true },
  { rank: 4, user: 'rahul_ui', tier: 'Rising', initial: 'R', score: 50 },
  { rank: 5, user: 'sana.dsgn', tier: 'Contender', initial: 'S', score: 50 },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export default function ProfileDashboard() {
  const params = useParams();
  const username = params.username as string;
  const { data, error, isLoading } = useSWR<ProfileApiResponse>(
    `/api/profile/${encodeURIComponent(username)}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const [activeTab, setActiveTab] = useState<'all' | 'top3' | 'month'>('all');

  const profile = data?.data?.profile;
  const history = data?.data?.sprint_history ?? [];

  if (isLoading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <div className="pt-24 text-center font-body text-[#737380]">
        Target competitor context profile could not be located.
      </div>
    );
  }

  // Derived metrics
  const sprintsEntered = history.length;
  let bestPlacement = '-';
  let bestSprint = '';
  if (history.length > 0) {
    let minRank = 999;
    history.forEach(h => {
      const r = h.results?.[0]?.rank;
      if (r && r < minRank) { minRank = r; bestSprint = `#${String(h.sprint?.sprint_number).padStart(3,'0')}`; }
    });
    if (minRank !== 999) bestPlacement = `#${minRank}`;
  }
  const xpGainedLastSprint = history[0]?.results?.[0]?.points_awarded ?? 0;

  // Filter history based on tab
  const filteredHistory = history.filter(h => {
    if (activeTab === 'top3') {
      const rank = h.results?.[0]?.rank;
      return rank && rank <= 3;
    }
    // Simple mock for "this month" - just show all for now since mock data varies
    return true; 
  });

  return (
    <div className="min-h-screen bg-[#050507] pt-16 pb-20 text-[#F5F5F7] font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ── HEADER ── */}
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Welcome back, {profile.display_name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-[#A3A3B0] text-sm">
            Sprint #007 is live — 18 hours left to submit
          </p>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            value={sprintsEntered.toString()} 
            label="SPRINTS ENTERED" 
            sub="↑ 3 this month" 
            subColor="text-[#4ADE80]"
            glow="#FF2D55" 
          />
          <StatCard 
            value={bestPlacement} 
            label="BEST PLACEMENT" 
            sub={`Sprint ${bestSprint}`}
            glow="#FFD700" 
          />
          <StatCard 
            value={profile.total_points.toLocaleString()} 
            label="TOTAL XP" 
            sub={`+${xpGainedLastSprint} last sprint`}
            subColor="text-[#4ECDC4]"
            glow="#A78BFA" 
          />
          <StatCard 
            value="6" 
            label="SPRINT STREAK" 
            sub="🔥 Personal best"
            subColor="text-[#FFD700]"
            glow="#45B7D1" 
          />
        </div>

        {/* ── MAIN TWO-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Skill Rank Card */}
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-6 shadow-xl">
              <div className="flex justify-between items-baseline mb-4">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#A3A3B0]">
                  Skill Rank
                </h2>
                <span className="text-xs text-[#737380]">
                  {profile.rank_tier === 'Legend' ? 'Max Rank' : `${TIER_THRESHOLDS[getNextTier(profile.rank_tier as RankTier) as RankTier] - profile.total_points} to ${getNextTier(profile.rank_tier as RankTier)}`}
                </span>
              </div>
              
              <div className="mb-2">
                <span className="font-display text-3xl font-extrabold">{profile.total_points.toLocaleString()} XP</span>
              </div>

              {/* Enhanced XP Bar representation matching the image */}
              <div className="mt-8">
                <XPBar totalPoints={profile.total_points} tier={profile.rank_tier as RankTier} />
                <div className="flex justify-between mt-3 px-1">
                   {['Contender', 'Rising', 'Ranked', 'Elite', 'Legend'].map((t) => (
                      <div key={t} className="flex flex-col items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getRankColor(t as RankTier) }} />
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${profile.rank_tier === t ? 'text-[#F5F5F7]' : 'text-[#737380]'}`}>
                          {t}
                        </span>
                      </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Sprint History Card */}
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#A3A3B0]">
                  Sprint History
                </h2>
                <div className="flex gap-4 border-b border-[#1C1C26] pb-1">
                  {(['all', 'top3', 'month'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm pb-2 border-b-2 transition-colors ${
                        activeTab === tab 
                          ? 'border-[#FF2D55] text-[#F5F5F7]' 
                          : 'border-transparent text-[#737380] hover:text-[#A3A3B0]'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab === 'top3' ? 'Top 3' : 'This month'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredHistory.length > 0 ? filteredHistory.map((entry) => {
                  const result = entry.results?.[0];
                  const title = entry.sprint?.title ?? 'Unknown Sprint';
                  const disc = entry.sprint?.discipline ?? 'General';
                  const sprintNum = String(entry.sprint?.sprint_number ?? 0).padStart(3, '0');
                  
                  return (
                    <div key={entry.id} className="flex items-center gap-4 rounded-lg bg-[#101017] p-4 transition-colors hover:bg-[#1C1C26]">
                      <div className={`font-display text-xl font-bold w-10 ${result?.rank && result.rank <= 3 ? 'text-[#FFD700]' : 'text-[#45B7D1]'}`}>
                        {result?.rank ? `#${result.rank}` : '-'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold text-sm">{title}</p>
                        <p className="text-xs text-[#737380]">Sprint #{sprintNum} · {disc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-16 h-1.5 rounded-full bg-[#1C1C26] overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${result?.normalized_score ?? 0}%`,
                              backgroundColor: result?.rank && result.rank <= 3 ? '#FFD700' : '#A78BFA'
                            }} 
                          />
                        </div>
                        <span className="font-mono text-sm font-bold text-[#4ECDC4]">
                          +{result?.points_awarded ?? 10}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-8 text-center text-sm text-[#737380]">
                    No sprints found for this filter.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Sprint Live Banner */}
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] shadow-xl overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#1C1C26] bg-[#101017]">
                <span className="font-mono text-xs font-bold text-[#A3A3B0]">Sprint #007</span>
                <span className="flex items-center gap-2 font-mono text-xs font-bold text-[#FF2D55]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-4">
                  Rebrand a D2C organic food startup for a premium urban audience
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="rounded bg-[#FF2D55]/10 px-2 py-1 text-xs font-bold text-[#FF2D55] border border-[#FF2D55]/20">
                    VISUAL DESIGN
                  </span>
                  <span className="rounded bg-[#FFD700]/10 px-2 py-1 text-xs font-bold text-[#FFD700] border border-[#FFD700]/20">
                    $5,000 + Adobe CC
                  </span>
                </div>
                
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm text-[#737380] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#737380]" /> 58 entries
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#FFD700]">18:23:10</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-[#1C1C26] pt-4">
                  <span className="text-xs text-[#737380]">Closes Sunday 6pm</span>
                  <Link href="/sprint" className="text-sm font-bold text-[#A3A3B0] hover:text-white transition-colors flex items-center gap-1">
                    Submit entry <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-6 shadow-xl">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#A3A3B0] mb-4">
                Achievements
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {MOCK_ACHIEVEMENTS.map(ach => (
                  <div 
                    key={ach.id} 
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-center transition-all ${
                      ach.active 
                        ? 'border-[#7C5CFF]/30 bg-[#7C5CFF]/5 text-[#F5F5F7]' 
                        : 'border-[#1C1C26] bg-transparent text-[#3A3A50] opacity-50 grayscale'
                    }`}
                  >
                    <div className={ach.active ? 'text-[#FFD700]' : ''}>{ach.icon}</div>
                    <span className="text-[10px] font-bold leading-tight">{ach.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Snapshot */}
            <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-6 shadow-xl">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#A3A3B0] mb-4">
                VISUAL DESIGN · TOP 5 THIS SPRINT
              </h2>
              <div className="space-y-2">
                {MOCK_TOP_5.map((user) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center gap-3 p-2 rounded-lg ${user.isSelf ? 'bg-[#FF2D55]/10 border border-[#FF2D55]/20' : ''}`}
                  >
                    <span className={`font-display text-sm font-bold w-6 ${user.rank <=3 ? 'text-[#FFD700]' : 'text-[#737380]'}`}>
                      #{user.rank}
                    </span>
                    <div className="h-7 w-7 flex items-center justify-center rounded-full bg-[#1C1C26] text-xs font-bold text-white border border-[#2C2C3A]">
                      {user.initial}
                    </div>
                    <span className={`flex-1 text-sm ${user.isSelf ? 'text-[#FF2D55] font-bold' : 'text-[#F5F5F7]'}`}>
                      {user.user}
                    </span>
                    <span className="text-[10px] font-bold uppercase border border-[#2C2C3A] rounded px-1.5 py-0.5 text-[#A3A3B0] bg-[#101017]">
                      {user.tier}
                    </span>
                    <span className="font-mono text-xs text-[#737380]">+{user.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Judge CTA */}
            <div className="rounded-xl border border-[#7C5CFF]/30 bg-gradient-to-r from-[#7C5CFF]/10 to-transparent p-5 flex items-center justify-between group cursor-pointer hover:border-[#7C5CFF]/60 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="text-[#7C5CFF] opacity-80"><Sparkles className="h-8 w-8" /></div>
                 <div>
                   <h4 className="font-bold text-white text-sm">Become a judge in Sprint #008</h4>
                   <p className="text-xs text-[#737380] mt-1 max-w-[200px]">Senior creatives evaluate submissions anonymously. Arena Pro free for life.</p>
                 </div>
               </div>
               <span className="font-bold text-sm text-[#7C5CFF] group-hover:text-white transition-colors flex items-center gap-1">
                 Apply <ChevronRight className="h-4 w-4" />
               </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ───
function getNextTier(current: RankTier): RankTier | null {
  const order: RankTier[] = ['Contender', 'Rising', 'Ranked', 'Elite', 'Legend'];
  const idx = order.indexOf(current);
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1] as RankTier;
  return null;
}

function StatCard({ value, label, sub, subColor = 'text-[#737380]', glow }: { value: string, label: string, sub?: string, subColor?: string, glow: string }) {
  return (
    <div className="rounded-xl border border-[#1C1C26] bg-[#0A0A0F] p-5 relative overflow-hidden group hover:border-[#2C2C3A] transition-colors">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: glow }} />
      
      <div className="flex flex-col mt-2">
        <span className="font-display text-4xl font-extrabold text-white">{value}</span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#A3A3B0]">{label}</span>
        {sub && <span className={`mt-2 text-xs font-medium ${subColor}`}>{sub}</span>}
      </div>
    </div>
  );
}
