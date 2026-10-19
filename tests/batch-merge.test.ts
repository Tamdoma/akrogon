import { test, expect, afterEach } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import {
  cli,
  fakeHerdr,
  fixture,
  leaf,
  leafTempRoot,
  yaml,
  editOnSecondStatus,
  type Fixture,
  type HerdrFixture,
  registerTemp,
  greenReceipt,
  verified,
} from './helpers';
import { readRepo, type Repo } from '../src/config';
import { readState, saveState, type Batch, type Leaf, type State } from '../src/state';
import { command, run, type Result } from '../src/shell';
import { applyTop, buildStack } from '../src/batch';

test.serial('restack preserves a holder retirement the union merge resurrects', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    process.env.HOME = f.home;
    const repo: Repo = readRepo('repo', f.root);
    const alpha: string = '- alpha. 2026-10-09. history/alpha.md\n';
    const beta: string = '- beta. 2026-10-09. history/beta.md\n';
    const gamma: string = '- gamma. 2026-10-10. history/gamma.md\n';
    const delta: string = '- delta. 2026-10-10. history/delta.md\n';
    const recurrence: string = '- new recurrence. 2026-10-10. history/alpha.md\n';
    mkdirSync(resolve(f.root, 'learnings/history'), { recursive: true });
    writeFileSync(resolve(f.root, '.gitattributes'), 'learnings/LESSONS.md merge=union\n');
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + beta);
    writeFileSync(resolve(f.root, 'learnings/history/alpha.md'), '# alpha\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'lessons'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const guardBase: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const held: Branch = await branchAt(f, 'holder', guardBase, 'file-holder', async (worktree) => {
      writeFileSync(resolve(worktree, 'learnings/LESSONS.md'), beta);
      writeFileSync(
        resolve(worktree, 'learnings/history/alpha.md'),
        '# alpha\nApplied 2026-10-10 by guard.ts:1: guard\n',
      );
    });
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + gamma + recurrence + beta);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'new lessons'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const builtOn: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const holderPath: string = leaf(f, 'holder', 'merge', {
      worktree: held.worktree,
      merge_stamp: '2026-10-10T00:00:00.000Z',
    });
    const built: Awaited<ReturnType<typeof buildStack>> = await buildStack(repo, builtOn, held.head);
    if (!built.ok) throw new Error('fixture stack conflict');
    const record: Batch = {
      attempt: 'a1',
      built_on: builtOn,
      holder: { base: guardBase, head: held.head },
      applied: true,
      top: built.top,
    };
    saveState(holderPath, { ...readState(holderPath), batch: record });
    expect(await applyTop(repo, { path: holderPath, state: readState(holderPath) }, built.top, held.head)).toBe(true);
    const herdr: HerdrFixture = fakeHerdr(f);
    const args: string[] = ['phase', 'holder', 'merged', '--slot', 'B', '--attempt', 'a1'];
    await verified(f, 'holder', 'merge');
    expect((await cli(f, [...args, '--check'], f.root, herdr.env)).code).toBe(0);
    writeFileSync(resolve(f.root, 'learnings/LESSONS.md'), alpha + gamma + delta + recurrence + beta);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'main adds delta'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    expect((await cli(f, args, f.root, herdr.env)).code).toBe(0);
    const restacked: Batch = readState(holderPath).batch!;
    const expected: string = gamma + delta + recurrence + beta;
    expect(readFileSync(resolve(held.worktree, 'learnings/LESSONS.md'), 'utf8')).toBe(expected);

    writeFileSync(resolve(held.worktree, 'learnings/LESSONS.md'), alpha + expected);
    await command(['git', 'add', 'learnings/LESSONS.md'], held.worktree);
    await command(['git', 'commit', '-m', 'resurrect retired line'], held.worktree);
    const resurrected: string = await command(['git', 'rev-parse', 'HEAD'], held.worktree);
    saveState(holderPath, { ...readState(holderPath), batch: { ...restacked, top: resurrected } });
    const refused: Result = await cli(f, [...args, '--check'], f.root, herdr.env);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('history/alpha');
    await command(['git', 'reset', '--hard', restacked.top!], held.worktree);
    saveState(holderPath, { ...readState(holderPath), batch: restacked });
    await verified(f, 'holder', 'merge');
    expect((await cli(f, [...args, '--check'], f.root, herdr.env)).code).toBe(0);
    expect((await cli(f, args, f.root, herdr.env)).code).toBe(0);
    expect(await command(['git', 'show', 'origin/main:learnings/LESSONS.md'], f.root)).toBe(expected.trim());
  } finally {
    f.clean();
  }
});

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
  record: Batch;
  branch: Branch;
};

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

