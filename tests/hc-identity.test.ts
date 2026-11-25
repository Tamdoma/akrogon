// Criteria 6 and 12 (state half): the repo's space by name across running hc sessions,
// refusals, prefixes, the first-switch inventory and "state predates hc".
import { test, expect } from 'bun:test';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { connect } from 'node:net';
import { resolve } from 'node:path';
import { z } from 'zod';
import { cli, fixture, leaf, yaml, WAIT_MS, type Fixture } from './helpers';
import { hcCore, setPrefixes, setSeat, type HcCore, type Terminal, stopCoresAfterFile } from './hc-fixture';
import { leafSlice } from '../src/scope';
import { command, spawnCaptured, type SpawnResult } from '../src/shell';
import { GONE_CODES, HcError, hcReader, sessions, terminal } from '../src/hc';
import { readState } from '../src/state';

stopCoresAfterFile();

async function setup(prefixes?: Record<string, string>) {
  const f: Fixture = await fixture();
  setPrefixes(f, prefixes ?? { [f.repo]: f.prefix });
  setSeat(f, 'a', 'fake', 'work');
  return f;
}

async function stopSlice(f: Fixture, slug: string): Promise<void> {
  await spawnCaptured(['systemctl', '--user', 'stop', leafSlice({ name: f.repo }, slug, f.home)]);
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
      `${f.prefix}-hi-find-a`,
    ]);
    expect(await other.terminals({ akrogon: '1' })).toEqual([]);
  } finally {
    await core.stop();
    await other.stop();
    await stopSlice(f, 'hi-find');
    f.clean();
  }
});

test('dispatch never adopts another session terminal after the repo core changes', async () => {
  const f: Fixture = await setup();
  const old: HcCore = await hcCore(f);
  const current: HcCore = await hcCore(f);
  const path: string = leaf(f, 'hi-session-change', 'plan.synthesis');
  try {
    expect((await cli(f, ['next', 'hi-session-change'], f.root, old.env)).code).toBe(0);
    const address: string = z.string().parse(readState(path).seat.A?.address);
    await old.stop();
    const started: SpawnResult = await current.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--name',
      'unrelated',
      '--cwd',
      f.root,
      '--',
      'fake',
      '--model',
      'work',
      '--effort',
      'low',
      'USER_TASK',
    ]);
    expect(started.code).toBe(0);
    const unrelated: string = z.object({ address: z.string() }).parse(JSON.parse(started.stdout)).address;
    expect(unrelated).toBe(address);
    await current.waitFor(unrelated, (t: Terminal) => t.turn >= 1 && t.status?.state === 'idle');
    expect((await cli(f, ['next', 'hi-session-change'], f.root, current.env)).code).toBe(0);
    expect(current.tasks(unrelated)).toEqual(['USER_TASK']);
    expect(readState(path).seat.A?.session).toBe(current.session);
    expect(readState(path).seat.A?.address).not.toBe(unrelated);
  } finally {
    await old.stop();
    await current.stop();
    await stopSlice(f, 'hi-session-change');
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
    const pid: number = z.object({ pid: z.number() }).parse(JSON.parse(status.stdout)).pid;
    process.kill(pid, 'SIGKILL');
    // SIGKILL lands asynchronously: the socket accepts until the core's last thread exits. A zombie
    // leader proves nothing, since its other threads still hold the socket while they exit.
    const begun: number = Date.now();
    while (await listening(stale.socket)) {
      if (Date.now() - begun > WAIT_MS) throw new Error(`core ${pid} still accepts after SIGKILL`);
      await Bun.sleep(50);
    }
    none.link(stale);
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
    await stopSlice(f, 'hi-refuse');
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
    setPrefixes(f, { [f.repo]: f.prefix, second: f.prefix });
    const init = await cli(f, ['init'], second, core.env);
    expect(init.code).not.toBe(0);
    expect(init.stderr).toContain('prefixes');
    const global = z.object({ repos: z.record(z.string(), z.string()) }).passthrough();
    expect(
      Object.keys(global.parse(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8'))).repos),
    ).toEqual([f.repo]);
  } finally {
    await core.stop();
    f.clean();
  }
});

