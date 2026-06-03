import { Check, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'
import { formatarMoeda, formatarNumero, formatarPercentual } from '../../services/format'
import type { FiiTableProps } from './types'

export const FiiTable: React.FC<FiiTableProps> = ({ fiis, onRemover, onAtualizarCotas, offset = 0, paginacao }) => {
  const [removendo, setRemovendo] = useState<number | null>(null)
  const [confirmandoRemover, setConfirmandoRemover] = useState<number | null>(null)
  const [editando, setEditando] = useState<number | null>(null)
  const [valorEdicao, setValorEdicao] = useState('')
  const [salvando, setSalvando] = useState<number | null>(null)

  const remover = async (id: number) => {
    setRemovendo(id)
    try {
      await onRemover(id)
    } finally {
      setRemovendo(null)
      setConfirmandoRemover(null)
    }
  }

  const iniciarEdicao = (fii: Fii) => {
    setEditando(fii.id)
    setValorEdicao(String(fii.quantidadeCotas))
  }

  const salvarCotas = async (id: number) => {
    const quantidade = Math.max(0, Math.floor(Number(valorEdicao) || 0))
    setSalvando(id)
    try {
      await onAtualizarCotas(id, quantidade)
      setEditando(null)
    } finally {
      setSalvando(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">FII</th>
              <th className="px-5 py-3 text-right font-medium">Cotação</th>
              <th className="px-5 py-3 text-right font-medium">Provento</th>
              <th className="px-5 py-3 text-right font-medium">Cotas</th>
              <th className="px-5 py-3 text-right font-medium">DY mensal</th>
              <th className="px-5 py-3 text-right font-medium">DY anual</th>
              <th className="px-5 py-3 font-medium">Pagamento</th>
              <th className="px-5 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fiis.map((fii, indice) => {
              const posicao = offset + indice + 1
              return (
              <tr key={fii.id} className="border-b border-zinc-800/60 transition hover:bg-zinc-800/30">
                <td className="px-5 py-4">
                  {posicao === 1 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" /> 1º
                    </span>
                  ) : (
                    <span className="text-zinc-500">{posicao}º</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-zinc-100">{fii.ticker}</p>
                  <p className="text-xs text-zinc-500">{fii.nome}</p>
                </td>
                <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(fii.cotacao)}</td>
                <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(fii.dividendo)}</td>
                <td className="px-5 py-4 text-right">
                  {editando === fii.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={valorEdicao}
                        autoFocus
                        onChange={(e) => setValorEdicao(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') salvarCotas(fii.id)
                          if (e.key === 'Escape') setEditando(null)
                        }}
                        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950/60 px-2 py-1 text-right text-sm text-zinc-100 focus:border-violet-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => salvarCotas(fii.id)}
                        disabled={salvando === fii.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
                        title="Salvar"
                      >
                        {salvando === fii.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => iniciarEdicao(fii)}
                      className="group inline-flex items-center justify-end gap-1.5 text-zinc-300 transition hover:text-violet-400"
                      title="Editar quantidade de cotas"
                    >
                      <span className="font-medium">{formatarNumero(fii.quantidadeCotas)}</span>
                      <Pencil className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-violet-400" />
                    </button>
                  )}
                </td>
                <td className="px-5 py-4 text-right text-zinc-300">{formatarPercentual(fii.dyMensal)}</td>
                <td className="px-5 py-4 text-right font-semibold text-emerald-400">{formatarPercentual(fii.dyAnual)}</td>
                <td className="px-5 py-4 text-zinc-400">{fii.dataPagamento || '—'}</td>
                <td className="px-5 py-4 text-right">
                  {confirmandoRemover === fii.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <span className="mr-1 text-xs text-zinc-400">Remover?</span>
                      <button
                        onClick={() => remover(fii.id)}
                        disabled={removendo === fii.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                        title="Confirmar remoção"
                      >
                        {removendo === fii.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setConfirmandoRemover(null)}
                        disabled={removendo === fii.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoRemover(fii.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {paginacao && paginacao.total > 0 && (
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-sm text-zinc-400">
          <span>
            {offset + 1}–{offset + fiis.length} de {paginacao.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginacao.onPagina(paginacao.pagina - 1)}
              disabled={paginacao.pagina <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-xs text-zinc-500">
              Página {paginacao.pagina} de {paginacao.lastPage}
            </span>
            <button
              onClick={() => paginacao.onPagina(paginacao.pagina + 1)}
              disabled={paginacao.pagina >= paginacao.lastPage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
