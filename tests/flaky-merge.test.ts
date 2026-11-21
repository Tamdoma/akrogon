import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command, type Result } from '../src/shell';
import { readRepo, type Repo } from '../src/config';
import { flakyLines } from '../src/flaky';
import { verifyRunSchema, type VerifyRun } from '../src/verify';
import { cli, fixture, leaf, seedRun, storeDir, yaml, type Fixture } from './helpers';

// One verify run holding a single command entry. `patch_id` is the field this leaf adds; rows
// without it model the ledger as written before this change.
type Step = {
  tree: string;
  command: string;
  exit: number;
  end?: string;
  scope?: 'leaf' | 'merge';
  leaf?: string;
  sha?: string;
  compares?: string;
  patch_id?: string;
  failures?: string[];
};

function run(f: Fixture, step: Step, index: number): VerifyRun {
  return {
    run: `r${index}`,
    repo: f.repo,
    leaf: step.leaf ?? 'leaf',
    sha: step.sha ?? `s${index}`,
    tree: step.tree,
    scope: step.scope ?? 'merge',
    ...(step.compares === undefined ? {} : { compares: step.compares }),
    ...(step.patch_id === undefined ? {} : { patch_id: step.patch_id }),
    path: '/tmp/x',
    pid: 1,
    boot_id: 'b',
    setup: 0,
    commands: [
      {
        name: 'test',
        command: step.command,
        exit: step.exit,
        log: resolve(f.home, 'none.log'),
        ...(step.failures === undefined ? {} : { failures: step.failures }),
      },
    ],
    start: '2026-10-14T00:00:00.000Z',
    end: step.end,
  };
}

function pair(
  command: string,
  patch: string | undefined,
  end: { red: string; green: string } = { red: '2026-10-14T01:00:00.000Z', green: '2026-10-14T02:00:00.000Z' },
): Step[] {
  return [
    {
      tree: `${command}-A`,
      command,
      exit: 1,
      end: end.red,
      failures: ['alpha'],
      ...(patch === undefined ? {} : { patch_id: patch }),
    },
    {
      tree: `${command}-B`,
      command,
      exit: 0,
      end: end.green,
      ...(patch === undefined ? {} : { patch_id: patch }),
    },
  ];
}

function records(f: Fixture): VerifyRun[] {
  const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
  if (!existsSync(file)) return [];
  const text: string = readFileSync(file, 'utf8').trim();
  return text === '' ? [] : text.split('\n').map((line: string) => verifyRunSchema.parse(JSON.parse(line)));
}

async function callerWorktree(f: Fixture, slug: string): Promise<{ leafPath: string; worktree: string }> {
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  const leafPath: string = leaf(f, slug, 'implement', { worktree });
  return { leafPath, worktree };
}

async function commitIn(worktree: string, file: string, contents: string = `${file}\n`): Promise<string> {
  writeFileSync(resolve(worktree, file), contents);
  await command(['git', 'add', file], worktree);
  await command(['git', 'commit', '-m', `add ${file}`], worktree);
  return command(['git', 'rev-parse', 'HEAD'], worktree);
}

async function verify(f: Fixture, args: string[], cwd: string): Promise<Result> {
  return cli(f, ['verify', ...args], cwd);
}

