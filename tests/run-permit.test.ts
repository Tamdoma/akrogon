import { test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  cli,
  entry,
  fakeAkrogon,
  fixture,
  killTree,
  leaf,
  leafTempRoot,
  seedStat,
  statPath,
  storeDir,
  unitBin,
  yaml,
  type Fixture,
} from './helpers';
import { command, type Result } from '../src/shell';

const GIB: number = 1024 * 1024 * 1024;
const LOW: number = GIB;
const HIGH: number = 49 * GIB;

type Proc = Bun.Subprocess<'ignore', 'pipe', 'pipe'>;
type Cap = { proc: Proc; text: () => Promise<string> };
type Event = { kind: string; name?: string; wait_ms?: number };

function run(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): Cap {
  const spawnEnv: NodeJS.ProcessEnv = {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RUN: '',
    ...env,
    PATH: `${unitBin(f)}:${env.PATH ?? process.env.PATH}`,
  };
  const proc: Proc = Bun.spawn([process.execPath, entry, ...args], {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
    env: spawnEnv,
  });
  const chunks: Buffer[] = [];
  void (async () => {
    const reader = proc.stderr.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      chunks.push(Buffer.from(value));
    }
  })();
  void (async () => {
    const reader = proc.stdout.getReader();
    for (;;) {
      const { done } = await reader.read();
      if (done) return;
    }
  })();
  return { proc, text: async () => Buffer.concat(chunks).toString('utf8') };
}

async function waitFor(path: string, ms: number = 20000): Promise<number> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(20);
  }
  return Date.now() - begun;
}

