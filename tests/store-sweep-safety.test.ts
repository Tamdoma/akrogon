import { test, expect } from 'bun:test';
import { lstatSync, mkdirSync, symlinkSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { leafTemp, readRepo, type Repo } from '../src/config';
import { retiredLeafTempRoot } from '../src/config';
import { fixture, fakeHerdr, fakeAkrogon, cli, storeDir, leafTempRoot, leaf, procRoot, type Fixture } from './helpers';
import { suiteRoot } from './isolation';

test('F7 test environments isolate the retired temp root', async () => {
  expect(retiredLeafTempRoot().startsWith(suiteRoot + '/')).toBe(true);
  const f: Fixture = await fixture();
  try {
    expect(fakeHerdr(f).env.AKROGON_RETIRED_TEMP_ROOT).toBe(resolve(f.home, 'retired-temp'));
    expect(fakeAkrogon(f).env.AKROGON_RETIRED_TEMP_ROOT).toBe(resolve(f.home, 'retired-temp'));
  } finally {
    f.clean();
  }
});

test('F1 dangling entries are removed from stores and the host temp root', async () => {
  const f: Fixture = await fixture();
  try {
    const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
    const roots: string[] = [storeDir(f), resolve(f.root, 'issues/worktrees'), leafTempRoot(f)];
    for (const root of roots) {
      mkdirSync(root, { recursive: true });
      symlinkSync(resolve(f.home, 'missing'), resolve(root, 'dangling'));
    }
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    for (const root of roots) expect(lstatSync(resolve(root, 'dangling'), { throwIfNoEntry: false })).toBeUndefined();
  } finally {
    f.clean();
  }
});

test('F2 surviving processes protect leaf entries and leaf temps', async () => {
  const f: Fixture = await fixture();
  const h: ReturnType<typeof fakeHerdr> = fakeHerdr(f);
  const repo: Repo = readRepo('repo', f.root);
  const owned: string = resolve(storeDir(f), 'done-old');
  const temp: string = resolve(leafTempRoot(f), relative(process.env.AKROGON_LEAF_TEMP_ROOT!, leafTemp(repo, 'done')));
  mkdirSync(owned, { recursive: true });
  mkdirSync(temp, { recursive: true });
  writeFileSync(resolve(temp, 'open'), 'x');
  const child: Bun.Subprocess = Bun.spawn(['sleep', '300'], { cwd: owned });
  try {
    leaf(f, 'done', 'merged');
    const proc: string = resolve(procRoot(f), String(child.pid));
    mkdirSync(resolve(proc, 'fd'), { recursive: true });
    symlinkSync(owned, resolve(proc, 'cwd'));
    symlinkSync(resolve(temp, 'open'), resolve(proc, 'fd/3'));
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    expect(existsSync(owned)).toBe(true);
    expect(existsSync(temp)).toBe(true);
    child.kill('SIGKILL');
    await child.exited;
    expect((await cli(f, ['next', '--all'], f.root, h.env)).code).toBe(0);
    expect(existsSync(owned)).toBe(false);
    expect(existsSync(temp)).toBe(false);
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
    await child.exited;
    f.clean();
  }
});
