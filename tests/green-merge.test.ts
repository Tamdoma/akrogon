import { test, expect } from 'bun:test';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fakeSystemctl, fixture, leaf, seedRun, yaml, type Fixture, type SystemctlFixture } from './helpers';
import { hcFixture, type HcFixture } from './hc-fixture';
import { readState, saveState, type State } from '../src/state';
import { command, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
type GreenFixture = HcFixture & { launches: string; systemctl: SystemctlFixture };

async function greenFrom(f: HcFixture, checks: Record<string, string>): Promise<GreenFixture> {
  yaml(resolve(f.root, 'issues/config.yaml'), { checks, grounding: 'none' });
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const launches: string = resolve(f.home, 'systemd-run.log');
  // akrogon's slice stops go to the fake: a leaf slice is named by repo and slug, so a real stop
  // could end another test file's seat of the same name.
  const systemctl: SystemctlFixture = fakeSystemctl(f);
  return { ...f, env: { ...f.env, ...systemctl.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches, systemctl };
}
async function greenFixture(checks: Record<string, string>): Promise<GreenFixture> {
  return greenFrom(await hcFixture(), checks);
}
// Every task any seat received for one skill, removed terminals included (the stand-in's task logs
// outlive their terminal).
function prompts(f: GreenFixture, skill: string): string[] {
  return readdirSync(f.core.standin)
    .filter((name) => name.endsWith('.tasks'))
    .flatMap((name) => readFileSync(resolve(f.core.standin, name), 'utf8').split('\n'))
    .filter((text) => text.startsWith(skill));
}
function landLaunches(f: GreenFixture): string[] {
  return existsSync(f.launches)
    ? readFileSync(f.launches, 'utf8')
        .split('\n')
        .filter((line) => line.includes('--unit=akrogon-land-'))
    : [];
}
// Waits until every live seat of the leaf has finished its turn (or was ended), so the next pass
// can deliver.
async function idleAll(f: GreenFixture): Promise<void> {
  for (const seat of await f.core.terminals({ 'akrogon.leaf': 'aa' }, false))
    await f.core.waitFor(seat.address, (t) => t.state === 'finished' || t.status?.state === 'idle');
}
// Holds open each seat turn whose task starts with `skill` until the returned release runs.
function holdTurns(f: GreenFixture, skill: string): () => void {
  const gate: string = resolve(f.core.standin, 'gate');
  Bun.spawnSync(['mkfifo', gate]);
  writeFileSync(
    resolve(f.core.standin, 'hook'),
    `#!/bin/sh\ncase "$2" in ${skill}*) cat ${gate} >/dev/null ;; esac\n`,
    { mode: 0o755 },
  );
  return () => {
    Bun.spawnSync(['sh', '-c', `echo go > ${gate}`]);
  };
}
function attempts(f: Fixture): string[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  return existsSync(file)
    ? readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.object({ outcome: z.string() }).parse(JSON.parse(line)).outcome)
    : [];
}
function verifyRuns(
  f: Fixture,
): { run: string; sha: string; compares?: string; commands: { exit: number; failures?: string[] }[] }[] {
  const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
  return existsSync(file)
    ? readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
    : [];
}
function moved(path: string): string {
  return existsSync(resolve(path, 'state.yaml')) ? path : path.replace('issues/open', 'issues/closed');
}
async function next(f: GreenFixture): Promise<Result> {
  return cli(f, ['next'], f.root, f.env);
}
async function land(f: GreenFixture, slug: string, attempt: string): Promise<Result> {
  return cli(f, ['land', slug, '--attempt', attempt], f.root, f.env);
}
async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', '--git-dir', resolve(f.home, 'remote.git'), 'rev-parse', 'main']);
}
async function allocated(f: GreenFixture, slug: string, container: string): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis', {}, container);
  expect((await next(f)).code).toBe(0);
  return path;
}
async function commitIn(path: string, name: string, content: string, message: string = name): Promise<void> {
  const worktree: string = z.string().parse(readState(path).worktree);
  mkdirSync(resolve(worktree, name, '..'), { recursive: true });
  writeFileSync(resolve(worktree, name), content);
  await command(['git', 'add', name], worktree);
  await command(['git', 'commit', '-m', message], worktree);
}
function toMerge(path: string): void {
  saveState(path, { ...readState(path), phase: 'merge', merge_stamp: '2026-10-19T00:00:00.000Z' });
}
// Claims the holder's turn through a real `next` and returns the applied attempt.
async function claimed(f: GreenFixture, path: string): Promise<{ attempt: string; top: string }> {
  await idleAll(f);
  expect((await next(f)).code).toBe(0);
  const state: State = readState(path);
  return { attempt: z.string().parse(state.batch?.attempt), top: z.string().parse(state.batch?.top) };
}
// A clone that pushes one commit to the remote from inside a check run.
async function advancer(f: Fixture, name: string, content: string): Promise<string> {
  const clone: string = resolve(f.home, `adv-${name}`);
  await command(['git', 'clone', resolve(f.home, 'remote.git'), clone]);
  return [
    `cd ${clone}`,
    'git pull -q origin main',
    `printf '%s\\n' ${content}-$(date +%s%N) > ${name}`,
    `git add ${name}`,
    `git -c user.email=t@example.invalid -c user.name=T commit -qm adv-$(date +%s%N)`,
    'git push -q origin HEAD:main',
  ].join(' && ');
}

