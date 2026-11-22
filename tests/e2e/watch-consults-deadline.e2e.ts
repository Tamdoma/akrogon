import { expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { required } from './tier';
import { absent } from './watch-tier';

test('watch-consults stops a nonresponsive watcher at the reserved deadline', async () => {
  const root: string = mkdtempSync(join(required('AKROGON_E2E_ROOT'), 'd-'));
  const bin: string = join(root, 'bin');
  const tierRoot: string = join(root, 't');
  mkdirSync(bin);
  mkdirSync(tierRoot);
  writeFileSync(join(bin, 'pi'), '#!/bin/sh\ntouch "${0%/*}/launched"\nexec sleep 180\n', { mode: 0o755 });
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
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 180_000);
