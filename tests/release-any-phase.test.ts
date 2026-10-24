import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, fakeHerdr, holding, leafTempRoot, type Fixture } from './helpers';
import { command, writeYaml, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
import { readRepo, type Repo } from '../src/config';
import { readState } from '../src/state';
import type { Database } from './fake-herdr';
import type { BusctlCall } from './fake-busctl';

type F = Fixture & { db: string; env: NodeJS.ProcessEnv };

async function fakes(): Promise<F> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}

const repo = (f: Fixture): Repo => readRepo('repo', f.root);

// The leaf temp path the subprocess computes: leafTemp(repo, slug) resolves
// under AKROGON_LEAF_TEMP_ROOT, which cli() sets to leafTempRoot(f), not the
// suite's own root.
function tempFor(f: Fixture, slug: string): string {
  const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
  return resolve(leafTempRoot(f), hex(f.root).slice(0, 4), hex(`${f.root}\n${slug}`).slice(0, 8));
}

function database(f: F): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}

function saveDatabase(f: F, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}

function closeTab(f: F, tab: string): void {
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    tabs: db.tabs.filter((item) => item.tab_id !== tab),
    panes: db.panes.filter((pane) => pane.tab_id !== tab),
  });
}

function addTab(f: F, tab: string, label: string, pane: string): void {
  const db: Database = database(f);
  saveDatabase(f, {
    ...db,
    tabs: [...db.tabs, { tab_id: tab, label, focused: false }],
    panes: [...db.panes, { pane_id: pane, tab_id: tab, cwd: null, agent: null, agent_status: 'idle' }],
  });
}

// A leaf the sweep must never dispatch: stopped leaves are skipped, not allocated.
function stopLeaf(f: F, slug: string): void {
  writeYaml(resolve(f.home, 'stopped.yaml'), { [`repo/${slug}`]: true });
}

// A second registered repo whose leaves only the host slice step can judge:
// a pass on `repo` never reconciles it, so its slices isolate reconcileHost.
async function otherRepo(f: F): Promise<string> {
  const root: string = resolve(f.home, 'other');
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  writeYaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
  writeYaml(resolve(f.home, 'config.yaml'), {
    slots: {
      a: { harness: 'fake', model: 'strong-a', effort: 'high' },
      b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
    },
    harnesses: { fake: 'fake --model {model} --effort {effort}' },
    repos: { repo: f.root, other: root },
  });
  return root;
}

function otherLeaf(root: string, slug: string, phase: string, extra: object = {}): void {
  const path: string = resolve(root, 'issues/open/issue', slug);
  mkdirSync(path, { recursive: true });
  writeYaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    repo: 'other',
    debate: 'no',
    'blocked-by': [],
    ...extra,
  });
}

// A live run record naming `slice`, like the one next.test.ts seeds.
function liveRunRecord(f: F, name: string, repoName: string, slug: string, slice: string, pid: number): void {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  const runs: string = resolve(f.home, 'runs');
  mkdirSync(runs, { recursive: true });
  writeFileSync(
    resolve(runs, `${name}.yaml`),
    [
      `token_hash: "${'0'.repeat(64)}"`,
      `pid: ${pid}`,
      `start_time: "${stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19]}"`,
      `boot_id: "${readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()}"`,
      `repo: ${repoName}`,
      `leaf: ${slug}`,
      'check: hold',
      'state: live',
      'run: r1',
      `slice: ${slice}`,
      'scope: s1',
      'unit: u1',
      'since: 2026-10-16T00:00:00Z',
    ].join('\n'),
  );
}

function systemctlBin(f: F): void {
  symlinkSync(resolve(import.meta.dir, 'fake-systemctl.ts'), resolve(f.home, 'bin', 'systemctl'));
}

function sliceDb(f: F, units: { unit: string; sub: string; cgroup?: string }[]): { db: string; log: string } {
  const db: string = resolve(f.home, 'systemctl.json');
  const log: string = resolve(f.home, 'systemctl.log');
  writeFileSync(db, JSON.stringify({ units }));
  return { db, log };
}

