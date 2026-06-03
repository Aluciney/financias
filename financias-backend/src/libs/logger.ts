import { pino } from 'pino'
import { env } from '@/env'

const isDev = env.NODE_ENV === 'development'

// Logger único da aplicação. O Fastify usa esta mesma instância (via `loggerInstance`),
// então os logs de request e os logs de negócio (services/libs) saem com o mesmo formato.
// Em dev: saída colorida e legível via pino-pretty. Em produção/teste: JSON estruturado
// (1 linha por log), sem o worker thread do pino-pretty.
export const logger = pino({
	level: env.LOG_LEVEL,
	transport: isDev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
					ignore: 'pid,hostname',
				},
			}
		: undefined,
})

// Cria um logger filho com contexto fixo (ex.: { modulo: 'fiis' }), útil para rastrear a origem do log.
export const criarLogger = (contexto: Record<string, unknown>) => logger.child(contexto)
