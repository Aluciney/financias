import { FiisController } from '@/modules/fiis/fiis.controller'
import { FiisSchema } from '@/modules/fiis/fiis.schema'
import type { FastifyTypedInstance } from '@/types'

export const fiisRoutes = (app: FastifyTypedInstance) => {
	const fiisController = new FiisController()

	app.get('/', {
		schema: {
			tags: ['fiis'],
			summary: 'Lista as FIIs cadastradas ordenadas pela melhor opção de retorno',
			response: FiisSchema.listar.Response,
		},
		handler: fiisController.listar.bind(fiisController),
	})

	app.get('/paginado', {
		schema: {
			tags: ['fiis'],
			summary: 'Lista as FIIs paginadas no banco (ordenadas pela melhor opção de retorno)',
			querystring: FiisSchema.listarPaginado.Query,
			response: FiisSchema.listarPaginado.Response,
		},
		handler: fiisController.listarPaginado.bind(fiisController),
	})

	app.post('/', {
		schema: {
			tags: ['fiis'],
			summary: 'Cadastra uma nova FII consultando os dados no StatusInvest',
			body: FiisSchema.cadastrar.Body,
			response: FiisSchema.cadastrar.Response,
		},
		handler: fiisController.cadastrar.bind(fiisController),
	})

	app.post('/atualizar', {
		schema: {
			tags: ['fiis'],
			summary: 'Atualiza a situação e o valor de todas as FIIs cadastradas',
			response: FiisSchema.atualizar.Response,
		},
		handler: fiisController.atualizar.bind(fiisController),
	})

	app.delete('/:id', {
		schema: {
			tags: ['fiis'],
			summary: 'Remove uma FII cadastrada',
			params: FiisSchema.remover.Params,
			response: FiisSchema.remover.Response,
		},
		handler: fiisController.remover.bind(fiisController),
	})
}
