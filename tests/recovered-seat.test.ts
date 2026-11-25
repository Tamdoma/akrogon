// Criterion 5: a seat terminal hc recovered as a bare shell — live, status null, argv rewritten
// to a shell line or parked with pid null — takes the lost path: one seat_lost row, the crafted
// terminal ended, lost charged, a replacement seat started. Seat launches (argv[0] systemd-run),
// spawn_pending rows and live harness terminals never match.
import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, yaml, WAIT_MS, type Fixture } from './helpers';
import { hcCore, setSeat, stopCoresAfterFile, type HcCore } from './hc-fixture';
import { readTimings } from '../src/timing';
import { readState } from '../src/state';
import { recoveredShellSeat } from '../src/next';
import type { Seen } from '../src/hc';

stopCoresAfterFile();

function seenRow(overrides: Partial<Seen>): Seen {
  return {
    session: 's',
    address: 't1',
    name: null,
    state: 'live',
    turn: 1,
    pid: 4242,
    parent: null,
    cwd: '/x',
    labels: {},
    status: null,
    foreground: null,
    argv: [],
    reason: null,
    keep: false,
    ...overrides,
  };
}

test('the recovered-shell predicate matches bare-shell recoveries only', () => {
  const shellFg = (name: string): { pid: number; cwd: string; argv: string[]; name: string } => ({
    pid: 4242,
    cwd: '/x',
    argv: [name],
    name,
  });
  // Positives: parked shapes (the machine-shell replacement still starting or the core down).
  for (const reason of ['signaled', 'server_stop', 'stopped_by_restart']) {
    expect(recoveredShellSeat(seenRow({ pid: null, reason })), `parked ${reason}`).toBe(true);
  }
  // Positives: spawned shapes — live, status null, foreground a shell, argv rewritten to a shell line.
  for (const name of ['bash', 'sh']) {
    expect(recoveredShellSeat(seenRow({ foreground: shellFg(name), argv: [name] })), `spawned ${name}`).toBe(true);
  }
  // Negatives.
  expect(recoveredShellSeat(seenRow({ pid: null, reason: 'spawn_pending' })), 'spawn_pending').toBe(false);
  expect(
    recoveredShellSeat(
      seenRow({ foreground: shellFg('bash'), argv: ['systemd-run', '--user', '--scope', '--', 'env', 'x=y', 'fake'] }),
    ),
    'seat launch argv systemd-run',
  ).toBe(false);
  expect(
    recoveredShellSeat(seenRow({ foreground: shellFg('node'), argv: ['node', '/x/fake'] })),
    'harness foreground',
  ).toBe(false);
  expect(
    recoveredShellSeat(seenRow({ status: { state: 'working', kind: null, msg: null }, argv: ['bash'] })),
    'non-null status',
  ).toBe(false);
  expect(
    recoveredShellSeat(seenRow({ status: { state: 'idle', kind: null, msg: null }, pid: null, reason: 'signaled' })),
    'idle parked',
  ).toBe(false);
  expect(recoveredShellSeat(seenRow({ argv: [] })), 'no argv').toBe(false);
  expect(recoveredShellSeat(seenRow({ state: 'finished', argv: ['bash'] })), 'finished').toBe(false);
});

// The raw terminal row hc reports: the fixture schema strips argv/reason, which this leaf reads.
function rawTerminal(text: string): {
  argv?: string[];
  pid?: number | null;
  state?: string;
  foreground?: { name?: string } | null;
} {
  return JSON.parse(text) as { argv?: string[]; pid?: number | null; state?: string };
}

test.serial('a seat recovered as a bare shell is charged lost, ended and replaced', async () => {
  const f: Fixture = await fixture();
  setSeat(f, 'a', 'fake', 'work');
  setSeat(f, 'b', 'fake', 'work');
  const core: HcCore = await hcCore(f);
  const path: string = leaf(f, 'rs-leaf', 'implement');
  try {
    // The crafted terminal stands in for a seat: the leaf's own labels, a plain kept bash.
    const started = await core.hc([
      'run',
      '--bg',
      '--keep',
      '--json',
      '--no-parent',
      '--name',
      'rs-crafted',
      '--cwd',
      f.root,
      '--label',
      'akrogon=1',
      '--label',
      `akrogon.repo=${f.repo}`,
      '--label',
      'akrogon.leaf=rs-leaf',
      '--label',
      'akrogon.seat=a',
      '--',
      'bash',
    ]);
    expect(started.code, `stderr: ${started.stderr}`).toBe(0);
    const address: string = (JSON.parse(started.stdout) as { address: string }).address;
    yaml(resolve(path, 'state.yaml'), { ...readState(path), seat: { A: { session: core.session, address } } });

    // hc restarts a kept terminal as the machine shell once its process dies.
    const first = await core.get(address);
    expect(first.pid).not.toBeNull();
    process.kill(first.pid as number, 'SIGKILL');

    const deadline: number = Date.now() + WAIT_MS;
    let recovered: { argv?: string[]; pid?: number | null } = {};
    for (;;) {
      const got = await core.hc(['get', '--json', address]);
      recovered = rawTerminal(got.stdout);
      if ((recovered.argv ?? []).length > 0 && recovered.pid !== first.pid) break;
      if (Date.now() > deadline) throw new Error(`terminal not recovered as a shell: ${got.stdout}`);
      await Bun.sleep(100);
    }

    // The dispatch charges exactly one loss, ends the crafted terminal and starts a replacement.
    const next = await cli(f, ['next', 'rs-leaf'], f.root, core.env);
    expect(next.code, `stdout: ${next.stdout} stderr: ${next.stderr}`).toBe(0);
    const lost = readTimings(f.root).filter((event) => event.kind === 'seat_lost');
    expect(lost).toHaveLength(1);
    expect(lost[0]).toMatchObject({ slot: 'A', slug: 'rs-leaf', address });
    expect(readState(path).lost).toEqual({ A: 1, B: 0 });
    const endDeadline: number = Date.now() + WAIT_MS;
    for (;;) {
      const listed = await core.terminals({ akrogon: '1', 'akrogon.leaf': 'rs-leaf' }, true);
      const crafted = listed.find((t) => t.address === address);
      if (crafted === undefined) break;
      if (Date.now() > endDeadline) throw new Error('crafted recovered terminal never ended');
      await Bun.sleep(100);
    }

    // A replacement seat starts on the same pass: live, a systemd-run launch — which never
    // matches the predicate, proven by a second pass charging nothing and replacing nothing.
    const seats = await core.terminals({ akrogon: '1', 'akrogon.leaf': 'rs-leaf' });
    const live = seats.filter((t) => t.state === 'live');
    expect(live).toHaveLength(1);
    const replacement: string = live[0].address;
    expect(readState(path).seat.A?.address).toBe(replacement);

    const again = await cli(f, ['next', 'rs-leaf'], f.root, core.env);
    expect(again.code, `stdout: ${again.stdout} stderr: ${again.stderr}`).toBe(0);
    expect(readTimings(f.root).filter((event) => event.kind === 'seat_lost')).toHaveLength(1);
    expect(readState(path).seat.A?.address).toBe(replacement);
    const still = await core.get(replacement);
    expect(still.state).toBe('live');
  } finally {
    await core.stop();
    f.clean();
  }
});
