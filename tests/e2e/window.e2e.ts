// Criterion 7, attended window tier (live, free): a real herdr-app window in akr-e2e-engine with
// the stand-in agent and cat only. Run: AKROGON_E2E=window AKROGON_E2E_ROOT=<leaf temp>
// AKROGON_E2E_OUT=<leaf>/implementation/window-tier bun test ./tests/e2e/window.e2e.ts
import { test, expect } from 'bun:test';
import { mkdirSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { readState, saveState } from '../../src/state';
import { appHome, realEnv, required, session, startTier, stopTier, type Tier } from './tier';

const docSchema = z.object({
  version: z.number(),
  value: z.object({
    spaces: z.array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          tabs: z.array(z.object({ id: z.string(), name: z.string(), root: z.unknown() }).passthrough()),
        })
        .passthrough(),
    ),
  }),
});

function blocks(root: unknown): string[] {
  const node = z
    .object({ content: z.object({ terminal: z.string() }).optional(), children: z.array(z.unknown()).optional() })
    .passthrough()
    .parse(root);
  return node.content !== undefined ? [node.content.terminal] : (node.children ?? []).flatMap(blocks);
}

async function doc(tier: Tier) {
  return docSchema.parse(await tier.rpc('doc.get', { name: 'herdr-app' }));
}

async function tabOf(tier: Tier, tab: string) {
  return (await doc(tier)).value.spaces.flatMap((s) => s.tabs).find((t) => t.id === tab);
}

function app(args: string[]): Promise<SpawnResult> {
  return spawnCaptured(['herdr-app', ...args], { env: realEnv({ HERDR_APP_HOME: appHome }) });
}

async function leafOf(tier: Tier, slug: string, phase: string): Promise<string> {
  const path: string = resolve(tier.root, 'issues/open/e2e', slug);
  mkdirSync(path, { recursive: true });
  await Bun.write(
    resolve(path, 'state.yaml'),
    Bun.YAML.stringify({ slug, phase, created: '2026-11-07', repo: 'akre2e', 'blocked-by': [] }),
  );
  return path;
}

async function address(tier: Tier, labels: Record<string, string>): Promise<string> {
  const listed = z
    .object({ terminals: z.array(z.object({ address: z.string(), state: z.string() }).passthrough()) })
    .parse(await tier.rpc('terminal.list', { labels }));
  const live = listed.terminals.filter((t) => t.state === 'live');
  expect(live).toHaveLength(1);
  return live[0].address;
}

