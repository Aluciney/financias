import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatarPercentual } from '../../services/format'
import type { RankingChartProps } from './types'

const CORES = ['#34d399', '#4ade80', '#a3e635', '#facc15', '#fbbf24']

interface TooltipPayload {
  active?: boolean
  payload?: Array<{ payload: Fii }>
}

const CustomTooltip: React.FC<TooltipPayload> = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const fii = payload[0].payload

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-sm shadow-xl">
      <p className="font-semibold text-zinc-100">{fii.ticker}</p>
      <p className="text-zinc-400">{fii.nome}</p>
      <p className="mt-2 text-emerald-400">DY anual: {formatarPercentual(fii.dyAnual)}</p>
      <p className="text-zinc-400">DY mensal: {formatarPercentual(fii.dyMensal)}</p>
    </div>
  )
}

export const RankingChart: React.FC<RankingChartProps> = ({ fiis }) => {
  const dados = fiis.slice(0, 12)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-300">Ranking por retorno (DY anual %)</h2>
      <p className="mt-1 text-xs text-zinc-500">As melhores opções aparecem primeiro</p>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="ticker" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} angle={-35} textAnchor="end" height={56} interval={0} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip cursor={{ fill: '#ffffff08' }} content={<CustomTooltip />} />
            <Bar dataKey="dyAnual" radius={[6, 6, 0, 0]}>
              {dados.map((fii, indice) => (
                <Cell key={fii.id} fill={CORES[Math.min(indice, CORES.length - 1)]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
