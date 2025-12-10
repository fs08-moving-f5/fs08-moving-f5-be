import { defineConfig, env } from 'prisma/config';
import 'dotenv/config'; // 환경 변수 로드

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
