import { test, expect } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { suiteRoot, sweepSuite } from './isolation';
import { leafTemp, worktreeStore, repoSchema, type Repo } from '../src/config';
import { spawnCaptured, type SpawnResult } from '../src/shell';

const repo: Repo = { name: 'repo', root: '/r', config: repoSchema.parse({ grounding: 'none' }) };

function ppidOf(pid: number): number {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  return Number(stat.slice(stat.lastIndexOf(')') + 1).trim().split(' ')[1]);
}

test.serial('suite env is redirected: HOME, leaf-temp root, tmpdir and store resolve under the suite scratch', async () => {
  expect(process.env.HOME, `HOME=${process.env.HOME}`).toStartWith(suiteRoot);
  expect(process.env.AKROGON_LEAF_TEMP_ROOT, `AKROGON_LEAF_TEMP_ROOT=${process.env.AKROGON_LEAF_TEMP_ROOT}`).toStartWith(
    suiteRoot,
  );
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
  expect(childHome).toBe(process.env.HOME);
  expect(childTemp).toBe(process.env.AKROGON_LEAF_TEMP_ROOT);
});

test.serial('a killed child leaves no descendant: the orphan is adopted by this worker and swept', async () => {
  const child: Bun.Subprocess = Bun.spawn(['sh', '-c', "sh -c 'exec sleep 300' & exec sleep 300"], {
    stdout: 'ignore',
    stderr: 'ignore',
  });
  let grandchild: number | undefined;
  for (let i: number = 0; i < 100 && grandchild === undefined; i += 1) {
    try {
      const kids: string = readFileSync(`/proc/${child.pid}/children`, 'utf8').trim();
      if (kids !== '') grandchild = Number(kids.split(' ')[0]);
    } catch {
      // child not visible yet
    }
    await Bun.sleep(20);
  }
  expect(grandchild, 'expected a grandchild').toBeNumber();
  child.kill('SIGKILL');
  await child.exited;
  let adopted: boolean = false;
  for (let i: number = 0; i < 150; i += 1) {
    if (!existsSync(`/proc/${grandchild}`)) break;
    if (ppidOf(grandchild!) === process.pid) {
      adopted = true;
      break;
    }
    await Bun.sleep(20);
  }
  expect(adopted, `orphan ${grandchild} adopted by this worker`).toBe(true);
  sweepSuite();
  for (let i: number = 0; i < 50 && existsSync(`/proc/${grandchild}`); i += 1) await Bun.sleep(20);
  expect(existsSync(`/proc/${grandchild}`), `grandchild ${grandchild} still alive after sweep`).toBe(false);
});
