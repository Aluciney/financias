import { z } from 'zod'

const fii = z.object({
	id: z.number(),
	ticker: z.string(),
	nome: z.string(),
	cotacao: z.number(),
	dividendo: z.number(),
	dataCom: z.string(),
	dataPagamento: z.string(),
	dyMensal: z.number(),
	dyAnual: z.number(),
	atualizadoEm: z.string().nullable(),
	criadoEm: z.string(),
})

const erro = z.object({
	statusCode: z.number(),
	error: z.string(),
	message: z.string(),
})

export const FiisSchema = {
	listar: {
		Response: {
			200: z.array(fii),
		},
	},
	listarPaginado: {
		Query: z.object({
			page: z.coerce.number().int().positive().default(1),
			perPage: z.coerce.number().int().positive().max(100).default(10),
		}),
		Response: {
			200: z.object({
				data: z.array(fii),
				total: z.number(),
				perPage: z.number(),
				currentPage: z.number(),
				lastPage: z.number(),
			}),
		},
	},
	cadastrar: {
		Body: z.object({
			ticker: z
				.string()
				.trim()
				.min(1, 'Informe o ticker da FII')
				.transform((value) => value.toUpperCase()),
		}),
		Response: {
			201: fii,
			400: erro,
			404: erro,
		},
	},
	atualizar: {
		Response: {
			200: z.object({
				atualizadas: z.number(),
				falhas: z.array(z.object({ ticker: z.string(), motivo: z.string() })),
				fiis: z.array(fii),
			}),
		},
	},
	remover: {
		Params: z.object({
			id: z.coerce.number(),
		}),
		Response: {
			200: z.object({ id: z.number() }),
			404: erro,
		},
	},
} satisfies ModuleSchema

export type FiisSchemaType = {
	listar: InferModuleSchema<typeof FiisSchema.listar>
	listarPaginado: InferModuleSchema<typeof FiisSchema.listarPaginado>
	cadastrar: InferModuleSchema<typeof FiisSchema.cadastrar>
	atualizar: InferModuleSchema<typeof FiisSchema.atualizar>
	remover: InferModuleSchema<typeof FiisSchema.remover>
}

export type Fii = z.infer<typeof fii>
