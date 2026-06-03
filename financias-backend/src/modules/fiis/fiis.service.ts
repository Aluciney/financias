import createError from '@fastify/error'
import type { Knex } from 'knex'
import { criarLogger } from '@/libs/logger'
import { getFiiDataStatusInvest } from '@/libs/statusInvest'
import { type DadosFii, FiisDAO } from '@/modules/fiis/fiis.dao'
import type { Fii } from '@/modules/fiis/fiis.schema'

const log = criarLogger({ modulo: 'fiis' })

const FiiJaCadastradaError = createError('FII_JA_CADASTRADA', 'A FII %s já está cadastrada', 400)
const FiiNaoEncontradaError = createError('FII_NAO_ENCONTRADA', '%s', 404)
const EtfNaoSuportadoError = createError('ETF_NAO_SUPORTADO', 'ETFs não são suportados: não distribuem proventos (%s)', 400)

export class FiisService {
	async listar(trx: Knex): Promise<Fii[]> {
		return FiisDAO.listar({ trx })
	}

	async listarPaginado(trx: Knex, props: { page: number; perPage: number; busca?: string }) {
		return FiisDAO.listarPaginado({ trx, page: props.page, perPage: props.perPage, busca: props.busca })
	}

	async cadastrar(trx: Knex, props: { ticker: string; quantidadeCotas: number }): Promise<Fii> {
		const ticker = props.ticker.toUpperCase()

		const existente = await FiisDAO.buscarPorTicker({ trx, ticker })
		if (existente) throw new FiiJaCadastradaError(ticker)

		const dados = await this.coletarDados(ticker)
		const fii = await FiisDAO.inserir({ trx, ticker, quantidadeCotas: props.quantidadeCotas, dados })
		log.info({ ticker, cotacao: fii.cotacao, dyAnual: fii.dyAnual, quantidadeCotas: fii.quantidadeCotas }, 'FII cadastrada')
		return fii
	}

	async atualizar(trx: Knex): Promise<{ atualizadas: number; falhas: Array<{ ticker: string; motivo: string }>; fiis: Fii[] }> {
		const fiis = await FiisDAO.listar({ trx })
		const falhas: Array<{ ticker: string; motivo: string }> = []
		let atualizadas = 0

		log.info({ total: fiis.length }, 'Iniciando atualização de todas as FIIs')

		for (const fii of fiis) {
			try {
				const dados = await this.coletarDados(fii.ticker)
				await FiisDAO.atualizarDados({ trx, id: fii.id, dados })
				atualizadas++
			} catch (error) {
				const motivo = error instanceof Error ? error.message : 'Erro desconhecido'
				log.warn({ ticker: fii.ticker, motivo }, 'Falha ao atualizar FII')
				falhas.push({ ticker: fii.ticker, motivo })
			}
		}

		log.info({ atualizadas, falhas: falhas.length }, 'Atualização concluída')

		const lista = await FiisDAO.listar({ trx })
		return { atualizadas, falhas, fiis: lista }
	}

	async atualizarCotas(trx: Knex, props: { id: number; quantidadeCotas: number }): Promise<Fii> {
		const existente = await FiisDAO.buscarPorId({ trx, id: props.id })
		if (!existente) throw new FiiNaoEncontradaError('FII não encontrada')

		await FiisDAO.atualizarCotas({ trx, id: props.id, quantidadeCotas: props.quantidadeCotas })

		const atualizada = await FiisDAO.buscarPorId({ trx, id: props.id })
		return atualizada as Fii
	}

	async remover(trx: Knex, props: { id: number }): Promise<{ id: number }> {
		const removidos = await FiisDAO.remover({ trx, id: props.id })
		if (!removidos) throw new FiiNaoEncontradaError('FII não encontrada')

		return { id: props.id }
	}

	// Faz o scraping no StatusInvest e valida o resultado
	private async coletarDados(ticker: string): Promise<DadosFii> {
		let data: Awaited<ReturnType<typeof getFiiDataStatusInvest>>
		try {
			data = await getFiiDataStatusInvest(ticker)
		} catch (error) {
			const motivo = error instanceof Error ? error.message : 'falha ao consultar o StatusInvest'
			throw new FiiNaoEncontradaError(`Não foi possível obter os dados de ${ticker}: ${motivo}`)
		}

		// ETFs não distribuem proventos (acumulam), então não fazem sentido no acompanhamento por DY
		if (data.categoria === 'etfs') throw new EtfNaoSuportadoError(ticker)
		if (!data.cotacao) throw new FiiNaoEncontradaError(`Não foi possível obter a cotação de ${ticker}`)

		return {
			nome: data.nome,
			cotacao: data.cotacao,
			dividendo: data.proximoPagamento.valor,
			dataCom: data.proximoPagamento.dataCom,
			dataPagamento: data.proximoPagamento.dataPagamento,
			dyMensal: data.dyMensal,
			dyAnual: data.dyAnual,
		}
	}
}
