import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    estimate_requests: {
      executor: 'constant-vus',
      vus: 30,
      duration: '60s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.gomoving.shop/api';
const TOKEN = __ENV.DRIVER_TOKEN; // 기사 JWT

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    tags: { name: 'GET /estimate-request/driver/requests' },
  };

  const query = [
    'sort=latest',
    'take=6',
    // cursor는 실제 무한스크롤 상황을 흉내 내기 위해 랜덤 or 고정 가능
  ].join('&');

  const res = http.get(
    `${BASE_URL}/estimate-request/driver/requests?${query}`,
    params,
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => {
      try {
        return JSON.parse(r.body).data?.requests?.length >= 0;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
