import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fixture, cli, leaf, fakeHerdr, procRoot, type Fixture } from './helpers';
import { readState } from '../src/state';
import type { Result } from '../src/shell';
import type { Database } from './fake-herdr';
import type { BusctlCall } from './fake-busctl';
import { OUTSIDE_CGROUP, expectedScope, expectedSlice, procDir, seedShell, shellPid } from './fake-proc';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function calls(f: DispatchFixture): string[][] {
  const path: string = f.db + '.calls';
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    : [];
}
function busctlCalls(f: DispatchFixture): BusctlCall[] {
  const path: string = resolve(f.home, 'busctl.calls');
  return existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as BusctlCall)
    : [];
}
function cgroupPath(f: DispatchFixture, paneId: string): string {
  return resolve(procDir(procRoot(f), shellPid(paneId)), 'cgroup');
}
async function next(f: DispatchFixture, args: string[]): Promise<Result> {
  return cli(f, ['next', ...args], f.root, f.env);
}
function skipped(result: Result): { slug?: string; error: string }[] {
  return result.stderr
    .split('\n')
    .filter((line) => line.startsWith('{'))
    .map((line) => z.object({ slug: z.string().optional(), error: z.string() }).parse(JSON.parse(line)));
}
function saveDatabase(f: DispatchFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}
// An operator pane split by hand in the leaf tab: live, unrecorded and outside the leaf's scope.
function manualPane(f: DispatchFixture, tabId: string, id: string = 'w1:p900'): string {
  const db: Database = database(f);
  db.panes.push({ pane_id: id, tab_id: tabId, cwd: null, agent: null, agent_status: 'unknown' });
  saveDatabase(f, db);
  seedShell(procRoot(f), id, OUTSIDE_CGROUP);
  return id;
}
function removePane(f: DispatchFixture, id: string): void {
  const db: Database = database(f);
  saveDatabase(f, { ...db, panes: db.panes.filter((pane) => pane.pane_id !== id) });
}
function manualUntouched(f: DispatchFixture, id: string): void {
  expect(database(f).panes.some((pane) => pane.pane_id === id)).toBe(true);
  expect(readFileSync(cgroupPath(f, id), 'utf8').trim()).toBe(OUTSIDE_CGROUP);
  expect(busctlCalls(f).every((call) => call.pid !== shellPid(id))).toBe(true);
}

test('next boxes every pane shell in its own scope under the leaf slice before the seat starts', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const state = readState(path);
    const slice: string = expectedSlice('repo', 'build');
    expect(slice).toMatch(/^akrogon-l[0-9a-f]{12}\.slice$/);
    const recorded: string[] = [state.pane.A!, state.pane.B!];
    const adopted: BusctlCall[] = busctlCalls(f);
    expect(adopted.map((call) => call.scope).sort()).toEqual(recorded.map((id) => expectedScope(slice, id)).sort());
    for (const call of adopted) {
      expect(call.slice).toBe(slice);
      expect(call.mode).toBe('fail');
      expect(call.sendSIGHUP).toBe('b true');
      expect(call.timeoutStopUSec).toBe('t 5000000');
      expect(call.bus).toBe(`unix:path=${resolve(f.home, 'run')}/bus`);
    }
    for (const id of recorded)
      expect(
        readFileSync(cgroupPath(f, id), 'utf8')
          .trim()
          .endsWith(`/${slice}/${expectedScope(slice, id)}`),
      ).toBe(true);
    const db: Database = database(f);
    expect(db.startCgroups).toHaveLength(1);
    expect(db.startCgroups[0].pane).toBe(state.pane.A!);
    expect(db.startCgroups[0].cgroup.endsWith(`/${slice}/${expectedScope(slice, state.pane.A!)}`)).toBe(true);
    expect((await next(f, ['build'])).code).toBe(0);
    expect(busctlCalls(f)).toHaveLength(adopted.length);
    expect(calls(f).some((args) => args[0] === 'pane' && args[1] === 'close')).toBe(false);
  } finally {
    f.clean();
  }
}, 20000);

