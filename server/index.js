import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { loadConfig } from './config.js';
import { createDb } from './db.js';

export async function buildApp(options = {}) {
  const config = options.config || loadConfig();
  const app = Fastify({ logger: options.logger || false });
  const db = options.db || (options.skipDb ? null : createDb(config.databaseUrl));

  app.decorate('db', db);

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/readyz', async (_request, reply) => {
    try {
      if (db) await db.checkReady();
      return { status: 'ready' };
    } catch {
      reply.code(503);
      return { status: 'not-ready' };
    }
  });

  await app.register(fastifyStatic, {
    root: config.publicDir,
    prefix: '/',
  });

  app.addHook('onClose', async () => {
    if (db?.close) await db.close();
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildApp({ config, logger: true });
  await app.listen({ host: config.host, port: config.port });
}
