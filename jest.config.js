/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest', // ts-jest 사용
  testEnvironment: 'node', // Node 환경
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // @ 경로 매핑
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/tests/**/*.test.ts'], // 테스트 파일 패턴
};
