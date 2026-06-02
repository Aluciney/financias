import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('fiis', (table) => {
		table.increments('id').primary()
		table.string('ticker').notNullable().unique()
		table.string('nome').notNullable().defaultTo('')
		table.float('cotacao').notNullable().defaultTo(0)
		table.float('dividendo').notNullable().defaultTo(0)
		table.string('data_com').notNullable().defaultTo('')
		table.string('data_pagamento').notNullable().defaultTo('')
		table.float('dy_mensal').notNullable().defaultTo(0)
		table.float('dy_anual').notNullable().defaultTo(0)
		table.timestamp('atualizado_em').nullable()
		table.timestamp('criado_em').notNullable().defaultTo(knex.fn.now())
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('fiis')
}
