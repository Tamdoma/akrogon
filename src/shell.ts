import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import type { Repo } from './config';

export type Result = { code: number; stdout: string; stderr: string };

export class CommandError extends Error {
  constructor(
    readonly argv: string[],
    readonly cwd: string,
    readonly result: Result,
  ) {
    super(JSON.stringify({ command: argv, cwd, ...result }));
  }
}

export type SpawnResult = Result & { signalCode: NodeJS.Signals | null; killed: boolean };

// Pipe streams in Bun.spawn can lose their EOF or buffered data under load, so
// capture through files instead: the OS owns the bytes end to end.
export type Captured = { dir: string; outPath: string; errPath: string };

export function spawnFiles(
  argv: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdin?: string;
    timeout?: number;
    killSignal?: NodeJS.Signals;
    captureRoot?: string;
  } = {},
): { child: Bun.Subprocess; captured: Captured } {
  const dir: string = mkdtempSync(resolve(options.captureRoot ?? tmpdir(), 'akrogon-io-'));
  const captured: Captured = { dir, outPath: resolve(dir, 'out'), errPath: resolve(dir, 'err') };
  let launched: boolean = false;
  try {
    const child: Bun.Subprocess = Bun.spawn(argv, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env,
      stdin: options.stdin === undefined ? 'ignore' : new Blob([options.stdin]),
      stdout: Bun.file(captured.outPath),
      stderr: Bun.file(captured.errPath),
      timeout: options.timeout,
      killSignal: options.killSignal,
    });
    launched = true;
    return { child, captured };
  } finally {
    if (!launched) rmSync(captured.dir, { recursive: true, force: true });
  }
}

export async function finishCaptured(child: Bun.Subprocess, captured: Captured): Promise<SpawnResult> {
  const code: number = await child.exited;
  const result: SpawnResult = {
    code,
    signalCode: child.signalCode,
    killed: child.killed,
    stdout: readFileSync(captured.outPath, 'utf8'),
    stderr: readFileSync(captured.errPath, 'utf8'),
  };
  rmSync(captured.dir, { recursive: true, force: true });
  return result;
}

export async function spawnCaptured(
  argv: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdin?: string;
    timeout?: number;
    killSignal?: NodeJS.Signals;
    captureRoot?: string;
  } = {},
): Promise<SpawnResult> {
  const { child, captured }: { child: Bun.Subprocess; captured: Captured } = spawnFiles(argv, options);
  return finishCaptured(child, captured);
}

// Seat shells cut the session bus so test browsers cannot leave their scope (next.ts placement env).
// akrogon's own git and gh calls reach the gh token in the keyring over that bus, so they get it back.
function credentialEnv(argv: string[]): NodeJS.ProcessEnv | undefined {
  const program: string | undefined = argv.find((arg: string) => arg !== 'env' && !arg.includes('='));
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  return (program === 'git' || program === 'gh') && runtime !== undefined && runtime.trim() !== ''
    ? { ...process.env, DBUS_SESSION_BUS_ADDRESS: `unix:path=${runtime}/bus` }
    : undefined;
}

export async function run(
  argv: string[],
  cwd: string = process.cwd(),
  deadlineMs?: number,
  stdin?: string,
): Promise<Result> {
  const { child, captured }: { child: Bun.Subprocess; captured: Captured } = spawnFiles(argv, {
    cwd,
    stdin,
    env: credentialEnv(argv),
  });
  const finished: Promise<SpawnResult> = finishCaptured(child, captured);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result: SpawnResult = await (deadlineMs === undefined
      ? finished
      : Promise.race([
          finished,
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              child.kill();
              reject(new CommandError(argv, cwd, { code: 1, stdout: '', stderr: `deadline ${deadlineMs}ms exceeded` }));
            }, deadlineMs);
          }),
        ]));
    return { code: result.code, stdout: result.stdout.trimEnd(), stderr: result.stderr.trimEnd() };
  } finally {
    clearTimeout(timer);
  }
}

export async function command(
  argv: string[],
  cwd: string = process.cwd(),
  stdin?: string,
  deadlineMs?: number,
): Promise<string> {
  const result: Result = await run(argv, cwd, deadlineMs, stdin);
  if (result.code !== 0) throw new CommandError(argv, cwd, result);
  return result.stdout;
}

export async function retryCommand(argv: string[], cwd: string, deadlineMs?: number): Promise<string> {
  const result: Result = await run(argv, cwd, deadlineMs);
  if (result.code === 0) return result.stdout;
  console.warn(JSON.stringify({ warning: 'retrying command', command: argv, cwd, ...result }));
  const retried: Result = await run(argv, cwd, deadlineMs);
  if (retried.code !== 0) throw new CommandError(argv, cwd, retried);
  return retried.stdout;
}

export function quote(value: string): string {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}

export function writeYaml(path: string, content: object): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, Bun.YAML.stringify(content, null, 2));
  renameSync(temporary, path);
}

