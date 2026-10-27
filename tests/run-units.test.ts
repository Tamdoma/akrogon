import { afterAll, test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
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
  storeDir,
  yaml,
  type Fixture,
} from './helpers';
import { command, finishCaptured, spawnFiles, quote, run, type Result, type SpawnResult } from '../src/shell';
import { verifyRunSchema, type VerifyRun } from '../src/verify';
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
const createdSlices: Set<string> = new Set();
function testSlice(): string {
  const slice: string = `akrogon-test-${process.pid}-${serial++}.slice`;
  createdSlices.add(slice);
  return slice;
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
  for (const slice of createdSlices) {
    await stopTestSlice(slice);
  }
  if (shared !== undefined) {
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

// The suite's run-check cuts DBUS_SESSION_BUS_ADDRESS and strips
// XDG_RUNTIME_DIR; supply both so systemctl --user reaches the manager.
function sysctl(...args: string[]): Promise<SpawnResult> {
  const { child, captured } = spawnFiles([
    'env',
    `XDG_RUNTIME_DIR=/run/user/${uid}`,
    'DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/' + uid + '/bus',
    'systemctl',
    '--user',
    ...args,
  ]);
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

async function activeUnits(pattern: string): Promise<string[]> {
  const result: Result = await sysctl('list-units', '--all', '--no-legend', pattern);
  return result.stdout
    .split('\n')
    .map((line: string) => line.trim().split(/\s+/)[0] ?? '')
    .filter((name: string) => name !== '');
}

// Run scopes of this test file's own slice only: the enclosing run-check and
// other seats' runs are live akrogon-run scopes too and must not count.
async function fixtureUnits(slice: string): Promise<string[]> {
  return (await activeUnits('akrogon-run-*.scope')).filter((name) =>
    existsSync(resolve(unitDir('/sys/fs/cgroup', slice, name), 'cgroup.procs')),
  );
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
    expect(await fixtureUnits(slice)).toEqual([]);
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
      const deadline: number = Date.now() + 20000;
      for (;;) {
        const live: Record<string, unknown> | undefined = (await liveRuns(f)).find((record) => record.check === name);
        if (live !== undefined) {
          ids[name] = live.run as string;
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
        const liveDeadline: number = Date.now() + 15000;
        while (unit === undefined) {
          const live: Record<string, unknown> | undefined = (await liveRuns(f)).find(
            (record) => record.check === 'reap',
          );
          if (live !== undefined) unit = live.unit as string;
          else if (Date.now() > liveDeadline) throw new Error('No live reap record');
          else await Bun.sleep(50);
        }
        await waitPath(unitDir('/sys/fs/cgroup', slice, unit));
        await waitActive(unit);
        cap.proc.kill(signal);
        // One deadline measured at the signal: TimeoutStopUSec (5 s) plus the
        // 5 s assertion window from the brief must cover unit inactivity,
        // guard exit and descendant drain.
        const cgroupProcs: string = resolve(unitDir('/sys/fs/cgroup', slice, unit), 'cgroup.procs');
        const guard: string = unit.replace(/\.scope$/, '-guard.service');
        const deadline: number = Date.now() + 10000;
        let scopeOff: boolean = false;
        let guardOff: boolean = false;
        let drained: boolean = false;
        while (!(scopeOff && guardOff && drained) && Date.now() < deadline) {
          scopeOff ||= (await sysctl('is-active', unit)).code !== 0;
          guardOff ||= (await sysctl('is-active', guard)).code !== 0;
          drained = !existsSync(cgroupProcs) || readFileSync(cgroupProcs, 'utf8').trim() === '';
          if (!(scopeOff && guardOff && drained)) await Bun.sleep(150);
        }
        expect(scopeOff, `${unit} not inactive within the criterion deadline`).toBe(true);
        expect(drained, `${unit} descendants still present within the criterion deadline`).toBe(true);
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
  'a verify runs setup and each command in its own run unit under the leaf slice',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'verify-units');
    const config: string = resolve(f.root, 'issues/config.yaml');
    const before: string = readFileSync(config, 'utf8');
    yaml(config, { ...(Bun.YAML.parse(before) as object), checks: { cg: `cat /proc/self/cgroup > "${out}/cmd.cg"` } });
    writeFileSync(
      resolve(f.root, '.env'),
      'AKROGON_HOME=declared\nAKROGON_LEAF_TEMP_ROOT=declared\nRUN_UNITS_OUT=declared\n',
    );
    const result: SpawnResult = await spawnReal(f, ['verify'], worktree, {
      RUN_UNITS_OUT: out,
      AKROGON_RUN_SLICE: slice,
    }).result;
    writeFileSync(config, before);
    expect(result.code, `stdout: ${result.stdout} stderr: ${result.stderr}`).toBe(0);
    expect(result.stderr.match(/^run [0-9a-f-]{36}$/gm)).toHaveLength(3);
    const setup: string = readFileSync(resolve(out, 'setup.cg'), 'utf8');
    const cmd: string = readFileSync(resolve(out, 'cmd.cg'), 'utf8');
    const setupScope: string | undefined = setup.match(/akrogon-run-[0-9a-f-]+\.scope/)?.[0];
    const scope: string | undefined = cmd.match(/akrogon-run-[0-9a-f-]+\.scope/)?.[0];
    expect(setupScope).toBeDefined();
    expect(scope).toBeDefined();
    expect(setupScope).not.toBe(scope);
    expect(setup).toContain(`/${slice}/${setupScope}`);
    expect(cmd).toContain(`/${slice}/${scope}`);
    expect(await fixtureUnits(slice)).toEqual([]);
  },
  45000,
);

test.serial('a verify places its scope under the resolved leaf slice by default', async () => {
  const f: Fixture = await fixture();
  try {
    fakeAkrogon(f);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { ok: 'true' },
      grounding: 'none',
    });
    const worktree: string = await leafWorktree(f, 'verify-place');
    const log: string = resolve(f.home, 'systemd-run.calls');
    await cli(f, ['verify'], worktree, {
      FAKE_SYSTEMD_RUN_LOG: log,
    });
    const calls: string[] = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
    const scoped: string[] = calls.filter((line) => line.includes('--scope'));
    expect(scoped.length).toBeGreaterThan(0);
    expect(scoped.some((line) => line.includes(`--slice=${expectedSlice('repo', 'verify-place')}`))).toBe(true);
  } finally {
    f.clean();
  }
});

test.serial(
  'a top-level run starts at once over the old memory reading and inside the old spacing window',
  async () => {
    const f: Fixture = await fixture();
    try {
      const out: string = outDir(f);
      yaml(resolve(f.root, 'issues/config.yaml'), { env: ['RUN_UNITS_OUT'], checks: {}, grounding: 'none' });
      const worktree: string = await leafWorktree(f, 'unthrottled');
      // Seeded above the removed 48 GiB wall; a last-start inside the removed
      // 30 s spacing window — both must be ignored now (operator 2026-10-14).
      seedStat(f, 60 * GIB, 4 * GIB);
      mkdirSync(resolve(f.home, 'runs'), { recursive: true });
      writeFileSync(resolve(f.home, 'runs', 'last-start'), String(Date.now()));
      const a: Promise<Result> = cli(f, ['run-check', '--name', 'a', '--', 'sh', '-c', `touch "${out}/a"`], worktree, {
        RUN_UNITS_OUT: out,
      });
      const b: Promise<Result> = cli(f, ['run-check', '--name', 'b', '--', 'sh', '-c', `touch "${out}/b"`], worktree, {
        RUN_UNITS_OUT: out,
      });
      const [ra, rb]: [Result, Result] = await Promise.all([a, b]);
      expect(ra.code).toBe(0);
      expect(rb.code).toBe(0);
      expect(existsSync(resolve(out, 'a'))).toBe(true);
      expect(existsSync(resolve(out, 'b'))).toBe(true);
    } finally {
      f.clean();
    }
  },
  45000,
);

test.serial(
  'a run-check passes $-arguments byte for byte through the real run unit and a nested run-check',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'literal-argv');
    const args: string[] = ['a ${base} b', '${file.key}', '$HOME', '$${x}'];
    const recorder = (file: string): string =>
      `sh -c 'printf "%s\\n" "$1" "$2" "$3" "$4" > "${file}"; cat /proc/self/cgroup > "${file}.cg"' sh ${args
        .map((arg) => `'${arg}'`)
        .join(' ')}`;
    const script: string = [
      recorder(resolve(out, 'outer')),
      `akrogon run-check --name inner -- ${recorder(resolve(out, 'inner'))}`,
    ].join('; ');
    const result: SpawnResult = await spawnReal(
      f,
      ['run-check', '--name', 'outer', '--', 'sh', '-c', script],
      worktree,
      { RUN_UNITS_OUT: out, AKROGON_RUN_SLICE: slice },
    ).result;
    expect(result.code, `stdout: ${result.stdout} stderr: ${result.stderr}`).toBe(0);
    const expected: string = `${args.join('\n')}\n`;
    expect(readFileSync(resolve(out, 'outer'), 'utf8')).toBe(expected);
    expect(readFileSync(resolve(out, 'inner'), 'utf8')).toBe(expected);
    const outerCg: string = readFileSync(resolve(out, 'outer.cg'), 'utf8');
    const scope: string | undefined = outerCg.match(/akrogon-run-[0-9a-f-]+\.scope/)?.[0];
    expect(scope).toBeDefined();
    expect(outerCg).toContain(`/${slice}/${scope}`);
    expect(readFileSync(resolve(out, 'inner.cg'), 'utf8')).toBe(outerCg);
    expect(await fixtureUnits(slice)).toEqual([]);
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

test.serial('skills name the run-check keeping rule, its log reader and its exemptions', () => {
  const root: string = resolve(import.meta.dir, '..');
  const ruled: string[] = [
    'skills/implement-issue/SKILL.md',
    'skills/implement-issue/worker-protocol.md',
    'skills/implement-issue/brief-template.md',
    'skills/check-issue/SKILL.md',
    'skills/merge-issue/SKILL.md',
    'skills/plan-issue/SKILL.md',
  ];
  for (const file of ruled) {
    const text: string = readFileSync(resolve(root, file), 'utf8');
    expect(text, `${file} names the run-check rule`).toContain('akrogon run-check');
    expect(text, `${file} names the log reader`).toContain('akrogon log');
    expect(text, `${file} exempts verify`).toContain('akrogon verify');
    expect(text, `${file} exempts the merged move`).toContain('merged');
    expect(text, `${file} exempts fetch`).toContain('fetch');
    expect(text, `${file} exempts push`).toContain('push');
  }
  const checkIssue: string = readFileSync(resolve(root, 'skills/check-issue/SKILL.md'), 'utf8');
  expect(checkIssue, 'check-issue allows direct-route logs at the chart holder').toMatch(/<chart>\/direct/);
  const implementIssue: string = readFileSync(resolve(root, 'skills/implement-issue/SKILL.md'), 'utf8');
  expect(implementIssue, 'implement-issue keeps standalone outside the rule').toMatch(/standalone[^\n]*outside/i);
  expect(implementIssue, 'implement-issue names the direct-route holder').toContain('--holder <chart>/direct');
});

test.serial('skills name akrogon stop-run instead of the recorded-PID stop rule', () => {
  const root: string = resolve(import.meta.dir, '..');
  for (const file of [
    'skills/implement-issue/SKILL.md',
    'skills/implement-issue/worker-protocol.md',
    'skills/check-issue/SKILL.md',
  ]) {
    const text: string = readFileSync(resolve(root, file), 'utf8');
    expect(text, `${file} names stop-run`).toContain('akrogon stop-run');
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
        // The sleep is a systemd-owned scope member, not a descendant of the
        // systemd-run child: the kill cannot reach it, so stop the scope.
        await sysctl('stop', 'akrogon-run-stale0.scope');
        if (stale.exitCode === null) stale.kill('SIGKILL');
        await stale.exited;
      }
      await stopTestSlice(slice);
      f.clean();
    }
  },
  45000,
);

