import { test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  cli,
  cgroupRoot,
  entry,
  fakeAkrogon,
  fixture,
  leaf,
  leafTempRoot,
  seedStat,
  statPath,
  storeDir,
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
  const proc: Proc = Bun.spawn([process.execPath, entry, ...args], {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      HOME: f.home,
      AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      AKROGON_CGROUP_ROOT: cgroupRoot(f),
      AKROGON_SPACING_MS: '30000',
      ...env,
    },
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

async function waitText(cap: Cap, pattern: RegExp, ms: number = 12000): Promise<string> {
  const begun: number = Date.now();
  for (;;) {
    const text: string = await cap.text();
    if (pattern.test(text)) return text;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for stderr ${pattern}: ${text}`);
    await Bun.sleep(20);
  }
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
  for (const cap of caps) if (cap.proc.exitCode === null && cap.proc.signalCode === null) cap.proc.kill('SIGKILL');
}

test('two run-checks in two leaves run at the same time once the 30 s spacing passes', async () => {
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
    await Bun.sleep(1500);
    expect(existsSync(resolve(dir, 'b'))).toBe(false);
    await waitText(b, /spacing \d+s < 30s/, 35000);
    await waitFor(resolve(dir, 'b'), 40000);
    expect(a.proc.exitCode).toBeNull();
    writeFileSync(resolve(dir, 'release'), '');
    expect(await a.proc.exited).toBe(0);
    expect(await b.proc.exited).toBe(0);
    const events: Event[] = timings(f);
    const aStart: Event | undefined = events.find((event) => event.kind === 'check_start' && event.name === 'a');
    const bStart: Event | undefined = events.find((event) => event.kind === 'check_start' && event.name === 'b');
    expect(aStart?.wait_ms ?? 0).toBeLessThan(5000);
    expect(bStart?.wait_ms).toBeGreaterThanOrEqual(25000);
  } finally {
    stop(caps);
    f.clean();
  }
}, 75000);

test('a run at or over the threshold waits printing reading and reason, and a competing waiter re-checks spacing under the lock', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'hot');
    seedStat(f, HIGH);
    const w1: Cap = run(f, ['run-check', '--name', 'w1', '--', ...hold(dir, 'w1')], worktree);
    const w2: Cap = run(f, ['run-check', '--name', 'w2', '--', ...hold(dir, 'w2')], worktree);
    caps.push(w1, w2);
    await waitText(w1, /anon\+shmem [\d.]+ GiB >= 48 GiB/);
    await waitText(w2, /anon\+shmem [\d.]+ GiB >= 48 GiB/);
    expect(existsSync(resolve(dir, 'w1.held'))).toBe(false);
    expect(existsSync(resolve(dir, 'w2.held'))).toBe(false);
    seedStat(f, LOW);
    const firstHeld: number = await waitForAny([resolve(dir, 'w1.held'), resolve(dir, 'w2.held')], 10000);
    const lead: Cap = caps[firstHeld];
    const trail: Cap = caps[1 - firstHeld];
    const leadName: string = ['w1', 'w2'][firstHeld];
    const trailName: string = ['w1', 'w2'][1 - firstHeld];
    expect(lead.proc.exitCode).toBeNull();
    await waitFor(resolve(dir, `${trailName}.held`), 45000);
    const events: Event[] = timings(f);
    const leadStart: Event | undefined = events.find(
      (event) => event.kind === 'check_start' && event.name === leadName,
    );
    const trailStart: Event | undefined = events.find(
      (event) => event.kind === 'check_start' && event.name === trailName,
    );
    expect(leadStart?.wait_ms).toBeDefined();
    expect(trailStart!.wait_ms! - leadStart!.wait_ms!).toBeGreaterThanOrEqual(25000);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await w1.proc.exited).toBe(0);
    expect(await w2.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 90000);

test('a base-run waits at the threshold before its command and admits on the drop', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { test: 'bun test' },
      grounding: 'none',
    });
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'base-wait');
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    seedStat(f, HIGH);
    const waiter: Cap = run(f, ['base-run', '--base', sha, '--', ...touch(dir, 'base')], worktree, shim);
    caps.push(waiter);
    await waitText(waiter, /anon\+shmem [\d.]+ GiB >= 48 GiB/);
    expect(existsSync(resolve(dir, 'base'))).toBe(false);
    seedStat(f, LOW);
    await waitFor(resolve(dir, 'base'), 15000);
    expect(await waiter.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 60000);

test('a run-check or base-run inside an admitted run starts at once over the threshold', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      pass_env: ['AKROGON_CGROUP_ROOT', 'AKROGON_SPACING_MS'],
      checks: {},
      grounding: 'none',
    });
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'nested');
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const script: string =
      `printf 'anon 53687091200\\nfile 0\\nshmem 0\\n' > ${statPath(f)};` +
      `akrogon run-check --name inner -- touch ${dir}/inner;` +
      `akrogon base-run --base ${sha} -- touch ${dir}/inner-base`;
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

test('status lists runs waiting to start with leaf, check and reason, and no permit line', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'board');
    expect((await cli(f, ['status'])).stdout).not.toMatch(/\bpermit\b/i);
    const w: Cap = run(f, ['run-check', '--name', 'blocked', '--', ...hold(dir, 'w')], worktree);
    caps.push(w);
    seedStat(f, HIGH);
    await waitText(w, /anon\+shmem/);
    const listing: Result = await cli(f, ['status']);
    expect(listing.code).toBe(0);
    const lines: string[] = listing.stdout.split('\n').filter((line) => /Run/.test(line));
    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toMatch(/permit/i);
    expect(lines[0]).toContain('repo');
    expect(lines[0]).toContain('board');
    expect(lines[0]).toContain('blocked');
    expect(lines[0]).toContain('48');
    const dead: number = await (async () => {
      const gone: Bun.Subprocess = Bun.spawn(['true']);
      await gone.exited;
      return gone.pid;
    })();
    const runsDir: string = resolve(f.home, 'runs');
    mkdirSync(runsDir, { recursive: true });
    writeFileSync(
      resolve(runsDir, 'dead0.yaml'),
      Bun.YAML.stringify({
        token_hash: 'dead0',
        pid: dead,
        start_time: '1',
        boot_id: 'x',
        repo: 'repo',
        leaf: 'ghost',
        check: 'phantom',
        state: 'waiting',
        wait_reason: 'anon+shmem 51 GiB >= 48 GiB',
        since: new Date().toISOString(),
      }),
    );
    const filtered: Result = await cli(f, ['status']);
    expect(filtered.stdout.split('\n').filter((line) => /Run/.test(line))).toHaveLength(1);
    seedStat(f, LOW);
    await waitFor(resolve(dir, 'w.held'), 15000);
    const liveOnly: Result = await cli(f, ['status']);
    expect(liveOnly.stdout.split('\n').filter((line) => /Run/.test(line))).toHaveLength(0);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await w.proc.exited).toBe(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 45000);

test('a run-check fails naming the path when memory.stat is missing or lacks the fields', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'no-stat');
    const file: string = statPath(f);
    const missing: Result = await cli(f, ['run-check', '--name', 'gone', '--', ...touch(dir, 'gone')], worktree, {
      AKROGON_CGROUP_ROOT: resolve(f.home, 'cgroup-empty'),
    });
    expect(missing.code).not.toBe(0);
    expect(`${missing.stdout}\n${missing.stderr}`).toContain('memory.stat');
    expect(existsSync(resolve(dir, 'gone'))).toBe(false);
    writeFileSync(file, 'file 123\nkernel 0\n');
    const missingFields: Result = await cli(
      f,
      ['run-check', '--name', 'fields', '--', ...touch(dir, 'fields')],
      worktree,
    );
    expect(missingFields.code).not.toBe(0);
    expect(`${missingFields.stdout}\n${missingFields.stderr}`).toContain('memory.stat');
    expect(existsSync(resolve(dir, 'fields'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('an AKROGON_RUN matching no live record goes through admission like any start', async () => {
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
    await waitText(unknown, /anon\+shmem/);
    expect(existsSync(resolve(dir, 'fresh'))).toBe(false);
    unknown.proc.kill('SIGKILL');
    await unknown.proc.exited;
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
    await waitText(dead, /anon\+shmem/);
    expect(existsSync(resolve(dir, 'dead'))).toBe(false);
  } finally {
    stop(caps);
    f.clean();
  }
}, 45000);

test('no run.lock lanes, run-holder files or name exemptions remain in src, and docs describe the start check', () => {
  const root: string = resolve(import.meta.dir, '..');
  const forbiddenInSrc: RegExp[] = [/run\.lock/, /run-holder/, /withPermit/, /\bselftest\b/, /\bcheap\b/];
  for (const file of readdirSync(resolve(root, 'src'))) {
    if (!file.endsWith('.ts')) continue;
    const text: string = readFileSync(resolve(root, 'src', file), 'utf8');
    for (const pattern of forbiddenInSrc)
      expect({ file, hit: text.match(pattern)?.[0] }).toEqual({ file, hit: undefined });
  }
  for (const doc of ['README.md', 'docs/guide/setup.md', 'docs/guide/files.md', 'src/AREA.md']) {
    const text: string = readFileSync(resolve(root, doc), 'utf8');
    expect({ doc, hit: text.match(/run permit/i)?.[0] }).toEqual({ doc, hit: undefined });
  }
});
