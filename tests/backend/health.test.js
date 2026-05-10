import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../server/index.js';

test('GET /healthz returns ok', async () => {
  const app = await buildApp({ skipDb: true });
  const response = await app.inject({ method: 'GET', url: '/healthz' });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });

  await app.close();
});

test('GET /readyz reports ready when database check succeeds', async () => {
  const app = await buildApp({
    db: { checkReady: async () => true },
  });
  const response = await app.inject({ method: 'GET', url: '/readyz' });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ready' });

  await app.close();
});
