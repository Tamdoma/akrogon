// Finds the transcript file a seat's harness writes now (plan D18) from the seat process (claude's own
// per-process session record, codex's open rollout, agy's conversation lock, pi's argv) and keeps it on
// the terminal as `akrogon.transcript`, which is read only when the process names none or, for pi, when
// the seat published its current conversation there itself.
import { Database } from 'bun:sqlite';
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

// agy locks presence/<id>.lock for its current conversation only (after /clear it keeps the earlier
// conversation's database open too); that conversation is conversations/<id>.db beside it.
function agyConversation(p: Proc): string | null {
  const lock: string | undefined = p.open.find(
    (target: string) => basename(dirname(target)) === 'presence' && target.endsWith('.lock'),
  );
  return lock === undefined ? null : join(dirname(dirname(lock)), 'conversations', `${basename(lock, '.lock')}.db`);
}

const rollouts = (p: Proc): string[] => p.open.filter((target: string) => /^rollout-.*\.jsonl$/.test(basename(target)));

function piStart(p: Proc): string | null {
  const flag: number = p.argv.indexOf('--session-id');
  const home: string | undefined = p.env.get('HOME');
  return flag !== -1 && flag + 1 < p.argv.length && home !== undefined ? piSession(home, p.argv[flag + 1]) : null;
}

// claude: its session record; codex: the newest open rollout; agy: its locked conversation;
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
  const agy: string | null = agyConversation(p);
  if (agy !== null) return { path: agy };
  const pi: string | null = piStart(p);
  return pi === null ? null : { path: pi };
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
  // pi's argv names only the conversation it started with; after /new the seat publishes its current file
  // as the label (chart-issues scripts/transcript.ts, from pi's PI_SESSION_FILE), which then answers.
  if (
    named.path !== null &&
    recorded !== undefined &&
    transcriptKind(named.path) === 'pi' &&
    transcriptKind(recorded) === 'pi' &&
    existsSync(recorded)
  )
    return recorded;
  if (named.path !== null && named.path !== recorded)
    await label(seat.session, seat.address, { 'akrogon.transcript': named.path });
  return named.path;
}

export type Kind = 'claude' | 'codex' | 'pi' | 'agy';

// The harness a transcript path belongs to, from the shapes the resolver returns.
export function transcriptKind(path: string): Kind | null {
  const folder: string = basename(dirname(path));
  if (folder === 'conversations' && path.endsWith('.db')) return 'agy';
  if (/^rollout-.*\.jsonl$/.test(basename(path))) return 'codex';
  if (basename(dirname(dirname(path))) === 'projects' && path.endsWith('.jsonl')) return 'claude';
  if (folder.startsWith('--') && folder.endsWith('--') && path.endsWith('.jsonl')) return 'pi';
  return null;
}

// One transcript record: its text, and its value for a harness's record schemas. A JSONL transcript has
// one per line (a line cut mid-write has no value); agy's conversation database one per step, valued by
// its step type. Positions are byte offsets into a JSONL file and step indexes into agy's database.
export type TranscriptRecord = { text: string; value: unknown };

// The steps table declares step_payload a nullable blob; a step without one has no text.
const agyStep = z.object({ step_type: z.number(), step_payload: z.instanceof(Uint8Array).nullable() });

function parsed(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
}

export function transcriptRecords(path: string, from: number): TranscriptRecord[] {
  if (transcriptKind(path) !== 'agy')
    return readFileSync(path)
      .subarray(from)
      .toString('utf8')
      .split('\n')
      .map((line: string) => ({ text: line, value: parsed(line) }));
  const db: Database = new Database(path, { readonly: true });
  const steps = z
    .array(agyStep)
    .parse(db.query('select step_type, step_payload from steps where idx >= ? order by idx').all(from));
  db.close();
  return steps.map((step) => ({
    text: step.step_payload === null ? '' : Buffer.from(step.step_payload).toString('utf8'),
    value: { step_type: step.step_type },
  }));
}

// The position the transcript's next record will take.
export function transcriptEnd(path: string): number {
  if (transcriptKind(path) !== 'agy') return readFileSync(path).byteLength;
  const db: Database = new Database(path, { readonly: true });
  const end: number = z
    .object({ end: z.number() })
    .parse(db.query('select coalesce(max(idx), -1) + 1 as end from steps').get()).end;
  db.close();
  return end;
}