function verifyReceipts(f: Fixture): VerifyRun[] {
  const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => verifyRunSchema.parse(JSON.parse(line)));
}

// A full replace: keys dropped between rewrites must not linger for the next test.
function rewriteConfig(f: Fixture, config: object): void {
  yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', ...config });
}

// The shared fixture's ledger keeps receipts from earlier tests: a pass is
// found by its caller leaf slug, not by position.
function leafReceipts(f: Fixture, slug: string): VerifyRun[] {
  return verifyReceipts(f).filter((run) => run.leaf === slug);
}

async function waitReceipt(f: Fixture, slug: string, ms: number = 15000): Promise<VerifyRun> {
  const begun: number = Date.now();
  for (;;) {
    const first: VerifyRun | undefined = leafReceipts(f, slug)[0];
    if (first !== undefined) return first;
    if (Date.now() - begun > ms) throw new Error(`No verify receipt for ${slug}`);
    await Bun.sleep(50);
  }
}

async function waitCheckRecord(f: Fixture, name: string, ms: number = 15000): Promise<Record<string, unknown>> {
  const begun: number = Date.now();
  for (;;) {
    const live: Record<string, unknown> | undefined = (await liveRuns(f)).find((record) => record.check === name);
    if (live !== undefined) return live;
    if (Date.now() - begun > ms) throw new Error(`No live record for ${name}`);
    await Bun.sleep(50);
  }
}