// hc evolves on its own release cadence: a line kind or event type akrogon does not read (a heartbeat, a
// notification or event type a newer hc adds) is skipped, `missed` delivers its fresh snapshot and drops
// the stale events it already covers, and a malformed line of a kind akrogon reads still fails the stream.
test('the event stream skips line kinds it does not read and still rejects a malformed terminal event', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-follow-'));
  try {
    const stream = (lines: object[]): Promise<SpawnResult> => {
      writeFileSync(
        resolve(dir, 'hc'),
        `#!/bin/sh\ncat <<'EOF'\n${lines.map((line: object) => JSON.stringify(line)).join('\n')}\nEOF\n`,
        { mode: 0o755 },
      );
      const script: string = [
        `import { follow } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
        'const got = [];',
        "await follow('s', [], (line) => { got.push(line); }).ended;",
        'console.log(JSON.stringify(got));',
      ].join('\n');
      return spawnCaptured(['bun', '-e', script], { env: { ...process.env, PATH: `${dir}:${process.env.PATH}` } });
    };
    const record = (turn: number): object => ({
      address: 't1',
      labels: {},
      argv: ['sh'],
      cwd: '/',
      state: 'live',
      created_ms: 1,
      screen: 'exact',
      cols: 80,
      rows: 24,
      turn,
    });
    const status = (seq: number, state: string): object => ({
      method: 'event',
      params: { type: 'status', terminal: 't1', seq, data: { status: { state } } },
    });
    const turn = { method: 'event', params: { type: 'turn', terminal: 't1', seq: 6, data: null } };
    const skipped: SpawnResult = await stream([
      { seq: 0, terminals: [record(0)] },
      { seq: 0, terminals: [record(1)], params: null },
      { method: 'heartbeat', params: { seq: 0 } },
      { method: 'notice', params: { text: 'a newer hc kind' } },
      { method: 'event', params: { type: 'presence', seq: 1, data: {} } },
      { method: 'missed', params: { seq: 5, terminals: [record(2)] } },
      status(3, 'idle'),
      status(5, 'idle'),
      turn,
    ]);
    expect(skipped.code).toBe(0);
    expect(JSON.parse(skipped.stdout)).toMatchObject([
      { terminals: [{ session: 's', address: 't1', turn: 0 }] },
      { terminals: [{ session: 's', address: 't1', turn: 1 }] },
      { terminals: [{ session: 's', address: 't1', turn: 2 }] },
      turn,
    ]);
    const malformed: [object, string][] = [
      [{ method: 'event', params: { type: 'turn', terminal: 't1', seq: 'two', data: null } }, 'seq'],
      [{ method: 'event', params: { type: 'turn', seq: 2, data: null } }, 'terminal'],
      [{ seq: 0, terminals: 42, params: null }, 'terminals'],
      [{ method: 'missed', params: { seq: 5, terminals: 42 } }, 'terminals'],
    ];
    for (const [line, field] of malformed) {
      const failed: SpawnResult = await stream([line]);
      expect(failed.code).not.toBe(0);
      expect(failed.stderr).toContain(field);
    }
    // The test readers share the cutoff: the hc fixture's reader drops the same stale status.
    const fixtureReader = hcReader(new Set(['status', 'turn']));
    expect(
      [
        { seq: 0, terminals: [record(1)] },
        { method: 'missed', params: { seq: 5, terminals: [record(2)] } },
        status(3, 'idle'),
        status(6, 'idle'),
      ].map((line: object) => fixtureReader(line) !== null),
    ).toEqual([true, true, false, true]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A fake hc terminal record and its status report event, and a fake hc in <dir> that logs each call's
// command to <dir>/calls.
function fakeRecord(turn: number, status: string | null): object {
  return {
    address: 't1',
    labels: {},
    argv: ['sh'],
    cwd: '/',
    state: 'live',
    created_ms: 1,
    screen: 'exact',
    cols: 80,
    rows: 24,
    turn,
    status: status === null ? null : { state: status },
  };
}
function fakeReport(seq: number, state: string): object {
  return {
    method: 'event',
    params: { type: 'status', terminal: 't1', seq, data: { records: {}, reported: true, status: { state } } },
  };
}
function fakeHc(dir: string, body: string[]): void {
  rmSync(resolve(dir, 'calls'), { force: true });
  writeFileSync(
    resolve(dir, 'hc'),
    ['#!/bin/sh', `printf '%s\n' "$1" >> '${dir}/calls'`, ...body, 'exit 1'].join('\n') + '\n',
    { mode: 0o755 },
  );
}
// A fake hc turn event, and a fake hc branch that answers `hc get` with the record after `hold` seconds.
function fakeTurn(seq: number, turn: number): object {
  return { method: 'event', params: { type: 'turn', terminal: 't1', seq, data: { turn } } };
}
function fakeGet(record: object, hold: number = 0): string {
  return `if [ "$1" = get ]; then ${hold > 0 ? `sleep ${hold}; ` : ''}printf '%s\n' '${JSON.stringify(record)}'; exit 0; fi`;
}
function fakeLines(lines: object[]): string {
  return `printf '%s\n' ${lines.map((line: object) => `'${JSON.stringify(line)}'`).join(' ')}`;
}
function fakeCalls(dir: string): string[] {
  return readFileSync(resolve(dir, 'calls'), 'utf8').split('\n').filter(Boolean);
}
function inProcess(dir: string, script: string[], env: NodeJS.ProcessEnv = {}): Promise<SpawnResult> {
  return spawnCaptured(['bun', '-e', [...script, 'process.exit(0);'].join('\n')], {
    env: { ...process.env, ...env, PATH: `${dir}:${process.env.PATH}` },
  });
}

// The agy retry reads events: hc sends a fresh idle report although the state stays idle, and that report
// reaches the predicate.
test('an event wait passes a fresh status report with an unchanged state to its predicate', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-wait-'));
  try {
    fakeHc(dir, [
      `if [ "$1" = events ]; then ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'idle')] }, fakeReport(6, 'idle')])}; exec sleep 30; fi`,
    ]);
    const repeated: SpawnResult = await inProcess(dir, [
      `import { subscribe, waitFor } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      'const asked = [];',
      "const stream = await subscribe('s', ['--terminal', 't1']);",
      "const t = await waitFor(stream, 't1', null, (t) => { asked.push(`${t.turn} ${t.status?.state}`); return false; }, 1500);",
      'stream.stop();',
      'console.log(JSON.stringify({ t, asked }));',
    ]);
    expect(repeated.code).toBe(0);
    expect(JSON.parse(repeated.stdout)).toEqual({ t: null, asked: ['0 idle', '0 idle'] });
    expect(fakeCalls(dir)).toEqual(['events']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// hc 0.1.22 can drop the report a seat makes while a subscription starts, from the events and the
// snapshot both. The fake hc closes a stream opened after the seat runs at once, so that order fails fast;
// a stream opened before it gets the seat's `created` event and its reports. An agy seat reports idle at
// once: its task goes in on that report and its start is confirmed.
test('a seat that reports at once never loses that report', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-start-'));
  try {
    const created: object = {
      method: 'event',
      params: { type: 'created', terminal: 't1', seq: 2, data: fakeRecord(0, null) },
    };
    const wait = (command: string): string => `while ! grep -q '^${command}$' '${dir}/calls'; do sleep 0.02; done`;
    fakeHc(dir, [
      'if [ "$1" = events ]; then',
      `  if grep -q '^run$' '${dir}/calls'; then exit 1; fi`,
      `  ${fakeLines([{ seq: 1, terminals: [] }])}`,
      `  ${wait('run')}`,
      `  ${fakeLines([created, fakeReport(3, 'idle')])}`,
      `  ${wait('send')}`,
      `  ${fakeLines([fakeReport(4, 'working')])}`,
      '  exec sleep 30',
      'fi',
      `if [ "$1" = connect ]; then ${fakeLines([{ jsonrpc: '2.0', id: 1, result: { version: 1, value: null } }])}; exit 0; fi`,
      `if [ "$1" = run ]; then ${fakeLines([{ address: 't1' }])}; exit 0; fi`,
      `if [ "$1" = get ]; then ${fakeLines([fakeRecord(0, 'idle')])}; exit 0; fi`,
      `if [ "$1" = send ]; then ${fakeLines([{ started: true, status: 'working', turn: 0 }])}; exit 0; fi`,
      `if [ "$1" = read ]; then echo screen; exit 0; fi`,
    ]);
    const started: SpawnResult = await inProcess(
      dir,
      [
        `import { startConsultant } from ${JSON.stringify(resolve(import.meta.dir, '../src/seat.ts'))};`,
        "const global = { harnesses: { agy: 'agy --model {model}' }, prefixes: { r: 'rp' } };",
        "const config = { harness: 'agy', model: 'm', effort: 'high' };",
        "const started = await startConsultant(global, { name: 'r' }, { session: 's', space: 'sp' }, 't0', 'c', config, 'task');",
        'console.log(JSON.stringify(started.outcome));',
      ],
      { AKROGON_START_PROOF_MS: String(WAIT_MS) },
    );
    expect(started.code).toBe(0);
    expect(started.stdout.trim().split('\n').at(-1)).toBe('"confirmed"');
    expect(fakeCalls(dir).filter((call: string) => call === 'send')).toHaveLength(1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// One deadline bounds a seat's agy wait, and it settles at that deadline while the trust-key call is still
// pending. The fake `hc run` returns once the seat's trust dialog is on the stream, so the start-proof
// budget covers no launch. The reply comes after that budget, with an idle report queued meanwhile: the
// wait sends no task, and the reply, a success or a failure, changes nothing (a failure is logged).
test.each([
  ['succeeds', 0],
  ['fails', 1],
])(
  'a spent agy wait settles at its deadline while a held trust-key reply later %s',
  async (_: string, code: number) => {
    const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-held-'));
    try {
      const created: object = {
        method: 'event',
        params: { type: 'created', terminal: 't1', seq: 2, data: fakeRecord(0, null) },
      };
      const blocked: object = {
        method: 'event',
        params: {
          type: 'status',
          terminal: 't1',
          seq: 3,
          data: { records: {}, reported: true, status: { state: 'blocked', kind: 'permission' } },
        },
      };
      const wait = (command: string): string => `while ! grep -q '^${command}$' '${dir}/calls'; do sleep 0.02; done`;
      fakeHc(dir, [
        'if [ "$1" = events ]; then',
        `  ${fakeLines([{ seq: 1, terminals: [] }])}`,
        `  ${wait('run')}`,
        `  ${fakeLines([created, blocked])}`,
        `  touch '${dir}/announced'`,
        `  ${wait('keys')}`,
        `  ${fakeLines([fakeReport(4, 'idle')])}`,
        '  exec sleep 30',
        'fi',
        `if [ "$1" = connect ]; then ${fakeLines([{ jsonrpc: '2.0', id: 1, result: { version: 1, value: null } }])}; exit 0; fi`,
        `if [ "$1" = run ]; then while [ ! -e '${dir}/announced' ]; do sleep 0.02; done; ${fakeLines([{ address: 't1' }])}; exit 0; fi`,
        `if [ "$1" = keys ]; then sleep 3; touch '${dir}/replied'; exit ${code}; fi`,
        `if [ "$1" = get ]; then ${fakeLines([fakeRecord(0, 'idle')])}; exit 0; fi`,
        `if [ "$1" = send ]; then ${fakeLines([{ started: true, status: 'working', turn: 0 }])}; exit 0; fi`,
        `if [ "$1" = read ]; then echo screen; exit 0; fi`,
      ]);
      const started: SpawnResult = await inProcess(
        dir,
        [
          `import { existsSync } from 'node:fs';`,
          `import { startConsultant } from ${JSON.stringify(resolve(import.meta.dir, '../src/seat.ts'))};`,
          'const warned = Promise.withResolvers();',
          'const warn = console.warn;',
          "console.warn = (line) => { warn(line); if (String(line).includes('wait predicate failed after its deadline')) warned.resolve(true); };",
          "const global = { harnesses: { agy: 'agy --model {model}' }, prefixes: { r: 'rp' } };",
          "const config = { harness: 'agy', model: 'm', effort: 'high' };",
          "const started = await startConsultant(global, { name: 'r' }, { session: 's', space: 'sp' }, 't0', 'c', config, 'task');",
          `const early = !existsSync(${JSON.stringify(resolve(dir, 'replied'))});`,
          `const logged = ${code} === 0 ? false : await Promise.race([warned.promise, Bun.sleep(10000).then(() => false)]);`,
          'console.log(JSON.stringify({ outcome: started.outcome, early, logged }));',
        ],
        { AKROGON_START_PROOF_MS: '300' },
      );
      expect(started.code).toBe(0);
      expect(JSON.parse(started.stdout.trim().split('\n').at(-1) ?? '')).toEqual({
        outcome: 'unconfirmed',
        early: true,
        logged: code !== 0,
      });
      expect(fakeCalls(dir)).toContain('keys');
      expect(fakeCalls(dir)).not.toContain('send');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);

// A predicate that rejects after its wait ended, with a reason that is no Error, is logged and changes
// nothing. The short wait starts once the stream has its snapshot, so it covers no launch.
test.each([['undefined'], ['Object.create(null)']])(
  'a predicate rejection after the deadline is logged when its reason is %s',
  async (reason: string) => {
    const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-reason-'));
    try {
      fakeHc(dir, [
        `if [ "$1" = events ]; then ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'idle')] }])}; exec sleep 30; fi`,
      ]);
      const late: SpawnResult = await inProcess(dir, [
        `import { subscribe, waitFor } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
        'const warned = Promise.withResolvers();',
        'const warn = console.warn;',
        "console.warn = (line) => { warn(line); if (String(line).includes('wait predicate failed after its deadline')) warned.resolve(typeof JSON.parse(line).error === 'string'); };",
        "const stream = await subscribe('s', ['--terminal', 't1']);",
        `const t = await waitFor(stream, 't1', null, () => new Promise((_, reject) => setTimeout(() => reject(${reason}), 300)), 100);`,
        'const logged = await Promise.race([warned.promise, Bun.sleep(5000).then(() => false)]);',
        'stream.stop();',
        'console.log(JSON.stringify({ t, logged }));',
      ]);
      expect(late.code).toBe(0);
      expect(JSON.parse(late.stdout)).toEqual({ t: null, logged: true });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);

// hc 0.1.22 can drop a change made while a stream starts from its events and its snapshot both: here
// the snapshot shows the terminal working, no event follows, and only a read shows it idle.
test('a wait on a running terminal passes on a read of the terminal its events missed', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-stale-'));
  try {
    fakeHc(dir, [
      `if [ "$1" = events ]; then ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'working')] }])}; exec sleep 600; fi`,
      fakeGet(fakeRecord(1, 'idle')),
    ]);
    const stale: SpawnResult = await inProcess(dir, [
      `import { waitForTerminal } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      `const t = await waitForTerminal('s', 't1', (t) => t.status?.state === 'idle', ${WAIT_MS});`,
      'console.log(JSON.stringify({ turn: t?.turn, state: t?.status?.state }));',
    ]);
    expect({ code: stale.code, stderr: stale.code === 0 ? '' : stale.stderr }).toEqual({ code: 0, stderr: '' });
    expect(JSON.parse(stale.stdout)).toEqual({ turn: 1, state: 'idle' });
    expect(fakeCalls(dir)).toEqual(['events', 'get']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// The read shows turn 1 working while turn-0 reports are still queued. Merged onto the read they would
// compose turn 1 idle, a state that never happened, and the rename wait would pass on it.
test('a wait on a running terminal never merges queued events onto its read', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-merge-'));
  try {
    const queued: object[] = [
      { seq: 5, terminals: [fakeRecord(0, 'idle')] },
      fakeReport(6, 'idle'),
      fakeReport(7, 'working'),
      fakeReport(8, 'blocked'),
      fakeTurn(9, 1),
      fakeReport(10, 'working'),
      fakeReport(11, 'done'),
    ];
    fakeHc(dir, [
      `if [ "$1" = events ]; then ${fakeLines(queued)}; exec sleep 600; fi`,
      fakeGet(fakeRecord(1, 'working')),
    ]);
    const merged: SpawnResult = await inProcess(dir, [
      `import { waitForTerminal } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      'const asked = [];',
      'const renamed = (t) => { asked.push(`${t.turn} ${t.status?.state}`); return t.turn > 0 && ["idle", "done"].includes(t.status?.state); };',
      `const t = await waitForTerminal('s', 't1', renamed, ${WAIT_MS});`,
      'console.log(JSON.stringify({ turn: t?.turn, state: t?.status?.state, asked }));',
    ]);
    expect({ code: merged.code, stderr: merged.code === 0 ? '' : merged.stderr }).toEqual({ code: 0, stderr: '' });
    const report = z
      .object({ turn: z.number(), state: z.string(), asked: z.array(z.string()) })
      .parse(JSON.parse(merged.stdout));
    expect({ turn: report.turn, state: report.state }).toEqual({ turn: 1, state: 'done' });
    expect(report.asked).not.toContain('1 idle');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A slow read holds back no event: the read suspends itself (SIGSTOP) before it would answer with a record
// no event shows, and the idle report that follows the snapshot ends the wait first. The wait then kills the
// read, which a suspended process holds SIGTERM against, so the process exits without the read answering and
// the predicate is not asked after the wait returns. The process reports at exit, without process.exit, so a
// live read holds it open until the WAIT_MS bound. The idle report comes only once the read is suspended.
test('a wait on a running terminal reads its events while the read is slow, and kills the suspended read', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-slow-'));
  const pid: string = resolve(dir, 'pid');
  try {
    fakeHc(dir, [
      `if [ "$1" = events ]; then ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'working')] }])}; until [ -s '${pid}' ] && grep -q '^State:[[:space:]]*T' /proc/$(cat '${pid}')/status; do sleep 0.01; done; ${fakeLines([fakeReport(6, 'idle')])}; exec sleep 600; fi`,
      `if [ "$1" = get ]; then printf '%s' $$ > '${pid}.new'; mv '${pid}.new' '${pid}'; kill -STOP $$; touch '${dir}/answered'; printf '%s\\n' '${JSON.stringify(fakeRecord(7, 'idle'))}'; exit 0; fi`,
    ]);
    const script: string = [
      `import { existsSync, readFileSync } from 'node:fs';`,
      `import { waitForTerminal } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      'let returned = false;',
      'let late = 0;',
      'let seen = null;',
      `process.on('exit', () => console.log(JSON.stringify({ ...seen, late, answered: existsSync(${JSON.stringify(resolve(dir, 'answered'))}), alive: existsSync('/proc/' + readFileSync(${JSON.stringify(pid)}, 'utf8')) })));`,
      `const t = await waitForTerminal('s', 't1', (t) => { if (returned) late += 1; return t.status?.state === 'idle'; }, ${WAIT_MS});`,
      'returned = true;',
      'seen = { turn: t?.turn, state: t?.status?.state };',
    ].join('\n');
    const slow: SpawnResult = await spawnCaptured(['bun', '-e', script], {
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
      timeout: WAIT_MS,
    });
    expect({ code: slow.code, stderr: slow.code === 0 ? '' : slow.stderr }).toEqual({ code: 0, stderr: '' });
    expect(JSON.parse(slow.stdout)).toEqual({ turn: 0, state: 'idle', late: 0, answered: false, alive: false });
  } finally {
    // Only a lookup still running this test's fake hc is killed: once it has exited, its pid may be reused.
    const lookup: string = existsSync(pid) ? readFileSync(pid, 'utf8') : '';
    const cmdline: string = `/proc/${lookup}/cmdline`;
    if (lookup !== '' && existsSync(cmdline) && readFileSync(cmdline, 'utf8').includes(resolve(dir, 'hc')))
      process.kill(Number(lookup), 'SIGKILL');
    rmSync(dir, { recursive: true, force: true });
  }
});

