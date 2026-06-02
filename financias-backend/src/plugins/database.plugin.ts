import fp from 'fastify-plugin'
import { knexFinancias } from '@/libs/knex'

export const databasePlugin = fp(async (app) => {
	const trx = knexFinancias

	// Garante que o schema (migrations) esteja aplicado ao subir o servidor
	await trx.migrate.latest()

	app.decorate('trx', trx)

	app.addHook('onClose', async () => {
		await trx.destroy()
	})
})
