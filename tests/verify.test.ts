import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  cli,
  entry,
  fakeAkrogon,
  fakeHerdr,
  fixture,
  greenReceipt,
  leaf,
  seedRun,
  storeDir,
  unitBin,
  yaml,
  type Fixture,
} from './helpers';
import type { Database } from './fake-herdr';
import { command, type Result } from '../src/shell';
import { readRepo, type Repo } from '../src/config';
import { readState } from '../src/state';
import { requireGreenReceipt, verifyCommands, verifyRunSchema, type VerifyRun } from '../src/verify';

function records(f: Fixture): VerifyRun[] {
  const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
  if (!existsSync(file)) return [];
  const text: string = readFileSync(file, 'utf8').trim();
  return text === '' ? [] : text.split('\n').map((line) => verifyRunSchema.parse(JSON.parse(line)));
}

async function callerWorktree(
  f: Fixture,
  slug: string = 'caller',
  extra: object = {},
): Promise<{ leafPath: string; worktree: string }> {
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', worktree, '-b', slug], f.root);
  const leafPath: string = leaf(f, slug, 'implement', { ...extra, worktree });
  return { leafPath, worktree };
}

async function commitIn(worktree: string, file: string): Promise<string> {
  writeFileSync(resolve(worktree, file), `${file}\n`);
  await command(['git', 'add', file], worktree);
  await command(['git', 'commit', '-m', `add ${file}`], worktree);
  return command(['git', 'rev-parse', 'HEAD'], worktree);
}

function config(f: Fixture, extra: object): void {
  yaml(resolve(f.root, 'issues/config.yaml'), { setup: 'mkdir -p node_modules', grounding: 'none', ...extra });
}

const akEnv: WeakMap<Fixture, NodeJS.ProcessEnv> = new WeakMap();

async function verify(f: Fixture, args: string[], cwd: string, timeout?: number): Promise<Result> {
  let env: NodeJS.ProcessEnv | undefined = akEnv.get(f);
  if (env === undefined) {
    env = fakeAkrogon(f).env;
    akEnv.set(f, env);
  }
  return cli(f, ['verify', ...args], cwd, env, timeout);
}

test('verify runs every leaf check on a fresh checkout of HEAD, keeps logs and writes one receipt', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, {
      checks: {
        probe:
          'printf "head=%s\\nakbase=%s\\nbus=%s\\n" "$(git rev-parse HEAD)" "$AKROGON_BASE" "$DBUS_SESSION_BUS_ADDRESS"; test ! -e issues && echo no-issues',
        red: 'echo failing; exit 7',
        after: 'echo after-red',
      },
      merge_checks: { full: 'echo merge-only' },
    });
    const { leafPath, worktree } = await callerWorktree(f);
    const base: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const sha: string = await commitIn(worktree, 'code.ts');
    const result: Result = await verify(f, [], worktree);
    expect(result.code).toBe(1);
    const run: VerifyRun = records(f)[0];
    expect(run).toMatchObject({ repo: 'repo', leaf: 'caller', sha, scope: 'leaf' });
    expect(run.commands.map((item) => [item.name, item.exit])).toEqual([
      ['probe', 0],
      ['red', 7],
      ['after', 0],
    ]);
    const probe: string = readFileSync(run.commands[0].log, 'utf8');
    expect(probe).toContain(`head=${sha}`);
    expect(probe).toContain(`akbase=${base}`);
    expect(probe).toContain('bus=unix:path=/nonexistent');
    expect(probe).toContain('no-issues');
    expect(readFileSync(run.commands[2].log, 'utf8')).toContain('after-red');
    for (const item of run.commands)
      expect(item.log.startsWith(resolve(leafPath, 'implementation') + '/check-')).toBe(true);
    expect(typeof run.end).toBe('string');
    expect(existsSync(run.path)).toBe(false);
    expect(readdirSync(storeDir(f)).filter((name) => name.startsWith('verify-'))).toEqual([]);
  } finally {
    f.clean();
  }
});

