// Real throwaway hc core per test file (forks/tests.md Q1): a unique HC_SESSION, scratch state,
// the stand-in agent on the core's PATH under the fixture harness names, the strict fake herdr-app
// and a recording hc shim on akrogon's PATH. The core keeps the real XDG_RUNTIME_DIR so
// `systemd-run --user` works inside its terminals; akrogon gets a scratch XDG_RUNTIME_DIR whose
// herdr-core/ holds only this file's sockets (plan N1), so discovery never sees other sessions.
import { afterAll } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { fakeHerdr, type Fixture } from './helpers';
import { suiteRoot } from './isolation';

const uid: number = process.getuid!();
const realRuntime: string = `/run/user/${uid}`;
const realHc: string | null = Bun.which('hc');
let serial: number = 0;

// A core detaches from the test process, so the suite's subreaper never sees it: every core this
// file started is stopped after its tests, and cores left by a worker that died are stopped here.
const started: Set<HcCore> = new Set();
afterAll(async () => {
  for (const core of [...started]) await core.stop();
});

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function listening(path: string): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const probe = connect(path);
    probe.once('connect', () => {
      probe.destroy();
      done(true);
    });
    probe.once('error', () => done(false));
  });
}

async function sweepAbandoned(): Promise<void> {
  const dir: string = resolve(realRuntime, 'herdr-core');
  for (const name of existsSync(dir) ? readdirSync(dir) : []) {
    const owner: RegExpExecArray | null = /^akt([0-9a-z]+)-\d+\.sock$/.exec(name);
    if (owner === null || alive(parseInt(owner[1], 36)) || realHc === null) continue;
    const session: string = name.slice(0, -'.sock'.length);
    if (await listening(resolve(dir, name)))
      await spawnCaptured([realHc, 'server', 'stop'], {
        env: cleanEnv(session, {}, z.string().parse(process.env.PATH)),
      });
    for (const left of readdirSync(dir))
      if (left === name || left.startsWith(`${session}.holder.`)) rmSync(resolve(dir, left), { force: true });
  }
}

export type Terminal = {
  address: string;
  name: string | null;
  state: string;
  turn: number;
  pid: number | null;
  parent: string | null;
  cwd: string;
  labels: Record<string, string>;
  status: { state: string; kind?: string | null; msg?: string } | null;
};

const terminalSchema = z
  .object({
    address: z.string(),
    name: z.string().nullable().optional(),
    state: z.string(),
    turn: z.number().int().default(0),
    pid: z.number().int().nullable().optional(),
    parent: z.string().nullable().optional(),
    cwd: z.string(),
    labels: z.record(z.string(), z.string()),
    status: z
      .object({ state: z.string(), kind: z.string().nullable().optional(), msg: z.string().optional() })
      .nullable()
      .optional(),
  })
  .transform((t): Terminal => ({
    address: t.address,
    name: t.name ?? null,
    state: t.state,
    turn: t.turn,
    pid: t.pid ?? null,
    parent: t.parent ?? null,
    cwd: t.cwd,
    labels: t.labels,
    status: t.status ?? null,
  }));

export type HcCore = {
  session: string;
  socket: string;
  standin: string;
  runtime: string;
  appPlan: string;
  appHome: string;
  shimLog: string;
  env: NodeJS.ProcessEnv;
  hc: (args: string[]) => Promise<SpawnResult>;
  rpc: (method: string, params: object) => Promise<unknown>;
  terminals: (labels?: Record<string, string>, all?: boolean) => Promise<Terminal[]>;
  get: (address: string) => Promise<Terminal>;
  tasks: (address: string) => string[];
  waitFor: (address: string, until: (t: Terminal) => boolean, ms?: number) => Promise<Terminal>;
  appCalls: () => { argv: string[]; home: string | null; planned: boolean }[];
  setWindow: (window: 'open' | 'closed', rename?: 'ok' | 'fail') => void;
  link: (other: HcCore) => void;
  discard: () => void;
  stop: () => Promise<void>;
};

// The herdr-app document shape recorded by the window tier (P7, P11): one space named after the repo.
export function recordedDoc(spaceId: string, name: string, folder: string): object {
  const recorded = z
    .object({ spaces: z.array(z.object({ id: z.string(), name: z.string(), folder: z.string() }).passthrough()) })
    .parse(JSON.parse(readFileSync(resolve(import.meta.dir, 'fixtures/herdr-app-doc.json'), 'utf8')));
  return {
    ...recorded,
    spaces: recorded.spaces.map((space) => (space.id === 'SPACE' ? { ...space, id: spaceId, name, folder } : space)),
  };
}

