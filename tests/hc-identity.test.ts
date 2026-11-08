// Criteria 6 and 12 (state half): the repo's space by name across running hc sessions,
// refusals, prefixes, the pinned hc schema, the first-switch inventory and "state predates hc".
import { test, expect } from 'bun:test';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { connect } from 'node:net';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, yaml, type Fixture } from './helpers';
import { hcCore, pinnedSchema, setPrefixes, setSeat, type HcCore, type Terminal } from './hc-fixture';
import { leafSlice } from '../src/scope';
import { command, spawnCaptured } from '../src/shell';
import { GONE_CODES, sessions } from '../src/hc';

async function setup(prefixes: Record<string, string> | undefined = { repo: 'rp' }) {
  const f: Fixture = await fixture();
  setPrefixes(f, prefixes);
  setSeat(f, 'a', 'fake', 'work');
  return f;
}

async function stopSlice(slug: string): Promise<void> {
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: 'repo' }, slug)]);
}

function refused(stderr: string): string[] {
  return stderr
    .split('\n')
    .filter((line: string) => line.startsWith('{'))
    .map((line: string) => z.object({ error: z.string() }).passthrough().parse(JSON.parse(line)).error);
}

function listening(socket: string): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const probe = connect(socket);
    probe.once('connect', () => {
      probe.destroy();
      done(true);
    });
    probe.once('error', () => done(false));
  });
}

