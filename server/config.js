export function loadConfig(env = process.env) {
  return {
    host: env.HOST || '0.0.0.0',
    port: Number(env.PORT || 3000),
    databaseUrl: env.DATABASE_URL || '',
    publicDir: env.PUBLIC_DIR || new URL('../public', import.meta.url).pathname,
  };
}
