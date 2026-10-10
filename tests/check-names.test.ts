import { test, expect } from 'bun:test';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, yaml, fakeAkrogon, type Fixture } from './helpers';
import { command } from '../src/shell';

test('printed checks preserve names containing spaces and slashes in argv and log filenames', async () => {
  const f: Fixture = await fixture();
  try {
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'named', worktree, 'origin/main'], f.root);
    const target: string = leaf(f, 'named', 'implement', { worktree });
    const shim: { env: NodeJS.ProcessEnv } = fakeAkrogon(f);
    for (const name of ['two words', 'lint/type']) {
      yaml(resolve(f.root, 'issues/config.yaml'), { grounding: 'none', checks: { [name]: 'echo name-check' } });
      const printed: string = Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout).checks[name];
      const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(['sh', '-c', printed], {
        cwd: worktree,
        env: { ...process.env, ...shim.env, HOME: f.home, AKROGON_HOME: f.home },
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
      expect(stdout.trim()).toBe('name-check');
      expect(
        readdirSync(resolve(target, 'implementation')).some((file: string) =>
          file.startsWith(`check-${encodeURIComponent(name)}-`),
        ),
      ).toBe(true);
    }
  } finally {
    f.clean();
  }
});
