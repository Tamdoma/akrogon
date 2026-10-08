import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command, type Result } from '../src/shell';
import { readState, saveState, type State } from '../src/state';
import type { Database } from './fake-herdr';
import { cli, entry, fakeHerdr, fixture, leaf, leafTempRoot, yaml, type Fixture } from './helpers';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };

async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}

function database(f: DispatchFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}

function saveDatabase(f: DispatchFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}

function calls(f: DispatchFixture): string[][] {
  const path: string = f.db + '.calls';
  if (!existsSync(path)) return [];
  const text: string = readFileSync(path, 'utf8').trim();
  if (text === '') return [];
  return text.split('\n').map((line) => JSON.parse(line) as string[]);
}

function mutating(f: DispatchFixture): string[][] {
  return calls(f).filter(
    (argv) =>
      (argv[0] === 'tab' && (argv[1] === 'create' || argv[1] === 'close')) ||
      (argv[0] === 'pane' && argv[1] === 'split') ||
      (argv[0] === 'agent' && (argv[1] === 'start' || argv[1] === 'prompt')),
  );
}

async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}

function paneEvent(type: string, pane: string, status: string = 'idle'): string {
  return JSON.stringify({
    event: type,
    data: { type, pane_id: pane, ...(type === 'pane_agent_status_changed' ? { agent_status: status } : {}) },
  });
}

function tabEvent(tab: string): string {
  return JSON.stringify({ event: 'tab_closed', data: { type: 'tab_closed', tab_id: tab } });
}

