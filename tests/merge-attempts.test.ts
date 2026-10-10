import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { cli, fakeHerdr, fixture, leaf, leafTempRoot, yaml, type Fixture, type HerdrFixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State, type Tool } from '../src/state';
import { attemptRecordSchema } from '../src/attempts';
import { logSchema } from '../src/log';
import { command, type Result } from '../src/shell';
import { applyStack, buildStack } from '../src/batch';

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
});

type Attempt = z.infer<typeof attemptRecordSchema>;
type Branch = { slug: string; head: string; worktree: string };
type BatchFixture = {
  repo: Repo;
  herdr: HerdrFixture;
  builtOn: string;
  holder: Leaf;
  members: Leaf[];
  record: Batch;
  branches: Map<string, Branch>;
};

function attemptLines(f: Fixture): Attempt[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map((line) => attemptRecordSchema.parse(JSON.parse(line)));
}

function logBytes(f: Fixture): string | undefined {
  const file: string = resolve(f.root, 'issues/log.jsonl');
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

async function branchAt(
  f: Fixture,
  slug: string,
  base: string,
  file: string,
  prepare?: (worktree: string) => Promise<void>,
  inStore: boolean = false,
): Promise<Branch> {
  const worktree: string = inStore ? resolve(f.root, 'issues/worktrees', slug) : resolve(f.home, 'wt-' + slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, base], f.root);
  mkdirSync(dirname(resolve(worktree, file)), { recursive: true });
  writeFileSync(resolve(worktree, file), slug + '\n');
  if (prepare !== undefined) await prepare(worktree);
  await command(['git', 'add', '.'], worktree);
  await command(['git', 'commit', '-m', slug], worktree);
  return { slug, head: await command(['git', 'rev-parse', 'HEAD'], worktree), worktree };
}

async function batchFixture(f: Fixture, slugs: string[], inStore: boolean = false): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const [holderSlug, ...memberSlugs] = slugs;
  const branches: Map<string, Branch> = new Map();
  for (const slug of slugs) branches.set(slug, await branchAt(f, slug, builtOn, 'file-' + slug, undefined, inStore));
  const holderPath: string = leaf(f, holderSlug, 'merge', {
    worktree: branches.get(holderSlug)!.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const members: Leaf[] = memberSlugs.map((slug, index) => {
    const path: string = leaf(f, slug, 'merge', {
      worktree: branches.get(slug)!.worktree,
      merge_stamp: '2026-10-05T00:00:0' + (index + 1) + '.000Z',
    });
    return { path, state: readState(path) };
  });
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
  const record: Batch = {
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
  const holderState: State = { ...readState(holderPath), batch: record };
  saveState(holderPath, holderState);
  const holder: Leaf = { path: holderPath, state: holderState };
  await applyStack(
    repo,
    built.top,
    record.members.map((member) => ({ ...member, leaf: members.find((l) => l.state.slug === member.slug)! })),
    holder,
  );
  return { repo, herdr: fakeHerdr(f), builtOn, holder, members, record, branches };
}

async function soloFixture(f: Fixture): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const branch: Branch = await branchAt(f, 'hold', builtOn, 'file-hold');
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: branch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const record: Batch = {
    attempt: 'a1',
    started: new Date().toISOString(),
    built_on: builtOn,
    holder: { base: builtOn, head: branch.head },
    applied: true,
    solo: true,
    members: [],
  };
  saveState(holderPath, { ...readState(holderPath), batch: record });
  return {
    repo,
    herdr: fakeHerdr(f),
    builtOn,
    holder: { path: holderPath, state: readState(holderPath) },
    members: [],
    record,
    branches: new Map([['hold', branch]]),
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

function psiFile(total: string): string {
  return 'some avg10=0.00 avg60=0.00 avg300=0.00 total=' + total + '\nfull avg10=0.00 avg60=0.00 avg300=0.00 total=0\n';
}

function pressureDir(
  f: Fixture,
  totals: { cpu: string; memory: string; io: string },
  bootId: string = 'boot-1',
): string {
  const dir: string = resolve(f.home, 'psi/proc/pressure');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'cpu'), psiFile(totals.cpu));
  writeFileSync(resolve(dir, 'memory'), psiFile(totals.memory));
  writeFileSync(resolve(dir, 'io'), psiFile(totals.io));
  const boot: string = resolve(f.home, 'psi/proc/sys/kernel/random');
  mkdirSync(boot, { recursive: true });
  writeFileSync(resolve(boot, 'boot_id'), bootId + '\n');
  return dir;
}

function withStart(
  record: Batch,
  start: { cpu: number; memory: number; io: number },
  bootId: string = 'boot-1',
): Batch {
  return { ...record, pressure_start: { ...start, boot_id: bootId } };
}

function saveBatch(leafPath: string, record: Batch): void {
  saveState(leafPath, { ...readState(leafPath), batch: record });
}

function argList(args: (string | boolean | undefined)[]): string {
  return args.map((arg) => (arg === undefined ? 'undefined' : JSON.stringify(arg))).join(', ');
}

function phaseBody(slug: string, phase: string, args: (string | boolean | undefined)[], dir: string): string {
  const params: (string | boolean | undefined)[] = [slug, phase, ...args];
  while (params.length < 10) params.push(undefined);
  params.push(dir);
  return (
    'import { phaseCommand } from ' +
    JSON.stringify(resolve(import.meta.dir, '../src/phase.ts')) +
    ';\ntry { await phaseCommand(' +
    argList(params) +
    '); } catch (e) { console.error(e); process.exit(1); }\n'
  );
}

const nextBody: string =
  'import { nextCommand } from ' +
  JSON.stringify(resolve(import.meta.dir, '../src/next.ts')) +
  ';\ntry { await nextCommand(undefined, process.argv[2]); } catch (e) { console.error(e); process.exit(1); }\n';

const mergePassBody: string =
  'import { mergePass } from ' +
  JSON.stringify(resolve(import.meta.dir, '../src/next.ts')) +
  ';\nimport { readGlobal, readRepo } from ' +
  JSON.stringify(resolve(import.meta.dir, '../src/config.ts')) +
  ";\ntry { await mergePass(readGlobal(), readRepo('repo', process.cwd()), { skipped: new Set(), dispatched: new Set() }, false, process.argv[2]); } catch (e) { console.error(e); process.exit(1); }\n";

async function spawn(
  f: Fixture,
  name: string,
  body: string,
  env: NodeJS.ProcessEnv,
  args: string[] = [],
): Promise<Result> {
  const script: string = resolve(f.home, name + '.ts');
  writeFileSync(script, body);
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, script, ...args], {
    cwd: f.root,
    env: {
      ...process.env,
      AKROGON_HOME: f.home,
      HERDR_PANE_ID: '',
      AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
      ...env,
    },
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trim(), stderr: stderr.trim() };
}