function env(f: F, db: string, log: string): NodeJS.ProcessEnv {
  return {
    ...f.env,
    FAKE_SYSTEMCTL_DB: db,
    FAKE_SYSTEMCTL_LOG: log,
    AKROGON_CGROUP_ROOT: resolve(f.home, 'cgroups'),
  };
}

// A non-empty cgroup.procs under AKROGON_CGROUP_ROOT marks the slice busy.
function busyCgroup(f: F, name: string): void {
  mkdirSync(resolve(f.home, 'cgroups', name), { recursive: true });
  writeFileSync(resolve(f.home, 'cgroups', name, 'cgroup.procs'), `${process.pid}\n`);
}

function emptyCgroup(f: F, name: string): void {
  mkdirSync(resolve(f.home, 'cgroups', name), { recursive: true });
  writeFileSync(resolve(f.home, 'cgroups', name, 'cgroup.procs'), '');
}

function kept(file: string): { path: string; reason: string }[] {
  if (!existsSync(file)) return [];
  return z
    .object({ kept: z.array(z.object({ path: z.string(), reason: z.string() })) })
    .parse(JSON.parse(readFileSync(file, 'utf8'))).kept;
}

const repoKept = (f: F): { path: string; reason: string }[] => kept(resolve(f.home, 'reconcile', 'repo.json'));
const hostKept = (f: F): { path: string; reason: string }[] => kept(resolve(f.home, 'reconcile-host.json'));
const OTHER_REPO: string = 'repo not reconciled by this pass';

function unitsIn(db: string): string[] {
  return z
    .object({ units: z.array(z.object({ unit: z.string() })) })
    .parse(JSON.parse(readFileSync(db, 'utf8')))
    .units.map((unit) => unit.unit);
}

function calls(log: string): string[] {
  return existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) : [];
}

function busctlCalls(f: F): BusctlCall[] {
  const path: string = resolve(f.home, 'busctl.calls');
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as BusctlCall)
    : [];
}

async function waitFor(ok: () => boolean | Promise<boolean>, ms: number = 10000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    if (await ok()) return;
    if (Date.now() - begun > ms) throw new Error('Timed out waiting');
    await Bun.sleep(50);
  }
}

// Criterion 1: an unfinished leaf whose recorded tab is gone loses its slice
// and its temp in one pass, even though the slice still holds a process.
test('an unfinished leaf slice is stopped and its temp removed once its recorded tab is gone', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'open-slice', 'implement', { tab: 'w1:t1' });
    stopLeaf(f, 'open-slice');
    const slice: string = leafSlice(repo(f), 'open-slice');
    busyCgroup(f, 'busy-open');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/busy-open' }]);
    systemctlBin(f);
    const temp: string = tempFor(f, 'open-slice');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1); // the stopped leaf reports a skip; the pass still ran
    expect(calls(log).some((line) => line.includes(`stop ${slice}`))).toBe(true);
    expect(unitsIn(db)).not.toContain(slice);
    expect(existsSync(temp)).toBe(false);
  } finally {
    f.clean();
  }
});

// A repo whose workspace is in no running session is refused by resolution:
// its vanished-tab slice and temp stay, whatever the pane list shows.
test('a pass from a session without the repo workspace keeps its slice and temp', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'away-slice', 'implement', { tab: 'w1:t1' });
    stopLeaf(f, 'away-slice');
    saveDatabase(f, { ...database(f), workspaces: [{ workspace_id: 'w3', label: 'other' }] });
    const slice: string = leafSlice(repo(f), 'away-slice');
    busyCgroup(f, 'busy-away');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/busy-away' }]);
    systemctlBin(f);
    const temp: string = tempFor(f, 'away-slice');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
    expect(existsSync(temp)).toBe(true);
    expect(hostKept(f).some((entry) => entry.path === slice && entry.reason === 'pane list unavailable')).toBe(true);
  } finally {
    f.clean();
  }
});

