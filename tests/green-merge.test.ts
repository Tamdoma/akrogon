import { test, expect } from 'bun:test';
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  cli,
  fakeHerdr,
  fakeSystemctl,
  fixture,
  leaf,
  procRoot,
  yaml,
  type Fixture,
  type SystemctlFixture,
} from './helpers';
import { OUTSIDE_CGROUP, expectedScope, expectedSlice, procDir, shellPid } from './fake-proc';
import { readState, saveState, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { leafSlice } from '../src/scope';
import type { Database } from './fake-herdr';

type GreenFixture = Fixture & { db: string; env: NodeJS.ProcessEnv; launches: string };

async function greenFixture(checks: Record<string, string>): Promise<GreenFixture> {
  const f: Fixture = await fixture();
  yaml(resolve(f.root, 'issues/config.yaml'), { checks, grounding: 'none' });
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const herdr = fakeHerdr(f);
  const launches: string = resolve(f.home, 'systemd-run.log');
  return { ...f, ...herdr, env: { ...herdr.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches };
}
function database(f: GreenFixture): Database {
  return JSON.parse(readFileSync(f.db, 'utf8')) as Database;
}
function saveDatabase(f: GreenFixture, db: Database): void {
  writeFileSync(f.db, JSON.stringify(db));
}
function prompts(f: GreenFixture, skill: string): Database['prompts'] {
  return database(f).prompts.filter((prompt) => prompt.text.startsWith(skill));
}
function landLaunches(f: GreenFixture): string[] {
  return existsSync(f.launches)
    ? readFileSync(f.launches, 'utf8')
        .split('\n')
        .filter((line) => line.includes('--unit=akrogon-land-'))
    : [];
}
function idleAll(f: GreenFixture): void {
  const db: Database = database(f);
  saveDatabase(f, { ...db, panes: db.panes.map((pane) => ({ ...pane, agent_status: 'idle' })) });
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
function verifyRuns(f: Fixture): { run: string; sha: string; commands: { exit: number }[] }[] {
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
  saveDatabase(f, { ...database(f), prompts: [] });
  idleAll(f);
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
    expect(readState(path).batch?.owner).toBe('command');
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
        repo: 'repo',
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
    f.clean();
  }
}, 60000);

test('a red verify is never pushed and wakes B once', async () => {
  const f: GreenFixture = await greenFixture({ bad: 'false' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const before: string = await remoteTip(f);
    const { attempt, top } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(before);
    const state: State = readState(path);
    expect(state.phase).toBe('merge');
    expect(state.batch).toMatchObject({ attempt, owner: 'seat', wake: 'red' });
    const red: string = z.string().parse(state.batch?.red);
    expect(verifyRuns(f).find((run) => run.run === red)?.commands[0].exit).toBe(1);
    expect(prompts(f, 'merge-issue')).toHaveLength(1);
    expect(prompts(f, 'merge-issue')[0].text).toContain(`attempt=${attempt} top=${top}`);
    expect(prompts(f, 'merge-issue')[0].text).toContain(`wake=red red=${red}`);
    const runs: number = verifyRuns(f).length;
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'merge-issue')).toHaveLength(1);
    expect(landLaunches(f)).toHaveLength(1);
    expect(verifyRuns(f)).toHaveLength(runs);
  } finally {
    f.clean();
  }
}, 60000);

test('an unrebaseable holder gets the solo prompt and no verify', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'file', 'holder version\n');
    writeFileSync(resolve(f.root, 'file'), 'main version\n');
    await command(['git', 'add', 'file'], f.root);
    await command(['git', 'commit', '-m', 'main file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    toMerge(path);
    saveDatabase(f, { ...database(f), prompts: [] });
    idleAll(f);
    expect((await next(f)).code).toBe(0);
    const attempt: string = z.string().parse(readState(path).batch?.attempt);
    expect(prompts(f, 'merge-issue')).toHaveLength(1);
    expect(prompts(f, 'merge-issue')[0].text).toContain(`attempt=${attempt} solo`);
    expect(landLaunches(f)).toEqual([]);
    expect(verifyRuns(f)).toEqual([]);
  } finally {
    f.clean();
  }
}, 60000);