test.serial('a green batch appends one merged attempt line and log.jsonl keeps its move-line shape', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const logBefore: string | undefined = logBytes(f);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    const line: Attempt = lines[0];
    expect(line.outcome).toBe('merged');
    expect(line.repo).toBe('repo');
    expect(line.holder).toBe('hold');
    expect(line.members).toEqual(['mem-a', 'mem-b']);
    expect(line.attempt).toBe(record.attempt);
    expect(line.built_on).toMatch(/^[0-9a-f]{40}$/);
    expect(line.tested_top).toMatch(/^[0-9a-f]{40}$/);
    expect(line.start).toBeDefined();
    expect(Number.isNaN(new Date(line.start!).getTime())).toBe(false);
    expect(Number.isNaN(new Date(line.end).getTime())).toBe(false);
    expect(new Date(line.start!).getTime()).toBeLessThan(new Date(line.end).getTime());
    // Moves during a green run always append move records to log.jsonl; the attempt
    // writer must leave the file append-only: earlier bytes identical, new lines
    // parse as move records and carry no attempt fields.
    const logAfter: string | undefined = logBytes(f);
    expect(logAfter).toBeDefined();
    if (logBefore !== undefined) expect(logAfter!.startsWith(logBefore)).toBe(true);
    const freshLines: string[] = logAfter!
      .slice(logBefore?.length ?? 0)
      .trim()
      .split('\n');
    for (const text of freshLines) {
      const move: z.infer<typeof logSchema> = logSchema.parse(JSON.parse(text));
      expect(move.to).toBe('merged');
      expect(JSON.parse(text)).not.toHaveProperty('attempt');
    }
  } finally {
    f.clean();
  }
});