/** Allocate a leaf with a manual pass, then leave its seats idle with expired grace so an automatic pass would prompt. */
async function allocatedIdle(f: DispatchFixture, slug: string): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  const run: Result = await next(f, [slug]);
  expect(run.code).toBe(0);
  expect(database(f).prompts.length).toBeGreaterThan(0);
  const db: Database = database(f);
  for (const pane of db.panes) pane.agent_status = 'idle';
  saveDatabase(f, db);
  const state: State = readState(path);
  saveState(path, { ...state, prompted_at: { ...state.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
  return path;
}

function resetHerdrEvidence(f: DispatchFixture): void {
  const db: Database = database(f);
  db.prompts = [];
  db.starts = [];
  saveDatabase(f, db);
  const log: string = f.db + '.calls';
  if (existsSync(log)) writeFileSync(log, '');
}

for (const kind of ['pane_agent_status_changed', 'pane_exited', 'pane_closed', 'tab_closed']) {
  test(`automatic ${kind} does nothing for a paused repo`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const path: string = await allocatedIdle(f, 'build');
      const pane: string = readState(path).pane.A as string;
      const tab: string = readState(path).tab as string;
      const env: NodeJS.ProcessEnv =
        kind === 'tab_closed'
          ? { HERDR_PLUGIN_EVENT_JSON: tabEvent(tab) }
          : { HERDR_PANE_ID: pane, HERDR_PLUGIN_EVENT_JSON: paneEvent(kind, pane) };
      const control: Result = await next(f, [], env);
      expect(control.code).toBe(0);
      expect(database(f).prompts.length).toBeGreaterThan(0);
      const afterControl: State = readState(path);
      saveState(path, { ...afterControl, prompted_at: { ...afterControl.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
      const db: Database = database(f);
      for (const item of db.panes) item.agent_status = 'idle';
      saveDatabase(f, db);
      resetHerdrEvidence(f);
      const worktree: string = readState(path).worktree as string;
      expect((await cli(f, ['pause'])).code).toBe(0);
      const gated: Result = await next(f, [], env);
      expect(gated.code).toBe(0);
      expect(gated.stderr).toBe('');
      expect(mutating(f)).toEqual([]);
      expect(database(f).prompts).toEqual([]);
      expect(readState(path).phase).toBe('plan.synthesis');
      expect(existsSync(worktree)).toBe(true);
    } finally {
      f.clean();
    }
  });
}

async function secondRepo(f: Fixture, name: string): Promise<string> {
  const root: string = resolve(f.home, name);
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  writeFileSync(resolve(root, 'file'), 'initial\n');
  writeFileSync(resolve(root, '.gitignore'), '.env\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'initial'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(f.home, `${name}.git`)]);
  await command(['git', 'remote', 'add', 'origin', resolve(f.home, `${name}.git`)], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  yaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as Record<string, unknown>;
  const repos = (global.repos ?? {}) as Record<string, string>;
  repos[name] = root;
  yaml(resolve(f.home, 'config.yaml'), { ...global, repos });
  return root;
}

function leafIn(root: string, repo: string, slug: string, phase: string, extra: object = {}): string {
  const path: string = resolve(root, 'issues/open/issue', slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    repo,
    debate: 'no',
    'blocked-by': [],
    ...extra,
  });
  return path;
}

test('resume skips the paused repo and still dispatches the unpaused repo', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'xleaf', 'plan.synthesis');
    const x: string = resolve(f.root, 'issues/open/issue/xleaf');
    expect((await next(f, ['xleaf'])).code).toBe(0);
    const yRoot: string = await secondRepo(f, 'y');
    const yPath: string = leafIn(yRoot, 'y', 'yleaf', 'plan.synthesis');
    const db: Database = database(f);
    db.workspaces = [...db.workspaces, { workspace_id: 'wy', label: 'y' }];
    saveDatabase(f, db);
    expect((await next(f, ['yleaf'], {}, yRoot)).code).toBe(0);
    const withIdle: Database = database(f);
    for (const pane of withIdle.panes) pane.agent_status = 'idle';
    saveDatabase(f, withIdle);
    for (const path of [x, yPath]) {
      const state: State = readState(path);
      saveState(path, { ...state, prompted_at: { ...state.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
    }
    resetHerdrEvidence(f);
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['--resume']);
    expect(run.code).toBe(0);
    const yPrompts = database(f).prompts.filter((prompt) =>
      database(f).panes.some((pane) => pane.pane_id === prompt.pane && pane.tab_id.startsWith('wy:')),
    );
    expect(yPrompts.length).toBeGreaterThan(0);
    const xPane: string = readState(x).pane.A as string;
    expect(database(f).prompts.some((prompt) => prompt.pane === xPane)).toBe(false);
    expect(readState(x).phase).toBe('plan.synthesis');
  } finally {
    f.clean();
  }
});

const appliedBatch: object = {
  attempt: 't1',
  built_on: 'base',
  holder: { base: 'base', head: 'head' },
  members: [],
  applied: true,
  solo: true,
};

test('phase move in a paused repo commits while its merge wake prompts nothing', async () => {
  for (const paused of [true, false]) {
    const f: DispatchFixture = await dispatchFixture();
    try {
      leaf(f, 'mover', 'implement');
      leaf(f, 'holder', 'merge', { batch: appliedBatch });
      if (paused) expect((await cli(f, ['pause'])).code).toBe(0);
      const moved: Result = await cli(f, ['phase', 'mover', 'check.review', '--slot', 'A'], f.root, f.env);
      expect(moved.code).toBe(0);
      expect(readState(resolve(f.root, 'issues/open/issue/mover')).phase).toBe('check.review');
      if (paused) {
        expect(database(f).prompts).toEqual([]);
        expect(mutating(f)).toEqual([]);
      } else {
        expect(database(f).prompts.length).toBeGreaterThan(0);
      }
    } finally {
      f.clean();
    }
  }
});

test('manual next target dispatches a paused repo with an inherited event and stays paused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['build'], { HERDR_PLUGIN_EVENT_JSON: tabEvent('w9:t9') });
    expect(run.code).toBe(0);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    f.clean();
  }
});

test('manual next all dispatches a paused repo with an inherited event and stays paused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['--all'], { HERDR_PLUGIN_EVENT_JSON: tabEvent('w9:t9') });
    expect(run.code).toBe(0);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    f.clean();
  }
});

test('bare manual next with a pane id dispatches a paused repo and stays paused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, [], { HERDR_PANE_ID: 'operator' });
    expect(run.code).toBe(0);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    f.clean();
  }
});

test('manual next target completes a leaf and dispatches its dependent while paused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'done', 'merged', {}, 'done-issue');
    const dependent: string = leaf(f, 'dep', 'plan.synthesis', { 'blocked-by': ['done'] }, 'dep-issue');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['done']);
    expect(run.code).toBe(0);
    expect(database(f).prompts.some((prompt) => prompt.pane === readState(dependent).pane.A)).toBe(true);
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8'))).toEqual({ repo: true });
  } finally {
    f.clean();
  }
});