test('verify runs setup once per checkout, then every command in that checkout', async () => {
  const f: Fixture = await fixture();
  try {
    const counter: string = resolve(f.home, 'setup-count');
    config(f, {
      setup: `mkdir -p node_modules; echo setup >> ${counter}; touch prepared`,
      checks: { first: 'test -e prepared && pwd', second: 'test -e prepared && pwd' },
    });
    const { worktree } = await callerWorktree(f);
    expect((await verify(f, [], worktree)).code).toBe(0);
    expect(readFileSync(counter, 'utf8')).toBe('setup\n');
    const run: VerifyRun = records(f)[0];
    expect(run.commands.map((item) => [item.name, item.exit])).toEqual([
      ['first', 0],
      ['second', 0],
    ]);
    expect(run.commands[0].log).not.toBe(run.commands[1].log);
    expect(readFileSync(run.commands[0].log, 'utf8')).toContain(run.path);
    expect(readFileSync(run.commands[1].log, 'utf8')).toContain(run.path);
  } finally {
    f.clean();
  }
});

test('verify checks out the commit, not the caller tree: an ignored file in the worktree is absent', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { fresh: 'test ! -e residue.log && echo fresh-tree' } });
    const { worktree } = await callerWorktree(f);
    writeFileSync(resolve(worktree, '.gitignore'), '.env\nresidue.log\n');
    await command(['git', 'add', '.gitignore'], worktree);
    await command(['git', 'commit', '-m', 'ignore residue'], worktree);
    writeFileSync(resolve(worktree, 'residue.log'), 'stale\n');
    const result: Result = await verify(f, [], worktree);
    expect(result.code).toBe(0);
    expect(existsSync(resolve(worktree, 'residue.log'))).toBe(true);
    expect(readFileSync(records(f)[0].commands[0].log, 'utf8')).toContain('fresh-tree');
  } finally {
    f.clean();
  }
});

test('--sha verifies another revision under the same caller', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { head: 'git rev-parse HEAD' } });
    const { worktree } = await callerWorktree(f);
    const base: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    await commitIn(worktree, 'code.ts');
    const result: Result = await verify(f, ['--sha', 'HEAD~1'], worktree);
    expect(result.code).toBe(0);
    expect(records(f)[0].sha).toBe(base);
    expect(readFileSync(records(f)[0].commands[0].log, 'utf8')).toContain(base);
  } finally {
    f.clean();
  }
});

test('a merge caller runs checks outside merge_covers, then merge_checks', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, {
      checks: { unit: 'echo unit', covered: 'echo covered' },
      merge_checks: { full: 'echo full' },
      merge_covers: ['covered'],
    });
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const leafPath: string = leaf(f, 'holder', 'merge', {
      batch: { attempt: 'att-123', built_on: head, holder: { base: head, head }, applied: true, members: [] },
    });
    const result: Result = await verify(f, ['--attempt', 'att-123'], f.root);
    expect(result.code).toBe(0);
    const run: VerifyRun = records(f)[0];
    expect(run).toMatchObject({ leaf: 'holder', scope: 'merge', sha: head });
    expect(run.commands.map((item) => item.name)).toEqual(['unit', 'full']);
    expect(run.commands[0].log.startsWith(resolve(leafPath, 'implementation'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('--attempt from the repo root verifies the merge leaf worktree HEAD', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { unit: 'echo unit' } });
    const { worktree } = await callerWorktree(f, 'holder');
    const sha: string = await commitIn(worktree, 'code.ts');
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    leaf(f, 'holder', 'merge', {
      worktree,
      batch: { attempt: 'att-1', built_on: head, holder: { base: head, head: sha }, applied: true, members: [] },
    });
    expect((await verify(f, ['--attempt', 'att-1'], f.root)).code).toBe(0);
    expect(records(f)[0]).toMatchObject({ leaf: 'holder', scope: 'merge', sha });
  } finally {
    f.clean();
  }
});

