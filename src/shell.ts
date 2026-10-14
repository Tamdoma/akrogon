import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';

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

export async function command(argv: string[], cwd: string = process.cwd(), stdin?: string): Promise<string> {
  const result: Result = await run(argv, cwd, undefined, stdin);
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

export async function herdr<T>(args: string[], schema: z.ZodType<T>): Promise<T> {
  const argv: string[] = ['herdr', ...args];
  const cwd: string = process.cwd();
  const stdout: string = await command(argv, cwd);
  try {
    return z.object({ result: schema }).parse(JSON.parse(stdout)).result;
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof z.ZodError)) throw error;
    throw new Error(JSON.stringify({ command: argv, cwd, stdout, error: error.message }), { cause: error });
  }
}

export async function panes(): Promise<Pane[]> {
  return (await herdr(['pane', 'list'], z.object({ panes: z.array(paneSchema) }))).panes;
}

export async function tabs(): Promise<Tab[]> {
  return (await herdr(['tab', 'list'], z.object({ tabs: z.array(tabSchema) }))).tabs;
}

export async function workspaces(): Promise<Workspace[]> {
  return (await herdr(['workspace', 'list'], z.object({ workspaces: z.array(workspaceSchema) }))).workspaces;
}