test('the space named after the repo is found through doc.get with the window closed, and seats start there', async () => {
  const f: Fixture = await setup();
  const core: HcCore = await hcCore(f);
  const other: HcCore = await hcCore(f, { repo: 'another' });
  core.link(other);
  try {
    leaf(f, 'hi-find', 'plan.synthesis');
    expect((await cli(f, ['next', 'hi-find'], f.root, core.env)).code).toBe(0);
    expect((await core.terminals({ 'akrogon.leaf': 'hi-find' })).map((t: Terminal) => t.name)).toEqual([
      'rp-hi-find-a',
    ]);
    expect(await other.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await core.stop();
    await other.stop();
    await stopSlice('hi-find');
    f.clean();
  }
});

test('no session, several sessions and an unreadable session refuse with today’s reasons, and a stale socket starts no core', async () => {
  const f: Fixture = await setup();
  const none: HcCore = await hcCore(f, { repo: 'another' });
  const twin: HcCore = await hcCore(f);
  const holder: HcCore = await hcCore(f);
  let stale: HcCore | undefined;
  // akrogon reads sessions through its own runtime, where the stale socket is a link: a core hc
  // auto-started for the dead session would replace that link with a live socket.
  const effective = (core: HcCore): string => resolve(none.runtime, 'herdr-core', `${core.session}.sock`);
  try {
    leaf(f, 'hi-refuse', 'plan.synthesis');
    const missing = await cli(f, ['next', 'hi-refuse'], f.root, none.env);
    expect(missing.code).not.toBe(0);
    expect(refused(missing.stderr).join('\n')).toContain('no running session holds it');
    holder.link(twin);
    const several = await cli(f, ['next', 'hi-refuse'], f.root, holder.env);
    expect(several.code).not.toBe(0);
    expect(refused(several.stderr).join('\n')).toContain('held by multiple sessions');
    // A core killed without cleanup leaves its socket; discovery skips it as stopped and starts nothing.
    stale = await hcCore(f, { repo: 'another' });
    const status = await stale.hc(['server', 'status', '--json']);
    process.kill(z.object({ pid: z.number() }).parse(JSON.parse(status.stdout)).pid, 'SIGKILL');
    none.link(stale);
    expect(await listening(stale.socket)).toBe(false);
    const skipped = await cli(f, ['next', 'hi-refuse'], f.root, none.env);
    expect(refused(skipped.stderr).join('\n')).toContain('no running session holds it');
    expect(refused(skipped.stderr).join('\n')).toContain(stale.session);
    expect(await listening(stale.socket)).toBe(false);
    expect(lstatSync(effective(stale)).isSymbolicLink()).toBe(true);
    expect(await listening(effective(stale))).toBe(false);
    expect(await twin.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    for (const core of stale !== undefined && (await listening(effective(stale))) ? [stale] : [])
      await spawnCaptured(['hc', 'server', 'stop'], { env: { ...none.env, HC_SESSION: core.session } });
    for (const core of [none, twin, holder]) await core.stop();
    for (const core of stale === undefined ? [] : [stale]) core.discard();
    await stopSlice('hi-refuse');
    f.clean();
  }
});

test('dispatch refuses a repo without a prefix and init refuses a duplicate prefix, both naming prefixes', async () => {
  const f: Fixture = await setup({});
  const core: HcCore = await hcCore(f);
  try {
    leaf(f, 'hi-prefix', 'plan.synthesis');
    const result = await cli(f, ['next', 'hi-prefix'], f.root, core.env);
    expect(result.code).not.toBe(0);
    expect(refused(result.stderr).join('\n')).toContain('prefixes');
    expect(await core.terminals({ akrogon: '1' })).toEqual([]);
    const second: string = resolve(f.home, 'second');
    mkdirSync(second);
    await command(['git', 'init', '-b', 'main', second]);
    setPrefixes(f, { repo: 'rp', second: 'rp' });
    const init = await cli(f, ['init'], second, core.env);
    expect(init.code).not.toBe(0);
    expect(init.stderr).toContain('prefixes');
    const global = z.object({ repos: z.record(z.string(), z.string()) }).passthrough();
    expect(
      Object.keys(global.parse(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8'))).repos),
    ).toEqual(['repo']);
  } finally {
    await core.stop();
    f.clean();
  }
});

// Asked of a core the test starts from the installed hc, never of whatever session the environment names
// (under verify that was the operator's `default` core, so its version decided the result).
test('the parts of hc schema akrogon parses match the pinned copy', async () => {
  const f: Fixture = await setup();
  const core: HcCore = await hcCore(f);
  try {
    const reply = await core.hc(['schema']);
    expect(reply.code).toBe(0);
    const pinned: object = JSON.parse(readFileSync(resolve(import.meta.dir, 'fixtures/hc-schema.json'), 'utf8'));
    expect(pinnedSchema(reply.stdout)).toEqual(pinned);
  } finally {
    await core.stop();
    f.clean();
  }
});

// The listener died on 2026-11-08: a test core closing while it was probed made connect fail with
// ECONNRESET, sessions() threw and the listener exited. A reset reads as gone like a refused or missing
// socket; a socket this process may not reach still fails discovery, so a live duplicate is never hidden.
test('a closing core reads as stopped, and an unreachable socket still fails the session list', async () => {
  expect([...GONE_CODES].sort()).toEqual(['ECONNREFUSED', 'ECONNRESET', 'ENOENT']);
  const runtime: string = mkdtempSync(resolve(tmpdir(), 'akr-probe-'));
  const before: string | undefined = process.env.XDG_RUNTIME_DIR;
  try {
    mkdirSync(resolve(runtime, 'herdr-core'));
    writeFileSync(resolve(runtime, 'herdr-core', 'locked.sock'), '', { mode: 0o000 });
    process.env.XDG_RUNTIME_DIR = runtime;
    await expect(sessions()).rejects.toThrow('EACCES');
  } finally {
    process.env.XDG_RUNTIME_DIR = before;
    rmSync(runtime, { recursive: true, force: true });
  }
});

test('first-switch inventory reads cleanly with no hc call on old ids, and live old pane state is refused', async () => {
  const f: Fixture = await setup();
  const core: HcCore = await hcCore(f);
  try {
    const old = {
      tab: 'w8:tA1',
      pane: { A: 'w8:pA1', B: 'w8:pB1' },
      prompted: { A: '3c8fd3a7-a08d-4f7b-8252-3095bf319449' },
      prompted_at: { A: '2026-11-07T14:38:05.641Z' },
    };
    leaf(f, 'hi-merged-deployer', 'merged', old, 'epic/hc-engine');
    leaf(f, 'hi-merged-engine', 'merged', { ...old, tab: 'w8:tA2' }, 'epic/hc-engine');
    leaf(f, 'hi-blocked', 'plan.synthesis', { 'blocked-by': ['hi-merged-engine', 'hi-other'] }, 'epic/hc-next');
    leaf(f, 'hi-other', 'plan.synthesis', { 'blocked-by': ['hi-merged-engine'] }, 'epic/hc-next');
    const closed: string = resolve(f.root, 'issues/closed/old-issue/hi-closed');
    mkdirSync(closed, { recursive: true });
    yaml(resolve(closed, 'state.yaml'), {
      slug: 'hi-closed',
      phase: 'merged',
      created: '2026-10-01',
      repo: 'repo',
      'blocked-by': [],
      ...old,
      tab: 'w8:tA3',
    });
    const resume = await cli(f, ['next', '--resume'], f.root, core.env);
    expect(resume.stderr).not.toContain('state predates hc');
    expect(readFileSync(core.shimLog, 'utf8')).not.toContain('w8:');
    expect(
      core
        .appCalls()
        .flatMap((call) => call.argv)
        .join(' '),
    ).not.toContain('w8:');
    // A leaf with work recorded on old pane ids is refused.
    leaf(f, 'hi-live-old', 'implement', { tab: 'w8:tA4', pane: { A: 'w8:pA4' } });
    const live = await cli(f, ['next', 'hi-live-old'], f.root, core.env);
    expect(live.code).not.toBe(0);
    expect(live.stderr).toContain('state predates hc');
    expect(await core.terminals({ 'akrogon.leaf': 'hi-live-old' })).toEqual([]);
  } finally {
    await core.stop();
    await stopSlice('hi-other');
    f.clean();
  }
});