async function batchFixture(f: Fixture, top: boolean = true): Promise<BatchFixture> {
  process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
  process.env.HOME = f.home;
  const repo: Repo = readRepo('repo', f.root);
  const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  const branch: Branch = await branchAt(f, 'hold', builtOn, 'file-hold');
  const holderPath: string = leaf(f, 'hold', 'merge', {
    worktree: branch.worktree,
    merge_stamp: '2026-10-05T00:00:00.000Z',
  });
  const built: Awaited<ReturnType<typeof buildStack>> = await buildStack(repo, builtOn, branch.head);
  if (!built.ok) throw new Error('fixture stack conflict');
  const record: Batch = {
    attempt: 'a1',
    built_on: builtOn,
    holder: { base: builtOn, head: branch.head },
    applied: true,
    ...(top ? { top: built.top } : {}),
  };
  saveState(holderPath, { ...readState(holderPath), batch: record });
  const holder: Leaf = { path: holderPath, state: readState(holderPath) };
  if (top) await applyTop(repo, holder, built.top, branch.head);
  return { repo, herdr: fakeHerdr(f), builtOn, holder, record, branch };
}

// A record with no top: B rebases the holder itself.
async function soloFixture(f: Fixture): Promise<BatchFixture> {
  return batchFixture(f, false);
}

function remoteDir(f: Fixture): string {
  return resolve(f.home, 'remote.git');
}
async function remoteTip(f: Fixture): Promise<string> {
  return command(['git', 'rev-parse', 'refs/heads/main'], remoteDir(f));
}
async function remoteSubjects(f: Fixture, count: number): Promise<string[]> {
  return (await command(['git', 'log', '--format=%s', '-' + count], remoteDir(f))).split('\n');
}
function stateBytes(path: string): string {
  return readFileSync(resolve(path, 'state.yaml'), 'utf8');
}

async function advanceRemote(f: Fixture, files: Record<string, string>): Promise<string> {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-adv-')));
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

test.serial('a green holder checks once, pushes once, moves the holder and closes the issue', async () => {
  const f: Fixture = await fixture();
  try {
    const { record, holder, herdr } = await batchFixture(f);
    const countFile: string = resolve(f.home, 'count');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      checks: { count: 'sh -c "echo x >> ' + countFile + '"' },
    });
    await verified(f, 'hold', 'merge');
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(checked.stdout).toBe('ok');
    expect(readState(holder.path).batch?.tested_top).toBe(record.top);
    const checkRun: Result = await run(['sh', '-c', 'echo x >> ' + countFile]);
    expect(checkRun.code).toBe(0);
    const oldHead: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toBe(
      'moved merged\nissue complete issue\n' + `deployed ${oldHead.slice(0, 12)}..${record.top!.slice(0, 12)}`,
    );
    expect(await remoteTip(f)).toBe(record.top!);
    expect(await remoteSubjects(f, 1)).toEqual(['hold']);
    expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
    expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test.serial('a stale or missing attempt is refused, changes nothing, and the current attempt still lands', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    const remoteBefore: string = await remoteTip(f);
    const before: string = stateBytes(holder.path);
    await verified(f, 'hold', 'merge');
    const refusals: Result[] = [
      await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'old-attempt'], f.root, herdr.env),
      await cli(f, ['phase', 'hold', 'merged', '--slot', 'B'], f.root, herdr.env),
      await cli(f, ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'old-attempt'], f.root, herdr.env),
      await cli(
        f,
        ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'old-attempt', '--check'],
        f.root,
        herdr.env,
      ),
    ];
    for (const result of refusals) {
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Stale attempt');
    }
    expect(refusals[0].stderr).toContain('old-attempt');
    expect(stateBytes(holder.path)).toBe(before);
    expect(await remoteTip(f)).toBe(remoteBefore);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(record.top!);
    const late: Result = await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env);
    expect(late.code).not.toBe(0);
    expect(await remoteTip(f)).toBe(record.top!);
  } finally {
    f.clean();
  }
});

