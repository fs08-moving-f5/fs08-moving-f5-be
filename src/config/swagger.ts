import swaggerJSDoc from 'swagger-jsdoc';
import { existsSync } from 'fs';
import { join } from 'path';

// 런타임에 dist 폴더가 존재하는지 확인 (Docker/프로덕션 환경)
// 빌드된 파일이 있으면 dist 경로 사용, 없으면 src 경로 사용 (개발 환경)
const isBuilt = existsSync(join(process.cwd(), 'dist', 'api'));

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Moving API', version: '1.0.0' },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // 라우트 주석 스캔 경로들(필요시 추가)
  // 빌드된 파일이 있으면 dist 경로, 없으면 src 경로 사용
  apis: isBuilt
    ? ['dist/api/**/*.routes.js', 'dist/api/**/*.docs.js', 'dist/api/**/*.swagger.js']
    : ['src/api/**/*.routes.ts', 'src/api/**/*.docs.ts', 'src/api/**/*.swagger.ts'],
};

let swaggerSpec: any;

try {
  swaggerSpec = swaggerJSDoc(options);
  console.log(`✅ Swagger spec generated successfully (using ${isBuilt ? 'dist' : 'src'} paths)`);
} catch (error) {
  console.error('❌ Failed to generate Swagger spec:', error);
  throw error;
}

export { swaggerSpec };
