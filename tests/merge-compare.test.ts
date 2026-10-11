import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {
  cli,
  fakeHerdr,
  fakeAkrogon,
  fixture,
  leaf,
  leafTempRoot,
  yaml,
  type Fixture,
  type HerdrFixture,
} from './helpers';
import type { Database } from './fake-herdr';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { command, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

const PROMPTED: string = '2026-01-01T00:00:00.000Z';
const CHECK: string[] = ['sh', '-c', 'exit 3'];

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
const originalHome: string | undefined = process.env.HOME;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
});

type Branch = { slug: string; head: string; worktree: string };
type BatchFixture = {
  repo: Repo;
  herdr: HerdrFixture;
  builtOn: string;
  holder: Leaf;
  holderPath: string;
  members: Leaf[];
  record: Batch;
  branches: Map<string, Branch>;
};

function database(herdr: HerdrFixture): Database {
  return z
    .object({ prompts: z.array(z.object({ pane: z.string(), text: z.string() })).default([]) })
    .parse(JSON.parse(readFileSync(herdr.db, 'utf8'))) as Database;
}

function redRecords(f: Fixture): Record<string, unknown>[] {
  const path: string = resolve(f.root, 'issues/red-records.jsonl');
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .trim()
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line));
}

function noticeCalls(db: string): number {
  const callsPath: string = db + '.calls';
  if (!existsSync(callsPath)) return 0;
  return readFileSync(callsPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.array(z.string()).parse(JSON.parse(line)))
    .filter((args) => args[0] === 'notification' && args[1] === 'show').length;
}

function seedRedEntry(
  f: Fixture,
  unit: string,
  firstSeen: string,
  provenance: { command: string[]; cwd: string; scope: string; material: string },
): void {
  appendFileSync(
    resolve(f.root, 'issues/red-records.jsonl'),
    JSON.stringify({
      event: 'opened',
      id: `entry-${unit}`,
      repo: 'repo',
      unit: { runner: 'bun test', file: 'tests/x.test.ts', name: unit },
      provenance,
      first_seen: firstSeen,
      at: '2026-02-01T00:00:30.000Z',
      file: 'compare-seed.yaml',
    }) + '\n',
  );
}

async function branchAt(
  f: Fixture,
  slug: string,
  base: string,
  file: string,
  prepare?: (worktree: string) => Promise<void>,
): Promise<Branch> {
  const worktree: string = resolve(f.home, 'wt-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, base], f.root);
  mkdirSync(dirname(resolve(worktree, file)), { recursive: true });
  writeFileSync(resolve(worktree, file), slug + '\n');
  if (prepare !== undefined) await prepare(worktree);
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  return { slug, head: await command(['git', 'rev-parse', 'HEAD'], worktree), worktree };
}

async function batchFixture(f: Fixture, slugs: string[], solo: boolean = false): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const [holderSlug, ...memberSlugs] = slugs;
  const branches: Map<string, Branch> = new Map();
  for (const slug of slugs) branches.set(slug, await branchAt(f, slug, builtOn, 'file-' + slug));
  const holderPath: string = leaf(
    f,
    holderSlug,
    'merge',
    {
      worktree: branches.get(holderSlug)!.worktree,
      merge_stamp: '2026-10-05T00:00:00.000Z',
      prompted_at: { B: PROMPTED },
    },
    'issue',
  );
  const members: Leaf[] = memberSlugs.map((slug, index) => {
    const path: string = leaf(
      f,
      slug,
      'merge',
      {
        worktree: branches.get(slug)!.worktree,
        merge_stamp: '2026-10-05T00:00:0' + (index + 1) + '.000Z',
      },
      'issue',
    );
    return { path, state: readState(path) };
  });
  let record: Batch;
  if (solo) {
    record = {
      attempt: 'a1',
      started: new Date().toISOString(),
      built_on: builtOn,
      holder: { base: builtOn, head: branches.get(holderSlug)!.head },
      applied: true,
      solo: true,
      members: [],
    };
  } else {
    const items: { slug: string; base: string; head: string }[] = memberSlugs.map((slug) => ({
      slug,
      base: builtOn,
      head: branches.get(slug)!.head,
    }));
    const built: Awaited<ReturnType<typeof buildStack>> = await buildStack(
      repo,
      builtOn,
      items,
      branches.get(holderSlug)!.head,
    );
    if (!built.ok) throw new Error('fixture stack conflict: ' + built.conflict);
    record = {
      attempt: 'a1',
      started: new Date().toISOString(),
      built_on: builtOn,
      holder: { base: builtOn, head: branches.get(holderSlug)!.head },
      applied: true,
      top: built.top,
      members: memberSlugs.map((slug) => ({
        slug,
        base: builtOn,
        head: branches.get(slug)!.head,
        tip: built.tips.get(slug)!,
      })),
    };
    const holder: Leaf = { path: holderPath, state: { ...readState(holderPath), batch: record } };
    await applyStack(
      repo,
      built.top,
      record.members.map((member) => ({
        ...member,
        leaf: members.find((l) => l.state.slug === member.slug)!,
      })),
      holder,
    );
  }
  saveState(holderPath, { ...readState(holderPath), batch: record });
  return {
    repo,
    herdr: fakeHerdr(f),
    builtOn,
    holder: { path: holderPath, state: readState(holderPath) },
    holderPath,
    members,
    record,
    branches,
  };
}

