import { test, expect } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  cli,
  entry,
  fakeAkrogon,
  fakeHerdr,
  fixture,
  leaf,
  leafTempRoot,
  storeDir,
  yaml,
  type Fixture,
} from './helpers';
import { command, type Result } from '../src/shell';

type Proc = Bun.Subprocess<'ignore', 'pipe', 'pipe'>;
type Event = { kind: string; name?: string; wait_ms?: number };

const sidecarSchema = z.looseObject({ token: z.string(), pid: z.number().int(), start_time: z.string() });
type Sidecar = z.infer<typeof sidecarSchema>;

function start(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): Proc {
  return Bun.spawn([process.execPath, entry, ...args], {
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
      ...env,
    },
  });
}

async function waitFor(path: string, ms: number = 10000): Promise<number> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(20);
  }
  return Date.now() - begun;
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

function sidecarPath(f: Fixture): string {
  return resolve(f.home, 'run-holder.yaml');
}

function readSidecar(f: Fixture): Sidecar {
  return sidecarSchema.parse(Bun.YAML.parse(readFileSync(sidecarPath(f), 'utf8')));
}

async function deadPid(): Promise<number> {
  const gone: Bun.Subprocess = Bun.spawn(['true']);
  await gone.exited;
  return gone.pid;
}

function permitLines(stdout: string): string[] {
  return stdout.split('\n').filter((line) => /run permit/i.test(line));
}

function stop(procs: Proc[], pids: number[] = []): void {
  for (const proc of procs) if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL');
  for (const pid of pids) Bun.spawnSync(['kill', '-9', String(pid)]);
}

test('a second run-check waits for the holder to exit, names the holder once and records its wait', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'holder-leaf');
    const holder: Proc = start(f, ['run-check', '--name', 'first', '--', ...hold(dir, 'first')], worktree);
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    const waiter: Proc = start(f, ['run-check', '--name', 'second', '--', ...touch(dir, 'second')], worktree);
    procs.push(waiter);
    await Bun.sleep(1500);
    expect(existsSync(resolve(dir, 'second'))).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await holder.exited).toBe(0);
    expect(await waiter.exited).toBe(0);
    expect(existsSync(resolve(dir, 'second'))).toBe(true);
    const stderr: string = await new Response(waiter.stderr).text();
    const named: string[] = stderr.split('\n').filter((line) => line.includes(String(holder.pid)));
    expect(named.length).toBe(1);
    expect(named[0]).toContain('repo');
    expect(named[0]).toContain('holder-leaf');
    expect(named[0]).toContain('first');
    const waited: Event | undefined = timings(f).find(
      (event) => event.kind === 'check_start' && event.name === 'second',
    );
    expect(waited?.wait_ms).toBeGreaterThanOrEqual(1000);
  } finally {
    stop(procs);
    f.clean();
  }
});

test('a base-run waits for a live run-check holder before its command', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { test: 'bun test' },
      grounding: 'none',
    });
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'holder-leaf');
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const holder: Proc = start(f, ['run-check', '--name', 'first', '--', ...hold(dir, 'first')], worktree, shim);
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    const waiter: Proc = start(f, ['base-run', '--base', sha, '--', ...touch(dir, 'base')], worktree, shim);
    procs.push(waiter);
    await Bun.sleep(1500);
    expect(existsSync(resolve(dir, 'base'))).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await holder.exited).toBe(0);
    expect(await waiter.exited).toBe(0);
    expect(existsSync(resolve(dir, 'base'))).toBe(true);
    const stderr: string = await new Response(waiter.stderr).text();
    const named: string[] = stderr.split('\n').filter((line) => line.includes(String(holder.pid)));
    expect(named.length).toBe(1);
    expect(named[0]).toContain('holder-leaf');
    expect(named[0]).toContain('first');
  } finally {
    stop(procs);
    f.clean();
  }
});

test('a SIGKILLed holder frees the permit within a second while its setsid child lives', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  const pids: number[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'holder-leaf');
    const script: string = `echo $$ > ${dir}/shell; setsid sh -c 'echo $$ > ${dir}/orphan; exec sleep 30' </dev/null >/dev/null 2>&1 & touch ${dir}/first.held; exec sleep 30`;
    const holder: Proc = start(f, ['run-check', '--name', 'first', '--', 'sh', '-c', script], worktree);
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    await waitFor(resolve(dir, 'orphan'));
    const orphan: number = Number(readFileSync(resolve(dir, 'orphan'), 'utf8').trim());
    pids.push(orphan, Number(readFileSync(resolve(dir, 'shell'), 'utf8').trim()));
    const waiter: Proc = start(f, ['run-check', '--name', 'second', '--', ...touch(dir, 'second')], worktree);
    procs.push(waiter);
    await Bun.sleep(800);
    expect(existsSync(resolve(dir, 'second'))).toBe(false);
    holder.kill('SIGKILL');
    const elapsed: number = await waitFor(resolve(dir, 'second'), 5000);
    expect(elapsed).toBeLessThan(1000);
    expect(Bun.spawnSync(['kill', '-0', String(orphan)]).exitCode).toBe(0);
    expect(await waiter.exited).toBe(0);
  } finally {
    stop(procs, pids);
    f.clean();
  }
});

