import 'dotenv/config'
import z from 'zod'

const schema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(3000),

	DB_FILE: z.string().default('./financias.sqlite'),
})

export const env = schema.parse(process.env)