test.serial('a landed candidate reconciles to exactly one merged attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    await command(['git', 'push', 'origin', 'refs/heads/hold:main'], f.root);
    saveState(holder.path, {
      ...readState(holder.path),
      batch: { ...readState(holder.path).batch!, candidate: record.top },
    });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].attempt).toBe(record.attempt);
  } finally {
    f.clean();
  }
});

test.serial('a solo check.fix appends exactly one red attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await soloFixture(f);
    const moved: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a batch check.fix appends exactly one split attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('split');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
  } finally {
    f.clean();
  }
});

test.serial('a refused push restacked to reuse appends exactly one reuse line at the landing push', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const advanced: string = await advanceRemote(f, {
      'issues/open/x/state.yaml': 'x\n',
      'learnings/history/y.md': 'y\n',
    });
    const refused: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(refused.code).toBe(0);
    expect(refused.stdout).toMatch(/^reuse tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    expect(attemptLines(f)).toEqual([]);
    const landed: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(landed.code).toBe(0);
    expect(await remoteTip(f)).not.toBe(advanced);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('reuse');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].built_on).toBe(advanced);
  } finally {
    f.clean();
  }
});

test.serial('an unlanded candidate discards to exactly one red attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b'], true);
    saveState(holder.path, {
      ...readState(holder.path),
      batch: { ...readState(holder.path).batch!, candidate: record.top },
    });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].holder).toBe('hold');
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    expect(lines[0].attempt).toBe(record.attempt);
  } finally {
    f.clean();
  }
});

test.serial('a failed unlanded holder records one red attempt before recovery discards its batch', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b'], true);
    saveState(holder.path, { ...readState(holder.path), batch: { ...record, candidate: record.top } });
    const failed: Result = await cli(
      f,
      ['phase', 'hold', 'failed', '--slot', 'B', '--reason', 'push interrupted before landing'],
      f.root,
      herdr.env,
    );
    expect(failed.code).toBe(0);
    expect(readState(holder.path).phase).toBe('failed');
    expect(readState(holder.path).batch).toBeUndefined();
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].attempt).toBe(record.attempt);
    expect(lines[0].members).toEqual(['mem-a', 'mem-b']);
    for (let pass: number = 0; pass < 2; pass++) {
      await cli(f, ['next'], f.root, herdr.env);
      expect(attemptLines(f)).toEqual(lines);
    }
  } finally {
    f.clean();
  }
});

test.serial('stale-attempt and non-holder phase calls write no attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a']);
    const stale: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'bogus'],
      f.root,
      herdr.env,
    );
    expect(stale.code).not.toBe(0);
    expect(stale.stderr).toContain('Stale attempt');
    const outsider: Result = await cli(f, ['phase', 'mem-a', 'merged', '--slot', 'B'], f.root, herdr.env);
    expect(outsider.code).not.toBe(0);
    expect(outsider.stderr).toContain('Merge turn refused');
    expect(existsSync(resolve(f.root, 'issues/merge-attempts.jsonl'))).toBe(false);
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a merged line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 10, memory: 20, io: 30 }));
    const dir: string = pressureDir(f, { cpu: '60', memory: '90', io: '180' });
    const checked: Result = await spawn(
      f,
      'check',
      phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir),
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(attemptLines(f)).toEqual([]);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].pressure).toEqual({ cpu: 50, memory: 70, io: 150 });
  } finally {
    f.clean();
  }
});

test.serial('a restacked reuse line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 5, memory: 6, io: 7 }));
    const dir: string = pressureDir(f, { cpu: '15', memory: '26', io: '47' });
    expect(
      (await spawn(f, 'check', phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir), herdr.env))
        .code,
    ).toBe(0);
    const advanced: string = await advanceRemote(f, {
      'issues/open/x/state.yaml': 'x\n',
      'learnings/history/y.md': 'y\n',
    });
    const refused: Result = await spawn(
      f,
      'refused',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(refused.code).toBe(0);
    expect(refused.stdout).toMatch(/^reuse tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    expect(attemptLines(f)).toEqual([]);
    const landed: Result = await spawn(
      f,
      'landed',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(landed.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('reuse');
    expect(lines[0].built_on).toBe(advanced);
    expect(lines[0].pressure).toEqual({ cpu: 10, memory: 20, io: 40 });
  } finally {
    f.clean();
  }
});

test.serial('a solo red line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await soloFixture(f);
    saveBatch(holder.path, withStart(record, { cpu: 3, memory: 4, io: 5 }));
    const dir: string = pressureDir(f, { cpu: '7', memory: '12', io: '25' });
    const red: Result = await spawn(
      f,
      'red',
      phaseBody('hold', 'check.fix', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].pressure).toEqual({ cpu: 4, memory: 8, io: 20 });
  } finally {
    f.clean();
  }
});