// A merged leaf of a repo whose workspace resolves nowhere keeps worktree,
// temp and slice: a refused session supplies no pane view.
test('a pass from a session without the repo workspace keeps a merged leaf worktree', async () => {
  const f: F = await fakes();
  try {
    const worktree: string = resolve(f.home, 'wt', 'away-merged');
    await command(['git', 'worktree', 'add', '-b', 'away-merged', worktree], f.root);
    leaf(f, 'away-merged', 'merged', { tab: 'w1:t2', worktree });
    saveDatabase(f, { ...database(f), workspaces: [{ workspace_id: 'w3', label: 'other' }] });
    const slice: string = leafSlice(repo(f), 'away-merged');
    emptyCgroup(f, 'empty-away');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/empty-away' }]);
    systemctlBin(f);
    const temp: string = tempFor(f, 'away-merged');
    mkdirSync(temp, { recursive: true });
    await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(calls(log).some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(temp)).toBe(true);
  } finally {
    f.clean();
  }
});

// A failed workspace list counts as absent for every repo, on a typed pass and
// on the tab_closed hook alike.
test('a failed workspace list stops no slice on a typed pass or a tab_closed hook', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'blind-slice', 'implement', { tab: 'w1:t3' });
    stopLeaf(f, 'blind-slice');
    saveDatabase(f, { ...database(f), failWorkspaceList: true });
    const slice: string = leafSlice(repo(f), 'blind-slice');
    busyCgroup(f, 'busy-blind');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/busy-blind' }]);
    systemctlBin(f);
    await cli(f, ['next', '--all'], f.root, env(f, db, log));
    await cli(f, ['next'], f.root, {
      ...env(f, db, log),
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: 'w1:t3', workspace_id: 'w1' },
      }),
    });
    expect(calls(log).some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
  } finally {
    f.clean();
  }
});

// Criterion 2: the same leaf is kept by a live run record naming its slice.
test('a live run record keeps an unfinished leaf slice and its temp', async () => {
  const f: F = await fakes();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    leaf(f, 'run-held', 'implement', { tab: 'w1:t2' });
    stopLeaf(f, 'run-held');
    const slice: string = leafSlice(repo(f), 'run-held');
    busyCgroup(f, 'busy-run');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/busy-run' }]);
    systemctlBin(f);
    const temp: string = tempFor(f, 'run-held');
    mkdirSync(temp, { recursive: true });
    liveRunRecord(f, 'held', 'repo', 'run-held', slice, child.pid);
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes(`stop ${slice}`))).toBe(false);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'live run record')).toBe(true);
    expect(existsSync(temp)).toBe(true);
  } finally {
    child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

// Criterion 3, temped case: an unfinished leaf with a live tab keeps slice and temp.
test('an unfinished leaf with a live tab keeps its slice and temp folder', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'temped', 'implement', { tab: 'w1:t3' });
    stopLeaf(f, 'temped');
    addTab(f, 'w1:t3', 'temped', 'w1:p3');
    const tempedSlice: string = leafSlice(repo(f), 'temped');
    const { db, log } = sliceDb(f, [{ unit: tempedSlice, sub: 'active', cgroup: '/temped' }]);
    emptyCgroup(f, 'temped');
    systemctlBin(f);
    const temp: string = tempFor(f, 'temped');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes('stop') && line.includes(tempedSlice))).toBe(false);
    expect(unitsIn(db)).toContain(tempedSlice);
    expect(existsSync(temp)).toBe(true);
    expect(repoKept(f).some((entry) => entry.path === tempedSlice && entry.reason === 'live tab')).toBe(true);
  } finally {
    f.clean();
  }
});

