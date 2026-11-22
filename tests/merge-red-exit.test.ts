import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  cli,
  fakeSystemctl,
  fixture,
  greenReceipt,
  leaf,
  seedRun,
  yaml,
  type Fixture,
  type SystemctlFixture,
} from './helpers';
import { hcFixture, type HcFixture } from './hc-fixture';
import { readState, saveState, type State } from '../src/state';
import { command, quote, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';

type GreenFixture = HcFixture & { launches: string; systemctl: SystemctlFixture };

async function greenFrom(f: HcFixture, checks: Record<string, string>): Promise<GreenFixture> {
  yaml(resolve(f.root, 'issues/config.yaml'), { checks, grounding: 'none' });
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const launches: string = resolve(f.home, 'systemd-run.log');
  const systemctl: SystemctlFixture = fakeSystemctl(f);
  return { ...f, env: { ...f.env, ...systemctl.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches, systemctl };
}
async function greenFixture(checks: Record<string, string>): Promise<GreenFixture> {
  return greenFrom(await hcFixture(), checks);
}
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
async function idleAll(f: GreenFixture): Promise<void> {
  for (const seat of await f.core.terminals({ akrogon: '1' }, false))
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
function attemptRows(f: Fixture): { outcome: string; attempt: string }[] {
  const file: string = resolve(f.root, 'issues/merge-attempts.jsonl');
  return existsSync(file)
    ? readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .map((line) => z.object({ outcome: z.string(), attempt: z.string() }).parse(JSON.parse(line)))
    : [];
}
function verifyRuns(f: Fixture): {
  run: string;
  sha: string;
  tree: string;
  compares?: string;
  scope: string;
  commands: { exit: number; failures?: string[] }[];
}[] {
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
async function next(f: Fixture & { env: NodeJS.ProcessEnv }): Promise<Result> {
  return cli(f, ['next'], f.root, f.env);
}
async function land(f: GreenFixture, slug: string, attempt: string): Promise<Result> {
  return cli(f, ['land', slug, '--attempt', attempt], f.root, f.env);
}
async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', '--git-dir', resolve(f.home, 'remote.git'), 'rev-parse', 'main'], f.root);
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
function toMerge(path: string, stamp: string = '2026-10-19T00:00:00.000Z'): void {
  saveState(path, { ...readState(path), phase: 'merge', merge_stamp: stamp });
}
function configure(f: Fixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}
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
// A check whose log names the failing test title.
async function failingCheck(f: GreenFixture, name: string, file: string = 'check.sh'): Promise<void> {
  writeFileSync(resolve(f.root, file), `echo "(fail) ${name}"; exit 7\n`);
  yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: `sh ${file}` }, grounding: 'none' });
  await command(['git', 'add', file, 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'failing check'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
}

// Criterion 1: a red land run moves the leaf to check.repair with its exit
// record, clears the batch, records the attempt, prompts no merge seat, and the
// land run's own wake starts the next queued leaf's land unit.
test('a red land run exits to check.repair and the next holder launches in the same pass', async () => {
  const f: GreenFixture = await greenFixture({ bad: 'false' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    const before: string = await remoteTip(f);
    const { attempt, top } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(before);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit).toMatchObject({ reason: 'red', top });
    const red: string = z.string().parse(state.merge_exit?.run);
    expect(verifyRuns(f).find((run) => run.run === red)?.commands[0].exit).toBe(1);
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['red']);
    expect(prompts(f, 'merge-issue')).toEqual([]);
    // The land run's wake claimed bb's turn and launched its land unit.
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
    // bb's check.repair seat hears the exit record in its prompt.
    const repairs: string[] = prompts(f, 'check-issue');
    expect(repairs).toHaveLength(1);
    expect(repairs[0]).toContain('phase=check.repair');
    expect(repairs[0]).toContain(`merge-exit=red`);
    expect(repairs[0]).toContain(`run=${red}`);
    expect(repairs[0]).toContain(`top=${top}`);
    const runs: number = verifyRuns(f).length;
    expect((await next(f)).code).toBe(0);
    expect(verifyRuns(f)).toHaveLength(runs);
    // A later pass re-prompts the idle repair seat once per turn and carries the same record.
    for (const prompt of prompts(f, 'check-issue')) expect(prompt).toContain('merge-exit=red');
  } finally {
    await f.clean();
  }
}, 60000);

// #147: the land run holds its repo for its attempt. A run of another leaf
// that starts during it waits for the land and starts after it; the hold names
// no land unit, so a stale sweep never stops a relaunch; the exit and its wakes
// run after the hold ends.
test('a land run holds its repo: a leaf run-check waits for it and starts after the exit', async () => {
  const base: HcFixture = await hcFixture();
  const marks: string = resolve(base.home, 'land-marks');
  const f: GreenFixture = await greenFrom(base, {
    gate: `sh -c 'touch ${marks}/land.held; while [ ! -e ${marks}/release ]; do sleep 0.05; done; false'`,
  });
  try {
    mkdirSync(marks, { recursive: true });
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    const cc: string = await allocated(f, 'cc', 'issue-cc');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    toMerge(aa);
    const { attempt } = await claimed(f, aa);
    // bb waits in merge, so aa's exit launches its land: the launch must see no hold.
    toMerge(bb, '2026-10-19T00:00:01.000Z');
    const holdsLog: string = resolve(marks, 'launch-holds');
    const landing: Promise<Result> = cli(f, ['land', 'aa', '--attempt', attempt], f.root, {
      ...f.env,
      FAKE_LAND_HOLDS_LOG: holdsLog,
    });
    const deadline: number = Date.now() + 30000;
    while (!existsSync(resolve(marks, 'land.held'))) {
      if (Date.now() > deadline) throw new Error('land check never started');
      await Bun.sleep(50);
    }
    const holds: Record<string, unknown>[] = readdirSync(resolve(f.home, 'runs'))
      .filter((name) => name.endsWith('.yaml'))
      .map((name) => Bun.YAML.parse(readFileSync(resolve(f.home, 'runs', name), 'utf8')) as Record<string, unknown>)
      .filter((record) => record.check === 'land');
    expect(holds).toHaveLength(1);
    expect(holds[0]).toMatchObject({ attempt, leaf: 'aa', state: 'live' });
    expect(String(holds[0].unit)).not.toContain('akrogon-land-');
    const worktree: string = z.string().parse(readState(cc).worktree);
    const waiting: Promise<Result> = cli(
      f,
      ['run-check', '--name', 'probe', '--', 'touch', `${marks}/probe`],
      worktree,
      {
        ...f.env,
        AKROGON_RUN: '',
      },
    );
    await Bun.sleep(1500);
    expect(existsSync(resolve(marks, 'probe'))).toBe(false);
    writeFileSync(resolve(marks, 'release'), '');
    expect((await landing).code).toBe(0);
    const probe: Result = await waiting;
    expect(probe.code).toBe(0);
    expect(probe.stderr).toContain(`waiting for ${f.repo}/aa land`);
    expect(existsSync(resolve(marks, 'probe'))).toBe(true);
    expect(readState(aa).phase).toBe('check.repair');
    const launches: string[] = readFileSync(holdsLog, 'utf8')
      .split('\n')
      .filter((line) => line.includes('--unit=akrogon-land-'));
    expect(launches).toHaveLength(1);
    expect(launches[0]).toEndWith(' holds=0');
  } finally {
    await f.clean();
  }
}, 90000);

// Criterion 2 (gate): a gate refusal moves the leaf to check.repair with the
// refusal text, clears the batch and starts the next leaf's turn.
test('a gate refusal exits to check.repair with the refusal and starts the next turn', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    mkdirSync(resolve(f.root, 'tests'), { recursive: true });
    writeFileSync(resolve(f.root, 'tests/x.test.ts'), 'one\n');
    await command(['git', 'add', 'tests/x.test.ts'], f.root);
    await command(['git', 'commit', '-m', 'test file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(aa, 'tests/x.test.ts', 'two\n', 'uncited test change');
    await commitIn(bb, 'bb-file', 'bb\n');
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    const before: string = await remoteTip(f);
    const { attempt, top } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(before);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit?.reason).toBe('gate');
    expect(state.merge_exit?.refusal).toContain('tests/x.test.ts');
    expect(state.merge_exit?.top).toBe(top);
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['red']);
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

// Criterion 2 (restack conflict): a non-fast-forward push whose restack cannot
// apply moves the leaf to check.repair with reason conflict and the new base.
test('a refused push whose restack conflicts exits to check.repair', async () => {
  const f: HcFixture = await hcFixture();
  const mark: string = resolve(f.home, 'advanced');
  // The check run advances remote 'file', which the holder also changed.
  const script: string = await advancer(f, 'file', 'main');
  const g: GreenFixture = await greenFrom(f, { adv: `sh -c '[ -e ${mark} ] || { touch ${mark} && ${script}; }'` });
  try {
    const aa: string = await allocated(g, 'aa', 'issue-aa');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'file'), 'holder side\n');
    await command(['git', 'add', 'file'], worktree);
    await command(['git', 'commit', '-m', 'holder file'], worktree);
    toMerge(aa);
    const { attempt } = await claimed(g, aa);
    expect((await land(g, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit?.reason).toBe('conflict');
    expect(state.merge_exit?.base).toBe(await remoteTip(g));
    expect(attemptRows(g).map((row) => row.outcome)).toEqual(['red']);
  } finally {
    await g.clean();
  }
}, 90000);

test('a wake cannot replace the conflict exit of a live land restack', async () => {
  const f: HcFixture = await hcFixture();
  const advanced: string = resolve(f.home, 'advanced');
  const script: string = await advancer(f, 'file', 'main');
  const g: GreenFixture = await greenFrom(f, {
    adv: `sh -c '[ -e ${advanced} ] || { touch ${advanced} && ${script}; }'`,
  });
  try {
    const aa: string = await allocated(g, 'aa', 'issue-aa');
    const bb: string = await allocated(g, 'bb', 'issue-bb');
    await commitIn(aa, 'file', 'holder side\n');
    await commitIn(bb, 'bb-file', 'waiting leaf\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    const firstBase: string = await remoteTip(g);
    const { attempt, top } = await claimed(g, aa);
    writeFileSync(
      g.systemctl.db,
      JSON.stringify({ units: [{ unit: `akrogon-land-${attempt}.service`, sub: 'running' }] }),
    );
    const aborted: string = resolve(g.home, 'restack-aborted');
    const woke: string = resolve(g.home, 'woke');
    const git: string = z.string().parse(Bun.which('git'));
    const wrapper: string = resolve(g.home, 'bin/git');
    writeFileSync(
      wrapper,
      `#!/bin/sh
if [ "$1" = rebase ] && [ "$2" = --abort ]; then
  touch ${quote(aborted)}
fi
if [ "$PWD" = ${quote(worktree)} ] && [ "$1" = status ] && [ -e ${quote(aborted)} ] && [ ! -e ${quote(woke)} ]; then
  touch ${quote(woke)}
  (cd ${quote(g.root)} && ${quote(process.execPath)} ${quote(resolve(import.meta.dir, '../src/akrogon.ts'))} next) >> ${quote(woke)} 2>&1 || exit $?
fi
exec ${quote(git)} "$@"
`,
    );
    chmodSync(wrapper, 0o755);
    const run: Result = await land(g, 'aa', attempt);
    expect(run.code, run.stderr).toBe(0);
    expect(existsSync(woke)).toBe(true);
    const latestBase: string = await remoteTip(g);
    expect(latestBase).not.toBe(firstBase);
    expect(readState(aa).merge_exit).toMatchObject({ reason: 'conflict', base: latestBase, top });
    expect(attemptRows(g)).toEqual([{ outcome: 'red', attempt }]);
    expect(landLaunches(g).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
  } finally {
    await g.clean();
  }
}, 90000);

// Criterion 2 (turn conflict): a holder whose branch cannot rebase at the turn's
// start exits in the same pass with reason conflict and never launches a land run.
test('an unrebaseable holder exits to check.repair without a land run', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'file'), 'holder side\n');
    await command(['git', 'add', 'file'], worktree);
    await command(['git', 'commit', '-m', 'holder file'], worktree);
    writeFileSync(resolve(f.root, 'file'), 'main side\n');
    await command(['git', 'add', 'file'], f.root);
    await command(['git', 'commit', '-m', 'main file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await commitIn(bb, 'bb-file', 'bb\n');
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit?.reason).toBe('conflict');
    expect(state.merge_exit?.base).toBe(await remoteTip(f));
    expect(landLaunches(f).filter((line) => line.includes('land aa '))).toEqual([]);
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['red']);
    expect(prompts(f, 'check-issue')).toHaveLength(1);
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

// Criterion 2 (dirty): uncommitted work in the holder's worktree exits with
// reason dirty and the edit survives.
test('a dirty holder worktree exits to check.repair keeping the edit', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'forgotten'), 'never committed\n');
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    await idleAll(f);
    expect((await next(f)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.batch).toBeUndefined();
    expect(state.merge_exit?.reason).toBe('dirty');
    expect(readFileSync(resolve(worktree, 'forgotten'), 'utf8')).toBe('never committed\n');
    expect(landLaunches(f).filter((line) => line.includes('land aa '))).toEqual([]);
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['red']);
    // The same pass freed the line: bb's land unit launched.
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

// Criterion 3 + 4a: one non-fast-forward refusal restacks under the same
// attempt; a second refusal clears the batch and the leaf stays in merge; any
// other push error moves it to failed with git's stderr.
test('a second non-fast-forward refusal clears the batch and keeps the leaf in merge', async () => {
  const f: HcFixture = await hcFixture();
  const script: string = await advancer(f, 'adv-file', 'adv');
  const g: GreenFixture = await greenFrom(f, { adv: `sh -c '${script}'` });
  try {
    const aa: string = await allocated(g, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    toMerge(aa);
    const { attempt } = await claimed(g, aa);
    expect((await land(g, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('merge');
    expect(state.merge_stamp).toBe('2026-10-19T00:00:00.000Z');
    expect(attemptRows(g)).toEqual([{ outcome: 'red', attempt }]);
    expect(prompts(g, 'merge-issue')).toEqual([]);
    // The land wake kept aa's place and rebuilt one batch on the fetched base:
    // a fresh attempt, not a parallel one.
    const rebuilt = state.batch;
    expect(rebuilt?.applied).toBe(true);
    expect(rebuilt?.attempt).not.toBe(attempt);
    expect(rebuilt?.built_on).toBe(await remoteTip(g));
    await idleAll(g);
    expect((await next(g)).code).toBe(0);
    expect(readState(aa).batch?.attempt).toBe(rebuilt?.attempt);
    expect(attemptRows(g)).toHaveLength(1);
  } finally {
    await g.clean();
  }
}, 90000);

test('a conflict after the second push refusal belongs to a fresh turn', async () => {
  const f: HcFixture = await hcFixture();
  const first: string = await advancer(f, 'unrelated', 'first remote update');
  const second: string = await advancer(f, 'file', 'conflicting remote update');
  const mark: string = resolve(f.home, 'advanced');
  const g: GreenFixture = await greenFrom(f, {
    adv: `sh -c 'if [ -e ${mark} ]; then ${second}; else touch ${mark} && ${first}; fi'`,
  });
  try {
    const aa: string = await allocated(g, 'aa', 'issue-aa');
    await commitIn(aa, 'file', 'holder side\n');
    toMerge(aa);
    const { attempt } = await claimed(g, aa);
    const before: string = await remoteTip(g);
    expect((await land(g, 'aa', attempt)).code).toBe(0);
    const latestBase: string = await remoteTip(g);
    expect(await command(['git', 'rev-list', '--count', `${before}..${latestBase}`], g.root)).toBe('2');
    expect(readState(aa).merge_exit).toEqual({ reason: 'conflict', base: latestBase });
    const rows = attemptRows(g);
    expect(rows.map((row) => row.outcome)).toEqual(['red', 'red']);
    expect(rows[0].attempt).toBe(attempt);
    expect(rows[1].attempt).not.toBe(attempt);
  } finally {
    await g.clean();
  }
}, 90000);

test('a push error moves the leaf to failed with git stderr and frees the line', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    const hook: string = resolve(f.home, 'remote.git/hooks/pre-receive');
    writeFileSync(hook, '#!/bin/sh\necho blocked by hook >&2\nexit 1\n');
    chmodSync(hook, 0o755);
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    const { attempt } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('failed');
    expect(state.batch).toBeUndefined();
    expect(state.failure?.reason).toContain('blocked by hook');
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['red']);
    expect(prompts(f, 'merge-issue')).toEqual([]);
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
  } finally {
    await f.clean();
  }
}, 60000);

// Criterion 4b: the dead seat of the exited leaf does not stall the next
// holder, and the repair dispatch restarts that seat.
test('a dead B seat of the exited leaf does not stall the next holder', async () => {
  const f: GreenFixture = await greenFixture({ bad: 'false' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    // A merge leaf never owns a B seat; start one by hand and kill it so the
    // exit lands on a leaf whose B is provably dead.
    expect((await cli(f, ['seat', 'aa', 'B'], f.root, f.env)).code).toBe(0);
    const bAddress: string = z.string().parse(readState(aa).seat.B?.address);
    await f.core.hc(['kill', bAddress]);
    expect((await f.core.hc(['rm', bAddress])).code).toBe(0);
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    const { attempt } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(readState(aa).phase).toBe('check.repair');
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
    // The repair prompt went to a fresh B seat, not the removed one.
    const b: string = z.string().parse(readState(aa).seat.B?.address);
    expect(b).not.toBe(bAddress);
    expect(f.core.tasks(b).some((text) => text.startsWith('check-issue aa'))).toBe(true);
  } finally {
    await f.clean();
  }
}, 60000);

// Criterion 4c: with no live seat of its own the repair dispatch obeys
// max_active — the dead B is restarted only when the cap has room.
test('a dead B seat restarts only when capacity has room', async () => {
  const f: GreenFixture = await greenFixture({ bad: 'false' });
  // bb's plan.synthesis seat stays busy-live and fills the whole cap.
  const release: () => void = holdTurns(f, 'plan-issue');
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    const bb: string = await allocated(f, 'bb', 'issue-bb');
    // cc's plan.synthesis seat stays busy-live and fills the whole cap; a merge
    // leaf never counts toward max_active.
    await allocated(f, 'cc', 'issue-cc');
    await commitIn(aa, 'aa-file', 'aa\n');
    await commitIn(bb, 'bb-file', 'bb\n');
    expect((await cli(f, ['seat', 'aa', 'B'], f.root, f.env)).code).toBe(0);
    // Kill both of aa's seats: the leaf then holds no live seat, so capacity
    // governs the repair restart.
    const bAddress: string = z.string().parse(readState(aa).seat.B?.address);
    const addresses: string[] = [aa]
      .flatMap((path) => [readState(path).seat.A?.address, readState(path).seat.B?.address])
      .filter((address): address is string => address !== undefined);
    for (const address of addresses) {
      await f.core.hc(['kill', address]);
      expect((await f.core.hc(['rm', address])).code).toBe(0);
    }
    configure(f, { max_active: 1 });
    toMerge(aa, '2026-10-19T00:00:00.000Z');
    toMerge(bb, '2026-10-20T00:00:00.000Z');
    expect((await next(f)).code).toBe(0);
    const attempt: string = z.string().parse(readState(aa).batch?.attempt);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(readState(aa).phase).toBe('check.repair');
    // At capacity the repair dispatch starts no terminal and delivers no
    // prompt; the next holder still claimed its turn.
    expect(prompts(f, 'check-issue')).toEqual([]);
    expect(landLaunches(f).filter((line) => line.includes('land bb --attempt'))).toHaveLength(1);
    // With room the dead B restarts on a later pass.
    configure(f, { max_active: 5 });
    expect((await next(f)).code).toBe(0);
    const b: string = z.string().parse(readState(aa).seat.B?.address);
    expect(b).not.toBe(bAddress);
    expect(f.core.tasks(b).some((text) => text.startsWith('check-issue aa'))).toBe(true);
  } finally {
    release();
    await f.clean();
  }
}, 60000);

// Criterion 5: the receipt skip only for the recorded red exit's top.
test('check.repair to merge skips the leaf receipt only for the recorded red top', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt-exit');
    await command(['git', 'worktree', 'add', '-b', 'exit', worktree], f.root);
    writeFileSync(resolve(worktree, 'code.ts'), 'x\n');
    await command(['git', 'add', 'code.ts'], worktree);
    await command(['git', 'commit', '-m', 'code'], worktree);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const path: string = leaf(f, 'exit', 'check.repair', {
      worktree,
      merge_exit: { reason: 'red', run: 'run-1', top: head },
    });
    const move: string[] = ['phase', 'exit', 'merge'];
    expect((await cli(f, move)).code).toBe(0);
    const state: State = readState(path);
    expect(state.phase).toBe('merge');
    expect(state.merge_exit).toBeUndefined();

    const edited: string = leaf(f, 'edited', 'check.repair', {
      worktree,
      merge_exit: { reason: 'red', run: 'run-2', top: 'a'.repeat(40) },
    });
    const refused: Result = await cli(f, ['phase', 'edited', 'merge']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(`No green leaf verify receipt for ${head}`);

    const gated: string = leaf(f, 'gated', 'check.repair', {
      worktree,
      merge_exit: { reason: 'gate', refusal: 'missing trailer', top: head },
    });
    const gateRefused: Result = await cli(f, ['phase', 'gated', 'merge']);
    expect(gateRefused.code).not.toBe(0);
    expect(gateRefused.stderr).toContain('No green leaf verify receipt');
    expect(readState(edited).merge_exit).toBeDefined();
    expect(readState(gated).merge_exit).toBeDefined();
    greenReceipt(f, head, 'leaf');
    expect((await cli(f, ['phase', 'edited', 'merge'])).code).toBe(0);
  } finally {
    f.clean();
  }
});

// Criterion 6: the first return to merge keeps its first stamp whatever the
// path back; the second return mints a new one; the kept stamp heads the queue.
test('the first merge return keeps its stamp and heads the queue, the second mints a new one', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'back', 'check.repair');
    expect((await cli(f, ['phase', 'back', 'merge'])).code).toBe(0);
    const first: string = z.string().parse(readState(path).merge_stamp);
    saveState(path, { ...readState(path), phase: 'check.repair' });
    expect((await cli(f, ['phase', 'back', 'merge'])).code).toBe(0);
    expect(readState(path).merge_stamp).toBe(first);
    saveState(path, { ...readState(path), phase: 'check.repair' });
    expect((await cli(f, ['phase', 'back', 'merge'])).code).toBe(0);
    const second: string = z.string().parse(readState(path).merge_stamp);
    expect(second).not.toBe(first);

    const failed: string = leaf(f, 'via-failed', 'check.repair');
    expect((await cli(f, ['phase', 'via-failed', 'merge'])).code).toBe(0);
    const failedFirst: string = z.string().parse(readState(failed).merge_stamp);
    saveState(failed, {
      ...readState(failed),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'merge', reason: 'stop' },
    });
    expect((await cli(f, ['phase', 'via-failed', 'merge'])).code).toBe(0);
    expect(readState(failed).merge_stamp).toBe(failedFirst);

    // The kept stamp heads the merge queue over a leaf stamped later.
    const later: string = leaf(f, 'later', 'merge', { merge_stamp: '2030-01-01T00:00:00.000Z' });
    await command(['git', 'worktree', 'add', '-b', 'later', resolve(f.home, 'wt-later')], f.root);
    saveState(later, { ...readState(later), worktree: resolve(f.home, 'wt-later') });
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const result: Result = await cli(f, ['next'], f.root, systemctl.env);
    expect(result.code).toBe(0);
    // back's first stamp heads the queue over the two later-stamped leaves.
    expect(readState(path).batch).toBeDefined();
    expect(readState(later).batch).toBeUndefined();
  } finally {
    f.clean();
  }
}, 30000);