test.serial('a refused push restacks onto the new remote, prints rerun and the rerun pushes the new top', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const advance: string = resolve(f.home, 'advance');
    await command(['git', 'worktree', 'add', '--detach', advance, 'origin/main'], f.root);
    writeFileSync(resolve(advance, 'adv-file'), 'adv\n');
    await command(['git', 'add', '.'], advance);
    await command(['git', 'commit', '-m', 'adv'], advance);
    const advSha: string = await command(['git', 'rev-parse', 'HEAD'], advance);
    await command(['git', 'push', 'origin', 'HEAD:main'], advance);
    await command(['git', 'worktree', 'remove', '--force', advance], f.root);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toMatch(/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    const newTop: string = merged.stdout.split('pushed=')[1];
    const after: State = readState(holder.path);
    expect(after.phase).toBe('merge');
    const batch: Batch = after.batch!;
    expect(batch.attempt).toBe('a1');
    expect(batch.applied).toBe(true);
    expect(batch.top).toBe(newTop);
    expect(newTop).not.toBe(record.top);
    expect(batch.built_on).toBe(advSha);
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
    expect(batch.decision).toBe('rerun');
    expect(batch.candidate).toBeUndefined();
    expect(await remoteTip(f)).toBe(advSha);
    expect(await command(['git', 'rev-parse', 'refs/heads/hold'], f.root)).toBe(newTop);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(newTop);
    expect(await remoteSubjects(f, 2)).toEqual(['hold', 'adv']);
  } finally {
    f.clean();
  }
});

test.serial('a solo record checks and pushes the worktree HEAD', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    const head: string = await command(['git', 'rev-parse', 'refs/heads/hold'], f.root);
    await verified(f, 'hold', 'merge');
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(checked.stdout).toBe('ok');
    expect(readState(holder.path).batch?.tested_top).toBe(head);
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(await remoteTip(f)).toBe(head);
    expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
  } finally {
    f.clean();
  }
});

test.serial(
  'an operator merged without --slot skips the attempt and tested_top gates but pushes only a verified top',
  async () => {
    const f: Fixture = await fixture();
    try {
      const { record, herdr } = await batchFixture(f);
      const refused: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
      expect(refused.code).not.toBe(0);
      expect(refused.stderr).toContain(`No green merge verify receipt for ${record.top!}`);
      expect(await remoteTip(f)).not.toBe(record.top!);
      expect(readState(resolve(f.root, 'issues/open/issue/hold')).phase).toBe('merge');
      greenReceipt(f, record.top!, 'merge');
      const merged: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
      expect(merged.code).toBe(0);
      expect(merged.stdout).toContain('moved merged');
      expect(await remoteTip(f)).toBe(record.top!);
      expect(readState(resolve(f.root, 'issues/closed/issue/hold')).phase).toBe('merged');
    } finally {
      f.clean();
    }
  },
);

test.serial('a config command change after merged --check refuses the push', async () => {
  const f: Fixture = await fixture();
  try {
    const { herdr } = await soloFixture(f);
    const head: string = await command(['git', 'rev-parse', 'refs/heads/hold'], f.root);
    await verified(f, 'hold', 'merge');
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'bun test --bail' }, grounding: 'none' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).not.toBe(0);
    expect(merged.stderr).toContain(`No green merge verify receipt for ${head}`);
    expect(await remoteTip(f)).not.toBe(head);
  } finally {
    f.clean();
  }
});

test.serial('check.fix on a record moves the holder to check.fix', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    const moved: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    expect(moved.stdout).toBe('moved check.fix');
    expect(readState(holder.path).phase).toBe('check.fix');
  } finally {
    f.clean();
  }
});

async function repairCommit(holder: Leaf): Promise<string> {
  writeFileSync(resolve(holder.state.worktree!, 'repair'), 'repair\n');
  await command(['git', 'add', '.'], holder.state.worktree!);
  await command(['git', 'commit', '-m', 'repair'], holder.state.worktree!);
  return command(['git', 'rev-parse', 'HEAD'], holder.state.worktree!);
}

