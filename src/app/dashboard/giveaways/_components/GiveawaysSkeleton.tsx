export default function GiveawaysSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-48 rounded animate-pulse" style={{ background: 'var(--surface-3)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-5 animate-pulse shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <div className="h-6 w-32 rounded mb-3 animate-pulse" style={{ background: 'var(--surface-3)' }} />
            <div className="h-4 w-24 rounded mb-4 animate-pulse" style={{ background: 'var(--surface-3)' }} />
            <div className="h-16 rounded mb-4 animate-pulse" style={{ background: 'var(--surface-3)' }} />
            <div className="h-8 w-full rounded animate-pulse" style={{ background: 'var(--surface-3)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