function remoteDir(f: Fixture): string {
  return resolve(f.home, 'remote.git');
}
async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', 'rev-parse', 'refs/heads/main'], remoteDir(f));
}
async function advanceRemote(f: Fixture, files: Record<string, string>): Promise<string> {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akrogon-adv-'));
  await command(['git', 'worktree', 'add', '--detach', dir, 'origin/main'], f.root);
  try {
    for (const [name, content] of Object.entries(files)) {
      const path: string = resolve(dir, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    await command(['git', 'add', '.'], dir);
    await command(['git', 'commit', '-m', 'adv'], dir);
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], dir);
    await command(['git', 'push', 'origin', 'HEAD:main'], dir);
    return sha;
  } finally {
    await command(['git', 'worktree', 'remove', '--force', dir], f.root);
  }
}

function logFile(leafPath: string, name: string): string {
  const path: string = resolve(leafPath, 'implementation', name);
  mkdirSync(resolve(leafPath, 'implementation'), { recursive: true });
  writeFileSync(path, `output of ${name}\n`);
  return path;
}

const PROVENANCE: { command: string[]; cwd: string; scope: string; material: string } = {
  command: CHECK,
  cwd: '',
  scope: 'the whole suite',
  material: 'same environment',
};

type Unit = { name?: string; outcome?: string; verdict?: string; own_criterion?: boolean };

function mergeRecord(
  leafPath: string,
  opts: {
    state?: 'compared' | 'inconsistent' | 'green';
    attempt?: string | null;
    leafRevision?: string;
    counterpart?: string;
    baseLog?: string;
    units?: Unit[];
    extra?: object;
  } = {},
): Record<string, unknown> {
  const runLog: string = logFile(leafPath, 'merge-run.log');
  const retryLog: string = logFile(leafPath, 'merge-retry.log');
  const state: 'compared' | 'inconsistent' | 'green' = opts.state ?? 'compared';
  const unit = (u: Unit): Record<string, unknown> =>
    state === 'green'
      ? {
          runner: 'bun test',
          file: 'tests/x.test.ts',
          name: u.name ?? 'unit one',
          leaf: { outcome: u.outcome ?? 'pass', log: runLog },
        }
      : {
          runner: 'bun test',
          file: 'tests/x.test.ts',
          name: u.name ?? 'unit one',
          ...(u.own_criterion === true ? { own_criterion: true } : {}),
          leaf: { outcome: u.outcome ?? 'fail', log: runLog },
          retry: { outcome: 'fail', log: retryLog },
          ...(state === 'inconsistent'
            ? {}
            : {
                base: {
                  outcome: 'fail',
                  log: opts.baseLog ?? logFile(leafPath, 'merge-base.log'),
                },
              }),
          verdict: u.verdict ?? 'known-red',
        };
  const core: Record<string, unknown> = {
    command: CHECK,
    cwd: PROVENANCE.cwd,
    scope: PROVENANCE.scope,
    material: PROVENANCE.material,
    ...(opts.attempt === null ? {} : { attempt: opts.attempt ?? 'a1' }),
    leaf_revision: opts.leafRevision ?? '',
    log: runLog,
    run: { complete: true },
    state,
    units: (opts.units ?? [{}]).map(unit),
    ...(opts.extra ?? {}),
  };
  if (state !== 'green') core.retry = { log: retryLog, complete: true, outcome: 'fail' };
  if (state === 'inconsistent') core.retry = { log: retryLog, complete: true, outcome: 'pass' };
  if (state === 'compared') {
    core.counterpart_revision = opts.counterpart ?? '';
    core.base = { log: opts.baseLog ?? logFile(leafPath, 'merge-base.log'), complete: true };
  }
  return core;
}

