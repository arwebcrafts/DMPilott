export default function GiveawaysSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-48 bg-[#22223a] rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl border border-white/10 p-5 animate-pulse">
            <div className="h-6 w-32 bg-[#22223a] rounded mb-3" />
            <div className="h-4 w-24 bg-[#22223a] rounded mb-4" />
            <div className="h-16 bg-[#22223a] rounded mb-4" />
            <div className="h-8 w-full bg-[#22223a] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
