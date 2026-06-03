import 'dotenv/config'
import z from 'zod'

const schema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(3000),

	DB_FILE: z.string().default('./financias.sqlite'),

	// nível mínimo de log (pino): fatal | error | warn | info | debug | trace | silent
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

export const env = schema.parse(process.env)
