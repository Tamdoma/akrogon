import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { cli, fakeAkrogon, procFixture, fixture, seedRun, storeDir, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { readRepo } from '../src/config';
import { requireGreenReceipt, verifyRunSchema, type VerifyRun } from '../src/verify';
import { blockNotices, hcCore, noticeFiles, noticeFolder, type HcCore } from './hc-fixture';
import { noticeId } from '../src/notice';

const LEDGER: string = 'issues/verify-runs.jsonl';

function records(f: Fixture): VerifyRun[] {
  const file: string = resolve(f.root, LEDGER);
  if (!existsSync(file)) return [];
  const text: string = readFileSync(file, 'utf8').trim();
  return text === '' ? [] : text.split('\n').map((line) => verifyRunSchema.parse(JSON.parse(line)));
}

const envs: WeakMap<Fixture, NodeJS.ProcessEnv> = new WeakMap();
function mergeEnv(f: Fixture): NodeJS.ProcessEnv {
  let env: NodeJS.ProcessEnv | undefined = envs.get(f);
  if (env === undefined) {
    env = { ...procFixture(f).env, ...fakeAkrogon(f).env };
    envs.set(f, env);
  }
  return env;
}

function register(f: Fixture, repos: Record<string, string>): void {
  const global: object = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, repos });
}

// A completed eligible merge-scope ledger row with a fixed wall time in ms.
function seedMerge(f: Fixture, ms: number, extra: object = {}): VerifyRun {
  const end: string = new Date().toISOString();
  return seedRun(f, {
    leaf: 'seeded',
    scope: 'merge',
    setup: 0,
    commands: [{ name: 'unit', command: 'echo unit', exit: 0, log: resolve(f.home, 'seeded.log') }],
    start: new Date(Date.parse(end) - ms).toISOString(),
    end,
    ...extra,
  });
}

// An open episode: pre-episode eligible rows plus the episode's first flagged
// row carrying the `slow` record its opener would have written.
function seedEpisode(f: Fixture, pre: number = 4): string {
  for (let i = 0; i < pre; i++) seedMerge(f, 300000);
  const first: string = randomUUID();
  seedMerge(f, 600000, {
    run: first,
    leaf: 'firstleaf',
    slow: { ms: 600000, normal_ms: 300000, first: { run: first, leaf: 'firstleaf' }, notice: 'shown' },
  });
  return first;
}

async function mergeCaller(f: Fixture): Promise<{ direct: string; holder: string }> {
  const direct: string = resolve(storeDir(f), 'direct');
  await command(['git', 'worktree', 'add', direct, '-b', 'direct'], f.root);
  // Inside issues/chart so command logs resolve through evidence locate.
  const holder: string = resolve(f.root, 'issues/chart/slow/direct');
  mkdirSync(holder, { recursive: true });
  return { direct, holder };
}

async function bump(direct: string, file: string): Promise<string> {
  writeFileSync(resolve(direct, file), `${file}\n`);
  await command(['git', 'add', file], direct);
  await command(['git', 'commit', '-m', `add ${file}`], direct);
  return command(['git', 'rev-parse', 'HEAD'], direct);
}

// The pass appends its receipt before checkout and rewrites it at the end,
// keeping `start`: backdating that start mid-pass gives the run a real wall
// time of about `ms` without waiting. Returns the appended run's id.
async function backdate(f: Fixture, ms: number): Promise<string> {
  const file: string = resolve(f.root, LEDGER);
  const deadline: number = Date.now() + 15000;
  while (Date.now() < deadline) {
    const lines: string[] = existsSync(file)
      ? readFileSync(file, 'utf8')
          .split('\n')
          .filter((line) => line.trim() !== '')
      : [];
    const index: number = lines.findIndex((line) => {
      const row = JSON.parse(line) as { scope?: string; end?: string };
      return row.scope === 'merge' && row.end === undefined;
    });
    if (index !== -1) {
      const row = JSON.parse(lines[index]) as { run: string; start: string };
      if (Date.parse(row.start) > Date.now() - ms) row.start = new Date(Date.now() - ms).toISOString();
      lines[index] = JSON.stringify(row);
      writeFileSync(file, lines.join('\n') + '\n');
      return row.run;
    }
    await Bun.sleep(10);
  }
  throw new Error('no open merge run to backdate');
}

// Merge-slow notices are files in the repo session's herdr-app home: these cases run a fixture core.
function coreEnv(f: Fixture, core: HcCore): NodeJS.ProcessEnv {
  return { ...core.env, ...fakeAkrogon(f).env, PATH: `${resolve(f.home, 'bin')}:${core.env.PATH}` };
}

