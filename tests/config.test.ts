import { test, expect } from 'bun:test';
import { isAbsolute, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { fixture, cli, leaf, yaml, type Fixture } from './helpers';
import { command, run, type Result } from '../src/shell';
import { SeatIndexError, readGlobal, readRepo, seats, type GlobalConfig, type Repo } from '../src/config';

test('config combines defaults and repo values, reports none, and recalculates worktree base', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      fix_rounds: 2,
      implement: 'inline',
      remote: 'upstream',
      default_branch: 'trunk',
      grounding: 'none',
    });
    const unset = await cli(f, ['config']);
    expect(unset.code).toBe(0);
    expect(Bun.YAML.parse(unset.stdout)).toMatchObject({ max_active: 3, batch_limit: 4 });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      fix_rounds: 2,
      implement: 'inline',
      remote: 'upstream',
      default_branch: 'trunk',
      batch_limit: 2,
      grounding: 'none',
    });
    await command(['git', 'update-ref', 'refs/remotes/upstream/trunk', 'HEAD'], f.root);
    const config = await cli(f, ['config']);
    expect(config.code).toBe(0);
    expect(Bun.YAML.parse(config.stdout)).toMatchObject({
      max_active: 3,
      fix_rounds: 2,
      implement: 'inline',
      batch_limit: 2,
      repo: 'repo',
      remote: 'upstream',
    });
    expect(Bun.YAML.parse((await cli(f, ['config'], f.home)).stdout)).toMatchObject({
      repo: 'none',
      fix_rounds: 3,
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'work');
    await command(['git', 'worktree', 'add', '-b', 'leaf', worktree], f.root);
    const first: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    expect(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout)).toMatchObject({
      AKROGON_BASE: first,
      repo: 'repo',
    });
    writeFileSync(resolve(f.root, 'file'), 'next\n');
    await command(['git', 'commit', '-am', 'next'], f.root);
    await command(['git', 'update-ref', 'refs/remotes/upstream/trunk', 'HEAD'], f.root);
    await command(['git', 'rebase', 'upstream/trunk'], worktree);
    const second: string = await command(['git', 'rev-parse', 'HEAD'], worktree);
    expect(second).not.toBe(first);
    expect(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout)).toMatchObject({ AKROGON_BASE: second });
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 0, grounding: 'none' });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { max_active: 2, grounding: 'none' });
    const badRepo = await cli(f, ['config']);
    expect(badRepo.code).not.toBe(0);
    expect(badRepo.stderr).toContain('max_active');
    for (const value of [0, -1, 1.5]) {
      yaml(resolve(f.root, 'issues/config.yaml'), { batch_limit: value, grounding: 'none' });
      const badLimit = await cli(f, ['config']);
      expect(badLimit.code).not.toBe(0);
      expect(badLimit.stderr).toContain('batch_limit');
    }
  } finally {
    f.clean();
  }
});

test('commonDirectory spawns git once per call and reports failures with cwd', async () => {
  const f: Fixture = await fixture();
  try {
    const nested: string = resolve(f.root, 'issues/open');
    const linked: string = resolve(f.home, 'linked');
    await command(['git', 'worktree', 'add', '-b', 'linked', linked], f.root);
    const nonRepo: string = resolve(f.home, 'nonrepo');
    mkdirSync(nonRepo);
    const expected: string = realpathSync(resolve(f.root, '.git'));
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    const bin: string = resolve(f.home, 'bin');
    mkdirSync(bin);
    const log: string = resolve(f.home, 'git.log');
    writeFileSync(resolve(bin, 'git'), '#!/bin/sh\necho "$1 $2" >> "' + log + '"\nexec "' + realGit + '" "$@"\n', {
      mode: 0o755,
    });
    const toolRoot: string = resolve(import.meta.dir, '..');
    const script: string =
      'import { commonDirectory } from "./src/config.ts";\nconst out = [];\nfor (const cwd of process.argv.slice(2)) out.push(await commonDirectory(cwd));\nconsole.log(JSON.stringify(out));\n';
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
      [process.execPath, '-e', script, 'placeholder', f.root, nested, linked, nonRepo],
      {
        cwd: toolRoot,
        env: { ...process.env, PATH: bin + ':' + process.env.PATH },
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      },
    );
    const stdout: string = await new Response(child.stdout).text();
    const stderr: string = await new Response(child.stderr).text();
    const code: number = await child.exited;
    expect(code).toBe(0);
    expect(stderr.trim()).toBe('');
    expect(JSON.parse(stdout.trim())).toEqual([expected, expected, expected, null]);
    const lines: string[] = readFileSync(log, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(4);
    expect(lines).toEqual(Array(4).fill('rev-parse --git-common-dir'));
    writeFileSync(resolve(bin, 'git'), '#!/bin/sh\necho "fatal: disk gone" >&2\nexit 128\n', { mode: 0o755 });
    const failing: string =
      'import { commonDirectory } from "./src/config.ts";\nawait commonDirectory(process.argv[2]);\n';
    const failed: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
      [process.execPath, '-e', failing, 'placeholder', f.root],
      {
        cwd: toolRoot,
        env: { ...process.env, PATH: bin + ':' + process.env.PATH },
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      },
    );
    const failStdout: string = await new Response(failed.stdout).text();
    const failStderr: string = await new Response(failed.stderr).text();
    const failCode: number = await failed.exited;
    expect(failCode).not.toBe(0);
    expect(failStderr).toContain(f.root);
    expect(failStderr).toContain('disk gone');
    expect(failStdout.trim()).toBe('');
  } finally {
    f.clean();
  }
});