// A terminal removed after its snapshot listed it: the read's not_found leaves the wait to the events, whose
// finished event ends it, and nothing is logged. The finished event comes only once the read has exited.
test('a wait on a running terminal returns the finished record when its read finds no terminal', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-gone-'));
  try {
    const finished: object = { method: 'event', params: { type: 'finished', terminal: 't1', seq: 6, data: null } };
    fakeHc(dir, [
      `if [ "$1" = events ]; then ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'working')] }])}; while [ ! -e '${dir}/read' ]; do sleep 0.01; done; ${fakeLines([finished])}; exec sleep 600; fi`,
      `if [ "$1" = get ]; then (while kill -0 $$ 2>/dev/null; do sleep 0.01; done; touch '${dir}/read') >/dev/null 2>&1 & printf '%s\n' '{"error":{"kind":"not_found","message":"no terminal t1"}}' >&2; exit 3; fi`,
    ]);
    const gone: SpawnResult = await inProcess(dir, [
      `import { waitForTerminal } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      'const warnings = [];',
      'console.warn = (line) => { warnings.push(line); };',
      `const t = await waitForTerminal('s', 't1', (t) => t.status?.state === 'idle' || t.state === 'finished', ${WAIT_MS});`,
      'console.log(JSON.stringify({ state: t?.state, warnings }));',
    ]);
    expect({ code: gone.code, stderr: gone.code === 0 ? '' : gone.stderr }).toEqual({ code: 0, stderr: '' });
    expect(JSON.parse(gone.stdout)).toEqual({ state: 'finished', warnings: [] });
    expect(fakeCalls(dir)).toEqual(['events', 'get']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// The caller's bound covers the subscription: a snapshot that comes after it is never read.
test('a wait on a running terminal ends at its bound while the snapshot is late', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-late-'));
  try {
    fakeHc(dir, [
      `if [ "$1" = events ]; then sleep 2; ${fakeLines([{ seq: 5, terminals: [fakeRecord(0, 'idle')] }])}; exec sleep 30; fi`,
    ]);
    const late: SpawnResult = await inProcess(dir, [
      `import { waitForTerminal } from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};`,
      'const begun = Date.now();',
      "const t = await waitForTerminal('s', 't1', (t) => t.status?.state === 'idle', 50);",
      'console.log(JSON.stringify({ t, early: Date.now() - begun < 2000 }));',
    ]);
    expect(late.code).toBe(0);
    expect(JSON.parse(late.stdout)).toEqual({ t: null, early: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// The fixture's wait also reads the terminal when the snapshot lists it; a read that returns after the wait
// rejected asks the predicate nothing. Here `hc get` holds until the rejection, then returns the terminal,
// and the asks since the rejection are counted once the fixture's reader has taken that reply.
test('the fixture wait asks its predicate nothing after it rejects', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-fixture-wait-'));
  try {
    writeFileSync(
      resolve(dir, 'hc'),
      [
        '#!/bin/sh',
        'if [ "$1" = get ]; then',
        `  touch '${dir}/get'`,
        `  while [ ! -e '${dir}/go' ]; do sleep 0.05; done`,
        `  out=$(${JSON.stringify(Bun.which('hc'))} "$@"); code=$?`,
        `  printf '%s\\n' "$out" | tee '${dir}/got'`,
        '  exit $code',
        'fi',
        `exec ${JSON.stringify(Bun.which('hc'))} "$@"`,
      ].join('\n') + '\n',
      { mode: 0o755 },
    );
    const script: string = [
      `import { existsSync, readFileSync, writeFileSync } from 'node:fs';`,
      `import { fixture } from ${JSON.stringify(resolve(import.meta.dir, 'helpers.ts'))};`,
      `import { hcCore } from ${JSON.stringify(resolve(import.meta.dir, 'hc-fixture.ts'))};`,
      'const f = await fixture();',
      'const core = await hcCore(f);',
      'try {',
      "  const address = JSON.parse((await core.hc(['run', '--bg', '--json', 'sleep', '60'])).stdout).address;",
      '  let asked = 0;',
      '  const rejected = await core.waitFor(address, () => { asked += 1; return false; }, 3000).then(() => false, () => true);',
      '  const atRejection = asked;',
      `  const read = existsSync(${JSON.stringify(resolve(dir, 'get'))});`,
      `  writeFileSync(${JSON.stringify(resolve(dir, 'go'))}, '');`,
      '  await core.reading();',
      `  const got = readFileSync(${JSON.stringify(resolve(dir, 'got'))}, 'utf8').trim();`,
      "  console.log(JSON.stringify({ rejected, read, late: asked - atRejection, looked: got !== '' && JSON.parse(got).address === address }));",
      '} finally {',
      '  await core.stop();',
      '  f.clean();',
      '}',
    ].join('\n');
    const result: SpawnResult = await spawnCaptured(['bun', '-e', script], {
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    });
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ rejected: true, read: true, late: 0, looked: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// A predicate that throws on the fixture's read rejects the wait with its error, as one that throws on the
// stream does, and leaves no rejected reader behind. The read's reply carries a turn no stream record has,
// and the predicate throws only on that turn.
test('the fixture wait rejects with a predicate error thrown on its read', async () => {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akr-fixture-throw-'));
  const READ_TURN: number = 4242;
  try {
    writeFileSync(
      resolve(dir, 'hc'),
      [
        '#!/bin/sh',
        'if [ "$1" = get ]; then',
        `  out=$(${JSON.stringify(Bun.which('hc'))} "$@"); code=$?`,
        `  printf '%s\\n' "$out" | sed 's/"turn": *[0-9][0-9]*/"turn":${READ_TURN}/'`,
        '  exit $code',
        'fi',
        `exec ${JSON.stringify(Bun.which('hc'))} "$@"`,
      ].join('\n') + '\n',
      { mode: 0o755 },
    );
    const script: string = [
      `import { fixture } from ${JSON.stringify(resolve(import.meta.dir, 'helpers.ts'))};`,
      `import { hcCore } from ${JSON.stringify(resolve(import.meta.dir, 'hc-fixture.ts'))};`,
      'const f = await fixture();',
      'const core = await hcCore(f);',
      'try {',
      "  const address = JSON.parse((await core.hc(['run', '--bg', '--json', 'sleep', '60'])).stdout).address;",
      '  const outcome = await core',
      `    .waitFor(address, (t) => { if (t.turn === ${READ_TURN}) throw new Error('thrown on the read'); return false; })`,
      "    .then(() => 'passed', (error) => error.message);",
      '  await core.reading();',
      '  console.log(JSON.stringify({ outcome }));',
      '} finally {',
      '  await core.stop();',
      '  f.clean();',
      '}',
    ].join('\n');
    const result: SpawnResult = await spawnCaptured(['bun', '-e', script], {
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    });
    expect({ code: result.code, stderr: result.code === 0 ? '' : result.stderr }).toEqual({ code: 0, stderr: '' });
    expect(JSON.parse(result.stdout)).toEqual({ outcome: 'thrown on the read' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
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
      repo: f.repo,
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
    await stopSlice(f, 'hi-other');
    f.clean();
  }
});

test('terminal() never starts a core for an absent session: it fails fast and leaves no core state', async () => {
  // Regression: a direct leaf's seat refs name sessions outside the repo's, and observeDirectSeats
  // probes them. Before the socket probe in terminal(), the probe hit hc unguarded, which starts a
  // core for any absent session; the orphaned core's lock then wedged every later probe of the
  // same session name across tests (the 120s direct-phases timeout). The runtime lives under the
  // real runtime dir, not TMPDIR: hc refuses a socket path past its 107-byte limit.
  const runtime: string = mkdtempSync('/run/user/1000/akp');
  const stateHome: string = resolve(runtime, 'st');
  mkdirSync(resolve(runtime, 'herdr-core'), { recursive: true });
  mkdirSync(stateHome, { recursive: true });
  const previousRuntime: string | undefined = process.env.XDG_RUNTIME_DIR;
  const previousState: string | undefined = process.env.XDG_STATE_HOME;
  process.env.XDG_RUNTIME_DIR = runtime;
  process.env.XDG_STATE_HOME = stateHome;
  try {
    let kind: string | null = null;
    const started: number = Date.now();
    try {
      await terminal('akp-absent', 'w1:a-door');
    } catch (error) {
      if (!(error instanceof HcError)) throw error;
      kind = error.kind;
    }
    expect(kind).toBe('not_found');
    expect(Date.now() - started).toBeLessThan(20_000);
    // The proof that no core started: hc leaves the session's state dir and lock behind when it
    // boots one, and would bind the socket in the runtime dir.
    expect(existsSync(resolve(runtime, 'herdr-core', 'akp-absent.sock'))).toBe(false);
    expect(existsSync(resolve(stateHome, 'herdr-core', 'akp-absent'))).toBe(false);
  } finally {
    if (previousRuntime === undefined) delete process.env.XDG_RUNTIME_DIR;
    else process.env.XDG_RUNTIME_DIR = previousRuntime;
    if (previousState === undefined) delete process.env.XDG_STATE_HOME;
    else process.env.XDG_STATE_HOME = previousState;
    rmSync(runtime, { recursive: true, force: true });
  }
});

