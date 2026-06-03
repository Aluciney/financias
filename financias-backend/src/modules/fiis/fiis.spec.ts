import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { App } from '@/app'
import { FiisDAO } from '@/modules/fiis/fiis.dao'

// Mock do DAO: os testes não dependem de um banco de dados real.
jest.mock('@/modules/fiis/fiis.dao', () => ({
	FiisDAO: {
		listar: jest.fn(),
		buscarPorTicker: jest.fn(),
		buscarPorId: jest.fn(),
		inserir: jest.fn(),
		atualizarDados: jest.fn(),
		remover: jest.fn(),
	},
}))

const fiiExemplo = {
	id: 1,
	ticker: 'MXRF11',
	nome: 'MAXI RENDA',
	cotacao: 10,
	dividendo: 0.1,
	dataCom: '01/06/2026',
	dataPagamento: '15/06/2026',
	dyMensal: 1,
	dyAnual: 12,
	quantidadeCotas: 100,
	atualizadoEm: '2026-06-02 12:00:00',
	criadoEm: '2026-06-02 12:00:00',
}

describe('Teste de fiis', () => {
	const app = new App()

	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	describe('GET /api/fiis', () => {
		it('deve listar as FIIs cadastradas', async () => {
			jest.mocked(FiisDAO.listar).mockResolvedValue([fiiExemplo])

			const response = await app.server.inject({
				method: 'GET',
				url: '/api/fiis',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(1)
		})
	})
})