test('config rejects invalid slots shapes and accepts empty slots', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { c: { harness: 'fake', model: 'm', effort: 'e' } },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'x' } },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', slots: { a: null } });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', slots: {} });
    expect((await cli(f, ['config'])).code).toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'x"y', effort: 'low' } },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: "x'y", effort: 'low' } },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: '   ', effort: 'low' } },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none' });
    yaml(resolve(f.home, 'config.yaml'), {
      slots: {
        a: { harness: 'fake', model: 'x"y', effort: 'high' },
        b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
      },
      harnesses: { fake: 'fake --model {model} --effort {effort}' },
      repos: { repo: f.root },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.home, 'config.yaml'), {
      slots: {
        a: { harness: 'fake', model: 'strong-a', effort: 'high' },
        b: { harness: 'fake', model: ' ', effort: 'medium' },
      },
      harnesses: { fake: 'fake --model {model} --effort {effort}' },
      repos: { repo: f.root },
    });
    expect((await cli(f, ['config'])).code).not.toBe(0);
  } finally {
    f.clean();
  }
});

test('config prints merged slots from root, linked worktree, and global outside', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'repo-a', effort: 'low' } },
    });
    const atRoot = await cli(f, ['config']);
    expect(atRoot.code).toBe(0);
    expect(Bun.YAML.parse(atRoot.stdout)).toMatchObject({
      slots: { a: { model: 'repo-a' }, b: { model: 'strong-b' } },
    });
    const linked: string = resolve(f.home, 'linked-slots');
    await command(['git', 'worktree', 'add', '-b', 'linked-slots', linked], f.root);
    const atLinked = await cli(f, ['config'], linked);
    expect(atLinked.code).toBe(0);
    expect(Bun.YAML.parse(atLinked.stdout)).toMatchObject({
      slots: { a: { model: 'repo-a' }, b: { model: 'strong-b' } },
    });
    const outside = await cli(f, ['config'], f.home);
    expect(outside.code).toBe(0);
    expect(Bun.YAML.parse(outside.stdout)).toMatchObject({
      slots: { a: { model: 'strong-a' }, b: { model: 'strong-b' } },
    });
  } finally {
    f.clean();
  }
});