test('a gate refusal records the refusal and wakes B', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    mkdirSync(resolve(f.root, 'tests'), { recursive: true });
    writeFileSync(resolve(f.root, 'tests/x.test.ts'), 'one\n');
    await command(['git', 'add', 'tests/x.test.ts'], f.root);
    await command(['git', 'commit', '-m', 'test file'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'tests/x.test.ts', 'two\n', 'uncited test change');
    toMerge(path);
    const before: string = await remoteTip(f);
    const { attempt } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    expect(await remoteTip(f)).toBe(before);
    const state: State = readState(path);
    expect(state.phase).toBe('merge');
    expect(state.batch).toMatchObject({ owner: 'seat', wake: 'gate' });
    expect(state.batch?.refusal).toContain('tests/x.test.ts');
    expect(prompts(f, 'merge-issue')).toHaveLength(1);
    expect(prompts(f, 'merge-issue')[0].text).toContain('wake=gate');
  } finally {
    f.clean();
  }
}, 60000);

test('a clean restack is verified and pushed again with no seat', async () => {
  const f: Fixture = await fixture();
  const script: string = await advancer(f, 'adv-file', 'adv');
  const mark: string = resolve(f.home, 'advanced');
  const g: GreenFixture = await (async () => {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { adv: `sh -c '[ -e ${mark} ] || { touch ${mark} && ${script}; }'` },
      grounding: 'none',
    });
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'checks'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const herdr = fakeHerdr(f);
    const launches: string = resolve(f.home, 'systemd-run.log');
    return { ...f, ...herdr, env: { ...herdr.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches };
  })();
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
    g.clean();
  }
}, 90000);

async function pushEnding(
  ending: 'second refusal' | 'manual rebase' | 'push error',
): Promise<{ state: State; prompt: string; holderOnMain: boolean }> {
  const f: Fixture = await fixture();
  const mark: string = resolve(f.home, 'advanced');
  const script: string =
    ending === 'manual rebase' ? await advancer(f, 'aa-file', 'other') : await advancer(f, 'adv-file', 'adv');
  const check: string =
    ending === 'second refusal' ? `sh -c '${script}'` : `sh -c '[ -e ${mark} ] || { touch ${mark} && ${script}; }'`;
  yaml(resolve(f.root, 'issues/config.yaml'), {
    checks: ending === 'push error' ? { ok: 'true' } : { adv: check },
    grounding: 'none',
  });
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'checks'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
  const herdr = fakeHerdr(f);
  const launches: string = resolve(f.home, 'systemd-run.log');
  const g: GreenFixture = { ...f, ...herdr, env: { ...herdr.env, FAKE_SYSTEMD_RUN_LOG: launches }, launches };
  try {
    const path: string = await allocated(g, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(g, path);
    if (ending === 'push error') {
      const hook: string = resolve(f.home, 'remote.git/hooks/pre-receive');
      writeFileSync(hook, '#!/bin/sh\necho blocked by hook >&2\nexit 1\n');
      chmodSync(hook, 0o755);
    }
    expect((await land(g, 'aa', attempt)).code).toBe(0);
    const head: string = await command(['git', 'rev-parse', 'refs/heads/aa'], g.root);
    const contains: Result = await run([
      'git',
      '--git-dir',
      resolve(f.home, 'remote.git'),
      'branch',
      '--contains',
      head,
    ]);
    const holderOnMain: boolean = contains.code === 0 && contains.stdout !== '';
    const merge: Database['prompts'] = prompts(g, 'merge-issue');
    expect(merge).toHaveLength(1);
    return { state: readState(path), prompt: merge[0].text, holderOnMain };
  } finally {
    g.clean();
  }
}

test('a second refusal, a manual rebase or a push error wakes B and pushes nothing more', async () => {
  const second = await pushEnding('second refusal');
  expect(second.state.phase).toBe('merge');
  expect(second.state.batch).toMatchObject({ owner: 'seat', wake: 'push' });
  expect(second.prompt).toContain('wake=push');
  expect(second.holderOnMain).toBe(false);
  const rebase = await pushEnding('manual rebase');
  expect(rebase.state.phase).toBe('merge');
  expect(rebase.state.batch?.owner).toBe('seat');
  expect(rebase.prompt).toContain('solo');
  expect(rebase.holderOnMain).toBe(false);
  const error = await pushEnding('push error');
  expect(error.state.phase).toBe('merge');
  expect(error.state.batch).toMatchObject({ owner: 'seat', wake: 'push' });
  expect(error.state.batch?.refusal).toContain('blocked by hook');
  expect(error.prompt).toContain('wake=push');
  expect(error.holderOnMain).toBe(false);
}, 180000);

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
    expect(prompts(f, 'broadcast-issue')[0].text).toContain('owner=issue:issue-aa');
    expect(prompts(f, 'merge-issue')).toEqual([]);
    idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    // A crash after the owner closed and before the seat started leaves an undispatched handoff.
    saveState(closed, { ...readState(closed), prompted: {}, prompted_at: {} });
    idleAll(f);
    expect((await next(f)).code).toBe(0);
    idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(2);
  } finally {
    f.clean();
  }
}, 60000);

