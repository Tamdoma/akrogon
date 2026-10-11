import { test, expect } from 'bun:test';
import { z } from 'zod';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeAkrogon, fixture, leaf, storeDir, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';

type BaseRun = Record<string, unknown>;

function records(f: Fixture): BaseRun[] {
  const file: string = resolve(f.root, 'issues/base-runs.jsonl');
  if (!existsSync(file)) return [];
  const text: string = readFileSync(file, 'utf8').trim();
  return text === '' ? [] : text.split('\n').map((line) => JSON.parse(line));
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

async function baseSha(f: Fixture): Promise<string> {
  return command(['git', 'rev-parse', 'HEAD'], f.root);
}

function withSetup(f: Fixture): void {
  yaml(resolve(f.root, 'issues/config.yaml'), {
    setup: 'mkdir -p node_modules',
    checks: { test: 'bun test' },
    grounding: 'none',
  });
}

const akEnv: WeakMap<Fixture, NodeJS.ProcessEnv> = new WeakMap();

async function baseRun(f: Fixture, argv: string[], cwd: string, timeout?: number): Promise<Result> {
  let env: NodeJS.ProcessEnv | undefined = akEnv.get(f);
  if (env === undefined) {
    env = fakeAkrogon(f).env;
    akEnv.set(f, env);
  }
  return cli(f, argv, cwd, env, timeout);
}

test('a base-run logs output, prints status, removes the checkout and records start, end, exit and removal', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const { leafPath, worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    const result: Result = await baseRun(
      f,
      [
        'base-run',
        '--base',
        sha,
        '--',
        'sh',
        '-c',
        'echo marker-run; printf "head=%s\\n" "$(git rev-parse HEAD)"; test ! -e issues && echo no-issues; printf "akbase=%s\\n" "$AKROGON_BASE"',
      ],
      worktree,
    );
    expect(result.code).toBe(0);
    const lines: string[] = result.stdout.split('\n');
    expect(lines[1]).toBe('status: 0');
    const logPath: string = lines[0].replace(/^log: /, '');
    expect(logPath.startsWith(resolve(leafPath, 'implementation') + '/base-')).toBe(true);
    const log: string = readFileSync(logPath, 'utf8');
    expect(log).toContain('marker-run');
    expect(log).toContain(`head=${sha}`);
    expect(log).toContain('no-issues');
    expect(log).toContain(`akbase=${sha}`);
    const run: BaseRun = records(f)[0];
    expect(run.log).toBe(logPath);
    expect(run.base).toBe(sha);
    expect(run.leaf).toBe('caller');
    expect(run.slot).toBe('A');
    expect(run.cwd).toBe('');
    expect(run.command).toEqual([
      'sh',
      '-c',
      'echo marker-run; printf "head=%s\\n" "$(git rev-parse HEAD)"; test ! -e issues && echo no-issues; printf "akbase=%s\\n" "$AKROGON_BASE"',
    ]);
    expect(typeof run.start).toBe('string');
    expect(typeof run.end).toBe('string');
    expect(run.exit).toBe(0);
    expect(typeof run.removed).toBe('string');
    expect(typeof run.pid).toBe('number');
    expect(typeof run.boot_id).toBe('string');
    expect(existsSync(String(run.path))).toBe(false);
    expect(readdirSync(storeDir(f)).filter((name) => name.startsWith('base-'))).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a failing command keeps the same record and cleanup contract', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const { leafPath, worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    const result: Result = await baseRun(
      f,
      ['base-run', '--base', sha, '--', 'sh', '-c', 'echo failing; exit 7'],
      worktree,
    );
    expect(result.code).toBe(7);
    expect(result.stdout.split('\n')[1]).toBe('status: 7');
    const logPath: string = result.stdout.split('\n')[0].replace(/^log: /, '');
    expect(readFileSync(logPath, 'utf8')).toContain('failing');
    const run: BaseRun = records(f)[0];
    expect(run.exit).toBe(7);
    expect(typeof run.removed).toBe('string');
    expect(existsSync(String(run.path))).toBe(false);
    expect(logPath.startsWith(resolve(leafPath, 'implementation'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('a run killed during setup leaves a record with start and no end or removal', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'sleep 30',
      checks: { test: 'bun test' },
      grounding: 'none',
    });
    const { worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    await expect(
      baseRun(f, ['base-run', '--base', sha, '--', 'sh', '-c', 'echo never'], worktree, 6000),
    ).rejects.toThrow();
    const run: BaseRun = records(f)[0];
    expect(typeof run.start).toBe('string');
    expect(run.end).toBeUndefined();
    expect(run.removed).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('two runs of the same command and base create two fresh checkouts', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const { worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    const argv: string[] = ['base-run', '--base', sha, '--', 'sh', '-c', 'echo run'];
    const first: Result = await baseRun(f, argv, worktree);
    const second: Result = await baseRun(f, argv, worktree);
    expect(first.code).toBe(0);
    expect(second.code).toBe(0);
    const runs: BaseRun[] = records(f);
    expect(runs.length).toBe(2);
    expect(runs[0].path).not.toBe(runs[1].path);
    expect(runs[0].run).not.toBe(runs[1].run);
    expect(existsSync(String(runs[0].path))).toBe(false);
    expect(existsSync(String(runs[1].path))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a store target under an ancestor holding package.json is refused before allocation', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    writeFileSync(resolve(f.home, '.akrogon/package.json'), '{}\n');
    const result: Result = await baseRun(f, ['base-run', '--base', sha, '--', 'sh', '-c', 'echo never'], worktree);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(realpathSync(resolve(f.home, '.akrogon')));
    expect(records(f)).toEqual([]);
    expect(readdirSync(storeDir(f)).filter((name) => name.startsWith('base-'))).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a checkout missing its own node_modules after setup is refused and named in the log', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    const result: Result = await baseRun(f, ['base-run', '--base', sha, '--', 'sh', '-c', 'echo unreached'], worktree);
    expect(result.code).not.toBe(0);
    const logPath: string = result.stdout.split('\n')[0].replace(/^log: /, '');
    const log: string = readFileSync(logPath, 'utf8');
    expect(log).toContain('missing own node_modules');
    expect(log).not.toContain('unreached');
    expect(logPath.startsWith(resolve(leafPath, 'implementation'))).toBe(true);
    const run: BaseRun = records(f)[0];
    expect(run.exit).not.toBe(0);
    expect(typeof run.removed).toBe('string');
  } finally {
    f.clean();
  }
});

test('a merge-time run with --attempt logs under the attempt leaf folder and records the parent attempt', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const head: string = await baseSha(f);
    const leafPath: string = leaf(f, 'holder', 'merge', {
      batch: {
        attempt: 'att-123',
        built_on: head,
        holder: { base: head, head },
        members: [],
        applied: true,
      },
    });
    const sha: string = await baseSha(f);
    const result: Result = await baseRun(
      f,
      ['base-run', '--base', sha, '--attempt', 'att-123', '--', 'sh', '-c', 'echo merge-run'],
      f.root,
    );
    expect(result.code).toBe(0);
    const logPath: string = result.stdout.split('\n')[0].replace(/^log: /, '');
    expect(logPath.startsWith(resolve(leafPath, 'implementation') + '/base-')).toBe(true);
    expect(readFileSync(logPath, 'utf8')).toContain('merge-run');
    const run: BaseRun = records(f)[0];
    expect(run.attempt).toBe('att-123');
    expect(run.leaf).toBe('holder');
    expect(run.slot).toBe('B');
  } finally {
    f.clean();
  }
});

test('the base checkout .env carries the leaf generation of declared names and the record the generation and cwd', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    writeFileSync(resolve(f.root, '.env'), 'MY_KEY=v1\nUNDECLARED=drop\n');
    const { worktree } = await callerWorktree(f, 'caller', { env_names: ['MY_KEY'], env_generation: 2 });
    mkdirSync(resolve(worktree, 'src/sub'), { recursive: true });
    const sha: string = await baseSha(f);
    const result: Result = await baseRun(
      f,
      [
        'base-run',
        '--base',
        sha,
        '--',
        'sh',
        '-c',
        'cat "$(git rev-parse --show-toplevel)/.env"; printf "pwd=%s\\n" "$PWD"',
      ],
      resolve(worktree, 'src/sub'),
    );
    expect(result.code).toBe(0);
    const log: string = readFileSync(result.stdout.split('\n')[0].replace(/^log: /, ''), 'utf8');
    expect(log).toContain('MY_KEY=v1');
    expect(log).not.toContain('UNDECLARED');
    const run: BaseRun = records(f)[0];
    expect(run.env_generation).toBe(2);
    expect(run.cwd).toBe('src/sub');
    expect(log).toContain(`pwd=${String(run.path)}/src/sub`);
  } finally {
    f.clean();
  }
});

test('no skill text instructs a seat to create a base checkout by hand', () => {
  const files: string[] = [
    'skills/check-issue/SKILL.md',
    'skills/implement-issue/SKILL.md',
    'skills/merge-issue/SKILL.md',
  ];
  for (const file of files) {
    const text: string = readFileSync(resolve(import.meta.dir, '..', file), 'utf8');
    expect(text).toContain('akrogon base-run --base');
    expect(text).not.toMatch(/base_worktree=\$\(mktemp -d\)/);
    expect(text).not.toContain('git worktree add --detach "$base_worktree"');
    expect(text).not.toContain('git worktree remove --force "$base_worktree"');
  }
});

test('base-run removes its TMPDIR and command temporary files on success and failure', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const { worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    for (const code of [0, 7]) {
      const result: Result = await baseRun(
        f,
        [
          'base-run',
          '--base',
          sha,
          '--',
          'sh',
          '-c',
          `printf '%s' "$TMPDIR"; touch "$TMPDIR/command-temp"; exit ${code}`,
        ],
        worktree,
      );
      expect(result.code).toBe(code);
      const runRoot: string = readFileSync(result.stdout.split('\n')[0].replace(/^log: /, ''), 'utf8');
      expect(existsSync(runRoot)).toBe(false);
    }
  } finally {
    f.clean();
  }
});