test('a non-leaf caller with --holder verifies at merge scope and logs into the holder', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { unit: 'echo unit' }, merge_checks: { full: 'echo full' } });
    const direct: string = resolve(storeDir(f), 'direct');
    await command(['git', 'worktree', 'add', direct, '-b', 'direct'], f.root);
    const sha: string = await commitIn(direct, 'code.ts');
    const holder: string = resolve(f.home, 'chart/direct');
    const result: Result = await verify(f, ['--holder', holder], direct);
    expect(result.code).toBe(0);
    const run: VerifyRun = records(f)[0];
    expect(run).toMatchObject({ leaf: 'checkout', scope: 'merge', sha });
    expect(run.commands.map((item) => item.name)).toEqual(['unit', 'full']);
    expect(run.commands[1].log.startsWith(holder + '/check-full-')).toBe(true);
  } finally {
    f.clean();
  }
});

test('a run killed during setup leaves a record with start and no end or removal', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { setup: 'sleep 30', checks: { test: 'true' }, grounding: 'none' });
    const { worktree } = await callerWorktree(f);
    await expect(verify(f, [], worktree, 6000)).rejects.toThrow();
    const run: VerifyRun = records(f)[0];
    expect(typeof run.start).toBe('string');
    expect(run.end).toBeUndefined();
  } finally {
    f.clean();
  }
}, 15000);

test('a store target under an ancestor holding package.json is refused before allocation', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await callerWorktree(f);
    writeFileSync(resolve(f.home, '.akrogon/package.json'), '{}\n');
    const result: Result = await verify(f, [], worktree);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(realpathSync(resolve(f.home, '.akrogon')));
    expect(records(f)).toEqual([]);
    expect(readdirSync(storeDir(f)).filter((name) => name.startsWith('verify-'))).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a checkout missing its own node_modules is refused and named in the log', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'echo unreached' }, grounding: 'none' });
    const { worktree } = await callerWorktree(f);
    writeFileSync(resolve(worktree, 'package.json'), '{"name":"repo"}\n');
    await command(['git', 'add', 'package.json'], worktree);
    await command(['git', 'commit', '-m', 'add package.json'], worktree);
    const result: Result = await verify(f, [], worktree);
    expect(result.code).not.toBe(0);
    const run: VerifyRun = records(f)[0];
    const log: string = readFileSync(run.commands[0].log, 'utf8');
    expect(log).toContain('missing own node_modules');
    expect(log).not.toContain('unreached');
    expect(run.commands[0].exit).not.toBe(0);
    expect(existsSync(run.path)).toBe(false);
  } finally {
    f.clean();
  }
});

test('a failed setup with no configured checks exits red and its receipt is refused', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { setup: 'exit 7', checks: {} });
    const { worktree } = await callerWorktree(f);
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    expect((await verify(f, [], worktree)).code).not.toBe(0);
    expect(records(f)[0]).toMatchObject({ sha, scope: 'leaf', setup: 7, commands: [] });
    await expect(requireGreenReceipt(readRepo('repo', f.root), sha, 'leaf')).rejects.toThrow(
      'No green leaf verify receipt',
    );
  } finally {
    f.clean();
  }
});

test('known-red refuses a failed head setup when the base setup passes and no checks are configured', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { setup: 'test ! -f head-only', checks: {} });
    const { worktree } = await callerWorktree(f);
    const sha: string = await commitIn(worktree, 'head-only');
    const result: Result = await verify(f, ['--known-red'], worktree);
    expect(records(f)[0]).toMatchObject({ setup: 1, commands: [] });
    expect(result.code).toBe(1);
    await expect(requireGreenReceipt(readRepo('repo', f.root), sha, 'leaf')).rejects.toThrow(
      'No green leaf verify receipt',
    );
  } finally {
    f.clean();
  }
});