export const paneSchema = z.object({
  pane_id: z.string(),
  tab_id: z.string(),
  cwd: z.string().nullable().default(null),
  agent: z.string().nullable().default(null),
  agent_status: z.enum(['idle', 'done', 'working', 'blocked', 'unknown']),
  agent_session: z
    .object({ kind: z.enum(['id', 'path']), value: z.string() })
    .nullable()
    .optional(),
});

export type Pane = z.infer<typeof paneSchema>;

export const tabSchema = z.object({
  tab_id: z.string(),
  label: z.string(),
  focused: z.boolean().optional(),
  workspace_id: z.string().optional(),
});

export type Tab = z.infer<typeof tabSchema>;

export const workspaceSchema = z.object({ workspace_id: z.string(), label: z.string() });

export type Workspace = z.infer<typeof workspaceSchema>;

export const sessionSchema = z.object({
  name: z.string(),
  running: z.boolean(),
  socket_path: z.string(),
  session_dir: z.string(),
  default: z.boolean(),
});

export type Session = z.infer<typeof sessionSchema>;

export type SessionResolution =
  { ok: true; session: Session; workspace: Workspace } | { ok: false; reason: string; scope?: 'repo' | 'invocation' };

// Discovery reads (session list, per-session workspace list, the second-seat
// guard's pane/tab lists) get a fixed deadline; a hit counts as unreadable.
export const DISCOVERY_DEADLINE_MS = 10_000;

const herdrErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

const retryableCodes: readonly string[] = [
  'agent_prompt_stalled',
  'agent_blocked',
  'agent_not_ready',
  'timeout',
  'wait_timeout',
  'agent_wait_timeout',
];

export function herdrError(result: Result): { code: string; message: string } {
  try {
    const response = herdrErrorSchema.safeParse(JSON.parse(result.stderr));
    if (response.success) return response.data.error;
  } catch {
    // fall through to unstructured mapping
  }
  return { code: `exit ${result.code}`, message: result.stderr.trim().slice(0, 500) };
}

export function retryable(result: Result): boolean {
  return retryableCodes.includes(herdrError(result).code);
}

export function herdrArgv(args: string[], opts: { session?: string; exe?: string } = {}): string[] {
  return [opts.exe ?? 'herdr', ...(opts.session === undefined ? [] : ['--session', opts.session]), ...args];
}

export async function herdr<T>(
  args: string[],
  schema: z.ZodType<T>,
  opts: { session?: string; exe?: string; deadlineMs?: number } = {},
): Promise<T> {
  const argv: string[] = herdrArgv(args, opts);
  const cwd: string = process.cwd();
  const stdout: string = await command(argv, cwd, undefined, opts.deadlineMs);
  try {
    return z.object({ result: schema }).parse(JSON.parse(stdout)).result;
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof z.ZodError)) throw error;
    throw new Error(JSON.stringify({ command: argv, cwd, stdout, error: error.message }), { cause: error });
  }
}

export async function panes(session?: string, exe?: string): Promise<Pane[]> {
  return (
    await herdr(['pane', 'list'], z.object({ panes: z.array(paneSchema) }), {
      session,
      exe,
      deadlineMs: DISCOVERY_DEADLINE_MS,
    })
  ).panes;
}

export async function tabs(session?: string, exe?: string): Promise<Tab[]> {
  return (
    await herdr(['tab', 'list'], z.object({ tabs: z.array(tabSchema) }), {
      session,
      exe,
      deadlineMs: DISCOVERY_DEADLINE_MS,
    })
  ).tabs;
}

export async function workspaces(session?: string, exe?: string): Promise<Workspace[]> {
  return (await herdr(['workspace', 'list'], z.object({ workspaces: z.array(workspaceSchema) }), { session, exe }))
    .workspaces;
}

// One session list per process per executable; the parsed reply or the failure is cached.
type SessionList = { ok: true; sessions: Session[] } | { ok: false; error: string };
const sessionLists: Map<string, Promise<SessionList>> = new Map();
const resolutions: Map<string, Promise<SessionResolution>> = new Map();

function describeError(error: unknown): string {
  if (error instanceof CommandError) {
    const decoded: { code: string; message: string } = herdrError(error.result);
    return decoded.code + ': ' + decoded.message;
  }
  return error instanceof Error ? error.message : String(error);
}

async function fetchSessionList(exe: string): Promise<SessionList> {
  const argv: string[] = herdrArgv(['session', 'list', '--json'], { exe });
  try {
    const stdout: string = await command(argv, process.cwd(), undefined, DISCOVERY_DEADLINE_MS);
    // The reply is the bare {sessions: [...]} object, not the {result: ...} wrapper.
    return { ok: true, sessions: z.object({ sessions: z.array(sessionSchema) }).parse(JSON.parse(stdout)).sessions };
  } catch (error) {
    return { ok: false, error: argv.join(' ') + ': ' + describeError(error) };
  }
}