test('a named unit red then green on the leaf’s next merge run across a rebase lists one flip', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const steps: Step[] = [
      // Different trees, one leaf, consecutive merge runs, the recorded patch id unchanged.
      { tree: 'A', command: 'bun test', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      { tree: 'B', command: 'bun test', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
    ];
    const runs: VerifyRun[] = steps.map((step, index) => run(f, step, index));
    expect(await flakyLines(repo, runs)).toEqual([
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
    for (const item of runs) seedRun(f, item);
    const result: Result = await cli(f, ['flaky']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe('1 2026-10-14T02:00:00.000Z test alpha');
  } finally {
    f.clean();
  }
});

test('a verify receipt records the merge-base..sha patch id, and none on an empty own diff', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      grounding: 'none',
      checks: { probe: 'echo probe' },
    });
    const { worktree } = await callerWorktree(f, 'caller');
    const sha: string = await commitIn(worktree, 'code.ts');
    expect((await verify(f, [], worktree)).code).toBe(0);
    const run: VerifyRun = records(f)[0];
    const expected: string = (
      await command(
        [
          'sh',
          '-c',
          'git diff "$(git merge-base "$1" refs/remotes/origin/main)" "$1" | git patch-id --stable',
          'sh',
          sha,
        ],
        f.root,
      )
    ).split(/\s/)[0];
    expect(run.patch_id).toBe(expected);
    // A run whose sha is its merge-base has no own diff and records no field.
    const holder: string = resolve(f.home, 'chart/direct');
    mkdirSync(holder, { recursive: true });
    const mainSha: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    expect((await verify(f, ['--sha', mainSha, '--holder', holder], f.root)).code).toBe(0);
    const empty: VerifyRun | undefined = records(f).find((item) => item.sha === mainSha);
    expect(empty?.patch_id).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('a clean rebase over a nearby edit preserves the leaf patch identity', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', checks: { test: 'bun test alpha.test.ts' } });
    const marker: string = resolve(f.home, 'ready');
    await commitIn(
      f.root,
      'alpha.test.ts',
      `import { existsSync } from 'node:fs';
import { expect, test } from 'bun:test';
test('alpha', () => expect(existsSync(${JSON.stringify(marker)})).toBe(true));
`,
    );
    const original: string =
      '// header\n// old comment\nexport const a = 1;\nexport const b = 2;\nexport const own = 3;\n';
    await commitIn(f.root, 'code.ts', original);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const { worktree } = await callerWorktree(f, 'caller');
    leaf(f, 'caller', 'merge', { worktree });
    await commitIn(worktree, 'code.ts', original.replace('own = 3', 'own = 4'));
    expect((await verify(f, [], worktree)).code).toBe(1);

    await commitIn(f.root, 'code.ts', original.replace('old comment', 'new comment'));
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'rebase', 'origin/main'], worktree);
    writeFileSync(marker, 'ready\n');
    expect((await verify(f, [], worktree)).code).toBe(0);

    const [red, green]: VerifyRun[] = records(f);
    expect(green.tree).not.toBe(red.tree);
    const result: Result = await cli(f, ['flaky']);
    expect(result.code).toBe(0);
    expect(result.stdout.split(' ')).toEqual(['1', green.end, 'test', 'alpha']);
  } finally {
    f.clean();
  }
});

test('changing whitespace in a string to fix a test does not count as a flip', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', checks: { test: 'bun test alpha.test.ts' } });
    await commitIn(
      f.root,
      'alpha.test.ts',
      `import { expect, test } from 'bun:test';
import { state } from './code';
test('alpha', () => expect(state).toBe('readynow'));
`,
    );
    await commitIn(f.root, 'code.ts', "export const state = 'initial';\n");
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const { worktree } = await callerWorktree(f, 'caller');
    leaf(f, 'caller', 'merge', { worktree });
    await commitIn(worktree, 'code.ts', "export const state = 'ready now';\n");
    expect((await verify(f, [], worktree)).code).toBe(1);

    await commitIn(worktree, 'code.ts', "export const state = 'readynow';\n");
    await commitIn(f.root, 'main-file');
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'rebase', 'origin/main'], worktree);
    expect((await verify(f, [], worktree)).code).toBe(0);

    const result: Result = await cli(f, ['flaky']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe('');
  } finally {
    f.clean();
  }
});

