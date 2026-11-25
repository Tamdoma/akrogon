// Criterion 9: akrogon direct-drop <slug> --chart <chart folder> ends an unmerged direct attempt:
// cancels its live runs, stops the leaf slice and run scopes, removes worktree and branch, moves the
// owner folder to <chart>/direct/<owner>, and refuses the closed shapes without moving or removing anything.
import { test, expect } from 'bun:test';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, leaf, storeDir, type Fixture } from './helpers';
import { adopt, hcFixture, stopCoresAfterFile, type HcFixture } from './hc-fixture';
import { command, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
import { flockHold } from '../src/flock';

stopCoresAfterFile();

type Raw = Record<string, unknown>;

// A plain terminal in the fixture core, labelled and adopted the way a charting terminal is:
// the door and the reviewer are ordinary terminals the drop must never touch.
async function standin(f: HcFixture, name: string): Promise<string> {
  const started = await f.core.hc([
    'run',
    '--bg',
    '--json',
    '--no-parent',
    '--name',
    name,
    '--cwd',
    f.root,
    '--label',
    'akrogon=1',
    '--label',
    'herdr.space=sp-' + f.core.session,
    '--label',
    'herdr.tab=' + name,
    '--',
    'cat',
  ]);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

// The herdr-app tab.rename calls akrogon made, as phase.test.ts reads them.
function renames(f: HcFixture): string[][] {
  return f.core
    .appCalls()
    .filter((call) => call.argv[1] === 'tab.rename')
    .map((call) => [call.argv[3], call.argv[5]]);
}

async function branchExists(f: Fixture, slug: string): Promise<boolean> {
  const listing: string = await command(['git', 'branch', '--list', slug], f.root);
  return listing.trim() !== '';
}

// A real worktree on the leaf branch, as the create verb would have made one.
async function seedWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  return worktree;
}

// The chart folder as chart-issues knows it, repo-relative, with the chart's own file inside.
function chartFolder(f: Fixture, slug: string): { rel: string; abs: string } {
  const abs: string = resolve(f.root, 'issues/chart', slug);
  mkdirSync(abs, { recursive: true });
  writeFileSync(resolve(abs, 'CHART.md'), '# Chart\n');
  return { rel: 'issues/chart/' + slug, abs };
}

// A direct leaf in the open area: owner folder chart-x with its ISSUE.md, leaf state seeded raw
// (the schema has no direct field yet, so leaf() writes it as plain yaml) plus the seat refs.
function seedDirectLeaf(
  f: HcFixture,
  slug: string,
  seats: { door: string; reviewer: string },
  extra: Raw = {},
): string {
  const path: string = leaf(
    f,
    slug,
    // leaf() spreads extra last, so a phase in extra overrides this positional default.
    'implement',
    {
      created: new Date().toISOString(),
      direct: true,
      frozen: {},
      seat: {
        A: { session: f.core.session, address: seats.door },
        B: { session: f.core.session, address: seats.reviewer },
      },
      ...extra,
    },
    'chart-x',
  );
  writeFileSync(resolve(f.root, 'issues/open/chart-x/ISSUE.md'), '# chart-x\n');
  return path;
}

function readStateRaw(path: string): Raw {
  return z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8')));
}

// The hc calls akrogon made, one argv per line, from the fixture's recording shim.
function shimLines(f: HcFixture): string[] {
  return existsSync(f.core.shimLog)
    ? readFileSync(f.core.shimLog, 'utf8')
        .split('\n')
        .filter((line: string) => line !== '')
    : [];
}

function stopLines(f: HcFixture): string[] {
  return existsSync(f.systemctl.log)
    ? readFileSync(f.systemctl.log, 'utf8')
        .split('\n')
        .filter((line: string) => line.includes(' stop '))
    : [];
}

function stoppedKeys(f: HcFixture): string[] {
  const file: string = resolve(f.home, 'stopped.yaml');
  if (!existsSync(file)) return [];
  const parsed: Raw | null = Bun.YAML.parse(readFileSync(file, 'utf8')) as Raw | null;
  return Object.keys(parsed ?? {}).sort();
}

function leafRow(f: HcFixture, stdout: string, slug: string): Raw | undefined {
  const envelope = z
    .object({
      repos: z.array(z.object({ name: z.string(), leaves: z.array(z.object({ slug: z.string() }).loose()) })),
    })
    .parse(JSON.parse(stdout));
  const repo = envelope.repos.find((r) => r.name === f.repo);
  return repo?.leaves.find((row) => row.slug === slug);
}

// Field 22 of /proc/<pid>/stat, the run record's writer-liveness proof (tests/run-units.test.ts shape).
function statStart(pid: number): string {
  const stat: string = readFileSync('/proc/' + pid + '/stat', 'utf8');
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

function bootId(): string {
  return readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
}

// A live run record of the leaf, backed by a real sleeper pid: research-tests 6i's fake-units
// construction. The fake systemctl db gains the leaf slice, the run scope and its guard so the
// drop's stops succeed and land in the log. Returns the record identity for assertions.
function seedLiveRun(
  f: HcFixture,
  slug: string,
): { run: string; unit: string; guard: string; slice: string; sleeper: Bun.Subprocess } {
  const run: string = randomUUID();
  const token: string = randomUUID();
  const hash: string = createHash('sha256').update(token).digest('hex');
  const sleeper: Bun.Subprocess = Bun.spawn(['sleep', '60'], { stdout: 'ignore', stderr: 'ignore' });
  const slice: string = leafSlice({ name: f.repo }, slug, f.home);
  const unit: string = 'akrogon-run-' + run + '.scope';
  const guard: string = 'akrogon-run-' + run + '-guard.service';
  const dir: string = resolve(f.home, 'runs');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, hash + '.yaml'),
    Bun.YAML.stringify({
      token_hash: hash,
      pid: sleeper.pid,
      start_time: statStart(sleeper.pid),
      boot_id: bootId(),
      repo: f.repo,
      leaf: slug,
      check: 'test',
      state: 'live',
      since: new Date().toISOString(),
      run,
      slice,
      scope: 'door.scope',
      unit,
    }),
  );
  writeFileSync(
    f.systemctl.db,
    JSON.stringify({
      units: [
        { unit: slice, sub: 'active' },
        { unit, sub: 'active' },
        { unit: guard, sub: 'active' },
      ],
    }),
  );
  return { run, unit, guard, slice, sleeper };
}