test('a slow merge run is flagged, recorded, printed and notified once', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    for (let i = 0; i < 4; i++) seedMerge(f, 300000);
    // Run A is the fifth eligible row: it sees only 4 eligible earlier rows
    // and is never compared, so it carries no `slow` record at all.
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    const a: VerifyRun = records(f).at(-1)!;
    expect(a.slow).toBeUndefined();
    expect(noticeFiles(core)).toEqual([]);

    await bump(direct, 'code.ts');
    const pendingB: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, env);
    const bId: string = await backdate(f, 600000);
    const resultB: Result = await pendingB;
    expect(resultB.code).toBe(0);
    const b: VerifyRun = records(f).find((run) => run.run === bId)!;
    expect(b.slow!.ms).toBeGreaterThanOrEqual(600000);
    expect(b.slow).toMatchObject({ normal_ms: 300000, first: { run: bId, leaf: 'checkout' } });
    expect(b.slow!.close).toBeUndefined();
    expect(resultB.stdout).toMatch(`verify slow: `);
    expect(resultB.stdout).toMatch(/verify slow: \d+m measured vs 5m normal/);
    expect(resultB.stdout).toContain(`first seen at checkout ${bId}`);
    const files = noticeFiles(core);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ title: `${f.repo} merge slow`, attention: false });
    expect(files[0].body).toContain(`first seen at checkout ${bId}`);
    expect(records(f).find((run) => run.run === bId)!.slow!.notice).toBe('pending');
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], direct);
    await requireGreenReceipt(readRepo(f.repo, f.root), sha, 'merge');
  } finally {
    await core.stop();
    f.clean();
  }
}, 30000);

test('only eligible rows enter the normal and checked bounds follow the design', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    for (const ms of [240000, 300000, 360000, 420000]) seedMerge(f, ms);
    const log: string = resolve(f.home, 'seeded.log');
    writeFileSync(log, 'x\n');
    seedMerge(f, 5500, {
      commands: [{ name: 'unit', command: 'echo unit', exit: 0, log, reused: 'source-run' }],
    });
    seedMerge(f, 5500, {
      commands: [{ name: 'unit', command: 'echo unit', exit: 5, log, blocked: 'unit' }],
    });
    seedMerge(f, 5500, { setup: 9 });
    seedMerge(f, 5500, { scope: 'leaf' });
    seedMerge(f, 5500, { compares: 'some-head' });

    // Only 4 eligible earlier rows: silent.
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    expect(records(f).at(-1)!.slow).toBeUndefined();

    // Run 2 sees 5 eligible rows: the ineligible kinds at 5500ms never count.
    await bump(direct, 'second.ts');
    const secondId: string = await (async () => {
      const pending: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, env);
      const id: string = await backdate(f, 1000);
      const result: Result = await pending;
      expect(result.code).toBe(0);
      return id;
    })();
    const second: VerifyRun = records(f).find((run) => run.run === secondId)!;
    expect(second.slow).toMatchObject({ normal_ms: 300000 });
    expect(second.slow!.first).toBeUndefined();

    // A compares run is never checked: the seeded one stays clean, and a real
    // known-red base run gets no `slow` even though its red head run is flagged.
    writeFileSync(resolve(f.root, 'check.sh'), 'echo "(fail) alpha"; exit 7\n');
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'add failing check'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'sh check.sh' },
      grounding: 'none',
    });
    // The known-red head must hold check.sh: verify the pushed main tip.
    await command(['git', 'checkout', '-b', 'kr', 'origin/main'], direct);
    const pendingKr: Promise<Result> = cli(f, ['verify', '--holder', holder, '--known-red'], direct, env);
    const headId: string = await backdate(f, 600000);
    const knownRed: Result = await pendingKr;
    expect(knownRed.code).toBe(0);
    const all: VerifyRun[] = records(f);
    const head: VerifyRun = all.find((run) => run.run === headId)!;
    const base: VerifyRun | undefined = all.find((run) => run.compares === headId);
    expect(head.slow).toMatchObject({ first: { run: headId, leaf: 'checkout' } });
    expect(base).toBeDefined();
    expect(base!.slow).toBeUndefined();
    expect(all.find((run) => run.compares === 'some-head')!.slow).toBeUndefined();
    expect(knownRed.stdout).toContain('verify slow:');
    expect(noticeFiles(core).some((notice) => notice.title === `${f.repo} merge slow`)).toBe(true);
  } finally {
    await core.stop();
    f.clean();
  }
}, 60000);