function writeRecord(leafPath: string, name: string, data: object): string {
  const path: string = resolve(leafPath, name);
  yaml(path, data);
  return path;
}

function baseRunLine(
  f: Fixture,
  fields: {
    leaf?: string;
    slot?: string;
    attempt?: string | null;
    base: string;
    command?: string[];
    log: string;
    start?: string;
    end?: boolean;
  },
): void {
  const run: Record<string, unknown> = {
    run: 'run-' + Math.random().toString(36).slice(2),
    repo: 'repo',
    leaf: fields.leaf ?? 'hold',
    slot: fields.slot ?? 'B',
    base: fields.base,
    command: fields.command ?? CHECK,
    cwd: '',
    path: resolve(f.home, 'gone'),
    env_generation: 0,
    pid: 1,
    boot_id: 'boot',
    start: fields.start ?? '2026-02-01T00:00:00.000Z',
    log: fields.log,
    ...(fields.attempt === null ? {} : { attempt: fields.attempt ?? 'a1' }),
  };
  if (fields.end !== false) {
    run.end = '2026-02-01T00:00:20.000Z';
    run.exit = 3;
  }
  appendFileSync(resolve(f.root, 'issues/base-runs.jsonl'), JSON.stringify(run) + '\n');
}

async function headOf(f: BatchFixture): Promise<string> {
  return command(['git', 'rev-parse', 'HEAD'], f.holder.state.worktree);
}

const checkArgs = (file: string): string[] => [
  'phase',
  'hold',
  'merged',
  '--slot',
  'B',
  '--attempt',
  'a1',
  '--check',
  '--compare',
  file,
];
const mergeArgs: string[] = ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'];

test.serial(
  'a compared record with every unit known-red stamps --check, opens entries, and the push lands with no hold',
  async () => {
    const f: Fixture = await fixture();
    try {
      const fx: BatchFixture = await batchFixture(f, ['hold', 'mem-a']);
      const env: NodeJS.ProcessEnv = { ...fx.herdr.env, ...fakeAkrogon(f).env };
      const head: string = await headOf(fx);
      yaml(resolve(f.root, 'issues/config.yaml'), {
        setup: 'mkdir -p node_modules',
        checks: { test: 'bun test' },
        grounding: 'none',
      });
      const run: Result = await cli(
        f,
        ['base-run', '--base', fx.builtOn, '--attempt', 'a1', '--', ...CHECK],
        fx.holder.state.worktree,
        env,
      );
      expect(run.code).toBe(3);
      const baseLog: string = run.stdout.split('\n')[0].replace(/^log: /, '');
      const file: string = writeRecord(
        fx.holderPath,
        'compare-1.yaml',
        mergeRecord(fx.holderPath, { leafRevision: head, counterpart: fx.builtOn, baseLog }),
      );
      const checked: Result = await cli(f, checkArgs(file), f.root, env);
      expect(checked.stderr).toBe('');
      expect(checked.code).toBe(0);
      const stamped: Batch = readState(fx.holderPath).batch!;
      expect(stamped.tested_top).toBe(head);
      expect(stamped.comparisons).toEqual([file]);
      const events: Record<string, unknown>[] = redRecords(f);
      expect(events.map((e) => e.event)).toEqual(['opened', 'notice']);
      expect((events[0] as { first_seen: string }).first_seen).toBe(fx.builtOn);
      expect(noticeCalls(fx.herdr.db)).toBe(1);
      expect(existsSync(resolve(f.home, 'held.yaml'))).toBe(false);
      const merged: Result = await cli(f, mergeArgs, f.root, env);
      expect(merged.code).toBe(0);
      expect(await remoteTip(f)).toBe(head);
      expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
      expect(readState(resolve(f.root, 'issues/closed/issue/mem-a')).phase).toBe('merged');
      expect(existsSync(resolve(f.home, 'held.yaml'))).toBe(false);
    } finally {
      f.clean();
    }
  },
);