async function waitForAny(paths: string[], ms: number = 20000): Promise<number> {
  const begun: number = Date.now();
  for (;;) {
    const index: number = paths.findIndex((path) => existsSync(path));
    if (index !== -1) return index;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for any of ${paths.join(', ')}`);
    await Bun.sleep(20);
  }
}

const hold = (dir: string, name: string): string[] => [
  'sh',
  '-c',
  `touch ${dir}/${name}.held; while [ ! -e ${dir}/release ]; do sleep 0.05; done`,
];

const touch = (dir: string, name: string): string[] => ['sh', '-c', `touch ${dir}/${name}`];

async function leafWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  leaf(f, slug, 'implement', { worktree });
  return worktree;
}

function marks(f: Fixture): string {
  const dir: string = resolve(f.home, 'marks');
  mkdirSync(dir, { recursive: true });
  return dir;
}

function timings(f: Fixture): Event[] {
  const path: string = resolve(f.root, 'issues/timings.jsonl');
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line) as Event);
}

function stop(caps: Cap[]): void {
  for (const cap of caps) killTree(cap.proc);
}

test('two run-checks in two leaves run at the same time', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const first: string = await leafWorktree(f, 'leaf-one');
    const second: string = await leafWorktree(f, 'leaf-two');
    const a: Cap = run(f, ['run-check', '--name', 'a', '--', ...hold(dir, 'a')], first);
    caps.push(a);
    await waitFor(resolve(dir, 'a.held'));
    const b: Cap = run(f, ['run-check', '--name', 'b', '--', ...touch(dir, 'b')], second);
    caps.push(b);
    // No start spacing: b starts inside the old 30 s window.
    await waitFor(resolve(dir, 'b'), 10000);
    expect(a.proc.exitCode).toBeNull();
    writeFileSync(resolve(dir, 'release'), '');
    expect(await a.proc.exited).toBe(0);
    expect(await b.proc.exited).toBe(0);
    const events: Event[] = timings(f);
    const aStart: Event | undefined = events.find((event) => event.kind === 'check_start' && event.name === 'a');
    const bStart: Event | undefined = events.find((event) => event.kind === 'check_start' && event.name === 'b');
    expect(aStart?.wait_ms ?? 0).toBeLessThan(5000);
    expect(bStart?.wait_ms ?? 0).toBeLessThan(5000);
  } finally {
    stop(caps);
    f.clean();
  }
}, 75000);

test('a run starts at once over the old 48 GiB reading', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'hot');
    seedStat(f, 40 * GIB, 9 * GIB);
    const w1: Cap = run(f, ['run-check', '--name', 'w1', '--', ...hold(dir, 'w1')], worktree);
    const w2: Cap = run(f, ['run-check', '--name', 'w2', '--', ...hold(dir, 'w2')], worktree);
    caps.push(w1, w2);
    // The memory check is gone: both start at once above the old cap.
    await waitFor(resolve(dir, 'w1.held'), 10000);
    await waitFor(resolve(dir, 'w2.held'), 10000);
    expect(w1.proc.exitCode).toBeNull();
    expect(w2.proc.exitCode).toBeNull();
    writeFileSync(resolve(dir, 'release'), '');
    expect(await w1.proc.exited).toBe(0);
    expect(await w2.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 60000);

test('a verify starts at once over the old 48 GiB reading', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { test: `touch ${dir}/base` },
      grounding: 'none',
    });
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const worktree: string = await leafWorktree(f, 'verify-wait');
    seedStat(f, HIGH);
    const waiter: Cap = run(f, ['verify'], worktree, shim);
    caps.push(waiter);
    await waitFor(resolve(dir, 'base'), 15000);
    expect(await waiter.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 60000);

test('a run-check or verify inside an admitted run starts at once over the threshold', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: { inner: `touch ${dir}/inner-base` },
      grounding: 'none',
    });
    writeFileSync(resolve(f.root, '.env'), 'AKROGON_HOME=declared\nAKROGON_LEAF_TEMP_ROOT=declared\n');
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const worktree: string = await leafWorktree(f, 'nested');
    const script: string =
      `printf 'anon 53687091200\\nfile 0\\nshmem 0\\n' > ${statPath(f)};` +
      `akrogon run-check --name inner -- touch ${dir}/inner;` +
      `akrogon verify`;
    const outer: Cap = run(f, ['run-check', '--name', 'outer', '--', 'sh', '-c', script], worktree, shim);
    caps.push(outer);
    await waitFor(resolve(dir, 'inner'), 20000);
    await waitFor(resolve(dir, 'inner-base'), 30000);
    expect(await outer.proc.exited).toBe(0);
    const inner: Event | undefined = timings(f).find((event) => event.kind === 'check_start' && event.name === 'inner');
    expect(inner).toBeDefined();
    expect(inner?.wait_ms).toBeUndefined();
  } finally {
    stop(caps);
    f.clean();
  }
}, 60000);

test('status shows no Run lines while a run holds', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'board');
    expect((await cli(f, ['status'])).stdout).not.toMatch(/\bpermit\b/i);
    const w: Cap = run(f, ['run-check', '--name', 'blocked', '--', ...hold(dir, 'w')], worktree);
    caps.push(w);
    await waitFor(resolve(dir, 'w.held'), 10000);
    const listing: Result = await cli(f, ['status']);
    expect(listing.code).toBe(0);
    expect(listing.stdout.split('\n').filter((line) => /Run/.test(line))).toHaveLength(0);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await w.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 45000);

test('a run-check runs without reading any memory stat', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'no-stat');
    const missing: Result = await cli(f, ['run-check', '--name', 'gone', '--', ...touch(dir, 'gone')], worktree);
    expect(missing.code).toBe(0);
    expect(existsSync(resolve(dir, 'gone'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('spacing overrides are ignored: a blank AKROGON_SPACING_MS runs at once', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'blank-spacing');
    mkdirSync(resolve(f.home, 'runs'), { recursive: true });
    writeFileSync(resolve(f.home, 'runs/last-start'), String(Date.now()));
    for (const spacing of ['', ' ']) {
      const result: Result = await cli(f, ['run-check', '--name', 'blank', '--', ...touch(dir, 'blank')], worktree, {
        AKROGON_SPACING_MS: spacing,
      });
      expect(result.code).toBe(0);
      expect(existsSync(resolve(dir, 'blank'))).toBe(true);
      rmSync(resolve(dir, 'blank'), { force: true });
    }
  } finally {
    f.clean();
  }
});

test('an AKROGON_RUN matching no live record starts its own run at once', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'tokens');
    seedStat(f, HIGH);
    const token: string = randomUUID();
    const unknown: Cap = run(f, ['run-check', '--name', 'fresh', '--', ...touch(dir, 'fresh')], worktree, {
      AKROGON_RUN: token,
    });
    caps.push(unknown);
    await waitFor(resolve(dir, 'fresh'), 10000);
    expect(await unknown.proc.exited).toBe(0);
    const runsDir: string = resolve(f.home, 'runs');
    mkdirSync(runsDir, { recursive: true });
    const deadToken: string = randomUUID();
    const gone: Bun.Subprocess = Bun.spawn(['true']);
    await gone.exited;
    writeFileSync(
      resolve(runsDir, `${createHash('sha256').update(deadToken).digest('hex')}.yaml`),
      Bun.YAML.stringify({
        token_hash: createHash('sha256').update(deadToken).digest('hex'),
        pid: gone.pid,
        start_time: '1',
        boot_id: 'x',
        repo: 'repo',
        leaf: 'holder',
        check: 'old',
        state: 'live',
        since: new Date().toISOString(),
      }),
    );
    const dead: Cap = run(f, ['run-check', '--name', 'dead', '--', ...touch(dir, 'dead')], worktree, {
      AKROGON_RUN: deadToken,
    });
    caps.push(dead);
    await waitFor(resolve(dir, 'dead'), 10000);
    expect(await dead.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 45000);

test('no run.lock lanes, run-holder files or name exemptions remain in src, and docs describe the start check', () => {
  const root: string = resolve(import.meta.dir, '..');
  const forbiddenInSrc: [RegExp, string?][] = [
    // src/reconcile.ts legitimately names ~/.akrogon/run.lock: the store-sweep
    // host step deletes the retired file by exact name (design line: "Retired
    // lock files by exact name only").
    [/run\.lock/, 'reconcile.ts'],
    [/run-holder/],
    [/withPermit/],
    [/\bselftest\b/],
    [/\bcheap\b/],
  ];
  for (const file of readdirSync(resolve(root, 'src'))) {
    if (!file.endsWith('.ts')) continue;
    const text: string = readFileSync(resolve(root, 'src', file), 'utf8');
    for (const [pattern, exempt] of forbiddenInSrc) {
      if (exempt === file) continue;
      expect({ file, hit: text.match(pattern)?.[0] }).toEqual({ file, hit: undefined });
    }
  }
  for (const doc of ['README.md', 'docs/guide/setup.md', 'docs/guide/files.md', 'src/AREA.md']) {
    const text: string = readFileSync(resolve(root, doc), 'utf8');
    expect({ doc, hit: text.match(/run permit/i)?.[0] }).toEqual({ doc, hit: undefined });
  }
});
