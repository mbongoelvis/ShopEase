import autocannon from 'autocannon';

const BASE_URL = 'http://localhost:5000';

const endpoints = [
  '/products',
  '/analytics/revenue',
  '/analytics/turnover',
  '/analytics/security-flags',
  '/admin/tenants',
  '/admin/analytics',
  '/admin/billing',
  '/admin/support-tickets',
  '/billing/me',
  '/categories',
];

async function runTest(endpoint) {
  const url = `${BASE_URL}${endpoint}`;

  const result = await autocannon({
    url,
    connections: 100,
    duration: 10,
    pipelining: 10,
    amount: 1000,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmZiMjFiNS1kMTJmLTQ0NjEtYmUzNS03NzYzOGUzOTFlY2EiLCJyb2xlIjoiT1dORVIiLCJzdG9yZUlkIjoiMTNlYjQxNTItMDYzYi00Mjg5LTgwZTMtNGIyZGMyMWU0Njg4IiwiYWNjb3VudFR5cGUiOiJURU5BTlQiLCJpYXQiOjE3ODcyMzg0MzYsImV4cCI6MTc4NzI4MTYzNn0.yz9ZSvEU97q3kvlVyrOEIaCzKgo6GMm7euoxtwFZcFk',
      'Content-Type': 'application/json',
    },
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ENDPOINT: ${endpoint}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Requests completed: ${result.requests.total}`);
  console.log(`Avg latency:        ${result.latency.average} ms`);
  console.log(`Max latency:        ${result.latency.max} ms`);
  console.log(`Avg req/sec:        ${result.requests.average}`);
  console.log(`Errors:             ${result.errors}`);
  console.log(`Timeouts:           ${result.timeouts}`);
  console.log(`2xx responses:      ${result['2xx']}`);
  console.log(`Non-2xx responses:  ${result.non2xx}`);

  return result;
}

async function main() {
  console.log(`\nLoad Test: 1000 GET requests per endpoint`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Endpoints: ${endpoints.length}`);
  console.log(`Total requests: ~${endpoints.length * 1000}\n`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await runTest(endpoint);
    results.push({ endpoint, result });
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`${'Endpoint'.padEnd(30)} | ${'Req/s'.padEnd(8)} | ${'Avg ms'.padEnd(8)} | 2xx`);
  console.log(`${'-'.repeat(30)}-|-${'-'.repeat(8)}-|-${'-'.repeat(8)}-|--------`);

  for (const { endpoint, result } of results) {
    console.log(
      `${endpoint.padEnd(30)} | ${String(result.requests.average).padEnd(8)} | ${String(result.latency.average).padEnd(8)} | ${result['2xx']}`
    );
  }
}

main().catch(console.error);
