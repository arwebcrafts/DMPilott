function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E4E6EA] rounded-lg ${className}`} />
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-72" />
        </div>
        <Pulse className="h-9 w-36" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm space-y-3">
            <div className="flex justify-between">
              <Pulse className="w-9 h-9" />
              <Pulse className="w-14 h-4" />
            </div>
            <Pulse className="h-9 w-24" />
            <Pulse className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Chart + top posts */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm space-y-3">
          <div className="flex justify-between">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-7 w-32" />
          </div>
          <Pulse className="h-[220px] w-full rounded-xl" />
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm space-y-3">
          <Pulse className="h-5 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="w-7 h-7 rounded-full" />
              <Pulse className="flex-1 h-4" />
              <Pulse className="w-14 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Automations + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm space-y-3">
          <Pulse className="h-5 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Pulse key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm space-y-3">
          <Pulse className="h-5 w-28" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Pulse key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Activity table */}
      <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0F2F5]">
          <Pulse className="h-5 w-40" />
        </div>
        <div className="divide-y divide-[#F0F2F5]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <Pulse className="w-7 h-7 rounded-full" />
              <Pulse className="flex-1 h-4" />
              <Pulse className="w-20 h-4" />
              <Pulse className="w-16 h-4" />
              <Pulse className="w-14 h-5 rounded-full" />
              <Pulse className="w-20 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
