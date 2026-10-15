import { test, expect } from 'bun:test';
import { lstatSync, mkdirSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { retiredLeafTempRoot } from '../src/config';
import { fixture, fakeHerdr, fakeAkrogon, cli, storeDir, leafTempRoot, type Fixture } from './helpers';
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
