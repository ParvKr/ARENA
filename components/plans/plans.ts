// components/plans/plans.ts
// Plan content. Nothing here is billable yet: only the free plan is live.

export interface Plan {
  id: string
  name: string
  price: string
  /** Shown after the price, e.g. "per month". Empty for the free plan. */
  period: string
  description: string
  features: string[]
  /** Only the free plan can be used today. */
  available: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'contender',
    name: 'Contender',
    price: 'Free',
    period: '',
    description: 'Enter the arena. Compete, earn XP and climb the ranks.',
    features: [
      'Access to all public sprints',
      'Unlimited submissions',
      'Public rank and profile',
      'Sprint history and XP tracking',
      'Community leaderboard',
    ],
    available: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'Unlock detailed feedback and analytics on every entry.',
    features: [
      'Everything in Contender',
      'Judge feedback on every submission',
      'Score breakdown and percentile rank',
      'Monthly 1:1 critique session',
    ],
    available: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$29',
    period: 'per month',
    description: 'For serious competitors building a body of work that opens doors.',
    features: [
      'Everything in Pro',
      'Featured portfolio showcase',
      'Recruiter visibility and job board access',
      'Private elite-only sprint track',
      'Mentor office hours (2x/month)',
      'Arena certification on LinkedIn',
    ],
    available: false,
  },
  {
    id: 'legend',
    name: 'Legend',
    price: '$79',
    period: 'per month',
    description: 'The highest tier, for those who compete to win and get hired for it.',
    features: [
      'Everything in Elite',
      'Guaranteed judge panel seat offer',
      'White-glove portfolio review',
      'Direct recruiter introductions',
      'Legend badge and profile crown',
      'Lifetime Hall of Fame entry (top 3 finishes)',
    ],
    available: false,
  },
]

export const FAQ = [
  {
    q: 'Do free users compete against paid users?',
    a: 'Yes. Judging is blind. Your work is judged, not your plan.',
  },
  {
    q: 'What happens to my rank if I change plans?',
    a: 'Your XP and rank are yours permanently. They never reset.',
  },
  {
    q: 'When do paid plans open?',
    a: 'They are not open yet. Everything in the free plan works today, and your rank and XP carry over when they do.',
  },
]
