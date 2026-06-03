import { format } from 'date-fns'
import { Activity, Layers, Loader2, Percent, RefreshCw, Search, Trophy } from 'lucide-react'
import { useState } from 'react'
import { AddFiiForm } from '../../components/AddFiiForm'
import { FiiTable } from '../../components/FiiTable'
import { RankingChart } from '../../components/RankingChart'
import { RetornoPie } from '../../components/RetornoPie'
import { StatCard } from '../../components/StatCard'
import { useFiis } from '../../hooks/useFiis'
import { useFiisPaginadas } from '../../hooks/useFiisPaginadas'
import { formatarMoeda, formatarPercentual } from '../../services/format'

export const Dashboard: React.FC = () => {
  const { fiis, carregando, atualizando, erro, cadastrar, atualizarTodas, atualizarCotas, remover } = useFiis()
  const tabela = useFiisPaginadas(5)
  const [feedback, setFeedback] = useState<string | null>(null)

  const melhor = fiis[0]
  const dyMedio = fiis.length ? fiis.reduce((soma, fii) => soma + fii.dyAnual, 0) / fiis.length : 0
  const proventoTotal = fiis.reduce((soma, fii) => soma + fii.dividendo, 0)
  const ultimaAtualizacao = fiis
    .map((fii) => fii.atualizadoEm)
    .filter((data): data is string => Boolean(data))
    .sort()
    .at(-1)

  const handleAtualizar = async () => {
    setFeedback(null)
    try {
      const resultado = await atualizarTodas()
      await tabela.recarregar()
      const base = `${resultado.atualizadas} FII(s) atualizada(s)`
      setFeedback(resultado.falhas.length ? `${base} · ${resultado.falhas.length} falha(s)` : base)
    } catch {
      setFeedback(null)
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Dashboard de FIIs ordenado pela melhor opção de retorno
              {ultimaAtualizacao && <span className="text-zinc-600"> · atualizado em {format(new Date(ultimaAtualizacao.replace(' ', 'T')), "dd/MM/yyyy 'às' HH:mm")}</span>}
            </p>
          </div>

          <button
            onClick={handleAtualizar}
            disabled={atualizando || !fiis.length}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-violet-500/60 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {atualizando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar tudo
          </button>
        </header>

        {feedback && <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{feedback}</div>}
        {erro && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{erro}</div>}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Layers} label="FIIs cadastradas" valor={String(fiis.length)} cor="text-violet-400" />
          <StatCard icon={Trophy} label="Melhor retorno" valor={melhor ? melhor.ticker : '—'} destaque={melhor ? formatarPercentual(melhor.dyAnual) + ' a.a.' : undefined} cor="text-amber-400" />
          <StatCard icon={Percent} label="DY médio anual" valor={formatarPercentual(dyMedio)} cor="text-emerald-400" />
          <StatCard icon={Activity} label="Provento somado" valor={formatarMoeda(proventoTotal)} destaque="por cota / mês" cor="text-sky-400" />
        </section>

        <section className="mt-6">
          <AddFiiForm onCadastrar={async (ticker, quantidadeCotas) => { await cadastrar(ticker, quantidadeCotas); await tabela.recarregar() }} />
        </section>

        {carregando ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            Carregando FIIs...
          </div>
        ) : fiis.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
            <p className="text-zinc-300">Nenhuma FII cadastrada ainda</p>
            <p className="mt-1 text-sm text-zinc-500">Cadastre um ticker acima para começar a comparar os retornos</p>
          </div>
        ) : (
          <>
            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RankingChart fiis={fiis} />
              </div>
              <RetornoPie fiis={fiis} />
            </section>

            <section className="mt-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-medium text-zinc-300">FIIs cadastradas</h2>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={tabela.busca}
                    onChange={(e) => tabela.setBusca(e.target.value)}
                    placeholder="Buscar por ticker ou nome"
                    autoComplete="off"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 py-2 pr-3 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {tabela.dados.length === 0 && tabela.busca ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center text-sm text-zinc-400">
                  Nenhuma FII encontrada para "{tabela.busca}"
                </div>
              ) : (
                <FiiTable
                  fiis={tabela.dados}
                  onRemover={async (id) => { await remover(id); await tabela.recarregar() }}
                  onAtualizarCotas={async (id, quantidade) => { await atualizarCotas(id, quantidade); await tabela.recarregar() }}
                  offset={(tabela.pagina - 1) * tabela.perPage}
                  paginacao={{
                    pagina: tabela.pagina,
                    lastPage: tabela.lastPage,
                    total: tabela.total,
                    perPage: tabela.perPage,
                    onPagina: tabela.setPagina,
                  }}
                />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
