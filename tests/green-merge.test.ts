import { test, expect } from 'bun:test';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { z } from 'zod';
import {
  cgroupRoot,
  cli,
  entry,
  fakeSystemctl,
  leafTempRoot,
  unitBin,
  fixture,
  leaf,
  readMarker,
  seedRun,
  WAIT_MS,
  yaml,
  type Fixture,
  type SystemctlFixture,
} from './helpers';
import { hcFixture, type HcFixture, stopCoresAfterFile } from './hc-fixture';
import { readState, saveState, type State } from '../src/state';
import { command, type Result } from '../src/shell';
import { cgroupRoot as hostCgroupRoot, leafSlice, runUnitBase, sliceCgroup } from '../src/scope';
import { liveStartTime, ownLive } from '../src/admission';
import { bootId, writePassRecord } from '../src/verify-pass';

stopCoresAfterFile();
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
    expect(landLaunches(f)[0]).toContain('--setenv=AKROGON_LEAF_TEMP_ROOT=');
    expect(landLaunches(f)[0]).not.toContain('HERDR_PANE_ID');
    expect(landLaunches(f)[0]).toContain('--setenv=NODE_DISABLE_COMPILE_CACHE=1');
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
});

test("a land attempt's verify pass and check scopes run in akrogon-land.slice", async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    const slice: string = z.string().parse(/--setenv=AKROGON_RUN_SLICE=(\S+)/.exec(landLaunches(f)[0])?.[1]);
    expect(slice).toBe('akrogon-land.slice');
    const before: number = readFileSync(f.launches, 'utf8').trim().split('\n').length;
    expect(
      (await cli(f, ['land', 'aa', '--attempt', attempt], f.root, { ...f.env, AKROGON_RUN_SLICE: slice })).code,
    ).toBe(0);
    const calls: string[] = readFileSync(f.launches, 'utf8').split('\n').slice(before);
    const passes: string[] = calls.filter((line) => line.includes(' verify-pass '));
    const scopes: string[] = calls.filter((line) => line.includes(' --scope '));
    expect(passes.length).toBeGreaterThan(0);
    expect(scopes.length).toBeGreaterThan(0);
    for (const line of [...passes, ...scopes]) expect(line).toContain('--slice=akrogon-land.slice');
  } finally {
    await f.clean();
  }
});

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
});

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
});

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
});

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
});

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
});

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
});

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
    const slice: string = leafSlice({ name: f.repo }, 'aa', f.home);
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

// A run record owned by this test process or the given one, so admission and stop read it as alive.
function writeRun(
  f: Fixture,
  run: string,
  fields: { leaf: string; state: 'live' | 'waiting'; attempt: string; land?: true; since?: string; pid?: number },
): void {
  const pid: number = fields.pid ?? process.pid;
  mkdirSync(resolve(f.home, 'runs'), { recursive: true });
  writeFileSync(
    resolve(f.home, 'runs', `${run}.yaml`),
    Bun.YAML.stringify({
      token_hash: run,
      pid,
      start_time: z.string().parse(liveStartTime(pid)),
      boot_id: bootId(),
      repo: f.repo,
      check: 'verify',
      run,
      slice: 'akrogon-land.slice',
      scope: 'akrogon-verify-pass-aa.service',
      unit: `akrogon-run-${run}.scope`,
      full: false,
      since: new Date().toISOString(),
      ...fields,
    }),
  );
}

// A live verify pass of a leaf's land attempt, owned by this test process or the given one.
async function writePass(f: Fixture, slug: string, attempt: string, pid: number = process.pid): Promise<void> {
  const main: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
  const pass: string = resolve(f.home, 'verify-passes', `pass-${slug}`);
  mkdirSync(pass, { recursive: true });
  writePassRecord(pass, {
    run: `pass-${slug}`,
    repo: f.repo,
    root: f.root,
    unit_name: `akrogon-verify-pass-${slug}`,
    caller: { slug, target: resolve(f.root, 'issues/open/issue', slug), scope: 'leaf', attempt },
    caller_scope: `akrogon-land-${attempt}.service`,
    sha: main,
    tree: await command(['git', 'rev-parse', `${main}^{tree}`], f.root),
    scope: 'merge',
    commands: [],
    member_count: 0,
    setup: 'true',
    akrogon_base: main,
    pid,
    boot_id: bootId(),
    pending: false,
    created: new Date().toISOString(),
  });
}

