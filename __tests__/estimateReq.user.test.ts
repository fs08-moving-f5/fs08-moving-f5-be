import request from 'supertest';
import app from '../src/app';

import { ServiceEnum } from '../src/generated/enums';
import * as estimateService from '../src/api/estimateRequest/user/estimateReq.user.service';
import { authenticate, requireUser } from '../src/middlewares/authMiddleware';

jest.mock('@/api/estimateRequest/user/estimateReq.user.service');
jest.mock('@/middlewares/authMiddleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = { id: 'user-1' };
    next();
  }),
  requireUser: jest.fn((req, _res, next) => {
    req.user = { id: 'user-1' };
    next();
  }),
}));

const mockedService = estimateService as any;

const setAuthUser = (id = 'user-1') => {
  (authenticate as any).mockImplementation((req, _res, next) => {
    req.user = { id };
    next();
  });
  (requireUser as any).mockImplementation((req, _res, next) => {
    req.user = { id };
    next();
  });
};

const setAuthNone = () => {
  (authenticate as any).mockImplementation((req, _res, next) => next());
  (requireUser as any).mockImplementation((req, _res, next) => next());
};

const validAddress = {
  address: '서울특별시 중구 세종대로 110',
  zoneCode: 12345,
  addressEnglish: '110, Sejong-daero, Jung-gu, Seoul',
  sido: '서울특별시',
  sidoEnglish: 'Seoul',
  sigungu: '중구',
  sigunguEnglish: 'Jung-gu',
};

describe('estimateRequest/user API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthUser();
  });

  it('GET /pending returns in-progress requests', async () => {
    mockedService.getEstimateRequestsInProgressService.mockResolvedValue([{ id: 'req-1' }] as any);

    const res = await request(app).get('/api/estimate-request/user/pending');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /pending returns 401 when user is missing', async () => {
    setAuthNone();

    const res = await request(app).get('/api/estimate-request/user/pending');

    expect(res.status).toBe(401);
  });

  it('POST /request returns 400 when body is missing', async () => {
    const res = await request(app).post('/api/estimate-request/user/request').send({});

    expect(res.status).toBe(400);
  });

  it('POST /request creates an estimate request', async () => {
    mockedService.createEstimateRequestService.mockResolvedValue({ id: 'req-1' } as any);

    const res = await request(app).post('/api/estimate-request/user/request').send({
      movingType: ServiceEnum.HOME_MOVING,
      movingDate: new Date().toISOString(),
      from: validAddress,
      to: validAddress,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('req-1');
  });

  it('POST /request/designated returns 400 when designatedDriverId is missing', async () => {
    const res = await request(app).post('/api/estimate-request/user/request/designated').send({});

    expect(res.status).toBe(400);
  });

  it('POST /request/designated updates to designated request', async () => {
    mockedService.createDesignatedEstimateRequestService.mockResolvedValue({
      id: 'req-2',
    } as any);

    const res = await request(app)
      .post('/api/estimate-request/user/request/designated')
      .send({ designatedDriverId: 'driver-1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('req-2');
  });

  it('POST /request/geocode returns 400 on invalid body', async () => {
    const res = await request(app).post('/api/estimate-request/user/request/geocode').send({});

    expect(res.status).toBe(400);
  });

  it('POST /request/geocode creates a request with geocode', async () => {
    mockedService.createEstimateRequestWithGeocodeService.mockResolvedValue({
      id: 'req-3',
    } as any);

    const res = await request(app).post('/api/estimate-request/user/request/geocode').send({
      movingType: ServiceEnum.HOME_MOVING,
      movingDate: new Date().toISOString(),
      from: validAddress,
      to: validAddress,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('req-3');
  });
});
