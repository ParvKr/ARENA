import { Hero } from '@/components/hero/Hero'
import { Timeline72 } from '@/components/landing/Timeline72'
import { Disciplines } from '@/components/landing/Disciplines'
import { RankLadder } from '@/components/landing/RankLadder'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  // overflow-x-clip (not hidden): `hidden` would turn this into a scroll container and
  // break the sticky stage in Timeline72.
  return (
    <div className="overflow-x-clip bg-void text-chalk">
      <Hero />
      <Timeline72 />
      <Disciplines />
      <RankLadder />
      <FinalCta />
      <Footer />
    </div>
  )
}