test('manual next target prompts the waiting merge holder while paused', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis', {}, 'build-issue');
    const holder: string = leaf(f, 'holder', 'merge', { batch: appliedBatch }, 'merge-issue');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['build']);
    expect(run.code).toBe(0);
    expect(database(f).prompts.some((prompt) => prompt.pane === readState(holder).pane.B)).toBe(true);
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8'))).toEqual({ repo: true });
  } finally {
    f.clean();
  }
});

test('unpause relaunches closed seats with the current seat config', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as {
      slots: Record<string, Record<string, string>>;
    };
    global.slots.a.model = 'fresh-model';
    yaml(resolve(f.home, 'config.yaml'), global);
    const db: Database = database(f);
    db.panes = [];
    db.tabs = [];
    saveDatabase(f, db);
    resetHerdrEvidence(f);
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('unpaused');
    expect(database(f).prompts.length).toBeGreaterThan(0);
    expect(JSON.stringify(database(f).starts)).toContain('fresh-model');
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([]);
    expect(readState(path).tab).not.toBe(undefined);
  } finally {
    f.clean();
  }
});

test('unpause runs deferred merged cleanup', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'live', 'merged', { tab: 'w1:t9' }, 'issue-a');
    leaf(f, 'dead', 'merged', { tab: 'w1:t8' }, 'issue-b');
    const db: Database = database(f);
    db.tabs = [...db.tabs, { tab_id: 'w1:t9', label: 'live' }];
    db.panes = [...db.panes, { pane_id: 'w1:p9', tab_id: 'w1:t9', cwd: null, agent: null, agent_status: 'unknown' }];
    saveDatabase(f, db);
    const { createHash } = await import('node:crypto');
    const hex: string = createHash('sha256')
      .update(f.root + '\n' + 'dead')
      .digest('hex')
      .slice(0, 12);
    const temp: string = resolve(leafTempRoot(f), `dead-${hex}`);
    mkdirSync(temp, { recursive: true });
    writeFileSync(resolve(temp, 'scratch'), 'x');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    expect(database(f).tabs.some((tab) => tab.tab_id === 'w1:t9')).toBe(false);
    expect(existsSync(temp)).toBe(false);
  } finally {
    f.clean();
  }
});

test('unpause starts tab-less leaves only through the dependent cascade', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'm', 'merged');
    leaf(f, 'c', 'plan.synthesis', { 'blocked-by': ['m'] });
    leaf(f, 'd', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    const c: State = readState(resolve(f.root, 'issues/open/issue/c'));
    expect(c.tab).not.toBe(undefined);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    const d: State = readState(resolve(f.root, 'issues/open/issue/d'));
    expect(d.tab).toBe(undefined);
    expect(d.worktree).toBe(undefined);
  } finally {
    f.clean();
  }
});

test('unpause failure exits non-zero with the pause cleared', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'z', 'plan.synthesis', { worktree: '/nonexistent-z' });
    writeFileSync(resolve(path, 'state.yaml'), 'slug: [');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).not.toBe(0);
    expect(run.stdout).toContain('unpaused');
    expect(run.stderr.length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('invalid pause file fails automatic and manual next naming the file', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const file: string = resolve(f.home, 'paused.yaml');
    writeFileSync(file, '["not", "a", "map"]\n');
    expect((await next(f, ['--resume'])).code).not.toBe(0);
    expect((await next(f, ['--resume'])).stderr).toContain(file);
    expect((await next(f, ['build'])).code).not.toBe(0);
    expect((await next(f, ['build'])).stderr).toContain(file);
  } finally {
    f.clean();
  }
});