test('a green receipt covers another commit with the same tree and command set without a second run', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { unit: 'echo unit' } });
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    expect((await verify(f, [], worktree)).code).toBe(0);
    await command(['git', 'commit', '--allow-empty', '-m', 'trailer only'], worktree);
    const sha: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    const reused: Result = await verify(f, [], worktree);
    expect(reused.code).toBe(0);
    expect(reused.stdout).toBe(`reuse receipt ${records(f)[0].run} tree=${tree}`);
    expect(records(f)).toHaveLength(1);
    await requireGreenReceipt(readRepo('repo', f.root), sha, 'leaf');
  } finally {
    f.clean();
  }
});

test('a green receipt is refused for a different tree', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { unit: 'echo unit' } });
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    expect((await verify(f, [], worktree)).code).toBe(0);
    const changed: string = await commitIn(worktree, 'other.ts');
    await expect(requireGreenReceipt(readRepo('repo', f.root), changed, 'leaf')).rejects.toThrow(
      `No green leaf verify receipt for ${changed}`,
    );
  } finally {
    f.clean();
  }
});

test('a green receipt is refused under a different command set and verify runs again', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { checks: { unit: 'echo unit' } });
    const { worktree } = await callerWorktree(f);
    const sha: string = await commitIn(worktree, 'code.ts');
    expect((await verify(f, [], worktree)).code).toBe(0);
    config(f, { checks: { unit: 'echo unit changed' } });
    await expect(requireGreenReceipt(readRepo('repo', f.root), sha, 'leaf')).rejects.toThrow(
      `No green leaf verify receipt for ${sha}`,
    );
    expect((await verify(f, [], worktree)).code).toBe(0);
    expect(records(f)).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('the verify checkout .env carries the declared names only', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, { env: ['MY_KEY'], checks: { env: 'cat .env' } });
    writeFileSync(resolve(f.root, '.env'), 'MY_KEY=v1\nUNDECLARED=drop\n');
    const { worktree } = await callerWorktree(f);
    mkdirSync(resolve(worktree, 'src/sub'), { recursive: true });
    const result: Result = await verify(f, [], resolve(worktree, 'src/sub'));
    expect(result.code).toBe(0);
    const log: string = readFileSync(records(f)[0].commands[0].log, 'utf8');
    expect(log).toContain('MY_KEY=v1');
    expect(log).not.toContain('UNDECLARED');
  } finally {
    f.clean();
  }
});

test('verify removes each command TMPDIR on success and failure', async () => {
  const f: Fixture = await fixture();
  try {
    config(f, {
      checks: {
        ok: `printf '%s' "$TMPDIR"; touch "$TMPDIR/command-temp"`,
        bad: `printf '%s' "$TMPDIR"; touch "$TMPDIR/command-temp"; exit 7`,
      },
    });
    const { worktree } = await callerWorktree(f);
    expect((await verify(f, [], worktree)).code).toBe(1);
    for (const item of records(f)[0].commands) expect(existsSync(readFileSync(item.log, 'utf8'))).toBe(false);
  } finally {
    f.clean();
  }
});

// The failing script's `(fail)` lines name a tracked file's content, so the
// same configured command fails differently on the head and base trees.
async function failureScript(f: Fixture, name: string, extra: Record<string, string> = {}): Promise<void> {
  writeFileSync(
    resolve(f.root, 'check.sh'),
    `name=$(cat failure); echo "(fail) $name"; for p in ${Object.keys(extra).join(' ')}; do echo "(fail) $p"; done; exit 7\n`,
  );
  writeFileSync(resolve(f.root, 'failure'), `${name}\n`);
  yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'sh check.sh' }, grounding: 'none' });
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'add failing check'], f.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
}