test('new leaf pane shells keep the session bus; only check runs cut it', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const created: string[][] = calls(f).filter(
      (args) => (args[0] === 'tab' && args[1] === 'create') || (args[0] === 'pane' && args[1] === 'split'),
    );
    expect(created.length).toBeGreaterThanOrEqual(2);
    for (const args of created) expect(args.some((arg) => arg.startsWith('DBUS_SESSION_BUS_ADDRESS='))).toBe(false);
  } finally {
    f.clean();
  }
}, 20000);

for (const failure of ['busctl.fail', 'busctl.misplace']) {
  test(`${failure === 'busctl.fail' ? 'a failed adoption' : 'a misplaced shell'} stops dispatch and reports the slug`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      leaf(f, 'build', 'plan.synthesis');
      writeFileSync(resolve(f.home, failure), '');
      const result: Result = await next(f, ['build']);
      const errors = skipped(result).filter((entry) => entry.slug === 'build');
      expect(errors).toHaveLength(1);
      if (failure === 'busctl.fail') expect(errors[0].error).toContain('fixture refused');
      const db: Database = database(f);
      expect(db.starts).toEqual([]);
      expect(db.prompts).toEqual([]);
    } finally {
      f.clean();
    }
  }, 20000);
}

test('a shell systemd moves after the adoption call returns is still boxed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    writeFileSync(resolve(f.home, 'busctl.delay'), '');
    const result: Result = await next(f, ['build']);
    expect(skipped(result)).toEqual([]);
    expect(result.code).toBe(0);
    const state = readState(path);
    const slice: string = expectedSlice('repo', 'build');
    for (const id of [state.pane.A!, state.pane.B!])
      expect(
        readFileSync(cgroupPath(f, id), 'utf8')
          .trim()
          .endsWith(`/${slice}/${expectedScope(slice, id)}`),
      ).toBe(true);
  } finally {
    f.clean();
  }
}, 20000);

test('an outside pane is closed and recreated boxed before any prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const before = readState(path);
    const oldA: string = before.pane.A!;
    writeFileSync(cgroupPath(f, oldA), OUTSIDE_CGROUP + '\n');
    const promptsBefore: number = database(f).prompts.length;
    expect((await next(f, ['build'])).code).toBe(0);
    const after = readState(path);
    expect(calls(f).filter((args) => args[0] === 'pane' && args[1] === 'close')).toEqual([['pane', 'close', oldA]]);
    expect(after.pane.A).not.toBe(oldA);
    expect(after.pane.B).toBe(before.pane.B!);
    const slice: string = expectedSlice('repo', 'build');
    const db: Database = database(f);
    const fresh = db.startCgroups.filter((start) => start.pane === after.pane.A);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].cgroup.endsWith(`/${slice}/${expectedScope(slice, after.pane.A!)}`)).toBe(true);
    expect(db.prompts.length).toBe(promptsBefore + 1);
    expect(db.prompts.at(-1)!.pane).toBe(after.pane.A!);
  } finally {
    f.clean();
  }
}, 30000);

test('a B pane whose boxing fails is recorded and replaced before the next prompt', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'check.review');
    expect((await next(f, ['build'])).code).toBe(0);
    const setup = readState(path);
    const manual: string = manualPane(f, z.string().parse(setup.tab));
    const deadB: string = z.string().parse(setup.pane.B);
    removePane(f, deadB);
    const promptsBefore: number = database(f).prompts.length;
    writeFileSync(resolve(f.home, 'busctl.fail'), '');
    const failed: Result = await next(f, ['build']);
    expect(failed.code).toBe(1);
    const errors = skipped(failed).filter((entry) => entry.slug === 'build');
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toContain('fixture refused');
    expect(database(f).prompts).toHaveLength(promptsBefore);
    const mid = readState(path);
    const orphan: string = z.string().parse(mid.pane.B);
    expect(orphan).not.toBe(deadB);
    expect(orphan).not.toBe(manual);
    expect(database(f).panes.some((pane) => pane.pane_id === orphan)).toBe(true);
    expect(mid.pane.A).toBe(setup.pane.A);
    manualUntouched(f, manual);
    rmSync(resolve(f.home, 'busctl.fail'));
    expect((await next(f, ['build'])).code).toBe(0);
    const after = readState(path);
    expect(calls(f).filter((args) => args[0] === 'pane' && args[1] === 'close')).toEqual([['pane', 'close', orphan]]);
    expect(database(f).panes.some((pane) => pane.pane_id === orphan)).toBe(false);
    expect(after.pane.A).toBe(setup.pane.A);
    const newB: string = z.string().parse(after.pane.B);
    expect(newB).not.toBe(orphan);
    const slice: string = expectedSlice('repo', 'build');
    const groups: Database['startCgroups'] = database(f).startCgroups;
    for (const id of [z.string().parse(after.pane.A), newB])
      expect(
        groups.some((start) => start.pane === id && start.cgroup.endsWith(`/${slice}/${expectedScope(slice, id)}`)),
      ).toBe(true);
    const sent: Database['prompts'] = database(f).prompts;
    expect(sent).toHaveLength(promptsBefore + 1);
    expect(sent.at(-1)!.pane).toBe(newB);
    manualUntouched(f, manual);
  } finally {
    f.clean();
  }
}, 30000);

