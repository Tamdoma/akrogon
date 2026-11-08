// Finds the transcript file a seat's harness writes now (plan D18) from the seat process (claude's own
// per-process session record, codex's open rollout, pi's argv) and keeps it on the terminal as
// `akrogon.transcript`, which is read only when the process names none.
import { existsSync, readdirSync, readFileSync, readlinkSync, statSync, type Dirent } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { z } from 'zod';
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

// claude keeps one record per live process, <config>/sessions/<pid>.json, naming the conversation it
// writes now: a /clear or a resume changes it, while the process's tasks folder keeps its first
// session id. procStart (field 22 of /proc/<pid>/stat) tells a reused pid apart.
const claudeRecord = z.object({ sessionId: z.string(), procStart: z.string() });
type ClaudeRecord = z.infer<typeof claudeRecord>;

// Claude rewrites its record in place, so a read can catch it partly written: that read names nothing.
function recordOf(raw: string): ClaudeRecord | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  const record = claudeRecord.safeParse(json);
  return record.success ? record.data : null;
}

// Null once the process has exited.
function procStart(pid: number): string | null {
  let stat: string;
  try {
    stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
  } catch (error) {
    if (gone(error)) return null;
    throw error;
  }
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

// What a seat process says about its transcript: a harness that knows its conversation speaks for it
// even before the file exists (path null), and then no older label may answer in its place.
type Named = { path: string | null };

// A live claude process names the one <config>/projects/*/<sessionId>.jsonl (path null while that file
// is not written yet); null when the process is not claude or its record is unreadable or another
// process's.
function claudeTranscript(pid: number, p: Proc): Named | null {
  const home: string | undefined = p.env.get('HOME');
  const config: string | undefined =
    p.env.get('CLAUDE_CONFIG_DIR') ?? (home === undefined ? undefined : join(home, '.claude'));
  if (config === undefined) return null;
  let raw: string;
  try {
    raw = readFileSync(join(config, 'sessions', `${pid}.json`), 'utf8');
  } catch (error) {
    if (gone(error)) return null;
    throw error;
  }
  // An unreadable record cannot show it is this process's (records outlive their processes), so it
  // claims nothing; a live claude caught mid-rewrite answers on the next lookup.
  const record: ClaudeRecord | null = recordOf(raw);
  if (record === null || record.procStart !== procStart(pid)) return null;
  const projects: string = join(config, 'projects');
  // No projects folder yet: claude writes its record before its first conversation.
  let folders: Dirent[];
  try {
    folders = readdirSync(projects, { withFileTypes: true });
  } catch (error) {
    if (gone(error)) return { path: null };
    throw error;
  }
  const matches: string[] = folders
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(projects, entry.name, `${record.sessionId}.jsonl`))
    .filter((path: string) => existsSync(path));
  return { path: matches.length === 1 ? matches[0] : null };
}

const rollouts = (p: Proc): string[] => p.open.filter((target: string) => /^rollout-.*\.jsonl$/.test(basename(target)));

function piStart(p: Proc): string | null {
  const flag: number = p.argv.indexOf('--session-id');
  const home: string | undefined = p.env.get('HOME');
  return flag !== -1 && flag + 1 < p.argv.length && home !== undefined ? piSession(home, p.argv[flag + 1]) : null;
}

// claude: its session record; codex: the newest open rollout; agy: the open conversation database;
// pi: the --session-id it was started with.
function fromProcess(pid: number): Named | null {
  const p = proc(pid);
  if (p === null) return null;
  const claude: Named | null = claudeTranscript(pid, p);
  if (claude !== null) return claude;
  if (rollouts(p).length > 0)
    return {
      path: rollouts(p).reduce((newest: string, path: string) =>
        statSync(path).mtimeMs > statSync(newest).mtimeMs ? path : newest,
      ),
    };
  const agy: string | undefined = p.open.find((target: string) => basename(target) === 'conversation_summaries.db');
  if (agy !== undefined) return { path: agy };
  const pi: string | null = piStart(p);
  return pi === null ? null : { path: pi };
}

// The files a reset seat may have moved to (session-id final-shape): the folder of claude's current
// conversation and pi's sessions folder for the cwd, only files changed since the reset began; codex the
// rollouts it holds open.
function resetCandidates(pid: number, sinceMs: number): string[] {
  const p = proc(pid);
  if (p === null) return [];
  const claude: Named | null = claudeTranscript(pid, p);
  if (claude === null && rollouts(p).length > 0) return rollouts(p);
  const pi: string | null = claude === null ? piStart(p) : null;
  const folder: string | null =
    claude !== null ? (claude.path === null ? null : dirname(claude.path)) : pi !== null ? dirname(pi) : null;
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
  // The process is asked every time: a label can name a conversation the seat has since left, so it
  // answers only when no seat process speaks for its transcript.
  const recorded: string | undefined = t.labels['akrogon.transcript'];
  const named: Named | undefined = seatPids(t)
    .map((pid: number) => fromProcess(pid))
    .find((n: Named | null): n is Named => n !== null);
  if (named === undefined) return recorded !== undefined && existsSync(recorded) ? recorded : null;
  if (named.path !== null && named.path !== recorded)
    await label(seat.session, seat.address, { 'akrogon.transcript': named.path });
  return named.path;
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
