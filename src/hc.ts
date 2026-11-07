// The one module that talks to herdr-core (`hc`) and herdr-app (plan D1). Every hc call pins
// HC_SESSION and drops the caller's terminal variables; every herdr-app call pins HERDR_APP_HOME.
// A session is probed from Bun before any hc call, because hc starts a core for a dead socket (L2).
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { connect } from 'node:net';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, type Repo } from './config';
import { CommandError, DISCOVERY_DEADLINE_MS, spawnCaptured, type Result, type SpawnResult } from './shell';
import { withLock } from './state';

const statusSchema = z.object({
  state: z.string(),
  kind: z.string().nullable().default(null),
  msg: z.string().nullable().default(null),
});

const foregroundSchema = z.object({ pid: z.number().int(), cwd: z.string(), argv: z.array(z.string()) });

const terminalSchema = z.object({
  address: z.string(),
  name: z.string().nullable().default(null),
  state: z.enum(['live', 'finished']),
  turn: z.number().int().default(0),
  pid: z.number().int().nullable().default(null),
  parent: z.string().nullable().default(null),
  cwd: z.string(),
  labels: z.record(z.string(), z.string()),
  status: statusSchema.nullable().default(null),
  foreground: foregroundSchema.nullable().default(null),
});

type Terminal = z.infer<typeof terminalSchema>;

export type Seen = {
  session: string;
  address: string;
  name: string | null;
  state: 'live' | 'finished';
  turn: number;
  pid: number | null;
  parent: string | null;
  cwd: string;
  labels: Record<string, string>;
  status: { state: string; kind: string | null; msg: string | null } | null;
  foreground: { pid: number; cwd: string; argv: string[] } | null;
};

function seen(session: string, t: Terminal): Seen {
  return { session, ...t, cwd: t.foreground === null ? t.cwd : t.foreground.cwd };
}

const hcErrorSchema = z.object({ error: z.object({ kind: z.string(), message: z.string() }) });

export class HcError extends Error {
  constructor(
    readonly kind: string,
    readonly argv: string[],
    readonly result: Result,
    stdin?: string,
  ) {
    super(JSON.stringify({ kind, command: argv, stdin, ...result }));
  }
}