test("stop ends the leaf's land verify pass and check runs outside its slice", async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    leaf(f, 'aa', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'aa', f.home);
    for (const [slug, run] of [
      ['aa', 'run-aa'],
      ['bb', 'run-bb'],
    ] as const)
      writeRun(f, run, { leaf: slug, state: 'live', attempt: 'a1' });
    await writePass(f, 'aa', 'a1');
    const units: string[] = [
      slice,
      'akrogon-run-run-aa.scope',
      'akrogon-run-run-aa-guard.service',
      'akrogon-run-run-bb.scope',
      'akrogon-run-run-bb-guard.service',
    ];
    writeFileSync(systemctl.db, JSON.stringify({ units: units.map((unit) => ({ unit, sub: 'active' })) }));
    const stopped: Result = await cli(f, ['stop', 'aa'], f.root, {
      ...systemctl.env,
      PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.code).toBe(0);
    const calls: string[] = readFileSync(systemctl.log, 'utf8').trim().split('\n');
    expect(calls.filter((line) => line.startsWith('--user stop ')).sort()).toEqual(
      [slice, 'akrogon-verify-pass-aa', 'akrogon-run-run-aa.scope', 'akrogon-run-run-aa-guard.service']
        .map((unit) => `--user stop ${unit}`)
        .sort(),
    );
  } finally {
    f.clean();
  }
});

test('stop fails when an off-slice unit is still activating, after trying every unit', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'aa', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    writeRun(f, 'run-aa', { leaf: 'aa', state: 'live', attempt: 'a1' });
    await writePass(f, 'aa', 'a1');
    // The pass refuses its stop and is still activating; the run's scope is already gone.
    const bin: string = resolve(f.home, 'deny-bin');
    const log: string = resolve(f.home, 'systemctl.log');
    mkdirSync(bin);
    writeFileSync(
      resolve(bin, 'systemctl'),
      [
        '#!/bin/sh',
        `printf '%s\\n' "$*" >> '${log}'`,
        'case "$*" in',
        "*'stop akrogon-verify-pass-aa') echo 'Failed to stop akrogon-verify-pass-aa.service: Access denied' >&2; exit 1 ;;",
        "*'is-active akrogon-verify-pass-aa') echo activating; exit 3 ;;",
        "*'stop akrogon-run-run-aa.scope') echo 'Unit akrogon-run-run-aa.scope not loaded.' >&2; exit 5 ;;",
        "*'is-active akrogon-run-run-aa.scope') echo inactive; exit 3 ;;",
        'esac',
        '',
      ].join('\n'),
    );
    chmodSync(resolve(bin, 'systemctl'), 0o755);
    const stopped: Result = await cli(f, ['stop', 'aa'], f.root, { PATH: `${bin}:${process.env.PATH}` });
    expect(stopped.code).not.toBe(0);
    expect(stopped.stdout).not.toContain('stopped:');
    expect(stopped.stderr).toContain('Access denied');
    expect(readFileSync(log, 'utf8')).toContain('--user stop akrogon-run-run-aa-guard.service');
  } finally {
    f.clean();
  }
});

// The run record of one leaf's check, if any.
function runOf(f: Fixture, slug: string): { run: string; state: string } | undefined {
  const dir: string = resolve(f.home, 'runs');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .map((name) =>
      z
        .object({ leaf: z.string(), run: z.string(), state: z.string() })
        .parse(Bun.YAML.parse(readFileSync(resolve(dir, name), 'utf8'))),
    )
    .find((record) => record.leaf === slug);
}

