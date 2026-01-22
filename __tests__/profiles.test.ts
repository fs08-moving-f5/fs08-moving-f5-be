import request from 'supertest';
import app from '../src/app';

describe('Profiles API', () => {
  it('GET /api/profile/me -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/profile/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });

  it('POST /api/profile/me/profile-image/presign-put -> 401 when no bearer token', async () => {
    const res = await request(app).post('/api/profile/me/profile-image/presign-put').send({
      contentType: 'image/png',
      fileSize: 123,
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });

  it('GET /api/profile/user -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/profile/user');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });

  it('GET /api/profile/driver -> 401 when no bearer token', async () => {
    const res = await request(app).get('/api/profile/driver');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: '인증 토큰이 필요합니다',
      statusCode: 401,
    });
  });
});
