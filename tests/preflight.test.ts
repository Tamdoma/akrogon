import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { mkdirSync, readdirSync } from 'node:fs';
import { fixture, cli, type Fixture } from './helpers';
import { command, run } from '../src/shell';

async function pointRemote(f: Fixture, url: string): Promise<void> {
  await run(['git', 'remote', 'remove', 'origin'], f.root);
  await command(['git', 'remote', 'add', 'origin', url], f.root);
}

test('preflight prints remote branch and sha when remote branch and tracking ref resolve', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const sha: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const result = await cli(f, ['preflight']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(`origin/main ${sha}`);
  } finally {
    f.clean();
  }
});

test('preflight refuses C1 when no remote is configured', async () => {
  const f: Fixture = await fixture();
  try {
    await run(['git', 'remote', 'remove', 'origin'], f.root);
    const result = await cli(f, ['preflight']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('C1');
    expect(result.stderr).toContain('origin');
    expect(result.stderr).toContain('git remote add');
    expect(result.stderr).toContain('issues/config.yaml');
  } finally {
    f.clean();
  }
});

test('preflight refuses C2 when the remote branch is absent', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'empty.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    const result = await cli(f, ['preflight']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('C2');
    expect(result.stderr).toContain('first commit');
    expect(result.stderr).toContain('push');
  } finally {
    f.clean();
  }
});

test('preflight refuses C3 when the tracking ref is absent locally', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    const result = await cli(f, ['preflight']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('C3');
    expect(result.stderr).toContain('git fetch origin main');
  } finally {
    f.clean();
  }
});

test('preflight reports unproven on transport failure without C2 text', async () => {
  const f: Fixture = await fixture();
  try {
    await pointRemote(f, resolve(f.home, 'gone.git'));
    const result = await cli(f, ['preflight']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Unproven');
    expect(result.stderr).toContain('ls-remote');
    expect(result.stderr).toContain('exited 128');
    expect(result.stderr).toContain('does not appear to be a git repository');
    // Bun dumps a source excerpt showing the 'C2' throw site; the classified label is 'C2:'.
    expect(result.stderr).not.toContain('C2:');
  } finally {
    f.clean();
  }
});

test('preflight resolves the tracking ref, never a same-named branch or tag', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const tracked: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    await command(['git', 'commit', '--allow-empty', '-m', 'impostor'], f.root);
    const impostor: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    await command(['git', 'branch', 'origin/main', impostor], f.root);
    await command(['git', 'tag', 'origin/main', impostor], f.root);
    const result = await cli(f, ['preflight']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(`origin/main ${tracked}`);
    await command(['git', 'update-ref', '-d', 'refs/remotes/origin/main'], f.root);
    const refused = await cli(f, ['preflight']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('C3');
  } finally {
    f.clean();
  }
});

test('preflight refuses unregistered and non-repo cwd without writes and accepts zero leaves', async () => {
  const f: Fixture = await fixture();
  try {
    const unregistered: string = resolve(f.home, 'unregistered');
    await command(['git', 'init', '-b', 'main', unregistered]);
    const nonRepo: string = resolve(f.home, 'nonrepo');
    mkdirSync(nonRepo);
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const leaves: string = await command(['git', 'status', '--porcelain'], f.root);
    expect((await cli(f, ['preflight'], unregistered)).code).not.toBe(0);
    expect((await cli(f, ['preflight'], nonRepo)).code).not.toBe(0);
    expect(readdirSync(nonRepo)).toEqual([]);
    expect((await cli(f, ['preflight'])).code).toBe(0);
    expect(await command(['git', 'status', '--porcelain'], f.root)).toBe(leaves);
  } finally {
    f.clean();
  }
});

test('AKROGON_BASE resolves the tracking ref over a same-named divergent branch', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', remote]);
    await pointRemote(f, remote);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const tracked: string = await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.root);
    const worktree: string = resolve(f.home, 'work');
    await command(['git', 'worktree', 'add', '-b', 'leaf', worktree], f.root);
    await command(['git', 'commit', '--allow-empty', '-m', 'divergent'], worktree);
    await command(['git', 'branch', '-f', 'origin/main', 'leaf'], f.root);
    const divergent: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    expect(divergent).not.toBe(tracked);
    const config = await cli(f, ['config'], worktree);
    expect(config.code).toBe(0);
    expect(Bun.YAML.parse(config.stdout)).toMatchObject({ AKROGON_BASE: tracked });
  } finally {
    f.clean();
  }
});
