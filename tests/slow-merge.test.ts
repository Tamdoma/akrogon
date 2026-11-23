import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  cli,
  fakeAkrogon,
  procFixture,
  fixture,
  leaf,
  seedRun,
  storeDir,
  yaml,
  WAIT_MS,
  type Fixture,
} from './helpers';
import { command, quote, type Result } from '../src/shell';
import { readRepo } from '../src/config';
import { recordLock, requireGreenReceipt, verifyRunSchema, type VerifyRun } from '../src/verify';
import { withLock } from '../src/state';
import {
  blockNotices,
  hcCore,
  noticeFiles,
  noticeFolder,
  type HcCore,
  type NoticeFile,
  stopCoresAfterFile,
} from './hc-fixture';
import { noticeId } from '../src/notice';

stopCoresAfterFile();

const LEDGER: string = 'issues/verify-runs.jsonl';
// A pass started by heldCli waits in setup while the hold file sits in the repo's git dir, which
// every verify checkout shares; backdate removes it once the pass's receipt is rewritten.
const SETUP: string =
  'while test -f "$(git rev-parse --git-common-dir)/slow-hold"; do sleep 0.02; done; mkdir -p node_modules';

function holdFile(f: Fixture): string {
  return resolve(f.root, '.git', 'slow-hold');
}

function heldCli(f: Fixture, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<Result> {
  writeFileSync(holdFile(f), '');
  return cli(f, args, cwd, env);
}

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
// row carrying the `slow` record its opener would have written. `end` ages the
// opener's end, needed for the 14-day accepted rule.
function seedEpisode(f: Fixture, pre: number = 4, opts: { end?: string } = {}): string {
  for (let i = 0; i < pre; i++) seedMerge(f, 300000);
  const first: string = randomUUID();
  const end: string = opts.end ?? new Date().toISOString();
  seedMerge(f, 600000, {
    run: first,
    leaf: 'firstleaf',
    start: new Date(Date.parse(end) - 600000).toISOString(),
    end,
    slow: { ms: 600000, normal_ms: 300000, first: { run: first, leaf: 'firstleaf' }, notice: 'shown' },
  });
  return first;
}

// An eligible row inside `episode`, carrying the slow record it would have written.
function seedInEpisode(f: Fixture, episode: string, ms: number): void {
  seedMerge(f, ms, {
    slow: { ms, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
  });
}

const DAYS: number = 24 * 60 * 60 * 1000;

// The raw ledger `slow` object: reads keys the base schema does not yet carry.
function rawSlow(f: Fixture, run: string): { accepted_notice?: string } | undefined {
  const rows: { run: string; slow?: { accepted_notice?: string } }[] = readFileSync(resolve(f.root, LEDGER), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as { run: string; slow?: { accepted_notice?: string } });
  return rows.find((row) => row.run === run)?.slow;
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
// time of about `ms` without waiting. The rewrite holds the pass's own ledger
// lock, then releases the pass held by heldCli. Returns the appended run's id.
async function backdate(f: Fixture, ms: number, sha?: string): Promise<string> {
  const file: string = resolve(f.root, LEDGER);
  const lock: string = await recordLock(readRepo(f.repo, f.root));
  const deadline: number = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const run: string | undefined = await withLock(lock, async () => {
      const lines: string[] = existsSync(file)
        ? readFileSync(file, 'utf8')
            .split('\n')
            .filter((line) => line.trim() !== '')
        : [];
      const index: number = lines.findIndex((line) => {
        const row: { scope: string; end?: string; sha: string } = JSON.parse(line);
        return row.scope === 'merge' && row.end === undefined && (sha === undefined || row.sha === sha);
      });
      if (index === -1) return undefined;
      const row = JSON.parse(lines[index]) as { run: string; start: string };
      if (Date.parse(row.start) > Date.now() - ms) row.start = new Date(Date.now() - ms).toISOString();
      lines[index] = JSON.stringify(row);
      writeFileSync(file, lines.join('\n') + '\n');
      return row.run;
    });
    if (run !== undefined) {
      rmSync(holdFile(f), { force: true });
      return run;
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
      setup: SETUP,
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
    const pendingB: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
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
});

test('only eligible rows enter the normal and checked bounds follow the design', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
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
      const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
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
      setup: SETUP,
      checks: { unit: 'sh check.sh' },
      grounding: 'none',
    });
    // The known-red head must hold check.sh: verify the pushed main tip.
    await command(['git', 'checkout', '-b', 'kr', 'origin/main'], direct);
    const pendingKr: Promise<Result> = heldCli(f, ['verify', '--holder', holder, '--known-red'], direct, env);
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
});

