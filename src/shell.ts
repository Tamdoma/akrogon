import { z } from 'zod';

export type Result = { code: number; stdout: string; stderr: string };
export class CommandError extends Error {
  constructor(readonly argv: string[], readonly cwd: string, readonly result: Result) {
    super(JSON.stringify({ command: argv, cwd, ...result }));
  }
}
export async function run(argv: string[], cwd: string = process.cwd()): Promise<Result> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, { cwd, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ]);
  return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
}
export async function command(argv: string[], cwd: string = process.cwd()): Promise<string> {
  const result: Result = await run(argv, cwd);
  if (result.code !== 0) throw new CommandError(argv, cwd, result);
  return result.stdout;
}
export async function retryCommand(argv: string[], cwd: string): Promise<string> {
  const result: Result = await run(argv, cwd);
  if (result.code === 0) return result.stdout;
  console.warn(JSON.stringify({ warning: 'retrying command', command: argv, cwd, ...result }));
  return command(argv, cwd);
}
export function quote(value: string): string { return "'" + value.replaceAll("'", "'\\''") + "'"; }
export const paneSchema = z.object({
  pane_id: z.string(), tab_id: z.string(), cwd: z.string().nullable(),
  agent: z.string().nullable(), agent_status: z.enum(['idle', 'done', 'working', 'blocked', 'unknown']),
  agent_session: z.object({ id: z.string() }).nullable().optional(),
});
export type Pane = z.infer<typeof paneSchema>;
export const tabSchema = z.object({ tab_id: z.string(), label: z.string() });
export type Tab = z.infer<typeof tabSchema>;
export async function herdr<T>(args: string[], schema: z.ZodType<T>): Promise<T> {
  const output: string = await command(['herdr', ...args]);
  return z.object({ result: schema }).parse(JSON.parse(output)).result;
}
export async function panes(): Promise<Pane[]> {
  return (await herdr(['pane', 'list'], z.object({ panes: z.array(paneSchema) }))).panes;
}
export async function tabs(): Promise<Tab[]> {
  return (await herdr(['tab', 'list'], z.object({ tabs: z.array(tabSchema) }))).tabs;
}
