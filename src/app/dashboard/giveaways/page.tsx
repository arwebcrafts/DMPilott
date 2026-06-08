import { Suspense } from 'react'
import GiveawaysDataFetcher from './_components/GiveawaysDataFetcher'
import GiveawaysSkeleton from './_components/GiveawaysSkeleton'

export default function GiveawaysPage() {
  return (
    <Suspense fallback={<GiveawaysSkeleton />}>
      <GiveawaysDataFetcher />
    </Suspense>
  )
}