test('an open episode pins the normal, cites its first run, notifies once and recovers', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
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
      const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
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

    // A fresh eligible run under the threshold closes the episode recovered
    // once the episode's own eligible median sits under the pinned normal.
    for (let i = 0; i < 3; i++) seedInEpisode(f, episode, 3000);
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
});

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
  const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
  const id: string = await backdate(f, 600000);
  expect((await pending).code).toBe(0);
  return records(f).find((run) => run.run === id)!;
}

test('a failed slow notice is retried by the next in-episode run; a pending one covers, waiting or shown', async () => {
  const config = { setup: SETUP, checks: { unit: 'echo unit' }, grounding: 'none' };
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
});

test('the last 20 eligible runs inside the episode close it accepted', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    seedMerge(f, 300000);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 19; i++)
      seedMerge(f, 500000, {
        slow: { ms: 500000, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
      });
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, coreEnv(f, core));
    const id: string = await backdate(f, 600000);
    const result: Result = await pending;
    expect(result.code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'accepted' });
    expect(result.stdout).toMatch(/verify slow: \d+m measured vs 5m normal/);
    expect(result.stdout).toContain('accepted as new normal');
    const files: NoticeFile[] = noticeFiles(core);
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain(`${f.repo}.merge-slow-accepted.${episode}`);
    expect(files[0]).toMatchObject({ title: `${f.repo} merge slow accepted`, attention: false });
  } finally {
    await core.stop();
    f.clean();
  }
});

test('the twentieth eligible episode run closes accepted', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 5, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i: number = 0; i < 18; i++)
      seedMerge(f, 500000, {
        slow: { ms: 500000, normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } },
      });
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, mergeEnv(f));
    const id: string = await backdate(f, 600000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'accepted' });
  } finally {
    f.clean();
  }
});

test('an unflagged run whose full check was blocked still closes the episode accepted', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit', extra: 'exit 4' },
      full: ['unit'],
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 5, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
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
});

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
});

test('the carried normal opens an episode where the rolling median stays silent', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    for (let i = 0; i < 20; i++) seedMerge(f, 300000, { slow: { ms: 300000, normal_ms: 300000 } });
    // Each step is under 1.5x the rolling median at its point, so today's
    // code never flags; the rolling median lands on 449000.
    for (let i = 0; i < 11; i++) seedMerge(f, 449000, { slow: { ms: 449000, normal_ms: 300000 } });
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 600000);
    const result: Result = await pending;
    expect(result.code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    // 600000 is over 1.5x and 2 minutes past the carried 300000, but under
    // 1.5x the rolling median of 449000.
    expect(row.slow).toMatchObject({ normal_ms: 300000, first: { run: id, leaf: 'checkout' } });
    expect(row.slow!.ms).toBeGreaterThanOrEqual(600000);
    expect(result.stdout).toContain('verify slow:');
    for (const earlier of records(f)) if (earlier.run !== id) expect(earlier.slow?.first).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('the carried normal ratchets down to a lower rolling median', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    for (let i = 0; i < 20; i++) seedMerge(f, 300000, { slow: { ms: 300000, normal_ms: 300000 } });
    for (let i = 0; i < 11; i++) seedMerge(f, 200000, { slow: { ms: 200000, normal_ms: 300000 } });
    // Rolling median is 200000, below the carried 300000: the next run's
    // normal is 200000.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 10000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ normal_ms: 200000 });
    expect(row.slow!.first).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('an episode does not recover while its own eligible median is over', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f);
    for (let i = 0; i < 5; i++) seedInEpisode(f, episode, 500000);
    // The run under test is eligible and under the threshold, but the
    // episode's own median (7 rows: opener, 5x500000, me) is 500000, over
    // 1.5x the pinned 300000 plus 2 minutes: no close.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 3000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ normal_ms: 300000, first: { run: episode, leaf: 'firstleaf' } });
    expect(row.slow!.close).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('an episode recovers once its own eligible median is back under', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    for (let i = 0; i < 6; i++) seedMerge(f, 900000);
    const episode: string = seedEpisode(f, 0);
    seedInEpisode(f, episode, 600000);
    seedInEpisode(f, episode, 600000);
    seedInEpisode(f, episode, 3000);
    seedInEpisode(f, episode, 3000);
    // The episode's own window is opener + 4 stamped + me = 6 rows with
    // median 450000, not over 1.5x300000: recovered. The pre-episode 900000
    // rows never enter that median, and me tips the median under.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 3000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode }, close: 'recovered' });
  } finally {
    f.clean();
  }
});

