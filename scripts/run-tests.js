import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collectTestFiles(path) {
  if (!existsSync(path)) return [path];
  const stats = statSync(path);
  if (!stats.isDirectory()) return [path];

  return readdirSync(path)
    .flatMap(entry => collectTestFiles(join(path, entry)))
    .filter(file => file.endsWith('.test.js'));
}

const args = process.argv.slice(2);
const testTargets = args.length === 0 ? [] : args.flatMap(collectTestFiles);
const result = spawnSync(process.execPath, ['--test', ...testTargets], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