export function setPrefixes(f: Fixture, prefixes: Record<string, string> | undefined): void {
  const path: string = resolve(f.home, 'config.yaml');
  const global = z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  const { prefixes: _old, ...rest } = global;
  writeFileSync(path, Bun.YAML.stringify(prefixes === undefined ? rest : { ...rest, prefixes }));
}

// Points a slot at a harness and stand-in mode (the --model value), adding the agy entry the start verb keys on.
export function setSeat(f: Fixture, slot: 'a' | 'b', harness: 'fake' | 'agy', model: string): void {
  const path: string = resolve(f.home, 'config.yaml');
  const global = z
    .object({ slots: z.record(z.string(), z.unknown()), harnesses: z.record(z.string(), z.string()) })
    .passthrough()
    .parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  writeFileSync(
    path,
    Bun.YAML.stringify({
      ...global,
      slots: { ...global.slots, [slot]: { harness, model, effort: 'low' } },
      harnesses: { ...global.harnesses, agy: 'agy --model {model} --effort {effort}' },
    }),
  );
}

function cleanEnv(session: string, extra: Record<string, string>, path: string): Record<string, string> {
  return {
    HOME: z.string().parse(process.env.HOME),
    PATH: path,
    LANG: 'C.UTF-8',
    TERM: 'xterm-256color',
    XDG_RUNTIME_DIR: realRuntime,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    HC_SESSION: session,
    ...extra,
  };
}

