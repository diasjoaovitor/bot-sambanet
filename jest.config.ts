export default {
  preset: 'ts-jest',
  testRegex: '((\\.|/*.)(test))\\.ts?$',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/index.ts'],
  coverageDirectory: 'coverage',
  modulePaths: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
