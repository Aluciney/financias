import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatarPercentual } from '../../services/format'
import type { RetornoPieProps } from './types'

const CORES = ['#8b5cf6', '#6366f1', '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f97316']

interface TooltipPayload {
  active?: boolean
  payload?: Array<{ payload: Fii }>
}

const CustomTooltip: React.FC<TooltipPayload> = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const fii = payload[0].payload

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-2 text-sm shadow-xl">
      <p className="font-semibold text-zinc-100">{fii.ticker}</p>
      <p className="text-emerald-400">{formatarPercentual(fii.dyAnual)} a.a.</p>
    </div>
  )
}

export const RetornoPie: React.FC<RetornoPieProps> = ({ fiis }) => {
  const dados = fiis.slice(0, 8)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-300">Participação no retorno</h2>
      <p className="mt-1 text-xs text-zinc-500">Peso relativo do DY (top 8)</p>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dados} dataKey="dyAnual" nameKey="ticker" innerRadius={60} outerRadius={110} paddingAngle={2} stroke="#18181b" strokeWidth={2}>
              {dados.map((fii, indice) => (
                <Cell key={fii.id} fill={CORES[indice % CORES.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {dados.map((fii, indice) => (
          <li key={fii.id} className="flex items-center gap-2 text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORES[indice % CORES.length] }} />
            {fii.ticker}
          </li>
        ))}
      </ul>
    </div>
  )
}
