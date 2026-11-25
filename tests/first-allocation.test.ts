import { test, expect } from 'bun:test';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, storeDir, type Fixture } from './helpers';
import { delivered, hcFixture, stopCoresAfterFile, type HcFixture } from './hc-fixture';
import { readState } from '../src/state';
import { command, run, type Result } from '../src/shell';

stopCoresAfterFile();

// First-allocation proofs for fresh-first-worktree: a commit-free leftover is replaced from the
// tracking ref, a leftover worth keeping refuses loudly, and a branch with its own commits is
// adopted unchanged. Every case drives the real `akrogon next` dispatch on a real core against
// temp git repos (bare remote, clone, real worktrees).

async function next(f: HcFixture, args: string[]): Promise<Result> {
  return cli(f, ['next', ...args], f.root, { ...f.env });
}

// One commit on main pushed to the bare remote: refs/remotes/origin/main advances. The slug
// branch cut beforehand stays behind with no commits of its own.
async function advanceMain(f: Fixture): Promise<{ tracking: string; stale: string }> {
  const stale: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  writeFileSync(resolve(f.root, 'advanced'), 'advance\n');
  await command(['git', 'add', 'advanced'], f.root);
  await command(['git', 'commit', '-m', 'advance'], f.root);
  await command(['git', 'push', 'origin', 'main'], f.root);
  const tracking: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  expect(tracking).not.toBe(stale);
  return { tracking, stale };
}

// The commit-free shape: branch `build` at the sha main held before the advance.
async function commitFree(f: Fixture): Promise<{ tracking: string; stale: string }> {
  const stale: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
  await command(['git', 'branch', 'build', stale], f.root);
  const advanced: { tracking: string; stale: string } = await advanceMain(f);
  expect(advanced.stale).toBe(stale);
  return advanced;
}

function worktreePath(f: Fixture): string {
  return resolve(storeDir(f), 'build');
}

async function expectFresh(f: HcFixture, path: string, tracking: string): Promise<void> {
  const wt: string = worktreePath(f);
  expect(await command(['git', 'rev-parse', 'HEAD'], wt)).toBe(tracking);
  expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(tracking);
  expect(await command(['git', 'merge-base', 'HEAD', 'refs/remotes/origin/main'], wt)).toBe(tracking);
  expect(await command(['git', 'branch', '--show-current'], wt)).toBe('build');
  expect(existsSync(resolve(wt, 'advanced'))).toBe(true);
  expect(readState(path).worktree).toBe(wt);
  const tasks: { text: string }[] = await delivered(f, 'build');
  expect(tasks.some((t) => t.text.startsWith('plan-issue build slot=A phase=plan.synthesis'))).toBe(true);
}

function seatStarts(f: HcFixture): string[][] {
  return readFileSync(f.core.shimLog, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => line.split('\t'))
    .filter((args) => args[0] === 'run' && args.includes('akrogon.leaf=build'));
}

async function expectRefusal(f: HcFixture, path: string, result: Result, pieces: string[]): Promise<void> {
  expect(result.code).not.toBe(0);
  for (const piece of pieces) expect(result.stderr).toContain(piece);
  expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^worktree:/m);
  expect(seatStarts(f)).toEqual([]);
}

test('criterion 1: first allocation replaces a clean leftover on a commit-free branch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { tracking, stale } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    expect(await command(['git', 'rev-parse', 'HEAD'], wt)).toBe(stale);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    await expectFresh(f, path, tracking);
  } finally {
    await f.clean();
  }
});

test('criterion 1: first allocation replaces a leftover holding only ignored files', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { tracking } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    const common: string = resolve(wt, await command(['git', 'rev-parse', '--git-common-dir'], wt));
    appendFileSync(resolve(common, 'info/exclude'), 'junk-deps/\n');
    mkdirSync(resolve(wt, 'junk-deps'));
    writeFileSync(resolve(wt, 'junk-deps/blob'), 'junk\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    await expectFresh(f, path, tracking);
    expect(existsSync(resolve(wt, 'junk-deps'))).toBe(false);
  } finally {
    await f.clean();
  }
});

test('criterion 1: first allocation resets a commit-free branch with no store path', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { tracking } = await commitFree(f);
    expect(existsSync(worktreePath(f))).toBe(false);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    await expectFresh(f, path, tracking);
  } finally {
    await f.clean();
  }
});

