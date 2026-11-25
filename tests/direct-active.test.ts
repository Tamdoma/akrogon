import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, storeDir, yaml, type Fixture } from './helpers';
import { delivered, hcFixture, stopCoresAfterFile, type HcFixture, type Terminal } from './hc-fixture';
import { command, type Result, type SpawnResult } from '../src/shell';

stopCoresAfterFile();

// The direct-leaf fixture states in this file are written directly: leaf() then a state.yaml rewrite
// adding direct: true, a full-ISO created and seat refs (plan D16a). At planning the state schema is
// a strictObject without `direct`, so the leaf reads as unreadable and counts toward capacity in
// every branch; that schema rejection is the correct red for both variants.
function directLeaf(
  f: Fixture,
  slug: string,
  seats: { A: { session: string; address: string }; B: { session: string; address: string } },
  extra: object = {},
): string {
  const path: string = leaf(f, slug, 'implement', {}, 'chart-x');
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase: 'implement',
    created: new Date().toISOString(),
    repo: f.repo,
    'blocked-by': [],
    direct: true,
    frozen: {},
    seat: seats,
    ...extra,
  });
  return path;
}

// A leaf-branch worktree with one commit against the pushed base: the shape the create verb leaves
// behind, so the direct leaf is genuinely seated-and-unfinished.
async function directWorktree(f: Fixture, slug: string): Promise<string> {
  const worktree: string = resolve(storeDir(f), slug);
  mkdirSync(storeDir(f), { recursive: true });
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  writeFileSync(resolve(worktree, 'direct-file'), 'direct work\n');
  await command(['git', 'add', 'direct-file'], worktree);
  await command(['git', 'commit', '-m', 'direct work'], worktree);
  return worktree;
}

function configure(f: Fixture, extra: object): void {
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, ...extra });
}

// An inert plain terminal.
async function catTerminal(f: HcFixture, cwd: string): Promise<string> {
  const started: SpawnResult = await f.core.hc(['run', '--bg', '--json', '--no-parent', '--cwd', cwd, '--', 'cat']);
  expect(started.code, started.stderr).toBe(0);
  return z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
}

// Capacity wait rows of one slug from the repo's timings: a leaf refused on capacity records one.
function capacityWaits(f: Fixture, slug: string): unknown[] {
  const file: string = resolve(f.root, 'issues/timings.jsonl');
  const rows: unknown[] = [];
  try {
    for (const line of readFileSync(file, 'utf8')
      .split('\n')
      .filter((line: string) => line !== '')) {
      const row = z
        .object({ kind: z.string(), slug: z.string().optional(), reason: z.string().optional() })
        .parse(JSON.parse(line));
      if (row.kind === 'wait' && row.slug === slug && row.reason === 'capacity') rows.push(row);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  return rows;
}

// The shared assertions of both variants: the lifecycle leaf's A seat starts with its implement task
// and no capacity wait reaches the leaf log or the output.
async function seatsLifecycle(f: HcFixture, result: Result): Promise<void> {
  expect(result.code, result.stderr).toBe(0);
  const seats: Terminal[] = await f.core.terminals({ 'akrogon.leaf': 'lc' }, false);
  expect(seats.map((t: Terminal) => t.labels['akrogon.seat'])).toEqual(['a']);
  const tasks: { seat: string; address: string; text: string }[] = await delivered(f, 'lc');
  expect(tasks).toHaveLength(1);
  expect(tasks[0].text).toBe(`implement-issue lc slot=A phase=implement leaf=${f.root}/issues/open/issue/lc`);
  expect(capacityWaits(f, 'lc')).toEqual([]);
  expect(result.stdout).not.toContain('waiting:');
  expect(result.stdout + result.stderr).not.toContain('max_active');
}

test('an unfinished direct leaf in the same live repo never counts toward max_active', async () => {
  const f: HcFixture = await hcFixture();
  try {
    configure(f, { max_active: 1 });
    const worktree: string = await directWorktree(f, 'fix-alpha');
    const door: string = await catTerminal(f, worktree);
    const reviewer: string = await catTerminal(f, f.home);
    directLeaf(
      f,
      'fix-alpha',
      {
        A: { session: f.core.session, address: door },
        B: { session: f.core.session, address: reviewer },
      },
      { worktree },
    );
    leaf(f, 'lc', 'implement');
    const result: Result = await cli(f, ['next', 'lc'], f.root, f.env);
    await seatsLifecycle(f, result);
  } finally {
    await f.clean();
  }
});

test('an unfinished direct leaf in a repo whose session is unreadable never counts toward max_active', async () => {
  const f: HcFixture = await hcFixture();
  // The second repo is registered and real on disk but has no hc core at all: its repoSpace refusal
  // puts it in activeCount's fallback branch (plan D16f).
  const g: Fixture = await fixture(f.prefix);
  try {
    configure(f, { max_active: 1, repos: { [f.repo]: f.root, [g.repo]: g.root } });
    const gWorktree: string = await directWorktree(g, 'g-direct');
    directLeaf(
      g,
      'g-direct',
      { A: { session: 'no-session', address: 'no-terminal' }, B: { session: 'no-session', address: 'no-terminal' } },
      { worktree: gWorktree },
    );
    const worktree: string = await directWorktree(f, 'fix-alpha');
    const door: string = await catTerminal(f, worktree);
    const reviewer: string = await catTerminal(f, f.home);
    directLeaf(
      f,
      'fix-alpha',
      {
        A: { session: f.core.session, address: door },
        B: { session: f.core.session, address: reviewer },
      },
      { worktree },
    );
    leaf(f, 'lc', 'implement');
    const result: Result = await cli(f, ['next', 'lc'], f.root, f.env);
    await seatsLifecycle(f, result);
  } finally {
    g.clean();
    await f.clean();
  }
});
