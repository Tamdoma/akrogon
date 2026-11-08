// Criteria 1 and 2: the start verb on a real hc core with the stand-in agent.
import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, leafTempRoot, storeDir, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { readState } from '../src/state';
import { leafSlice } from '../src/scope';
import { spawnCaptured } from '../src/shell';

const markers: string[] = [
  'CLAUDECODE',
  'CLAUDE_CODE_CHILD_SESSION',
  'CLAUDE_CODE_SESSION_ID',
  'CLAUDE_CODE_ENTRYPOINT',
  'CLAUDE_CODE_EXECPATH',
  'CLAUDE_CODE_MESSAGING_SOCKET',
  'CLAUDE_CODE_MESSAGING_TOKEN',
  'CLAUDE_CODE_SESSION_ATTENDED',
  'CLAUDE_PID',
  'CLAUDE_EFFORT',
];

async function setup(
  slug: string,
  mode: string,
  coreEnv: Record<string, string> = {},
): Promise<{ f: Fixture; core: HcCore; path: string }> {
  const f: Fixture = await fixture();
  setPrefixes(f, { repo: 'rp' });
  setSeat(f, 'a', 'fake', mode);
  const core: HcCore = await hcCore(f, { coreEnv });
  const path: string = leaf(f, slug, 'plan.synthesis');
  return { f, core, path };
}

async function teardown(f: Fixture, core: HcCore, slug: string): Promise<void> {
  await core.stop();
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
  f.clean();
}

function environ(pid: number): Map<string, string> {
  return new Map(
    readFileSync(`/proc/${pid}/environ`, 'utf8')
      .split('\0')
      .filter(Boolean)
      .map((entry: string): [string, string] => [
        entry.slice(0, entry.indexOf('=')),
        entry.slice(entry.indexOf('=') + 1),
      ]),
  );
}

async function seatOf(core: HcCore, name: string): Promise<Terminal> {
  const found: Terminal[] = (await core.terminals({ akrogon: '1' })).filter((t: Terminal) => t.name === name);
  expect(found.map((t: Terminal) => t.state)).toEqual(['live']);
  return found[0];
}