test('config prints worktree_store matching the leaf path for every root shape and caller', async () => {
  const f: Fixture = await fixture();
  try {
    const root: string = realpathSync(f.root);
    type StoreParsed = { worktree_root: string; worktree_store: string };
    const check = (parsed: StoreParsed, worktreeRoot: string, worktreeStore: string): void => {
      expect(parsed).toMatchObject({ worktree_root: worktreeRoot, worktree_store: worktreeStore });
      expect(isAbsolute(parsed.worktree_store)).toBe(true);
    };
    check(
      Bun.YAML.parse((await cli(f, ['config'])).stdout) as StoreParsed,
      'issues/worktrees',
      resolve(root, 'issues/worktrees'),
    );
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', worktree_root: 'custom/trees' });
    check(
      Bun.YAML.parse((await cli(f, ['config'])).stdout) as StoreParsed,
      'custom/trees',
      resolve(root, 'custom/trees'),
    );
    const absolute: string = resolve(f.home, 'absolute-trees');
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', worktree_root: absolute });
    const atRoot = Bun.YAML.parse((await cli(f, ['config'])).stdout) as StoreParsed;
    check(atRoot, absolute, absolute);
    const linked: string = resolve(f.home, 'linked-store');
    await command(['git', 'worktree', 'add', '-b', 'linked-store', linked], f.root);
    const atLinked = Bun.YAML.parse((await cli(f, ['config'], linked)).stdout) as StoreParsed;
    check(atLinked, absolute, absolute);
    expect(atLinked.worktree_store).toBe(atRoot.worktree_store);
    const outside = Bun.YAML.parse((await cli(f, ['config'], f.home)).stdout);
    expect(outside).toMatchObject({ repo: 'none' });
    expect(outside).not.toHaveProperty('worktree_store');
  } finally {
    f.clean();
  }
});

test('config prints per-repo merged slots with two overrides', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { a: { harness: 'fake', model: 'f-a', effort: 'low' } },
    });
    yaml(resolve(g.root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'fake', model: 'g-b', effort: 'low' } },
    });
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
    yaml(resolve(f.home, 'config.yaml'), { ...global, repos: { repo: f.root, other: g.root } });
    const fConfig = await cli(f, ['config'], f.root);
    expect(fConfig.code).toBe(0);
    expect(Bun.YAML.parse(fConfig.stdout)).toMatchObject({
      repo: 'repo',
      slots: { a: { model: 'f-a' }, b: { model: 'strong-b' } },
    });
    const gConfig = await cli(f, ['config'], g.root);
    expect(gConfig.code).toBe(0);
    expect(Bun.YAML.parse(gConfig.stdout)).toMatchObject({
      repo: 'other',
      slots: { a: { model: 'strong-a' }, b: { model: 'g-b' } },
    });
  } finally {
    f.clean();
    g.clean();
  }
});

test('config reports merge_checks separately from checks', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none' });
    expect(Bun.YAML.parse((await cli(f, ['config'])).stdout)).toMatchObject({ merge_checks: {} });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      merge_checks: { full: 'bun run verify' },
      grounding: 'none',
    });
    const result = await cli(f, ['config']);
    expect(result.code).toBe(0);
    expect(Bun.YAML.parse(result.stdout)).toMatchObject({
      checks: { test: 'bun test' },
      merge_checks: { full: 'bun run verify' },
    });
  } finally {
    f.clean();
  }
});

test('config requires explicit grounding', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'bun test' } });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
    const result = await cli(f, ['config']);
    expect(result.code).toBe(0);
    expect(Bun.YAML.parse(result.stdout)).toMatchObject({ grounding: 'none' });
  } finally {
    f.clean();
  }
});

test('config prints direct, defaults it to false, and rejects non-boolean values', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = resolve(f.root, 'issues/config.yaml');
    yaml(path, { grounding: 'none', direct: true });
    const direct = await cli(f, ['config']);
    expect(direct.code).toBe(0);
    expect(Bun.YAML.parse(direct.stdout)).toMatchObject({ direct: true });
    expect((await cli(f, ['status'])).code).toBe(0);
    yaml(path, { grounding: 'none' });
    expect(Bun.YAML.parse((await cli(f, ['config'])).stdout)).toMatchObject({ direct: false });
    expect(Bun.YAML.parse((await cli(f, ['config'], f.home)).stdout)).toMatchObject({ repo: 'none', direct: false });
    for (const value of ['yes', '1']) {
      writeFileSync(path, `grounding: none\ndirect: ${value}\n`);
      const bad = await cli(f, ['config']);
      expect(bad.code).not.toBe(0);
      expect(bad.stderr).toContain('direct');
    }
  } finally {
    f.clean();
  }
});

async function installFixture(f: Fixture, config: object): Promise<void> {
  mkdirSync(resolve(f.root, 'vendor/widget'), { recursive: true });
  writeFileSync(resolve(f.root, 'vendor/widget/package.json'), JSON.stringify({ name: 'widget', version: '1.0.0' }));
  writeFileSync(resolve(f.root, 'vendor/widget/index.js'), 'module.exports = 1;\n');
  writeFileSync(
    resolve(f.root, 'package.json'),
    JSON.stringify({ name: 'repo', dependencies: { widget: 'file:vendor/widget' } }),
  );
  writeFileSync(resolve(f.root, '.gitignore'), '.env\nnode_modules/\n');
  await command(['bun', 'install'], f.root);
  await command(['git', 'add', '.'], f.root);
  await command(['git', 'commit', '-m', 'fixture install'], f.root);
  yaml(resolve(f.root, 'issues/config.yaml'), config);
}