test.serial('an inconsistent record stamps --check without a base run', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold', 'mem-a']);
    const head: string = await headOf(fx);
    const file: string = writeRecord(
      fx.holderPath,
      'compare-flaky.yaml',
      mergeRecord(fx.holderPath, { state: 'inconsistent', leafRevision: head }),
    );
    const checked: Result = await cli(f, checkArgs(file), f.root, fx.herdr.env);
    expect(checked.code).toBe(0);
    expect(readState(fx.holderPath).batch!.comparisons).toEqual([file]);
    expect(redRecords(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('--compare on merged without --check and on check.fix is refused', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const head: string = await headOf(fx);
    const file: string = writeRecord(
      fx.holderPath,
      'compare-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    const bare: Result = await cli(f, [...mergeArgs, '--compare', file], f.root, fx.herdr.env);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('--compare');
    const fix: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1', '--compare', file],
      f.root,
      fx.herdr.env,
    );
    expect(fix.code).not.toBe(0);
    expect(fix.stderr).toContain('--compare');
    expect(readState(fx.holderPath).batch).toBeDefined();
  } finally {
    f.clean();
  }
});

const refusals: { name: string; opts: Parameters<typeof mergeRecord>[1]; expect: string }[] = [
  { name: 'a wrong attempt', opts: { attempt: 'a2' }, expect: 'attempt' },
  { name: 'no attempt', opts: { attempt: null }, expect: 'attempt' },
  { name: 'a wrong leaf revision', opts: { leafRevision: '0'.repeat(40) }, expect: 'leaf_revision' },
  { name: 'a wrong counterpart', opts: { counterpart: '0'.repeat(40) }, expect: 'counterpart' },
];

for (const refusal of refusals) {
  test.serial(`merged --check --compare refuses ${refusal.name}`, async () => {
    const f: Fixture = await fixture();
    try {
      const fx: BatchFixture = await batchFixture(f, ['hold']);
      const head: string = await headOf(fx);
      const file: string = writeRecord(
        fx.holderPath,
        'compare-1.yaml',
        mergeRecord(fx.holderPath, {
          leafRevision: head,
          counterpart: fx.builtOn,
          ...refusal.opts,
        }),
      );
      const checked: Result = await cli(f, checkArgs(file), f.root, fx.herdr.env);
      expect(checked.code).not.toBe(0);
      expect(checked.stderr).not.toContain('not valid during merge');
      expect(checked.stderr).toContain(refusal.expect);
      expect(readState(fx.holderPath).batch!.tested_top).toBeUndefined();
      expect(readState(fx.holderPath).batch!.comparisons).toBeUndefined();
    } finally {
      f.clean();
    }
  });
}

const baseRunRefusals: {
  name: string;
  mutate: (line: Parameters<typeof baseRunLine>[1]) => Parameters<typeof baseRunLine>[1];
  expect: string;
}[] = [
  { name: 'no base-run line at all', mutate: () => ({ base: '', log: '' }), expect: 'base-run' },
  {
    name: 'a base-run line without the attempt',
    mutate: (line) => ({ ...line, attempt: null }),
    expect: 'base-run',
  },
  {
    name: 'a base-run line started before the merge prompt',
    mutate: (line) => ({ ...line, start: '2020-01-01T00:00:00.000Z' }),
    expect: 'prompted_at',
  },
  {
    name: 'a base-run line for a different command',
    mutate: (line) => ({ ...line, command: ['bun', 'test'] }),
    expect: 'base-run',
  },
  {
    name: 'a base-run line with no end or exit',
    mutate: (line) => ({ ...line, end: false }),
    expect: 'end or exit',
  },
];

for (const refusal of baseRunRefusals) {
  test.serial(`merged --check --compare refuses ${refusal.name}`, async () => {
    const f: Fixture = await fixture();
    try {
      const fx: BatchFixture = await batchFixture(f, ['hold']);
      const head: string = await headOf(fx);
      const baseLog: string = logFile(fx.holderPath, 'merge-base.log');
      const line: Parameters<typeof baseRunLine>[1] = refusal.mutate({
        base: fx.builtOn,
        log: baseLog,
      });
      if (line.base !== '') baseRunLine(f, line);
      const file: string = writeRecord(
        fx.holderPath,
        'compare-1.yaml',
        mergeRecord(fx.holderPath, { leafRevision: head, counterpart: fx.builtOn, baseLog }),
      );
      const checked: Result = await cli(f, checkArgs(file), f.root, fx.herdr.env);
      expect(checked.code).not.toBe(0);
      expect(checked.stderr).not.toContain('not valid during merge');
      expect(checked.stderr.toLowerCase()).toContain(refusal.expect.toLowerCase());
      expect(readState(fx.holderPath).batch!.tested_top).toBeUndefined();
    } finally {
      f.clean();
    }
  });
}

const verdictRefusals: { name: string; unit: Unit; expect: string }[] = [
  { name: 'a new unit', unit: { verdict: 'new' }, expect: 'new' },
  { name: 'an unverified unit', unit: { verdict: 'unverified' }, expect: 'unverified' },
  { name: 'an own-criterion unit', unit: { own_criterion: true }, expect: 'own' },
];

for (const refusal of verdictRefusals) {
  test.serial(`merged --check --compare refuses ${refusal.name}`, async () => {
    const f: Fixture = await fixture();
    try {
      const fx: BatchFixture = await batchFixture(f, ['hold']);
      const head: string = await headOf(fx);
      const file: string = writeRecord(
        fx.holderPath,
        'compare-1.yaml',
        mergeRecord(fx.holderPath, { state: 'inconsistent', leafRevision: head, units: [refusal.unit] }),
      );
      const checked: Result = await cli(f, checkArgs(file), f.root, fx.herdr.env);
      expect(checked.code).not.toBe(0);
      expect(checked.stderr).not.toContain('not valid during merge');
      expect(checked.stderr.toLowerCase()).toContain(refusal.expect);
      expect(readState(fx.holderPath).batch!.tested_top).toBeUndefined();
    } finally {
      f.clean();
    }
  });
}

test.serial(
  'a unit passing on the built_on side resolves at --check under the ancestry rule; a newer first_seen stays',
  async () => {
    const f: Fixture = await fixture();
    try {
      const fx: BatchFixture = await batchFixture(f, ['hold']);
      const head: string = await headOf(fx);
      const run: Result = await cli(
        f,
        ['base-run', '--base', fx.builtOn, '--attempt', 'a1', '--', ...CHECK],
        fx.holder.state.worktree,
        { ...fx.herdr.env, ...fakeAkrogon(f).env },
      );
      const baseLog: string = run.stdout.split('\n')[0].replace(/^log: /, '');
      const firstSeen: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
      seedRedEntry(f, 'resolve-me', firstSeen, PROVENANCE);
      seedRedEntry(f, 'newer-than-evidence', head, PROVENANCE);
      const record: Record<string, unknown> = mergeRecord(fx.holderPath, {
        leafRevision: head,
        counterpart: fx.builtOn,
        baseLog,
        units: [
          { name: 'resolve-me', outcome: 'fail' },
          { name: 'newer-than-evidence', outcome: 'fail' },
        ],
      });
      (record.units as Record<string, unknown>[])[0].base = { outcome: 'pass', log: baseLog };
      const file: string = writeRecord(fx.holderPath, 'compare-1.yaml', record);
      const checked: Result = await cli(f, checkArgs(file), f.root, fx.herdr.env);
      expect(checked.code).toBe(0);
      const events: Record<string, unknown>[] = redRecords(f);
      const resolved = events.filter((e) => e.event === 'resolved') as { id: string; resolving: string }[];
      expect(resolved.map((e) => e.id)).toEqual(['entry-resolve-me']);
      expect(resolved[0].resolving).toBe(fx.builtOn);
      const opened = events.filter((e) => e.event === 'opened') as {
        id: string;
        unit: { name: string };
        first_seen: string;
      }[];
      expect(opened).toHaveLength(3);
      // The known-red unit re-adds a fresh entry bound to this run's base.
      const reopened = opened.filter((e) => e.unit.name === 'resolve-me');
      expect(reopened).toHaveLength(2);
      expect(reopened[1].first_seen).toBe(fx.builtOn);
      expect(noticeCalls(fx.herdr.db)).toBe(1);
    } finally {
      f.clean();
    }
  },
);

test.serial('a green record resolves its passed units only when the landed revision is its leaf revision', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const env: NodeJS.ProcessEnv = fx.herdr.env;
    const head: string = await headOf(fx);
    seedRedEntry(f, 'unit one', fx.builtOn, PROVENANCE);
    seedRedEntry(f, 'still-red', fx.builtOn, PROVENANCE);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, {
        state: 'green',
        leafRevision: head,
        units: [
          { name: 'unit one', outcome: 'pass' },
          { name: 'still-red', outcome: 'fail' },
        ],
      }),
    );
    expect((await cli(f, checkArgs(file), f.root, env)).code).toBe(0);
    expect(redRecords(f).filter((e) => e.event === 'resolved')).toHaveLength(0);
    expect((await cli(f, mergeArgs, f.root, env)).code).toBe(0);
    const events: Record<string, unknown>[] = redRecords(f);
    const resolved = events.filter((e) => e.event === 'resolved') as { id: string; resolving: string }[];
    expect(resolved).toHaveLength(1);
    expect(resolved[0].id).toBe('entry-unit one');
    expect(resolved[0].resolving).toBe(await remoteTip(f));
  } finally {
    f.clean();
  }
});

