export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-64 rounded animate-pulse" style={{ background: 'var(--surface-3)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-5 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <div className="h-12 w-12 rounded-lg mb-3 animate-pulse" style={{ background: 'var(--surface-3)' }} />
            <div className="h-8 w-24 rounded animate-pulse" style={{ background: 'var(--surface-3)' }} />
            <div className="h-4 w-32 rounded mt-2 animate-pulse" style={{ background: 'var(--surface-3)' }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5 h-80 animate-pulse shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }} />
      <div className="rounded-xl border p-5 h-96 animate-pulse shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }} />
    </div>
  )
}
