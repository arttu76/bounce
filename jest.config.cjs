module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts', // Entry point, tested via integration
    '!src/matter-global.d.ts' // Type definitions only
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 37,
      statements: 36
    }
  },
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^matter-js$': '<rootDir>/tests/__mocks__/matter-js.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