test("stop cancels the leaf's queued check so it never launches when the line frees", async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const env: NodeJS.ProcessEnv = { ...systemctl.env, PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}` };
    const path: string = leaf(f, 'aa', 'implement');
    writeFileSync(
      systemctl.db,
      JSON.stringify({ units: [{ unit: leafSlice({ name: f.repo }, 'aa', f.home), sub: 'active' }] }),
    );
    // Another leaf's land attempt holds the repo line, so aa's check queues behind it.
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, since: '2020-01-01T00:00:00.000Z' });
    const marker: string = resolve(f.home, 'launched');
    const queued: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'touch', marker],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    expect((await cli(f, ['stop', 'aa'], f.root, env)).code).toBe(0);
    rmSync(resolve(f.home, 'runs', 'hold-bb.yaml'));
    const result: Result = await queued;
    expect(result.code).not.toBe(0);
    expect(existsSync(marker)).toBe(false);
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
});

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
});

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
});

test("stop cancels the leaf's promoted check whose units are not registered yet, so it never launches", async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const env: NodeJS.ProcessEnv = { ...systemctl.env, PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}` };
    const path: string = leaf(f, 'aa', 'implement');
    // The run's guard registration waits on the hold file, after admission promoted the run.
    const hold: string = resolve(f.home, 'guard-hold');
    const reached: string = resolve(f.home, 'guard-reached');
    writeFileSync(hold, '');
    const units: string = unitBin(f);
    rmSync(resolve(units, 'systemd-run'));
    writeFileSync(
      resolve(units, 'systemd-run'),
      [
        '#!/bin/sh',
        'case "$*" in',
        `*'-guard '*) touch '${reached}'; while [ -e '${hold}' ]; do sleep 0.05; done ;;`,
        'esac',
        `exec '${resolve(import.meta.dir, 'fake-systemd-run.sh')}' "$@"`,
        '',
      ].join('\n'),
    );
    chmodSync(resolve(units, 'systemd-run'), 0o755);
    const marker: string = resolve(f.home, 'launched');
    const check: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'touch', marker],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (!existsSync(reached)) {
      if (Date.now() > deadline) throw new Error('aa check never reached its guard');
      await Bun.sleep(50);
    }
    const run: { run: string; state: string } = z.object({ run: z.string(), state: z.string() }).parse(runOf(f, 'aa'));
    expect(run.state).toBe('live');
    writeFileSync(
      systemctl.db,
      JSON.stringify({
        units: [
          leafSlice({ name: f.repo }, 'aa', f.home),
          `akrogon-run-${run.run}.scope`,
          `akrogon-run-${run.run}-guard.service`,
        ].map((unit) => ({ unit, sub: 'active' })),
      }),
    );
    const stopped: Result = await cli(f, ['stop', 'aa'], f.root, env);
    expect(stopped.code).toBe(0);
    rmSync(hold);
    const result: Result = await check;
    expect(result.code).not.toBe(0);
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});

test('a stopped land holder keeps the repo line until its own run ends', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const env: NodeJS.ProcessEnv = { ...systemctl.env, PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}` };
    const path: string = leaf(f, 'aa', 'implement');
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    writeFileSync(
      systemctl.db,
      JSON.stringify({
        units: [
          leafSlice({ name: f.repo }, 'bb', f.home),
          'akrogon-run-hold-bb.scope',
          'akrogon-run-hold-bb-guard.service',
        ].map((unit) => ({ unit, sub: 'active' })),
      }),
    );
    // bb's land attempt holds the repo line, so aa's check queues behind it.
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, since: '2020-01-01T00:00:00.000Z' });
    const marker: string = resolve(f.home, 'launched');
    const queued: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'touch', marker],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    expect((await cli(f, ['stop', 'bb'], f.root, env)).code).toBe(0);
    // The holder's process still runs: two admission polls later aa's check still waits.
    await Bun.sleep(2500);
    expect(runOf(f, 'aa')?.state).toBe('waiting');
    expect(existsSync(marker)).toBe(false);
    rmSync(resolve(f.home, 'runs', 'hold-bb.yaml'));
    expect((await queued).code).toBe(0);
    expect(existsSync(marker)).toBe(true);
  } finally {
    f.clean();
  }
});

// A systemctl that runs a shell case first and hands every other call to the fake.
function stubSystemctl(f: Fixture, cases: string[]): string {
  const bin: string = resolve(f.home, 'stub-bin');
  mkdirSync(bin);
  writeFileSync(
    resolve(bin, 'systemctl'),
    ['#!/bin/sh', 'case "$*" in', ...cases, 'esac', `exec '${resolve(f.home, 'bin', 'systemctl')}' "$@"`, ''].join(
      '\n',
    ),
  );
  chmodSync(resolve(bin, 'systemctl'), 0o755);
  return bin;
}

test("a stopped land's repo line stays held until its verify pass and its checks have stopped", async () => {
  const f: Fixture = await fixture();
  const [holder, pass] = [0, 1].map(() => Bun.spawn(['sleep', '300']));
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const path: string = leaf(f, 'aa', 'implement');
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(
      systemctl.db,
      JSON.stringify({
        units: [slice, 'akrogon-run-check-bb-guard.service'].map((unit) => ({ unit, sub: 'active' })),
      }),
    );
    // bb's land service holds the repo line and the slice stop ends it. The pass runs its check in
    // process, so the check record carries the pass PID; the check scope ignores TERM for 2s.
    const since: string = '2020-01-01T00:00:00.000Z';
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, since, pid: holder.pid });
    writeRun(f, 'check-bb', { leaf: 'bb', state: 'live', attempt: 'a9', since, pid: pass.pid });
    await writePass(f, 'bb', 'a9', pass.pid);
    const ended: string = resolve(f.home, 'ended');
    const bin: string = stubSystemctl(f, [
      `*'stop ${slice}') kill ${holder.pid}; exit 0 ;;`,
      `*'stop akrogon-verify-pass-bb') kill ${pass.pid}; exit 0 ;;`,
      `*'stop akrogon-run-check-bb.scope') sleep 2; touch '${ended}'; exit 0 ;;`,
    ]);
    const env: NodeJS.ProcessEnv = { ...systemctl.env, PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}` };
    const queued: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'test', '-e', ended],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    expect((await cli(f, ['stop', 'bb'], f.root, env)).code).toBe(0);
    expect(await holder.exited).not.toBe(0);
    expect((await queued).code).toBe(0);
  } finally {
    for (const child of [holder, pass]) child.kill('SIGKILL');
    f.clean();
  }
});

