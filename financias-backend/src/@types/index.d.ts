import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		trx: import('knex').Knex
	}
}
