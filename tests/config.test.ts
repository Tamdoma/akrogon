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
    });
    const unset = await cli(f, ['config']);
    expect(unset.code).toBe(0);
    expect(Bun.YAML.parse(unset.stdout)).toMatchObject({ max_active: 3 });
    yaml(resolve(f.root, 'issues/config.yaml'), {
      fix_rounds: 2,
      implement: 'inline',
      remote: 'upstream',
      default_branch: 'trunk',
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
    expect(Bun.YAML.parse((await cli(f, ['config'], f.home)).stdout)).toMatchObject({ repo: 'none', fix_rounds: 3 });
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
    yaml(resolve(f.root, 'issues/config.yaml'), { fix_rounds: 0 });
    expect((await cli(f, ['config'])).code).not.toBe(0);
    yaml(resolve(f.root, 'issues/config.yaml'), { max_active: 2 });
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