test('verify --known-red reruns the failing command on a fresh checkout of the exact base and records the linked pair', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const { leafPath, worktree } = await callerWorktree(f);
    const head: string = await commitIn(worktree, 'code.ts');
    const base: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], worktree);
    greenReceipt(f, base, 'leaf');
    const result: Result = await verify(f, ['--known-red'], worktree);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`verify known-red ${head}: pass`);
    const runs: VerifyRun[] = records(f);
    const headRun: VerifyRun | undefined = runs.find((run) => run.sha === head);
    const baseRun: VerifyRun | undefined = runs.find((run) => run.compares === headRun?.run);
    expect(baseRun?.sha).toBe(base);
    expect(headRun?.commands.map((item) => item.exit)).toEqual([7]);
    expect(baseRun?.compares).toBe(headRun?.run);
    expect(baseRun?.commands.map((item) => item.exit)).toEqual([7]);
    for (const run of runs) expect(run.compares === undefined || run.run === baseRun?.run).toBe(true);
    expect((await cli(f, ['phase', 'caller', 'check.review', '--slot', 'A'], worktree)).code).toBe(0);
    expect(readState(leafPath).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('known-red accepts a later qualifying base comparison after an earlier comparison fails', async () => {
  const f: Fixture = await fixture();
  try {
    const marker: string = resolve(f.home, 'base-seen');
    writeFileSync(
      resolve(f.root, 'check.sh'),
      `if test ! -f head-only && test ! -f '${marker}'; then touch '${marker}'; echo runner-unavailable; exit 8; fi\necho '(fail) alpha'; exit 7\n`,
    );
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'add base check'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    config(f, { checks: { test: 'sh check.sh' } });
    const { leafPath, worktree } = await callerWorktree(f);
    await commitIn(worktree, 'head-only');
    expect((await verify(f, ['--known-red'], worktree)).code).toBe(1);
    expect((await verify(f, ['--known-red'], worktree)).code).toBe(0);
    const runs: VerifyRun[] = records(f);
    expect(runs).toHaveLength(3);
    expect(runs.slice(1).map((run) => run.compares)).toEqual([runs[0].run, runs[0].run]);
    const moved: Result = await cli(f, ['phase', 'caller', 'check.review', '--slot', 'A'], worktree);
    expect(moved.code).toBe(0);
    expect(readState(leafPath).phase).toBe('check.review');
  } finally {
    f.clean();
  }
});

test('verify --known-red refuses a head failure absent on the base', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const { leafPath, worktree } = await callerWorktree(f);
    writeFileSync(resolve(worktree, 'failure'), 'beta\n');
    await command(['git', 'add', 'failure'], worktree);
    await command(['git', 'commit', '-m', 'different failing test'], worktree);
    const result: Result = await verify(f, ['--known-red'], worktree);
    expect(result.code).not.toBe(0);
    expect(result.stdout).toContain('verify known-red');
    const refused: Result = await cli(f, ['phase', 'caller', 'check.review', '--slot', 'A'], worktree);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('No green leaf verify receipt');
    expect(readState(leafPath).phase).toBe('implement');
  } finally {
    f.clean();
  }
});