// Criterion 7: a merge leaf holding a batch keeps its leaf slice when both
// seats are gone.
test('a merge leaf holding a batch keeps its slice with both seats gone', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const systemctl: SystemctlFixture = f.systemctl;
    const main: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const path: string = leaf(f, 'held', 'merge', {
      tab: 'akheldtab1',
      merge_stamp: '2026-10-19T00:00:00.000Z',
      batch: { attempt: 'a1', built_on: main, holder: { base: main, head: main }, applied: true, top: main },
    });
    const slice: string = leafSlice({ name: f.repo }, 'held');
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    expect((await next(f)).code).toBe(0);
    const calls: string[] = existsSync(systemctl.log) ? readFileSync(systemctl.log, 'utf8').trim().split('\n') : [];
    expect(calls.some((line) => line.includes('stop') && line.includes(slice))).toBe(false);
    // A merge leaf without the batch record — failed here clears it — stops its slice.
    expect((await cli(f, ['phase', 'held', 'failed', '--reason', 'stop'], f.root, f.env)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(readFileSync(systemctl.log, 'utf8')).toContain(`stop ${slice}`);
  } finally {
    await f.clean();
  }
}, 30000);

// Criterion 8: a slot-run merged or check.fix on a merge leaf is refused; the
// operator's slot-less merged still lands, and --check is refused outright.
test('a slot-run merged or check.fix on a merge leaf is refused and merged --check is gone', async () => {
  const f: Fixture = await fixture();
  try {
    const main: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    leaf(f, 'holder', 'merge', {
      merge_stamp: '2026-10-19T00:00:00.000Z',
      batch: { attempt: 'a1', built_on: main, holder: { base: main, head: main }, applied: true, top: main },
    });
    const slotMerged: Result = await cli(f, ['phase', 'holder', 'merged', '--slot', 'B', '--attempt', 'a1']);
    expect(slotMerged.code).not.toBe(0);
    expect(slotMerged.stderr).toContain('seat');
    const slotFix: Result = await cli(f, ['phase', 'holder', 'check.fix', '--slot', 'B', '--attempt', 'a1']);
    expect(slotFix.code).not.toBe(0);
    expect(slotFix.stderr).toContain('seat');
    const checked: Result = await cli(f, ['phase', 'holder', 'merged', '--check']);
    expect(checked.code).not.toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/holder')).phase).toBe('merge');
    greenReceipt(f, main, 'merge');
    expect((await cli(f, ['phase', 'holder', 'merged'])).code).toBe(0);
    expect(readState(resolve(f.root, 'issues/closed/issue/holder')).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

// Criterion 9: an unchanged returning leaf whose uncovered failing units repeat
// gets one base verdict in the same land run.
test('an unchanged red leaf gets a base pass when main and the merge top stay put', async () => {
  const f: GreenFixture = await greenFixture({ test: 'bun test main-red.test.ts' });
  try {
    const file: string = 'main-red.test.ts';
    writeFileSync(
      resolve(f.root, file),
      "import { test, expect } from 'bun:test'; test('existing red title', () => expect(1).toBe(2));\n",
    );
    await command(['git', 'add', file], f.root);
    await command(['git', 'commit', '-m', 'introduce named regression on main'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'independent leaf edit');
    toMerge(aa);
    const first = await claimed(f, aa);
    expect((await land(f, 'aa', first.attempt)).code).toBe(0);
    expect(readState(aa).phase).toBe('check.repair');
    await idleAll(f);
    expect((await cli(f, ['phase', 'aa', 'merge', '--slot', 'B'], f.root, f.env)).code).toBe(0);
    const second = await claimed(f, aa);
    expect(second.top).toBe(first.top);
    expect((await land(f, 'aa', second.attempt)).code).toBe(0);
    expect(verifyRuns(f).filter((run) => run.compares !== undefined)).toHaveLength(1);
    expect(readState(moved(aa)).phase).toBe('merged');
    expect(await remoteTip(f)).toBe(second.top);
  } finally {
    await f.clean();
  }
}, 60000);

test('a covered repeat and a new uncovered failure do not trigger a base pass', async () => {
  const f: GreenFixture = await greenFixture({ test: 'sh check.sh' });
  try {
    await failingCheck(f, 'alpha');
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'independent leaf edit');
    toMerge(aa);
    const first = await claimed(f, aa);
    expect((await land(f, 'aa', first.attempt)).code).toBe(0);
    expect(readState(aa).phase).toBe('check.repair');

    const direct: string = resolve(f.home, 'direct');
    mkdirSync(direct);
    expect((await cli(f, ['verify', '--holder', direct, '--known-red'], f.root, f.env)).code).toBe(0);
    expect(verifyRuns(f).filter((run) => run.compares !== undefined)).toHaveLength(1);
    writeFileSync(resolve(f.root, 'check.sh'), 'echo "(fail) alpha"; echo "(fail) beta"; exit 7\n');
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'introduce beta failure on main'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);

    await idleAll(f);
    expect((await cli(f, ['phase', 'aa', 'merge', '--slot', 'B'], f.root, f.env)).code).toBe(0);
    const second = await claimed(f, aa);
    expect(second.top).not.toBe(first.top);
    expect((await land(f, 'aa', second.attempt)).code).toBe(0);
    const runs = verifyRuns(f);
    expect(runs.find((run) => run.sha === second.top)?.commands[0].failures).toEqual(['alpha', 'beta']);
    expect(runs.filter((run) => run.compares !== undefined)).toHaveLength(1);
    expect(readState(aa).merge_exit).toMatchObject({ reason: 'red', top: second.top });
    expect(readState(aa).merge_exit?.base_verdict).toBeUndefined();
  } finally {
    await f.clean();
  }
}, 60000);

test('a base verdict names the green leaf receipt reused when main landed', async () => {
  const f: GreenFixture = await greenFixture({ test: 'sh check.sh' });
  try {
    writeFileSync(resolve(f.root, 'check.sh'), 'exit 0\n');
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'add passing main check'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'check.sh', 'echo "(fail) alpha"; exit 7\n');
    toMerge(aa);
    const first = await claimed(f, aa);
    expect((await land(f, 'aa', first.attempt)).code).toBe(0);
    expect(readState(aa).phase).toBe('check.repair');

    const bb: string = await allocated(f, 'bb', 'issue-bb');
    await commitIn(bb, 'bb-file', 'independent main update');
    const bbWorktree: string = z.string().parse(readState(bb).worktree);
    expect((await cli(f, ['verify'], bbWorktree, f.env)).code).toBe(0);
    const greenRun: string = z.string().parse(verifyRuns(f).find((run) => run.scope === 'leaf')?.run);
    toMerge(bb);
    const main = await claimed(f, bb);
    expect((await land(f, 'bb', main.attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(main.top);
    expect(
      verifyRuns(f)
        .filter((run) => run.sha === main.top)
        .map((run) => run.run),
    ).toEqual([greenRun]);

    await idleAll(f);
    expect((await cli(f, ['phase', 'aa', 'merge', '--slot', 'B'], f.root, f.env)).code).toBe(0);
    const second = await claimed(f, aa);
    expect((await land(f, 'aa', second.attempt)).code).toBe(0);
    expect(verifyRuns(f).filter((run) => run.compares !== undefined)).toHaveLength(0);
    expect(readState(aa).merge_exit).toMatchObject({ reason: 'red', base_verdict: greenRun });
  } finally {
    await f.clean();
  }
}, 60000);

test('a green row at the merge-base skips the base pass and exits with its run as the verdict', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    // The leaf carries the failing check: it exists on the leaf branch only,
    // so the base pass below passes on main.
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'check.sh'), 'echo "(fail) alpha"; exit 7\n');
    await command(['git', 'add', 'check.sh'], worktree);
    await command(['git', 'commit', '-m', 'check'], worktree);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    // The previous attempt's red merge run on exactly this tree: the stacked
    // top's sha differs every build, so the exit record keys on the tree.
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    seedRun(f, {
      sha: head,
      tree,
      leaf: 'aa',
      scope: 'merge',
      commands: [
        { name: 'test', command: 'sh check.sh', exit: 7, log: resolve(f.home, 'prev-red.log'), failures: ['alpha'] },
      ],
    });
    writeFileSync(resolve(f.home, 'prev-red.log'), '(fail) alpha\n');
    toMerge(aa);
    const { attempt } = await claimed(f, aa);
    const mergeBase: string = await command(['git', 'merge-base', 'origin/main', 'HEAD'], worktree);
    // The standing whole-green row on main's merge-base tree.
    const greenBase = seedRun(f, {
      sha: mergeBase,
      tree: await command(['git', 'rev-parse', `${mergeBase}^{tree}`], f.root),
      scope: 'merge',
      compares: 'older-head',
      commands: [{ name: 'test', command: 'sh check.sh', exit: 0, log: resolve(f.home, 'base-green.log') }],
    });
    writeFileSync(resolve(f.home, 'base-green.log'), '');
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.merge_exit?.reason).toBe('red');
    expect(state.merge_exit?.base_verdict).toBe(greenBase.run);
    // No new run was appended: the stored red run is the receipt and the
    // standing green row at the merge-base is the verdict.
    const after = verifyRuns(f);
    expect(after.filter((run) => run.tree === tree && run.compares === undefined)).toHaveLength(1);
    // Only the seeded green row carries a compares link; the verdict ran no base pass.
    const exitRun: string = z.string().parse(state.merge_exit?.run);
    expect(after.filter((run) => run.compares === exitRun)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 60000);

test('a base pass red on every failing unit covers the head and lands the leaf', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    // The check exists on main too (committed at fixture time below), failing
    // the same named unit on base and head: covered, so the leaf lands.
    writeFileSync(resolve(f.root, 'check.sh'), 'echo "(fail) alpha"; exit 7\n');
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'check'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    seedRun(f, {
      sha: head,
      tree,
      leaf: 'aa',
      scope: 'merge',
      commands: [
        { name: 'test', command: 'sh check.sh', exit: 7, log: resolve(f.home, 'prev-red.log'), failures: ['alpha'] },
      ],
    });
    writeFileSync(resolve(f.home, 'prev-red.log'), '(fail) alpha\n');
    toMerge(aa);
    const { attempt, top } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(readState(moved(aa)).phase).toBe('merged');
    expect(await remoteTip(f)).toBe(top);
    const runs = verifyRuns(f);
    const compares = runs.filter((run) => run.compares !== undefined);
    expect(compares).toHaveLength(1);
    expect(compares[0].commands[0].failures).toEqual(['alpha']);
    expect(attemptRows(f).map((row) => row.outcome)).toEqual(['merged']);
  } finally {
    await f.clean();
  }
}, 90000);

test('a base pass green on a failing unit exits to check.repair naming the base run', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'check.sh'), 'echo "(fail) alpha"; exit 7\n');
    await command(['git', 'add', 'check.sh'], worktree);
    await command(['git', 'commit', '-m', 'check'], worktree);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    seedRun(f, {
      sha: head,
      tree,
      leaf: 'aa',
      scope: 'merge',
      commands: [
        { name: 'test', command: 'sh check.sh', exit: 7, log: resolve(f.home, 'prev-red.log'), failures: ['alpha'] },
      ],
    });
    writeFileSync(resolve(f.home, 'prev-red.log'), '(fail) alpha\n');
    toMerge(aa);
    const { attempt } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.merge_exit?.reason).toBe('red');
    const compares = verifyRuns(f).filter((run) => run.compares !== undefined);
    expect(compares).toHaveLength(1);
    expect(state.merge_exit?.base_verdict).toBe(compares[0].run);
  } finally {
    await f.clean();
  }
}, 90000);