function runRecords(f: HcFixture): Raw[] {
  const dir: string = resolve(f.home, 'runs');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name: string) => name.endsWith('.yaml'))
    .map((name: string) =>
      z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(resolve(dir, name), 'utf8'))),
    );
}

// The state a refusal must leave: the owner folder unmoved, the worktree and the branch in place.
async function expectUntouched(f: HcFixture, slug: string, worktree: string): Promise<void> {
  expect(existsSync(resolve(f.root, 'issues/open/chart-x'))).toBe(true);
  expect(existsSync(resolve(f.root, 'issues/open/chart-x', slug, 'state.yaml'))).toBe(true);
  expect(existsSync(worktree)).toBe(true);
  expect(await branchExists(f, slug)).toBe(true);
}

test('direct-drop cancels the run, stops slice and scopes, removes worktree and branch, moves the owner folder', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  let sleeper: Bun.Subprocess | undefined;
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const doorPid: number | null = (await f.core.get(door)).pid;
    const reviewerPid: number | null = (await f.core.get(reviewer)).pid;
    const worktree: string = await seedWorktree(f, 'fix-alpha');
    const leafPath: string = seedDirectLeaf(f, 'fix-alpha', { door, reviewer }, { worktree, phase: 'check.review' });
    const saved: string[] = ['plan.md', 'review-B.md', 'implementation/report.md', 'implementation/check-leaf.log'];
    mkdirSync(resolve(leafPath, 'implementation'));
    for (const file of saved) writeFileSync(resolve(leafPath, file), file);
    const seeded = seedLiveRun(f, 'fix-alpha');
    sleeper = seeded.sleeper;
    const chart = chartFolder(f, 'chart-x');
    mkdirSync(resolve(chart.abs, 'direct'));
    writeFileSync(resolve(chart.abs, 'direct/check-chart.log'), 'chart capture');
    const enclosed: Result = await cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, {
      ...f.env,
      AKROGON_CAPTURES: JSON.stringify([{ owner: resolve(leafPath, '..'), run: seeded.run }]),
    });
    expect(enclosed.code).not.toBe(0);
    expect(enclosed.stderr).toContain(seeded.run);
    await expectUntouched(f, 'fix-alpha', worktree);
    const drop = (): Promise<Result> => cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, f.env);
    const phaseState: Raw = readStateRaw(leafPath);
    const phaseLock = await flockHold(resolve(f.home, '.lock'), '-x');
    const raced: Promise<Result> = drop();
    try {
      // Simulate the phase writer holding the lock across its eligibility read and state write.
      expect(await Promise.race([raced.then(() => 'exited'), Bun.sleep(600).then(() => 'waiting')])).toBe('waiting');
      writeFileSync(resolve(leafPath, 'state.yaml'), Bun.YAML.stringify({ ...phaseState, phase: 'merge' }));
    } finally {
      await phaseLock.release();
      await raced;
    }
    expect((await raced).code).not.toBe(0);
    expect((await raced).stderr).toContain('phase merge');
    await expectUntouched(f, 'fix-alpha', worktree);
    writeFileSync(resolve(leafPath, 'state.yaml'), Bun.YAML.stringify(phaseState));

    writeFileSync(f.core.shimLog, '');
    const captureLock = await flockHold(resolve(leafPath, '..', '.lock'), '-s');
    const dropping: Promise<Result> = drop();
    try {
      // A capture holding the owner's shared lock can finish publishing before the move.
      expect(await Promise.race([dropping.then(() => 'exited'), Bun.sleep(600).then(() => 'waiting')])).toBe('waiting');
      const published: string = 'implementation/published-while-held.log';
      writeFileSync(resolve(leafPath, published), published);
      saved.push(published);
    } finally {
      await captureLock.release();
      await dropping;
    }
    const dropped: Result = await dropping;
    expect(dropped.code, dropped.stderr).toBe(0);
    // The drop's own hc calls, captured before the status read, which probes sessions of its own.
    const dropCalls: string[] = shimLines(f);
    // The live run record is cancelled, the leaf slice and the run scope hit systemctl stop.
    const record: Raw | undefined = runRecords(f).find((entry) => entry.run === seeded.run);
    expect(record, 'the run record is still on disk').toBeDefined();
    expect((record as Raw).cancel).toBe(true);
    expect(stopLines(f)).toContain('--user stop ' + seeded.slice);
    expect(stopLines(f)).toContain('--user stop ' + seeded.unit);
    expect(existsSync(worktree)).toBe(false);
    expect(await branchExists(f, 'fix-alpha')).toBe(false);
    // The owner folder moved whole: leaf state and plan beside the owner's own ISSUE.md.
    const moved: string = resolve(chart.abs, 'direct/chart-x');
    expect(readFileSync(resolve(chart.abs, 'direct/check-chart.log'), 'utf8')).toBe('chart capture');
    expect(existsSync(resolve(moved, 'fix-alpha/state.yaml'))).toBe(true);
    for (const file of saved) expect(readFileSync(resolve(moved, 'fix-alpha', file), 'utf8')).toBe(file);
    expect(existsSync(resolve(moved, 'ISSUE.md'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/chart-x'))).toBe(false);
    const state: Raw = readStateRaw(resolve(moved, 'fix-alpha'));
    expect(state.slug).toBe('fix-alpha');
    expect(state.direct).toBe(true);
    const status: Result = await cli(f, ['status', '--json'], f.root, f.env);
    expect(status.code, status.stderr).toBe(0);
    expect(leafRow(f, status.stdout, 'fix-alpha')).toBeUndefined();
    expect(stoppedKeys(f)).not.toContain(f.repo + '/fix-alpha');
    // The door and reviewer terminals are untouched: no hc call of the drop names them, no tab rename,
    // same processes live.
    expect(renames(f)).toEqual([]);
    expect(dropCalls.filter((line) => line.includes(door) || line.includes(reviewer))).toEqual([]);
    expect((await f.core.get(door)).state).toBe('live');
    expect((await f.core.get(reviewer)).state).toBe('live');
    expect((await f.core.get(door)).pid).toBe(doorPid);
    expect((await f.core.get(reviewer)).pid).toBe(reviewerPid);
  } finally {
    if (sleeper !== undefined && sleeper.exitCode === null) sleeper.kill('SIGKILL');
    stopAdopt();
    await f.clean();
  }
});