test.serial(
  'a verify nested inside a full run-check completes without queuing behind its parent',
  async () => {
    const { f, slice } = await realFixture();
    const worktree: string = await leafWorktree(f, 'pass-nested-full');
    rewriteConfig(f, {
      setup: 'mkdir -p node_modules',
      pass_env: ['AKROGON_LEAF_TEMP_ROOT'],
      checks: { test: 'true' },
      full: ['test'],
    });
    const cap: RealCap = spawnScoped(
      f,
      'callerA.scope',
      ['run-check', '--name', 'test', '--', process.execPath, entry, 'verify'],
      worktree,
      { AKROGON_RUN_SLICE: slice },
    );
    const receipt: VerifyRun = await waitReceipt(f, 'pass-nested-full');
    try {
      const deadline: number = Date.now() + 15000;
      while (cap.proc.exitCode === null) {
        const waiting: boolean = (await runRecords(f)).some(
          (record) => record.check === 'test' && record.state === 'waiting',
        );
        expect(waiting, 'the nested pass must not queue behind its own full parent').toBe(false);
        if (Date.now() > deadline) throw new Error('nested verify did not finish');
        await Bun.sleep(50);
      }
      const result: SpawnResult = await cap.result;
      expect(result.code, `stdout: ${result.stdout} stderr: ${result.stderr}`).toBe(0);
      expect(leafReceipts(f, 'pass-nested-full')[0].commands[0].exit).toBe(0);
    } finally {
      if (cap.proc.exitCode === null) {
        const stopped: SpawnResult = await spawnScoped(f, 'callerA.scope', ['stop-run', receipt.run], worktree).result;
        expect(stopped.code).toBe(0);
        await cap.result;
      }
      await waitInactive(`akrogon-verify-${receipt.run}.service`);
    }
  },
  45000,
);

