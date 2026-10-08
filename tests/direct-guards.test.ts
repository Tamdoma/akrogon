import { expect, test } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command } from '../src/shell';
import { fixture, type Fixture } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/direct-guards.ts');

type RunResult = { code: number; stderr: string };

async function withBranch(
  body: (f: Fixture, wt: string, run: () => Promise<RunResult>) => Promise<void>,
): Promise<void> {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'tests'));
    writeFileSync(resolve(f.root, 'tests/a.test.ts'), 'original\n');
    await command(['git', 'add', '.'], f.root);
    await command(['git', 'commit', '-m', 'add test'], f.root);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.root);
    const wt: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'direct', wt], f.root);
    const run = async (): Promise<RunResult> => {
      const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
        [process.execPath, script, wt, 'repo', resolve(f.home, 'chart')],
        { env: { ...process.env, AKROGON_HOME: f.home }, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
      );
      const [stderr, code]: [string, number] = await Promise.all([new Response(child.stderr).text(), child.exited]);
      return { code, stderr };
    };
    await body(f, wt, run);
  } finally {
    f.clean();
  }
}

async function commitAll(wt: string, message: string): Promise<void> {
  await command(['git', 'add', '.'], wt);
  await command(['git', 'commit', '-m', message], wt);
}

test('refuses uncommitted work', async () => {
  await withBranch(async (_f, wt, run) => {
    writeFileSync(resolve(wt, 'code.ts'), 'x\n');
    const result: RunResult = await run();
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Uncommitted work');
  });
});

test('refuses issue files on the branch', async () => {
  await withBranch(async (_f, wt, run) => {
    mkdirSync(resolve(wt, 'issues/open'), { recursive: true });
    writeFileSync(resolve(wt, 'issues/open/x.md'), 'x\n');
    writeFileSync(resolve(wt, 'code.ts'), 'x\n');
    await commitAll(wt, 'add issue file');
    const result: RunResult = await run();
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Issue files on leaf branch');
  });
});

test('refuses changed test files without a citation', async () => {
  await withBranch(async (_f, wt, run) => {
    writeFileSync(resolve(wt, 'tests/a.test.ts'), 'changed\n');
    await commitAll(wt, 'change test');
    const result: RunResult = await run();
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Changed test files need a citation');
  });
});

test('refuses an empty branch', async () => {
  await withBranch(async (_f, _wt, run) => {
    const result: RunResult = await run();
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Empty leaf branch');
  });
});

test('passes a clean, cited, non-empty branch', async () => {
  await withBranch(async (_f, wt, run) => {
    writeFileSync(resolve(wt, 'tests/a.test.ts'), 'changed\n');
    writeFileSync(resolve(wt, 'code.ts'), 'x\n');
    await commitAll(wt, 'change test and code\n\nTest-Change: tests/a.test.ts reason here');
    const result: RunResult = await run();
    expect(result.stderr).toBe('');
    expect(result.code).toBe(0);
  });
});