test('criterion 1 regression: fresh creation with no branch starts from the tracking ref', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { tracking } = await advanceMain(f);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    await expectFresh(f, path, tracking);
  } finally {
    await f.clean();
  }
});

test('criterion 2: a modified tracked file refuses and leaves everything in place', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { stale } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    appendFileSync(resolve(wt, 'file'), 'operator edit\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, ['build', wt, 'uncommitted changes', 'file', 'git worktree remove --force']);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(stale);
    expect(readFileSync(resolve(wt, 'file'), 'utf8')).toBe('initial\noperator edit\n');
    expect(existsSync(wt)).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 2: an untracked file refuses and leaves everything in place', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { stale } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    writeFileSync(resolve(wt, 'scratch-notes'), 'keep me\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, ['build', wt, 'uncommitted changes', 'scratch-notes']);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(stale);
    expect(readFileSync(resolve(wt, 'scratch-notes'), 'utf8')).toBe('keep me\n');
  } finally {
    await f.clean();
  }
});

test('criterion 2: a merge in progress on a clean tree refuses', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { stale } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    const marker: string = resolve(wt, await command(['git', 'rev-parse', '--git-path', 'MERGE_HEAD'], wt));
    writeFileSync(marker, `${stale}\n`);
    expect(await command(['git', 'status', '--porcelain'], wt)).toBe('');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, ['build', wt, 'merge in progress']);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(stale);
    expect(existsSync(marker)).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 2: a locked worktree refuses naming git worktree unlock', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { stale } = await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    await command(['git', 'worktree', 'lock', wt], f.root);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, ['build', wt, 'git worktree unlock']);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(stale);
    expect(existsSync(wt)).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 2: a dirty refusal lists the first 20 files with the total count', async () => {
  const f: HcFixture = await hcFixture();
  try {
    await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    for (let i = 1; i <= 25; i += 1) writeFileSync(resolve(wt, `u${String(i).padStart(2, '0')}`), 'x\n');
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).not.toBe(0);
    expect((result.stderr.match(/u\d\d/g) ?? []).length).toBe(20);
    expect(result.stderr).toContain('25');
    expect(existsSync(resolve(wt, 'u01'))).toBe(true);
    expect(existsSync(resolve(wt, 'u25'))).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 3: a detached HEAD refuses whether or not the branch has commits', async () => {
  for (const commits of ['commit-free', 'own commits']) {
    const f: HcFixture = await hcFixture();
    try {
      await commitFree(f);
      const wt: string = worktreePath(f);
      await command(['git', 'worktree', 'add', wt, 'build'], f.root);
      if (commits === 'own commits') {
        writeFileSync(resolve(wt, 'own'), 'own\n');
        await command(['git', 'add', 'own'], wt);
        await command(['git', 'commit', '-m', 'own'], wt);
      }
      const branchSha: string = await command(['git', 'rev-parse', 'refs/heads/build'], f.root);
      await command(['git', 'checkout', '--detach', 'HEAD'], wt);
      const path: string = leaf(f, 'build', 'plan.synthesis');
      const result: Result = await next(f, ['build']);
      await expectRefusal(f, path, result, [wt, 'detached']);
      expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(branchSha);
      expect(await command(['git', 'branch', '--show-current'], wt)).toBe('');
      expect(existsSync(wt)).toBe(true);
    } finally {
      await f.clean();
    }
  }
});

test('criterion 3: a leftover on another branch refuses whether or not the slug branch has commits', async () => {
  for (const commits of ['commit-free', 'own commits']) {
    const f: HcFixture = await hcFixture();
    try {
      await commitFree(f);
      const wt: string = worktreePath(f);
      await command(['git', 'worktree', 'add', '-b', 'other', wt], f.root);
      if (commits === 'own commits') {
        const temp: string = resolve(f.home, 'temp-checkout');
        await command(['git', 'worktree', 'add', temp, 'build'], f.root);
        writeFileSync(resolve(temp, 'own'), 'own\n');
        await command(['git', 'add', 'own'], temp);
        await command(['git', 'commit', '-m', 'own'], temp);
        await command(['git', 'worktree', 'remove', temp], f.root);
      }
      const branchSha: string = await command(['git', 'rev-parse', 'refs/heads/build'], f.root);
      const path: string = leaf(f, 'build', 'plan.synthesis');
      const result: Result = await next(f, ['build']);
      await expectRefusal(f, path, result, [wt, 'other']);
      expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(branchSha);
      expect(await command(['git', 'branch', '--show-current'], wt)).toBe('other');
    } finally {
      await f.clean();
    }
  }
});

