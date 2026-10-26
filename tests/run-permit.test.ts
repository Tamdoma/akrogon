import { test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
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

const FULL_CONFIG = { checks: { test: 'bun test', format: 'true' }, full: ['test'], grounding: 'none' };

const record = (name: string, dir: string): string[] => ['sh', '-c', `echo ${name} >> ${dir}/order`];

async function waitForText(cap: Cap, pattern: RegExp, ms: number = 20000): Promise<void> {
  const begun: number = Date.now();
  while (!pattern.test(await cap.text())) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${pattern}: ${await cap.text()}`);
    await Bun.sleep(50);
  }
}

async function runRecords(f: Fixture): Promise<Record<string, unknown>[]> {
  const dir: string = resolve(f.home, 'runs');
  if (!existsSync(dir)) return [];
  const records: Record<string, unknown>[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.yaml')) continue;
    try {
      records.push(Bun.YAML.parse(readFileSync(resolve(dir, name), 'utf8')) as Record<string, unknown>);
    } catch {
      // unreadable records are ignored by every reader
    }
  }
  return records;
}

// A caller whose /proc/self/cgroup names <scopeName>.scope, so a waiting run's
// record and the stop-run caller land in the same scope.
function scopedProcRoot(f: Fixture, scopeName: string): string {
  const root: string = resolve(f.home, 'scopes', scopeName);
  mkdirSync(resolve(root, 'self'), { recursive: true });
  writeFileSync(resolve(root, 'self', 'cgroup'), `0::/pane/${scopeName}\n`);
  return root;
}

test('listed runs of one repo wait for their repo holder, print the holder, and start in arrival order', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const first: string = await leafWorktree(f, 'leaf-one');
    const second: string = await leafWorktree(f, 'leaf-two');
    const a: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'a')], first);
    caps.push(a);
    await waitFor(resolve(dir, 'a.held'));
    const b: Cap = run(f, ['run-check', '--name', 'test', '--', ...touch(dir, 'b')], second);
    caps.push(b);
    await waitForText(b, /waiting for repo\/leaf-one test/);
    expect(existsSync(resolve(dir, 'b'))).toBe(false);
    for (const name of ['w1', 'w2', 'w3']) {
      const waiter: Cap = run(f, ['run-check', '--name', 'test', '--', ...record(name, dir)], first);
      caps.push(waiter);
      await waitForText(waiter, /waiting for repo\/(leaf-one|leaf-two) test/);
      expect(existsSync(resolve(dir, 'order'))).toBe(false);
    }
    writeFileSync(resolve(dir, 'release'), '');
    expect(await a.proc.exited).toBe(0);
    // a's command ended and its record file is gone; b may only start now.
    const aId: string = ((await a.text()).match(/run ([0-9a-f-]+)/) ?? [])[1] as string;
    expect(aId).toBeDefined();
    expect(await b.proc.exited).toBe(0);
    expect(existsSync(resolve(dir, 'b'))).toBe(true);
    expect((await runRecords(f)).some((entry) => entry.run === aId)).toBe(false);
    for (const cap of caps) expect(await cap.proc.exited).toBe(0);
    expect(readFileSync(resolve(dir, 'order'), 'utf8').trim().split('\n')).toEqual(['w1', 'w2', 'w3']);
    const waits: number[] = timings(f)
      .filter((event) => event.kind === 'check_start' && event.name === 'test')
      .map((event) => event.wait_ms ?? 0);
    expect(Math.max(...waits)).toBeGreaterThan(0);
  } finally {
    stop(caps);
    f.clean();
  }
}, 75000);

test('a listed run of another repo and an unlisted run start at once over the line', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const other: string = resolve(f.home, 'zzrepo');
    mkdirSync(resolve(other, 'issues/open'), { recursive: true });
    await command(['git', 'init', '-b', 'main', other]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
    await command(['git', 'config', 'user.name', 'Test'], other);
    writeFileSync(resolve(other, 'file'), 'initial\n');
    await command(['git', 'add', '.'], other);
    await command(['git', 'commit', '-m', 'initial'], other);
    await command(['git', 'init', '--bare', '-b', 'main', resolve(f.home, 'other.git')]);
    await command(['git', 'remote', 'add', 'origin', resolve(f.home, 'other.git')], other);
    await command(['git', 'push', 'origin', 'HEAD:main'], other);
    yaml(resolve(other, 'issues/config.yaml'), FULL_CONFIG);
    const global: Record<string, unknown> = Bun.YAML.parse(
      readFileSync(resolve(f.home, 'config.yaml'), 'utf8'),
    ) as Record<string, unknown>;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: f.root, zzrepo: other } });
    const otherTree: string = resolve(storeDir(f, 'zzrepo'), 'zz-leaf');
    await command(['git', 'worktree', 'add', otherTree, '-b', 'zz-leaf'], other);
    mkdirSync(resolve(other, 'issues/open/issue/zz-leaf'), { recursive: true });
    yaml(resolve(other, 'issues/open/issue/zz-leaf/state.yaml'), {
      slug: 'zz-leaf',
      phase: 'implement',
      created: '2026-09-10',
      repo: 'zzrepo',
      'blocked-by': [],
      worktree: otherTree,
    });
    const first: string = await leafWorktree(f, 'leaf-one');
    const second: string = await leafWorktree(f, 'leaf-two');
    const a: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'a')], first);
    caps.push(a);
    await waitFor(resolve(dir, 'a.held'));
    // A same-repo listed run proves the queue itself is engaged.
    const c: Cap = run(f, ['run-check', '--name', 'test', '--', ...touch(dir, 'c')], second);
    caps.push(c);
    await waitForText(c, /waiting for repo\/leaf-one test/);
    const small: Result = await cli(f, ['run-check', '--name', 'format', '--', ...touch(dir, 'small')], second);
    expect(small.code).toBe(0);
    const ob: Result = await cli(f, ['run-check', '--name', 'test', '--', ...touch(dir, 'ob')], otherTree);
    expect(ob.code).toBe(0);
    expect(existsSync(resolve(dir, 'small'))).toBe(true);
    expect(existsSync(resolve(dir, 'ob'))).toBe(true);
    expect(existsSync(resolve(dir, 'c'))).toBe(false);
    const innerTree: string = await leafWorktree(f, 'cross-repo-inner');
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const script: string = `cd ${innerTree}; akrogon run-check --name test -- touch ${dir}/inner`;
    const outer: Cap = run(f, ['run-check', '--name', 'test', '--', 'sh', '-c', script], otherTree, shim);
    caps.push(outer);
    const deadline: number = Date.now() + 20000;
    while (
      !existsSync(resolve(dir, 'inner')) &&
      !(await runRecords(f)).some((entry) => entry.leaf === 'cross-repo-inner' && entry.state === 'waiting')
    ) {
      if (Date.now() > deadline) throw new Error('the cross-repo inner run neither waited nor started');
      await Bun.sleep(50);
    }
    expect(existsSync(resolve(dir, 'inner'))).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await a.proc.exited).toBe(0);
    expect(await c.proc.exited).toBe(0);
    expect(existsSync(resolve(dir, 'c'))).toBe(true);
    expect(await outer.proc.exited).toBe(0);
    expect(existsSync(resolve(dir, 'inner'))).toBe(true);
  } finally {
    stop(caps);
    f.clean();
  }
}, 75000);

test('a listed run nests under its repo holder and queues under an unlisted run', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const worktree: string = await leafWorktree(f, 'nested-line');
    // A listed run inside the same repo's listed holder runs at once and writes no record.
    const script: string = `akrogon run-check --name test -- touch ${dir}/inner`;
    const outer: Cap = run(f, ['run-check', '--name', 'test', '--', 'sh', '-c', script], worktree, shim);
    caps.push(outer);
    await waitFor(resolve(dir, 'inner'), 20000);
    expect(await runRecords(f)).toHaveLength(1);
    expect(await outer.proc.exited).toBe(0);
    expect(await outer.text()).not.toMatch(/waiting for/);
    // A listed run inside an unlisted run takes its own turn behind the live holder.
    const h: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'h')], worktree);
    caps.push(h);
    await waitFor(resolve(dir, 'h.held'));
    const innerScript: string = `akrogon run-check --name test -- touch ${dir}/inner2`;
    const outer2: Cap = run(f, ['run-check', '--name', 'format', '--', 'sh', '-c', innerScript], worktree, shim);
    caps.push(outer2);
    // The inner's waiting stderr is buffered in outer2's log until its command
    // exits, so the wait is observed on its record, not the stream.
    const deadline: number = Date.now() + 20000;
    while (!(await runRecords(f)).some((entry) => entry.state === 'waiting')) {
      if (Date.now() > deadline) throw new Error('the inner listed run never waited');
      await Bun.sleep(50);
    }
    expect(existsSync(resolve(dir, 'inner2'))).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await h.proc.exited).toBe(0);
    expect(await outer2.proc.exited).toBe(0);
    expect(existsSync(resolve(dir, 'inner2'))).toBe(true);
  } finally {
    stop(caps);
    f.clean();
  }
}, 60000);

test('a killed holder or waiter does not block the line', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const worktree: string = await leafWorktree(f, 'killed');
    const holder: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'h')], worktree);
    caps.push(holder);
    await waitFor(resolve(dir, 'h.held'));
    const dead: Cap = run(f, ['run-check', '--name', 'test', '--', ...record('dead', dir)], worktree);
    caps.push(dead);
    await waitForText(dead, /waiting for repo\//);
    const next: Cap = run(f, ['run-check', '--name', 'test', '--', ...record('next', dir)], worktree);
    caps.push(next);
    await waitForText(next, /waiting for repo\//);
    killTree(dead.proc);
    await dead.proc.exited;
    killTree(holder.proc);
    await holder.proc.exited;
    expect(await next.proc.exited).toBe(0);
    expect(readFileSync(resolve(dir, 'order'), 'utf8').trim()).toBe('next');
  } finally {
    stop(caps);
    f.clean();
  }
}, 75000);

test('stop-run cancels a waiting run and the next waiter takes its place', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const scoped: NodeJS.ProcessEnv = { AKROGON_PROC_ROOT: scopedProcRoot(f, 'paneA.scope') };
    const worktree: string = await leafWorktree(f, 'cancel');
    const h: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'h')], worktree, scoped);
    caps.push(h);
    await waitFor(resolve(dir, 'h.held'));
    // One leaf per waiter so each record maps to exactly one process.
    const w1: Cap = run(
      f,
      ['run-check', '--name', 'test', '--', ...record('w1', dir)],
      await leafWorktree(f, 'wait-one'),
      scoped,
    );
    const w2: Cap = run(
      f,
      ['run-check', '--name', 'test', '--', ...record('w2', dir)],
      await leafWorktree(f, 'wait-two'),
      scoped,
    );
    const w3: Cap = run(
      f,
      ['run-check', '--name', 'test', '--', ...record('w3', dir)],
      await leafWorktree(f, 'wait-three'),
      scoped,
    );
    caps.push(w1, w2, w3);
    for (const cap of [w1, w2, w3]) await waitForText(cap, /waiting for repo\//);
    const wId = async (leafName: string): Promise<string> => {
      const begun: number = Date.now();
      for (;;) {
        const found: Record<string, unknown> | undefined = (await runRecords(f)).find(
          (entry) => entry.state === 'waiting' && entry.leaf === leafName,
        );
        if (found !== undefined) return String(found.run);
        if (Date.now() - begun > 10000) throw new Error(`no waiting record for ${leafName}`);
        await Bun.sleep(50);
      }
    };
    const w1Id: string = await wId('wait-one');
    const w3Id: string = await wId('wait-three');
    // Cancel the suspended w3 first: it exits when resumed and its record is
    // not rewritten while it is stopped.
    w3.proc.kill('SIGSTOP');
    const suspended: Result = await cli(f, ['stop-run', w3Id], worktree, scoped);
    expect(suspended.code).toBe(0);
    const begun: number = Date.now();
    while ((await runRecords(f)).find((entry) => entry.run === w3Id)?.state !== 'cancelled') {
      if (Date.now() - begun > 10000) throw new Error('suspended run record never cancelled');
      await Bun.sleep(50);
    }
    expect(w3.proc.exitCode).toBeNull();
    const cancelled: Result = await cli(f, ['stop-run', w1Id], worktree, scoped);
    expect(cancelled.code).toBe(0);
    expect(await w1.proc.exited).not.toBe(0);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await h.proc.exited).toBe(0);
    expect(await w2.proc.exited).toBe(0);
    w3.proc.kill('SIGCONT');
    expect(await w3.proc.exited).not.toBe(0);
    expect(readFileSync(resolve(dir, 'order'), 'utf8').trim()).toBe('w2');
    expect((await runRecords(f)).some((entry) => entry.run === w1Id || entry.run === w3Id)).toBe(false);
  } finally {
    for (const cap of caps) {
      if (cap.proc.exitCode === null) cap.proc.kill('SIGCONT');
    }
    stop(caps);
    f.clean();
  }
}, 75000);

test('stop-run cancels the sole waiting run without an id', async () => {
  const f: Fixture = await fixture();
  const caps: Cap[] = [];
  try {
    const dir: string = marks(f);
    yaml(resolve(f.root, 'issues/config.yaml'), FULL_CONFIG);
    const worktree: string = await leafWorktree(f, 'cancel-sole');
    const systemctlLog: string = resolve(dir, 'systemctl');
    writeFileSync(resolve(unitBin(f), 'systemctl'), `#!/bin/sh\necho called >> ${systemctlLog}\nexit 5\n`, {
      mode: 0o755,
    });
    const h: Cap = run(f, ['run-check', '--name', 'test', '--', ...hold(dir, 'h')], worktree, {
      AKROGON_PROC_ROOT: scopedProcRoot(f, 'holder.scope'),
    });
    caps.push(h);
    await waitFor(resolve(dir, 'h.held'));
    const scoped: NodeJS.ProcessEnv = { AKROGON_PROC_ROOT: scopedProcRoot(f, 'waiter.scope') };
    const waiter: Cap = run(f, ['run-check', '--name', 'test', '--', ...touch(dir, 'waiter')], worktree, scoped);
    caps.push(waiter);
    await waitForText(waiter, /waiting for repo\//);
    const cancelled: Result = await cli(f, ['stop-run'], worktree, scoped);
    expect(cancelled.code).toBe(0);
    expect(existsSync(systemctlLog)).toBe(false);
    expect(await waiter.proc.exited).not.toBe(0);
    expect(existsSync(resolve(dir, 'waiter'))).toBe(false);
    expect((await runRecords(f)).some((entry) => entry.scope === 'waiter.scope')).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await h.proc.exited).toBe(0);
    expect(existsSync(resolve(dir, 'waiter'))).toBe(false);
  } finally {
    stop(caps);
    f.clean();
  }
}, 30000);

test('config refuses a full name that is not a check', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { ...FULL_CONFIG, full: ['missing'] });
    const result: Result = await cli(f, ['config']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toMatch(/full.*missing/);
  } finally {
    f.clean();
  }
});

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
  const docs: string[] = [
    'README.md',
    ...readdirSync(resolve(root, 'docs'), { recursive: true })
      .map((entry) => join('docs', String(entry)))
      .filter((file: string) => file.endsWith('.md')),
    'src/AREA.md',
  ];
  for (const doc of docs) {
    const text: string = readFileSync(resolve(root, doc), 'utf8');
    expect({ doc, hit: text.match(/run permit/i)?.[0] }).toEqual({ doc, hit: undefined });
  }
});
