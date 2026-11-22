import { test, expect } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, procFixture, fixture, greenReceipt, leaf, seedRun, type Fixture } from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch } from '../src/state';
import { command, spawnCaptured, type Result } from '../src/shell';
import { verifyCommands, type VerifyRun } from '../src/verify';

const stale: { name: string; command: string }[] = [{ name: 'test', command: 'bun test --old' }];

async function branch(f: Fixture, slug: string): Promise<{ worktree: string; head: string }> {
  const worktree: string = resolve(f.home, slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree], f.root);
  writeFileSync(resolve(worktree, 'code.ts'), 'x\n');
  await command(['git', 'add', 'code.ts'], worktree);
  await command(['git', 'commit', '-m', 'code'], worktree);
  return { worktree, head: await command(['git', 'rev-parse', 'HEAD'], worktree) };
}

// Runs the land run's gates for the leaf's batch in a child process: the same
// refusal `merged --check` used to carry, now reached by `akrogon land`.
async function gateRun(f: Fixture, slug: string): Promise<Result> {
  const script: string = resolve(f.home, 'gates.ts');
  writeFileSync(
    script,
    'import { landGates } from ' +
      JSON.stringify(resolve(import.meta.dir, '../src/phase.ts')) +
      ';\nimport { findLeaf } from ' +
      JSON.stringify(resolve(import.meta.dir, '../src/state.ts')) +
      ';\nimport { readRepo } from ' +
      JSON.stringify(resolve(import.meta.dir, '../src/config.ts')) +
      ';\nconst repo = readRepo(process.argv[2], process.cwd());\nconst leaf = findLeaf(repo, process.argv[3]);\nawait landGates(repo, leaf, leaf.state.batch);\nconsole.log("gates ok");\n',
  );
  return spawnCaptured([process.execPath, script, f.repo, slug], {
    cwd: f.root,
    env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home },
  });
}

test('a move into check.review needs a green leaf receipt for HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'gated');
    const path: string = leaf(f, 'gated', 'implement', { worktree });
    const move: string[] = ['phase', 'gated', 'check.review', '--slot', 'A'];
    const missing: Result = await cli(f, move);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green leaf verify receipt for ${head}`);
    greenReceipt(f, head, 'leaf', stale);
    const mismatched: Result = await cli(f, move);
    expect(mismatched.code).not.toBe(0);
    expect(mismatched.stderr).toContain('No green leaf verify receipt');
    expect(readState(path).phase).toBe('implement');
    greenReceipt(f, head, 'leaf');
    expect((await cli(f, move)).code).toBe(0);
    expect(readState(path).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('a repair move into merge needs a green leaf receipt for HEAD while check.fix takes none', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'repaired');
    const path: string = leaf(f, 'repaired', 'check.repair', { worktree });
    const move: string[] = ['phase', 'repaired', 'merge', '--slot', 'B'];
    const missing: Result = await cli(f, move);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green leaf verify receipt for ${head}`);
    expect(readState(path).phase).toBe('check.repair');
    const handedWorktree: { worktree: string } = await branch(f, 'handed');
    const handedPath: string = leaf(f, 'handed', 'check.repair', { worktree: handedWorktree.worktree });
    const handedMove: string[] = ['phase', 'handed', 'check.fix', '--slot', 'B'];
    expect((await cli(f, handedMove)).code).toBe(0);
    expect(readState(handedPath).phase).toBe('check.fix');
    greenReceipt(f, head, 'leaf');
    expect((await cli(f, move)).code).toBe(0);
    expect(readState(path).phase).toBe('merge');
  } finally {
    f.clean();
  }
});