test.serial('a split line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 1, memory: 2, io: 3 }));
    const dir: string = pressureDir(f, { cpu: '9', memory: '6', io: '33' });
    const red: Result = await spawn(
      f,
      'split',
      phaseBody('hold', 'check.fix', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('split');
    expect(lines[0].pressure).toEqual({ cpu: 8, memory: 4, io: 30 });
  } finally {
    f.clean();
  }
});

test.serial('a held line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, builtOn, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 2, memory: 3, io: 4 }));
    const dir: string = pressureDir(f, { cpu: '6', memory: '8', io: '14' });
    const held: Result = await spawn(
      f,
      'held',
      phaseBody('hold', 'check.fix', ['B', undefined, undefined, undefined, 'a1', builtOn, 'bun test'], dir),
      herdr.env,
    );
    expect(held.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('held');
    expect(lines[0].pressure).toEqual({ cpu: 4, memory: 5, io: 10 });
  } finally {
    f.clean();
  }
});

test.serial('an ejected line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b'], true);
    saveBatch(holder.path, withStart(record, { cpu: 8, memory: 7, io: 6 }));
    const dir: string = pressureDir(f, { cpu: '18', memory: '12', io: '10' });
    const ejected: Result = await spawn(
      f,
      'ejected',
      phaseBody('hold', 'check.fix', ['B', undefined, undefined, undefined, 'a1', undefined, undefined, 'mem-a'], dir),
      herdr.env,
    );
    expect(ejected.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('ejected');
    expect(lines[0].culprit).toBe('mem-a');
    expect(lines[0].pressure).toEqual({ cpu: 10, memory: 5, io: 4 });
  } finally {
    f.clean();
  }
});

test.serial('a reconciled merged line carries PSI stall deltas from batch creation', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    await command(['git', 'push', 'origin', 'refs/heads/hold:main'], f.root);
    saveBatch(holder.path, withStart({ ...record, candidate: record.top }, { cpu: 11, memory: 13, io: 17 }));
    const dir: string = pressureDir(f, { cpu: '21', memory: '23', io: '47' });
    const next: Result = await spawn(f, 'next', nextBody, herdr.env, [dir]);
    expect(next.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].pressure).toEqual({ cpu: 10, memory: 10, io: 30 });
  } finally {
    f.clean();
  }
});

test.serial('a merged line without pressure_start keeps no pressure key even with a malformed dir', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const dir: string = pressureDir(f, { cpu: 'abc', memory: '90', io: '180' });
    expect(
      (await spawn(f, 'check', phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir), herdr.env))
        .code,
    ).toBe(0);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].pressure).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('a merged line with an absent pressure dir keeps no pressure key', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 10, memory: 20, io: 30 }));
    const dir: string = resolve(f.home, 'psi/proc/pressure');
    expect(
      (await spawn(f, 'check', phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir), herdr.env))
        .code,
    ).toBe(0);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].pressure).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('a merged line with a changed boot id keeps no pressure key', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    saveBatch(holder.path, withStart(record, { cpu: 10, memory: 20, io: 30 }, 'boot-old'));
    const dir: string = pressureDir(f, { cpu: '60', memory: '90', io: '180' }, 'boot-new');
    expect(
      (await spawn(f, 'check', phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir), herdr.env))
        .code,
    ).toBe(0);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('merged');
    expect(lines[0].pressure).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('a malformed pressure file stops the ending call before any push or state change', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const batch: Batch = withStart(record, { cpu: 10, memory: 20, io: 30 });
    saveBatch(holder.path, batch);
    const dir: string = pressureDir(f, { cpu: 'abc', memory: '90', io: '180' });
    const tip: string = await remoteTip(f);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain(resolve(dir, 'cpu'));
    expect(merged.stderr).toContain('total=');
    expect(attemptLines(f)).toEqual([]);
    expect(readState(holder.path).batch).toEqual(batch);
    expect(await remoteTip(f)).toBe(tip);
  } finally {
    f.clean();
  }
});

