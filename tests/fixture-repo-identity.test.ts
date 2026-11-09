// Criterion 1: two fixtures share no registered repo identity. One fixture's teardown stops only
// its own leaf slice while a second fixture holds a live seat on the same leaf slug; that seat
// survives and completes its delivery sequence. The teardown landing is synchronized on the
// second fixture's seat, observed `working`, not on a launch delay. Red on base: both fixtures
// register `repo`, `leafSlice` gives one shared slice, and the first teardown ends the second seat.
import { test, expect } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';

// The identity the fixture registered under `repos`, read where the product reads it.
function repoNameOf(f: Fixture): string {
  const global = z
    .object({ repos: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')));
  const name: string | undefined = Object.keys(global.repos).find((key) => global.repos[key] === f.root);
  expect(name, `no repos key resolves to fixture root ${f.root}`).toBeDefined();
  return z.string().parse(name);
}

async function stopSlice(name: string, slug: string): Promise<void> {
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name }, slug)]);
}

async function seatA(core: HcCore, slug: string): Promise<Terminal> {
  const found: Terminal[] = await core.terminals({ 'akrogon.leaf': slug, 'akrogon.seat': 'a' }, false);
  expect(found).toHaveLength(1);
  return found[0];
}

test("one fixture's teardown stops only its own slices; a second fixture's same-slug seat survives and finishes its prompt", async () => {
  const slug: string = 'fx-identity';
  const one: Fixture = await fixture();
  const two: Fixture = await fixture();
  const nameOne: string = repoNameOf(one);
  const nameTwo: string = repoNameOf(two);
  setPrefixes(one, { [nameOne]: 'rp' });
  setPrefixes(two, { [nameTwo]: 'rp' });
  setSeat(one, 'a', 'fake', 'work');
  setSeat(two, 'a', 'fake', 'work');
  const coreOne: HcCore = await hcCore(one);
  const coreTwo: HcCore = await hcCore(two);
  const pathTwo: string = leaf(two, slug, 'plan.synthesis');
  try {
    leaf(one, slug, 'plan.synthesis');
    expect((await cli(one, ['next', slug], one.root, coreOne.env)).code).toBe(0);
    expect((await cli(two, ['next', slug], two.root, coreTwo.env)).code).toBe(0);
    const seatOne: Terminal = await seatA(coreOne, slug);
    const seatTwo: Terminal = await seatA(coreTwo, slug);
    await coreOne.waitFor(seatOne.address, (t) => t.turn >= 1 && t.status?.state === 'idle');
    // Hold two's seat working on a FIFO so teardown lands while the seat is live, not on a delay.
    const gate: string = resolve(coreTwo.standin, 'gate');
    writeFileSync(
      resolve(coreTwo.standin, 'hook'),
      `#!/bin/sh\nif [ -p '${gate}' ]; then cat '${gate}' >/dev/null; rm -f '${gate}'; fi\n`,
      { mode: 0o755 },
    );
    Bun.spawnSync(['mkfifo', gate]);
    expect((await cli(two, ['phase', slug, 'implement', '--slot', 'A'], two.root, coreTwo.env)).code).toBe(0);
    await coreTwo.waitFor(seatTwo.address, (t) => t.status?.state === 'working');
    // One's teardown lands while two's seat is live: core stop, slice stop, home removal.
    await coreOne.stop();
    await stopSlice(nameOne, slug);
    one.clean();
    // Survival is read at the real boundary: the seat's own process still lives inside two's
    // leaf slice (`/proc/<pid>/cgroup` ending `/<slice>/<unit>`), not a terminal row that can
    // lag the kill. `systemctl --user stop` returns after the slice is stopped.
    expect(leafSlice({ name: nameOne }, slug)).not.toBe(leafSlice({ name: nameTwo }, slug));
    const procFile: string = `/proc/${z.number().parse(seatTwo.pid)}/cgroup`;
    expect(existsSync(procFile), `seat ${seatTwo.address} pid ${seatTwo.pid} ended`).toBe(true);
    const cgroup: string = readFileSync(procFile, 'utf8').trim();
    expect(cgroup).toContain(`/${leafSlice({ name: nameTwo }, slug)}/`);
    writeFileSync(gate, 'go\n');
    await coreTwo.waitFor(seatTwo.address, (t) => t.turn >= 2 && t.status?.state === 'idle');
    expect(coreTwo.tasks(seatTwo.address)).toEqual([
      `plan-issue ${slug} slot=A phase=plan.synthesis leaf=${pathTwo}`,
      `implement-issue ${slug} slot=A phase=implement leaf=${pathTwo}`,
    ]);
  } finally {
    await coreOne.stop();
    await coreTwo.stop();
    await stopSlice(nameOne, slug);
    await stopSlice(nameTwo, slug);
    one.clean();
    two.clean();
  }
});