// Criterion 3, no-temp case in isolation: with no temp folder the leaf's keep
// depends only on the widened candidate rule of reconcileNeedsPanes; an older
// pass would judge its slice with an empty pane list and stop it.
test('an unfinished leaf with a live tab and no temp folder keeps its slice', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'untemped', 'implement', { tab: 'w1:t4' });
    stopLeaf(f, 'untemped');
    addTab(f, 'w1:t4', 'untemped', 'w1:p4');
    const untempedSlice: string = leafSlice(repo(f), 'untemped');
    const { db, log } = sliceDb(f, [{ unit: untempedSlice, sub: 'active', cgroup: '/untemped' }]);
    emptyCgroup(f, 'untemped');
    systemctlBin(f);
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes('stop') && line.includes(untempedSlice))).toBe(false);
    expect(unitsIn(db)).toContain(untempedSlice);
    expect(repoKept(f).some((entry) => entry.path === untempedSlice && entry.reason === 'live tab')).toBe(true);
    // The pane inventory was fetched for a tabbed unfinished leaf.
    const herdrCalls: string = existsSync(f.db + '.calls') ? readFileSync(f.db + '.calls', 'utf8') : '';
    expect(herdrCalls).toContain('pane');
  } finally {
    f.clean();
  }
});

// Criterion 3: with the pane list unavailable nothing about the tab can be
// proven, so an unfinished leaf keeps its slice and temp.
test('an unfinished leaf keeps slice and temp when the pane list is unavailable', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'no-panes', 'implement', { tab: 'w1:t5' });
    stopLeaf(f, 'no-panes');
    saveDatabase(f, { ...database(f), paneListStdout: 'unavailable' });
    const slice: string = leafSlice(repo(f), 'no-panes');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/no-panes' }]);
    emptyCgroup(f, 'no-panes');
    systemctlBin(f);
    const temp: string = tempFor(f, 'no-panes');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
    expect(existsSync(temp)).toBe(true);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'pane list unavailable')).toBe(true);
  } finally {
    f.clean();
  }
});

// Criterion 4: no recorded tab means a vanished tab cannot be proven, so an
// unfinished leaf keeps a loaded slice even when it holds a process.
test('an unfinished leaf with no recorded tab keeps its loaded slice', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'no-tab', 'implement');
    stopLeaf(f, 'no-tab');
    const slice: string = leafSlice(repo(f), 'no-tab');
    busyCgroup(f, 'busy-notab');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/busy-notab' }]);
    systemctlBin(f);
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    expect(calls(log).some((line) => line.includes(`stop ${slice}`))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'unfinished leaf')).toBe(true);
  } finally {
    f.clean();
  }
});

// Criterion 5: an unreadable unit inventory is never a deletion proof — leaf
// temps of every phase are kept with an inventory-unavailable reason.
test('an unreadable unit list keeps merged, failed and unfinished leaf temps', async () => {
  const f: F = await fakes();
  const systemctlWrapper: string = resolve(f.home, 'bin', 'systemctl');
  try {
    leaf(f, 'merged-temp', 'merged', { tab: 'w1:tm' });
    leaf(f, 'failed-temp', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x' },
    });
    leaf(f, 'open-temp', 'implement');
    stopLeaf(f, 'open-temp');
    const temps: string[] = ['merged-temp', 'failed-temp', 'open-temp'].map((slug) => {
      const temp: string = tempFor(f, slug);
      mkdirSync(temp, { recursive: true });
      return temp;
    });
    writeFileSync(
      systemctlWrapper,
      [
        '#!/usr/bin/env bun',
        'const args = process.argv.slice(2);',
        "if (args.includes('list-units')) { console.error('fixture: unit list unavailable'); process.exit(5); }",
        `const child = Bun.spawn([${JSON.stringify(process.execPath)}, ${JSON.stringify(resolve(import.meta.dir, 'fake-systemctl.ts'))}, ...args], { stdout: 'inherit', stderr: 'inherit' });`,
        'process.exit(await child.exited);',
      ].join('\n'),
      { mode: 0o755 },
    );
    const db: string = resolve(f.home, 'systemctl.json');
    const log: string = resolve(f.home, 'systemctl.log');
    writeFileSync(db, JSON.stringify({ units: [] }));
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    for (const temp of temps) expect(existsSync(temp)).toBe(true);
    const entries: { path: string; reason: string }[] = repoKept(f);
    for (const temp of temps)
      expect(entries.some((entry) => entry.path === temp && entry.reason === 'unit list unavailable')).toBe(true);
  } finally {
    f.clean();
  }
});