export async function hcCore(
  f: Fixture,
  opts: { coreEnv?: Record<string, string>; window?: 'open' | 'closed'; doc?: boolean; repo?: string } = {},
): Promise<HcCore> {
  if (realHc === null) throw new Error('hc (herdr-core 0.1.18) is required on PATH for the real-core tests');
  if (serial === 0) await sweepAbandoned();
  serial += 1;
  const session: string = `akt${process.pid.toString(36)}-${serial}`;
  const socket: string = resolve(realRuntime, 'herdr-core', `${session}.sock`);
  const state: string = resolve(f.home, `hc-state-${serial}`);
  const standin: string = resolve(f.home, `standin-${serial}`);
  const standinBin: string = resolve(f.home, `standin-bin-${serial}`);
  const runtime: string = resolve(suiteRoot, `r${serial}`);
  const linked: string = resolve(runtime, 'herdr-core', `${session}.sock`);
  if (Buffer.byteLength(linked) >= 107) throw new Error(`fixture socket path too long (${linked.length}): ${linked}`);
  for (const dir of [state, standin, standinBin, resolve(runtime, 'herdr-core')]) mkdirSync(dir, { recursive: true });
  for (const name of ['fake', 'agy']) symlinkSync(resolve(import.meta.dir, 'stand-in.sh'), resolve(standinBin, name));
  symlinkSync(resolve(realRuntime, 'bus'), resolve(runtime, 'bus'));
  symlinkSync(resolve(realRuntime, 'systemd'), resolve(runtime, 'systemd'));
  const corePath: string = `${standinBin}:${dirname(process.execPath)}:${z.string().parse(process.env.PATH)}`;
  const start: SpawnResult = await spawnCaptured([realHc, 'server', 'start'], {
    cwd: f.home,
    env: cleanEnv(session, { XDG_STATE_HOME: state, STANDIN_DIR: standin, ...opts.coreEnv }, corePath),
  });
  if (start.code !== 0) throw new Error(`hc server start failed: ${JSON.stringify(start)}`);
  symlinkSync(socket, linked);
  // One fake herdr per fixture for today's notice sends (they stay on old herdr until notices-on-hc).
  const herdrDb: string = resolve(f.home, 'herdr.json');
  const herdrPath: string = existsSync(herdrDb)
    ? `${resolve(f.home, 'bin')}:${z.string().parse(process.env.PATH)}`
    : z.string().parse(fakeHerdr(f).env.PATH);
  const hcBin: string = resolve(f.home, `hc-bin-${serial}`);
  mkdirSync(hcBin);
  symlinkSync(resolve(import.meta.dir, 'hc-shim.sh'), resolve(hcBin, 'hc'));
  symlinkSync(resolve(import.meta.dir, 'fake-herdr-app.ts'), resolve(hcBin, 'herdr-app'));
  const appPlan: string = resolve(f.home, `herdr-app-${serial}.json`);
  writeFileSync(appPlan, JSON.stringify({ window: opts.window ?? 'closed', rename: 'ok', calls: [] }));
  const appHome: string = resolve(f.home, '.config/herdr-app-sessions', session);
  mkdirSync(appHome, { recursive: true });
  const shimLog: string = resolve(f.home, `hc-calls-${serial}.log`);
  writeFileSync(shimLog, '');
  const env: NodeJS.ProcessEnv = {
    PATH: `${hcBin}:${herdrPath}`,
    FAKE_HERDR: herdrDb,
    XDG_RUNTIME_DIR: runtime,
    DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
    HC_SESSION: '',
    HC_TERMINAL_ID: '',
    HC_TERMINAL_SOCKET: '',
    HC_SCOPE: '',
    HERDR_APP_HOME: '',
    FAKE_HERDR_APP: appPlan,
    HC_SHIM_LOG: shimLog,
    HC_SHIM_REAL: realHc,
    AKROGON_START_PROOF_MS: '3000',
    AKROGON_PANE_WAIT_MS: '2000',
  };
  const hc = (args: string[]): Promise<SpawnResult> =>
    spawnCaptured([realHc, ...args], { cwd: f.home, env: cleanEnv(session, { XDG_STATE_HOME: state }, corePath) });
  const rpc = async (method: string, params: object): Promise<unknown> => {
    const reply: SpawnResult = await spawnCaptured([realHc, 'connect'], {
      cwd: f.home,
      env: cleanEnv(session, { XDG_STATE_HOME: state }, corePath),
      stdin: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n',
    });
    const parsed = z
      .object({ result: z.unknown().optional(), error: z.unknown().optional() })
      .parse(JSON.parse(reply.stdout));
    if (parsed.error !== undefined) throw new Error(`${method} failed: ${JSON.stringify(parsed.error)}`);
    return parsed.result;
  };
  const terminals = async (labels: Record<string, string> = {}, all: boolean = true): Promise<Terminal[]> =>
    z.object({ terminals: z.array(terminalSchema) }).parse(await rpc('terminal.list', { all, labels })).terminals;
  const get = async (address: string): Promise<Terminal> => {
    const reply: SpawnResult = await hc(['get', '--json', address]);
    if (reply.code !== 0) throw new Error(`hc get ${address} failed: ${reply.stderr}`);
    return terminalSchema.parse(JSON.parse(reply.stdout));
  };
  // Follows hc events for one terminal (snapshot first), never a timed re-read; the timer only bounds it.
  const waitFor = (address: string, until: (t: Terminal) => boolean, ms: number = 15_000): Promise<Terminal> =>
    new Promise<Terminal>((done, fail) => {
      const child = Bun.spawn([realHc, 'events', '--json', '--terminal', address], {
        cwd: f.home,
        env: cleanEnv(session, { XDG_STATE_HOME: state }, corePath),
        stdout: 'pipe',
        stderr: 'ignore',
      });
      let current: Terminal | null = null;
      const timer = setTimeout(() => {
        child.kill();
        fail(new Error(`terminal ${address} did not reach the expected state in ${ms} ms: ${JSON.stringify(current)}`));
      }, ms);
      const finish = (t: Terminal): void => {
        clearTimeout(timer);
        child.kill();
        done(t);
      };
      (async () => {
        let buffer: string = '';
        for await (const chunk of child.stdout) {
          buffer += new TextDecoder().decode(chunk);
          const lines: string[] = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines.filter((l) => l.trim() !== '')) {
            const message = z.record(z.string(), z.unknown()).parse(JSON.parse(line));
            if (Array.isArray(message.terminals)) current = z.array(terminalSchema).parse(message.terminals)[0] ?? null;
            else if (current !== null) {
              const params = z
                .object({ type: z.string(), data: z.record(z.string(), z.unknown()) })
                .parse(message.params);
              current = terminalSchema.parse({ ...current, ...params.data });
            }
            if (current !== null && until(current)) return finish(current);
          }
        }
      })().catch(fail);
    });
  const tasks = (address: string): string[] => {
    const file: string = resolve(standin, `${address}.tasks`);
    return existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
  };
  const appCalls = (): { argv: string[]; home: string | null; planned: boolean }[] =>
    z
      .object({
        calls: z.array(z.object({ argv: z.array(z.string()), home: z.string().nullable(), planned: z.boolean() })),
      })
      .parse(JSON.parse(readFileSync(appPlan, 'utf8'))).calls;
  const setWindow = (window: 'open' | 'closed', rename: 'ok' | 'fail' = 'ok'): void => {
    writeFileSync(appPlan, JSON.stringify({ window, rename, calls: appCalls() }));
  };
  const core: HcCore = {
    session,
    socket,
    standin,
    runtime,
    appPlan,
    appHome,
    shimLog,
    env,
    hc,
    rpc,
    terminals,
    get,
    tasks,
    waitFor,
    appCalls,
    setWindow,
    link: (other: HcCore): void => symlinkSync(other.socket, resolve(runtime, 'herdr-core', `${other.session}.sock`)),
    // Removes this core's files without contacting hc (a killed core's socket would start a new one).
    discard: (): void => {
      started.delete(core);
      for (const name of readdirSync(dirname(socket)))
        if (name === `${session}.sock` || name.startsWith(`${session}.holder.`))
          rmSync(resolve(dirname(socket), name), { force: true });
      rmSync(runtime, { recursive: true, force: true });
      rmSync(state, { recursive: true, force: true });
    },
    stop: async (): Promise<void> => {
      if (!started.delete(core)) return;
      await hc(['server', 'stop']);
      core.discard();
    },
  };
  started.add(core);
  if (opts.doc !== false) {
    const written = z.object({ version: z.number() }).parse(
      await rpc('doc.set', {
        name: 'herdr-app',
        value: recordedDoc(`sp-${session}`, opts.repo ?? 'repo', f.root),
        version: 0,
      }),
    );
    if (written.version < 1) throw new Error(`doc.set returned version ${written.version}`);
  }
  return core;
}