test.serial(
  'a repeat verify during checkout removal joins the live pass and returns its cleanup failure',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'pass-cleanup-join');
    rewriteConfig(f, { setup: 'mkdir -p node_modules', checks: { test: 'printf cleanup-proof' } });
    const bin: string = resolve(f.home, 'cleanup-bin');
    mkdirSync(bin);
    const removing: string = resolve(out, 'removing');
    const release: string = resolve(out, 'release-removal');
    const joinedOut: string = resolve(out, 'joined-out');
    const joinedErr: string = resolve(out, 'joined-err');
    const git: string = await command(['sh', '-c', 'command -v git']);
    writeFileSync(
      resolve(bin, 'git'),
      [
        '#!/bin/sh',
        'if [ "$1" = worktree ] && [ "$2" = remove ]; then',
        `  touch ${quote(removing)}`,
        `  while [ ! -e ${quote(release)} ]; do sleep 0.05; done`,
        '  exit 1',
        'fi',
        `exec ${quote(git)} "$@"`,
        '',
      ].join('\n'),
      { mode: 0o755 },
    );
    const env: NodeJS.ProcessEnv = {
      AKROGON_RUN_SLICE: slice,
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    };
    const first: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, env);
    const receipt: VerifyRun = await waitReceipt(f, 'pass-cleanup-join');
    let joined: RealCap | undefined;
    try {
      await waitPath(removing);
      expect(leafReceipts(f, 'pass-cleanup-join')[0].end).toBeDefined();
      joined = spawnScoped(
        f,
        'callerA.scope',
        [
          'run-check',
          '--name',
          'repeat',
          '--',
          'sh',
          '-c',
          `${quote(process.execPath)} ${quote(entry)} verify --known-red >${quote(joinedOut)} 2>${quote(joinedErr)}`,
        ],
        worktree,
        env,
      );
      await waitPath(joinedOut);
      const deadline: number = Date.now() + 15000;
      while (readFileSync(joinedOut, 'utf8') === '') {
        if (Date.now() > deadline) throw new Error('repeat verify produced no output');
        await Bun.sleep(50);
      }
      writeFileSync(release, '');
      const [original, repeat]: SpawnResult[] = await Promise.all([first.result, joined.result]);
      expect(original.code).toBe(2);
      expect(repeat.code).toBe(original.code);
      expect(readFileSync(joinedErr, 'utf8')).toContain(`run ${receipt.run}`);
      expect(readFileSync(joinedOut, 'utf8')).toContain('verify test: 0');
      expect(leafReceipts(f, 'pass-cleanup-join')).toHaveLength(1);
    } finally {
      writeFileSync(release, '');
      await first.result;
      if (joined !== undefined) await joined.result;
      await waitInactive(`akrogon-verify-${receipt.run}.service`);
    }
  },
  45000,
);

