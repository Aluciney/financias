import type { StatCardProps } from './types'

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, valor, destaque, cor = 'text-violet-400' }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 ${cor}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-100">{valor}</p>
      {destaque && <p className="mt-1 text-sm text-zinc-500">{destaque}</p>}
    </div>
  )
}