// Criterion 6: the host-level step applies the same rules to slices matched to
// unfinished leaves — a live tab keeps one, no recorded tab keeps the other.
// A pass acts only on its own repos: another repo's slices and temps stay.
test('the host slice step keeps unfinished leaf slices under the same tab rules', async () => {
  const f: F = await fakes();
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300']);
  try {
    leaf(f, 'host-tab', 'implement', { tab: 'w1:th' });
    leaf(f, 'host-note', 'implement');
    addTab(f, 'w1:th', 'host-tab', 'w1:ph');
    // A second registered repo: a pass on `repo` never reconciles its leaves,
    // so its slices isolate the host step's stop and veto decisions.
    const other: string = await otherRepo(f);
    otherLeaf(other, 'other-gone', 'implement', { tab: 'w1:tg' });
    otherLeaf(other, 'other-run', 'implement', { tab: 'w1:tr' });
    otherLeaf(other, 'other-idle', 'merged', { tab: 'w1:ti' });
    // One write: stopLeaf replaces the file, so all four entries go in together.
    writeYaml(resolve(f.home, 'stopped.yaml'), {
      'repo/host-tab': true,
      'repo/host-note': true,
      'other/other-gone': true,
      'other/other-run': true,
    });
    const tabSlice: string = leafSlice(repo(f), 'host-tab');
    const noteSlice: string = leafSlice(repo(f), 'host-note');
    const goneSlice: string = leafSlice({ name: 'other' }, 'other-gone');
    const runSlice: string = leafSlice({ name: 'other' }, 'other-run');
    const idleSlice: string = leafSlice({ name: 'other' }, 'other-idle');
    const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
    const otherTemp: string = resolve(leafTempRoot(f), hex(other).slice(0, 4), hex(`${other}\nother-gone`).slice(0, 8));
    mkdirSync(otherTemp, { recursive: true });
    const otherStore: string = resolve(f.home, '.akrogon/worktrees/other/other-gone');
    mkdirSync(otherStore, { recursive: true });
    liveRunRecord(f, 'held', 'other', 'other-run', runSlice, child.pid);
    const { db, log } = sliceDb(f, [
      { unit: tabSlice, sub: 'active', cgroup: '/host-tab' },
      { unit: noteSlice, sub: 'active', cgroup: '/host-note' },
      { unit: goneSlice, sub: 'active', cgroup: '/other-gone' },
      { unit: runSlice, sub: 'active', cgroup: '/other-run' },
      { unit: idleSlice, sub: 'active', cgroup: '/other-idle' },
    ]);
    emptyCgroup(f, 'other-idle');
    emptyCgroup(f, 'host-tab');
    busyCgroup(f, 'host-note');
    busyCgroup(f, 'other-gone');
    busyCgroup(f, 'other-run');
    systemctlBin(f);
    const temp: string = tempFor(f, 'host-tab');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1);
    const logLines: string[] = calls(log);
    const entries = (): { path: string; reason: string }[] => hostKept(f);
    expect(logLines.some((line) => line.includes('stop') && line.includes(tabSlice))).toBe(false);
    expect(logLines.some((line) => line.includes('stop') && line.includes(noteSlice))).toBe(false);
    // Host step, second repo: a pass for `repo` never acts on `other`, so even
    // a vanished recorded tab keeps its slice.
    expect(logLines.some((line) => line.includes('stop') && line.includes(goneSlice))).toBe(false);
    expect(unitsIn(db)).toContain(goneSlice);
    expect(entries().some((entry) => entry.path === goneSlice && entry.reason === OTHER_REPO)).toBe(true);
    expect(logLines.some((line) => line.includes('stop') && line.includes(runSlice))).toBe(false);
    expect(unitsIn(db)).toContain(tabSlice);
    expect(unitsIn(db)).toContain(noteSlice);
    expect(unitsIn(db)).toContain(runSlice);
    expect(entries().some((entry) => entry.path === tabSlice && entry.reason === 'live tab')).toBe(true);
    expect(entries().some((entry) => entry.path === noteSlice && entry.reason === 'unfinished leaf')).toBe(true);
    expect(entries().some((entry) => entry.path === runSlice && entry.reason === 'live run record')).toBe(true);
    expect(entries().some((entry) => entry.path === idleSlice && entry.reason === OTHER_REPO)).toBe(true);
    expect(unitsIn(db)).toContain(idleSlice);
    expect(existsSync(otherTemp)).toBe(true);
    expect(existsSync(otherStore)).toBe(true);
  } finally {
    child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});

