import { fiisRoutes } from '@/modules/fiis/fiis.routes'
import type { FastifyTypedInstance } from '@/types'

export async function routes(app: FastifyTypedInstance) {
	app.register(fiisRoutes, { prefix: '/fiis' })
}