test.serial('a green record with no matching entry resolves nothing and a stale file fails the stamp', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const head: string = await headOf(fx);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    expect((await cli(f, mergeArgs, f.root, fx.herdr.env)).code).toBe(0);
    expect(redRecords(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a green record resolves in the landed path after a refused push that actually landed', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const head: string = await headOf(fx);
    seedRedEntry(f, 'unit one', fx.builtOn, PROVENANCE);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    const wrapper: string = resolve(f.home, 'gitwrap/git');
    mkdirSync(dirname(wrapper), { recursive: true });
    writeFileSync(
      wrapper,
      `#!/bin/sh\nif [ "$1" = push ]; then\n  '${realGit}' "$@" || true\n  echo '! [rejected] main (non-fast-forward)' >&2\n  exit 1\nfi\nexec '${realGit}' "$@"\n`,
    );
    chmodSync(wrapper, 0o755);
    const env: NodeJS.ProcessEnv = {
      ...fx.herdr.env,
      PATH: `${dirname(wrapper)}:${process.env.PATH}`,
    };
    const merged: Result = await cli(f, mergeArgs, f.root, env);
    expect(merged.code).toBe(0);
    expect(await remoteTip(f)).toBe(head);
    const resolved = redRecords(f).filter((e) => e.event === 'resolved') as { id: string }[];
    expect(resolved.map((e) => e.id)).toEqual(['entry-unit one']);
  } finally {
    f.clean();
  }
});