function sessionList(exe: string): Promise<SessionList> {
  const cached: Promise<SessionList> | undefined = sessionLists.get(exe);
  if (cached !== undefined) return cached;
  const fetched: Promise<SessionList> = fetchSessionList(exe);
  sessionLists.set(exe, fetched);
  return fetched;
}

// The sessions from the cached list, for the second-seat guard's cross-session reads.
export async function listSessions(exe: string = 'herdr'): Promise<Session[] | null> {
  const list: SessionList = await sessionList(exe);
  return list.ok ? list.sessions : null;
}

// Every running session's panes tagged with its name, re-fetched on each call.
// A session listed running whose pane read dies server_not_running is skipped
// as stopped, like resolution's workspace probe; any other per-session read
// error or a failed session list makes the whole union null.
export async function sessionPanes(exe: string = 'herdr'): Promise<{ session: string; pane: Pane }[] | null> {
  const sessions: Session[] | null = await listSessions(exe);
  if (sessions === null) return null;
  const tagged: { session: string; pane: Pane }[] = [];
  for (const session of sessions) {
    if (!session.running) continue;
    try {
      // Liveness first on the cheapest read, like resolution's workspace
      // probe: a dead-but-listed session is skipped without a pane call.
      await herdr(['workspace', 'list'], z.object({}), {
        session: session.name,
        exe,
        deadlineMs: DISCOVERY_DEADLINE_MS,
      });
      for (const pane of await panes(session.name, exe)) tagged.push({ session: session.name, pane });
    } catch (error) {
      if (error instanceof CommandError && herdrError(error.result).code === 'server_not_running') continue;
      return null;
    }
  }
  return tagged;
}

export function repoSession(repo: Repo, opts: { exe?: string } = {}): Promise<SessionResolution> {
  const exe: string = opts.exe ?? 'herdr';
  const key: string = exe + ' ' + repo.name;
  const cached: Promise<SessionResolution> | undefined = resolutions.get(key);
  if (cached !== undefined) return cached;
  const resolved: Promise<SessionResolution> = resolveSession(repo, exe).catch((error: unknown): SessionResolution => ({
    ok: false,
    scope: 'repo',
    reason: JSON.stringify({ workspace: repo.name, error: 'resolution failed: ' + describeError(error) }),
  }));
  resolutions.set(key, resolved);
  return resolved;
}

function refusalReason(
  repo: Repo,
  verdict: string,
  searched: Session[],
  stopped: Session[],
  unreadable: { session: string; error: string }[],
  duplicates: { session: string; workspace_id: string }[],
): string {
  return JSON.stringify({
    workspace: repo.name,
    refused: verdict,
    searched: searched.map((session) => session.name),
    skipped_stopped: stopped.map((session) => session.name),
    unreadable,
    duplicates,
  });
}

function refuse(
  repo: Repo,
  verdict: string,
  searched: Session[],
  stopped: Session[],
  unreadable: { session: string; error: string }[],
  duplicates: { session: string; workspace_id: string }[] = [],
): SessionResolution {
  return { ok: false, scope: 'repo', reason: refusalReason(repo, verdict, searched, stopped, unreadable, duplicates) };
}

async function resolveSession(repo: Repo, exe: string): Promise<SessionResolution> {
  const list: SessionList = await sessionList(exe);
  if (!list.ok)
    return {
      ok: false,
      scope: 'invocation',
      reason: JSON.stringify({ workspace: repo.name, refused: 'session list failed', error: list.error }),
    };
  const searched: Session[] = [];
  const stopped: Session[] = [];
  const unreadable: { session: string; error: string }[] = [];
  const matches: { session: Session; workspace: Workspace }[] = [];
  for (const session of list.sessions) {
    if (!session.running) {
      stopped.push(session);
      continue;
    }
    try {
      const listed: { workspaces: Workspace[] } = await herdr(
        ['workspace', 'list'],
        z.object({ workspaces: z.array(workspaceSchema) }),
        { session: session.name, exe, deadlineMs: DISCOVERY_DEADLINE_MS },
      );
      searched.push(session);
      for (const workspace of listed.workspaces)
        if (workspace.label === repo.name) matches.push({ session, workspace });
    } catch (error) {
      // A session listed running whose read dies server_not_running is treated as stopped.
      if (error instanceof CommandError && herdrError(error.result).code === 'server_not_running') {
        stopped.push(session);
        continue;
      }
      unreadable.push({ session: session.name, error: describeError(error) });
    }
  }
  const duplicates: { session: string; workspace_id: string }[] = matches.map((match) => ({
    session: match.session.name,
    workspace_id: match.workspace.workspace_id,
  }));
  if (matches.length > 1) return refuse(repo, 'held by multiple sessions', searched, stopped, unreadable, duplicates);
  if (unreadable.length > 0) return refuse(repo, 'uniqueness unknown', searched, stopped, unreadable);
  if (matches.length === 0) return refuse(repo, 'no running session holds it', searched, stopped, unreadable);
  return { ok: true, session: matches[0].session, workspace: matches[0].workspace };
}
