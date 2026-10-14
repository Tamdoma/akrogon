import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeAkrogon, fixture, leaf, storeDir, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { verifyRunSchema, type VerifyRun } from '../src/verify';

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
    expect(typeof run.removed).toBe('string');
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
      batch: { attempt: 'att-123', built_on: head, holder: { base: head, head }, members: [], applied: true },
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
    expect(run.removed).toBeUndefined();
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
    const result: Result = await verify(f, [], worktree);
    expect(result.code).not.toBe(0);
    const run: VerifyRun = records(f)[0];
    const log: string = readFileSync(run.commands[0].log, 'utf8');
    expect(log).toContain('missing own node_modules');
    expect(log).not.toContain('unreached');
    expect(run.commands[0].exit).not.toBe(0);
    expect(typeof run.removed).toBe('string');
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

test('no skill text runs a base checkout or a raw check set by hand', () => {
  for (const file of [
    'skills/implement-issue/SKILL.md',
    'skills/merge-issue/SKILL.md',
    'skills/chart-issues/SKILL.md',
  ]) {
    const text: string = readFileSync(resolve(import.meta.dir, '..', file), 'utf8');
    expect(text, file).toContain('akrogon verify');
    expect(text, file).not.toContain('base-run');
  }
});