test('verify runs checks on an explicitly selected commit with unrelated history', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      checks: { probe: 'echo probe' },
    });
    const { worktree } = await callerWorktree(f, 'caller');
    const orphan: string = await command(['git', 'commit-tree', 'HEAD^{tree}', '-m', 'unrelated'], f.root);
    const result: Result = await verify(f, ['--sha', orphan], worktree);
    expect(result.code).toBe(0);
    const receipt: VerifyRun = records(f)[0];
    expect(receipt).toMatchObject({ sha: orphan, setup: 0, commands: [{ name: 'probe', exit: 0 }] });
    expect(receipt.patch_id).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('nameless failures never flip across trees while a named one does', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const steps: Step[] = [
      {
        tree: 'A',
        command: 'bun test',
        exit: 1,
        end: '2026-10-14T01:00:00.000Z',
        failures: ['alpha', '(script) t:x', '(unnamed)', '(unnamed) t:y', '(no test name)', '(log gone)'],
        patch_id: 'p',
      },
      { tree: 'B', command: 'bun test', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
    ];
    expect(
      await flakyLines(
        repo,
        steps.map((step, index) => run(f, step, index)),
      ),
    ).toEqual([{ name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' }]);
  } finally {
    f.clean();
  }
});

test('changed own commits, a different leaf, a fieldless row and a non-consecutive pair never flip', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const steps: Step[] = [
      // The leaf's own commits changed between the runs: no flip on c1, while c2 controls.
      { tree: 'A1', command: 'c1', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p1' },
      { tree: 'B1', command: 'c1', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p2' },
      ...pair('c2', 'same'),
      // A different leaf's green never pairs: no flip on c3, while c4 controls.
      {
        tree: 'A3',
        command: 'c3',
        exit: 1,
        end: '2026-10-14T01:00:00.000Z',
        leaf: 'leaf',
        failures: ['alpha'],
        patch_id: 'p',
      },
      { tree: 'B3', command: 'c3', exit: 0, end: '2026-10-14T02:00:00.000Z', leaf: 'other', patch_id: 'p' },
      ...pair('c4', 'same'),
      // A red row written before this change cannot prove unchanged commits: no flip on c5.
      { tree: 'A5', command: 'c5', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'] },
      { tree: 'B5', command: 'c5', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      ...pair('c6', 'same'),
      // Only the immediately preceding red pairs: red, red, green on c7 leaves the first red dead
      // (its own patch id differs) and the second unpaired, while c8 controls.
      { tree: 'A7', command: 'c7', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'q' },
      { tree: 'A7b', command: 'c7', exit: 1, end: '2026-10-14T01:30:00.000Z', failures: ['alpha'], patch_id: 'r' },
      { tree: 'B7', command: 'c7', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      ...pair('c8', 'same'),
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((step, index) => run(f, step, index)),
        )
      ).sort((a, b) => a.last.localeCompare(b.last)),
    ).toEqual([
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('a base run failing the unit between the pair breaks it; other shapes still flip', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const steps: Step[] = [
      // A compares run failing alpha between the runs: no flip on c9.
      { tree: 'A9', command: 'c9', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'base9',
        command: 'c9',
        exit: 1,
        end: '2026-10-14T01:30:00.000Z',
        scope: 'merge',
        leaf: 'basebot',
        sha: 'x9',
        compares: 'whatever',
        failures: ['alpha'],
      },
      { tree: 'B9', command: 'c9', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      // A compares run failing a different test does not break: c10 flips.
      { tree: 'A10', command: 'c10', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'base10',
        command: 'c10',
        exit: 1,
        end: '2026-10-14T01:30:00.000Z',
        leaf: 'basebot',
        sha: 'x10',
        compares: 'whatever',
        failures: ['beta'],
      },
      { tree: 'B10', command: 'c10', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      // A compares run ending after the green is not between: c11 flips.
      { tree: 'A11', command: 'c11', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'base11',
        command: 'c11',
        exit: 1,
        end: '2026-10-14T03:00:00.000Z',
        leaf: 'basebot',
        sha: 'x11',
        compares: 'whatever',
        failures: ['alpha'],
      },
      { tree: 'B11', command: 'c11', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((step, index) => run(f, step, index)),
        )
      ).sort((a, b) => a.last.localeCompare(b.last)),
    ).toEqual([
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('a landed-main run failing the unit between the pair breaks it; a non-ancestor or evicted sha does not', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    // A real commit landed on the tracked main, and a real commit that never lands.
    writeFileSync(resolve(f.root, 'main-change'), 'landed\n');
    await command(['git', 'add', 'main-change'], f.root);
    await command(['git', 'commit', '-m', 'landed change'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const landed: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'checkout', '--detach', 'HEAD'], f.root);
    writeFileSync(resolve(f.root, 'off-main'), 'not landed\n');
    await command(['git', 'add', 'off-main'], f.root);
    await command(['git', 'commit', '-m', 'unlanded'], f.root);
    const unlanded: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    await command(['git', 'checkout', 'main'], f.root);
    const steps: Step[] = [
      // The landed run failed alpha between the pair: no flip on c12.
      { tree: 'A12', command: 'c12', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'main',
        command: 'c12',
        exit: 1,
        end: '2026-10-14T01:30:00.000Z',
        leaf: 'watcher',
        sha: landed,
        failures: ['alpha'],
      },
      { tree: 'B12', command: 'c12', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      // A run on a commit that never landed does not break: c13 flips.
      { tree: 'A13', command: 'c13', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'side',
        command: 'c13',
        exit: 1,
        end: '2026-10-14T01:30:00.000Z',
        leaf: 'watcher',
        sha: unlanded,
        failures: ['alpha'],
      },
      { tree: 'B13', command: 'c13', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
      // A run whose sha is gone from the repo does not break and never throws: c14 flips.
      { tree: 'A14', command: 'c14', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'], patch_id: 'p' },
      {
        tree: 'gone',
        command: 'c14',
        exit: 1,
        end: '2026-10-14T01:30:00.000Z',
        leaf: 'watcher',
        sha: 'evicted',
        failures: ['alpha'],
      },
      { tree: 'B14', command: 'c14', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p' },
    ];
    expect(
      (
        await flakyLines(
          repo,
          steps.map((step, index) => run(f, step, index)),
        )
      ).sort((a, b) => a.last.localeCompare(b.last)),
    ).toEqual([
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
  } finally {
    f.clean();
  }
});

test('same-tree pairs count as today, with or without the new field', async (): Promise<void> => {
  const f: Fixture = await fixture();
  try {
    const repo: Repo = readRepo(f.repo, f.root);
    const steps: Step[] = [
      // Rows in the pre-change shape (no patch_id): the same-tree pair still counts,
      // and old rows still parse through the command.
      { tree: 'A', command: 'bun test', exit: 1, end: '2026-10-14T01:00:00.000Z', failures: ['alpha'] },
      { tree: 'A', command: 'bun test', exit: 0, end: '2026-10-14T02:00:00.000Z' },
      // A same-tree pair ignores the field entirely, even a mismatch that cannot occur for real rows.
      {
        tree: 'B',
        command: 'bun run all',
        exit: 1,
        end: '2026-10-14T01:00:00.000Z',
        failures: ['beta'],
        patch_id: 'p1',
      },
      { tree: 'B', command: 'bun run all', exit: 0, end: '2026-10-14T02:00:00.000Z', patch_id: 'p2' },
    ];
    const runs: VerifyRun[] = steps.map((step, index) => run(f, step, index));
    expect((await flakyLines(repo, runs)).sort((a, b) => a.test.localeCompare(b.test))).toEqual([
      { name: 'test', test: 'alpha', count: 1, last: '2026-10-14T02:00:00.000Z' },
      { name: 'test', test: 'beta', count: 1, last: '2026-10-14T02:00:00.000Z' },
    ]);
    for (const item of runs) seedRun(f, item);
    const result: Result = await cli(f, ['flaky']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('alpha');
    expect(result.stdout).toContain('beta');
  } finally {
    f.clean();
  }
});
