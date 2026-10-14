import { afterAll, test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
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
  storeDir,
  yaml,
  type Fixture,
} from './helpers';
import { command, finishCaptured, spawnFiles, run, type Result, type SpawnResult } from '../src/shell';
import { expectedSlice } from './fake-proc';

const GIB: number = 1024 * 1024 * 1024;
const uid: number = process.getuid!();
const slicePrefix = (root: string): string =>
  resolve(root, `user.slice/user-${uid}.slice/user@${uid}.service/akrogon.slice`);
// Slices nest by name: a-b-c.slice lives at a.slice/a-b.slice/a-b-c.slice.
// slicePrefix() already ends at akrogon.slice, so that chain link is dropped.
const sliceDirs = (slice: string): string[] => {
  const parts: string[] = slice.replace(/\.slice$/, '').split('-');
  const chain: string[] = parts.map((_: string, index: number) => `${parts.slice(0, index + 1).join('-')}.slice`);
  return parts[0] === 'akrogon' ? chain.slice(1) : chain;
};
const unitDir = (root: string, slice: string, unit: string): string =>
  resolve(slicePrefix(root), ...sliceDirs(slice), unit);

type RealCap = { proc: Bun.Subprocess; result: Promise<SpawnResult> };

function outDir(f: Fixture): string {
  const dir: string = resolve(f.home, 'unit-out');
  mkdirSync(dir, { recursive: true });
  return dir;
}

let serial = 0;
function testSlice(): string {
  return `akrogon-test-${process.pid}-${serial++}.slice`;
}

// Spawn the entry with the real systemd-run/systemctl on PATH so units are
// real; AKROGON_RUN_SLICE lands them under an akrogon-test-* slice per the grant.
function spawnReal(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): RealCap {
  const merged: NodeJS.ProcessEnv = {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_CGROUP_ROOT: cgroupRoot(f),
    AKROGON_SPACING_MS: '0',
    AKROGON_RUN: '',
    XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR ?? `/run/user/${uid}`,
    PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    ...env,
  };
  const { child, captured } = spawnFiles([process.execPath, entry, ...args], { cwd, env: merged });
  return { proc: child, result: finishCaptured(child, captured) };
}

// A caller whose /proc/self/cgroup names <scopeName>.scope, through a per-scope
// proc root, so launch records and stop-run authority see exactly that scope.
function scopedProcRoot(f: Fixture, scopeName: string): string {
  const root: string = resolve(f.home, 'scopes', scopeName);
  mkdirSync(resolve(root, 'self'), { recursive: true });
  writeFileSync(resolve(root, 'self', 'cgroup'), `0::/user.slice/user-${uid}.slice/user@${uid}.service/${scopeName}\n`);
  return root;
}

function spawnScoped(f: Fixture, scopeName: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): RealCap {
  return spawnReal(f, args, cwd, { AKROGON_PROC_ROOT: scopedProcRoot(f, scopeName), ...env });
}

// One shared fixture and test slice for the real-systemd tests: a fixture costs
// several git operations and the suite's per-test budget is 30 s.
let shared: { f: Fixture; slice: string } | undefined;
async function realFixture(): Promise<{ f: Fixture; slice: string }> {
  if (shared === undefined) {
    const f: Fixture = await fixture();
    fakeAkrogon(f);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules; cat /proc/self/cgroup > "$RUN_UNITS_OUT/setup.cg"',
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT', 'RUN_UNITS_OUT'],
      checks: {},
      grounding: 'none',
    });
    shared = { f, slice: testSlice() };
  }
  return shared;
}

afterAll(async () => {
  if (shared !== undefined) {
    await stopTestSlice(shared.slice);
    shared.f.clean();
    shared = undefined;
  }
});

async function leafWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  leaf(f, slug, 'implement', { worktree });
  return realpathSync(worktree);
}

async function waitPath(path: string, ms: number = 15000): Promise<void> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(50);
  }
}

// The suite's run-check cuts DBUS_SESSION_BUS_ADDRESS; env -u drops it so
// systemctl --user falls back to its private socket.
function sysctl(...args: string[]): Promise<SpawnResult> {
  const { child, captured } = spawnFiles(['env', '-u', 'DBUS_SESSION_BUS_ADDRESS', 'systemctl', '--user', ...args]);
  return finishCaptured(child, captured);
}

