import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
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
    expect(Bun.YAML.parse(unset.stdout)).not.toHaveProperty('repo_max_active');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      max_active: 2,
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
      repo_max_active: 2,
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
    for (const maxActive of [0, -1, 1.5]) {
      yaml(resolve(f.root, 'issues/config.yaml'), { max_active: maxActive });
      expect((await cli(f, ['config'])).code).not.toBe(0);
    }
  } finally {
    f.clean();
  }
});
