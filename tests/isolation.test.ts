import { test, expect } from 'bun:test';
import { homedir } from 'node:os';
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
