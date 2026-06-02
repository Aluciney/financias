import path from 'node:path'
import type { Knex } from 'knex'
import { env } from '@/env'

export const knexfile: { financias: Knex.Config } = {
	financias: {
		client: 'better-sqlite3',
		connection: {
			filename: path.resolve(process.cwd(), env.DB_FILE),
		},
		useNullAsDefault: true,
		migrations: {
			directory: path.resolve(__dirname, 'src/database/migrations'),
			extension: 'ts',
		},
		pool: {
			afterCreate: (conn: { pragma: (sql: string) => void }, done: (err: Error | null) => void) => {
				conn.pragma('journal_mode = WAL')
				done(null)
			},
		},
	},
}
