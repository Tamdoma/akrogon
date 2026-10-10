import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fakeHerdr, fixture, leaf, storeDir, yaml, type Fixture } from './helpers';
import { readState } from '../src/state';
import { command, run, type Result } from '../src/shell';

type DispatchFixture = Fixture & { db: string; env: NodeJS.ProcessEnv };
async function dispatchFixture(): Promise<DispatchFixture> {
  const f: Fixture = await fixture();
  return { ...f, ...fakeHerdr(f) };
}
async function next(f: DispatchFixture, args: string[], env: NodeJS.ProcessEnv = {}): Promise<Result> {
  return cli(f, ['next', ...args], f.root, { ...f.env, ...env });
}

test('a dispatched worktree lands sparse in the home store while the root keeps its issues tree', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    await command(['git', 'add', 'issues/config.yaml'], f.root);
    await command(['git', 'commit', '-m', 'track issues config'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = resolve(storeDir(f), 'build');
    expect(readState(path).worktree).toBe(worktree);
    expect(existsSync(resolve(worktree, 'issues'))).toBe(false);
    expect((await run(['git', 'ls-tree', 'HEAD', 'issues'], worktree)).stdout).toContain('issues');
    expect(await command(['git', 'status', '--porcelain'], worktree)).toBe('');
    expect(await command(['git', 'config', '--worktree', '--get', 'core.sparseCheckout'], worktree)).toBe('true');
    expect((await run(['git', 'config', '--worktree', '--get', 'core.sparseCheckout'], f.root)).code).toBe(1);
    expect(existsSync(resolve(f.root, 'issues/config.yaml'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('a repo worktree_root tilde expands to home so the dispatched worktree lands there', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { worktree_root: '~/trees', grounding: 'none' });
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = resolve(f.home, 'trees/build');
    expect(readState(path).worktree).toBe(worktree);
    expect(existsSync(worktree)).toBe(true);
    expect(existsSync(resolve(storeDir(f), 'build'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a rebase inside a sparse dispatch worktree crosses an issues change cleanly', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = resolve(storeDir(f), 'build');
    writeFileSync(resolve(f.root, 'issues/changed'), 'new issues content\n');
    writeFileSync(resolve(f.root, 'code'), 'code\n');
    await command(['git', 'add', 'issues/changed', 'code'], f.root);
    await command(['git', 'commit', '-m', 'issues change'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    writeFileSync(resolve(worktree, 'leafwork'), 'leaf\n');
    await command(['git', 'add', 'leafwork'], worktree);
    await command(['git', 'commit', '-m', 'leaf work'], worktree);
    await command(['git', 'fetch', 'origin'], worktree);
    await command(['git', 'rebase', 'origin/main'], worktree);
    expect(await command(['git', 'status', '--porcelain'], worktree)).toBe('');
    expect(existsSync(resolve(worktree, 'issues'))).toBe(false);
    expect(await command(['git', 'log', '--format=%s', '-2'], worktree)).toBe('leaf work\nissues change');
  } finally {
    f.clean();
  }
});

test('buildStack builds a two-leaf stack inside a sparse store checkout that is removed after', async () => {
  const f: Fixture = await fixture();
  try {
    const builtOn: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const add = async (slug: string): Promise<string> => {
      const dir: string = resolve(f.home, 'src-' + slug);
      await command(['git', 'worktree', 'add', '-b', slug, dir, builtOn], f.root);
      writeFileSync(resolve(dir, 'file-' + slug), slug + '\n');
      await command(['git', 'add', '.'], dir);
      await command(['git', 'commit', '-m', slug], dir);
      const head: string = await command(['git', 'rev-parse', 'HEAD'], dir);
      await command(['git', 'worktree', 'remove', '--force', dir], f.root);
      return head;
    };
    const [memA, memB, holder] = [await add('mem-a'), await add('mem-b'), await add('holder')];
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    const gitLog: string = resolve(f.home, 'git.calls');
    const shim: string = resolve(f.home, 'bin/git');
    mkdirSync(resolve(f.home, 'bin'), { recursive: true });
    writeFileSync(shim, '#!/bin/sh\nprintf "%s\\n" "$PWD $*" >> ' + gitLog + '\nexec ' + realGit + ' "$@"\n');
    chmodSync(shim, 0o755);
    const script: string = resolve(f.home, 'build.ts');
    writeFileSync(
      script,
      `const { readRepo } = await import(${JSON.stringify(resolve(import.meta.dir, '../src/config.ts'))});
const { buildStack, memberBase } = await import(${JSON.stringify(resolve(import.meta.dir, '../src/batch.ts'))});
const repo = readRepo('repo', ${JSON.stringify(f.root)});
const built = await buildStack(repo, ${JSON.stringify(builtOn)}, [
  { slug: 'mem-a', base: await memberBase(repo, ${JSON.stringify(builtOn)}, ${JSON.stringify(memA)}), head: ${JSON.stringify(memA)} },
  { slug: 'mem-b', base: await memberBase(repo, ${JSON.stringify(builtOn)}, ${JSON.stringify(memB)}), head: ${JSON.stringify(memB)} },
], ${JSON.stringify(holder)});
if (!built.ok) throw new Error('stack conflict: ' + built.conflict);
console.log(built.top);
`,
    );
    const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, script], {
      env: {
        ...process.env,
        PATH: resolve(f.home, 'bin') + ':' + (process.env.PATH ?? ''),
        HOME: f.home,
      },
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const [stdout, stderr, code]: [string, string, number] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect({ code, stderr }).toEqual({ code: 0, stderr: '' });
    const top: string = stdout.trim();
    const log: string[] = readFileSync(gitLog, 'utf8').trim().split('\n');
    const added: string[] | undefined = log.find((line) => line.includes('worktree add'))?.split(' ');
    expect(added).toBeDefined();
    const dir: string = added!.find((arg) => arg.includes('batch-'))!;
    expect(dir.startsWith(storeDir(f) + '/')).toBe(true);
    expect(log.some((line) => line.startsWith(dir + ' '))).toBe(true);
    expect(log.some((line) => line.includes('sparse-checkout set'))).toBe(true);
    expect(existsSync(dir)).toBe(false);
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).not.toContain('batch-');
    expect(await command(['git', 'log', '--format=%s', '-3', top], f.root)).toBe('holder\nmem-b\nmem-a');
  } finally {
    f.clean();
  }
});

test('dispatch refuses a store path under an ancestor holding node_modules and creates nothing', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    const bad: string = resolve(f.home, 'bad');
    mkdirSync(resolve(bad, 'node_modules'), { recursive: true });
    yaml(resolve(f.root, 'issues/config.yaml'), { worktree_root: '~/bad/trees', grounding: 'none' });
    const before: string = await command(['git', 'worktree', 'list', '--porcelain'], f.root);
    leaf(f, 'build', 'plan.synthesis');
    const result: Result = await next(f, ['build']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(realpathSync(bad));
    expect(result.stderr).toContain('node_modules or package.json');
    expect(await command(['git', 'worktree', 'list', '--porcelain'], f.root)).toBe(before);
    expect(existsSync(resolve(bad, 'trees'))).toBe(false);
    expect(readState(resolve(f.root, 'issues/open/issue/build')).worktree).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('a sparse store leaf resolves only its own modules: foreign left-pad fails, local vendored resolves', async () => {
  const f: DispatchFixture = await dispatchFixture();
  try {
    mkdirSync(resolve(f.root, 'node_modules/left-pad'), { recursive: true });
    writeFileSync(resolve(f.root, 'node_modules/left-pad/package.json'), '{"name":"left-pad","main":"index.js"}');
    writeFileSync(resolve(f.root, 'node_modules/left-pad/index.js'), 'module.exports = 1;\n');
    mkdirSync(resolve(f.root, 'vendor/local-dep'), { recursive: true });
    writeFileSync(resolve(f.root, 'vendor/local-dep/package.json'), '{"name":"local-dep","main":"index.js"}');
    writeFileSync(resolve(f.root, 'vendor/local-dep/index.js'), 'module.exports = 2;\n');
    await command(['git', 'add', 'vendor'], f.root);
    await command(['git', 'commit', '-m', 'vendored dep'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const worktree: string = resolve(storeDir(f), 'build');
    mkdirSync(resolve(worktree, 'node_modules'));
    const foreign: Result = await run(['bun', '-e', 'require.resolve("left-pad")'], f.root);
    expect(foreign.code).toBe(0);
    const absent: Result = await run(['bun', '-e', 'require.resolve("left-pad")'], worktree);
    expect(absent.code).not.toBe(0);
    const local: Result = await run(['bun', '-e', 'require.resolve("./vendor/local-dep")'], worktree);
    expect(local.code).toBe(0);
    const missing: Result = await run(['bun', '-e', 'require("definitely-absent-pkg")'], worktree, 10000);
    expect(missing.code).not.toBe(0);
    expect(readdirSync(resolve(worktree, 'node_modules'))).toEqual([]);
  } finally {
    f.clean();
  }
});