test.serial(
  'a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'pass-survivor');
    rewriteConfig(f, {
      setup: 'mkdir -p node_modules',
      env: [],
      checks: { test: `sleep 4 && touch ${quote(resolve(out, 'check-done'))}` },
    });
    const cap: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
      AKROGON_RUN_SLICE: slice,
    });
    try {
      await waitCheckRecord(f, 'test');
      killTree(cap.proc);
      const result: SpawnResult = await cap.result;
      expect(result.signalCode).toBe('SIGKILL');
      const deadline: number = Date.now() + 30000;
      let receipt: VerifyRun | undefined;
      while (receipt === undefined || receipt.end === undefined) {
        receipt = leafReceipts(f, 'pass-survivor')[0];
        if (receipt?.end !== undefined) break;
        if (Date.now() > deadline) throw new Error('pass receipt still incomplete after the caller died');
        await Bun.sleep(200);
      }
      expect(receipt.setup).toBe(0);
      expect(receipt.commands).toHaveLength(1);
      expect(receipt.commands[0].exit).toBe(0);
      expect(receipt.commands[0].log).toContain('check-');
      expect(existsSync(receipt.commands[0].log)).toBe(true);
      expect(existsSync(receipt.path)).toBe(false);
      expect(existsSync(resolve(out, 'check-done'))).toBe(true);
    } finally {
      if (cap.proc.exitCode === null) killTree(cap.proc);
      void cap.result.catch(() => undefined);
    }
  },
  90000,
);

