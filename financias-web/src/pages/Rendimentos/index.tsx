import { CalendarClock, Coins, Loader2, PiggyBank, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { StatCard } from '../../components/StatCard'
import { useFiis } from '../../hooks/useFiis'
import { formatarMoeda, formatarNumero } from '../../services/format'

interface Rendimento {
  fii: Fii
  rendimentoMensal: number
  investido: number
}

export const Rendimentos: React.FC = () => {
  const { fiis, carregando, erro } = useFiis()

  const rendimentos = useMemo<Rendimento[]>(() => {
    return fiis
      .filter((fii) => fii.quantidadeCotas > 0)
      .map((fii) => ({
        fii,
        rendimentoMensal: fii.quantidadeCotas * fii.dividendo,
        investido: fii.quantidadeCotas * fii.cotacao,
      }))
      .sort((a, b) => b.rendimentoMensal - a.rendimentoMensal)
  }, [fiis])

  const totalMensal = rendimentos.reduce((soma, item) => soma + item.rendimentoMensal, 0)
  const totalInvestido = rendimentos.reduce((soma, item) => soma + item.investido, 0)
  const yieldCarteira = totalInvestido > 0 ? (totalMensal / totalInvestido) * 100 : 0

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Rendimentos do mês</h1>
          <p className="mt-1 text-sm text-zinc-400">Quanto cada FII da sua carteira deve render no próximo pagamento e o total consolidado</p>
        </header>

        {erro && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{erro}</div>}

        {carregando ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            Carregando FIIs...
          </div>
        ) : rendimentos.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
            <p className="text-zinc-300">Nenhuma FII com cotas cadastradas</p>
            <p className="mt-1 text-sm text-zinc-500">Cadastre suas cotas no dashboard para ver o rendimento mensal</p>
          </div>
        ) : (
          <>
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={PiggyBank} label="Total no mês" valor={formatarMoeda(totalMensal)} destaque="consolidado da carteira" cor="text-emerald-400" />
              <StatCard icon={Wallet} label="Total investido" valor={formatarMoeda(totalInvestido)} destaque="a preço atual" cor="text-violet-400" />
              <StatCard icon={CalendarClock} label="Yield da carteira" valor={`${yieldCarteira.toFixed(2).replace('.', ',')}%`} destaque="no mês" cor="text-amber-400" />
              <StatCard icon={Coins} label="FIIs com cotas" valor={String(rendimentos.length)} destaque="na carteira" cor="text-sky-400" />
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-5 py-3 font-medium">FII</th>
                      <th className="px-5 py-3 text-right font-medium">Cotas</th>
                      <th className="px-5 py-3 text-right font-medium">Provento/cota</th>
                      <th className="px-5 py-3 text-right font-medium">Investido</th>
                      <th className="px-5 py-3 font-medium">Pagamento</th>
                      <th className="px-5 py-3 text-right font-medium">Rendimento no mês</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimentos.map(({ fii, rendimentoMensal, investido }) => (
                      <tr key={fii.id} className="border-b border-zinc-800/60 transition hover:bg-zinc-800/30">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-zinc-100">{fii.ticker}</p>
                          <p className="text-xs text-zinc-500">{fii.nome}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarNumero(fii.quantidadeCotas)}</td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(fii.dividendo)}</td>
                        <td className="px-5 py-4 text-right text-zinc-300">{formatarMoeda(investido)}</td>
                        <td className="px-5 py-4 text-zinc-400">{fii.dataPagamento || '—'}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-400">{formatarMoeda(rendimentoMensal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-800 bg-zinc-900/60">
                      <td className="px-5 py-4 font-semibold text-zinc-100" colSpan={5}>
                        Total consolidado no mês
                      </td>
                      <td className="px-5 py-4 text-right text-lg font-bold text-emerald-400">{formatarMoeda(totalMensal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <p className="mt-4 text-xs text-zinc-600">
              O rendimento é estimado a partir do último provento distribuído por cota (cotas × provento). O valor real pode variar conforme o anúncio de cada mês.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