// hc's stderr is one JSON error line; anything else keeps its raw text and gets the exit code or
// signal (a deadline kill) as kind.
function errorKind(result: SpawnResult): string {
  try {
    const parsed = hcErrorSchema.safeParse(JSON.parse(result.stderr));
    if (parsed.success) return parsed.data.error.kind;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  return result.signalCode === null ? `exit ${result.code}` : `signal ${result.signalCode}`;
}

function hcEnv(session: string): NodeJS.ProcessEnv {
  const { HC_TERMINAL_SOCKET: _socket, HC_TERMINAL_ID: _id, HC_SCOPE: _scope, ...rest } = process.env;
  return { ...rest, HC_SESSION: session };
}

export async function hc(
  session: string,
  args: string[],
  opts: { stdin?: string; deadlineMs?: number } = {},
): Promise<string> {
  const argv: string[] = ['hc', ...args];
  const result: SpawnResult = await spawnCaptured(argv, {
    env: hcEnv(session),
    stdin: opts.stdin,
    timeout: opts.deadlineMs,
  });
  if (result.code !== 0) throw new HcError(errorKind(result), argv, result, opts.stdin);
  return result.stdout;
}

// The error branch comes first: `result: z.unknown()` would also accept a reply without a result.
const rpcReplySchema = z.union([
  z.object({
    error: z.object({ code: z.number(), message: z.string(), data: z.object({ kind: z.string() }).optional() }),
  }),
  z.object({ result: z.unknown() }),
]);

export async function rpc<T>(session: string, method: string, params: object, schema: z.ZodType<T>): Promise<T> {
  const stdin: string = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n';
  const stdout: string = await hc(session, ['connect'], { stdin, deadlineMs: DISCOVERY_DEADLINE_MS });
  const reply = rpcReplySchema.parse(JSON.parse(stdout));
  if ('error' in reply)
    throw new HcError(
      reply.error.data?.kind ?? `rpc ${reply.error.code}`,
      ['hc', 'connect'],
      { code: 0, stdout, stderr: '' },
      stdin,
    );
  return schema.parse(reply.result);
}

export function listening(socket: string): Promise<boolean> {
  return new Promise<boolean>((done, fail) => {
    const probe = connect(socket);
    probe.once('connect', () => {
      probe.destroy();
      done(true);
    });
    probe.once('error', (error: NodeJS.ErrnoException) =>
      error.code === 'ECONNREFUSED' || error.code === 'ENOENT' ? done(false) : fail(error),
    );
  });
}

export async function sessions(): Promise<{ live: string[]; stopped: string[] }> {
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  if (runtime === undefined || runtime.trim() === '')
    throw new Error('XDG_RUNTIME_DIR is not set: cannot find hc sessions');
  const dir: string = resolve(runtime, 'herdr-core');
  const names: string[] = readdirSync(dir)
    .map((entry: string) => /^([^.]+)\.sock$/.exec(entry)?.[1])
    .filter((name: string | undefined): name is string => name !== undefined)
    .sort();
  const probed: { name: string; live: boolean }[] = await Promise.all(
    names.map(async (name: string) => ({ name, live: await listening(resolve(dir, `${name}.sock`)) })),
  );
  return {
    live: probed.filter((p) => p.live).map((p) => p.name),
    stopped: probed.filter((p) => !p.live).map((p) => p.name),
  };
}

type Block = { content?: { terminal: string }; children?: Block[] };

const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({ content: z.object({ terminal: z.string() }).optional(), children: z.array(blockSchema).optional() }),
);

const docSchema = z.object({
  version: z.number().int(),
  value: z
    .object({
      spaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          folder: z.string(),
          tabs: z.array(z.object({ id: z.string(), name: z.string(), root: blockSchema })),
        }),
      ),
    })
    .nullable(),
});

export type Space = {
  id: string;
  name: string;
  folder: string;
  tabs: { id: string; name: string; terminals: string[] }[];
};

function blockTerminals(block: Block): string[] {
  return [
    ...(block.content === undefined ? [] : [block.content.terminal]),
    ...(block.children ?? []).flatMap(blockTerminals),
  ];
}

export async function docGet(session: string): Promise<{ version: number; spaces: Space[] }> {
  const doc = await rpc(session, 'doc.get', { name: 'herdr-app' }, docSchema);
  return {
    version: doc.version,
    spaces: (doc.value?.spaces ?? []).map((space) => ({
      ...space,
      tabs: space.tabs.map((tab) => ({ id: tab.id, name: tab.name, terminals: blockTerminals(tab.root) })),
    })),
  };
}

export type SpaceResolution =
  | { ok: true; session: string; space: { id: string; name: string } }
  | { ok: false; scope: 'repo' | 'invocation'; reason: string };

const spaceResolutions: Map<string, Promise<SpaceResolution>> = new Map();

export function repoSpace(repo: Repo): Promise<SpaceResolution> {
  const cached: Promise<SpaceResolution> | undefined = spaceResolutions.get(repo.name);
  if (cached !== undefined) return cached;
  const resolved: Promise<SpaceResolution> = resolveSpace(repo);
  spaceResolutions.set(repo.name, resolved);
  return resolved;
}

