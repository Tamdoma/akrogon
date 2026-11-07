import { test, expect } from 'bun:test';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli } from './helpers';
import { deployFixture, deployedPair, deployRecord, pushSeed, type DeployFixture } from './deploy-fixture';
import { type Result } from '../src/shell';

test.serial('a completed rollback records the rolled-away release as previous for pruning', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    // Rollback refuses a previous release that ships plugin/ (brief criterion 12).
    await pushSeed(d, () => rmSync(resolve(d.seed, 'plugin'), { recursive: true, force: true }));
    const { previous, current }: { previous: string; current: string } = await deployedPair(d);
    const result: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(deployRecord(d)).toMatchObject({
      commit: previous,
      previous: current,
      ok: true,
      replaced: { [current]: expect.any(String) },
    });
  } finally {
    d.f.clean();
  }
});
