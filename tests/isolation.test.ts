import { test, expect } from 'bun:test';
import { homedir, tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { suiteRoot } from './isolation';
import { leafTemp, worktreeStore, repoSchema, type Repo } from '../src/config';
import { spawnCaptured, type SpawnResult } from '../src/shell';

const repo: Repo = { name: 'repo', root: '/r', config: repoSchema.parse({ grounding: 'none' }) };

test.serial(
  'suite env is redirected: HOME, leaf-temp root, tmpdir and store resolve under the suite scratch',
  async () => {
    expect(process.env.HOME, `HOME=${process.env.HOME}`).toStartWith(suiteRoot);
    expect(
      process.env.AKROGON_LEAF_TEMP_ROOT,
      `AKROGON_LEAF_TEMP_ROOT=${process.env.AKROGON_LEAF_TEMP_ROOT}`,
    ).toStartWith(suiteRoot);
    expect(process.env.TMPDIR, `TMPDIR=${process.env.TMPDIR}`).toStartWith(suiteRoot);
    expect(homedir(), `homedir()=${homedir()}`).toStartWith(suiteRoot);
    expect(homedir(), `homedir()=${homedir()}`).not.toBe('/home/ivan');
    expect(leafTemp(repo, 'x')).toStartWith(resolve(process.env.AKROGON_LEAF_TEMP_ROOT ?? '', '/'));
    expect(worktreeStore(repo)).toBe(resolve(suiteRoot, 'home', '.akrogon/worktrees/repo'));
    const child: SpawnResult = await spawnCaptured(
      [process.execPath, '-e', 'console.log(JSON.stringify([process.env.HOME, process.env.AKROGON_LEAF_TEMP_ROOT]))'],
      { env: { ...process.env } },
    );
    expect(child.code).toBe(0);
    const [childHome, childTemp]: string[] = JSON.parse(child.stdout.trim());
    expect(childHome).toBe(process.env.HOME ?? '');
    expect(childTemp).toBe(process.env.AKROGON_LEAF_TEMP_ROOT ?? '');
  },
);

// Criterion 1: a direct `bun test` launched with a seat's wiring — the scratch tool-entry first
// on PATH (agy shape) or BASH_ENV naming its bash-env (pi/codex shape) — passes exactly as it
// does from a clean shell. Only a real child run shows what the preload does to inherited env.
test.serial(
  'a direct bun test of the tool-entry suite behaves like a clean shell under either seat wiring',
  async () => {
    const home: string = mkdtempSync(resolve(tmpdir(), 'akrogon-direct-run-'));
    try {
      const { refreshToolEntry } = await import('../src/tool-cgroup');
      refreshToolEntry(home);
      const entry: string = resolve(home, 'tool-entry');
      const repoRoot: string = resolve(import.meta.dir, '..');
      const argv: string[] = [process.execPath, 'test', 'tests/tool-entry.test.ts', '-t', 'exactly once'];

      const pathWired: NodeJS.ProcessEnv = { ...process.env, PATH: `${entry}:${process.env.PATH}` };
      delete pathWired.BASH_ENV;
      const bashenvWired: NodeJS.ProcessEnv = { ...process.env, BASH_ENV: resolve(entry, 'bash-env') };

      for (const [label, env] of [
        ['path-first', pathWired],
        ['bash-env', bashenvWired],
      ] as const) {
        const child: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(argv, {
          cwd: repoRoot,
          env,
          stdout: 'pipe',
          stderr: 'pipe',
        });
        const output: string = `${child.stdout.toString()}${child.stderr.toString()}`;
        expect(output, `${label}: the filter matched the placement test`).toContain('exactly once');
        expect(output, `${label}: child output`).not.toContain('(fail');
        expect(output, `${label}: child passed one test`).toContain('1 pass');
        expect(child.exitCode, `${label}: child exit code; output:\n${output}`).toBe(0);
      }
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  },
  60_000,
);
