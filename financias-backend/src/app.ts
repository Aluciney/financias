import { fastifyCors } from '@fastify/cors'
import { fastifyHelmet } from '@fastify/helmet'
import { fastifyRateLimit } from '@fastify/rate-limit'
import { fastifySensible } from '@fastify/sensible'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'

import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'

import { env } from '@/env'
import { InstrumentedSema } from '@/libs/sema'
import { databasePlugin } from '@/plugins/database.plugin'
import { errorHandlerPlugin } from '@/plugins/error-handler.plugin'
import { routes } from '@/router'

const isProd = env.NODE_ENV === 'production'

export class App {
	public readonly server = fastify({ logger: !isProd, trustProxy: isProd }).withTypeProvider<ZodTypeProvider>()
	private sema = new InstrumentedSema(200)

	constructor() {
		this.configure()
	}

	private configure() {
		this.registerCompilers()
		this.registerSecurity()
		this.registerPlugins()
		this.registerHooks()
		this.registerSwagger()
		this.registerRoutes()
	}

	private registerCompilers() {
		this.server.setValidatorCompiler(validatorCompiler)
		this.server.setSerializerCompiler(serializerCompiler)
	}

	private registerSecurity() {
		this.server.register(fastifyHelmet, { global: true, contentSecurityPolicy: false })
		this.server.register(fastifyRateLimit, {
			max: 100,
			timeWindow: '1 minute',
			errorResponseBuilder: (_, context) => {
				return {
					statusCode: 429,
					error: 'Too Many Requests',
					message: `Você excedeu o limite de ${context.max} requisições.`,
				}
			},
		})
	}

	private registerPlugins() {
		this.server.register(fastifySensible)
		this.server.register(errorHandlerPlugin)
		this.server.register(databasePlugin)
		this.server.register(fastifyCors, {
			origin: ['*'],
			credentials: false,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		})
	}

	private registerHooks() {
		this.server.addHook('preHandler', async (_request, reply) => {
			const release = await this.sema.acquire()
			let released = false
			const cleanup = () => {
				if (released) return
				released = true
				release()
			}
			reply.raw.once('finish', cleanup)
			reply.raw.once('close', cleanup)
			reply.raw.once('error', cleanup)
		})
	}

	private registerSwagger() {
		this.server.register(fastifySwagger, {
			openapi: {
				info: {
					title: 'Financias - Backend API',
					version: '1.0.0',
				},
			},
			transform: jsonSchemaTransform,
		})
		this.server.register(fastifySwaggerUi, { routePrefix: '/docs' })
	}

	private registerRoutes() {
		this.server.get('/status', {
			config: { rateLimit: false },
			schema: {
				tags: ['sistema'],
				summary: 'Status do servidor e semáforo de concorrência',
			},
			handler: async () => ({
				status: 'ok',
				uptime: process.uptime(),
				timestamp: Date.now(),
				sema: this.sema.stats(),
			}),
		})
		this.server.register(routes, { prefix: '/api' })
	}

	async ready() {
		await this.server.ready()
	}

	async listen() {
		await this.server.listen({ port: env.PORT, host: '0.0.0.0' })
		this.server.log.info(`HTTP Server running on port ${env.PORT}`)
	}

	async close() {
		await this.server.close()
	}
}