test.serial('a landed candidate resolves green records in the next pass reconcile', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    process.env.HOME = f.home;
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const head: string = await headOf(fx);
    seedRedEntry(f, 'unit one', fx.builtOn, PROVENANCE);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    await command(['git', 'push', 'origin', `${head}:refs/heads/main`], f.root);
    saveState(fx.holderPath, {
      ...readState(fx.holderPath),
      batch: { ...readState(fx.holderPath).batch!, candidate: head },
    });
    const next: Result = await cli(f, ['next'], f.root, fx.herdr.env);
    expect(next.code).toBe(0);
    const resolved = redRecords(f).filter((e) => e.event === 'resolved') as { id: string }[];
    expect(resolved.map((e) => e.id)).toEqual(['entry-unit one']);
  } finally {
    f.clean();
  }
});

test.serial('a restack holding a known-red record prints rerun and drops the records', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold', 'mem-a']);
    const head: string = await headOf(fx);
    const file: string = writeRecord(
      fx.holderPath,
      'compare-1.yaml',
      mergeRecord(fx.holderPath, {
        state: 'inconsistent',
        leafRevision: head,
        units: [{ name: 'unit one', verdict: 'known-red' }],
      }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    await advanceRemote(f, { 'issues/notes.md': 'moved\n' });
    const merged: Result = await cli(f, mergeArgs, f.root, fx.herdr.env);
    expect(merged.code).toBe(0);
    expect(merged.stdout).toContain('rerun');
    expect(merged.stdout).not.toContain('reuse');
    const after: Batch = readState(fx.holderPath).batch!;
    expect(after.comparisons).toBeUndefined();
    expect(after.decision).toBe('rerun');
  } finally {
    f.clean();
  }
});