test('a run-check started inside an admitted run runs at once', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'nested');
    const shim: NodeJS.ProcessEnv = fakeAkrogon(f).env;
    const result: Result = await cli(
      f,
      [
        'run-check',
        '--name',
        'outer',
        '--',
        'akrogon',
        'run-check',
        '--name',
        'inner',
        '--',
        'sh',
        '-c',
        `test -s ${sidecarPath(f)} && touch ${dir}/inner`,
      ],
      worktree,
      { ...shim, HOME: f.home },
      10000,
    );
    expect(result.code).toBe(0);
    expect(existsSync(resolve(dir, 'inner'))).toBe(true);
    const inner: Event | undefined = timings(f).find((event) => event.kind === 'check_start' && event.name === 'inner');
    expect(inner).toBeDefined();
    expect(inner?.wait_ms).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('a run token that does not match a live holder waits', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'holder-leaf');
    const holder: Proc = start(f, ['run-check', '--name', 'first', '--', ...hold(dir, 'first')], worktree);
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    const live: Sidecar = readSidecar(f);
    const cases: { name: string; token: string; sidecar: Sidecar }[] = [
      { name: 'unknown-token', token: randomUUID(), sidecar: live },
      { name: 'dead-pid', token: live.token, sidecar: { ...live, pid: await deadPid() } },
      { name: 'other-start', token: live.token, sidecar: { ...live, start_time: '1' } },
    ];
    for (const item of cases) {
      writeFileSync(sidecarPath(f), Bun.YAML.stringify(item.sidecar));
      const waiter: Proc = start(f, ['run-check', '--name', item.name, '--', ...touch(dir, item.name)], worktree, {
        AKROGON_RUN: item.token,
      });
      procs.push(waiter);
      await Bun.sleep(1200);
      expect(existsSync(resolve(dir, item.name))).toBe(false);
      waiter.kill('SIGKILL');
      await waiter.exited;
    }
    writeFileSync(resolve(dir, 'release'), '');
    expect(await holder.exited).toBe(0);
    for (const item of cases) expect(existsSync(resolve(dir, item.name))).toBe(false);
  } finally {
    stop(procs);
    f.clean();
  }
});

test('status and next complete while a run waits', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  try {
    const herdr: NodeJS.ProcessEnv = fakeHerdr(f).env;
    const dir: string = marks(f);
    const logs: string = resolve(f.home, 'logs');
    const holder: Proc = start(
      f,
      ['run-check', '--holder', logs, '--name', 'first', '--', ...hold(dir, 'first')],
      f.root,
    );
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    const waiter: Proc = start(
      f,
      ['run-check', '--holder', logs, '--name', 'second', '--', ...touch(dir, 'second')],
      f.root,
    );
    procs.push(waiter);
    await Bun.sleep(800);
    expect((await cli(f, ['status'], f.root, {}, 10000)).code).toBe(0);
    expect((await cli(f, ['next'], f.root, herdr, 10000)).stderr).toContain('No leaves match');
    expect(existsSync(resolve(dir, 'second'))).toBe(false);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await holder.exited).toBe(0);
    expect(await waiter.exited).toBe(0);
  } finally {
    stop(procs);
    f.clean();
  }
});

test('status names the live holder and drops it once the holder is gone or dead', async () => {
  const f: Fixture = await fixture();
  const procs: Proc[] = [];
  try {
    const dir: string = marks(f);
    const worktree: string = await leafWorktree(f, 'holder-leaf');
    expect(permitLines((await cli(f, ['status'])).stdout)).toEqual([]);
    const holder: Proc = start(f, ['run-check', '--name', 'first', '--', ...hold(dir, 'first')], worktree);
    procs.push(holder);
    await waitFor(resolve(dir, 'first.held'));
    const live: Sidecar = readSidecar(f);
    const lines: string[] = permitLines((await cli(f, ['status'])).stdout);
    expect(lines.length).toBe(1);
    for (const part of ['repo', 'holder-leaf', 'first', String(holder.pid)]) expect(lines[0]).toContain(part);
    expect(lines[0]).toMatch(/\d+[mhd]/);
    writeFileSync(resolve(dir, 'release'), '');
    expect(await holder.exited).toBe(0);
    expect(permitLines((await cli(f, ['status'])).stdout)).toEqual([]);
    writeFileSync(sidecarPath(f), Bun.YAML.stringify({ ...live, pid: await deadPid() }));
    expect(permitLines((await cli(f, ['status'])).stdout)).toEqual([]);
  } finally {
    stop(procs);
    f.clean();
  }
});
