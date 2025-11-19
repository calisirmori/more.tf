module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/parser-v2/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'parser-v2/src/**/*.ts',
    '!parser-v2/src/**/*.d.ts',
    '!parser-v2/src/types/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        esModuleInterop: true,
        skipLibCheck: true,
      },
    }],
  },
};