test('the start verb starts a parentless leaf seat by name, labels, scope, env and argv task, and records the proof', async () => {
  const { f, core, path } = await setup('hs-one', 'work');
  try {
    const started = await cli(f, ['seat', 'hs-one', 'A'], f.root, core.env);
    expect(started.code).toBe(0);
    const seat: Terminal = await seatOf(core, 'rp-hs-one-a');
    expect(started.stdout).toContain(seat.address);
    expect(seat.parent).toBeNull();
    const state = readState(path);
    expect(seat.labels).toEqual({
      akrogon: '1',
      'akrogon.repo': 'repo',
      'akrogon.leaf': 'hs-one',
      'akrogon.seat': 'a',
      'herdr.space': `sp-${core.session}`,
      'herdr.tab': z.string().parse(state.tab),
      ...(seat.labels['akrogon.transcript'] === undefined
        ? {}
        : { 'akrogon.transcript': seat.labels['akrogon.transcript'] }),
    });
    expect(seat.cwd).toBe(resolve(storeDir(f), 'hs-one'));
    const pid: number = z.number().parse(seat.pid);
    expect(readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0')).toContain('--model');
    expect(readFileSync(`/proc/${pid}/cmdline`, 'utf8')).toContain('/fake');
    const slice: string = leafSlice({ name: 'repo' }, 'hs-one');
    const cgroup: string = readFileSync(`/proc/${pid}/cgroup`, 'utf8').trim();
    expect(cgroup).toMatch(
      new RegExp(`/${slice.replace('.', '\\.')}/${slice.replace(/\.slice$/, '')}-rp-hs-one-a-[0-9a-f]+\\.scope$`),
    );
    const env: Map<string, string> = environ(pid);
    expect(env.get('GIT_EDITOR')).toBe('true');
    expect(env.get('NODE_DISABLE_COMPILE_CACHE')).toBe('1');
    expect(z.string().parse(env.get('TMPDIR')).startsWith(leafTempRoot(f))).toBe(true);
    expect(z.string().parse(env.get('AKROGON_BASE'))).toMatch(/^[0-9a-f]{40}$/);
    // The first task went in argv and nothing else was sent before the proof (C1.1).
    expect(core.tasks(seat.address)).toEqual([`plan-issue hs-one slot=A phase=plan.synthesis leaf=${path}`]);
    expect(z.object({ turn: z.number(), address: z.string() }).parse(readState(path).prompted.A)).toMatchObject({
      address: seat.address,
    });
  } finally {
    await teardown(f, core, 'hs-one');
  }
});

test('slot B starts under the live A, so the sidebar indents it, and outlives it; with no live A it starts parentless', async () => {
  const { f, core } = await setup('hs-pair', 'work');
  setSeat(f, 'b', 'fake', 'work');
  try {
    expect((await cli(f, ['seat', 'hs-pair', 'B'], f.root, core.env)).code).toBe(0);
    const alone: Terminal = await seatOf(core, 'rp-hs-pair-b');
    expect(alone.parent).toBeNull();
    expect((await core.hc(['kill', alone.address])).code).toBe(0);
    expect((await cli(f, ['seat', 'hs-pair', 'A'], f.root, core.env)).code).toBe(0);
    const a: Terminal = await seatOf(core, 'rp-hs-pair-a');
    expect((await cli(f, ['seat', 'hs-pair', 'B'], f.root, core.env)).code).toBe(0);
    const b: Terminal = (await core.terminals({ 'akrogon.leaf': 'hs-pair', 'akrogon.seat': 'b' }, false))[0];
    expect(b.parent).toBe(a.address);
    expect((await core.hc(['kill', a.address])).code).toBe(0);
    await core.waitFor(a.address, (t: Terminal) => t.state === 'finished');
    expect((await core.get(b.address)).state).toBe('live');
  } finally {
    await teardown(f, core, 'hs-pair');
  }
});

test('a slug that would pass 32 characters is cut and carries 4 hex of repo/slug', async () => {
  const slug: string = 'a-very-long-leaf-slug-that-overflows-names';
  const { f, core } = await setup(slug, 'work');
  try {
    expect((await cli(f, ['seat', slug, 'A'], f.root, core.env)).code).toBe(0);
    const hex: string = createHash('sha256').update(`repo/${slug}`).digest('hex').slice(0, 4);
    const name: string = `rp-${slug.slice(0, 22).replace(/-$/, '')}-${hex}-a`;
    expect(name.length).toBeLessThanOrEqual(32);
    await seatOf(core, name);
  } finally {
    await teardown(f, core, slug);
  }
});

test('a seat that never works stays running, is reported started not confirmed, and is not resent', async () => {
  const { f, core, path } = await setup('hs-idle', 'idle');
  try {
    const started = await cli(f, ['seat', 'hs-idle', 'A'], f.root, core.env);
    expect(started.code).toBe(0);
    const seat: Terminal = await seatOf(core, 'rp-hs-idle-a');
    expect(started.stdout).toContain(`started, not confirmed ${seat.address}`);
    const recorded = readState(path).delivery_error.A;
    expect(recorded).toMatchObject({ code: 'not_confirmed', address: seat.address });
    // C1.2: the next pass leaves the unconfirmed seat alone while its turn is unchanged.
    expect((await cli(f, ['next', 'hs-idle'], f.root, core.env)).code).toBe(0);
    expect(core.tasks(seat.address)).toHaveLength(1);
    expect(readState(path).delivery_error.A).toEqual(recorded);
    expect((await core.get(seat.address)).state).toBe('live');
  } finally {
    await teardown(f, core, 'hs-idle');
  }
});

test('a seat that exits fails the start with its address', async () => {
  const { f, core } = await setup('hs-exit', 'exit');
  try {
    const started = await cli(f, ['seat', 'hs-exit', 'A'], f.root, core.env);
    expect(started.code).not.toBe(0);
    const seats: Terminal[] = (await core.terminals({ akrogon: '1' })).filter(
      (t: Terminal) => t.name === 'rp-hs-exit-a',
    );
    expect(seats).toHaveLength(1);
    expect(`${started.stdout}\n${started.stderr}`).toContain(seats[0].address);
  } finally {
    await teardown(f, core, 'hs-exit');
  }
});

test('a core carrying Claude child-session variables starts a seat without them, keeping CLAUDE_CONFIG_DIR', async () => {
  const inherited: Record<string, string> = {
    ...Object.fromEntries(markers.map((name: string): [string, string] => [name, 'inherited'])),
    CLAUDE_CONFIG_DIR: '/kept/claude',
  };
  const { f, core } = await setup('hs-env', 'work', inherited);
  try {
    expect((await cli(f, ['seat', 'hs-env', 'A'], f.root, core.env)).code).toBe(0);
    const seat: Terminal = await seatOf(core, 'rp-hs-env-a');
    const pid: number = z.number().parse(seat.pid);
    const env: Map<string, string> = environ(pid);
    expect(markers.filter((name: string) => env.has(name))).toEqual([]);
    expect(env.get('CLAUDE_CONFIG_DIR')).toBe('/kept/claude');
    expect(readFileSync(`/proc/${pid}/cmdline`, 'utf8')).toContain('/fake');
  } finally {
    await teardown(f, core, 'hs-env');
  }
});
