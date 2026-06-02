import type { Knex } from 'knex'
import type { Fii } from '@/modules/fiis/fiis.schema'

interface FiiRow {
	id: number
	ticker: string
	nome: string
	cotacao: number
	dividendo: number
	data_com: string
	data_pagamento: string
	dy_mensal: number
	dy_anual: number
	atualizado_em: string | null
	criado_em: string
}

export interface DadosFii {
	nome: string
	cotacao: number
	dividendo: number
	dataCom: string
	dataPagamento: string
	dyMensal: number
	dyAnual: number
}

const mapRow = (row: FiiRow): Fii => ({
	id: row.id,
	ticker: row.ticker,
	nome: row.nome,
	cotacao: row.cotacao,
	dividendo: row.dividendo,
	dataCom: row.data_com,
	dataPagamento: row.data_pagamento,
	dyMensal: row.dy_mensal,
	dyAnual: row.dy_anual,
	atualizadoEm: row.atualizado_em,
	criadoEm: row.criado_em,
})

export const FiisDAO = {
	// Lista ordenando pela melhor opção de retorno (maior dividend yield anual primeiro)
	listar: async (props: { trx: Knex }): Promise<Fii[]> => {
		const rows = await props.trx<FiiRow>('fiis').select('*').orderBy('dy_anual', 'desc')
		return rows.map(mapRow)
	},

	// Mesma ordenação, porém paginada no banco via knex-paginate
	listarPaginado: async (props: { trx: Knex; page: number; perPage: number }) => {
		const resultado = await props.trx<FiiRow>('fiis').select('*').orderBy('dy_anual', 'desc').paginate({ perPage: props.perPage, currentPage: props.page, isLengthAware: true })

		return {
			data: resultado.data.map(mapRow),
			total: resultado.pagination.total ?? 0,
			perPage: props.perPage,
			currentPage: resultado.pagination.currentPage,
			lastPage: resultado.pagination.lastPage ?? 1,
		}
	},

	buscarPorTicker: async (props: { trx: Knex; ticker: string }): Promise<Fii | undefined> => {
		const row = await props.trx<FiiRow>('fiis').where({ ticker: props.ticker }).first()
		return row ? mapRow(row) : undefined
	},

	buscarPorId: async (props: { trx: Knex; id: number }): Promise<Fii | undefined> => {
		const row = await props.trx<FiiRow>('fiis').where({ id: props.id }).first()
		return row ? mapRow(row) : undefined
	},

	inserir: async (props: { trx: Knex; ticker: string; dados: DadosFii }): Promise<Fii> => {
		const [id] = await props.trx('fiis').insert({
			ticker: props.ticker,
			nome: props.dados.nome,
			cotacao: props.dados.cotacao,
			dividendo: props.dados.dividendo,
			data_com: props.dados.dataCom,
			data_pagamento: props.dados.dataPagamento,
			dy_mensal: props.dados.dyMensal,
			dy_anual: props.dados.dyAnual,
			atualizado_em: props.trx.fn.now(),
		})

		const row = await props.trx<FiiRow>('fiis').where({ id }).first()
		return mapRow(row as FiiRow)
	},

	atualizarDados: async (props: { trx: Knex; id: number; dados: DadosFii }): Promise<void> => {
		await props.trx('fiis')
			.where({ id: props.id })
			.update({
				nome: props.dados.nome,
				cotacao: props.dados.cotacao,
				dividendo: props.dados.dividendo,
				data_com: props.dados.dataCom,
				data_pagamento: props.dados.dataPagamento,
				dy_mensal: props.dados.dyMensal,
				dy_anual: props.dados.dyAnual,
				atualizado_em: props.trx.fn.now(),
			})
	},

	remover: async (props: { trx: Knex; id: number }): Promise<number> => {
		return props.trx('fiis').where({ id: props.id }).del()
	},
}