test('base-run replays an exact configured check with its supplied base and relative cwd', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      setup: 'mkdir -p node_modules',
      checks: { test: 'printf "base=%s\\ncwd=%s\\n" "$AKROGON_BASE" "$PWD"' },
      grounding: 'none',
    });
    writeFileSync(resolve(f.root, 'file'), 'new base\n');
    await command(['git', 'add', 'file'], f.root);
    await command(['git', 'commit', '-m', 'advance beyond tracking base'], f.root);
    const { leafPath, worktree } = await callerWorktree(f);
    const sha: string = await baseSha(f);
    mkdirSync(resolve(worktree, 'src/sub'), { recursive: true });
    const config: { checks: { test: string } } = z
      .object({ checks: z.object({ test: z.string() }) })
      .parse(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout));
    const result: Result = await baseRun(
      f,
      ['base-run', '--base', sha, '--', 'sh', '-c', config.checks.test],
      resolve(worktree, 'src/sub'),
    );
    expect(result.code).toBe(0);
    const log: string = readFileSync(result.stdout.split('\n')[0].replace(/^log: /, ''), 'utf8');
    expect(log).toContain(`base=${sha}`);
    expect(log).toContain(`cwd=${String(records(f)[0].path)}/src/sub`);
    expect(readdirSync(resolve(leafPath, 'implementation')).some((name) => name.startsWith('check-test-'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('merge base-run refuses relative and absolute cwd values outside its checkout before allocation', async () => {
  const f: Fixture = await fixture();
  try {
    withSetup(f);
    const sha: string = await baseSha(f);
    leaf(f, 'holder', 'merge', {
      batch: { attempt: 'att-cwd', built_on: sha, holder: { base: sha, head: sha }, members: [], applied: true },
    });
    const marker: string = resolve(f.home, 'command-ran');
    for (const inside of ['../escaped', resolve(f.home, 'absolute')]) {
      const result: Result = await baseRun(
        f,
        ['base-run', '--base', sha, '--attempt', 'att-cwd', '--cwd', inside, '--', 'touch', marker],
        f.root,
      );
      expect(result.code).not.toBe(0);
      expect(existsSync(marker)).toBe(false);
      expect(records(f)).toEqual([]);
      expect(existsSync(resolve(storeDir(f), inside))).toBe(false);
    }
  } finally {
    f.clean();
  }
});