test('an episode with under five eligible runs does not recover', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f);
    seedInEpisode(f, episode, 300000);
    seedInEpisode(f, episode, 300000);
    // In-episode eligible rows: opener + two stamped + me = four, one short of
    // the recovery gate, even though their median 300000 is under the threshold.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 300000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode } });
    expect(row.slow!.close).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('an episode median counts only its own last 20 eligible runs', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f);
    for (let i = 0; i < 21; i++) seedInEpisode(f, episode, 300000);
    for (let i = 0; i < 20; i++) seedInEpisode(f, episode, 950000);
    // The last 20 in-episode eligible rows are all 950000ms: a flagged median,
    // so the episode stays open. An all-episode median would see the early fast
    // rows and read 300000 — under the threshold — and wrongly recover. me is
    // unflagged and the episode is nowhere near 14 days old.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 300000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode } });
    expect(row.slow!.close).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('an episode under 14 days old does not close accepted', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 13 * DAYS).toISOString() });
    for (let i = 0; i < 19; i++) seedInEpisode(f, episode, 500000);
    // 21 episode-eligible runs, the last-20 window all inside, but the
    // opener ended 13 days ago: no accepted close.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 500000);
    const result: Result = await pending;
    expect(result.code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode, leaf: 'firstleaf' } });
    expect(row.slow!.close).toBeUndefined();
    expect(noticeFiles(core)).toEqual([]);
  } finally {
    await core.stop();
    f.clean();
  }
});

test('an accepted close sends its notice and the next run takes the window median', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 18; i++) seedInEpisode(f, episode, 500000);
    // me is the 20th eligible episode run, all inside, opener 15 days old.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 500000);
    const result: Result = await pending;
    expect(result.code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    // The closing row keeps the old normal; the accepted notice is recorded
    // on it under its own id and sent once.
    expect(row.slow).toMatchObject({
      normal_ms: 300000,
      first: { run: episode, leaf: 'firstleaf' },
      close: 'accepted',
    });
    expect(rawSlow(f, id)?.accepted_notice).toBe('pending');
    expect(result.stdout).toContain('accepted as new normal');
    const files: NoticeFile[] = noticeFiles(core);
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain(`${f.repo}.merge-slow-accepted.${episode}`);
    expect(files[0]).toMatchObject({ title: `${f.repo} merge slow accepted`, attention: false });
    expect(files[0].body).toContain('5m');
    expect(files[0].body).toContain('8m');
    expect(files[0].body).toContain(`first seen at firstleaf ${episode}`);
    // The run after the close takes the closing window's median, 500000.
    await bump(direct, 'after.ts');
    const after: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const afterId: string = await backdate(f, 300000);
    expect((await after).code).toBe(0);
    const next: VerifyRun = records(f).find((run) => run.run === afterId)!;
    expect(next.slow).toMatchObject({ normal_ms: 500000 });
    expect(next.slow!.first).toBeUndefined();
  } finally {
    await core.stop();
    f.clean();
  }
});

