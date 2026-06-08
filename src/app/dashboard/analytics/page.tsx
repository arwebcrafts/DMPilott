import { Suspense } from 'react'
import AnalyticsDataFetcher from './_components/AnalyticsDataFetcher'
import AnalyticsSkeleton from './_components/AnalyticsSkeleton'

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDataFetcher />
    </Suspense>
  )
}