async function resolveSpace(repo: Repo): Promise<SpaceResolution> {
  let found: { live: string[]; stopped: string[] };
  try {
    found = await sessions();
  } catch (error) {
    return {
      ok: false,
      scope: 'invocation',
      reason: JSON.stringify({
        workspace: repo.name,
        refused: 'session list failed',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
  const searched: string[] = [];
  const unreadable: { session: string; error: string }[] = [];
  const duplicates: { session: string; space_id: string }[] = [];
  for (const session of found.live) {
    try {
      const doc: { version: number; spaces: Space[] } = await docGet(session);
      searched.push(session);
      for (const space of doc.spaces) if (space.name === repo.name) duplicates.push({ session, space_id: space.id });
    } catch (error) {
      if (!(error instanceof HcError || error instanceof z.ZodError || error instanceof SyntaxError)) throw error;
      unreadable.push({ session, error: error.message });
    }
  }
  const refuse = (refused: string): SpaceResolution => ({
    ok: false,
    scope: 'repo',
    reason: JSON.stringify({
      workspace: repo.name,
      refused,
      searched,
      skipped_stopped: found.stopped,
      unreadable,
      duplicates: refused === 'held by multiple sessions' ? duplicates : [],
    }),
  });
  if (duplicates.length > 1) return refuse('held by multiple sessions');
  if (unreadable.length > 0) return refuse('uniqueness unknown');
  if (duplicates.length === 0) return refuse('no running session holds it');
  return { ok: true, session: duplicates[0].session, space: { id: duplicates[0].space_id, name: repo.name } };
}

export async function terminals(
  session: string,
  labels: Record<string, string>,
  all: boolean = false,
): Promise<Seen[]> {
  const listed = await rpc(session, 'terminal.list', { all, labels }, z.object({ terminals: z.array(terminalSchema) }));
  return listed.terminals.map((t: Terminal) => seen(session, t));
}

export async function terminal(session: string, address: string): Promise<Seen> {
  return seen(session, terminalSchema.parse(JSON.parse(await hc(session, ['get', '--json', address]))));
}

export function screen(session: string, address: string): Promise<string> {
  return hc(session, ['read', address]);
}

export async function run(
  session: string,
  spec: { name: string; cwd: string; parent: string | null; labels: Record<string, string>; argv: string[] },
): Promise<Seen> {
  const started = z
    .object({ address: z.string() })
    .parse(
      JSON.parse(
        await hc(session, [
          'run',
          '--bg',
          '--json',
          ...(spec.parent === null ? ['--no-parent'] : ['--parent', spec.parent]),
          '--name',
          spec.name,
          '--cwd',
          spec.cwd,
          ...Object.entries(spec.labels).flatMap(([key, value]) => ['--label', `${key}=${value}`]),
          '--',
          ...spec.argv,
        ]),
      ),
    );
  return terminal(session, started.address);
}

const sendSchema = z.object({ started: z.boolean().nullable(), status: z.string().nullable(), turn: z.number().int() });

export async function send(
  session: string,
  address: string,
  text: string,
): Promise<{ started: boolean | null; status: string | null; turn: number }> {
  return sendSchema.parse(JSON.parse(await hc(session, ['send', '--json', '--', address, text])));
}

export async function keys(session: string, address: string, key: string): Promise<void> {
  await hc(session, ['keys', address, key]);
}

export async function label(session: string, address: string, labels: Record<string, string>): Promise<void> {
  await hc(session, ['label', address, ...Object.entries(labels).map(([key, value]) => `${key}=${value}`)]);
}

// `hc kill` of an already finished terminal exits 0, so kill then rm needs no special case.
export async function end(session: string, address: string): Promise<void> {
  await hc(session, ['kill', address]);
  await hc(session, ['rm', address]);
}

// Document changes carry no terminal and reach only unfiltered subscriptions.
export type HcLine =
  | { terminals: Seen[] }
  | { method: 'event'; params: { type: string; terminal: string; seq: number; data: Record<string, unknown> } }
  | { method: 'event'; params: { type: 'doc'; seq: number; data: { name: string; version: number } } };

const lineSchema = z.union([
  z.object({ terminals: z.array(terminalSchema) }),
  z.object({
    method: z.literal('event'),
    params: z.object({
      type: z.string(),
      terminal: z.string(),
      seq: z.number().int(),
      data: z.record(z.string(), z.unknown()),
    }),
  }),
  z.object({
    method: z.literal('event'),
    params: z.object({
      type: z.literal('doc'),
      seq: z.number().int(),
      data: z.object({ name: z.string(), version: z.number().int() }),
    }),
  }),
]);

// An idle stream carries heartbeat lines; they hold no fact.
const heartbeatSchema = z.object({ method: z.literal('heartbeat') });

export function follow(
  session: string,
  args: string[],
  onEvent: (line: HcLine) => void,
): { stop: () => void; ended: Promise<void> } {
  const argv: string[] = ['hc', 'events', '--json', ...args];
  const child = Bun.spawn(argv, { env: hcEnv(session), stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' });
  let stopped: boolean = false;
  const ended: Promise<void> = (async (): Promise<void> => {
    const decoder: TextDecoder = new TextDecoder();
    let buffer: string = '';
    for await (const chunk of child.stdout) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines: string[] = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines.filter((l: string) => l.trim() !== '')) {
        const message: unknown = JSON.parse(line);
        if (heartbeatSchema.safeParse(message).success) continue;
        const parsed = lineSchema.parse(message);
        onEvent(
          'terminals' in parsed ? { terminals: parsed.terminals.map((t: Terminal) => seen(session, t)) } : parsed,
        );
      }
    }
    const code: number = await child.exited;
    const result: SpawnResult = {
      code,
      signalCode: child.signalCode,
      killed: child.killed,
      stdout: buffer,
      stderr: await new Response(child.stderr).text(),
    };
    if (code !== 0 && !stopped) throw new HcError(errorKind(result), argv, result);
  })().catch((error: unknown) => {
    child.kill();
    throw error;
  });
  return {
    stop: (): void => {
      stopped = true;
      child.kill();
    },
    ended,
  };
}

function merged(t: Seen, type: string, data: Record<string, unknown>): Seen {
  switch (type) {
    case 'created':
      return seen(t.session, terminalSchema.parse(data));
    case 'status':
      return { ...t, status: z.object({ status: statusSchema.nullable() }).parse(data).status };
    case 'turn':
      return { ...t, turn: z.object({ turn: z.number().int() }).parse(data).turn };
    case 'labels':
      return { ...t, labels: z.object({ labels: z.record(z.string(), z.string()) }).parse(data).labels };
    case 'foreground': {
      const foreground = foregroundSchema.nullable().parse(data);
      return { ...t, foreground, cwd: foreground === null ? t.cwd : foreground.cwd };
    }
    case 'finished':
      return { ...t, state: 'finished', foreground: null };
    default:
      return t;
  }
}

export function waitFor(
  session: string,
  address: string,
  until: (t: Seen) => boolean,
  ms: number,
): Promise<Seen | null> {
  return new Promise<Seen | null>((done, fail) => {
    let current: Seen | null = null;
    let settled: boolean = false;
    const settle = (outcome: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stream.stop();
      outcome();
    };
    const stream = follow(session, ['--terminal', address], (line: HcLine) => {
      if (settled) return;
      current =
        'terminals' in line
          ? (line.terminals.find((t: Seen) => t.address === address) ?? null)
          : current === null || !('terminal' in line.params)
            ? current
            : merged(current, line.params.type, line.params.data);
      const reached: Seen | null = current;
      if (reached !== null && until(reached)) settle(() => done(reached));
    });
    const timer = setTimeout(() => settle(() => done(null)), ms);
    stream.ended.then(
      () =>
        settle(() => fail(new Error(JSON.stringify({ session, address, error: 'event stream ended', last: current })))),
      (error: unknown) => settle(() => fail(error)),
    );
  });
}

// Follows the session's events and reads the herdr-app document at subscription and on each of its
// changes; resolves the first document that passes, null at the bound.
export function waitForDoc(
  session: string,
  until: (doc: { version: number; spaces: Space[] }) => boolean,
  ms: number,
): Promise<{ version: number; spaces: Space[] } | null> {
  return new Promise<{ version: number; spaces: Space[] } | null>((done, fail) => {
    let settled: boolean = false;
    let reads: Promise<void> = Promise.resolve();
    const settle = (outcome: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stream.stop();
      outcome();
    };
    const check = (): void => {
      reads = reads
        .then(async (): Promise<void> => {
          if (settled) return;
          const doc: { version: number; spaces: Space[] } = await docGet(session);
          if (until(doc)) settle(() => done(doc));
        })
        .catch((error: unknown) => settle(() => fail(error)));
    };
    const stream = follow(session, [], (line: HcLine) => {
      if ('terminals' in line || !('terminal' in line.params)) check();
    });
    const timer = setTimeout(() => settle(() => done(null)), ms);
    stream.ended.then(
      () => settle(() => fail(new Error(JSON.stringify({ session, error: 'event stream ended' })))),
      (error: unknown) => settle(() => fail(error)),
    );
  });
}

export function appHome(session: string): string {
  const home: string =
    session === 'default'
      ? resolve(homedir(), '.config/herdr-app')
      : resolve(homedir(), '.config/herdr-app-sessions', session);
  if (!existsSync(home)) throw new Error(`herdr-app home for session ${session} is missing: ${home}`);
  return home;
}

function app(session: string, args: string[]): Promise<SpawnResult> {
  return spawnCaptured(['herdr-app', ...args], { env: { ...process.env, HERDR_APP_HOME: appHome(session) } });
}

export async function windowOpen(session: string): Promise<boolean> {
  const result: SpawnResult = await app(session, ['ls']);
  if (result.code === 0) return true;
  if (result.stderr.includes('no Herdr window')) return false;
  throw new CommandError(['herdr-app', 'ls'], process.cwd(), result);
}

async function appDo(session: string, args: string[]): Promise<void> {
  const result: SpawnResult = await app(session, ['do', ...args]);
  if (result.code !== 0) throw new CommandError(['herdr-app', 'do', ...args], process.cwd(), result);
}

export function renameTab(session: string, tab: string, name: string): Promise<void> {
  return appDo(session, ['tab.rename', '--id', tab, '--name', name]);
}

export function closeTab(session: string, tab: string): Promise<void> {
  return appDo(session, ['tab.close', '--id', tab]);
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// hc names are 1-32 characters; a long slug keeps its head and gains a hash of repo/slug.
export function seatName(repo: string, prefix: string, slug: string, seat: 'a' | 'b'): string {
  const full: string = `${prefix}-${slug}-${seat}`;
  if (full.length <= 32) return full;
  return `${prefix}-${slug.slice(0, 22).replace(/-$/, '')}-${sha256(`${repo}/${slug}`).slice(0, 4)}-${seat}`;
}

export function consultantName(prefix: string, letter: string): string {
  return `${prefix}-slot-${letter}`;
}

export function leafTab(repo: string, slug: string): string {
  return 'ak' + sha256(`${repo}/${slug}`).slice(0, 30);
}

export async function wakeWatcher(repo: Repo, reason: string): Promise<void> {
  const space: SpaceResolution = await repoSpace(repo);
  if (!space.ok) return;
  const watchers: Seen[] = (await terminals(space.session, { 'akrogon.watch': repo.name })).filter(
    (t: Seen) => t.status !== null,
  );
  if (watchers.length === 0) return;
  if (watchers.length > 1) {
    console.error(
      JSON.stringify({
        repo: repo.name,
        watch: 'several live watch terminals',
        terminals: watchers.map((t: Seen) => t.address),
        reason,
      }),
    );
    return;
  }
  await withLock(resolve(globalHome(), `watch-${repo.name}.lock`), async (): Promise<void> => {
    const watcher: Seen = await terminal(space.session, watchers[0].address);
    if (watcher.status?.state === 'idle' || watcher.status?.state === 'done')
      await send(space.session, watcher.address, `/watch-issues tick ${repo.root}`);
  });
}
