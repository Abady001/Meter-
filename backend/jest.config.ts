import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage'
};

export default config;
