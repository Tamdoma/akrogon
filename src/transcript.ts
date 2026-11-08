// Finds the transcript file a seat's harness writes (plan D18) from the seat process's open files and
// argv, and saves it on the terminal as `akrogon.transcript` so later lookups read the label.
import { readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { HcError, label, sessions, terminal, type Seen } from './hc';

// A process that exited between the hc read and the /proc read holds no transcript.
function gone(error: unknown): boolean {
  const code: unknown = (error as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ESRCH';
}

function proc(pid: number): Proc | null {
  try {
    const fds: string = `/proc/${pid}/fd`;
    const split = (file: string): string[] => readFileSync(`/proc/${pid}/${file}`, 'utf8').split('\0').filter(Boolean);
    return {
      argv: split('cmdline'),
      env: new Map(
        split('environ').map((entry: string): [string, string] => [
          entry.slice(0, entry.indexOf('=')),
          entry.slice(entry.indexOf('=') + 1),
        ]),
      ),
      open: readdirSync(fds).flatMap((fd: string) => {
        try {
          return [readlinkSync(join(fds, fd))];
        } catch (error) {
          if (gone(error)) return [];
          throw error;
        }
      }),
    };
  } catch (error) {
    if (gone(error)) return null;
    throw error;
  }
}

function piSession(home: string, id: string): string | null {
  const root: string = join(home, '.pi', 'agent', 'sessions');
  const suffix: string = `_${id}.jsonl`;
  let dirs: string[];
  try {
    dirs = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(root, entry.name));
  } catch (error) {
    if (gone(error)) return null;
    throw error;
  }
  const matches: string[] = dirs.flatMap((dir: string) =>
    readdirSync(dir)
      .filter((file: string) => file.endsWith(suffix))
      .map((file: string) => join(dir, file)),
  );
  return matches.length === 1 ? matches[0] : null;
}

type Proc = { argv: string[]; env: Map<string, string>; open: string[] };

// claude's open tasks handle names its project folder and session id under the config root.
function claudeHandle(p: Proc): { projects: string; id: string } | null {
  for (const target of p.open) {
    const claude: RegExpExecArray | null = /\/claude-\d+\/([^/]+)\/([^/]+)\/tasks$/.exec(target);
    if (claude === null) continue;
    const home: string | undefined = p.env.get('HOME');
    const config: string | undefined =
      p.env.get('CLAUDE_CONFIG_DIR') ?? (home === undefined ? undefined : join(home, '.claude'));
    return config === undefined ? null : { projects: join(config, 'projects', claude[1]), id: claude[2] };
  }
  return null;
}

const rollouts = (p: Proc): string[] => p.open.filter((target: string) => /^rollout-.*\.jsonl$/.test(basename(target)));

function piStart(p: Proc): string | null {
  const flag: number = p.argv.indexOf('--session-id');
  const home: string | undefined = p.env.get('HOME');
  return flag !== -1 && flag + 1 < p.argv.length && home !== undefined ? piSession(home, p.argv[flag + 1]) : null;
}

// claude: its open tasks folder names the project and session; codex: the newest open rollout;
// agy: the open conversation database; pi: the --session-id it was started with.
function fromProcess(pid: number): string | null {
  const p = proc(pid);
  if (p === null) return null;
  const claude = claudeHandle(p);
  if (claude !== null) return join(claude.projects, `${claude.id}.jsonl`);
  if (rollouts(p).length > 0)
    return rollouts(p).reduce((newest: string, path: string) =>
      statSync(path).mtimeMs > statSync(newest).mtimeMs ? path : newest,
    );
  const agy: string | undefined = p.open.find((target: string) => basename(target) === 'conversation_summaries.db');
  if (agy !== undefined) return agy;
  return piStart(p);
}

// The files a reset seat may have moved to (session-id final-shape): claude's project folder and pi's
// sessions folder for the cwd, only files changed since the reset began; codex the rollouts it holds open.
function resetCandidates(pid: number, sinceMs: number): string[] {
  const p = proc(pid);
  if (p === null) return [];
  const claude = claudeHandle(p);
  if (claude === null && rollouts(p).length > 0) return rollouts(p);
  const pi: string | null = claude === null ? piStart(p) : null;
  const folder: string | null = claude !== null ? claude.projects : pi !== null ? dirname(pi) : null;
  if (folder === null) return [];
  return readdirSync(folder)
    .filter((name: string) => name.endsWith('.jsonl'))
    .map((name: string) => join(folder, name))
    .filter((path: string) => statSync(path).mtimeMs >= sinceMs);
}

function seatPids(t: Seen): number[] {
  return [t.pid, t.foreground?.pid ?? null].filter(
    (pid: number | null, index: number, all: (number | null)[]): pid is number =>
      pid !== null && all.indexOf(pid) === index,
  );
}

export async function transcriptFor(seat: { session: string; address: string }): Promise<string | null> {
  if (!(await sessions()).live.includes(seat.session)) return null;
  let t: Seen;
  try {
    t = await terminal(seat.session, seat.address);
  } catch (error) {
    if (error instanceof HcError && error.kind === 'not_found') return null;
    throw error;
  }
  const recorded: string | undefined = t.labels['akrogon.transcript'];
  if (recorded !== undefined) return recorded;
  for (const pid of seatPids(t)) {
    const found: string | null = fromProcess(pid);
    if (found === null) continue;
    await label(seat.session, seat.address, { 'akrogon.transcript': found });
    return found;
  }
  return null;
}

// After an in-place reset (/clear, /new) the seat's open files no longer name its conversation (P3):
// the transcript is the one file of that kind's folder holding the code its first prompt carried.
export async function transcriptByCode(
  seat: { session: string; address: string },
  code: string,
  sinceMs: number,
): Promise<string | null> {
  const t: Seen = await terminal(seat.session, seat.address);
  for (const pid of seatPids(t)) {
    const hits: string[] = resetCandidates(pid, sinceMs).filter((path: string) =>
      readFileSync(path, 'utf8').includes(code),
    );
    if (hits.length > 1) throw new Error(JSON.stringify({ seat, code, error: 'code found in several files', hits }));
    if (hits.length === 1) return hits[0];
  }
  return null;
}

// The harness a transcript path belongs to, from the shapes the resolver returns.
export function transcriptKind(path: string): 'claude' | 'codex' | 'pi' | null {
  const folder: string = basename(dirname(path));
  if (/^rollout-.*\.jsonl$/.test(basename(path))) return 'codex';
  if (basename(dirname(dirname(path))) === 'projects' && path.endsWith('.jsonl')) return 'claude';
  if (folder.startsWith('--') && folder.endsWith('--') && path.endsWith('.jsonl')) return 'pi';
  return null;
}
