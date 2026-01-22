import request from 'supertest';
import app from '../src/app';

describe('MyPage API', () => {
  it('GET /api/my-page -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/my-page');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });

  it('GET /api/my-page/reviews -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/my-page/reviews');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });
});