test('window tier: tabs by labels, names, focus kept, closed-window adoption, app home, tab close, consultant placement', async () => {
  expect(required('AKROGON_E2E')).toBe('window');
  const standinDir: string = resolve(required('AKROGON_E2E_ROOT'), 'akr-e2e-engine-standin');
  const standinBin: string = resolve(standinDir, 'bin');
  mkdirSync(standinBin, { recursive: true });
  symlinkSync(resolve(import.meta.dir, '../stand-in.sh'), resolve(standinBin, 'fake'));
  const slots = {
    a: { harness: 'fake', model: 'work', effort: 'low' },
    b: { harness: 'fake', model: 'work', effort: 'low' },
  };
  const tier: Tier = await startTier('window', { fake: 'fake --model {model} --effort {effort}' }, slots, {
    bin: standinBin,
    dir: standinDir,
  });
  let window: Bun.Subprocess | null = null;
  try {
    // Window closed: start returns with labels set; seats stay alive past the pane wait.
    const closedLeaf: string = await leafOf(tier, 'e2e-closed', 'plan.synthesis');
    const failedLeaf: string = await leafOf(tier, 'e2e-failed', 'plan.synthesis');
    expect((await tier.akrogon(['seat', 'e2e-closed', 'A'])).code).toBe(0);
    expect((await tier.akrogon(['seat', 'e2e-failed', 'A'])).code).toBe(0);
    const closedSeat: string = await address(tier, { 'akrogon.leaf': 'e2e-closed' });
    expect((await tier.hc(['wait', closedSeat, '--output', 'never-printed', '--timeout', '16'])).code).not.toBe(0);
    saveState(failedLeaf, {
      ...readState(failedLeaf),
      phase: 'failed',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'failed while the window was closed' },
    });
    // Open the window; the next engine pass names the adopted tabs.
    window = Bun.spawn(['herdrapp', '--session', session], { env: realEnv(), stdout: 'ignore', stderr: 'ignore' });
    let opened: boolean = false;
    for (let attempt: number = 0; attempt < 20 && !opened; attempt += 1) {
      opened = (await app(['ls'])).code === 0;
      if (!opened) await tier.hc(['wait', closedSeat, '--output', 'never-printed', '--timeout', '1']);
    }
    expect(opened).toBe(true);
    expect((await tier.akrogon(['next', '--resume'])).code).toBe(0);
    tier.record('closed-then-open.json', await doc(tier));
    expect((await tabOf(tier, z.string().parse(readState(closedLeaf).tab)))?.name).toBe('e2e-closed');
    expect((await tabOf(tier, z.string().parse(readState(failedLeaf).tab)))?.name).toBe('e2e-failed failed');
    expect((await tier.hc(['get', '--json', closedSeat])).stdout).toContain('"state":"live"');
    // Window open: A then B in one tab, B beside A, active tab and focused pane unchanged.
    const openLeaf: string = await leafOf(tier, 'e2e-open', 'check.review');
    const before: SpawnResult = await app(['status']);
    expect((await tier.akrogon(['seat', 'e2e-open', 'A'])).code).toBe(0);
    expect((await tier.akrogon(['seat', 'e2e-open', 'B'])).code).toBe(0);
    const after: SpawnResult = await app(['status']);
    tier.record('status-before.txt', before.stdout);
    tier.record('status-after.txt', after.stdout);
    const focus = (text: string): unknown =>
      z.object({ space: z.unknown(), tab: z.unknown(), pane: z.unknown() }).passthrough().parse(JSON.parse(text));
    expect(focus(after.stdout)).toMatchObject(
      z.object({ space: z.unknown(), tab: z.unknown(), pane: z.unknown() }).parse(focus(before.stdout)),
    );
    const openTab = await tabOf(tier, z.string().parse(readState(openLeaf).tab));
    expect(openTab?.name).toBe('e2e-open');
    const a: string = await address(tier, { 'akrogon.leaf': 'e2e-open', 'akrogon.seat': 'a' });
    const b: string = await address(tier, { 'akrogon.leaf': 'e2e-open', 'akrogon.seat': 'b' });
    expect(blocks(openTab?.root)).toEqual([a, b]);
    tier.record('open.json', await doc(tier));
    // App home agrees with herdrapp's own list.
    const sessions = z
      .array(z.object({ name: z.string(), home: z.string() }).passthrough())
      .parse(JSON.parse((await spawnCaptured(['herdrapp', 'session', 'list', '--json'], { env: realEnv() })).stdout));
    expect(sessions.find((s) => s.name === session)?.home).toBe(appHome);
    // A merged leaf's tab is closed.
    saveState(closedLeaf, { ...readState(closedLeaf), phase: 'merged', done: [] });
    expect((await tier.akrogon(['next', '--resume'])).code).toBe(0);
    expect(await tabOf(tier, z.string().parse(readState(closedLeaf).tab))).toBeUndefined();
    // Consultants: a door in a tab gets its tab; a door in no tab gets only the space.
    const door = z
      .object({ address: z.string() })
      .parse(
        JSON.parse(
          (
            await tier.hc([
              'run',
              '--bg',
              '--json',
              '--no-parent',
              '--label',
              'herdr.space=spakre2e',
              '--label',
              'herdr.tab=doortab',
              '--',
              'cat',
            ])
          ).stdout,
        ),
      );
    const consultant: SpawnResult = await tier.akrogon(
      ['seat', '--slot', 'c', '--harness', 'fake', '--model', 'work', '--effort', 'low', '--task', 'hello'],
      { HC_TERMINAL_ID: door.address },
    );
    expect(consultant.code).toBe(0);
    const joined: string = await address(tier, { 'akrogon.seat': 'c' });
    expect(blocks((await tabOf(tier, 'doortab'))?.root)).toContain(joined);
    const bare = z
      .object({ address: z.string() })
      .parse(JSON.parse((await tier.hc(['run', '--bg', '--json', '--no-parent', '--', 'cat'])).stdout));
    expect(
      (
        await tier.akrogon(['seat', '--slot', 'd', '--harness', 'fake', '--model', 'work', '--effort', 'low'], {
          HC_TERMINAL_ID: bare.address,
        })
      ).code,
    ).toBe(0);
    const alone: string = await address(tier, { 'akrogon.seat': 'd' });
    const own = (await doc(tier)).value.spaces.flatMap((s) => s.tabs).filter((t) => blocks(t.root).includes(alone));
    expect(own).toHaveLength(1);
    expect(blocks(own[0].root)).toEqual([alone]);
    tier.record('consultants.json', await doc(tier));
  } finally {
    const left: string[] = await stopTier(tier, [standinDir]);
    window?.kill();
    tier.record('absence.txt', left.length === 0 ? 'absent\n' : left.join('\n'));
    expect(left).toEqual([]);
  }
}, 600_000);
