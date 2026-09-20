import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { fixture, cli, yaml, type Fixture } from './helpers';
import { command } from '../src/shell';

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
    expect(Bun.YAML.parse(unset.stdout)).toMatchObject({ max_active: 3 });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      fix_rounds: 2,
      implement: 'inline',
      remote: 'upstream',
      default_branch: 'trunk',
      grounding: 'none',
    });
    await command(['git', 'update-ref', 'refs/remotes/upstream/trunk', 'HEAD'], f.root);
    const config = await cli(f, ['config']);
    expect(config.code).toBe(0);
    expect(Bun.YAML.parse(config.stdout)).toMatchObject({
      max_active: 3,
      fix_rounds: 2,
      implement: 'inline',
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