test.serial('a malformed pressure file stops batch creation before any batch or line exists', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    const herdr: HerdrFixture = fakeHerdr(f);
    const holderPath: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const dir: string = pressureDir(f, { cpu: 'abc', memory: '90', io: '180' });
    const merged: Result = await spawn(f, 'create', mergePassBody, herdr.env, [dir]);
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain(resolve(dir, 'cpu'));
    expect(merged.stderr).toContain('total=');
    expect(readState(holderPath).batch).toBeUndefined();
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a decimal pressure total stops the ending call before any push or state change', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f, ['hold', 'mem-a', 'mem-b']);
    const batch: Batch = withStart(record, { cpu: 10, memory: 20, io: 30 });
    saveBatch(holder.path, batch);
    const dir: string = pressureDir(f, { cpu: '12.5', memory: '90', io: '180' });
    const checked: Result = await spawn(
      f,
      'check',
      phaseBody('hold', 'merged', ['B', undefined, undefined, true, 'a1'], dir),
      herdr.env,
    );
    expect(checked.code).toBe(0);
    const before: State = readState(holder.path);
    const tip: string = await remoteTip(f);
    const merged: Result = await spawn(
      f,
      'merged',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, 'a1'], dir),
      herdr.env,
    );
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain(resolve(dir, 'cpu'));
    expect(merged.stderr).toContain('total=');
    expect(attemptLines(f)).toEqual([]);
    expect(readState(holder.path)).toEqual(before);
    expect(await remoteTip(f)).toBe(tip);
  } finally {
    f.clean();
  }
});

test.serial('a decimal pressure total stops batch creation before any batch or line exists', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    const herdr: HerdrFixture = fakeHerdr(f);
    const holderPath: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const dir: string = pressureDir(f, { cpu: '12.5', memory: '90', io: '180' });
    const before: State = readState(holderPath);
    const tip: string = await remoteTip(f);
    const merged: Result = await spawn(f, 'create', mergePassBody, herdr.env, [dir]);
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain(resolve(dir, 'cpu'));
    expect(merged.stderr).toContain('total=');
    expect(readState(holderPath)).toEqual(before);
    expect(await remoteTip(f)).toBe(tip);
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a created batch preserves PSI counters through rerun then reuse', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    const herdr: HerdrFixture = fakeHerdr(f);
    const base: string = await remoteTip(f);
    const holder: Branch = await branchAt(f, 'hold', base, 'file-hold');
    const member: Branch = await branchAt(f, 'mem-a', base, 'file-mem-a');
    const holderPath: string = leaf(f, 'hold', 'merge', {
      worktree: holder.worktree,
      merge_stamp: '2026-10-05T00:00:00.000Z',
    });
    leaf(f, 'mem-a', 'merge', {
      worktree: member.worktree,
      merge_stamp: '2026-10-05T00:00:01.000Z',
    });
    const dir: string = pressureDir(f, { cpu: '5', memory: '6', io: '7' });
    const created: Result = await spawn(f, 'create', mergePassBody, herdr.env, [dir]);
    expect(created.code).toBe(0);
    const batch: Batch = readState(holderPath).batch!;
    expect(batch.pressure_start).toEqual({ cpu: 5, memory: 6, io: 7, boot_id: 'boot-1' });
    expect(batch.members.map((entry) => entry.slug)).toEqual(['mem-a']);
    expect(
      (
        await spawn(
          f,
          'check',
          phaseBody('hold', 'merged', ['B', undefined, undefined, true, batch.attempt], dir),
          herdr.env,
        )
      ).code,
    ).toBe(0);
    await advanceRemote(f, { file: 'advanced\n' });
    pressureDir(f, { cpu: '9', memory: '16', io: '27' });
    const rerun: Result = await spawn(
      f,
      'rerun',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, batch.attempt], dir),
      herdr.env,
    );
    expect(rerun.code).toBe(0);
    const restacked: Batch = readState(holderPath).batch!;
    expect(restacked.decision).toBe('rerun');
    expect(restacked.tested_top).toBeUndefined();
    expect(restacked.pressure_start).toEqual(batch.pressure_start);
    expect(
      (
        await spawn(
          f,
          'recheck',
          phaseBody('hold', 'merged', ['B', undefined, undefined, true, batch.attempt], dir),
          herdr.env,
        )
      ).code,
    ).toBe(0);
    await advanceRemote(f, { 'issues/open/x/state.yaml': 'x\n' });
    pressureDir(f, { cpu: '15', memory: '26', io: '47' });
    const reuse: Result = await spawn(
      f,
      'reuse',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, batch.attempt], dir),
      herdr.env,
    );
    expect(reuse.code).toBe(0);
    const reused: Batch = readState(holderPath).batch!;
    expect(reused.decision).toBe('reuse');
    expect(reused.pressure_start).toEqual(batch.pressure_start);
    expect(attemptLines(f)).toEqual([]);
    const landed: Result = await spawn(
      f,
      'land',
      phaseBody('hold', 'merged', ['B', undefined, undefined, undefined, batch.attempt], dir),
      herdr.env,
    );
    expect(landed.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('reuse');
    expect(lines[0].pressure).toEqual({ cpu: 10, memory: 20, io: 40 });
  } finally {
    f.clean();
  }
});