// bb's land check exits while a worker it left in its scope ignores TERM for 3s, then bb's land
// ends, by stop or on its own. aa's queued check must not start before that scope is gone.
async function drainingScope(stop: boolean): Promise<void> {
  const f: Fixture = await fixture();
  const holder = Bun.spawn(['sleep', '300']);
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const path: string = leaf(f, 'aa', 'implement');
    const land: string = leaf(f, 'bb', 'merge', {
      merge_stamp: '2026-10-19T00:00:00.000Z',
      batch: { attempt: 'a9', built_on: 'base', holder: { base: 'base', head: 'head' }, applied: true },
    });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    writeRun(f, 'hold-bb', {
      leaf: 'bb',
      state: 'live',
      attempt: 'a9',
      land: true,
      since: '2020-01-01T00:00:00.000Z',
      pid: holder.pid,
    });
    const started: string = resolve(f.home, 'started');
    const drained: string = resolve(f.home, 'drained');
    const bin: string = stubSystemctl(f, [
      `*'stop ${slice}') kill ${holder.pid}; exit 0 ;;`,
      `*'stop akrogon-run-'*'.scope') [ -e '${drained}' ] || { sleep 3; touch '${drained}'; }; exit 0 ;;`,
      `*'stop akrogon-run-'*'-guard.service') exit 0 ;;`,
    ]);
    const env: NodeJS.ProcessEnv = { ...systemctl.env, PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}` };
    const queued: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'test', '-e', drained],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    const check: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', land, '--name', 'c', '--', 'touch', started],
      f.root,
      env,
    );
    while (!existsSync(started)) {
      if (Date.now() > deadline) throw new Error('bb check never ran');
      await Bun.sleep(50);
    }
    if (stop) expect((await cli(f, ['stop', 'bb'], f.root, env)).code).toBe(0);
    else holder.kill();
    expect(await holder.exited).not.toBe(0);
    expect((await queued).code).toBe(0);
    await check;
  } finally {
    holder.kill('SIGKILL');
    f.clean();
  }
}

test("a land check's draining scope keeps the repo line held after its land ends", async () => {
  await drainingScope(false);
});

test("a land check's draining scope keeps the repo line held through stop", async () => {
  await drainingScope(true);
});

// cgroup.events of a slice, or of a unit in it, under the fixture's cgroup root.
function cgroupEvents(f: Fixture, slice: string, unit: string = ''): string {
  return resolve(cgroupRoot(f), relative(hostCgroupRoot(), sliceCgroup(slice)), unit, 'cgroup.events');
}

// The cgroup holds a process until something writes populated 0.
function populate(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, 'populated 1\nfrozen 0\n');
}

// A systemd-run that, like systemd, gives each run scope a cgroup in akrogon-land.slice that stays
// populated until the scope is stopped, and runs each guard's script in the background.
function cgroupRunner(f: Fixture): void {
  const dir: string = dirname(cgroupEvents(f, 'akrogon-land.slice'));
  const path: string = resolve(unitBin(f), 'systemd-run');
  rmSync(path);
  writeFileSync(
    path,
    [
      '#!/bin/sh',
      "unit=''; scope=no",
      'for arg; do case $arg in --unit=*) unit=${arg#--unit=} ;; --scope) scope=yes ;; esac; done',
      'case $unit in',
      '*-guard)',
      '  while [ "$1" != -- ]; do shift; done; shift',
      '  "$@" </dev/null >/dev/null 2>&1 &',
      '  exit 0 ;;',
      'esac',
      `[ $scope = yes ] && mkdir -p '${dir}'/$unit.scope && printf 'populated 1\\n' > '${dir}'/$unit.scope/cgroup.events`,
      `exec '${resolve(import.meta.dir, 'fake-systemd-run.sh')}' "$@"`,
      '',
    ].join('\n'),
  );
  chmodSync(path, 0o755);
}

// bb's land check ends, by exiting or by SIGKILL, while its scope refuses its stop and still holds a
// process. akrogon stop of bb must fail, and aa's queued check must not start, until a later stop
// goes through. The land hold's own units are never started, so only the check's units refuse.
async function refusedScope(kill: boolean): Promise<void> {
  const f: Fixture = await fixture();
  const holder = Bun.spawn(['sleep', '300']);
  const worker: string = resolve(f.home, 'worker.pid');
  let workerPid: number | null = null;
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    cgroupRunner(f);
    const path: string = leaf(f, 'aa', 'implement');
    const land: string = leaf(f, 'bb', 'merge', {
      merge_stamp: '2026-10-19T00:00:00.000Z',
      batch: { attempt: 'a9', built_on: 'base', holder: { base: 'base', head: 'head' }, applied: true },
    });
    writeRun(f, 'hold-bb', {
      leaf: 'bb',
      state: 'live',
      attempt: 'a9',
      land: true,
      since: '2020-01-01T00:00:00.000Z',
      pid: holder.pid,
    });
    const scopes: string = dirname(cgroupEvents(f, 'akrogon-land.slice'));
    const deny: string = resolve(f.home, 'deny');
    const drained: string = resolve(f.home, 'drained');
    writeFileSync(deny, '');
    const bin: string = stubSystemctl(f, [
      `*'akrogon-run-hold-'*) ;;`,
      `*'stop akrogon-run-'*) [ -e '${deny}' ] && { echo 'Access denied' >&2; exit 1; }; for unit; do :; done; [ -d '${scopes}'/$unit ] && printf 'populated 0\\n' > '${scopes}'/$unit/cgroup.events; touch '${drained}'; exit 0 ;;`,
    ]);
    const env: NodeJS.ProcessEnv = {
      ...systemctl.env,
      AKROGON_CGROUP_ROOT: cgroupRoot(f),
      AKROGON_RUN_SLICE: 'akrogon-land.slice',
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    };
    const queued: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'test', '-e', drained],
      f.root,
      env,
    );
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    if (kill) {
      const check = Bun.spawn(
        [
          process.execPath,
          entry,
          'run-check',
          '--leaf',
          land,
          '--name',
          'c',
          '--',
          'sh',
          '-c',
          `echo $$ > '${worker}.tmp'; mv '${worker}.tmp' '${worker}'; exec sleep 300`,
        ],
        {
          cwd: f.root,
          env: {
            ...process.env,
            AKROGON_HOME: f.home,
            HOME: f.home,
            HERDR_PANE_ID: '',
            AKROGON_RUN: '',
            AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
            AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
            ...env,
            PATH: `${unitBin(f)}:${env.PATH}`,
          },
          stdout: 'ignore',
          stderr: 'ignore',
        },
      );
      workerPid = z.coerce
        .number()
        .int()
        .positive()
        .parse(await readMarker(worker));
      check.kill('SIGKILL');
      await check.exited;
    } else {
      const check: Result = await cli(f, ['run-check', '--leaf', land, '--name', 'c', '--', 'true'], f.root, env);
      expect(check.code).not.toBe(0);
      expect(check.stderr).toContain('Access denied');
    }
    const stopped: Result = await cli(f, ['stop', 'bb'], f.root, env);
    expect(stopped.code).not.toBe(0);
    expect(stopped.stdout).not.toContain('stopped:');
    holder.kill();
    expect(await holder.exited).not.toBe(0);
    // The land, the check's wrapper and its guard are done, but the check's scope still holds a process.
    await Bun.sleep(2500);
    expect(runOf(f, 'aa')?.state).toBe('waiting');
    rmSync(deny);
    expect((await queued).code).toBe(0);
  } finally {
    holder.kill('SIGKILL');
    if (workerPid !== null) process.kill(workerPid, 'SIGKILL');
    f.clean();
  }
}

test('a land check whose scope refuses its stop keeps the repo line until a later stop goes through', async () => {
  await refusedScope(false);
});

test('a SIGKILLed land check whose scope refuses its stop keeps the repo line through its guard', async () => {
  await refusedScope(true);
});

test('a sweep whose stop was refused never brings back a record another sweep removed', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const [aa, bb] = ['aa', 'bb'].map((slug) => leaf(f, slug, 'implement'));
    const writer = Bun.spawn(['sleep', '300']);
    writeRun(f, 'dead', { leaf: 'cc', state: 'live', attempt: 'a1', pid: writer.pid });
    writer.kill('SIGKILL');
    await writer.exited;
    const events: string = cgroupEvents(f, 'akrogon-land.slice', 'akrogon-run-dead.scope');
    populate(events);
    // The first sweep's stop is held, then refused; a later sweep's stop goes through.
    const held: string = resolve(f.home, 'held');
    const release: string = resolve(f.home, 'release');
    const bin: string = stubSystemctl(f, [
      `*'stop akrogon-run-dead.scope') mkdir '${resolve(f.home, 'first')}' 2>/dev/null && { touch '${held}'; while [ ! -e '${release}' ]; do sleep 0.05; done; echo 'Access denied' >&2; exit 1; }; printf 'populated 0\\n' > '${events}'; exit 0 ;;`,
    ]);
    const env: NodeJS.ProcessEnv = {
      ...systemctl.env,
      AKROGON_CGROUP_ROOT: cgroupRoot(f),
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    };
    const first: Promise<Result> = cli(f, ['run-check', '--leaf', aa, '--name', 'a', '--', 'true'], f.root, env);
    const deadline: number = Date.now() + WAIT_MS;
    while (!existsSync(held)) {
      if (Date.now() > deadline) throw new Error('first sweep never stopped the scope');
      await Bun.sleep(50);
    }
    expect((await cli(f, ['run-check', '--leaf', bb, '--name', 'b', '--', 'true'], f.root, env)).code).toBe(0);
    expect(existsSync(resolve(f.home, 'runs', 'dead.yaml'))).toBe(false);
    writeFileSync(release, '');
    expect((await first).code).toBe(0);
    expect(existsSync(resolve(f.home, 'runs', 'dead.yaml'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a slice cgroup resolves the root slice to the user manager and nests other slices by name', () => {
  const uid: number = process.getuid!();
  const manager: string = `user.slice/user-${uid}.slice/user@${uid}.service`;
  expect(
    ['-.slice', 'akrogon.slice', 'akrogon-land.slice'].map((slice) => relative(hostCgroupRoot(), sliceCgroup(slice))),
  ).toEqual([manager, `${manager}/akrogon.slice`, `${manager}/akrogon.slice/akrogon-land.slice`]);
});

test("a dead check's guard that still runs keeps the repo line, since its scope may yet launch", async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const path: string = leaf(f, 'aa', 'implement');
    const [holder, writer] = [0, 1].map(() => Bun.spawn(['sleep', '300']));
    const since: string = '2020-01-01T00:00:00.000Z';
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, since, pid: holder.pid });
    writeRun(f, 'check-bb', { leaf: 'bb', state: 'live', attempt: 'a9', since, pid: writer.pid });
    for (const child of [holder, writer]) {
      child.kill('SIGKILL');
      await child.exited;
    }
    // The check's wrapper is gone and its scope never launched, but its guard still runs.
    const guard: string = cgroupEvents(f, 'akrogon-land.slice', 'akrogon-run-check-bb-guard.service');
    populate(guard);
    const deny: string = resolve(f.home, 'deny');
    writeFileSync(deny, '');
    const bin: string = stubSystemctl(f, [
      `*'stop akrogon-run-check-bb-guard.service') [ -e '${deny}' ] && { echo 'Access denied' >&2; exit 1; }; printf 'populated 0\\n' > '${guard}'; exit 0 ;;`,
    ]);
    const queued: Promise<Result> = cli(f, ['run-check', '--leaf', path, '--name', 'q', '--', 'true'], f.root, {
      ...systemctl.env,
      AKROGON_CGROUP_ROOT: cgroupRoot(f),
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    const deadline: number = Date.now() + WAIT_MS;
    while (runOf(f, 'aa')?.state !== 'waiting') {
      if (Date.now() > deadline) throw new Error('aa check never queued');
      await Bun.sleep(50);
    }
    await Bun.sleep(2500);
    expect(runOf(f, 'aa')?.state).toBe('waiting');
    rmSync(deny);
    expect((await queued).code).toBe(0);
  } finally {
    f.clean();
  }
});

test('stop pins the user bus for the leaf slice when the caller has a cut one', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    const runtime: string = resolve(f.home, 'run');
    const bin: string = stubSystemctl(f, [
      `*'stop ${slice}') [ "$DBUS_SESSION_BUS_ADDRESS" = 'unix:path=${runtime}/bus' ] || { echo 'Failed to connect to bus' >&2; exit 1; } ;;`,
    ]);
    const stopped: Result = await cli(f, ['stop', 'bb'], f.root, {
      ...systemctl.env,
      DBUS_SESSION_BUS_ADDRESS: `unix:path=${resolve(f.home, 'cut-bus')}`,
      XDG_RUNTIME_DIR: runtime,
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.stderr).not.toContain('Failed to connect to bus');
    expect(stopped.code).toBe(0);
    expect(stopped.stdout).toContain('stopped:');
  } finally {
    f.clean();
  }
});

test('stop hands systemctl the runtime directory its fallback bus came from when XDG_RUNTIME_DIR is blank', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    const runtime: string = `/run/user/${process.getuid!()}`;
    const bin: string = stubSystemctl(f, [
      `*'stop ${slice}') [ "$XDG_RUNTIME_DIR" = '${runtime}' ] && [ "$DBUS_SESSION_BUS_ADDRESS" = 'unix:path=${runtime}/bus' ] || { echo 'Failed to connect to bus' >&2; exit 1; } ;;`,
    ]);
    const stopped: Result = await cli(f, ['stop', 'bb'], f.root, {
      ...systemctl.env,
      DBUS_SESSION_BUS_ADDRESS: `unix:path=${resolve(f.home, 'cut-bus')}`,
      XDG_RUNTIME_DIR: '',
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.stderr).not.toContain('Failed to connect to bus');
    expect(stopped.code).toBe(0);
  } finally {
    f.clean();
  }
});

test('stop-run stops its scope with a cut bus and a blank XDG_RUNTIME_DIR', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    writeRun(f, 'cut', { leaf: 'bb', state: 'live', attempt: 'a1' });
    const runtime: string = `/run/user/${process.getuid!()}`;
    const bin: string = stubSystemctl(f, [
      `*'stop akrogon-run-cut.scope'*) [ "$XDG_RUNTIME_DIR" = '${runtime}' ] && [ "$DBUS_SESSION_BUS_ADDRESS" = 'unix:path=${runtime}/bus' ] && exit 0; echo 'Failed to connect to bus' >&2; exit 1 ;;`,
    ]);
    const stopped: Result = await cli(f, ['stop-run', 'cut'], f.root, {
      ...systemctl.env,
      AKROGON_SCOPE: 'akrogon-verify-pass-aa.service',
      DBUS_SESSION_BUS_ADDRESS: `unix:path=${resolve(f.home, 'cut-bus')}`,
      XDG_RUNTIME_DIR: '',
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.stderr).not.toContain('Failed to connect to bus');
    expect(stopped.code).toBe(0);
  } finally {
    f.clean();
  }
});

test("a dead writer's record stays live when its scope starts between the liveness reads as its guard exits", async () => {
  const f: Fixture = await fixture();
  const before: string | undefined = process.env.AKROGON_CGROUP_ROOT;
  try {
    process.env.AKROGON_CGROUP_ROOT = cgroupRoot(f);
    const slice: string = 'akrogon-land.slice';
    const run: string = 'interleave';
    const guard: string = cgroupEvents(f, slice, `${runUnitBase(run)}-guard.service`);
    const scope: string = cgroupEvents(f, slice, `${runUnitBase(run)}.scope`);
    mkdirSync(dirname(guard), { recursive: true });
    expect(await Bun.spawn(['mkfifo', guard]).exited).toBe(0);
    // The scope starts while the guard read is pending, then the guard exits.
    const exit: Bun.Subprocess = Bun.spawn([
      'sh',
      '-c',
      `sleep 0.5; mkdir -p "${dirname(scope)}"; echo 'populated 1' > "${scope}"; echo 'populated 0' > "${guard}"`,
    ]);
    const record: Parameters<typeof ownLive>[0] = {
      boot_id: bootId(),
      pid: process.pid,
      start_time: 'not-this-process',
      slice,
      unit: `${runUnitBase(run)}.scope`,
      run,
    };
    expect(ownLive(record, bootId())).toBe(true);
    expect(await exit.exited).toBe(0);
  } finally {
    if (before === undefined) delete process.env.AKROGON_CGROUP_ROOT;
    else process.env.AKROGON_CGROUP_ROOT = before;
    f.clean();
  }
});

test('a refused slice stop touches no run record and leaves the state lock free for the retry', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true });
    const hold: string = resolve(f.home, 'runs', 'hold-bb.yaml');
    const bin: string = stubSystemctl(f, [
      `*'stop ${slice}') echo 'Failed to stop ${slice}: Access denied' >&2; exit 1 ;;`,
    ]);
    const refused: Result = await cli(f, ['stop', 'bb'], f.root, {
      ...systemctl.env,
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('Access denied');
    expect(Bun.YAML.parse(readFileSync(hold, 'utf8'))).not.toHaveProperty('cancel');
    expect(await Bun.spawn(['flock', '-n', resolve(f.home, '.lock'), 'true']).exited).toBe(0);
    const retried: Result = await cli(f, ['stop', 'bb'], f.root, {
      ...systemctl.env,
      PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(retried.code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(hold, 'utf8'))).toHaveProperty('cancel', true);
  } finally {
    f.clean();
  }
});

test('stop completes the teardown when the land exits while it runs', async () => {
  const f: Fixture = await fixture();
  const [holder, pass] = [0, 1].map(() => Bun.spawn(['sleep', '300']));
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    leaf(f, 'bb', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    const slice: string = leafSlice({ name: f.repo }, 'bb', f.home);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, pid: holder.pid });
    await writePass(f, 'bb', 'a9', pass.pid);
    // Any call that reaches the land unit finds it already exited and unloaded.
    const bin: string = stubSystemctl(f, [
      `*'akrogon-land-a9.service'*) kill -KILL ${holder.pid}; echo 'Unit akrogon-land-a9.service not loaded.' >&2; exit 1 ;;`,
      `*'stop ${slice}') kill ${holder.pid}; exit 0 ;;`,
      `*'stop akrogon-verify-pass-bb') kill ${pass.pid}; exit 0 ;;`,
    ]);
    const stopped: Result = await cli(f, ['stop', 'bb'], f.root, {
      ...systemctl.env,
      PATH: `${bin}:${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.code).toBe(0);
    expect(await pass.exited).not.toBe(0);
  } finally {
    for (const child of [holder, pass]) child.kill('SIGKILL');
    f.clean();
  }
});