test('a green top lands with no seat', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    leaf(f, 'zz', 'plan.synthesis', {}, 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    expect(landLaunches(f)[0]).toContain(`--unit=akrogon-land-${attempt}`);
    expect(landLaunches(f)[0]).toContain(`land aa --attempt ${attempt}`);
    expect(landLaunches(f)[0]).not.toContain('HERDR_PANE_ID');
    expect(prompts(f, 'merge-issue')).toEqual([]);
    appendFileSync(
      resolve(f.root, 'issues/timings.jsonl'),
      JSON.stringify({
        kind: 'visit_start',
        ts: new Date().toISOString(),
        repo: f.repo,
        slug: 'aa',
        phase: 'merge',
        visit: 1,
      }) + '\n',
    );
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(top);
    expect(readState(moved(path)).phase).toBe('merged');
    expect(readState(moved(path)).broadcast).toBeUndefined();
    expect(attempts(f)).toEqual(['merged']);
    const log: string[] = readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n');
    expect(JSON.parse(log.at(-1)!)).toMatchObject({
      slug: 'aa',
      from: 'merge',
      to: 'merged',
      slot: null,
      session: null,
    });
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(prompts(f, 'broadcast-issue')).toEqual([]);
    const timing: Result = await cli(f, ['timing', 'aa'], f.root, f.env);
    expect(timing.code).toBe(0);
    expect(timing.stdout).not.toContain('incomplete prompt');
  } finally {
    await f.clean();
  }
}, 60000);

