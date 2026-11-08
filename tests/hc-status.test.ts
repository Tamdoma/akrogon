// Criterion 10: status shows listener liveness as information only.
import { test, expect } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { cli, fakeSystemctl, fixture, type Fixture } from './helpers';
import { hcCore, setPrefixes, type HcCore } from './hc-fixture';

test('status reports the listener live or down without changing its exit or attention', async () => {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  const core: HcCore = await hcCore(f);
  const systemctl = fakeSystemctl(f);
  const env: NodeJS.ProcessEnv = { ...core.env, ...systemctl.env };
  try {
    const down = await cli(f, ['status'], f.root, env);
    expect(down.code).toBe(0);
    expect(down.stdout).toContain('Listener: down');
    const quiet = await cli(f, ['status', '--json'], f.root, env);
    writeFileSync(systemctl.db, JSON.stringify({ units: [{ unit: 'akrogon-listener.service', sub: 'running' }] }));
    const live = await cli(f, ['status'], f.root, env);
    expect(live.code).toBe(0);
    expect(live.stdout).toContain('Listener: live');
    const loud = await cli(f, ['status', '--json'], f.root, env);
    const red = (text: string): unknown => z.object({ red: z.unknown() }).passthrough().parse(JSON.parse(text)).red;
    expect(red(loud.stdout)).toEqual(red(quiet.stdout));
  } finally {
    await core.stop();
    f.clean();
  }
});
