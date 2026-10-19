import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { fixture, cli, leaf, yaml, fakeHerdr, storeDir, holding, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { readState } from '../src/state';
import type { Database } from './fake-herdr';

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
async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}
const skipSchema = z.object({
  repo: z.string(),
  path: z.string(),
  slug: z.string().optional(),
  error: z.string(),
  count: z.number().int().optional(),
  paths: z.array(z.object({ path: z.string(), stored: z.string() })).optional(),
});
function skips(result: Result): z.infer<typeof skipSchema>[] {
  return result.stderr.split('\n').map((line) => skipSchema.parse(JSON.parse(line)));
}
function configure(f: DispatchFixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}
const statusSchema = z.object({ unreadable: z.string(), path: z.string(), error: z.string() });
function unreadable(result: Result): z.infer<typeof statusSchema>[] {
  return result.stdout
    .split('\n')
    .filter((line) => line.startsWith('{'))
    .map((line) => statusSchema.parse(JSON.parse(line)));
}

// A bad leaf is a leaf folder whose state.yaml no longer parses; the folder
// basename is the only name it still answers to.
function makeBad(f: Fixture, slug: string, body: string, container: string = 'issue'): string {
  const path: string = leaf(f, slug, 'plan.synthesis', {}, container);
  writeFileSync(resolve(path, 'state.yaml'), body);
  return path;
}

