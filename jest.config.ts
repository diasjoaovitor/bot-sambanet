export default {
  preset: 'ts-jest',
  testRegex: '((\\.|/*.)(test))\\.ts?$',
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