test('config composes setup into printed checks, merge_checks and advisory identically from worktree', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'bun install --frozen-lockfile',
      checks: { t: 'bun test' },
      merge_checks: { m: 'bun run verify' },
      advisory: ['bun run lint'],
      grounding: 'none',
    });
    const composed = (cmd: string): string =>
      `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && sh -c '${cmd}'`;
    type Printed = { checks: Record<string, string>; merge_checks: Record<string, string>; advisory: string[] };
    const atRoot = Bun.YAML.parse((await cli(f, ['config'])).stdout) as Printed;
    expect(atRoot).toMatchObject({
      setup: 'bun install --frozen-lockfile',
      checks: { t: composed('bun test') },
      merge_checks: { m: composed('bun run verify') },
      advisory: [composed('bun run lint')],
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    const atWorktree = Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as Printed;
    expect(atWorktree.checks).toEqual(atRoot.checks);
    expect(atWorktree.merge_checks).toEqual(atRoot.merge_checks);
    expect(atWorktree.advisory).toEqual(atRoot.advisory);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { t: 'bun test' },
      merge_checks: { m: 'bun run verify' },
      advisory: ['bun run lint'],
      grounding: 'none',
    });
    expect(Bun.YAML.parse((await cli(f, ['config'])).stdout)).toMatchObject({
      checks: { t: 'bun test' },
      merge_checks: { m: 'bun run verify' },
      advisory: ['bun run lint'],
    });
  } finally {
    f.clean();
  }
});

test('config printed check installs into a fresh worktree without a separate install step', async () => {
  const f: Fixture = await fixture();
  try {
    await installFixture(f, {
      setup: 'bun install --frozen-lockfile',
      checks: { resolve: `bun -e 'console.log(require.resolve("widget"))'` },
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.resolve;
    const result: Result = await run(['sh', '-c', printed], worktree);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`${worktree}/node_modules/widget/`);
  } finally {
    f.clean();
  }
});

test('config printed check resolves the worktree lockfile version over the root install', async () => {
  const f: Fixture = await fixture();
  try {
    await installFixture(f, {
      setup: 'bun install --frozen-lockfile',
      checks: {
        version: `bun -e 'console.log(require("widget/package.json").version); console.log(require.resolve("widget"))'`,
      },
      grounding: 'none',
    });
    mkdirSync(resolve(f.root, 'vendor/widget2'), { recursive: true });
    writeFileSync(resolve(f.root, 'vendor/widget2/package.json'), JSON.stringify({ name: 'widget', version: '2.0.0' }));
    writeFileSync(resolve(f.root, 'vendor/widget2/index.js'), 'module.exports = 2;\n');
    writeFileSync(
      resolve(f.root, 'package.json'),
      JSON.stringify({ name: 'repo', dependencies: { widget: 'file:vendor/widget2' } }),
    );
    await command(['bun', 'install', '--lockfile-only'], f.root);
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'widget2'], f.root);
    expect(JSON.parse(readFileSync(resolve(f.root, 'node_modules/widget/package.json'), 'utf8')).version).toBe('1.0.0');
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.version;
    const result: Result = await run(['sh', '-c', printed], worktree);
    expect(result.code).toBe(0);
    expect(result.stdout.split('\n')).toContain('2.0.0');
    expect(result.stdout).toContain(`${worktree}/node_modules/`);
    expect(result.stdout).not.toContain(`${f.root}/node_modules/`);
  } finally {
    f.clean();
  }
});