test('criterion 3: an unborn slug branch HEAD refuses naming the unborn branch', async () => {
  const f: HcFixture = await hcFixture();
  try {
    await commitFree(f);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    await command(['git', 'update-ref', '-d', 'refs/heads/build'], f.root);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, [wt, 'unborn', 'build']);
    expect((await run(['git', 'show-ref', '--verify', '--quiet', 'refs/heads/build'], f.root)).code).toBe(1);
    expect(existsSync(wt)).toBe(true);
  } finally {
    await f.clean();
  }
});

test('criterion 3: a commit-free branch checked out elsewhere refuses and moves nothing', async () => {
  const f: HcFixture = await hcFixture();
  try {
    const { stale } = await commitFree(f);
    const elsewhere: string = resolve(f.home, 'elsewhere');
    await command(['git', 'worktree', 'add', elsewhere, 'build'], f.root);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    await expectRefusal(f, path, result, [elsewhere, 'build']);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(stale);
    expect(existsSync(worktreePath(f))).toBe(false);
    expect(await command(['git', 'branch', '--show-current'], elsewhere)).toBe('build');
  } finally {
    await f.clean();
  }
});

test('criterion 4: a branch with own commits is adopted with no store path', async () => {
  const f: HcFixture = await hcFixture();
  try {
    await advanceMain(f);
    const base: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'branch', 'build', base], f.root);
    const temp: string = resolve(f.home, 'temp-checkout');
    await command(['git', 'worktree', 'add', temp, 'build'], f.root);
    writeFileSync(resolve(temp, 'own'), 'own work\n');
    await command(['git', 'add', 'own'], temp);
    await command(['git', 'commit', '-m', 'own work'], temp);
    const ownSha: string = await command(['git', 'rev-parse', 'HEAD'], temp);
    await command(['git', 'worktree', 'remove', temp], f.root);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    const wt: string = worktreePath(f);
    expect(await command(['git', 'rev-parse', 'HEAD'], wt)).toBe(ownSha);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(ownSha);
    expect(readFileSync(resolve(wt, 'own'), 'utf8')).toBe('own work\n');
    expect(readState(path).worktree).toBe(wt);
  } finally {
    await f.clean();
  }
});

test('criterion 4: a branch with own commits is adopted when the store worktree is clean on it', async () => {
  const f: HcFixture = await hcFixture();
  try {
    await advanceMain(f);
    const base: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'branch', 'build', base], f.root);
    const wt: string = worktreePath(f);
    await command(['git', 'worktree', 'add', wt, 'build'], f.root);
    writeFileSync(resolve(wt, 'own'), 'own work\n');
    await command(['git', 'add', 'own'], wt);
    await command(['git', 'commit', '-m', 'own work'], wt);
    const ownSha: string = await command(['git', 'rev-parse', 'HEAD'], wt);
    const path: string = leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).toBe(0);
    expect(await command(['git', 'rev-parse', 'HEAD'], wt)).toBe(ownSha);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(ownSha);
    expect(readFileSync(resolve(wt, 'own'), 'utf8')).toBe('own work\n');
  } finally {
    await f.clean();
  }
});

test('criterion 5: resetLeafBranch refuses a moved ref and keeps the newer commit', async () => {
  const f: Fixture = await fixture();
  try {
    const { readRepo } = await import('../src/config');
    const { resetLeafBranch } = await import('../src/next');
    const repo = readRepo(f.repo, f.root);
    const baseSha: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    writeFileSync(resolve(f.root, 'second'), 'second\n');
    await command(['git', 'add', 'second'], f.root);
    await command(['git', 'commit', '-m', 'second'], f.root);
    await command(['git', 'push', 'origin', 'main'], f.root);
    const sha2: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'branch', 'build', baseSha], f.root);
    await resetLeafBranch(repo, 'build', sha2, baseSha);
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(sha2);
    await expect(resetLeafBranch(repo, 'build', baseSha, baseSha)).rejects.toThrow();
    expect(await command(['git', 'rev-parse', 'refs/heads/build'], f.root)).toBe(sha2);
    expect((await run(['git', 'merge-base', '--is-ancestor', baseSha, sha2], f.root)).code).toBe(0);
  } finally {
    f.clean();
  }
});
