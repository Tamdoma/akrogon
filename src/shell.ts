import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
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

export async function run(argv: string[], cwd: string = process.cwd(), deadlineMs?: number): Promise<Result> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const collected: Promise<[string, string, number]> = Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const [stdout, stderr, code]: [string, string, number] = await (deadlineMs === undefined
      ? collected
      : Promise.race([
          collected,
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              child.kill();
              reject(new CommandError(argv, cwd, { code: 1, stdout: '', stderr: `deadline ${deadlineMs}ms exceeded` }));
            }, deadlineMs);
          }),
        ]));
    return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
  } finally {
    clearTimeout(timer);
  }
}

export async function command(argv: string[], cwd: string = process.cwd()): Promise<string> {
  const result: Result = await run(argv, cwd);
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
  agent_session: z.object({ value: z.string() }).nullable().optional(),
});

export type Pane = z.infer<typeof paneSchema>;

export const tabSchema = z.object({ tab_id: z.string(), label: z.string() });

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

export function retryable(result: Result): boolean {
  const parsed: unknown = (() => {
    try {
      return JSON.parse(result.stderr);
    } catch {
      return null;
    }
  })();
  const response = herdrErrorSchema.safeParse(parsed);
  return response.success && retryableCodes.includes(response.data.error.code);
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
