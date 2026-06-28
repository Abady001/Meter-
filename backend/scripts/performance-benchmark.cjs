/**
 * Meter Verse — Performance Benchmark Script
 * 
 * Run: node scripts/performance-benchmark.cjs
 * 
 * Benchmarks key API endpoints for response time,
 * then generates a report.
 */

const http = require('http');
const BASE = 'http://localhost:3001/api/v1';
const ENDPOINTS = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'Areas', path: '/areas', method: 'GET' },
  { name: 'Customers', path: '/projects/test/customers', method: 'GET' },
  { name: 'Meters', path: '/meters', method: 'GET' },
  { name: 'Invoices', path: '/invoices', method: 'GET' },
  { name: 'Payments', path: '/payments', method: 'GET' },
  { name: 'Readings', path: '/readings', method: 'GET' },
  { name: 'Tickets', path: '/tickets', method: 'GET' },
  { name: 'Notifications', path: '/notifications', method: 'GET' },
  { name: 'Tariffs', path: '/tariffs', method: 'GET' },
  { name: 'Search', path: '/search?q=test', method: 'GET' },
  { name: 'Sync Status', path: '/sync/status/AREA-1', method: 'GET' },
];

async function benchmark() {
  console.log('=== Meter Verse Performance Benchmark ===\n');
  console.log(`${'Endpoint'.padEnd(25)} ${'Avg (ms)'.padEnd(10)} ${'Min (ms)'.padEnd(10)} ${'Max (ms)'.padEnd(10)} ${'Success'.padEnd(8)}`);
  console.log('-'.repeat(65));

  const results = [];

  for (const ep of ENDPOINTS) {
    const times = [];
    let successes = 0;
    const RUNS = 5;

    for (let i = 0; i < RUNS; i++) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE}${ep.path}`);
        const elapsed = Date.now() - start;
        times.push(elapsed);
        if (res.ok) successes++;
      } catch {
        times.push(-1);
      }
    }

    const valid = times.filter(t => t >= 0);
    const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : -1;
    const min = valid.length ? Math.min(...valid) : -1;
    const max = valid.length ? Math.max(...valid) : -1;
    const successRate = `${successes}/${RUNS}`;

    results.push({ name: ep.name, avg, min, max, successRate });
    console.log(`${ep.name.padEnd(25)} ${String(avg).padEnd(10)} ${String(min).padEnd(10)} ${String(max).padEnd(10)} ${successRate.padEnd(8)}`);
  }

  console.log('\n--- Summary ---');
  const overallAvg = results.filter(r => r.avg >= 0).reduce((s, r) => s + r.avg, 0) / results.filter(r => r.avg >= 0).length;
  console.log(`Overall average response time: ${Math.round(overallAvg)}ms`);
  console.log(`Endpoints tested: ${results.length}`);
  console.log(`Endpoints passing: ${results.filter(r => r.successRate.startsWith('5')).length}`);
}

benchmark().catch(console.error);