test('a failed accepted notice is retried by the next checked run', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 18; i++) seedInEpisode(f, episode, 500000);
    const unblock: () => void = blockNotices(core);
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 500000);
    expect((await pending).code).toBe(0);
    const closing = (): VerifyRun => records(f).find((run) => run.run === id)!;
    expect(closing().slow).toMatchObject({ close: 'accepted' });
    expect(rawSlow(f, id)?.accepted_notice).toBe('error');
    unblock();
    // The next checked run retries the send on the closing row in place.
    await bump(direct, 'retry.ts');
    const retry: Result = await cli(f, ['verify', '--holder', holder], direct, env);
    expect(retry.code).toBe(0);
    expect(rawSlow(f, id)?.accepted_notice).toBe('pending');
    const files: NoticeFile[] = noticeFiles(core);
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain(`${f.repo}.merge-slow-accepted.${episode}`);
    // The pending file still covers: the run after sends nothing more.
    await bump(direct, 'later.ts');
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    expect(rawSlow(f, id)?.accepted_notice).toBe('pending');
    expect(noticeFiles(core)).toHaveLength(1);
    // The in-place retry never reopens the episode in status.
    const status: Result = await cli(f, ['status'], f.home, env);
    expect(status.stdout).not.toContain('Slow merge:');
  } finally {
    await core.stop();
    f.clean();
  }
});

test('an intervening leaf verify does not cause a delivered accepted notice to be resent', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 18; i++) seedInEpisode(f, episode, 500000);
    const closing: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const closingId: string = await backdate(f, 500000);
    expect((await closing).code).toBe(0);
    expect(records(f).find((run) => run.run === closingId)?.slow?.accepted_notice).toBe('pending');
    const files: NoticeFile[] = noticeFiles(core);
    expect(files).toHaveLength(1);
    rmSync(files[0].path);

    const worktree: string = resolve(storeDir(f), 'unrelated-leaf');
    await command(['git', 'worktree', 'add', worktree, '-b', 'unrelated-leaf'], f.root);
    leaf(f, 'unrelated-leaf', 'implement', { worktree });
    const sha: string = await bump(worktree, 'leaf.ts');
    expect((await cli(f, ['verify'], worktree, env)).code).toBe(0);
    expect(records(f).find((run) => run.sha === sha)?.scope).toBe('leaf');

    await bump(direct, 'next.ts');
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    expect(noticeFiles(core)).toHaveLength(0);
    expect(records(f).find((run) => run.run === closingId)?.slow?.accepted_notice).toBe('shown');
  } finally {
    await core.stop();
    f.clean();
  }
});

test('an overlapping merge verify uses the median from the accepted close', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  const releaseClose: string = resolve(f.home, 'release-close');
  const releaseLate: string = resolve(f.home, 'release-late');
  const pending: Promise<Result>[] = [];
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: {
        unit: `gate=${quote(releaseClose)}; if test -f overlap-late.ts; then gate=${quote(releaseLate)}; fi; while ! test -f "$gate"; do sleep 0.02; done`,
      },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    const { direct, holder } = await mergeCaller(f);
    const lateTree: string = resolve(storeDir(f), 'overlap-late');
    await command(['git', 'worktree', 'add', lateTree, '-b', 'overlap-late'], f.root);
    const lateSha: string = await bump(lateTree, 'overlap-late.ts');
    const closeSha: string = await bump(direct, 'overlap-close.ts');
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 10; i++) seedInEpisode(f, episode, 600000);
    for (let i = 0; i < 8; i++) seedInEpisode(f, episode, 850000);

    const late: Promise<Result> = cli(f, ['verify', '--holder', holder], lateTree, env);
    pending.push(late);
    const lateId: string = await backdate(f, 850000, lateSha);
    const closing: Promise<Result> = cli(f, ['verify', '--holder', holder], direct, env);
    pending.push(closing);
    const closingId: string = await backdate(f, 850000, closeSha);
    writeFileSync(releaseClose, '');
    expect((await closing).code).toBe(0);
    expect(noticeFiles(core)[0].body).toContain('10m');
    writeFileSync(releaseLate, '');
    expect((await late).code).toBe(0);

    const nextSha: string = await bump(direct, 'overlap-next.ts');
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    const runs: VerifyRun[] = records(f);
    expect(runs.find((run) => run.sha === nextSha)?.slow?.normal_ms).toBe(600000);
    expect(runs.find((run) => run.run === lateId)?.slow?.normal_ms).toBe(600000);
    expect(runs.filter((run) => run.slow?.close === 'accepted').map((run) => run.run)).toEqual([closingId]);
  } finally {
    writeFileSync(releaseClose, '');
    writeFileSync(releaseLate, '');
    await Promise.allSettled(pending);
    await core.stop();
    f.clean();
  }
});