test.serial('a merge turn records declared tools on the batch and the attempt line', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const bin: string = resolve(f.home, 'bin');
    writeFileSync(resolve(bin, 'tool-a'), '#!/bin/sh\necho tool-a 1.2.3\n');
    chmodSync(resolve(bin, 'tool-a'), 0o755);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      tools: ['tool-a'],
    });
    const holderPath: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).toBe(0);
    const tools: Tool[] = [{ name: 'tool-a', path: resolve(bin, 'tool-a'), version: 'tool-a 1.2.3' }];
    const attempt: string = z.string().parse(readState(holderPath).batch?.attempt);
    expect(readState(holderPath).batch?.tools).toEqual(tools);
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', attempt],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].tools).toEqual(tools);
  } finally {
    f.clean();
  }
});

test.serial('a declared tool absent from PATH fails the dispatch before any batch record', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      grounding: 'none',
      tools: ['ghost-tool'],
    });
    const holderPath: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const next: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(next.code).not.toBe(0);
    expect(next.stderr).toContain('which');
    expect(next.stderr).toContain('ghost-tool');
    expect(readState(holderPath).batch).toBeUndefined();
    expect(attemptLines(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test.serial('a stored tools list lands on the solo red line', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await soloFixture(f);
    const tools: Tool[] = [{ name: 'tool-a', path: '/bin/tool-a', version: 'tool-a 1.2.3' }];
    saveBatch(holder.path, { ...record, tools });
    const red: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(red.code).toBe(0);
    const lines: Attempt[] = attemptLines(f);
    expect(lines).toHaveLength(1);
    expect(lines[0].outcome).toBe('red');
    expect(lines[0].tools).toEqual(tools);
  } finally {
    f.clean();
  }
});

test.serial('a merge turn records the FFmpeg version using its real version option', async () => {
  const f: Fixture = await fixture();
  try {
    const herdr: HerdrFixture = fakeHerdr(f);
    const tool: string = resolve(f.home, 'bin/ffmpeg');
    writeFileSync(tool, '#!/bin/sh\nif [ "$1" != "-version" ]; then echo "Unrecognized option" >&2; exit 8; fi\necho "ffmpeg version n9.0.2"\n');
    chmodSync(tool, 0o755);
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', tools: ['ffmpeg'] });
    const holder: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    const result: Result = await cli(f, ['next'], f.root, herdr.env);
    expect(result.code).toBe(0);
    expect(readState(holder).batch?.tools).toEqual([{ name: 'ffmpeg', path: tool, version: 'ffmpeg version n9.0.2' }]);
  } finally {
    f.clean();
  }
});

test.serial('a failed or empty version probe fails dispatch with command context', async () => {
  for (const script of ['echo probe-failed >&2; exit 9', 'exit 0']) {
    const f: Fixture = await fixture();
    try {
      const herdr: HerdrFixture = fakeHerdr(f);
      const tool: string = resolve(f.home, 'bin/tool-a');
      writeFileSync(tool, `#!/bin/sh\n${script}\n`);
      chmodSync(tool, 0o755);
      yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', tools: ['tool-a'] });
      const holder: string = leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
      const result: Result = await cli(f, ['next'], f.root, herdr.env);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(tool);
      expect(result.stderr).toContain('--version');
      if (script.includes('probe-failed')) expect(result.stderr).toContain('probe-failed');
      expect(readState(holder).batch).toBeUndefined();
    } finally {
      f.clean();
    }
  }
});
