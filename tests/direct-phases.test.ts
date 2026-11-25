import { test, expect } from 'bun:test';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, greenReceipt, leaf, storeDir, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { readRepo } from '../src/config';
import { createSparseWorktree } from '../src/next';
import { writeYaml } from '../src/shell';
import { readState } from '../src/state';

// A leaf folder whose state.yaml carries the direct-leaf shape: written through leaf() first,
// then rewritten with direct: true, a full-ISO creation time, empty frozen records and the
// door/reviewer seat refs the create verb records. At base the strictObject schema rejects
// the direct key, so every read of this state fails — the honest red at planning.
function directLeaf(f: Fixture, slug: string, phase: string, created: string, extra: object = {}): string {
  const path: string = leaf(f, slug, phase, { created, frozen: {}, frozen_cited: [], ...extra });
  const file: string = resolve(path, 'state.yaml');
  const written: object = Bun.YAML.parse(readFileSync(file, 'utf8')) as object;
  writeYaml(file, {
    ...written,
    direct: true,
    created,
    seat: {
      A: { session: 'dp-session', address: 'w1:a-door' },
      B: { session: 'dp-session', address: 'w1:b-reviewer' },
    },
  });
  return path;
}

// The direct leaf's real sparse worktree on its own branch, built with the product helper.
async function directWorktree(f: Fixture, slug: string, extra: object = {}): Promise<{ leafPath: string; worktree: string }> {
  const at: string = resolve(storeDir(f), slug);
  await createSparseWorktree(readRepo(f.repo, f.root), at, 'origin/main', { branch: slug });
  const worktree: string = realpathSync(at);
  const leafPath: string = directLeaf(f, slug, 'implement', new Date().toISOString(), { worktree, ...extra });
  return { leafPath, worktree };
}

async function commitFile(worktree: string, name: string, messages: string[]): Promise<string> {
  writeFileSync(resolve(worktree, name), `${name}\\n`);
  await command(['git', 'add', name], worktree);
  await command(['git', 'commit', ...messages.flatMap((m) => ['-m', m])], worktree);
  return command(['git', 'rev-parse', 'HEAD'], worktree);
}

// A green leaf-scope verify receipt on the worktree's current HEAD.
async function greenHead(f: Fixture, worktree: string): Promise<void> {
  greenReceipt(f, await command(['git', 'rev-parse', 'HEAD'], worktree), 'leaf');
}

const leafJsonSchema = z.looseObject({ slug: z.string(), waits_on: z.array(z.string()) });
const envelopeSchema = z.looseObject({
  repos: z.array(z.looseObject({ name: z.string(), leaves: z.array(leafJsonSchema) })),
});

async function waitsOn(f: Fixture, slug: string): Promise<string[]> {
  const result: Result = await cli(f, ['status', '--json']);
  expect(result.code).toBe(0);
  const env: z.infer<typeof envelopeSchema> = envelopeSchema.parse(JSON.parse(result.stdout));
  const repo = env.repos.find((item) => item.name === f.repo)!;
  const found = repo.leaves.find((item) => item.slug === slug);
  expect(found, `leaf ${slug} in status json`).toBeDefined();
  return found!.waits_on;
}

test('the legal direct sequence implement -> check.review -> check.repair -> check.fix -> check.review -> merge is green end to end with correct waits_on per round', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await directWorktree(f, 'dx-flow');
    await commitFile(worktree, 'feature.ts', ['add feature']);
    await greenHead(f, worktree);
    expect(await waitsOn(f, 'dx-flow')).toEqual(['A']);

    const review0: Result = await cli(f, ['phase', 'dx-flow', 'check.review', '--slot', 'A']);
    expect(review0.code, review0.stderr).toBe(0);
    expect(review0.stdout).toBe('moved check.review');
    expect(readState(leafPath).phase).toBe('check.review');
    // Round 0: the reviewer waits alone, not the round-0 pair of lifecycle.
    expect(await waitsOn(f, 'dx-flow')).toEqual(['B']);

    const repair0: Result = await cli(f, ['phase', 'dx-flow', 'check.repair', '--slot', 'B', '--verdict', 'fix']);
    expect(repair0.code, repair0.stderr).toBe(0);
    expect(repair0.stdout).toBe('moved check.repair');
    expect(await waitsOn(f, 'dx-flow')).toEqual(['A']);

    const fix1: Result = await cli(f, ['phase', 'dx-flow', 'check.fix', '--slot', 'A']);
    expect(fix1.code, fix1.stderr).toBe(0);
    expect(fix1.stdout).toBe('moved check.fix');
    expect(readState(leafPath).fix_rounds).toBe(1);
    expect(await waitsOn(f, 'dx-flow')).toEqual(['A']);

    const review1: Result = await cli(f, ['phase', 'dx-flow', 'check.review', '--slot', 'A']);
    expect(review1.code, review1.stderr).toBe(0);
    expect(review1.stdout).toBe('moved check.review');
    // Round 1: still B alone, as at every round.
    expect(await waitsOn(f, 'dx-flow')).toEqual(['B']);

    const repair1: Result = await cli(f, ['phase', 'dx-flow', 'check.repair', '--slot', 'B', '--verdict', 'fix']);
    expect(repair1.code, repair1.stderr).toBe(0);
    expect(repair1.stdout).toBe('moved check.repair');
    expect(await waitsOn(f, 'dx-flow')).toEqual(['A']);

    const fix2: Result = await cli(f, ['phase', 'dx-flow', 'check.fix', '--slot', 'A']);
    expect(fix2.code, fix2.stderr).toBe(0);
    expect(fix2.stdout).toBe('moved check.fix');
    expect(readState(leafPath).fix_rounds).toBe(2);

    const review2: Result = await cli(f, ['phase', 'dx-flow', 'check.review', '--slot', 'A']);
    expect(review2.code, review2.stderr).toBe(0);
    expect(review2.stdout).toBe('moved check.review');
    // Round 2: B alone again.
    expect(await waitsOn(f, 'dx-flow')).toEqual(['B']);

    const merge: Result = await cli(f, ['phase', 'dx-flow', 'merge', '--slot', 'B', '--verdict', 'ready']);
    expect(merge.code, merge.stderr).toBe(0);
    expect(merge.stdout).toBe('moved merge');
    expect(readState(leafPath).phase).toBe('merge');
    expect(await waitsOn(f, 'dx-flow')).toEqual(['A']);
  } finally {
    f.clean();
  }
});