test('an open episode pins the normal, cites its first run, notifies once and recovers', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit', extra: 'echo extra' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f);
    // The rolling normal is now ~3s while the episode's is 5m.
    for (let i = 0; i < 10; i++) seedMerge(f, 3000);
    // A same-tree row carrying a `reused` entry stays excluded from the
    // normal and sources nothing: the live run executes `unit` fresh and
    // writes no `reused` entry.
    const sha: string = await bump(direct, 'reuse.ts');
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], direct);
    seedMerge(f, 2000, {
      sha,
      tree,
      commands: [
        { name: 'unit', command: 'echo unit', exit: 0, log: resolve(f.home, 'seeded.log'), reused: 'source-run' },
      ],
    });

    const aId: string = await (async () => {
      const pending: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, env);
      const id: string = await backdate(f, 600000);
      const result: Result = await pending;
      expect(result.code).toBe(0);
      return id;
    })();
    const a: VerifyRun = records(f).find((run) => run.run === aId)!;
    const unitEntry = a.commands.find((item) => item.name === 'unit')!;
    expect(unitEntry.reused).toBeUndefined();
    expect(unitEntry.exit).toBe(0);
    for (const item of a.commands) expect(item.reused).toBeUndefined();
    expect(a.slow).toMatchObject({
      normal_ms: 300000,
      first: { run: episode, leaf: 'firstleaf' },
    });
    expect(a.slow!.close).toBeUndefined();
    expect(noticeFiles(core)).toEqual([]);

    // A fresh eligible run under the threshold closes the episode recovered.
    await bump(direct, 'recover.ts');
    const recovered: Result = await cli(f, ['verify', '--holder', holder], direct, env);
    expect(recovered.code).toBe(0);
    const b: VerifyRun = records(f).at(-1)!;
    expect(b.slow).toMatchObject({ first: { run: episode }, close: 'recovered' });
    expect(noticeFiles(core)).toEqual([]);

    // The next run is evaluated fresh: no episode fields.
    await bump(direct, 'fresh.ts');
    const fresh: Result = await cli(f, ['verify', '--holder', holder], direct, env);
    expect(fresh.code).toBe(0);
    const c: VerifyRun = records(f).at(-1)!;
    expect(c.slow).toBeDefined();
    expect(c.slow!.first).toBeUndefined();
    expect(c.slow!.close).toBeUndefined();
  } finally {
    await core.stop();
    f.clean();
  }
}, 60000);

// Rewrites the episode opener's (last ledger row's) slow notice value.
function setEpisodeNotice(f: Fixture, notice: string): void {
  const file: string = resolve(f.root, LEDGER);
  const lines: string[] = readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '');
  const last = JSON.parse(lines[lines.length - 1]);
  last.slow = { ...last.slow, notice };
  lines[lines.length - 1] = JSON.stringify(last);
  writeFileSync(file, lines.join('\n') + '\n');
}

async function slowRun(f: Fixture, direct: string, holder: string, env: NodeJS.ProcessEnv): Promise<VerifyRun> {
  const pending: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, env);
  const id: string = await backdate(f, 600000);
  expect((await pending).code).toBe(0);
  return records(f).find((run) => run.run === id)!;
}