// Criterion 7: a manual merge dispatch holds the global lock from tab record
// through seat adoption, so a pass starting mid-dispatch sees the dispatch
// either before or after — never between — and keeps the new seats' slice and
// temp.
test('a manual merge dispatch holds the global lock while it records the tab and adopts seats', async () => {
  const f: F = await fakes();
  const marker: string = resolve(f.home, 'tab-creating');
  const gate: string = resolve(f.home, 'allow-create');
  let dispatch: Promise<Result> | undefined;
  try {
    const path: string = leaf(f, 'merging', 'merge', {
      tab: 'w1:td',
      merge_stamp: '2026-10-15T00:00:00Z',
      ...holding(f),
    });
    const slice: string = leafSlice(repo(f), 'merging');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/idle' }]);
    emptyCgroup(f, 'idle');
    systemctlBin(f);
    mkdirSync(tempFor(f, 'merging'), { recursive: true });
    // Park the dispatch inside `busctl StartTransientUnit` — allocate saves the
    // new tab before the first adoption call, so the park sits in the exact
    // interval the design names: after the tab record, before seat adoption.
    // The dispatch goes through `next --all` so it is the manual
    // dispatchMergeLeaf branch holding the global lock; `next merging` would
    // dispatch under the pass-level lock instead.
    const bin: string = resolve(f.home, 'bin');
    rmSync(resolve(bin, 'busctl'));
    writeFileSync(
      resolve(bin, 'busctl'),
      [
        '#!/usr/bin/env bun',
        'import { existsSync, writeFileSync } from "node:fs";',
        'const args = process.argv.slice(2);',
        "if (args.includes('StartTransientUnit')) {",
        `  writeFileSync(${JSON.stringify(marker)}, '');`,
        `  while (!existsSync(${JSON.stringify(gate)})) await Bun.sleep(20);`,
        '}',
        `const child = Bun.spawn([${JSON.stringify(process.execPath)}, ${JSON.stringify(resolve(import.meta.dir, 'fake-busctl.ts'))}, ...args], { stdout: 'inherit', stderr: 'inherit' });`,
        'process.exit(await child.exited);',
      ].join('\n'),
      { mode: 0o755 },
    );
    const e: NodeJS.ProcessEnv = env(f, db, log);
    dispatch = cli(f, ['next', '--all'], f.root, e, 25000);
    await waitFor(async () => existsSync(marker));
    // The parked point is past the tab record: state carries the new tab and
    // the fake herdr database already lists it, while no seat has landed in
    // the slice yet.
    const parkedTab: string | undefined = readState(path).tab;
    expect(parkedTab !== undefined && parkedTab !== 'w1:td').toBe(true);
    expect(database(f).tabs.some((item) => item.tab_id === parkedTab)).toBe(true);
    // A concurrent pass starts mid-dispatch; with the lock held it can only
    // observe the dispatch after it completes.
    const pass: Promise<Result> = cli(f, ['next', '--all'], f.root, e, 25000);
    const baseline: number = calls(f.db + '.calls').filter((line) => line.includes('pane')).length;
    try {
      await waitFor(() => calls(f.db + '.calls').filter((line) => line.includes('pane')).length > baseline, 3000);
    } catch {
      // The concurrent pass blocked on the global lock — the outcome the fix creates.
    }
    writeFileSync(gate, '');
    const [dispatched, passed]: Result[] = await Promise.all([dispatch, pass]);
    expect(dispatched.code, dispatched.stderr).toBe(0);
    expect(passed.code, passed.stderr).toBe(0);
    dispatch = undefined;
    const state = readState(path);
    const tab: string = z.string().parse(state.tab);
    expect(tab).not.toBe('w1:td');
    // One new live tab: the parked dispatch finished it; the locked-out pass
    // never created a second one mid-flight.
    expect(database(f).tabs.filter((item) => item.label === 'merging')).toHaveLength(1);
    expect(database(f).tabs.some((item) => item.tab_id === tab)).toBe(true);
    expect(busctlCalls(f).filter((call) => call.slice === slice).length).toBe(2);
    expect(unitsIn(db)).toContain(slice);
    expect(existsSync(tempFor(f, 'merging'))).toBe(true);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'live tab')).toBe(true);
  } finally {
    if (!existsSync(gate)) writeFileSync(gate, '');
    if (dispatch !== undefined) await dispatch.catch(() => undefined);
    f.clean();
  }
}, 30000);