test('an aged episode does not close accepted while a pre-episode run sits in the last 20', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    seedMerge(f, 300000);
    const episode: string = seedEpisode(f, 0, { end: new Date(Date.now() - 15 * DAYS).toISOString() });
    for (let i = 0; i < 17; i++) seedInEpisode(f, episode, 500000);
    // 20 eligible runs total: me makes the window full, but the window holds
    // the one pre-episode row and the episode counts only 19: no accepted.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 500000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ first: { run: episode, leaf: 'firstleaf' } });
    expect(row.slow!.close).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('a ledger with no stored normal starts as today', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    // Old-shape eligible rows carry no slow record at all; every row still
    // parses through the ledger schema in records().
    for (let i = 0; i < 4; i++) seedMerge(f, 300000);
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    expect(records(f).at(-1)!.slow).toBeUndefined();
    await bump(direct, 'fifth.ts');
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 300000);
    expect((await pending).code).toBe(0);
    expect(records(f).find((run) => run.run === id)!.slow).toMatchObject({ normal_ms: 300000 });
  } finally {
    f.clean();
  }
});

test('a stored normal applies before five eligible rows', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const env: NodeJS.ProcessEnv = mergeEnv(f);
    const { direct, holder } = await mergeCaller(f);
    for (let i = 0; i < 3; i++) seedMerge(f, 300000, { slow: { ms: 300000, normal_ms: 250000 } });
    // Fewer than 5 eligible rows, but the ledger stores normal_ms 250000:
    // the run flags against the carried value, not a rolling median.
    const pending: Promise<Result> = heldCli(f, ['verify', '--holder', holder], direct, env);
    const id: string = await backdate(f, 500000);
    expect((await pending).code).toBe(0);
    const row: VerifyRun = records(f).find((run) => run.run === id)!;
    expect(row.slow).toMatchObject({ normal_ms: 250000, first: { run: id, leaf: 'checkout' } });
    expect(row.slow!.ms).toBeGreaterThanOrEqual(500000);
  } finally {
    f.clean();
  }
});

test('a row whose command was rerun stays out of the normal', async () => {
  const f: Fixture = await fixture();
  const core: HcCore = await hcCore(f);
  try {
    const env: NodeJS.ProcessEnv = coreEnv(f, core);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: SETUP,
      checks: { unit: 'echo unit' },
      grounding: 'none',
    });
    const { direct, holder } = await mergeCaller(f);
    for (const ms of [240000, 300000, 360000, 420000]) seedMerge(f, ms);
    const log: string = resolve(f.home, 'seeded.log');
    writeFileSync(log, 'x\n');
    seedMerge(f, 5500, {
      commands: [{ name: 'unit', command: 'echo unit', exit: 0, log, rerun: { exit: 1, log, failures: ['alpha'] } }],
    });
    expect((await cli(f, ['verify', '--holder', holder], direct, env)).code).toBe(0);
    expect(records(f).at(-1)!.slow).toBeUndefined();
  } finally {
    await core.stop();
    f.clean();
  }
});
