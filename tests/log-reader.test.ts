import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { command, quote, spawnCaptured } from '../src/shell';
import { fakeAkrogon, fixture, leaf, registerTemp, yaml, type Fixture } from './helpers';

const BYTES: Buffer = Buffer.from([0, 13, 255, 65, 10, 66]);

function writeLog(path: string, data: Buffer = BYTES): void {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, data);
}

async function packEvidence(ownerDir: string, members: Record<string, Buffer>): Promise<void> {
  mkdirSync(ownerDir, { recursive: true });
  const bytes: Uint8Array = await new Bun.Archive(members).bytes();
  writeFileSync(resolve(ownerDir, 'evidence.tar.zst'), Bun.zstdCompressSync(bytes, { level: 19 }));
}

const shims: WeakMap<Fixture, NodeJS.ProcessEnv> = new WeakMap();
function shimEnv(f: Fixture): NodeJS.ProcessEnv {
  let env: NodeJS.ProcessEnv | undefined = shims.get(f);
  if (env === undefined) {
    env = fakeAkrogon(f).env;
    shims.set(f, env);
  }
  return env;
}

async function logRun(f: Fixture, arg: string, cwd: string): Promise<{ code: number; bytes: Buffer; stderr: string }> {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'log-reader-')));
  const out: string = resolve(dir, 'out');
  const err: string = resolve(dir, 'err');
  const result = await spawnCaptured(['sh', '-c', `akrogon log ${quote(arg)} >${quote(out)} 2>${quote(err)}`], {
    cwd,
    env: { ...process.env, ...shimEnv(f), HOME: f.home, AKROGON_HOME: f.home },
  });
  return {
    code: result.code,
    bytes: result.code === 0 ? readFileSync(out) : Buffer.alloc(0),
    stderr: readFileSync(err, 'utf8'),
  };
}

test('log prints plain log bytes from any checkout path form', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const dir: string = leaf(f, 'owner', 'merge');
    const file: string = resolve(dir, 'check-1.log');
    writeLog(file);
    const nested: string = resolve(dir, 'issues/chart/c/direct/nested/issues/check-x.log');
    writeLog(nested);
    const wt: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', wt, '-b', 'wt-branch'], f.root);
    const rel: string = 'issues/open/issue/owner/check-1.log';
    const cases: [string, string][] = [
      [file, f.root],
      [resolve(wt, rel), f.root],
      [rel, f.root],
      ['check-1.log', dir],
      [resolve(f.root, 'issues/open/issue/owner/issues/chart/c/direct/nested/issues/check-x.log'), f.root],
    ];
    for (const [arg, cwd] of cases) {
      const run = await logRun(f, arg, cwd);
      expect({ arg, code: run.code, stderr: run.stderr }).toEqual({ arg, code: 0, stderr: '' });
      expect(run.bytes.equals(BYTES)).toBe(true);
    }
  } finally {
    f.clean();
  }
});

test('log reads the member of evidence.tar.zst for closed, parked and chart owners', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const openDir: string = leaf(f, 'owner', 'merge');
    writeLog(resolve(openDir, 'check-a.log'));
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/issue'), resolve(f.root, 'issues/closed/issue'));
    const closedDir: string = resolve(f.root, 'issues/closed/issue');
    await packEvidence(closedDir, { 'owner/check-a.log': BYTES });
    rmSync(resolve(closedDir, 'owner/check-a.log'));
    const parkedDir: string = resolve(f.root, 'issues/parked/rested');
    await packEvidence(parkedDir, { 'nested/b.log': BYTES });
    const directDir: string = resolve(f.root, 'issues/chart/big/direct');
    await packEvidence(directDir, { 'check-v.log': BYTES });
    const cases: string[] = [
      'issues/open/issue/owner/check-a.log',
      'issues/parked/rested/nested/b.log',
      'issues/chart/big/direct/check-v.log',
    ];
    for (const arg of cases) {
      const run = await logRun(f, arg, f.root);
      expect({ arg, code: run.code, stderr: run.stderr }).toEqual({ arg, code: 0, stderr: '' });
      expect(run.bytes.equals(BYTES)).toBe(true);
    }
  } finally {
    f.clean();
  }
});

test('log resolves against every registered repo outside one and names matches or the path', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const second: string = resolve(f.home, 'repo2');
    mkdirSync(resolve(second, 'issues/open'), { recursive: true });
    await command(['git', 'init', '-b', 'main', second]);
    yaml(resolve(second, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as {
      repos: Record<string, string>;
    };
    global.repos.repo2 = second;
    writeFileSync(resolve(f.home, 'config.yaml'), Bun.YAML.stringify(global));

    const onlySecond: string = resolve(second, 'issues/open/owner2/leaf/only.log');
    writeLog(onlySecond);
    const shared: string = 'issues/open/shared/leaf/check.log';
    writeLog(resolve(f.root, shared), Buffer.from('first'));
    writeLog(resolve(second, shared), Buffer.from('second'));
    const broken: string = resolve(f.root, 'issues/open/bad/evidence.tar.zst');
    mkdirSync(resolve(f.root, 'issues/open/bad'), { recursive: true });
    writeFileSync(broken, Buffer.from('not a zstd archive'));

    const one: Awaited<ReturnType<typeof logRun>> = await logRun(f, onlySecond, f.home);
    expect({ code: one.code, stderr: one.stderr }).toEqual({ code: 0, stderr: '' });
    expect(one.bytes.equals(BYTES)).toBe(true);

    const ambiguous: Awaited<ReturnType<typeof logRun>> = await logRun(f, shared, f.home);
    expect(ambiguous.code).not.toBe(0);
    expect(ambiguous.stderr).toContain('repo');
    expect(ambiguous.stderr).toContain('repo2');

    const missing: Awaited<ReturnType<typeof logRun>> = await logRun(f, 'issues/open/ghost/leaf/x.log', f.home);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain('issues/open/ghost/leaf/x.log');

    const corrupt: Awaited<ReturnType<typeof logRun>> = await logRun(f, 'issues/open/bad/leaf/check.log', f.home);
    expect(corrupt.code).not.toBe(0);
    expect(corrupt.stderr).toContain('issues/open/bad');
  } finally {
    f.clean();
  }
});

test('docs and skills name akrogon log for recorded check and verify logs', (): void => {
  for (const path of ['README.md', 'skills/learn-issues/SKILL.md', 'skills/merge-issue/SKILL.md']) {
    expect(readFileSync(resolve(import.meta.dir, '..', path), 'utf8')).toContain('akrogon log');
  }
});
