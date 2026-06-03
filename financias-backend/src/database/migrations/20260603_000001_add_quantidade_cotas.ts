import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('fiis', (table) => {
		table.integer('quantidade_cotas').notNullable().defaultTo(0)
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('fiis', (table) => {
		table.dropColumn('quantidade_cotas')
	})
}