test('illegal direct moves are refused: implement to merge, implement to check.fix, and wrong-seat moves', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await directWorktree(f, 'dx-illegal');
    await commitFile(worktree, 'feature.ts', ['add feature']);
    await greenHead(f, worktree);
    const toMerge: Result = await cli(f, ['phase', 'dx-illegal', 'merge', '--slot', 'A']);
    expect(toMerge.code).not.toBe(0);
    expect(toMerge.stderr).toContain('Illegal move implement -> merge');
    const toFix: Result = await cli(f, ['phase', 'dx-illegal', 'check.fix', '--slot', 'A']);
    expect(toFix.code).not.toBe(0);
    expect(toFix.stderr).toContain('Illegal move implement -> check.fix');
    const wrongSeatImplement: Result = await cli(f, ['phase', 'dx-illegal', 'check.review', '--slot', 'B']);
    expect(wrongSeatImplement.code).not.toBe(0);
    expect(wrongSeatImplement.stderr).toContain('required --slot');
    expect(readState(await directLeafPath(f, 'dx-illegal')).phase).toBe('implement');

    // The reviewer owns check.review at every round: a move attempted by A is refused.
    const move: Result = await cli(f, ['phase', 'dx-illegal', 'check.review', '--slot', 'A']);
    expect(move.code, move.stderr).toBe(0);
    const wrongSeatReview: Result = await cli(f, ['phase', 'dx-illegal', 'check.repair', '--slot', 'A']);
    expect(wrongSeatReview.code).not.toBe(0);
    expect(wrongSeatReview.stderr).toContain('required --slot');
    expect(readState(await directLeafPath(f, 'dx-illegal')).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

async function directLeafPath(f: Fixture, slug: string): Promise<string> {
  return resolve(f.root, 'issues/open/issue', slug);
}

test('implement to failed refuses without --reason and commits with one', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath } = await directWorktree(f, 'dx-fail');
    const bare: Result = await cli(f, ['phase', 'dx-fail', 'failed', '--slot', 'A']);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('Failed requires --reason');
    expect(bare.stderr).not.toContain('Invalid state');
    const moved: Result = await cli(f, ['phase', 'dx-fail', 'failed', '--slot', 'A', '--reason', 'needs a decision']);
    expect(moved.stdout).toBe('moved failed');
    expect(readState(leafPath).phase).toBe('failed');
    expect(readState(leafPath).failure?.reason).toBe('needs a decision');
  } finally {
    f.clean();
  }
});