test.serial('a restack holding only a green record keeps reuse and resolves nothing at landing', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold', 'mem-a']);
    const head: string = await headOf(fx);
    seedRedEntry(f, 'unit one', fx.builtOn, PROVENANCE);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    await advanceRemote(f, { 'issues/notes.md': 'moved\n' });
    const refused: Result = await cli(f, mergeArgs, f.root, fx.herdr.env);
    expect(refused.code).toBe(0);
    expect(refused.stdout).toContain('reuse');
    const after: Batch = readState(fx.holderPath).batch!;
    expect(after.comparisons).toBeUndefined();
    expect(after.decision).toBe('reuse');
    const merged: Result = await cli(f, mergeArgs, f.root, fx.herdr.env);
    expect(merged.code).toBe(0);
    expect(redRecords(f).filter((e) => e.event === 'resolved')).toHaveLength(0);
  } finally {
    f.clean();
  }
});

test.serial('a restack with a green record still reruns when issues/config.yaml changed', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold', 'mem-a']);
    const head: string = await headOf(fx);
    const file: string = writeRecord(
      fx.holderPath,
      'green-1.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: head }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    await advanceRemote(f, { 'issues/config.yaml': 'checks: {test: "bun test"}\nextra: true\n' });
    const refused: Result = await cli(f, mergeArgs, f.root, fx.herdr.env);
    expect(refused.code).toBe(0);
    expect(refused.stdout).toContain('rerun');
    expect(refused.stdout).not.toContain('reuse');
    const after: Batch = readState(fx.holderPath).batch!;
    expect(after.comparisons).toBeUndefined();
    expect(after.decision).toBe('rerun');
  } finally {
    f.clean();
  }
});

test.serial('a solo record accepts a compared record bound to its built_on and head', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold'], true);
    const env: NodeJS.ProcessEnv = { ...fx.herdr.env, ...fakeAkrogon(f).env };
    const head: string = await headOf(fx);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { test: 'bun test' },
      grounding: 'none',
    });
    const run: Result = await cli(
      f,
      ['base-run', '--base', fx.builtOn, '--attempt', 'a1', '--', ...CHECK],
      fx.holder.state.worktree,
      env,
    );
    const baseLog: string = run.stdout.split('\n')[0].replace(/^log: /, '');
    const file: string = writeRecord(
      fx.holderPath,
      'compare-1.yaml',
      mergeRecord(fx.holderPath, { leafRevision: head, counterpart: fx.builtOn, baseLog }),
    );
    expect((await cli(f, checkArgs(file), f.root, env)).code).toBe(0);
    expect(readState(fx.holderPath).batch!.comparisons).toEqual([file]);
  } finally {
    f.clean();
  }
});

test.serial('a later merge check without comparisons clears the prior accepted records', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const file: string = writeRecord(
      fx.holderPath,
      'green-clear.yaml',
      mergeRecord(fx.holderPath, { state: 'green', leafRevision: await headOf(fx) }),
    );
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    expect(readState(fx.holderPath).batch!.comparisons).toEqual([file]);
    expect((await cli(f, [...mergeArgs, '--check'], f.root, fx.herdr.env)).code).toBe(0);
    expect(readState(fx.holderPath).batch!.comparisons).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('restack reruns an accepted known-red record even when its counterpart unit passed', async () => {
  const f: Fixture = await fixture();
  try {
    const fx: BatchFixture = await batchFixture(f, ['hold']);
    const baseLog: string = logFile(fx.holderPath, 'passing-counterpart.log');
    baseRunLine(f, { base: fx.builtOn, log: baseLog });
    const record: Record<string, unknown> = mergeRecord(fx.holderPath, {
      leafRevision: await headOf(fx),
      counterpart: fx.builtOn,
      baseLog,
    });
    (record.units as Record<string, unknown>[])[0].base = { outcome: 'pass', log: baseLog };
    const file: string = writeRecord(fx.holderPath, 'known-red-passing-base.yaml', record);
    expect((await cli(f, checkArgs(file), f.root, fx.herdr.env)).code).toBe(0);
    await advanceRemote(f, { 'issues/notes.md': 'another issue record landed\n' });
    const merged: Result = await cli(f, mergeArgs, f.root, fx.herdr.env);
    expect(merged.code).toBe(0);
    expect(readState(fx.holderPath).batch!.decision).toBe('rerun');
    expect(readState(fx.holderPath).batch!.comparisons).toBeUndefined();
  } finally {
    f.clean();
  }
});
