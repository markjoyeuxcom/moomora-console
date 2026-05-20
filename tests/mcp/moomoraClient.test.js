import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoomoraClient } from '../../mcp/moomoraClient.js';
import { MoomoraApiError, MoomoraUnavailableError } from '../../mcp/errors.js';

function jsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}

function recordingFetch(response) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, options });
    if (typeof response === 'function') return response(url, options);
    return response;
  };
  fn.calls = calls;
  return fn;
}

const BASE = 'http://127.0.0.1:3000';

test('listDocuments builds query string and omits empty params', async () => {
  const fetch = recordingFetch(jsonResponse(200, [{ id: 'd1' }]));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  const docs = await client.listDocuments({ q: 'backup', context: 'homelab', documentType: undefined });
  assert.deepEqual(docs, [{ id: 'd1' }]);
  const url = new URL(fetch.calls[0].url);
  assert.equal(url.pathname, '/api/library/documents');
  assert.equal(url.searchParams.get('q'), 'backup');
  assert.equal(url.searchParams.get('context'), 'homelab');
  assert.equal(url.searchParams.has('documentType'), false);
  assert.equal(fetch.calls[0].options.method, 'GET');
});

test('adds Authorization header only when a token is set', async () => {
  const withToken = recordingFetch(jsonResponse(200, []));
  await createMoomoraClient({ baseUrl: BASE, token: 'secret', fetch: withToken }).listTasks({});
  assert.equal(withToken.calls[0].options.headers.authorization, 'Bearer secret');

  const noToken = recordingFetch(jsonResponse(200, []));
  await createMoomoraClient({ baseUrl: BASE, fetch: noToken }).listTasks({});
  assert.equal(noToken.calls[0].options.headers.authorization, undefined);
});

test('createDocument POSTs a JSON body and returns the created doc', async () => {
  const fetch = recordingFetch(jsonResponse(201, { id: 'd9', title: 'New' }));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  const doc = await client.createDocument({ title: 'New', body: 'b', documentType: 'note', context: 'work' });
  assert.deepEqual(doc, { id: 'd9', title: 'New' });
  assert.equal(fetch.calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(fetch.calls[0].options.body), {
    title: 'New', body: 'b', documentType: 'note', context: 'work',
  });
});

test('getDocument lists then finds by id, returning null when absent', async () => {
  const fetch = recordingFetch(jsonResponse(200, [{ id: 'a' }, { id: 'b' }]));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  assert.deepEqual(await client.getDocument('b'), { id: 'b' });

  const fetch2 = recordingFetch(jsonResponse(200, [{ id: 'a' }]));
  const client2 = createMoomoraClient({ baseUrl: BASE, fetch: fetch2 });
  assert.equal(await client2.getDocument('zzz'), null);
});

test('updateDocument returns null on 404', async () => {
  const fetch = recordingFetch(jsonResponse(404, { message: 'document not found' }));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  assert.equal(await client.updateDocument('x', { title: 'y' }), null);
});

test('linkTaskDocument posts documentId in the body', async () => {
  const fetch = recordingFetch(jsonResponse(201, { linked: true }));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  await client.linkTaskDocument('t1', 'd1');
  const call = fetch.calls[0];
  assert.match(new URL(call.url).pathname, /\/api\/tasks\/t1\/documents$/);
  assert.deepEqual(JSON.parse(call.options.body), { documentId: 'd1' });
});

test('unlinkTaskDocument issues DELETE and tolerates 204 (null body)', async () => {
  const fetch = recordingFetch(jsonResponse(204, undefined));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  const res = await client.unlinkTaskDocument('t1', 'd1');
  assert.equal(res, null);
  assert.equal(fetch.calls[0].options.method, 'DELETE');
});

test('non-2xx (non-404) responses throw MoomoraApiError with status and message', async () => {
  const fetch = recordingFetch(jsonResponse(400, { message: 'title is required' }));
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  await assert.rejects(
    () => client.createDocument({}),
    (err) => err instanceof MoomoraApiError && err.status === 400 && err.message === 'title is required',
  );
});

test('fetch rejection maps to MoomoraUnavailableError', async () => {
  const fetch = async () => { throw new TypeError('fetch failed'); };
  const client = createMoomoraClient({ baseUrl: BASE, fetch });
  await assert.rejects(
    () => client.listTasks({}),
    (err) => err instanceof MoomoraUnavailableError && /not reachable/.test(err.message),
  );
});