// A check whose log names the failing test, plus a completed base run holding
// that same named unit red at the leaf's merge-base, is the covered main-red
// head the land run lands without a rerun or a base run.
async function failingCheck(f: GreenFixture, name: string): Promise<void> {
  writeFileSync(resolve(f.root, 'check.sh'), `echo "(fail) ${name}"; exit 7\n`);
  yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
  await command(['git', 'add', 'check.sh', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'failing check'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
}

test('a red head covered by an unresolved red on main lands on its first run with one verify', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    await failingCheck(f, 'alpha');
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    const base: string = await command(['git', 'merge-base', top, 'origin/main'], f.root);
    const seeded = seedRun(f, {
      sha: base,
      tree: await command(['git', 'rev-parse', `${base}^{tree}`], f.root),
      scope: 'merge',
      compares: 'older-head',
      commands: [
        { name: 'test', command: 'sh check.sh', exit: 7, log: resolve(f.home, 'base-red.log'), failures: ['alpha'] },
      ],
    });
    writeFileSync(seeded.commands[0].log, '(fail) alpha\n');
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(top);
    expect(readState(moved(path)).phase).toBe('merged');
    const runs: { run: string; sha: string; compares?: string; commands: { exit: number }[] }[] = verifyRuns(f);
    expect(runs.filter((run) => run.run !== seeded.run)).toHaveLength(1);
    const head = runs.find((run) => run.run !== seeded.run)!;
    expect(head.sha).toBe(top);
    expect(head.compares).toBeUndefined();
    expect(head.commands.every((item) => item.exit !== 0)).toBe(true);
    expect(attempts(f)).toEqual(['merged']);
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(landLaunches(f)).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

// An older covered head run on the same tree covers only its own failures: a new uncovered
// failure on that tree exits to check.repair with the new run's id, and no cover or previous
// run grants it a base pass.
test('an older covered run does not hide a new failure on the same tree', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const marker: string = resolve(f.home, 'fail-beta');
    const runner: string = `${JSON.stringify(process.execPath)} test regression.test.ts`;
    writeFileSync(
      resolve(f.root, 'regression.test.ts'),
      `import { test, expect } from 'bun:test';
import { existsSync } from 'node:fs';
test('alpha', () => expect(false).toBe(true));
test('beta', () => expect(existsSync(${JSON.stringify(marker)})).toBe(false));
`,
    );
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: runner },
      grounding: 'none',
    });
    await command(['git', 'add', 'regression.test.ts', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'failing test'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const before: string = await remoteTip(f);
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    const holderHead: string = z.string().parse(readState(path).batch?.holder.head);
    const base: string = await command(['git', 'merge-base', top, 'origin/main'], f.root);
    // The older completed head run on the returning leaf's branch head: red on alpha only.
    const previous = seedRun(f, {
      sha: holderHead,
      tree: await command(['git', 'rev-parse', `${holderHead}^{tree}`], f.root),
      scope: 'merge',
      commands: [
        {
          name: 'test',
          command: runner,
          exit: 1,
          log: resolve(f.home, 'head-red.log'),
          failures: ['alpha'],
        },
      ],
    });
    writeFileSync(previous.commands[0].log, '(fail) alpha\n');
    // A completed base run at the merge-base red on alpha alone: alpha is covered.
    const baseLog: string = resolve(f.home, 'base-red.log');
    writeFileSync(baseLog, '(fail) alpha\n');
    seedRun(f, {
      sha: base,
      tree: await command(['git', 'rev-parse', `${base}^{tree}`], f.root),
      scope: 'merge',
      compares: previous.run,
      commands: [{ name: 'test', command: runner, exit: 1, log: baseLog, failures: ['alpha'] }],
    });
    // beta joins alpha on the land run's verify: the new uncovered failure.
    writeFileSync(marker, '');
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(before);
    const state: State = readState(path);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    const heads = verifyRuns(f).filter((run) => run.sha === top);
    expect(heads.map((run) => run.commands[0].failures)).toEqual([['alpha'], ['alpha', 'beta']]);
    expect(state.merge_exit).toMatchObject({ reason: 'red', run: heads[1].run, top });
    // The covered repeat earned no base pass: no compares row links the new run.
    expect(verifyRuns(f).filter((run) => run.compares === heads[1].run)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 60000);

test('a clean restack is verified and pushed again with no seat', async () => {
  const f: HcFixture = await hcFixture();
  const script: string = await advancer(f, 'adv-file', 'adv');
  const mark: string = resolve(f.home, 'advanced');
  const g: GreenFixture = await greenFrom(f, { adv: `sh -c '[ -e ${mark} ] || { touch ${mark} && ${script}; }'` });
  try {
    const path: string = await allocated(g, 'aa', 'issue-aa');
    leaf(g, 'zz', 'plan.synthesis', {}, 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(g, path);
    expect((await land(g, 'aa', attempt)).code).toBe(0);
    expect(readState(moved(path)).phase).toBe('merged');
    const tip: string = await remoteTip(g);
    const files: string = await command(['git', 'ls-tree', '--name-only', tip], g.root);
    expect(files).toContain('aa-file');
    expect(files).toContain('adv-file');
    expect(verifyRuns(g).filter((run) => run.commands.length > 0)).toHaveLength(2);
    expect(prompts(g, 'merge-issue')).toEqual([]);
    expect(attempts(g)).toEqual(['merged']);
  } finally {
    await g.clean();
  }
}, 90000);

test('a completing push hands off exactly one broadcast seat, also after a crash', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const closed: string = moved(path);
    expect(closed).toContain('issues/closed/issue-aa');
    const state: State = readState(closed);
    expect(state.phase).toBe('merged');
    expect(state.broadcast).toMatchObject({ kind: 'issue', name: 'issue-aa', pushed: top });
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    expect(prompts(f, 'broadcast-issue')[0]).toContain('owner=issue:issue-aa');
    expect(prompts(f, 'merge-issue')).toEqual([]);
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    // A crash after the owner closed and before the seat started leaves an undispatched handoff.
    saveState(closed, { ...readState(closed), prompted: {}, prompted_at: {} });
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(2);
  } finally {
    await f.clean();
  }
}, 60000);

test('a live land run is left alone and a dead one resumes', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const systemctl: SystemctlFixture = f.systemctl;
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    writeFileSync(
      systemctl.db,
      JSON.stringify({ units: [{ unit: `akrogon-land-${attempt}.service`, sub: 'running' }] }),
    );
    expect((await next(f)).code).toBe(0);
    expect(landLaunches(f)).toHaveLength(1);
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(verifyRuns(f)).toEqual([]);
    writeFileSync(systemctl.db, JSON.stringify({ units: [] }));
    expect((await next(f)).code).toBe(0);
    expect(landLaunches(f)).toHaveLength(2);
    expect(prompts(f, 'merge-issue')).toEqual([]);
  } finally {
    await f.clean();
  }
}, 60000);