// Criterion 8: after a tab-loss stop, the tab_closed hook re-dispatches the
// leaf into the same slice name and the next pass keeps it.
test('a tab_closed pass re-dispatches seats into the same slice and the next pass keeps it', async () => {
  const f: F = await fakes();
  try {
    const path: string = leaf(f, 'lost-tab', 'plan.synthesis');
    expect((await cli(f, ['next', 'lost-tab'], f.root, f.env)).code).toBe(0);
    const firstTab: string = z.string().parse(readState(path).tab);
    const slice: string = leafSlice(repo(f), 'lost-tab');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active' }]);
    systemctlBin(f);
    const e: NodeJS.ProcessEnv = env(f, db, log);
    closeTab(f, firstTab);
    const hook: Result = await cli(f, ['next'], f.root, {
      ...e,
      HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
        event: 'tab_closed',
        data: { type: 'tab_closed', tab_id: firstTab, workspace_id: 'w2' },
      }),
    });
    expect(hook.code, hook.stderr).toBe(0);
    // The reconcile inside the hook pass stopped the dead tab's slice before
    // the replacement dispatch ran.
    expect(calls(log).some((line) => line.includes(`stop ${slice}`))).toBe(true);
    rmSync(log);
    const secondTab: string = z.string().parse(readState(path).tab);
    expect(secondTab).not.toBe(firstTab);
    expect(database(f).tabs.some((item) => item.tab_id === secondTab)).toBe(true);
    // Both seats were adopted into a scope under the same slice name.
    expect(busctlCalls(f).filter((call) => call.slice === slice).length).toBeGreaterThanOrEqual(2);
    const pass: Result = await cli(f, ['next', '--all'], f.root, e);
    expect(pass.code, pass.stderr).toBe(0);
    expect(calls(log).some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'live tab')).toBe(true);
    expect(existsSync(tempFor(f, 'lost-tab'))).toBe(true);
  } finally {
    f.clean();
  }
});

// Criterion 9: a failed leaf keeps its live tab, its slice and its temp.
test('a failed leaf with a live tab keeps its tab, slice and temp', async () => {
  const f: F = await fakes();
  try {
    leaf(f, 'failed-live', 'failed', {
      tab: 'w1:tf',
      failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x' },
    });
    addTab(f, 'w1:tf', 'failed-live', 'w1:pf');
    const slice: string = leafSlice(repo(f), 'failed-live');
    const { db, log } = sliceDb(f, [{ unit: slice, sub: 'active', cgroup: '/failed' }]);
    busyCgroup(f, 'failed');
    systemctlBin(f);
    const temp: string = tempFor(f, 'failed-live');
    mkdirSync(temp, { recursive: true });
    const result: Result = await cli(f, ['next', '--all'], f.root, env(f, db, log));
    expect(result.code).toBe(1); // the failed live leaf reports "needs phase recovery"
    expect(calls(log).some((line) => line.includes(`stop ${slice}`))).toBe(false);
    expect(unitsIn(db)).toContain(slice);
    expect(database(f).tabs.some((item) => item.tab_id === 'w1:tf')).toBe(true);
    expect(existsSync(temp)).toBe(true);
    expect(repoKept(f).some((entry) => entry.path === slice && entry.reason === 'live tab')).toBe(true);
  } finally {
    f.clean();
  }
});
