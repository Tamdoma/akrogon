import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { fixture, cli, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';

test('sync commits local changes, rebases on the remote and pushes', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    await command(['git', 'init', '--bare', '-b', 'main', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const other: string = resolve(f.home, 'other');
    await command(['git', 'clone', remote, other]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
    await command(['git', 'config', 'user.name', 'Test'], other);
    writeFileSync(resolve(other, 'landed'), 'from a leaf\n');
    await command(['git', 'add', 'landed'], other);
    await command(['git', 'commit', '-m', 'leaf work'], other);
    await command(['git', 'push', 'origin', 'HEAD:main'], other);
    writeFileSync(resolve(f.root, 'issues/log.jsonl'), '{"ts":"now"}\n');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    expect(await command(['git', 'status', '--porcelain'], f.root)).toBe('');
    expect(await command(['git', 'log', '--format=%s', '-2'], f.root)).toBe('sync issues\nleaf work');
    expect(await command(['git', 'rev-parse', 'main'], remote)).toBe(
      await command(['git', 'rev-parse', 'HEAD'], f.root),
    );
    const again: Result = await cli(f, ['sync']);
    expect(again.code, again.stderr).toBe(0);
    expect(await command(['git', 'log', '--format=%s', '-1'], f.root)).toBe('sync issues');
  } finally {
    f.clean();
  }
});