test('check.repair to merge is refused without merge_exit, on a conflict exit, and after the head moved past the red top; accepted unedited on a red exit', async () => {
  const f: Fixture = await fixture();
  try {
    // No merge_exit at all: even a green receipt cannot repair-to-merge a direct leaf.
    const noExit = await directWorktree(f, 'dx-rx-none', { phase: 'check.repair' });
    const headNone: string = await command(['git', 'rev-parse', 'HEAD'], noExit.worktree);
    greenReceipt(f, headNone, 'leaf');
    const refusedNone: Result = await cli(f, ['phase', 'dx-rx-none', 'merge', '--slot', 'A']);
    expect(refusedNone.code).not.toBe(0);
    expect(refusedNone.stderr).not.toContain('Invalid state');
    expect(readState(noExit.leafPath).phase).toBe('check.repair');

    // A conflict exit is never a merge shape for a direct leaf.
    const conflict = await directWorktree(f, 'dx-rx-conflict', {
      phase: 'check.repair',
      merge_exit: { reason: 'conflict' },
    });
    greenReceipt(f, await command(['git', 'rev-parse', 'HEAD'], conflict.worktree), 'leaf');
    const refusedConflict: Result = await cli(f, ['phase', 'dx-rx-conflict', 'merge', '--slot', 'A']);
    expect(refusedConflict.code).not.toBe(0);
    expect(refusedConflict.stderr).not.toContain('Invalid state');
    expect(readState(conflict.leafPath).phase).toBe('check.repair');

    // A red exit whose top the head moved past: the leaf is edited and must go through check.fix.
    const moved = await directWorktree(f, 'dx-rx-moved', { phase: 'check.repair' });
    const redTop: string = await command(['git', 'rev-parse', 'HEAD'], moved.worktree);
    directLeafRewrite(f, 'dx-rx-moved', {
      merge_exit: { reason: 'red', top: redTop },
    });
    await commitFile(moved.worktree, 'repair.ts', ['repair the conflict']);
    greenReceipt(f, await command(['git', 'rev-parse', 'HEAD'], moved.worktree), 'leaf');
    const refusedMoved: Result = await cli(f, ['phase', 'dx-rx-moved', 'merge', '--slot', 'A']);
    expect(refusedMoved.code).not.toBe(0);
    expect(refusedMoved.stderr).not.toContain('Invalid state');
    expect(readState(moved.leafPath).phase).toBe('check.repair');

    // The accepted shape: merge_exit red, top equal to the current head, nothing changed since.
    const accepted = await directWorktree(f, 'dx-rx-ok', { phase: 'check.repair' });
    const top: string = await command(['git', 'rev-parse', 'HEAD'], accepted.worktree);
    directLeafRewrite(f, 'dx-rx-ok', {
      merge_exit: { reason: 'red', top },
    });
    const merged: Result = await cli(f, ['phase', 'dx-rx-ok', 'merge', '--slot', 'A']);
    expect(merged.code, merged.stderr).toBe(0);
    expect(merged.stdout).toBe('moved merge');
    expect(readState(accepted.leafPath).phase).toBe('merge');
  } finally {
    f.clean();
  }
});

// Rewrites one key of a direct leaf's state.yaml schema-free, since saveState cannot parse it at base.
function directLeafRewrite(f: Fixture, slug: string, over: object): void {
  const file: string = resolve(f.root, 'issues/open/issue', slug, 'state.yaml');
  writeYaml(file, { ...(Bun.YAML.parse(readFileSync(file, 'utf8')) as object), ...over });
}

test('merge moves anywhere else by hand are refused for a direct leaf', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath } = await directWorktree(f, 'dx-mg', { phase: 'merge' });
    for (const target of ['implement', 'check.review']) {
      const refused: Result = await cli(f, ['phase', 'dx-mg', target, '--slot', 'A']);
      expect(refused.code).not.toBe(0);
      expect(refused.stderr).toContain(`Illegal move merge -> ${target}`);
      expect(readState(leafPath).phase).toBe('merge');
    }
    // merge evicts to check.repair itself; a hand move to check.fix is refused before the graph.
    const toFix: Result = await cli(f, ['phase', 'dx-mg', 'check.fix']);
    expect(toFix.code).not.toBe(0);
    expect(toFix.stderr).toContain('Merge moves to check.repair itself');
    expect(readState(leafPath).phase).toBe('merge');
  } finally {
    f.clean();
  }
});

test('a commit adding a test file without a Test-Change trailer refuses the review move naming the citation, and carrying it moves', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await directWorktree(f, 'dx-cite');
    await commitFile(worktree, 'feature.ts', ['add feature']);
    await commitFile(worktree, 'x.test.ts', ['add the test']);
    await greenHead(f, worktree);
    const refused: Result = await cli(f, ['phase', 'dx-cite', 'check.review', '--slot', 'A']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('x.test.ts');
    expect(refused.stderr).toContain('Test-Change: x.test.ts <source and reason>');
    expect(refused.stderr).not.toContain('Invalid state');
    expect(readState(leafPath).phase).toBe('implement');
    await command(
      ['git', 'commit', '--allow-empty', '-m', 'cite\n\nTest-Change: x.test.ts test added with the feature it covers'],
      worktree,
    );
    await greenHead(f, worktree);
    const moved: Result = await cli(f, ['phase', 'dx-cite', 'check.review', '--slot', 'A']);
    expect(moved.code, moved.stderr).toBe(0);
    expect(moved.stdout).toBe('moved check.review');
    expect(readState(leafPath).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});