test('a check of a leaf whose land hold stop has marked is cancelled when it arrives', async () => {
  const f: Fixture = await fixture();
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    const path: string = leaf(f, 'bb', 'implement');
    writeRun(f, 'hold-bb', { leaf: 'bb', state: 'live', attempt: 'a9', land: true, since: '2020-01-01T00:00:00.000Z' });
    const hold: string = resolve(f.home, 'runs', 'hold-bb.yaml');
    writeFileSync(
      hold,
      Bun.YAML.stringify({
        ...z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(hold, 'utf8'))),
        cancel: true,
      }),
    );
    const marker: string = resolve(f.home, 'launched');
    const arrived: Promise<Result> = cli(
      f,
      ['run-check', '--leaf', path, '--name', 'q', '--', 'touch', marker],
      f.root,
      {
        ...systemctl.env,
        PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
      },
    );
    const finished: Result | 'hung' = await Promise.race([arrived, Bun.sleep(20_000).then((): 'hung' => 'hung')]);
    rmSync(hold);
    expect(finished === 'hung' ? 'hung' : finished.stderr).toContain('cancelled by akrogon stop');
    expect(existsSync(marker)).toBe(false);
    await arrived;
  } finally {
    f.clean();
  }
});

test('a stop retried after a refused unit stop still finds and stops the run', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'aa', 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
    writeRun(f, 'run-aa', { leaf: 'aa', state: 'live', attempt: 'a1' });
    populate(cgroupEvents(f, 'akrogon-land.slice', 'akrogon-run-run-aa.scope'));
    const bin: string = resolve(f.home, 'deny-bin');
    mkdirSync(bin);
    writeFileSync(
      resolve(bin, 'systemctl'),
      [
        '#!/bin/sh',
        'case "$*" in',
        "*'stop akrogon-run-run-aa.scope') echo 'Failed to stop akrogon-run-run-aa.scope: Access denied' >&2; exit 1 ;;",
        'esac',
        '',
      ].join('\n'),
    );
    chmodSync(resolve(bin, 'systemctl'), 0o755);
    const refused: Result = await cli(f, ['stop', 'aa'], f.root, {
      AKROGON_CGROUP_ROOT: cgroupRoot(f),
      PATH: `${bin}:${process.env.PATH}`,
    });
    expect(refused.code).not.toBe(0);
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    writeFileSync(
      systemctl.db,
      JSON.stringify({
        units: [
          leafSlice({ name: f.repo }, 'aa', f.home),
          'akrogon-run-run-aa.scope',
          'akrogon-run-run-aa-guard.service',
        ].map((unit) => ({ unit, sub: 'active' })),
      }),
    );
    const retried: Result = await cli(f, ['stop', 'aa'], f.root, {
      ...systemctl.env,
      PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(retried.code).toBe(0);
    expect(readFileSync(systemctl.log, 'utf8')).toContain('--user stop akrogon-run-run-aa.scope');
  } finally {
    f.clean();
  }
});