test('a land run that died after its push recovers to merged once', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    leaf(f, 'zz', 'plan.synthesis', {}, 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { top } = await claimed(f, path);
    await command(['git', 'push', 'origin', `${top}:refs/heads/main`], f.root);
    const state: State = readState(path);
    saveState(path, { ...state, batch: { ...state.batch!, candidate: top, tested_top: top } });
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(readState(moved(path)).phase).toBe('merged');
    expect(attempts(f)).toEqual(['merged']);
    expect(landLaunches(f)).toHaveLength(1);
    const log: string[] = readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8').trim().split('\n');
    expect(log.filter((line) => JSON.parse(line).to === 'merged')).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

test('stop --all stops a tabless command merge', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const main: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    leaf(f, 'aa', 'merge', {
      merge_stamp: '2026-10-19T00:00:00.000Z',
      batch: {
        attempt: 'a1',
        built_on: main,
        holder: { base: main, head: main },
        applied: true,
        top: main,
      },
    });
    const slice: string = leafSlice({ name: f.repo }, 'aa');
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    const stopped: Result = await cli(f, ['stop', '--all'], f.root, {
      ...systemctl.env,
      PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.code).toBe(0);
    const calls: string[] = existsSync(systemctl.log) ? readFileSync(systemctl.log, 'utf8').trim().split('\n') : [];
    expect(calls.some((line) => line === `--user stop ${slice}`)).toBe(true);
    expect(readFileSync(resolve(f.home, 'stopped.yaml'), 'utf8')).toContain(`${f.repo}/aa`);
  } finally {
    f.clean();
  }
});

test('next keeps a working broadcast seat until it finishes', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const release: () => void = holdTurns(f, 'broadcast-issue');
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const closed: string = moved(path);
    const state: State = readState(closed);
    const seatB: string = z.string().parse(state.seat.B?.address);
    expect((await f.core.get(seatB)).status?.state).toBe('working');
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect((await f.core.get(seatB)).state).toBe('live');
    expect(existsSync(z.string().parse(state.worktree))).toBe(true);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    release();
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect((await f.core.terminals({ 'akrogon.leaf': 'aa' }, true)).map((t) => t.address)).not.toContain(seatB);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

test('next preserves a live command attempt while its refused push restacks', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const systemctl: SystemctlFixture = f.systemctl;
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
    writeFileSync(
      systemctl.db,
      JSON.stringify({ units: [{ unit: `akrogon-land-${attempt}.service`, sub: 'running' }] }),
    );
    const state: State = readState(path);
    saveState(path, {
      ...state,
      batch: {
        ...state.batch!,
        candidate: top,
        applied: false,
        tested_top: undefined,
        tested_main: undefined,
        decision: undefined,
      },
    });
    expect((await next(f)).code).toBe(0);
    expect(readState(path).batch?.attempt).toBe(attempt);
    expect(landLaunches(f)).toHaveLength(1);
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(verifyRuns(f)).toEqual([]);
  } finally {
    await f.clean();
  }
}, 60000);

test('the land service drops an inherited old herdr socket and keeps no seat identity', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const socket: string = resolve(f.home, 'sessions/infra/herdr.sock');
    f.env = { ...f.env, HERDR_SOCKET_PATH: socket };
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    expect(landLaunches(f)[0]).not.toContain('HERDR_SOCKET_PATH');
    expect(landLaunches(f)[0]).not.toContain('HERDR_PANE_ID');
  } finally {
    await f.clean();
  }
}, 60000);
