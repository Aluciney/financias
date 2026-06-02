import type { FiisSchemaType } from '@/modules/fiis/fiis.schema'
import { FiisService } from '@/modules/fiis/fiis.service'
import type { TypedReply, TypedRequest } from '@/types'

const fiisService = new FiisService()

type ListarRequest = FiisSchemaType['listar']
type ListarPaginadoRequest = FiisSchemaType['listarPaginado']
type CadastrarRequest = FiisSchemaType['cadastrar']
type AtualizarRequest = FiisSchemaType['atualizar']
type RemoverRequest = FiisSchemaType['remover']

export class FiisController {
	async listar(request: TypedRequest<ListarRequest>, reply: TypedReply<ListarRequest>) {
		const trx = request.server.trx
		const resultado = await fiisService.listar(trx)

		return reply.status(200).send(resultado)
	}

	async listarPaginado(request: TypedRequest<ListarPaginadoRequest>, reply: TypedReply<ListarPaginadoRequest>) {
		const trx = request.server.trx
		const resultado = await fiisService.listarPaginado(trx, request.query)

		return reply.status(200).send(resultado)
	}

	async cadastrar(request: TypedRequest<CadastrarRequest>, reply: TypedReply<CadastrarRequest>) {
		const trx = request.server.trx
		const resultado = await fiisService.cadastrar(trx, request.body)

		return reply.status(201).send(resultado)
	}

	async atualizar(request: TypedRequest<AtualizarRequest>, reply: TypedReply<AtualizarRequest>) {
		const trx = request.server.trx
		const resultado = await fiisService.atualizar(trx)

		return reply.status(200).send(resultado)
	}

	async remover(request: TypedRequest<RemoverRequest>, reply: TypedReply<RemoverRequest>) {
		const trx = request.server.trx
		const resultado = await fiisService.remover(trx, request.params)

		return reply.status(200).send(resultado)
	}
}