test.serial('a stack checks and pushes a B repair commit past the top', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    const repaired: string = await repairCommit(holder);
    expect(repaired).not.toBe(record.top);
    await verified(f, 'hold', 'merge');
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).toBe(0);
    expect(readState(holder.path).batch?.tested_top).toBe(repaired);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(repaired);
  } finally {
    f.clean();
  }
});

test.serial('a restack keeps the B repair commit', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await batchFixture(f);
    await repairCommit(holder);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'adv-file': 'adv\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toMatch(/^rerun tested=[0-9a-f]{40} pushed=[0-9a-f]{40}$/);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteSubjects(f, 3)).toEqual(['repair', 'hold', 'adv']);
  } finally {
    f.clean();
  }
});

test.serial('check.fix keeps the B repair commit on the branch', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await batchFixture(f);
    const repaired: string = await repairCommit(holder);
    const moved: Result = await cli(
      f,
      ['phase', 'hold', 'check.fix', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(moved.code).toBe(0);
    expect(readState(holder.path).phase).toBe('check.fix');
    expect(await command(['git', 'rev-parse', 'refs/heads/hold'], f.root)).toBe(repaired);
  } finally {
    f.clean();
  }
});

test.serial('a stack refuses a HEAD that does not descend from the top at --check', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    await command(['git', 'reset', '--hard', record.built_on], holder.state.worktree!);
    await repairCommit(holder);
    await verified(f, 'hold', 'merge');
    const checked: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'],
      f.root,
      herdr.env,
    );
    expect(checked.code).not.toBe(0);
    expect(checked.stderr).toContain('HEAD must descend from the recorded batch top ' + record.top);
    expect(readState(holder.path).batch?.tested_top).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('operator completion refuses a holder reset below the top', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    await command(['git', 'reset', '--hard', record.built_on], holder.state.worktree!);
    const before: string = await remoteTip(f);
    const result: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('HEAD must descend from the recorded batch top ' + record.top);
    expect(await remoteTip(f)).toBe(before);
    expect(readState(holder.path).phase).toBe('merge');
  } finally {
    f.clean();
  }
});

test.serial('operator completion refuses an unverified holder commit past the top', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    writeFileSync(resolve(holder.state.worktree!, 'unchecked'), 'unchecked');
    await command(['git', 'add', '.'], holder.state.worktree!);
    await command(['git', 'commit', '-m', 'unchecked'], holder.state.worktree!);
    const before: string = await remoteTip(f);
    const result: Result = await cli(f, ['phase', 'hold', 'merged'], f.root, herdr.env);
    expect(result.code).not.toBe(0);
    expect(await remoteTip(f)).toBe(before);
    expect(readState(holder.path).batch!.top).toBe(record.top!);
  } finally {
    f.clean();
  }
});

test.serial('a solo restack conflict preserves commits made during the solo pass', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await soloFixture(f);
    writeFileSync(resolve(holder.state.worktree!, 'solo-fix'), 'committed solo repair');
    await command(['git', 'add', '.'], holder.state.worktree!);
    await command(['git', 'commit', '-m', 'solo repair'], holder.state.worktree!);
    const repaired: string = await command(['git', 'rev-parse', 'hold'], f.root);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--check', '--attempt', 'a1'], f.root, herdr.env)).code,
    ).toBe(0);
    writeFileSync(resolve(f.root, 'file-hold'), 'main conflict');
    await command(['git', 'add', 'file-hold'], f.root);
    await command(['git', 'commit', '-m', 'advance'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const result: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(result.code).toBe(0);
    expect(readState(holder.path).batch!.top).toBeUndefined();
    expect(await command(['git', 'rev-parse', 'hold'], f.root)).toBe(repaired);
    expect(readFileSync(resolve(holder.state.worktree!, 'solo-fix'), 'utf8')).toBe('committed solo repair');
  } finally {
    f.clean();
  }
});

