import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	clearMocks: true,
	collectCoverage: false,
	testEnvironment: 'node',
	testMatch: ['**/*.test.ts', '**/*.spec.ts'],
	testTimeout: 15000,
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@root/(.*)$': '<rootDir>/$1',
	},
}

export default config