test.serial(
  'a repeat verify joins the live pass while a different scope or tree starts its own',
  async () => {
    const { f, slice } = await realFixture();
    const worktree: string = await leafWorktree(f, 'pass-join');
    rewriteConfig(f, { setup: 'mkdir -p node_modules', env: [], checks: { test: 'sleep 6' } });
    const first: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
      AKROGON_RUN_SLICE: slice,
    });
    const receipt: VerifyRun = await waitReceipt(f, 'pass-join');
    let joined: RealCap | undefined;
    let other: RealCap | undefined;
    let thirdCap: RealCap | undefined;
    try {
      // Both repeats launch while the first pass still sleeps: the same-key
      // call must join it, the different-scope call must start its own.
      joined = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
        AKROGON_RUN_SLICE: slice,
      });
      other = spawnScoped(f, 'callerB.scope', ['verify'], worktree, {
        AKROGON_RUN_SLICE: slice,
      });
      const deadline: number = Date.now() + 15000;
      while (leafReceipts(f, 'pass-join').length < 2) {
        if (Date.now() > deadline) throw new Error('different scope started no second pass');
        await Bun.sleep(50);
      }
      // A same-scope, same-caller call on a different tree must start its own
      // pass while the first is still live, never join it.
      writeFileSync(resolve(worktree, 't2'), 't2\n');
      await command(['git', 'add', 't2'], worktree);
      await command(['git', 'commit', '-qm', 't2'], worktree);
      thirdCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
        AKROGON_RUN_SLICE: slice,
      });
      while (leafReceipts(f, 'pass-join').length < 3) {
        if (Date.now() > deadline) throw new Error('different tree started no third pass');
        await Bun.sleep(50);
      }
      const [joinedResult, r1, r2, third] = await Promise.all([
        joined.result,
        first.result,
        other.result,
        thirdCap.result,
      ]);
      expect(joinedResult.code, `stderr: ${joinedResult.stderr}`).toBe(0);
      expect(joinedResult.stderr).toContain(`run ${receipt.run}`);
      expect(joinedResult.stdout).toContain('verify test: 0');
      expect(joinedResult.stdout).toContain(': green');
      expect(r1.code, `stderr: ${r1.stderr}`).toBe(0);
      expect(r2.code, `stderr: ${r2.stderr}`).toBe(0);
      expect(third.code, `stderr: ${third.stderr}`).toBe(0);
      expect(third.stderr).toMatch(/run [0-9a-f-]{36}/);
      expect(third.stderr).not.toContain(`run ${receipt.run}`);
      expect(leafReceipts(f, 'pass-join')).toHaveLength(3);
    } finally {
      for (const cap of [first, joined, other, thirdCap])
        if (cap !== undefined && cap.proc.exitCode === null) killTree(cap.proc);
    }
  },
  90000,
);

test.serial(
  'stop-run <pass id> stops the whole pass, another scope is refused, and a stop leaves no reusable receipt',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'pass-stop');
    rewriteConfig(f, {
      setup: 'mkdir -p node_modules',
      env: [],
      checks: { early: 'sleep 30', late: `touch ${quote(resolve(out, 'late-done'))}` },
    });
    const cap: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
      AKROGON_RUN_SLICE: slice,
    });
    const receipt: VerifyRun = await waitReceipt(f, 'pass-stop');
    try {
      await waitCheckRecord(f, 'early');
      const refused: SpawnResult = await spawnScoped(f, 'callerB.scope', ['stop-run', receipt.run], worktree).result;
      expect(refused.code).not.toBe(0);
      expect((await sysctl('is-active', `akrogon-verify-${receipt.run}.service`)).code).toBe(0);
      const stopped: SpawnResult = await spawnScoped(f, 'callerA.scope', ['stop-run', receipt.run], worktree).result;
      expect(stopped.code).toBe(0);
      await waitInactive(`akrogon-verify-${receipt.run}.service`);
      const result: SpawnResult = await cap.result;
      expect(result.code).not.toBe(0);
      const settled: VerifyRun = leafReceipts(f, 'pass-stop')[0];
      expect(settled.end).toBeUndefined();
      expect(settled.commands.some((entry) => entry.name === 'late')).toBe(false);
      expect(existsSync(resolve(out, 'late-done'))).toBe(false);
      // A stopped pass is dead: the repeat verifies under a new pass id.
      rewriteConfig(f, {
        checks: { done: `touch ${quote(resolve(out, 'rerun-done'))}` },
      });
      const repeat: SpawnResult = await spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
        AKROGON_RUN_SLICE: slice,
      }).result;
      expect(repeat.code, `stderr: ${repeat.stderr}`).toBe(0);
      expect(repeat.stderr).toContain('run ');
      expect(repeat.stderr).not.toContain(`run ${receipt.run}`);
      expect(existsSync(resolve(out, 'rerun-done'))).toBe(true);
    } finally {
      if (cap.proc.exitCode === null) killTree(cap.proc);
      void cap.result.catch(() => undefined);
    }
  },
  90000,
);