test('a live land run is left alone, a dead one resumes, and a seat-owned attempt stays with B', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    f.env = { ...f.env, ...systemctl.env };
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt, top } = await claimed(f, path);
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
    const state: State = readState(path);
    saveState(path, { ...state, batch: { ...state.batch!, owner: 'seat', wake: 'gate', refusal: 'seeded' } });
    expect((await next(f)).code).toBe(0);
    expect(landLaunches(f)).toHaveLength(2);
    expect(prompts(f, 'merge-issue')).toHaveLength(1);
    expect(prompts(f, 'merge-issue')[0].text).toContain(`attempt=${attempt} top=${top} wake=gate`);
  } finally {
    f.clean();
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
    f.clean();
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
        owner: 'command',
      },
    });
    const slice: string = leafSlice({ name: 'repo' }, 'aa');
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: slice, sub: 'active' }] }));
    const stopped: Result = await cli(f, ['stop', '--all'], f.root, {
      ...systemctl.env,
      PATH: `${resolve(f.home, 'bin')}:${process.env.PATH}`,
    });
    expect(stopped.code).toBe(0);
    expect(readFileSync(systemctl.log, 'utf8')).toContain(`stop ${slice}`);
    expect(readFileSync(resolve(f.home, 'stopped.yaml'), 'utf8')).toContain('repo/aa');
  } finally {
    f.clean();
  }
});

test('a pending broadcast recreates a live recorded B outside its scope before prompting it', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(f, path);
    const before: State = readState(path);
    const oldB: string = z.string().parse(before.pane.B);
    writeFileSync(resolve(procDir(procRoot(f), shellPid(oldB)), 'cgroup'), OUTSIDE_CGROUP + '\n');
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const closed: string = moved(path);
    const state: State = readState(closed);
    const sent: Database['prompts'] = prompts(f, 'broadcast-issue');
    expect(sent).toHaveLength(1);
    const newB: string = z.string().parse(state.pane.B);
    expect(newB).not.toBe(oldB);
    expect(sent[0].pane).toBe(newB);
    expect(sent[0].text).toContain('owner=issue:issue-aa');
    const db: Database = database(f);
    expect(db.panes.some((pane) => pane.pane_id === oldB)).toBe(false);
    expect(db.panes.some((pane) => pane.pane_id === newB)).toBe(true);
    expect(state.pane.A).toBe(before.pane.A);
    const slice: string = expectedSlice('repo', 'aa');
    const fresh = db.startCgroups.filter((start) => start.pane === newB);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].cgroup.endsWith(`/${slice}/${expectedScope(slice, newB)}`)).toBe(true);
  } finally {
    f.clean();
  }
}, 60000);

test('next keeps a working broadcast seat until it finishes', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    const { attempt } = await claimed(f, path);
    expect((await land(f, 'aa', attempt)).code).toBe(0);
    const closed: string = moved(path);
    const state: State = readState(closed);
    expect(database(f).panes.find((pane) => pane.pane_id === state.pane.B)?.agent_status).toBe('working');
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(database(f).panes.some((pane) => pane.pane_id === state.pane.B)).toBe(true);
    expect(existsSync(z.string().parse(state.worktree))).toBe(true);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
    idleAll(f);
    expect((await next(f)).code).toBe(0);
    expect((await next(f)).code).toBe(0);
    expect(database(f).panes.some((pane) => pane.pane_id === state.pane.B)).toBe(false);
    expect(prompts(f, 'broadcast-issue')).toHaveLength(1);
  } finally {
    f.clean();
  }
}, 60000);

test('next preserves a live command attempt while its refused push restacks', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const systemctl: SystemctlFixture = fakeSystemctl(f);
    f.env = { ...f.env, ...systemctl.env };
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
    f.clean();
  }
}, 60000);

test('the land service keeps the named Herdr socket without a seat identity', async () => {
  const f: GreenFixture = await greenFixture({ ok: 'true' });
  try {
    const socket: string = resolve(f.home, 'sessions/infra/herdr.sock');
    f.env = { ...f.env, HERDR_SOCKET_PATH: socket };
    const path: string = await allocated(f, 'aa', 'issue-aa');
    await commitIn(path, 'aa-file', 'aa\n');
    toMerge(path);
    await claimed(f, path);
    expect(landLaunches(f)).toHaveLength(1);
    expect(landLaunches(f)[0]).toContain(`--setenv=HERDR_SOCKET_PATH=${socket}`);
    expect(landLaunches(f)[0]).not.toContain('HERDR_PANE_ID');
  } finally {
    f.clean();
  }
}, 60000);
