import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  it('POST /api/auth/signup -> 400 validation error (invalid body)', async () => {
    const res = await request(app).post('/api/auth/signup').send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      message: 'Validation failed',
      statusCode: 400,
    });
  });

  it('POST /api/auth/login -> 400 validation error (invalid body)', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      message: 'Validation failed',
      statusCode: 400,
    });
  });

  it('GET /api/auth/me -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });

  it('GET /api/auth/oauth/:provider -> 400 for unsupported provider', async () => {
    const res = await request(app).get('/api/auth/oauth/not-supported');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      message: '지원하지 않는 소셜 로그인 제공자입니다',
      statusCode: 400,
    });
  });
});
