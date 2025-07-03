module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '.*\\.test\\.(ts|tsx)$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Alias mapping
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
};