test.serial('late holder dirt during restack is isolated', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await batchFixture(f);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--check', '--attempt', 'a1'], f.root, herdr.env)).code,
    ).toBe(0);
    writeFileSync(resolve(f.root, 'advance'), 'advance');
    await command(['git', 'add', 'advance'], f.root);
    await command(['git', 'commit', '-m', 'advance'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const created: string = await editOnSecondStatus(f, holder.state.worktree!);
    const result: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(result.code).toBe(0);
    expect(existsSync(created)).toBe(true);
    expect(readState(holder.path).batch!.top).toBeUndefined();
    expect(readFileSync(resolve(holder.state.worktree!, 'uncommitted'), 'utf8')).toBe('operator edit\n');
  } finally {
    f.clean();
  }
});

test.serial('a records-only advance refuses the push until the pushed tree has its own green receipt', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    const t1: string = record.top!;
    const m1: string = record.built_on;
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      grounding: 'none',
      checks: { absent: 'test ! -e learnings/history/red.md' },
    });
    expect((await cli(f, ['verify', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(0);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const m2: string = await advanceRemote(f, { 'learnings/history/red.md': 'red\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.top).toBe(t2);
    const refused: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(refused.code).not.toBe(0);
    expect(await remoteTip(f)).toBe(m2);
    expect(m1).not.toBe(m2);
    expect((await cli(f, ['verify', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(1);
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).not.toBe(0);
    expect(await remoteTip(f)).toBe(m2);
  } finally {
    f.clean();
  }
});

test.serial('a code advance forces a rerun: the seat rechecks and the restacked top lands', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    const t1: string = record.top!;
    const countFile: string = resolve(f.home, 'check-count');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      checks: { count: 'sh -c "echo x >> ' + countFile + '"' },
    });
    await command(['sh', '-c', 'echo x >> ' + countFile]);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const m2: string = await advanceRemote(f, { file: 'advanced\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const rerunBatch: Batch = readState(holder.path).batch!;
    expect(rerunBatch.decision).toBe('rerun');
    expect(rerunBatch.tested_top).toBeUndefined();
    expect(rerunBatch.tested_main).toBeUndefined();
    expect(rerunBatch.built_on).toBe(m2);
    expect(rerunBatch.top).toBe(t2);
    expect(await remoteTip(f)).toBe(m2);
    await command(['sh', '-c', 'echo x >> ' + countFile]);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    expect((await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'], f.root, herdr.env)).code).toBe(
      0,
    );
    expect(await remoteTip(f)).toBe(t2);
    expect(readFileSync(countFile, 'utf8').trim().split('\n')).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test.serial('a change to issues/config.yaml on main forces a rerun', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, record, herdr } = await batchFixture(f);
    const t1: string = record.top!;
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    await advanceRemote(f, { 'issues/config.yaml': 'checks: {}\n' });
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    const t2: string = merged.stdout.split('pushed=')[1];
    expect(merged.stdout).toBe(`rerun tested=${t1} pushed=${t2}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
  } finally {
    f.clean();
  }
});

test.serial('a dirty holder during restack records rerun and preserves the operator edit', async () => {
  const f: Fixture = await fixture();
  try {
    const { holder, herdr } = await batchFixture(f);
    await verified(f, 'hold', 'merge');
    expect(
      (await cli(f, ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1', '--check'], f.root, herdr.env)).code,
    ).toBe(0);
    const main: string = await advanceRemote(f, { 'issues/open/x/state.yaml': 'x\n' });
    const edit: string = resolve(holder.state.worktree!, 'operator-edit');
    writeFileSync(edit, 'edit\n');
    const merged: Result = await cli(
      f,
      ['phase', 'hold', 'merged', '--slot', 'B', '--attempt', 'a1'],
      f.root,
      herdr.env,
    );
    expect(merged.code).toBe(0);
    expect(merged.stdout).toBe(`rerun rebase hold onto ${main}`);
    const batch: Batch = readState(holder.path).batch!;
    expect(batch.decision).toBe('rerun');
    expect(batch.tested_top).toBeUndefined();
    expect(batch.tested_main).toBeUndefined();
    expect(batch.top).toBeUndefined();
    expect(batch.candidate).toBeUndefined();
    expect(readFileSync(edit, 'utf8')).toBe('edit\n');
    expect(await remoteTip(f)).toBe(main);
  } finally {
    f.clean();
  }
});