async function waitInactive(unit: string, ms: number = 12000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    const result: Result = await sysctl('is-active', unit);
    if (result.code !== 0) return;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${unit} to become inactive`);
    await Bun.sleep(150);
  }
}

// The cgroup dir appears before the unit finishes activating, and is-active is
// non-zero in both states, so callers must wait for active before trusting
// either existence or later inactivity.
async function waitActive(unit: string, ms: number = 12000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    const result: Result = await sysctl('is-active', unit);
    if (result.code === 0) return;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${unit} to become active`);
    await Bun.sleep(150);
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
      // malformed records are skipped by readers
    }
  }
  return records;
}

async function liveRuns(f: Fixture): Promise<Record<string, unknown>[]> {
  return (await runRecords(f)).filter((record) => record.state === 'live');
}

function statStart(pid: number): string {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

function bootId(): string {
  return readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
}

async function seedRunRecord(f: Fixture, fields: Record<string, unknown> = {}): Promise<string> {
  const dir: string = resolve(f.home, 'runs');
  mkdirSync(dir, { recursive: true });
  const sleeper: Bun.Subprocess = Bun.spawn(['sleep', '60'], { stdout: 'ignore', stderr: 'ignore' });
  const runId: string = (fields.run as string | undefined) ?? randomUUID();
  const token: string = randomUUID();
  const record: Record<string, unknown> = {
    token_hash: createHash('sha256').update(token).digest('hex'),
    pid: sleeper.pid,
    start_time: statStart(sleeper.pid),
    boot_id: bootId(),
    repo: 'repo',
    leaf: 'seeded',
    check: 'seeded',
    state: 'live',
    since: new Date().toISOString(),
    run: runId,
    slice: 'akrogon.slice',
    scope: 'seeded.scope',
    unit: `akrogon-run-${runId}.scope`,
    ...fields,
  };
  writeFileSync(resolve(dir, `${record.token_hash as string}.yaml`), Bun.YAML.stringify(record));
  return runId;
}

function seedUnitStat(f: Fixture, slice: string, unit: string, anon: number): void {
  const dir: string = unitDir(cgroupRoot(f), slice, unit);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'memory.stat'), `anon ${anon}\nfile 0\nshmem 0\n`);
}

async function activeUnits(pattern: string): Promise<string[]> {
  const result: Result = await sysctl('list-units', '--all', '--no-legend', pattern);
  return result.stdout
    .split('\n')
    .map((line: string) => line.trim().split(/\s+/)[0] ?? '')
    .filter((name: string) => name !== '');
}

async function stopTestSlice(slice: string): Promise<void> {
  await sysctl('stop', slice);
  await sysctl('reset-failed', slice);
}

test.serial(
  'a top-level run-check boxes its command, a child forked at once and a nested run-check in one run unit',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'boxed');
    const script: string = [
      `cat /proc/self/cgroup > "${out}/outer.cg"`,
      `sh -c 'sleep 3 & cat /proc/self/cgroup > "${out}/child.cg"; wait' & CPID=$!`,
      `for i in $(seq 1 100); do [ -s "${out}/child.cg" ] && break; sleep 0.1; done`,
      `akrogon run-check --name inner -- sh -c 'cat /proc/self/cgroup > "${out}/inner.cg"'`,
      'wait $CPID',
    ].join('; ');
    const result: SpawnResult = await spawnReal(
      f,
      ['run-check', '--name', 'outer', '--', 'sh', '-c', script],
      worktree,
      { RUN_UNITS_OUT: out, AKROGON_RUN_SLICE: slice },
    ).result;
    expect(result.code, `stdout: ${result.stdout} stderr: ${result.stderr}`).toBe(0);
    expect(result.stderr.match(/^run [0-9a-f-]{36}$/gm)).toHaveLength(1);
    const outer: string = readFileSync(resolve(out, 'outer.cg'), 'utf8');
    const child: string = readFileSync(resolve(out, 'child.cg'), 'utf8');
    const inner: string = readFileSync(resolve(out, 'inner.cg'), 'utf8');
    const scope: string | undefined = outer.match(/akrogon-run-[0-9a-f-]+\.scope/)?.[0];
    expect(scope).toBeDefined();
    expect(outer).toContain(`/${slice}/${scope}`);
    expect(child).toBe(outer);
    expect(inner).toBe(outer);
    expect(await activeUnits('akrogon-run-*.scope')).toEqual([]);
  },
  45000,
);