test('one bad leaf stops only itself: next, phase, config, run-check and status all serve a healthy sibling', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const bad: string = makeBad(f, 'bad-leaf', 'slug: bad-leaf\nnotes: stray\nphase: plan.synthesis\n');
    const healthy: string = leaf(f, 'healthy', 'plan.synthesis');

    const dispatched: Result = await next(f, ['healthy']);
    expect(dispatched.code).toBe(1); // the bad leaf is reported, exit nonzero
    expect(skips(dispatched)).toHaveLength(1);
    expect(skips(dispatched)[0]).toMatchObject({ path: bad });
    expect(database(f).prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue healthy slot=A phase=plan.synthesis leaf=${healthy}`,
    ]);
    const worktree: string = readState(healthy).worktree!;
    expect(worktree.startsWith(storeDir(f))).toBe(true);

    const moved: Result = await cli(f, ['phase', 'healthy', 'failed', '--reason', 'done'], f.root, f.env);
    expect(moved.code).toBe(0);
    expect(readState(healthy).phase).toBe('failed');

    const config: Result = await cli(f, ['config'], worktree, f.env);
    expect(config.code).toBe(0);
    expect(Bun.YAML.parse(config.stdout)).toMatchObject({ repo: 'repo' });

    const check: Result = await cli(
      f,
      ['run-check', '--name', 'probe', '--', 'sh', '-c', 'printf probe-ok'],
      worktree,
      {
        ...f.env,
        HOME: f.home,
      },
    );
    expect(check.code).toBe(0);
    expect(check.stdout).toContain('probe-ok');

    const status: Result = await cli(f, ['status'], f.root, f.env);
    expect(status.code).toBe(1);
    expect(status.stdout).toContain('healthy');
    const failures: z.infer<typeof statusSchema>[] = unreadable(status);
    expect(failures).toHaveLength(1);
    expect(failures[0].path).toBe(resolve(bad, 'state.yaml'));
  } finally {
    f.clean();
  }
}, 30000);

for (const variant of [
  {
    name: 'unknown top-level key',
    body: 'slug: bad-leaf\nphase: plan.synthesis\ncreated: 2026-10-19\nrepo: repo\ndebate: "no"\nblocked-by: []\nnotes: stray\n',
  },
  { name: 'invalid known value', body: 'slug: bad-leaf\nphase: not-a-phase\n' },
  { name: 'malformed YAML', body: 'slug: [' },
]) {
  test(`isolation holds when the bad leaf has ${variant.name}`, async () => {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const bad: string = makeBad(f, 'bad-leaf', variant.body);
      leaf(f, 'healthy', 'plan.synthesis');
      const result: Result = await next(f, ['healthy']);
      expect(result.code).toBe(1);
      expect(skips(result).some((skip) => skip.path === bad)).toBe(true);
      expect(database(f).prompts).toHaveLength(1);
      const status: Result = await cli(f, ['status'], f.root, f.env);
      expect(status.code).toBe(1);
      expect(status.stdout).toContain('healthy');
      const failures: z.infer<typeof statusSchema>[] = unreadable(status);
      expect(failures).toHaveLength(1);
      expect(failures[0].path).toBe(resolve(bad, 'state.yaml'));
    } finally {
      f.clean();
    }
  }, 15000);
}

test('isolation holds when the bad leaf sits under issues/closed', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const bad: string = makeBad(f, 'bad-leaf', 'slug: [');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    // A distinct owner name: a closed owner matching an open owner is a twin conflict, not bad-state isolation.
    const closed: string = resolve(f.root, 'issues/closed/old-issue/bad-leaf');
    mkdirSync(dirname(closed), { recursive: true });
    renameSync(bad, closed);
    leaf(f, 'healthy', 'plan.synthesis');
    const result: Result = await next(f, ['healthy']);
    expect(result.code).toBe(1);
    expect(skips(result).some((skip) => skip.path === closed)).toBe(true);
    expect(database(f).prompts).toHaveLength(1);
    const status: Result = await cli(f, ['status'], f.root, f.env);
    expect(status.code).toBe(1);
    const failures: z.infer<typeof statusSchema>[] = unreadable(status);
    expect(failures).toHaveLength(1);
    expect(failures[0].path).toBe(resolve(closed, 'state.yaml'));
  } finally {
    f.clean();
  }
}, 15000);

test('naming the bad leaf returns its own error naming its file', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const bad: string = makeBad(f, 'bad-leaf', 'slug: [');
    const file: string = resolve(bad, 'state.yaml');
    const picked: Result = await next(f, ['bad-leaf']);
    expect(picked.code).not.toBe(0);
    expect(picked.stderr).toContain(file);
    expect(picked.stderr).not.toContain('Missing leaf');
    const phased: Result = await cli(f, ['phase', 'bad-leaf', 'failed', '--reason', 'x'], f.root, f.env);
    expect(phased.code).not.toBe(0);
    expect(phased.stderr).toContain(file);
    expect(phased.stderr).not.toContain('Missing leaf');
    const detail: Result = await cli(f, ['status', 'bad-leaf'], f.root, f.env);
    expect(detail.code).not.toBe(0);
    expect(detail.stderr).toContain(file);
  } finally {
    f.clean();
  }
}, 15000);

test('a bad leaf is never dispatched or queued but stays owned: reconcile keeps its worktree and tab, dependents stay blocked, another owner completes', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    // Dispatch the leaf while healthy, then corrupt it: its worktree and tab
    // are now owned by a folder whose state can no longer be read.
    const badPath: string = leaf(f, 'bad-leaf', 'plan.synthesis', {}, 'epic/one');
    expect((await next(f, ['bad-leaf'])).code).toBe(0);
    const badWorktree: string = readState(badPath).worktree!;
    const badTab: string = readState(badPath).tab!;
    writeFileSync(resolve(badPath, 'state.yaml'), 'slug: [');

    // Capacity: the bad leaf holds a slot at max_active 1.
    configure(f, { max_active: 1 });
    const waiting: Result = await next(f, ['--all']);
    expect(waiting.code).toBe(1);
    expect(database(f).tabs).toHaveLength(1);
    configure(f, { max_active: 24 });

    // A dependency on the bad leaf stays unmet and is labelled unreadable.
    leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['bad-leaf'] });
    const blocked: Result = await next(f, ['dependent']);
    expect(blocked.code).not.toBe(0);
    expect(blocked.stderr + blocked.stdout).toContain('unreadable');
    expect(readState(resolve(f.root, 'issues/open/issue/dependent')).worktree).toBeUndefined();

    // Its own owner does not complete: the merge sibling merges but epic/one stays open.
    leaf(f, 'sibling', 'merge', { ...holding(f), merge_stamp: '2026-10-19T00:00:00Z' }, 'epic/one');
    // Another owner with no bad leaf completes in the same pass.
    leaf(f, 'solo', 'merge', { ...holding(f), merge_stamp: '2026-10-19T00:00:01Z' }, 'calm');
    const sibling: Result = await cli(f, ['phase', 'sibling', 'merged'], f.root, f.env);
    expect(sibling.code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/epic/one/sibling')).phase).toBe('merged');
    expect(existsSync(resolve(f.root, 'issues/closed/epic'))).toBe(false);
    expect(existsSync(resolve(f.root, 'issues/open/epic/one/sibling/state.yaml'))).toBe(true);
    const solo: Result = await cli(f, ['phase', 'solo', 'merged'], f.root, f.env);
    expect(solo.code).toBe(0);
    expect(solo.stdout).toContain('issue complete calm');
    expect(existsSync(resolve(f.root, 'issues/closed/calm/solo/state.yaml'))).toBe(true);

    // Reconcile keeps the bad leaf's worktree and tab. Other leaves' tabs may
    // close normally now that the pass runs — before this change the walk
    // threw and reconcile never reached them.
    const pass: Result = await next(f, ['--all']);
    expect(pass.code).toBe(1);
    expect(existsSync(badWorktree)).toBe(true);
    expect(database(f).tabs.some((tab) => tab.tab_id === badTab)).toBe(true);
    const keptReport: { kept: { path: string; reason: string }[] } = JSON.parse(
      readFileSync(resolve(f.home, 'reconcile', 'repo.json'), 'utf8'),
    );
    expect(keptReport.kept.some((entry) => entry.path === badWorktree && entry.reason === 'unknown directory')).toBe(
      true,
    );
  } finally {
    f.clean();
  }
}, 30000);

test('no module outside src/state.ts walks issue areas for state.yaml or parses leaf state', () => {
  const roots: string[] = [resolve(import.meta.dir, '../src'), resolve(import.meta.dir, '../skills')];
  const files: string[] = roots.flatMap((root) =>
    [...new Bun.Glob('**/*.ts').scanSync({ cwd: root })]
      .filter((name) => !name.endsWith('.test.ts'))
      .map((name) => resolve(root, name)),
  );
  const offenders: string[] = [];
  for (const file of files) {
    if (file === resolve(import.meta.dir, '../src/state.ts')) continue;
    const text: string = readFileSync(file, 'utf8');
    // The leaf marker: comparing an entry name to 'state.yaml', reading or
    // parsing a leaf state file, or reaching for the schema. Constructing the
    // file path for reporting (resolve(folder, 'state.yaml')) is not a walk.
    if (
      /===\s*['"]state\.yaml['"]|!==\s*['"]state\.yaml['"]|name\s*===\s*['"]state\.yaml['"]/.test(text) ||
      /(readFileSync|existsSync|statSync|mkdirSync|writeFileSync|lstatSync)\([^)]*['"]state\.yaml['"]/.test(text) ||
      text.includes('stateSchema')
    )
      offenders.push(file);
  }
  expect(offenders).toEqual([]);
});

test('owner completion retains duplicate and foreign leaf failures while an independent owner completes', async () => {
  for (const failure of ['foreign', 'duplicate']) {
    const f: DispatchFixture = await dispatchFixture();
    try {
      const healthy: string = leaf(
        f,
        'healthy',
        'merge',
        { ...holding(f), merge_stamp: '2026-10-19T00:00:00Z' },
        'epic/one',
      );
      if (failure === 'foreign') leaf(f, 'bad', 'merged', { repo: 'other' }, 'epic/two');
      else {
        leaf(f, 'bad', 'merged', {}, 'epic/one');
        leaf(f, 'bad', 'merged', {}, 'epic/two');
      }
      leaf(f, 'independent', 'merge', { ...holding(f), merge_stamp: '2026-10-19T00:00:01Z' }, 'calm');

      const merged: Result = await cli(f, ['phase', 'healthy', 'merged'], f.root, f.env);
      expect(merged.code, merged.stderr).toBe(0);
      expect(existsSync(resolve(f.root, 'issues/open/epic'))).toBe(true);
      expect(existsSync(resolve(f.root, 'issues/closed/epic'))).toBe(false);
      expect(readState(healthy).phase).toBe('merged');

      const independent: Result = await cli(f, ['phase', 'independent', 'merged'], f.root, f.env);
      expect(independent.code, independent.stderr).toBe(0);
      expect(existsSync(resolve(f.root, 'issues/closed/calm/independent/state.yaml'))).toBe(true);
    } finally {
      f.clean();
    }
  }
}, 30000);

test('status for a missing leaf does not report a bad sibling', async () => {
  const f: Fixture = await fixture();
  try {
    const bad: string = makeBad(f, 'bad', 'slug: [');
    const result: Result = await cli(f, ['status', 'missing-leaf']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('missing-leaf');
    expect(result.stderr).not.toContain(resolve(bad, 'state.yaml'));
  } finally {
    f.clean();
  }
});

test('reconcile preserves unregistered store entries owned by a foreign leaf', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    leaf(f, 'foreign-leaf', 'implement', { repo: 'other' });
    const entries: string[] = ['foreign-leaf', 'foreign-leaf-old'].map((name) => resolve(storeDir(f), name));
    for (const entry of entries) {
      mkdirSync(entry, { recursive: true });
      writeFileSync(resolve(entry, 'work'), 'unsaved work');
    }
    const result: Result = await next(f, ['--all']);
    expect(result.code).toBe(1);
    for (const entry of entries) {
      expect(existsSync(entry)).toBe(true);
      expect(readFileSync(resolve(entry, 'work'), 'utf8')).toBe('unsaved work');
    }
  } finally {
    f.clean();
  }
});