test('boxing a replacement A fails while B lives keeps B recorded', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'check.review');
    expect((await next(f, ['build'])).code).toBe(0);
    const setup = readState(path);
    const manual: string = manualPane(f, z.string().parse(setup.tab));
    const deadA: string = z.string().parse(setup.pane.A);
    const liveB: string = z.string().parse(setup.pane.B);
    removePane(f, deadA);
    const promptsBefore: number = database(f).prompts.length;
    writeFileSync(resolve(f.home, 'busctl.fail'), '');
    const failed: Result = await next(f, ['build']);
    expect(failed.code).toBe(1);
    expect(skipped(failed).filter((entry) => entry.slug === 'build')).toHaveLength(1);
    expect(database(f).prompts).toHaveLength(promptsBefore);
    const mid = readState(path);
    const orphanA: string = z.string().parse(mid.pane.A);
    expect(orphanA).not.toBe(deadA);
    expect(mid.pane.B).toBe(liveB);
    expect(database(f).panes.some((pane) => pane.pane_id === orphanA)).toBe(true);
    expect(database(f).panes.some((pane) => pane.pane_id === liveB)).toBe(true);
    manualUntouched(f, manual);
    rmSync(resolve(f.home, 'busctl.fail'));
    expect((await next(f, ['build'])).code).toBe(0);
    const after = readState(path);
    expect(calls(f).filter((args) => args[0] === 'pane' && args[1] === 'close')).toEqual([['pane', 'close', orphanA]]);
    expect(database(f).panes.some((pane) => pane.pane_id === orphanA)).toBe(false);
    const newA: string = z.string().parse(after.pane.A);
    expect(newA).not.toBe(orphanA);
    expect(after.pane.B).toBe(liveB);
    const slice: string = expectedSlice('repo', 'build');
    const groups: Database['startCgroups'] = database(f).startCgroups;
    expect(
      groups.some((start) => start.pane === newA && start.cgroup.endsWith(`/${slice}/${expectedScope(slice, newA)}`)),
    ).toBe(true);
    expect(groups.some((start) => start.pane === liveB)).toBe(true);
    const sent: Database['prompts'] = database(f).prompts.slice(promptsBefore);
    expect(sent).toHaveLength(1);
    expect(sent[0].pane).toBe(newA);
    manualUntouched(f, manual);
  } finally {
    f.clean();
  }
}, 30000);

test('an unreadable cgroup never closes the pane and skips the leaf this pass', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const state = readState(path);
    const target: string = cgroupPath(f, state.pane.A!);
    rmSync(target);
    mkdirSync(target);
    const before: Database = database(f);
    const result: Result = await next(f, ['build']);
    expect(skipped(result).filter((entry) => entry.slug === 'build')).toHaveLength(1);
    expect(calls(f).some((args) => args[0] === 'pane' && args[1] === 'close')).toBe(false);
    const after: Database = database(f);
    expect(after.panes.map((p) => p.pane_id)).toContain(state.pane.A!);
    expect(after.starts).toHaveLength(before.starts.length);
    expect(after.prompts).toHaveLength(before.prompts.length);
  } finally {
    f.clean();
  }
}, 30000);