test.serial(
  'stop-run stops only the caller pane scope runs',
  async () => {
    const { f, slice } = await realFixture();
    const caps: RealCap[] = [];
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'stopper');
    const ids: Record<string, string> = {};
    const launch = async (scope: string, name: string): Promise<void> => {
      caps.push(
        spawnScoped(f, scope, ['run-check', '--name', name, '--', 'sh', '-c', 'exec sleep 60'], worktree, {
          AKROGON_RUN_SLICE: slice,
        }),
      );
      // Feed the FAKE cgroup root a full unit stat so this run's reservation
      // drops to ~0 and the next launch is admitted by the 48 GiB accounting.
      const deadline: number = Date.now() + 20000;
      for (;;) {
        const live: Record<string, unknown> | undefined = (await liveRuns(f)).find((record) => record.check === name);
        if (live !== undefined) {
          ids[name] = live.run as string;
          seedUnitStat(f, slice, live.unit as string, 20 * GIB);
          return;
        }
        if (Date.now() > deadline) throw new Error(`No live record for ${name}`);
        await Bun.sleep(50);
      }
    };
    await launch('paneA.scope', 'a1');
    await launch('paneA.scope', 'a2');
    await launch('paneB.scope', 'b1');
    const units = (name: string): string => `akrogon-run-${ids[name]}.scope`;
    for (const name of ['a1', 'a2', 'b1']) {
    await waitPath(unitDir('/sys/fs/cgroup', slice, units(name)));
    await waitActive(units(name));
  }
    try {
      // No id: list the caller's runs and refuse unless exactly one matches.
      const two: SpawnResult = await spawnScoped(f, 'paneA.scope', ['stop-run'], worktree).result;
      expect(two.code).not.toBe(0);
      expect(two.stderr).toContain(ids.a2);
      expect((await sysctl('is-active', units('a2'))).code).toBe(0);
      // a1 stopped by the launching pane scope: unit dies; a2 and b1 keep running.
      const stopped: SpawnResult = await spawnScoped(f, 'paneA.scope', ['stop-run', ids.a1], worktree).result;
      expect(stopped.code).toBe(0);
      await waitInactive(units('a1'));
      expect((await sysctl('is-active', units('a2'))).code).toBe(0);
      expect((await sysctl('is-active', units('b1'))).code).toBe(0);
      // A run owned by another pane is refused.
      const refused: SpawnResult = await spawnScoped(f, 'paneA.scope', ['stop-run', ids.b1], worktree).result;
      expect(refused.code).not.toBe(0);
      expect((await sysctl('is-active', units('b1'))).code).toBe(0);
      // A caller in no scope can never stop a run.
      const plainRoot: string = resolve(f.home, 'scopes', 'plain');
      mkdirSync(resolve(plainRoot, 'self'), { recursive: true });
      writeFileSync(resolve(plainRoot, 'self', 'cgroup'), `0::/user.slice/user-${uid}.slice/user@${uid}.service\n`);
      const plain: SpawnResult = await spawnReal(f, ['stop-run', ids.a2], worktree, { AKROGON_PROC_ROOT: plainRoot })
        .result;
      expect(plain.code).not.toBe(0);
      expect((await sysctl('is-active', units('a2'))).code).toBe(0);
      const none: SpawnResult = await spawnScoped(f, 'paneC.scope', ['stop-run'], worktree).result;
      expect(none.code).not.toBe(0);
      // The stopped run's record can linger until its wrapper's finally runs.
      const cleared: number = Date.now() + 15000;
      while ((await runRecords(f)).some((record) => record.run === ids.a1)) {
        if (Date.now() > cleared) throw new Error('a1 record still present after its unit died');
        await Bun.sleep(50);
      }
      // paneA has exactly one run left: bare stop-run stops it.
      const last: SpawnResult = await spawnScoped(f, 'paneA.scope', ['stop-run'], worktree).result;
      expect(last.code).toBe(0);
      await waitInactive(units('a2'));
      // paneB's single run stops the same way.
      const lastB: SpawnResult = await spawnScoped(f, 'paneB.scope', ['stop-run'], worktree).result;
      expect(lastB.code).toBe(0);
      await waitInactive(units('b1'));
    } finally {
      for (const cap of caps) {
        if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
        void cap.result;
      }
    }
  },
  60000,
);

