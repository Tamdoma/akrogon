import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { retiredLeafTempRoot } from '../src/config';
import { fixture, fakeHerdr, fakeAkrogon, type Fixture } from './helpers';
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