test('direct-drop refuses a leaf that is not direct, nothing moved or removed', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const worktree: string = await seedWorktree(f, 'fix-alpha');
    leaf(f, 'fix-alpha', 'implement', { worktree }, 'chart-x');
    const chart = chartFolder(f, 'chart-x');
    const refused: Result = await cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, f.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(refused.stderr).toContain('is not a direct leaf');
    await expectUntouched(f, 'fix-alpha', worktree);
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct-drop refuses a direct leaf in the merge phase, nothing moved or removed', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const worktree: string = await seedWorktree(f, 'fix-alpha');
    const leafPath: string = seedDirectLeaf(f, 'fix-alpha', { door, reviewer }, { worktree, phase: 'merge' });
    const before: string = readFileSync(resolve(leafPath, 'state.yaml'), 'utf8');
    const chart = chartFolder(f, 'chart-x');
    const refused: Result = await cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, f.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    await expectUntouched(f, 'fix-alpha', worktree);
    expect(readFileSync(resolve(leafPath, 'state.yaml'), 'utf8')).toBe(before);
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct-drop refuses a merged direct leaf in issues/closed, nothing moved or removed', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const closedLeaf: string = resolve(f.root, 'issues/closed/chart-x/fix-alpha');
    mkdirSync(closedLeaf, { recursive: true });
    writeFileSync(
      resolve(closedLeaf, 'state.yaml'),
      Bun.YAML.stringify({
        slug: 'fix-alpha',
        phase: 'merged',
        created: new Date().toISOString(),
        repo: f.repo,
        'blocked-by': [],
        direct: true,
        frozen: {},
        seat: {
          A: { session: f.core.session, address: door },
          B: { session: f.core.session, address: reviewer },
        },
      }),
    );
    const before: string = readFileSync(resolve(closedLeaf, 'state.yaml'), 'utf8');
    const chart = chartFolder(f, 'chart-x');
    const refused: Result = await cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, f.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    expect(existsSync(resolve(closedLeaf, 'state.yaml'))).toBe(true);
    expect(readFileSync(resolve(closedLeaf, 'state.yaml'), 'utf8')).toBe(before);
    expect(existsSync(resolve(chart.abs, 'direct'))).toBe(false);
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct-drop refuses when the chart already holds that owner, nothing moved or removed', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const worktree: string = await seedWorktree(f, 'fix-alpha');
    seedDirectLeaf(f, 'fix-alpha', { door, reviewer }, { worktree });
    const chart = chartFolder(f, 'chart-x');
    mkdirSync(resolve(chart.abs, 'direct/chart-x'), { recursive: true });
    const refused: Result = await cli(f, ['direct-drop', 'fix-alpha', '--chart', chart.rel], f.root, f.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).not.toMatch(/Usage|unknown flag/);
    await expectUntouched(f, 'fix-alpha', worktree);
  } finally {
    stopAdopt();
    await f.clean();
  }
});

test('direct-drop refuses without --chart, nothing moved or removed', async () => {
  const f: HcFixture = await hcFixture();
  const stopAdopt: () => void = adopt(f.core);
  try {
    const door: string = await standin(f, 'door');
    const reviewer: string = await standin(f, 'reviewer');
    const worktree: string = await seedWorktree(f, 'fix-alpha');
    seedDirectLeaf(f, 'fix-alpha', { door, reviewer }, { worktree });
    const refused: Result = await cli(f, ['direct-drop', 'fix-alpha'], f.root, f.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).not.toBe('');
    expect(refused.stderr).toContain('--chart');
    await expectUntouched(f, 'fix-alpha', worktree);
  } finally {
    stopAdopt();
    await f.clean();
  }
});