test('the land gates stamp tested_top only with a green merge receipt for HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'landing');
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const path: string = leaf(f, 'landing', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' });
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: builtOn, head },
      applied: true,
    };
    saveState(path, { ...readState(path), batch: record });
    const missing: Result = await gateRun(f, 'landing');
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green merge verify receipt for ${head}`);
    greenReceipt(f, head, 'merge', stale);
    const mismatched: Result = await gateRun(f, 'landing');
    expect(mismatched.code).not.toBe(0);
    expect(readState(path).batch?.tested_top).toBeUndefined();
    greenReceipt(f, head, 'merge');
    expect((await gateRun(f, 'landing')).code).toBe(0);
    expect(readState(path).batch?.tested_top).toBe(head);
  } finally {
    f.clean();
  }
});

test('a qualifying linked pair satisfies the merge gates and a non-qualifying pair refuses them', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'landing');
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const path: string = leaf(f, 'landing', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' });
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: builtOn, head },
      applied: true,
    };
    saveState(path, { ...readState(path), batch: record });
    const tree: string = await command(['git', 'rev-parse', `${head}^{tree}`], f.root);
    const baseTree: string = await command(['git', 'rev-parse', `${builtOn}^{tree}`], f.root);
    const cmds: { name: string; command: string }[] = verifyCommands(readRepo(f.repo, f.root).config, 'merge');
    mkdirSync(resolve(path, 'implementation'), { recursive: true });
    const pair = (baseLog: string, rerun?: { log: string; failures: string[] }): void => {
      const headLog: string = resolve(path, 'implementation/check-test-head.log');
      writeFileSync(headLog, '(fail) alpha\n');
      const headRun: VerifyRun = seedRun(f, {
        sha: head,
        tree,
        scope: 'merge',
        commands: cmds.map((item) =>
          rerun === undefined
            ? { ...item, exit: 1, log: headLog }
            : { ...item, exit: 1, log: rerun.log, failures: rerun.failures, rerun: { exit: 1, log: headLog } },
        ),
      });
      seedRun(f, {
        sha: builtOn,
        tree: baseTree,
        scope: 'merge',
        compares: headRun.run,
        commands: cmds.map((item) => ({ ...item, exit: 1, log: baseLog })),
      });
    };
    const guards = async (): Promise<Result> =>
      spawnCaptured(
        [
          process.execPath,
          resolve(import.meta.dir, '../skills/chart-issues/scripts/direct-guards.ts'),
          worktree,
          f.repo,
          resolve(f.home, 'chart'),
        ],
        { env: { ...process.env, AKROGON_HOME: f.home } },
      );
    const headOnly: string = resolve(path, 'implementation/check-test-base.log');
    writeFileSync(headOnly, '(fail) beta\n');
    pair(headOnly);
    const refused1: Result = await gateRun(f, 'landing');
    expect(refused1.code).not.toBe(0);
    expect(refused1.stderr).toContain(`No green merge verify receipt for ${head}`);
    expect(readState(path).batch?.tested_top).toBeUndefined();
    expect((await guards()).code).not.toBe(0);
    // A rerun row's log names only the rerun's reds; its stored failures decide the cover.
    pair(headOnly, { log: headOnly, failures: ['alpha'] });
    expect((await gateRun(f, 'landing')).code).not.toBe(0);
    const same: string = resolve(path, 'implementation/check-test-base-same.log');
    writeFileSync(same, '(fail) alpha\n');
    pair(same);
    expect((await gateRun(f, 'landing')).code).toBe(0);
    expect(readState(path).batch?.tested_top).toBe(head);
    const passed: Result = await guards();
    expect(passed.stderr).toBe('');
    expect(passed.code).toBe(0);
  } finally {
    f.clean();
  }
});

// The merge gates take a covered main-red head for green: a completed red run
// whose every failing unit is named and already an unresolved red on main from
// a completed base run at or before the head's merge-base.
test('merge gates accept a covered main-red head and refuse an uncovered or resolved one', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'landing');
    const builtOn: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    // Each landing leaf gets its own container: a moved leaf leaves
    // issues/closed/<container>, which twin-blocks later siblings in it.
    const path: string = leaf(f, 'landing', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' }, 'cov1');
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: builtOn, head },
      applied: true,
      top: head,
    };
    saveState(path, { ...readState(path), batch: record });
    const tree: string = await command(['git', 'rev-parse', `${head}^{tree}`], f.root);
    const baseTree: string = await command(['git', 'rev-parse', `${builtOn}^{tree}`], f.root);
    const repo: Repo = readRepo(f.repo, f.root);
    const cmds: { name: string; command: string }[] = verifyCommands(repo.config, 'merge');
    const entries = (exit: number, failures: string[]): VerifyRun['commands'] =>
      cmds.map((item) => ({
        ...item,
        exit,
        log: resolve(f.home, `gate-${exit}-${failures.join('-')}.log`),
        ...(failures.length === 0 ? {} : { failures }),
      }));
    const redHead = (failures: string[]): VerifyRun =>
      seedRun(f, { sha: head, tree, scope: 'merge', commands: entries(7, failures) });
    const redBase = (failures: string[]): VerifyRun =>
      seedRun(f, {
        sha: builtOn,
        tree: baseTree,
        scope: 'merge',
        compares: 'older-head',
        commands: entries(7, failures),
      });
    const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
    const guards = async (): Promise<Result> =>
      spawnCaptured(
        [
          process.execPath,
          resolve(import.meta.dir, '../skills/chart-issues/scripts/direct-guards.ts'),
          worktree,
          f.repo,
          resolve(f.home, 'chart'),
        ],
        { env: { ...process.env, AKROGON_HOME: f.home } },
      );
    const landPushBody: string =
      'import { landPush } from ' +
      JSON.stringify(resolve(import.meta.dir, '../src/phase.ts')) +
      ';\nimport { readRepo } from ' +
      JSON.stringify(resolve(import.meta.dir, '../src/config.ts')) +
      `;\ntry { const r = await landPush(readRepo(${JSON.stringify(f.repo)}, process.cwd()), process.argv[2], "a1"); console.log(JSON.stringify(r)); } catch (e) { console.error(e instanceof Error ? e.message : e); process.exit(1); }\n`;
    const landPushRun = async (slug: string): Promise<Result> => {
      const script: string = resolve(f.home, 'landpush.ts');
      writeFileSync(script, landPushBody);
      return spawnCaptured([process.execPath, script, slug], {
        cwd: f.root,
        env: { ...process.env, AKROGON_HOME: f.home, HOME: f.home },
      });
    };

    // Covered: named unit red in a completed base run at the merge-base.
    redHead(['alpha']);
    redBase(['alpha']);
    expect((await gateRun(f, 'landing')).code).toBe(0);
    expect(readState(path).batch?.tested_top).toBe(head);
    const passed: Result = await guards();
    expect(passed.stderr).toBe('');
    expect(passed.code).toBe(0);
    const pushed: Result = await landPushRun('landing');
    expect(pushed.stderr).toBe('');
    expect(JSON.parse(pushed.stdout.trim().split('\n').at(-1)!)).toEqual({ kind: 'landed' });

    // Uncovered: a second named unit no base run holds refuses the gate and the push.
    writeFileSync(file, '');
    const path2: string = leaf(f, 'landing2', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' }, 'cov2');
    saveState(path2, { ...readState(path2), batch: record });
    redHead(['alpha', 'beta']);
    redBase(['alpha']);
    const refused: Result = await gateRun(f, 'landing2');
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(`No green merge verify receipt for ${head}`);
    expect(readState(path2).batch?.tested_top).toBeUndefined();
    expect((await guards()).code).not.toBe(0);
    // batchPush's tested_top guard precedes the receipt read: stamp the top the
    // way recordTested would have, so the push reaches the receipt check.
    saveState(path2, { ...readState(path2), batch: { ...readState(path2).batch!, tested_top: head } });
    const pushRefused: Result = await landPushRun('landing2');
    expect(pushRefused.code).not.toBe(0);
    expect(pushRefused.stderr).toContain(`No green merge verify receipt for ${head}`);
    saveState(path2, { ...readState(path2), phase: 'implement', batch: undefined });

    // Resolved on main: a later landed run passes the command, so the base red
    // no longer covers the head.
    writeFileSync(file, '');
    const path3: string = leaf(f, 'landing3', 'merge', { worktree, merge_stamp: '2026-10-05T00:00:00.000Z' }, 'cov3');
    saveState(path3, { ...readState(path3), batch: record });
    redHead(['alpha']);
    redBase(['alpha']);
    seedRun(f, {
      sha: builtOn,
      tree: baseTree,
      scope: 'merge',
      start: '2999-01-01T00:00:00.000Z',
      end: '2999-01-01T00:00:00.000Z',
      commands: entries(0, []),
    });
    const resolved: Result = await gateRun(f, 'landing3');
    expect(resolved.code).not.toBe(0);
    expect(resolved.stderr).toContain(`No green merge verify receipt for ${head}`);
  } finally {
    f.clean();
  }
});

test('direct guards need a green merge receipt for the worktree HEAD under the current command set', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree, head } = await branch(f, 'direct');
    const run = async (): Promise<Result> =>
      spawnCaptured(
        [
          process.execPath,
          resolve(import.meta.dir, '../skills/chart-issues/scripts/direct-guards.ts'),
          worktree,
          f.repo,
          resolve(f.home, 'chart'),
        ],
        { env: { ...process.env, AKROGON_HOME: f.home } },
      );
    const missing: Result = await run();
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(`No green merge verify receipt for ${head}`);
    greenReceipt(f, head, 'merge', stale);
    expect((await run()).code).not.toBe(0);
    greenReceipt(f, head, 'merge');
    const passed: Result = await run();
    expect(passed.stderr).toBe('');
    expect(passed.code).toBe(0);
  } finally {
    f.clean();
  }
});