test('invalid pause file fails an automatic working event naming the file', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const file: string = resolve(f.home, 'paused.yaml');
    writeFileSync(file, '[invalid]\n');
    const run: Result = await next(f, [], {
      HERDR_PLUGIN_EVENT_JSON: paneEvent('pane_agent_status_changed', 'p1', 'working'),
    });
    expect(run.code).not.toBe(0);
    expect(run.stderr).toContain(file);
    expect(mutating(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

function barrierGit(bin: string, barrier: string, realGit: string): void {
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    resolve(bin, 'git'),
    `#!/bin/sh\nif [ "$1" = "fetch" ] && [ ! -e '${barrier}/done' ]; then\n  touch '${barrier}/entered'\n  while [ ! -e '${barrier}/release' ]; do sleep 0.05; done\n  touch '${barrier}/done'\nfi\nexec '${realGit}' "$@"\n`,
  );
  chmodSync(resolve(bin, 'git'), 0o755);
}

async function waitFor(path: string, ms: number): Promise<void> {
  const start: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - start > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(50);
  }
}

function cliEnv(f: DispatchFixture, extra: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return { ...process.env, AKROGON_HOME: f.home, HERDR_PANE_ID: '', AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f), ...extra };
}

test('race A: pause recorded before the locked merge section suppresses the launch', async () => {
  const control: DispatchFixture = await dispatchFixture();
  try {
    leaf(control, 'holder', 'merge', { solo: true });
    const run: Result = await next(control, ['--resume']);
    expect(run.code).toBe(0);
    expect(database(control).prompts.length).toBeGreaterThan(0);
  } finally {
    control.clean();
  }
  const f: DispatchFixture = await dispatchFixture();
  const child: { current?: Bun.Subprocess<'ignore', 'pipe', 'pipe'> } = {};
  try {
    leaf(f, 'holder', 'merge', { solo: true });
    const barrier: string = resolve(f.home, 'barrier');
    mkdirSync(barrier);
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    barrierGit(resolve(f.home, 'gitbin'), barrier, realGit);
    const env: NodeJS.ProcessEnv = cliEnv(f, {
      ...f.env,
      PATH: `${resolve(f.home, 'gitbin')}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    child.current = Bun.spawn([process.execPath, entry, 'next', '--resume'], {
      cwd: f.root,
      env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await waitFor(resolve(barrier, 'entered'), 15000);
    const paused: Result = await cli(f, ['pause']);
    expect(paused.code).toBe(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
    writeFileSync(resolve(barrier, 'release'), '');
    const [stdout, stderr, code]: [string, string, number] = await Promise.all([
      new Response(child.current.stdout).text(),
      new Response(child.current.stderr).text(),
      child.current.exited,
    ]);
    expect({ stdout, stderr, code }).toMatchObject({ code: 0 });
    expect(mutating(f)).toEqual([]);
    expect(database(f).prompts).toEqual([]);
  } finally {
    try {
      child.current?.kill();
    } catch {
      // already exited
    }
    f.clean();
  }
});

test('race B: pause waits for a held launch lock, later automatic work is suppressed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const procs: Bun.Subprocess<'ignore', 'pipe', 'pipe'>[] = [];
  try {
    await allocatedIdle(f, 'build');
    resetHerdrEvidence(f);
    const barrier: string = resolve(f.home, 'barrier');
    mkdirSync(barrier);
    const wrapper: string = resolve(f.home, 'herdrbin');
    mkdirSync(wrapper, { recursive: true });
    writeFileSync(
      resolve(wrapper, 'herdr'),
      `#!/bin/sh\nif [ "$1" = "agent" ] && [ "$2" = "prompt" ] && [ ! -e '${barrier}/done' ]; then\n  touch '${barrier}/entered'\n  while [ ! -e '${barrier}/release' ]; do sleep 0.05; done\n  touch '${barrier}/done'\nfi\nexec '${resolve(f.home, 'bin/herdr')}' "$@"\n`,
    );
    chmodSync(resolve(wrapper, 'herdr'), 0o755);
    const env: NodeJS.ProcessEnv = cliEnv(f, {
      ...f.env,
      PATH: `${wrapper}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    const pass = Bun.spawn([process.execPath, entry, 'next', '--resume'], {
      cwd: f.root,
      env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pass);
    await waitFor(resolve(barrier, 'entered'), 15000);
    const pausing = Bun.spawn([process.execPath, entry, 'pause'], {
      cwd: f.root,
      env: cliEnv(f, {}),
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pausing);
    await Bun.sleep(500);
    expect(existsSync(resolve(f.home, 'paused.yaml'))).toBe(false);
    expect(pausing.exitCode).toBe(null);
    writeFileSync(resolve(barrier, 'release'), '');
    expect(await pass.exited).toBe(0);
    expect(await pausing.exited).toBe(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
    expect(database(f).prompts.length).toBeGreaterThan(0);
    const before: number = mutating(f).length;
    const idle: Database = database(f);
    for (const pane of idle.panes) pane.agent_status = 'idle';
    saveDatabase(f, idle);
    const build: string = resolve(f.root, 'issues/open/issue/build');
    const expired: State = readState(build);
    saveState(build, { ...expired, prompted_at: { ...expired.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
    const again: Result = await next(f, ['--resume']);
    expect(again.code).toBe(0);
    expect(mutating(f).length).toBe(before);
  } finally {
    for (const proc of procs) {
      try {
        proc.kill();
      } catch {
        // already exited
      }
    }
    f.clean();
  }
});

test('race: pause waits for landed-batch dependent dispatch, later automatic work is suppressed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  const procs: Bun.Subprocess<'ignore', 'pipe', 'pipe'>[] = [];
  try {
    const holder: string = leaf(f, 'holder', 'plan.synthesis');
    const member: string = leaf(f, 'member', 'plan.synthesis');
    for (const slug of ['holder', 'member']) expect((await next(f, [slug])).code).toBe(0);
    const worktree: string = readState(holder).worktree as string;
    writeFileSync(resolve(worktree, 'change'), 'landed\n');
    await command(['git', 'add', 'change'], worktree);
    await command(['git', 'commit', '-m', 'change'], worktree);
    const dependent: string = leaf(f, 'dep', 'plan.synthesis', { 'blocked-by': ['member'] }, 'dep-issue');
    saveState(holder, { ...readState(holder), phase: 'merge', merge_stamp: '2026-09-11' });
    saveState(member, { ...readState(member), phase: 'merge', merge_stamp: '2026-09-12' });
    expect((await next(f, ['--all'])).code).toBe(1);
    const batch: NonNullable<State['batch']> = readState(holder).batch as NonNullable<State['batch']>;
    await command(['git', 'push', 'origin', 'refs/heads/holder:main'], f.root);
    saveState(holder, { ...readState(holder), batch: { ...batch, candidate: batch.top as string } });
    resetHerdrEvidence(f);
    const barrier: string = resolve(f.home, 'barrier');
    mkdirSync(barrier);
    const wrapper: string = resolve(f.home, 'herdrbin');
    mkdirSync(wrapper);
    writeFileSync(
      resolve(wrapper, 'herdr'),
      `#!/bin/sh\nif [ "$1" = tab ] && [ "$2" = create ] && [ "$4" = dep ]; then\n  touch '${barrier}/entered'\n  while [ ! -e '${barrier}/release' ]; do sleep 0.05; done\nfi\nexec '${resolve(f.home, 'bin/herdr')}' "$@"\n`,
    );
    chmodSync(resolve(wrapper, 'herdr'), 0o755);
    const pass: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, entry, 'next', '--resume'], {
      cwd: f.root,
      env: cliEnv(f, { ...f.env, PATH: `${wrapper}:${f.env.PATH}` }),
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pass);
    await waitFor(resolve(barrier, 'entered'), 15000);
    const pausing: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, entry, 'pause'], {
      cwd: f.root,
      env: cliEnv(f, {}),
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pausing);
    await Bun.sleep(500);
    expect(pausing.exitCode).toBe(null);
    expect(existsSync(resolve(f.home, 'paused.yaml'))).toBe(false);
    writeFileSync(resolve(barrier, 'release'), '');
    expect(await pass.exited).toBe(0);
    expect(await pausing.exited).toBe(0);
    expect(database(f).prompts.some((prompt) => prompt.pane === readState(dependent).pane.A)).toBe(true);
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8'))).toEqual({ repo: true });
    const db: Database = database(f);
    for (const pane of db.panes) pane.agent_status = 'idle';
    saveDatabase(f, db);
    const state: State = readState(dependent);
    saveState(dependent, { ...state, prompted_at: { ...state.prompted_at, A: '2020-01-01T00:00:00.000Z' } });
    resetHerdrEvidence(f);
    expect((await next(f, ['--resume'])).code).toBe(0);
    expect(mutating(f)).toEqual([]);
  } finally {
    for (const proc of procs) {
      if (proc.exitCode === null) {
        proc.kill();
        await proc.exited;
      }
    }
    f.clean();
  }
});