test('a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await callerWorktree(f);
    const head: string = await commitIn(worktree, 'code.ts');
    const tree: string = await command(['git', 'rev-parse', 'HEAD^{tree}'], worktree);
    const base: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], worktree);
    const baseTree: string = await command(['git', 'rev-parse', `${base}^{tree}`], f.root);
    const repo: Repo = readRepo('repo', f.root);
    const cmds: { name: string; command: string }[] = verifyCommands(repo.config, 'leaf');
    const file: string = resolve(f.root, 'issues/verify-runs.jsonl');
    const log = (name: string, content: string): string => {
      const path: string = resolve(leafPath, name);
      writeFileSync(path, content);
      return path;
    };
    const redAlpha: string = log('red.log', '(fail) alpha\n');
    const noNames: string = log('plain.log', 'boom\n');
    const gone: string = resolve(leafPath, 'gone.log');
    const headRun = (overrides: Partial<VerifyRun> = {}): VerifyRun =>
      seedRun(f, {
        sha: head,
        tree,
        scope: 'leaf',
        commands: cmds.map((item) => ({ ...item, exit: 7, log: redAlpha })),
        ...overrides,
      });
    const baseRun = (headRunId: string, overrides: Partial<VerifyRun> = {}): VerifyRun =>
      seedRun(f, {
        sha: base,
        tree: baseTree,
        scope: 'leaf',
        compares: headRunId,
        commands: cmds.map((item) => ({ ...item, exit: 7, log: redAlpha })),
        ...overrides,
      });
    const reset = (): void => writeFileSync(file, '');
    const refuse = async (): Promise<void> => {
      await expect(requireGreenReceipt(repo, head, 'leaf')).rejects.toThrow(`No green leaf verify receipt for ${head}`);
    };

    reset();
    headRun({ commands: cmds.map((item) => ({ ...item, exit: 7, log: noNames })) });
    baseRun(records(f).at(-1)!.run);
    await refuse();

    reset();
    headRun({ commands: cmds.map((item) => ({ ...item, exit: 7, log: gone })) });
    baseRun(records(f).at(-1)!.run);
    await refuse();

    reset();
    headRun();
    baseRun(records(f).at(-1)!.run, {
      commands: cmds.map((item) => ({ name: item.name, command: `${item.command} --old`, exit: 7, log: redAlpha })),
    });
    await refuse();

    reset();
    headRun();
    baseRun(records(f).at(-1)!.run, { end: undefined });
    await refuse();

    reset();
    const unended: VerifyRun = headRun({ end: undefined });
    baseRun(unended.run);
    await refuse();

    reset();
    headRun();
    baseRun(records(f).at(-1)!.run, { setup: 3 });
    await refuse();

    reset();
    headRun();
    baseRun(records(f).at(-1)!.run, {
      commands: cmds.map((item) => ({ ...item, exit: 0, log: noNames })),
    });
    await refuse();

    reset();
    headRun();
    baseRun(records(f).at(-1)!.run);
    await requireGreenReceipt(repo, head, 'leaf');
  } finally {
    f.clean();
  }
});

test('plain verify on a red head writes only its own run', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    const result: Result = await verify(f, [], worktree);
    expect(result.code).toBe(1);
    const runs: VerifyRun[] = records(f);
    expect(runs).toHaveLength(1);
    expect(runs[0].compares).toBeUndefined();
  } finally {
    f.clean();
  }
});

function noticeEnv(f: Fixture): NodeJS.ProcessEnv {
  const herdr: { env: NodeJS.ProcessEnv } = fakeHerdr(f);
  return { ...herdr.env, PATH: `${resolve(f.home, 'bin')}:${unitBin(f)}:${process.env.PATH}` };
}

function noticeCalls(f: Fixture): string[][] {
  const file: string = resolve(f.home, 'herdr.json.calls');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as string[])
    .filter((args) => args[0] === 'notification');
}

function herdrDb(f: Fixture): Database {
  return JSON.parse(readFileSync(resolve(f.home, 'herdr.json'), 'utf8')) as Database;
}

function baseRecord(f: Fixture, head: VerifyRun): VerifyRun {
  const found: VerifyRun | undefined = records(f).find((run) => run.compares === head.run);
  if (found === undefined) throw new Error(`no base run for ${head.run}`);
  return found;
}