for (const signal of ['SIGTERM', 'SIGKILL'] as const) {
  test.serial(
    `${signal} of the wrapper leaves the run unit inactive with no descendant`,
    async () => {
      const { f, slice } = await realFixture();
      const out: string = outDir(f);
      const worktree: string = await leafWorktree(f, `reap-${signal.toLowerCase()}`);
      const cap: RealCap = spawnReal(
        f,
        ['run-check', '--name', 'reap', '--', 'sh', '-c', 'sleep 30 & exec sleep 30'],
        worktree,
        { RUN_UNITS_OUT: out, AKROGON_RUN_SLICE: slice },
      );
      try {
        let unit: string | undefined;
        const deadline: number = Date.now() + 15000;
        while (unit === undefined) {
          const live: Record<string, unknown> | undefined = (await liveRuns(f)).find(
            (record) => record.check === 'reap',
          );
          if (live !== undefined) unit = live.unit as string;
          else if (Date.now() > deadline) throw new Error('No live reap record');
          else await Bun.sleep(50);
        }
        await waitPath(unitDir('/sys/fs/cgroup', slice, unit));
        await waitActive(unit);
        cap.proc.kill(signal);
        // TimeoutStopUSec (5 s) plus the 5 s assertion window from the brief.
        await waitInactive(unit, 10000);
        await waitInactive(unit.replace(/\.scope$/, '-guard.service'), 10000);
        // cgroupfs lags unit state under load: wait for procs to drain or the dir to go.
        const cgroupProcs: string = resolve(unitDir('/sys/fs/cgroup', slice, unit), 'cgroup.procs');
        const drained: number = Date.now() + 15000;
        while (existsSync(cgroupProcs) && readFileSync(cgroupProcs, 'utf8').trim() !== '') {
          if (Date.now() > drained) break;
          await Bun.sleep(150);
        }
        expect(existsSync(cgroupProcs) && readFileSync(cgroupProcs, 'utf8').trim() !== '').toBe(false);
        const result: SpawnResult = await cap.result;
        expect(result.signalCode).toBe(signal);
      } finally {
        if (cap.proc.exitCode === null) cap.proc.kill('SIGKILL');
        void cap.result;
      }
    },
    45000,
  );
}

test.serial(
  'a base-run runs setup and command in one run unit under the leaf slice',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'base-units');
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const result: SpawnResult = await spawnReal(
      f,
      ['base-run', '--base', sha, '--', 'sh', '-c', `cat /proc/self/cgroup > "${out}/cmd.cg"`],
      worktree,
      { RUN_UNITS_OUT: out, AKROGON_RUN_SLICE: slice },
    ).result;
    expect(result.code, `stdout: ${result.stdout} stderr: ${result.stderr}`).toBe(0);
    expect(result.stderr.match(/^run [0-9a-f-]{36}$/gm)).toHaveLength(1);
    const setup: string = readFileSync(resolve(out, 'setup.cg'), 'utf8');
    const cmd: string = readFileSync(resolve(out, 'cmd.cg'), 'utf8');
    const scope: string | undefined = cmd.match(/akrogon-run-[0-9a-f-]+\.scope/)?.[0];
    expect(scope).toBeDefined();
    expect(setup).toBe(cmd);
    expect(cmd).toContain(`/${slice}/${scope}`);
    expect(await activeUnits('akrogon-run-*.scope')).toEqual([]);
  },
  45000,
);

