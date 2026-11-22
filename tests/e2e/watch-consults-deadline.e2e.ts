import { expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { required } from './tier';
import { absent } from './watch-tier';

test('watch-consults stops a nonresponsive watcher at the reserved deadline', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'd-'));
  const bin: string = join(root, 'bin');
  const tierRoot: string = join(root, 't');
  mkdirSync(bin);
  mkdirSync(tierRoot);
  writeFileSync(
    join(bin, 'pi'),
    `#!/bin/sh
set -eu
for name in first replacement; do
  started=$(hc run --bg --json --name "$name" --label akrogon.watch-consult=akre2e -- sleep 180)
  address=$(printf '%s' "$started" | bun -e 'console.log(JSON.parse(await Bun.stdin.text()).address)')
  hc kill "$address"
  hc rm "$address"
done
touch "$(dirname "$0")/launched"
exec sleep 180
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, 'agy'), '#!/bin/sh\nexit 97\n', { mode: 0o755 });
  try {
    const started: number = performance.now();
    const result: SpawnResult = await spawnCaptured(
      [process.execPath, 'test', resolve(import.meta.dir, 'watch-consults.e2e.ts')],
      {
        env: {
          ...process.env,
          PATH: `${bin}:${required('PATH')}`,
          AKROGON_E2E: 'watch-consults',
          AKROGON_E2E_ROOT: tierRoot,
          AKROGON_E2E_OUT: join(root, 'evidence'),
          AKROGON_SESSIONS: '2',
          AKROGON_SESSION_MINUTES: '1',
        },
      },
    );
    expect(existsSync(join(bin, 'launched')), `${result.stdout}\n${result.stderr}`).toBe(true);
    expect(result.code).toBe(1);
    expect(absent()).toEqual([]);
    expect(performance.now() - started).toBeLessThan(90_000);
    const usage = z
      .object({ watcher: z.string(), consultants: z.array(z.string()), sessions: z.number() })
      .parse(JSON.parse(readFileSync(join(root, 'evidence', 'paid-sessions.json'), 'utf8')));
    expect(new Set([usage.watcher, ...usage.consultants]).size).toBe(3);
    expect(usage.sessions).toBe(3);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 180_000);
