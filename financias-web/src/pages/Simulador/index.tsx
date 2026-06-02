import { Coins, Loader2, Target, TrendingDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatCard } from '../../components/StatCard'
import { useFiis } from '../../hooks/useFiis'
import { formatarMoeda, formatarNumero, formatarPercentual } from '../../services/format'

interface Simulacao {
  fii: Fii
  cotas: number
  investimento: number
  rendaReal: number
}

export const Simulador: React.FC = () => {
  const { fiis, carregando, erro } = useFiis()
  const [alvo, setAlvo] = useState(1000)

  const simulacoes = useMemo<Simulacao[]>(() => {
    if (alvo <= 0) return []
    return fiis
      .filter((fii) => fii.dividendo > 0 && fii.cotacao > 0)
      .map((fii) => {
        const cotas = Math.ceil(alvo / fii.dividendo)
        return {
          fii,
          cotas,
          investimento: cotas * fii.cotacao,
          rendaReal: cotas * fii.dividendo,
        }
      })
      .sort((a, b) => a.investimento - b.investimento)
  }, [fiis, alvo])

  const maisBarata = simulacoes[0]

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Simulador de renda</h1>
          <p className="mt-1 text-sm text-zinc-400">Quanto investir em cada FII para receber a renda mensal desejada</p>
        </header>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <label htmlFor="alvo" className="text-sm font-medium text-zinc-300">
            Quanto você quer receber por mês?
          </label>
          <div className="mt-3 flex max-w-xs items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 focus-within:border-violet-500">
            <span className="text-sm text-zinc-500">R$</span>
            <input
              id="alvo"
              type="number"
              min={0}
              step={50}
              value={alvo || ''}
              onChange={(e) => setAlvo(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-semibold text-zinc-100 outline-none [appearance:textfield] placeholder:text-zinc-600 [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="1000"
            />
            <span className="text-sm text-zinc-500">/mês</span>
          </div>
        </section>

        {erro && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{erro}</div>}

        {carregando ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            Carregando FIIs...
          </div>
        ) : simulacoes.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
            <p className="text-zinc-300">{alvo <= 0 ? 'Informe um valor maior que zero' : 'Nenhuma FII cadastrada ainda'}</p>
            <p className="mt-1 text-sm text-zinc-500">Cadastre FIIs no dashboard para simular a renda</p>
          </div>
        ) : (
          <>
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={Target} label="Renda alvo" valor={formatarMoeda(alvo)} destaque="por mês" cor="text-violet-400" />
              <StatCard icon={TrendingDown} label="Menor investimento" valor={maisBarata ? maisBarata.fii.ticker : '—'} destaque={maisBarata ? formatarMoeda(maisBarata.investimento) : undefined} cor="text-emerald-400" />
              <StatCard icon={Coins} label="Opções disponíveis" valor={String(simulacoes.length)} destaque="FIIs simuladas" cor="text-sky-400" />
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-5 py-3 font-medium">#</th>
                      <th className="px-5 py-3 font-medium">FII</th>
                      <th className="px-5 py-3 text-right font-medium">Provento/cota</th>
                      <th className="px-5 py-3 text-right font-medium">Cotação</th>
                      <th className="px-5 py-3 text-right font-medium">Cotas necessárias</th>
                      <th className="px-5 py-3 text-right font-medium">Investimento</th>
                      <th className="px-5 py-3 text-right font-medium">Renda real/mês</th>
                      <th className="px-5 py-3 text-right font-medium">DY anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacoes.map(({ fii, cotas, investimento, rendaReal }, indice) => (
                      <tr key={fii.id} className="border-b border-zinc-800/60 transition hover:bg-zinc-800/30">
                        <td className="px-5 py-4">
                          {indice === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                              <TrendingDown className="h-3.5 w-3.5" /> 1º
                            </span>
                          ) : (
                            <span className="text-zinc-500">{indice + 1}º</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-zinc-100">{fii.ticker}</p>
                          <p className="text-xs text-zinc-500">{fii.nome}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(fii.dividendo)}</td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(fii.cotacao)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-zinc-100">{formatarNumero(cotas)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-400">{formatarMoeda(investimento)}</td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(rendaReal)}</td>
                        <td className="px-5 py-4 text-right text-zinc-400">{formatarPercentual(fii.dyAnual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="mt-4 text-xs text-zinc-600">
              As cotas são arredondadas para cima (você compra cotas inteiras), por isso a renda real pode ficar um pouco acima do alvo. Cálculo baseado no último provento distribuído.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
