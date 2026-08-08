import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/health');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has service field': (r) => r.json('service') === 'gradture-backend',
    'has checks field': (r) => r.json('checks') !== undefined,
  });

  sleep(1);
}
