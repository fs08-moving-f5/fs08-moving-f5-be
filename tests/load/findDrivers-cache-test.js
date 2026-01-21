import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    drivers_list_test: {
      executor: 'constant-vus',
      vus: 50,
      duration: '60s',
    },
  },
  thresholds: {
    // 정상 응답(200)만 성능 기준으로 평가
    'http_req_duration{expected_response:true}': ['p(95)<100'],

    // 실패율은 완화된 기준으로 관찰용
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.gomoving.shop/api';

export default function () {
  const res = http.get(
    `${BASE_URL}/drivers?limit=10&region=seoul&sort=review`,
    {
      tags: {
        name: 'GET /drivers',
      },
    },
  );

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // 성공한 요청만 expected_response로 태깅
  if (success) {
    res.tags.expected_response = 'true';
  }

  sleep(1);
}