test.serial(
  'admission counts live per-run reservations under the lock',
  async () => {
    const f: Fixture = await fixture();
    try {
      const out: string = outDir(f);
      yaml(resolve(f.root, 'issues/config.yaml'), { env: ['RUN_UNITS_OUT'], checks: {}, grounding: 'none' });
      const worktree: string = await leafWorktree(f, 'reserved');
      seedStat(f, 4 * GIB);
      // Peer A: live, unit present using 4 GiB -> reservation 12 GiB.
      const a: string = await seedRunRecord(f, { check: 'peer-a' });
      seedUnitStat(f, 'akrogon.slice', `akrogon-run-${a}.scope`, 4 * GIB);
      // Peer B: live, unit absent -> pending, full 16 GiB.
      await seedRunRecord(f, { check: 'peer-b' });
      // Waiting, ended and dead-pid records count 0.
      await seedRunRecord(f, { check: 'peer-c', state: 'waiting' });
      await seedRunRecord(f, { check: 'peer-d', state: 'ended' });
      const dead: Bun.Subprocess = Bun.spawn(['true']);
      await dead.exited;
      await seedRunRecord(f, { check: 'peer-e', pid: dead.pid, start_time: '1' });
      // usage 4 + A 12 + B 16 + own 16 = 48 -> denied.
      const admitted: Promise<Result> = cli(
        f,
        ['run-check', '--name', 'cand', '--', 'sh', '-c', `touch "${out}/admitted"`],
        worktree,
        { RUN_UNITS_OUT: out },
      );
      // Denial is deterministic: the candidate publishes a 'waiting' record and
      // stays there until A's reservation shrinks.
      const deadline: number = Date.now() + 20000;
      for (;;) {
        if (existsSync(resolve(out, 'admitted')))
          throw new Error('candidate admitted while reservations reach the limit');
        const waiting: Record<string, unknown> | undefined = (await runRecords(f)).find(
          (record) => record.check === 'cand' && record.state === 'waiting',
        );
        if (waiting !== undefined) break;
        if (Date.now() > deadline) throw new Error('candidate never reached a waiting record');
        await Bun.sleep(50);
      }
      // A's unit grows to 20 GiB -> reservation 0: 4 + 0 + 16 + 16 = 36 < 48.
      seedUnitStat(f, 'akrogon.slice', `akrogon-run-${a}.scope`, 20 * GIB);
      const result: Result = await admitted;
      expect(result.code).toBe(0);
      expect(existsSync(resolve(out, 'admitted'))).toBe(true);
    } finally {
      f.clean();
    }
  },
  45000,
);

test.serial(
  'a nested run-check inside a live run adds no record and no reservation',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'nested-res');
    const script: string = [
      `akrogon run-check --name inner -- sh -c 'touch "${out}/inner-held"; sleep 1'`,
      `grep -l -e 'check: outer' -e 'check: inner' "${f.home}/runs"/*.yaml | wc -l > "${out}/count"`,
    ].join('; ');
    const cap: RealCap = spawnReal(f, ['run-check', '--name', 'outer', '--', 'sh', '-c', script], worktree, {
      RUN_UNITS_OUT: out,
      AKROGON_RUN_SLICE: slice,
    });
    await waitPath(resolve(out, 'inner-held'));
    // The criterion is no *new* record and none named for the nested check:
    // sibling serial tests may leave records behind in the shared fixture.
    const during: Record<string, unknown>[] = await runRecords(f);
    expect(during.filter((record) => record.check === 'inner')).toHaveLength(0);
    expect(during.filter((record) => record.check === 'outer')).toHaveLength(1);
    const result: SpawnResult = await cap.result;
    expect(result.code).toBe(0);
    expect(readFileSync(resolve(out, 'count'), 'utf8').trim()).toBe('1');
  },
  45000,
);

