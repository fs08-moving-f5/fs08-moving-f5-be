/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm', // ts-jest 사용
  testEnvironment: 'node', // Node 환경
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // @ 경로 매핑
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  clearMocks: true,
  testTimeout: 10000, // 10초 타임아웃 (DB/Redis 연결 테스트용)
  // 테스트 환경 변수 명시적 설정
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
