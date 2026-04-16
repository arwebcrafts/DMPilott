import { Suspense } from 'react'
import DashboardDataFetcher from './_components/DashboardDataFetcher'
import DashboardSkeleton from './_components/DashboardSkeleton'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataFetcher />
    </Suspense>
  )
}