test('config printed checks run concurrently in one worktree and leave it clean', async () => {
  const f: Fixture = await fixture();
  try {
    await installFixture(f, {
      setup: 'bun install --frozen-lockfile',
      checks: { a: 'true', b: 'true', c: 'true', d: 'true' },
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    const checks: Record<string, string> = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks;
    const results: Result[] = await Promise.all(
      Object.values(checks).map((printed: string) => run(['sh', '-c', printed], worktree)),
    );
    expect(results.map((result: Result) => result.code)).toEqual([0, 0, 0, 0]);
    expect(await command(['git', 'status', '--porcelain'], worktree)).toBe('');
  } finally {
    f.clean();
  }
});

test('config printed check skips both sides of a || b when the frozen lockfile mismatches', async () => {
  const f: Fixture = await fixture();
  try {
    await installFixture(f, {
      setup: 'bun install --frozen-lockfile',
      checks: { either: `touch ${f.home}/a || touch ${f.home}/b` },
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    mkdirSync(resolve(worktree, 'vendor/widget2'), { recursive: true });
    writeFileSync(
      resolve(worktree, 'vendor/widget2/package.json'),
      JSON.stringify({ name: 'widget', version: '2.0.0' }),
    );
    writeFileSync(
      resolve(worktree, 'package.json'),
      JSON.stringify({ name: 'repo', dependencies: { widget: 'file:vendor/widget2' } }),
    );
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.either;
    const result: Result = await run(['sh', '-c', printed], worktree);
    expect(result.code).not.toBe(0);
    expect(result.stderr.toLowerCase()).toContain('lockfile');
    expect(existsSync(resolve(f.home, 'a'))).toBe(false);
    expect(existsSync(resolve(f.home, 'b'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('config runs all of setup inside the install lock', async () => {
  const f: Fixture = await fixture();
  try {
    const marker: string = resolve(f.home, 'setup-marker');
    await installFixture(f, {
      setup: `touch ${marker} && ! flock -n "$(git rev-parse --git-path akrogon-install.lock)" true`,
      checks: { ok: 'true' },
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.ok;
    const result: Result = await run(['sh', '-c', printed], worktree);
    expect(result.code).toBe(0);
    expect(existsSync(marker)).toBe(true);
  } finally {
    f.clean();
  }
});

test('seats resolves index seats nearest-first and reports each seat source', async () => {
  const f: Fixture = await fixture();
  const previous: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = f.home;
  try {
    const root: string = realpathSync(f.root);
    yaml(resolve(root, 'issues/config.yaml'), {
      grounding: 'none',
      slots: { b: { harness: 'fake', model: 'repo-b', effort: 'low' } },
    });
    const global: GlobalConfig = readGlobal();
    const repo: Repo = readRepo('repo', root);
    const repoConfig: string = resolve(root, 'issues/config.yaml');
    const machineConfig: string = resolve(f.home, 'config.yaml');
    const owner: string = resolve(root, 'issues/open/issue');
    mkdirSync(resolve(owner, 'depth2'), { recursive: true });
    const issueFile: string = resolve(owner, 'ISSUE.md');
    writeFileSync(
      issueFile,
      '---\nslots:\n  a:\n    harness: fake\n    model: index-a\n    effort: low\n---\n# Title\n',
    );
    const two = seats(global, repo, resolve(owner, 'depth2'));
    expect(two.a).toEqual({ harness: 'fake', model: 'index-a', effort: 'low' });
    expect(two.b).toEqual({ harness: 'fake', model: 'repo-b', effort: 'low' });
    expect(two.source).toEqual({ a: issueFile, b: repoConfig });
    mkdirSync(resolve(root, 'issues/closed/done/leaf3'), { recursive: true });
    const closedFile: string = resolve(root, 'issues/closed/done/ISSUE.md');
    writeFileSync(
      closedFile,
      '---\nslots:\n  b:\n    harness: fake\n    model: closed-b\n    effort: low\n---\n# Done\n',
    );
    const closed = seats(global, repo, resolve(root, 'issues/closed/done/leaf3'));
    expect(closed.b).toEqual({ harness: 'fake', model: 'closed-b', effort: 'low' });
    expect(closed.source).toEqual({ a: machineConfig, b: closedFile });
    const epic: string = resolve(root, 'issues/open/epic');
    mkdirSync(resolve(epic, 'thing/leaf3'), { recursive: true });
    const epicFile: string = resolve(epic, 'EPIC.md');
    writeFileSync(
      epicFile,
      '---\nslots:\n  a:\n    harness: fake\n    model: epic-a\n    effort: low\n  b:\n    harness: fake\n    model: epic-b\n    effort: high\n---\n# Epic\n',
    );
    const issue3File: string = resolve(epic, 'thing/ISSUE.md');
    writeFileSync(
      issue3File,
      '---\nslots:\n  a:\n    harness: fake\n    model: issue-a\n    effort: high\n---\n# Issue\n',
    );
    const three = seats(global, repo, resolve(epic, 'thing/leaf3'));
    expect(three.a).toEqual({ harness: 'fake', model: 'issue-a', effort: 'high' });
    expect(three.b).toEqual({ harness: 'fake', model: 'epic-b', effort: 'high' });
    expect(three.source).toEqual({ a: issue3File, b: epicFile });
    writeFileSync(resolve(owner, 'ISSUE.md'), '# No front matter\n');
    const plain = seats(global, repo, resolve(owner, 'depth2'));
    expect(plain.source).toEqual({ a: machineConfig, b: repoConfig });
    expect(plain.a.model).toBe('strong-a');
    const stray = seats(global, repo, resolve(root, 'elsewhere/leaf'));
    expect(stray.source).toEqual({ a: machineConfig, b: repoConfig });
  } finally {
    if (previous === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = previous;
    f.clean();
  }
});

test('seats throws SeatIndexError naming the file and seat for malformed indexes', async () => {
  const f: Fixture = await fixture();
  const previous: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = f.home;
  try {
    const root: string = realpathSync(f.root);
    yaml(resolve(root, 'issues/config.yaml'), { grounding: 'none' });
    const global: GlobalConfig = readGlobal();
    const repo: Repo = readRepo('repo', root);
    const owner: string = resolve(root, 'issues/open/issue');
    const leafPath: string = resolve(owner, 'bad');
    mkdirSync(leafPath, { recursive: true });
    const file: string = resolve(owner, 'ISSUE.md');
    const failure = (body: string, needles: string[]): void => {
      writeFileSync(file, body);
      try {
        seats(global, repo, leafPath);
        throw new Error('seats did not throw');
      } catch (error) {
        expect(error).toBeInstanceOf(SeatIndexError);
        expect((error as SeatIndexError).file).toBe(file);
        for (const needle of needles) expect((error as Error).message).toContain(needle);
      }
    };
    failure('---\nslots:\n\t- x\n---\n# t\n', [file]);
    failure('---\nslots:\n  a:\n    harness: fake\n    model: a\n    effort: low\n', [file]);
    failure('---\nfoo: 1\n---\n# t\n', [file, 'foo']);
    failure('---\n---\n# t\n', [file]);
    failure('---\nslots: 5\n---\n# t\n', [file, 'slots']);
    failure('---\nslots:\n  c:\n    harness: fake\n    model: a\n    effort: low\n---\n# t\n', [file, 'c']);
    failure('---\nslots:\n  a:\n    harness: fake\n    model: a\n---\n# t\n', [file, 'slots.a']);
    failure('---\nslots:\n  a:\n    harness: fake\n    model: "   "\n    effort: low\n---\n# t\n', [file, 'slots.a']);
    failure('---\nslots:\n  a:\n    harness: fake\n    model: "x\'y"\n    effort: low\n---\n# t\n', [file, 'slots.a']);
    failure('---\nslots:\n  a:\n    harness: absent\n    model: a\n    effort: low\n---\n# t\n', [file, 'a', 'absent']);
    rmSync(file);
    expect(seats(global, repo, leafPath).source.a).toBe(resolve(f.home, 'config.yaml'));
  } finally {
    if (previous === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = previous;
    f.clean();
  }
});

test('config prints leaf-resolved slots in a managed leaf worktree only', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none' });
    const worktree: string = resolve(f.root, 'issues/worktrees/managed-leaf');
    await command(['git', 'worktree', 'add', '-b', 'managed-leaf', worktree], f.root);
    leaf(f, 'managed-leaf', 'implement', { worktree }, 'issue');
    const indexFile: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
    writeFileSync(
      indexFile,
      '---\nslots:\n  a:\n    harness: fake\n    model: index-a\n    effort: low\n---\n# Title\n',
    );
    const atWorktree = await cli(f, ['config'], worktree);
    expect(atWorktree.code).toBe(0);
    const parsed = Bun.YAML.parse(atWorktree.stdout) as { slots: Record<string, unknown> };
    expect(parsed.slots).toEqual({
      a: { harness: 'fake', model: 'index-a', effort: 'low' },
      b: { harness: 'fake', model: 'strong-b', effort: 'medium' },
    });
    expect(parsed.slots).not.toHaveProperty('source');
    mkdirSync(resolve(worktree, 'sub/dir'), { recursive: true });
    const atSubdir = await cli(f, ['config'], resolve(worktree, 'sub/dir'));
    expect(atSubdir.code).toBe(0);
    expect(Bun.YAML.parse(atSubdir.stdout)).toMatchObject({ slots: { a: { model: 'index-a' } } });
    const atRoot = await cli(f, ['config']);
    expect(Bun.YAML.parse(atRoot.stdout)).toMatchObject({
      slots: { a: { model: 'strong-a' }, b: { model: 'strong-b' } },
    });
    const linked: string = resolve(f.home, 'linked-leaf');
    await command(['git', 'worktree', 'add', '-b', 'linked-leaf', linked], f.root);
    const atLinked = await cli(f, ['config'], linked);
    expect(Bun.YAML.parse(atLinked.stdout)).toMatchObject({ slots: { a: { model: 'strong-a' } } });
    const outside = await cli(f, ['config'], f.home);
    expect(Bun.YAML.parse(outside.stdout)).toMatchObject({ repo: 'none', slots: { a: { model: 'strong-a' } } });
    writeFileSync(indexFile, '# No front matter\n');
    const plain = await cli(f, ['config'], worktree);
    expect(plain.code).toBe(0);
    expect(Bun.YAML.parse(plain.stdout)).toMatchObject({ slots: { a: { model: 'strong-a' } } });
    writeFileSync(indexFile, '---\nfoo: 1\n---\n# t\n');
    const extra = await cli(f, ['config'], worktree);
    expect(extra.code).not.toBe(0);
    expect(extra.stderr).toContain(indexFile);
    writeFileSync(indexFile, '---\nslots: {a: {harness: fake, model: "x"}}\n---\n# t\n');
    const garbage = await cli(f, ['config'], worktree);
    expect(garbage.code).not.toBe(0);
    expect(garbage.stderr).toContain(indexFile);
    writeFileSync(indexFile, '---\nslots:\n  a:\n    harness: absent\n    model: a\n    effort: low\n---\n# t\n');
    const missing = await cli(f, ['config'], worktree);
    expect(missing.code).not.toBe(0);
    expect(missing.stderr).toContain(indexFile);
    expect(missing.stderr).toContain('absent');
  } finally {
    f.clean();
  }
});

test('config defaults merge_covers to empty and prints it', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none' });
    const result = await cli(f, ['config']);
    expect(result.code).toBe(0);
    expect(Bun.YAML.parse(result.stdout)).toMatchObject({ merge_covers: [] });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { keep: 'true', drop: 'true' },
      merge_checks: { full: 'true' },
      merge_covers: ['drop'],
      grounding: 'none',
    });
    const set = await cli(f, ['config']);
    expect(set.code).toBe(0);
    expect(Bun.YAML.parse(set.stdout)).toMatchObject({ merge_covers: ['drop'] });
  } finally {
    f.clean();
  }
});

test('config refuses unknown merge_covers names and empty merge_checks with covers', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { keep: 'true' },
      merge_checks: { full: 'true' },
      merge_covers: ['nope'],
      grounding: 'none',
    });
    const unknown = await cli(f, ['config']);
    expect(unknown.code).not.toBe(0);
    expect(unknown.stderr).toContain('repo');
    expect(unknown.stderr).toContain('nope');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { keep: 'true' },
      merge_covers: ['keep'],
      grounding: 'none',
    });
    const empty = await cli(f, ['config']);
    expect(empty.code).not.toBe(0);
    expect(empty.stderr).toContain('repo');
    expect(empty.stderr).toContain('keep');
  } finally {
    f.clean();
  }
});

test('config leaves merge_covers unwrapped when setup is set', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'bun install --frozen-lockfile',
      checks: { keep: 'true', drop: 'true' },
      merge_checks: { full: 'true' },
      merge_covers: ['drop'],
      grounding: 'none',
    });
    const result = await cli(f, ['config']);
    expect(result.code).toBe(0);
    const parsed = Bun.YAML.parse(result.stdout) as {
      checks: Record<string, string>;
      merge_covers: string[];
    };
    expect(parsed.merge_covers).toEqual(['drop']);
    expect(parsed.checks.keep).toContain('flock');
  } finally {
    f.clean();
  }
});
