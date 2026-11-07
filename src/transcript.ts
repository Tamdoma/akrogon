// Finds the transcript file a seat's harness writes (plan D18) from the seat process's open files and
// argv, and saves it on the terminal as `akrogon.transcript` so later lookups read the label.
import { readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { HcError, label, sessions, terminal, type Seen } from './hc';

// A process that exited between the hc read and the /proc read holds no transcript.
function gone(error: unknown): boolean {
  const code: unknown = (error as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ESRCH';
}

function proc(pid: number): { argv: string[]; env: Map<string, string>; open: string[] } | null {
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

// claude: its open tasks folder names the project and session; codex: the newest open rollout;
// agy: the open conversation database; pi: the --session-id it was started with.
function fromProcess(pid: number): string | null {
  const p = proc(pid);
  if (p === null) return null;
  for (const target of p.open) {
    const claude: RegExpExecArray | null = /\/claude-\d+\/([^/]+)\/([^/]+)\/tasks$/.exec(target);
    if (claude === null) continue;
    const home: string | undefined = p.env.get('HOME');
    const config: string | undefined =
      p.env.get('CLAUDE_CONFIG_DIR') ?? (home === undefined ? undefined : join(home, '.claude'));
    return config === undefined ? null : join(config, 'projects', claude[1], `${claude[2]}.jsonl`);
  }
  const rollouts: string[] = p.open.filter((target: string) => /^rollout-.*\.jsonl$/.test(basename(target)));
  if (rollouts.length > 0)
    return rollouts.reduce((newest: string, path: string) =>
      statSync(path).mtimeMs > statSync(newest).mtimeMs ? path : newest,
    );
  const agy: string | undefined = p.open.find((target: string) => basename(target) === 'conversation_summaries.db');
  if (agy !== undefined) return agy;
  const flag: number = p.argv.indexOf('--session-id');
  const home: string | undefined = p.env.get('HOME');
  if (flag !== -1 && flag + 1 < p.argv.length && home !== undefined) return piSession(home, p.argv[flag + 1]);
  return null;
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
  const pids: number[] = [t.pid, t.foreground?.pid ?? null].filter(
    (pid: number | null, index: number, all: (number | null)[]): pid is number =>
      pid !== null && all.indexOf(pid) === index,
  );
  for (const pid of pids) {
    const found: string | null = fromProcess(pid);
    if (found === null) continue;
    await label(seat.session, seat.address, { 'akrogon.transcript': found });
    return found;
  }
  return null;
}