test('a failed slow notice is retried by the next in-episode run; a pending one covers, waiting or shown', async () => {
  const config = { setup: 'mkdir -p node_modules', checks: { unit: 'echo unit' }, grounding: 'none' };
  {
    const f: Fixture = await fixture();
    const core: HcCore = await hcCore(f);
    try {
      yaml(resolve(f.root, 'issues/config.yaml'), config);
      const env: NodeJS.ProcessEnv = coreEnv(f, core);
      const { direct, holder } = await mergeCaller(f);
      const episode: string = seedEpisode(f);
      setEpisodeNotice(f, 'error');
      const unblock: () => void = blockNotices(core);
      const a: VerifyRun = await slowRun(f, direct, holder, env);
      expect(a.slow).toMatchObject({ first: { run: episode }, notice: 'error' });
      unblock();
      await bump(direct, 'retry.ts');
      const b: VerifyRun = await slowRun(f, direct, holder, env);
      expect(b.slow!.notice).toBe('pending');
      expect(noticeFiles(core).map((n) => n.title)).toEqual([`${f.repo} merge slow`]);
    } finally {
      await core.stop();
      f.clean();
    }
  }
  {
    // The opener's notice was written by a process that is gone; its file still waits for the window.
    const f: Fixture = await fixture();
    const core: HcCore = await hcCore(f);
    try {
      yaml(resolve(f.root, 'issues/config.yaml'), config);
      const env: NodeJS.ProcessEnv = coreEnv(f, core);
      const { direct, holder } = await mergeCaller(f);
      const episode: string = seedEpisode(f);
      setEpisodeNotice(f, 'pending');
      mkdirSync(noticeFolder(core), { recursive: true });
      const waiting: string = resolve(noticeFolder(core), `${noticeId(f.repo, 'merge-slow', episode)}.json`);
      writeFileSync(waiting, JSON.stringify({ title: `${f.repo} merge slow`, body: 'seeded', attention: false }));
      const a: VerifyRun = await slowRun(f, direct, holder, env);
      expect(a.slow!.notice).toBeUndefined();
      expect(noticeFiles(core).map((n) => n.body)).toEqual(['seeded']);
      // The handler shows it: the next in-episode run reads it as shown and still sends nothing.
      rmSync(waiting);
      await bump(direct, 'later.ts');
      const b: VerifyRun = await slowRun(f, direct, holder, env);
      expect(b.slow!.notice).toBeUndefined();
      expect(noticeFiles(core)).toEqual([]);
      expect(records(f).find((run) => run.run === episode)!.slow!.notice).toBe('shown');
    } finally {
      await core.stop();
      f.clean();
    }
  }
}, 60000);

test('the last 20 eligible runs inside the episode close it accepted', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    seedMerge(f, 300000);
    const episode: string = seedEpisode(f, 0);
    for (let i = 0; i < 19; i++)
      seedMerge(f, 500000, {
        slow: { ms: 500000, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
      });
    const pending: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, coreEnv(f, core));
    const id: string = await backdate(f, 600000);
    const result: Result = await pending;
    expect(result.code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'accepted' });
    expect(result.stdout).toMatch(/verify slow: \d+m measured vs 5m normal/);
    expect(result.stdout).toContain('accepted as new normal');
    expect(noticeFiles(core)).toEqual([]);
  } finally {
    await core.stop();
    f.clean();
  }
}, 30000);

test('the twentieth eligible episode run closes accepted', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 5);
    for (let i: number = 0; i < 18; i++)
      seedMerge(f, 500000, {
        slow: { ms: 500000, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
      });
    const pending: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, mergeEnv(f));
    const id: string = await backdate(f, 600000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'accepted' });
  } finally {
    f.clean();
  }
}, 30000);

test('an unflagged run whose full check was blocked still closes the episode accepted', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit', extra: 'exit 4' },
      full: ['unit'],
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 5);
    for (let i: number = 0; i < 19; i++)
      seedMerge(f, 500000, {
        slow: { ms: 500000, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
      });
    const result: Result = await cli(f, ['verify', '--holder', holder], direct, mergeEnv(f));
    expect(result.code).toBe(1);
    const row: VerifyRun = records(f).at(-1)!;
    expect(row.commands.map((item) => item.name)).toEqual(['extra', 'unit']);
    const unit: VerifyRun['commands'][number] = row.commands.find((item) => item.name === 'unit')!;
    expect(unit).toMatchObject({ exit: 4, blocked: 'extra' });
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'accepted' });
    const line: string | undefined = result.stdout.split('\n').find((entry) => entry.startsWith('verify slow:'));
    expect(line).toContain('accepted');
  } finally {
    f.clean();
  }
}, 30000);

test('status prints Slow merge only while that repo episode is open', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    register(f, { [f.repo]: f.root, other: g.root });
    const episode: string = seedEpisode(f);
    const open: Result = await cli(f, ['status'], f.home, mergeEnv(f));
    const line: string | undefined = open.stdout.split('\n').find((entry) => entry.startsWith('Slow merge:'));
    expect(line).toBe(`Slow merge: ${f.repo} first seen at firstleaf ${episode}, last 10m vs normal 5m`);
    expect(open.stdout.split('\n').filter((entry) => entry.startsWith('Slow merge:'))).toHaveLength(1);

    seedMerge(f, 5000, {
      slow: {
        ms: 5000,
        normal_ms: 300000,
        first: { run: episode, leaf: 'firstleaf' },
        close: 'recovered',
      },
    });
    const closed: Result = await cli(f, ['status'], f.home, mergeEnv(f));
    expect(closed.stdout).not.toContain('Slow merge:');
  } finally {
    f.clean();
    g.clean();
  }
}, 30000);
