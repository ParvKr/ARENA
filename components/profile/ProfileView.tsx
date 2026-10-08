// components/profile/ProfileView.tsx
// The career record. Same page for the owner and for visitors; only the framing changes.
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { Profile, RankTier } from '@/types/api.types'
import { EASE } from '@/components/hero/shared'
import { CurrentSprint } from './CurrentSprint'
import { Medals } from './Medals'
import { MatchLog } from './MatchLog'
import { RankTrack } from './RankTrack'
import { computeMedals, computeStats, isTier, type RecordEntry } from './record'

function Avatar({ profile }: { profile: Profile }) {
  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase()
  return profile.avatar_url ? (
    // Plain img: avatars come from any OAuth provider, which next/image would reject.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatar_url}
      alt=""
      referrerPolicy="no-referrer"
      className="h-24 w-24 shrink-0 rounded-full border-2 border-white/25 object-cover sm:h-32 sm:w-32"
    />
  ) : (
    <span
      aria-hidden
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-signal font-poster text-5xl sm:h-32 sm:w-32 sm:text-7xl"
    >
      {initial}
    </span>
  )
}

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="min-w-0 py-8 sm:px-8 sm:py-10 sm:first:pl-0">
      <p className="font-poster text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.9]">{value}</p>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-chalk">{label}</p>
      <p className="mt-1 text-sm text-smoke">{note}</p>
    </div>
  )
}

export function ProfileView({
  profile,
  history,
  isOwner,
}: {
  profile: Profile
  history: RecordEntry[]
  isOwner: boolean
}) {
  const reduce = useReducedMotion() ?? false
  const stats = computeStats(history)
  const medals = computeMedals(history, stats)
  const tier: RankTier = isTier(profile.rank_tier) ? profile.rank_tier : 'Contender'
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-28 sm:px-8">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col gap-8 sm:flex-row sm:items-start"
      >
        <Avatar profile={profile} />
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
            {isOwner ? 'Your profile' : 'Competitor'}
          </p>
          <h1 className="mt-3 break-words font-poster text-[clamp(3rem,9vw,7.5rem)] uppercase leading-[0.9]">
            {profile.display_name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm text-smoke">
            <span className="break-all text-chalk">@{profile.username}</span>
            <span className="rounded-full bg-signal px-3 py-1 text-xs font-bold uppercase tracking-wider text-chalk">
              {tier}
            </span>
            <span>Member since {joined}</span>
          </div>
          {profile.bio && (
            <p className="mt-5 line-clamp-4 max-w-xl break-words text-base leading-relaxed text-white/80">{profile.bio}</p>
          )}
        </div>
      </motion.header>

      {isOwner && (
        <div className="mt-12">
          <CurrentSprint />
        </div>
      )}

      <section aria-label="Career numbers" className="mt-16 sm:mt-24">
        <div className="grid grid-cols-2 divide-white/15 border-y border-white/15 sm:grid-cols-4 sm:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-white/15 sm:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:pr-4 [&>*:nth-child(even)]:pl-4 sm:[&>*]:px-8 sm:[&>*:first-child]:pl-0">
          <Stat
            value={String(stats.entries)}
            label="Sprints entered"
            note={stats.entries === 1 ? '1 submission' : `${stats.entries} submissions`}
          />
          <Stat
            value={stats.best ? `#${stats.best.rank}` : '—'}
            label="Best placement"
            note={stats.best ? `Sprint ${String(stats.best.sprintNumber).padStart(3, '0')}` : 'No scored result yet'}
          />
          <Stat value={profile.total_points.toLocaleString()} label="Total XP" note={`${tier} tier`} />
          <Stat
            value={String(stats.bestStreak)}
            label="Best streak"
            note={stats.bestStreak === 1 ? 'sprint in a row' : 'sprints in a row'}
          />
        </div>
      </section>

      <RankTrack points={profile.total_points} tier={tier} isOwner={isOwner} />
      <MatchLog history={history} isOwner={isOwner} name={profile.display_name} />
      <Medals medals={medals} />
    </div>
  )
}
