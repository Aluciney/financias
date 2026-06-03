import { App } from '@/app'
import { logger } from '@/libs/logger'

async function bootstrap() {
	try {
		const app = new App()
		await app.ready()
		await app.listen()
	} catch (error) {
		logger.fatal({ err: error }, 'Falha ao iniciar a aplicação')
		process.exit(1)
	}
}

bootstrap()
