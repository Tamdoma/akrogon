import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

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

// hc discovery reads (rpc calls over hc connect) get a fixed deadline; a hit counts as unreadable.
export const DISCOVERY_DEADLINE_MS = 10_000;
