'use client'

interface BioColorFieldProps {
  label: string
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#ffffff', '#111827', '#DD2A7B', '#8134AF', '#F58529',
  '#000000', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
]

export function BioColorField({ label, value, onChange, presets = DEFAULT_PRESETS }: BioColorFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase() ? 'border-[#DD2A7B] ring-2 ring-[#DD2A7B]/30' : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono bg-white dark:bg-gray-900"
          style={{ borderColor: 'var(--surface-3)' }}
          placeholder="#ffffff"
        />
      </div>
    </div>
  )
}