test('a fresh red base run sends one main-red notice and records the reason', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    const result: Result = await cli(f, ['verify', '--known-red'], worktree, noticeEnv(f));
    expect(result.code).toBe(0);
    const runs: VerifyRun[] = records(f);
    const head: VerifyRun = runs.find((run) => run.compares === undefined)!;
    const baseRun: VerifyRun = baseRecord(f, head);
    expect(noticeCalls(f)).toEqual([
      [
        'notification',
        'show',
        'repo main red',
        '--body',
        `1 new red on main: alpha; receipt ${baseRun.run}; chart a repair`,
        '--sound',
        'none',
      ],
    ]);
    expect(baseRun.notice).toBe('shown');
    expect(head.notice).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('a later base run red on the same unresolved unit sends nothing', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const { worktree: first } = await callerWorktree(f, 'one');
    const { worktree: second } = await callerWorktree(f, 'two');
    await commitIn(first, 'a.ts');
    await commitIn(second, 'b.ts');
    expect((await cli(f, ['verify', '--known-red'], first, env)).code).toBe(0);
    expect((await cli(f, ['verify', '--known-red'], second, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(1);
    const bases: VerifyRun[] = records(f).filter((run) => run.compares !== undefined);
    expect(bases).toHaveLength(2);
    expect(bases.filter((run) => run.notice !== undefined).map((run) => run.notice)).toEqual(['shown']);
  } finally {
    f.clean();
  }
});

test('the incident resolves only on green evidence at or after the red on landed main', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const { worktree: w1 } = await callerWorktree(f, 'one');
    await commitIn(w1, 'a.ts');
    expect((await cli(f, ['verify', '--known-red'], w1, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(1);

    // A green leaf-head run does not resolve: the unit stays covered by the first notice.
    const { worktree: wOk } = await callerWorktree(f, 'fixer');
    writeFileSync(resolve(wOk, 'check.sh'), 'echo ok; exit 0\n');
    await command(['git', 'add', 'check.sh'], wOk);
    await command(['git', 'commit', '-m', 'fix the check'], wOk);
    expect((await cli(f, ['verify'], wOk, env)).code).toBe(0);
    await commitIn(w1, 'more.ts');
    expect((await cli(f, ['verify', '--known-red'], w1, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(1);

    // Once that green head is main it resolves the incident; a new red re-notifies.
    await command(['git', 'push', 'origin', 'HEAD:main'], wOk);
    await command(['git', 'merge', '--ff-only', 'origin/main'], f.root);
    writeFileSync(resolve(f.root, 'check.sh'), 'name=$(cat failure); echo "(fail) $name"; exit 7\n');
    await command(['git', 'add', 'check.sh'], f.root);
    await command(['git', 'commit', '-m', 'break alpha again'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const { worktree: w3 } = await callerWorktree(f, 'after');
    const head3: string = await commitIn(w3, 'new.ts');
    expect((await cli(f, ['verify', '--known-red'], w3, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(2);
    const second: VerifyRun | undefined = records(f).find((run) => run.sha === head3);
    expect(baseRecord(f, second!).notice).toBe('shown');

    // A green on an older revision finishing later never clears the newer red.
    const s1: string = await command(['git', 'rev-parse', 'origin/main~1'], f.root);
    greenReceipt(f, s1, 'leaf');
    const { worktree: w4 } = await callerWorktree(f, 'later');
    await commitIn(w4, 'yet.ts');
    expect((await cli(f, ['verify', '--known-red'], w4, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(2);
    expect(records(f).filter((run) => run.notice === 'shown')).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('a failed herdr call is recorded and retried by the next base run', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    writeFileSync(resolve(f.home, 'herdr.json'), JSON.stringify({ ...herdrDb(f), failNotification: true }));
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    const first: Result = await cli(f, ['verify', '--known-red'], worktree, env);
    expect(first.code).toBe(0);
    expect(first.stderr).toContain('notice: ');
    const base1: VerifyRun | undefined = records(f).find((run) => run.compares !== undefined);
    expect(base1?.notice).toBe('error');
    writeFileSync(resolve(f.home, 'herdr.json'), JSON.stringify({ ...herdrDb(f), failNotification: false }));
    await commitIn(worktree, 'more.ts');
    const second: Result = await cli(f, ['verify', '--known-red'], worktree, env);
    expect(second.code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(2);
    const bases: VerifyRun[] = records(f).filter((run) => run.compares !== undefined);
    expect(bases.map((run) => run.notice)).toEqual(['error', 'shown']);
  } finally {
    f.clean();
  }
});

test('an absent herdr binary is recorded as error and verify keeps its result', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const bin: string = resolve(f.home, 'noherdr');
    mkdirSync(bin);
    symlinkSync(process.execPath, resolve(bin, 'bun'));
    symlinkSync(entry, resolve(bin, 'akrogon'));
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    const result: Result = await cli(f, ['verify', '--known-red'], worktree, {
      PATH: `${bin}:${unitBin(f)}:/usr/bin:/bin`,
    });
    expect(result.code).toBe(0);
    expect(result.stderr).toContain('notice: ');
    expect(records(f).find((run) => run.compares !== undefined)?.notice).toBe('error');
  } finally {
    f.clean();
  }
});

test('two simultaneous base runs produce one notification', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const { worktree: w1 } = await callerWorktree(f, 'one');
    const { worktree: w2 } = await callerWorktree(f, 'two');
    await commitIn(w1, 'a.ts');
    await commitIn(w2, 'b.ts');
    const [first, second]: Result[] = await Promise.all([
      cli(f, ['verify', '--known-red'], w1, env),
      cli(f, ['verify', '--known-red'], w2, env),
    ]);
    expect([first.code, second.code]).toEqual([0, 0]);
    expect(noticeCalls(f)).toHaveLength(1);
    const bases: VerifyRun[] = records(f).filter((run) => run.compares !== undefined);
    expect(bases).toHaveLength(2);
    expect(bases.filter((run) => run.notice === 'shown')).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('a pending notice left by a dead process does not block the next send', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const { leafPath, worktree } = await callerWorktree(f);
    await commitIn(worktree, 'code.ts');
    const base: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], worktree);
    const baseTree: string = await command(['git', 'rev-parse', `${base}^{tree}`], f.root);
    const log: string = resolve(leafPath, 'red.log');
    writeFileSync(log, '(fail) alpha\n');
    const repo: Repo = readRepo('repo', f.root);
    const seeded: VerifyRun = seedRun(f, {
      sha: base,
      tree: baseTree,
      scope: 'leaf',
      compares: 'dead-head',
      notice: 'pending',
      pid: 2 ** 22 + 12345,
      boot_id: 'older-boot',
      commands: verifyCommands(repo.config, 'leaf').map((item) => ({ ...item, exit: 7, log })),
    });
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const result: Result = await cli(f, ['verify', '--known-red'], worktree, env);
    expect(result.code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(1);
    const runs: VerifyRun[] = records(f);
    expect(runs.find((run) => run.run === seeded.run)?.notice).toBe('pending');
    expect(runs.find((run) => run.compares !== undefined && run.notice === 'shown')).toBeDefined();
  } finally {
    f.clean();
  }
});

test('a green on the same revision clears only the earlier main-red incident', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const { worktree } = await callerWorktree(f);
    await commitIn(worktree, 'one.ts');
    expect((await cli(f, ['verify', '--known-red'], worktree, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(1);

    const base: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    greenReceipt(f, base, 'leaf');
    await commitIn(worktree, 'two.ts');
    expect((await cli(f, ['verify', '--known-red'], worktree, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(2);

    await commitIn(worktree, 'three.ts');
    expect((await cli(f, ['verify', '--known-red'], worktree, env)).code).toBe(0);
    expect(noticeCalls(f)).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('a failed base setup does not send a main-red test notice', async () => {
  const f: Fixture = await fixture();
  try {
    await failureScript(f, 'alpha');
    config(f, { setup: 'echo dependency-install-failed; exit 9', checks: { test: 'sh check.sh' } });
    const env: NodeJS.ProcessEnv = noticeEnv(f);
    const { worktree } = await callerWorktree(f);
    const head: string = await commitIn(worktree, 'code.ts');
    expect((await cli(f, ['verify', '--known-red'], worktree, env)).code).toBe(1);
    const run: VerifyRun = baseRecord(f, records(f).find((record) => record.sha === head)!);
    expect(run.setup).toBe(9);
    expect(run.end).toBeDefined();
    expect(noticeCalls(f)).toHaveLength(0);
    expect(run.notice).toBeUndefined();
  } finally {
    f.clean();
  }
});