test.serial(
  'run-check --leaf and --holder keep working and place units under the leaf slice and akrogon.slice',
  async () => {
    const f: Fixture = await fixture();
    try {
      const worktree: string = await leafWorktree(f, 'sliced');
      const overridePath: string = leaf(f, 'explicit', 'implement', {});
      const log: string = resolve(f.home, 'systemd-run.calls');
      const scoped: Result = await cli(f, ['run-check', '--name', 'wt', '--', 'true'], worktree, {
        FAKE_SYSTEMD_RUN_LOG: log,
      });
      expect(scoped.code).toBe(0);
      const overridden: Result = await cli(
        f,
        ['run-check', '--leaf', overridePath, '--name', 'lf', '--', 'true'],
        f.root,
        { FAKE_SYSTEMD_RUN_LOG: log },
      );
      expect(overridden.code).toBe(0);
      const holder: string = resolve(f.home, 'holder');
      mkdirSync(holder);
      const held: Result = await cli(f, ['run-check', '--holder', holder, '--name', 'hd', '--', 'true'], f.root, {
        FAKE_SYSTEMD_RUN_LOG: log,
      });
      expect(held.code).toBe(0);
      const calls: string[] = readFileSync(log, 'utf8').trim().split('\n');
      const scopeCalls: string[] = calls.filter((line) => line.includes('--scope'));
      expect(scopeCalls.some((line) => line.includes(`--slice=${expectedSlice('repo', 'sliced')}`))).toBe(true);
      expect(scopeCalls.some((line) => line.includes(`--slice=${expectedSlice('repo', 'explicit')}`))).toBe(true);
      expect(scopeCalls.some((line) => line.includes('--slice=akrogon.slice'))).toBe(true);
      expect(calls.filter((line) => line.includes('--unit=akrogon-run-')).length).toBeGreaterThanOrEqual(6);
    } finally {
      f.clean();
    }
  },
);

test.serial('skills name akrogon stop-run instead of the recorded-PID stop rule', () => {
  const root: string = resolve(import.meta.dir, '..');
  for (const file of [
    'skills/implement-issue/SKILL.md',
    'skills/implement-issue/worker-protocol.md',
    'skills/check-issue/SKILL.md',
  ]) {
    const text: string = readFileSync(resolve(root, file), 'utf8');
    expect(text, `${file} names stop-run`).toContain('akrogon stop-run');
    expect(text, `${file} keeps the recorded-PID rule`).not.toMatch(/recorded PID|by the PID it recorded/);
    expect(text, `${file} keeps the pattern-kill ban`).toMatch(/pkill -f/);
  }
});

test.serial(
  'a stale run record and unit are swept by the next run start',
  async () => {
    const f: Fixture = await fixture();
    const slice: string = testSlice();
    let stale: Bun.Subprocess | undefined;
    try {
      const worktree: string = await leafWorktree(f, 'sweeper');
      // A real stale scope under the test slice plus a record with a dead pid.
      stale = Bun.spawn(
        [
          'systemd-run',
          '--user',
          '--scope',
          '--quiet',
          `--slice=${slice}`,
          '--unit=akrogon-run-stale0',
          '--',
          'sleep',
          '300',
        ],
        {
          env: {
            ...process.env,
            DBUS_SESSION_BUS_ADDRESS: undefined,
            XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR ?? `/run/user/${uid}`,
          },
        },
      );
      const recordsDir: string = resolve(f.home, 'runs');
      mkdirSync(recordsDir, { recursive: true });
      const dead: Bun.Subprocess = Bun.spawn(['true']);
      await dead.exited;
      const token: string = randomUUID();
      writeFileSync(
        resolve(recordsDir, `${createHash('sha256').update(token).digest('hex')}.yaml`),
        Bun.YAML.stringify({
          token_hash: createHash('sha256').update(token).digest('hex'),
          pid: dead.pid,
          start_time: '1',
          boot_id: 'x',
          repo: 'repo',
          leaf: 'sweeper',
          check: 'old',
          state: 'live',
          since: new Date().toISOString(),
          run: 'stale0',
          slice,
          scope: 'gone.scope',
          unit: 'akrogon-run-stale0.scope',
        }),
      );
      writeFileSync(resolve(recordsDir, 'corrupt.yaml'), 'not: [yaml');
      const result: SpawnResult = await spawnReal(f, ['run-check', '--name', 'sweep', '--', 'true'], worktree, {
        AKROGON_RUN_SLICE: slice,
      }).result;
      expect(result.code).toBe(0);
      await waitInactive('akrogon-run-stale0.scope', 10000);
      const left: string[] = readdirSync(recordsDir).filter((name) => name.endsWith('.yaml'));
      expect(left).toEqual([]);
    } finally {
      if (stale !== undefined) {
        if (stale.exitCode === null) stale.kill('SIGKILL');
        await stale.exited;
      }
      await stopTestSlice(slice);
      f.clean();
    }
  },
  45000,
);