// Emulates herdr-app's adoption for fake-window tests: each labelled terminal is put into the
// document as a block of its herdr.tab under its herdr.space (P7 shape), retried on a version conflict.
export function adopt(core: HcCore): () => void {
  const child = Bun.spawn([z.string().parse(realHc), 'events', '--json', '--label', 'akrogon=1'], {
    env: cleanEnv(core.session, {}, z.string().parse(process.env.PATH)),
    stdout: 'pipe',
    stderr: 'ignore',
  });
  const place = async (t: Terminal): Promise<void> => {
    const space: string | undefined = t.labels['herdr.space'];
    const tab: string | undefined = t.labels['herdr.tab'];
    if (space === undefined || tab === undefined) return;
    for (let attempt: number = 0; attempt < 5; attempt += 1) {
      const doc = z
        .object({
          version: z.number(),
          value: z.object({
            spaces: z.array(
              z.object({ id: z.string(), tabs: z.array(z.object({ id: z.string() }).passthrough()) }).passthrough(),
            ),
          }),
        })
        .parse(await core.rpc('doc.get', { name: 'herdr-app' }));
      const block = { content: { terminal: t.address }, id: `p${t.address}`, type: 'block' };
      const spaces = doc.value.spaces.map((s) => {
        if (s.id !== space) return s;
        const found = s.tabs.find((x) => x.id === tab);
        const tabs = found
          ? s.tabs.map((x) => {
              if (x.id !== tab) return x;
              const root = z
                .object({ children: z.array(z.unknown()) })
                .passthrough()
                .parse(x.root);
              return { ...x, root: { ...root, children: [...root.children, block] } };
            })
          : [...s.tabs, { id: tab, name: '', root: { children: [block], id: tab, type: 'row' } }];
        return { ...s, tabs };
      });
      try {
        await core.rpc('doc.set', { name: 'herdr-app', value: { ...doc.value, spaces }, version: doc.version });
        return;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('conflict')) throw error;
      }
    }
  };
  (async () => {
    let buffer: string = '';
    for await (const chunk of child.stdout) {
      buffer += new TextDecoder().decode(chunk);
      const lines: string[] = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines.filter((l) => l.trim() !== '')) {
        const message = z.record(z.string(), z.unknown()).parse(JSON.parse(line));
        const params = z.object({ type: z.string(), data: z.unknown() }).safeParse(message.params);
        if (params.success && params.data.type === 'created') await place(terminalSchema.parse(params.data.data));
      }
    }
  })();
  return () => child.kill();
}

// The parts of `hc schema` akrogon parses (D1-D3): compared with tests/fixtures/hc-schema.json.
export function pinnedSchema(raw: string): object {
  const schema = z
    .object({
      components: z.object({ schemas: z.record(z.string(), z.unknown()) }),
      methods: z.array(z.object({ name: z.string(), params: z.array(z.unknown()) }).passthrough()),
    })
    .parse(JSON.parse(raw));
  const components: string[] = ['DocGetResult', 'DocSetResult', 'ListResult', 'SendResult', 'Status', 'Terminal'];
  const methods: string[] = ['doc.get', 'events.subscribe', 'terminal.list', 'terminal.send'];
  return {
    components: Object.fromEntries(components.map((name) => [name, schema.components.schemas[name]])),
    methods: Object.fromEntries(schema.methods.filter((m) => methods.includes(m.name)).map((m) => [m.name, m.params])),
  };
}