test.serial(
  'stop-run <pass id> while a full check waits for admission ends the pass before the check starts',
  async () => {
    const { f, slice } = await realFixture();
    const out: string = outDir(f);
    const worktree: string = await leafWorktree(f, 'pass-full');
    rewriteConfig(f, {
      setup: 'mkdir -p node_modules',
      env: [],
      checks: { full1: `touch ${quote(resolve(out, 'full-ran'))}` },
      full: ['full1'],
    });
    await seedRunRecord(f, { check: 'holder', full: true });
    const cap: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
      AKROGON_RUN_SLICE: slice,
    });
    const receipt: VerifyRun = await waitReceipt(f, 'pass-full');
    try {
      const deadline: number = Date.now() + 15000;
      for (;;) {
        const waiting: boolean = (await runRecords(f)).some(
          (record) => record.check === 'full1' && record.state === 'waiting',
        );
        if (waiting) break;
        if (Date.now() > deadline) throw new Error('full1 never reached the admission line');
        await Bun.sleep(50);
      }
      const stopped: SpawnResult = await spawnScoped(f, 'callerA.scope', ['stop-run', receipt.run], worktree).result;
      expect(stopped.code).toBe(0);
      await waitInactive(`akrogon-verify-${receipt.run}.service`);
      const result: SpawnResult = await cap.result;
      expect(result.code).not.toBe(0);
      expect(existsSync(resolve(out, 'full-ran'))).toBe(false);
      expect(leafReceipts(f, 'pass-full')[0].end).toBeUndefined();
    } finally {
      if (cap.proc.exitCode === null) killTree(cap.proc);
      void cap.result.catch(() => undefined);
    }
  },
  90000,
);

test.serial(
  'a pass keeps the starting caller scope as owner of its check runs, so plain stop-run still reaches them',
  async () => {
    const { f, slice } = await realFixture();
    const worktree: string = await leafWorktree(f, 'pass-owner');
    rewriteConfig(f, { setup: 'mkdir -p node_modules', env: [], checks: { slow: 'sleep 30' } });
    const cap: RealCap = spawnScoped(f, 'callerA.scope', ['verify'], worktree, {
      AKROGON_RUN_SLICE: slice,
    });
    try {
      const record: Record<string, unknown> = await waitCheckRecord(f, 'slow');
      expect(record.scope).toBe('callerA.scope');
      const checkId: string = record.run as string;
      const stopped: SpawnResult = await spawnScoped(f, 'callerA.scope', ['stop-run', checkId], worktree).result;
      expect(stopped.code).toBe(0);
      const result: SpawnResult = await cap.result;
      expect(result.code).not.toBe(0);
      const deadline: number = Date.now() + 30000;
      let receipt: VerifyRun | undefined;
      while (receipt === undefined || receipt.end === undefined) {
        receipt = leafReceipts(f, 'pass-owner')[0];
        if (receipt?.end !== undefined) break;
        if (Date.now() > deadline) throw new Error('pass did not complete after its check was stopped');
        await Bun.sleep(200);
      }
      expect(receipt.commands[0].exit).not.toBe(0);
    } finally {
      if (cap.proc.exitCode === null) killTree(cap.proc);
      void cap.result.catch(() => undefined);
    }
  },
  90000,
);