test('a changed head or a nameless previous failure runs no base pass', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'check.sh'), 'echo "(script) check.sh"; exit 7\n');
    await command(['git', 'add', 'check.sh'], worktree);
    await command(['git', 'commit', '-m', 'check'], worktree);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    // Previous red on a *different* tree (the leaf was edited): the head run
    // fails on its own with no base pass.
    seedRun(f, {
      sha: 'b'.repeat(40),
      tree: 'x',
      leaf: 'aa',
      scope: 'merge',
      commands: [
        { name: 'test', command: 'sh check.sh', exit: 7, log: resolve(f.home, 'prev-red.log'), failures: ['alpha'] },
      ],
    });
    writeFileSync(resolve(f.home, 'prev-red.log'), '(fail) alpha\n');
    void head;
    toMerge(aa);
    const { attempt } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.merge_exit?.reason).toBe('red');
    expect(state.merge_exit?.base_verdict).toBeUndefined();
    expect(verifyRuns(f).filter((run) => run.compares !== undefined)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 90000);

test('a previous run that names no real test runs no base pass', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const aa: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(aa, 'aa-file', 'aa\n');
    const worktree: string = z.string().parse(readState(aa).worktree);
    writeFileSync(resolve(worktree, 'check.sh'), 'echo "boom"; exit 7\n');
    await command(['git', 'add', 'check.sh'], worktree);
    await command(['git', 'commit', '-m', 'check'], worktree);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    // The previous red on this exact tree named only a script stream.
    seedRun(f, {
      sha: head,
      tree,
      leaf: 'aa',
      scope: 'merge',
      commands: [
        {
          name: 'test',
          command: 'sh check.sh',
          exit: 7,
          log: resolve(f.home, 'prev-red.log'),
          failures: ['(script) check.sh'],
        },
      ],
    });
    writeFileSync(resolve(f.home, 'prev-red.log'), 'check.sh| Exited with code 7\n');
    toMerge(aa);
    const { attempt } = await claimed(f, aa);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const state: State = readState(aa);
    expect(state.phase).toBe('check.repair');
    expect(state.merge_exit?.base_verdict).toBeUndefined();
    expect(verifyRuns(f).filter((run) => run.compares !== undefined)).toHaveLength(0);
  } finally {
    await f.clean();
  }
}, 90000);

// Sweep: no seat-owned merge surface remains in src.
test('no seat-owned merge path remains in src', () => {
  const root: string = resolve(import.meta.dir, '..');
  const files: string[] = readdirSync(resolve(root, 'src')).map((entry) => resolve(root, 'src', String(entry)));
  const banned: RegExp[] = [
    /owner === 'seat'/,
    /owner: 'seat'/,
    /dispatchMergeLeaf/,
    /mergeContext\(/,
    /wake=red|wake=gate|wake=push|wake=rebase/,
  ];
  for (const file of files.filter((name) => name.endsWith('.ts'))) {
    // values.wake is the next --wake CLI flag, not a batch handoff field.
    const text: string = readFileSync(file, 'utf8').replaceAll('values.wake', 'values.wakeFlag');
    for (const pattern of banned) expect(text, `${file} matches ${pattern}`).not.toMatch(pattern);
    const wakes: string[] = text.match(/\.(wake)\b/g) ?? [];
    for (const _hit of wakes) expect(_hit, `${file} holds a batch .wake read`).toBe('impossible');
  }
});
