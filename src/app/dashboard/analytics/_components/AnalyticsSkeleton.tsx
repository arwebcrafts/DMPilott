export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-64 bg-[#22223a] rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-xl p-5 border border-white/10">
            <div className="h-12 w-12 bg-[#22223a] rounded-lg mb-3 animate-pulse" />
            <div className="h-8 w-24 bg-[#22223a] rounded animate-pulse" />
            <div className="h-4 w-32 bg-[#22223a] rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl border border-white/10 p-5 h-80 animate-pulse" />
      <div className="glass-card rounded-xl border border-white/10 p-5 h-96 animate-pulse" />
    </div>
  )
}
