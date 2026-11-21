// The watch scripts' own hc runner (plan D2): unlike src/hc.ts it KEEPS the caller's terminal
// environment so `hc run` default-parents to the terminal the script runs in and `hc get` resolves
// that terminal. HC_SESSION is pinned per call; HC_TERMINAL_SOCKET is dropped because hc's
// run-parent detection keys on HC_TERMINAL_ID only when the socket variable is absent — with it
// present the spawned terminal gets parent:null (proven: hc run under an hc-injected env).
import { watchConsultName } from '../../../src/hc';
import { spawnCaptured, type SpawnResult } from '../../../src/shell';
import { z } from 'zod';

export type HcReply = { ok: true; stdout: string } | { ok: false; kind: string; result: SpawnResult };

const hcErrorSchema = z.object({ error: z.object({ kind: z.string() }) });

function errorKind(result: SpawnResult): string {
  try {
    const parsed: unknown = JSON.parse(result.stderr);
    const error = hcErrorSchema.safeParse(parsed);
    if (error.success) return error.data.error.kind;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  return result.signalCode === null ? `exit ${result.code}` : `signal ${result.signalCode}`;
}

export async function hcCall(session: string, args: string[]): Promise<HcReply> {
  const { HC_TERMINAL_SOCKET: _socket, ...env } = process.env;
  const result: SpawnResult = await spawnCaptured(['hc', ...args], {
    env: { ...env, HC_SESSION: session },
    timeout: 60_000,
  });
  return result.code === 0
    ? { ok: true, stdout: result.stdout }
    : { ok: false, kind: errorKind(result), result };
}

const termSchema = z.object({
  address: z.string(),
  name: z.string().nullable().default(null),
  state: z.string(),
  turn: z.number().int().default(0),
  pid: z.number().int().nullable().default(null),
  parent: z.string().nullable().default(null),
  labels: z.record(z.string(), z.string()),
  argv: z.array(z.string()).nullable().default(null),
  foreground: z.object({ pid: z.number().int() }).passthrough().nullable().default(null),
  status: z.object({ state: z.string() }).passthrough().nullable().default(null),
});

export type Term = z.infer<typeof termSchema>;

export async function getTerm(
  session: string,
  address: string,
): Promise<{ ok: true; term: Term } | { ok: false; kind: string }> {
  const reply: HcReply = await hcCall(session, ['get', '--json', address]);
  if (!reply.ok) return reply;
  return { ok: true, term: termSchema.parse(JSON.parse(reply.stdout)) };
}

// Plan D7: a live timer candidate counts only under the repo's watch name running the timer script.
export function isVerifiedTimer(prefix: string, term: Term): boolean {
  return (
    term.name === `${prefix}-watch` &&
    (term.argv ?? []).join(' ').includes('skills/watch-issues/scripts/timer.ts')
  );
}

// Plan D5: the watch's own consultant is live, named for the prefix, labelled for the repo and
// parented to the watcher address. The structural term type fits both Term and src/hc.ts Seen.
export function isVerifiedConsultant(
  prefix: string,
  repo: string,
  watcher: string,
  term: { name: string | null; labels: Record<string, string>; parent: string | null; state: string },
): boolean {
  return (
    term.state === 'live' &&
    term.name === watchConsultName(prefix) &&
    term.labels['akrogon.watch-consult'] === repo &&
    term.labels['akrogon.repo'] === repo &&
    term.parent === watcher
  );
}
