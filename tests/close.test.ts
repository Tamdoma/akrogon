import { test, expect } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { fixture, cli, fakeGh, type Fixture, type GhFixture } from './helpers';
import type { Result } from '../src/shell';

function calls(gh: GhFixture): { args: string[]; cwd: string }[] {
  return readFileSync(gh.db + '.calls', 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.object({ args: z.array(z.string()), cwd: z.string() }).parse(JSON.parse(line)));
}

test('close posts the exact delivered comment and closes an open issue', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const by = 'leaf example (commit abc123)';
    writeFileSync(gh.db + '.state', JSON.stringify({ state: 'OPEN', comments: [], attempts: 0 }));
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '', stateful: true },
        { stdout: '', stateful: true },
      ]),
    );
    const result: Result = await cli(f, ['close', 'acme/project#4', '--by', by], f.root, gh.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(`closed acme/project#4 with delivered by ${by}`);
    expect(JSON.parse(readFileSync(gh.db + '.state', 'utf8'))).toEqual({
      state: 'CLOSED',
      comments: [`delivered by ${by}`],
      attempts: 1,
    });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    const seen = calls(gh);
    expect(seen).toHaveLength(2);
    expect(seen[0].args).toEqual(['issue', 'view', '-R', 'acme/project', '4', '--json', 'state']);
    expect(seen[1].args).toEqual(['issue', 'close', '-R', 'acme/project', '4', '--comment', `delivered by ${by}`]);
    expect(seen.every((call) => call.cwd === f.root)).toBe(true);
  } finally {
    f.clean();
  }
});

test('close on an already closed issue succeeds without a close call', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    writeFileSync(gh.db + '.state', JSON.stringify({ state: 'CLOSED', comments: [], attempts: 0 }));
    writeFileSync(gh.db, JSON.stringify([{ stdout: '', stateful: true }]));
    const result: Result = await cli(f, ['close', 'acme/project#5', '--by', 'leaf x'], f.root, gh.env);
    expect(result.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    const seen = calls(gh);
    expect(seen).toHaveLength(1);
    expect(seen[0].args[1]).toBe('view');
    expect(JSON.parse(readFileSync(gh.db + '.state', 'utf8'))).toEqual({
      state: 'CLOSED',
      comments: [],
      attempts: 0,
    });
  } finally {
    f.clean();
  }
});

test('close retry finds the posted comment and closes without duplicating it', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    const by = 'acme/project#9';
    writeFileSync(gh.db + '.state', JSON.stringify({ state: 'OPEN', comments: [], attempts: 0 }));
    writeFileSync(
      gh.db,
      JSON.stringify([
        { stdout: '', stateful: true },
        { stdout: '', stateful: true, code: 1, stderr: 'close failed after comment' },
        { stdout: '', stateful: true },
        { stdout: '', stateful: true },
        { stdout: '', stateful: true },
      ]),
    );
    const result: Result = await cli(f, ['close', 'acme/project#6', '--by', by], f.root, gh.env);
    expect(result.code).toBe(0);
    expect(JSON.parse(readFileSync(gh.db + '.state', 'utf8'))).toEqual({
      state: 'CLOSED',
      comments: [`delivered by ${by}`],
      attempts: 2,
    });
    expect(JSON.parse(readFileSync(gh.db, 'utf8'))).toEqual([]);
    const seen = calls(gh);
    expect(seen.map((call) => call.args)).toEqual([
      ['issue', 'view', '-R', 'acme/project', '6', '--json', 'state'],
      ['issue', 'close', '-R', 'acme/project', '6', '--comment', `delivered by ${by}`],
      ['issue', 'view', '-R', 'acme/project', '6', '--json', 'state'],
      ['api', '--hostname', 'github.com', 'repos/acme/project/issues/6/comments?per_page=100', '--paginate', '--slurp'],
      ['issue', 'close', '-R', 'acme/project', '6'],
    ]);
    expect(JSON.parse(result.stderr)).toMatchObject({ warning: expect.any(String), source: 'acme/project#6' });
  } finally {
    f.clean();
  }
});

test('close rejects blank by, invalid identity and extra positional without a gh call', async () => {
  for (const args of [
    ['close', 'acme/project#7', '--by', '   '],
    ['close', 'acme/project#7'],
    ['close', 'not-an-identity', '--by', 'x'],
    ['close', 'acme/project#0', '--by', 'x'],
    ['close', 'acme/project#7', 'acme/project#8', '--by', 'x'],
  ]) {
    const f: Fixture = await fixture();
    try {
      const gh: GhFixture = fakeGh(f);
      const result: Result = await cli(f, args, f.root, gh.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr.length).toBeGreaterThan(0);
      expect(existsSync(gh.db + '.calls')).toBe(false);
    } finally {
      f.clean();
    }
  }
});
