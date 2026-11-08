// `akrogon listen` (plan D15): follows every live hc session's labelled terminals and runs engine
// passes as `akrogon` child processes, one at a time. A new or restarted session's socket is seen
// through fs.watch on the socket directories, never by polling. A failed or overdue pass, a failed
// session stream and a failed scan are logged and retried once after RETRY_MS (a resume pass and a
// scan), so no failure leaves a leaf with nothing to wake it; only a broken directory watch or a pass
// that cannot be spawned ends the listener, which systemd restarts.
import { dirname, resolve } from 'node:path';
import { lstatSync, mkdirSync, realpathSync, watch, type FSWatcher } from 'node:fs';
import { z } from 'zod';
import { readGlobal, readRepo, type GlobalConfig } from './config';
import { follow, sessions, wakeWatcher, type HcLine, type Seen } from './hc';

type Pass = 'pull --all' | 'next --resume' | 'next --wake';

const msSchema = z.coerce.number().int().positive().optional();
const RETRY_MS: number = msSchema.parse(process.env.AKROGON_LISTEN_RETRY_MS) ?? 60_000;
// A pass can self-update (build and install a release) or pull every repo; past this it is hung.
const PASS_DEADLINE_MS: number = msSchema.parse(process.env.AKROGON_PASS_DEADLINE_MS) ?? 20 * 60_000;
// hc sends a subscription's snapshot first; one that sends none by then is stopped and retried, so a
// silent session cannot hold startup or the scans behind it.
const SNAPSHOT_MS: number = msSchema.parse(process.env.AKROGON_SNAPSHOT_MS) ?? 30_000;

const labelsSchema = z.object({ labels: z.record(z.string(), z.string()) });
const statusSchema = z.object({ status: z.object({ state: z.string() }).nullable() });

export async function listenCommand(): Promise<void> {
  const runtime: string | undefined = process.env.XDG_RUNTIME_DIR;
  if (runtime === undefined || runtime.trim() === '')
    throw new Error('XDG_RUNTIME_DIR is not set: cannot find hc sessions');
  const socketDir: string = resolve(runtime, 'herdr-core');
  let fail: (error: unknown) => void = () => {};
  const fatal: Promise<never> = new Promise<never>((_, reject) => (fail = reject));

  // Single flight: a pass already queued is not queued twice, so any number of wakes during a pass
  // give one following pass.
  const queue: Pass[] = ['pull --all', 'next --resume'];
  let running: boolean = true;
  const runPasses = async (): Promise<void> => {
    running = true;
    for (let pass: Pass | undefined = queue.shift(); pass !== undefined; pass = queue.shift()) {
      const argv: string[] = ['akrogon', ...pass.split(' ')];
      // Its own process group, so an overdue pass is killed with every command it started: none of them
      // may keep running past the locks the pass held.
      const child = Bun.spawn(argv, {
        env: process.env,
        stdin: 'ignore',
        stdout: 'inherit',
        stderr: 'inherit',
        detached: true,
      });
      const overdue = setTimeout(() => process.kill(-child.pid, 'SIGKILL'), PASS_DEADLINE_MS);
      const code: number = await child.exited;
      clearTimeout(overdue);
      if (code !== 0) retry(pass, { listen: 'pass failed', command: argv.join(' '), code, signal: child.signalCode });
    }
    running = false;
  };
  const enqueue = (pass: Pass): void => {
    if (!queue.includes(pass)) queue.push(pass);
    if (!running) runPasses().catch(fail);
  };

  // One pending retry at a time: any number of failures before it fires give one scan and each failed
  // pass once (a failed stream or scan retries with a resume pass).
  const retries: Set<Pass> = new Set();
  const retry = (pass: Pass, failure: Record<string, string | number | null>): void => {
    console.error(JSON.stringify({ ...failure, retry_ms: RETRY_MS }));
    if (retries.size === 0)
      setTimeout(() => {
        const due: Pass[] = [...retries];
        retries.clear();
        void scan();
        for (const again of due) enqueue(again);
      }, RETRY_MS);
    retries.add(pass);
  };

  // Watcher wakes run one after another so a burst of seat events does not race the watch lock.
  let wakes: Promise<void> = Promise.resolve();
  const wake = (name: string, reason: string): void => {
    const global: GlobalConfig = readGlobal();
    if (!Object.hasOwn(global.repos, name)) {
      console.error(JSON.stringify({ listen: 'watcher wake skipped: unknown repo', repo: name, reason }));
      return;
    }
    // The watcher is optional: a failed wake is logged and the engine carries on.
    wakes = wakes
      .then(() => wakeWatcher(readRepo(name, global.repos[name]), reason))
      .catch((error: unknown) =>
        console.error(JSON.stringify({ listen: 'watcher wake failed', repo: name, reason, error: String(error) })),
      );
  };

  const subscribed: Set<string> = new Set();
  const watched: Set<string> = new Set();

  const subscribe = (session: string): Promise<void> => {
    const labels: Map<string, Record<string, string>> = new Map();
    let snapshot: () => void = () => {};
    const ready: Promise<void> = new Promise<void>((done) => (snapshot = done));
    const onLine = (line: HcLine): void => {
      if ('terminals' in line) {
        for (const t of line.terminals) labels.set(t.address, t.labels);
        // A seat that ended while nothing listened wakes its repo's watcher once.
        const ended: Set<string> = new Set(
          line.terminals
            .filter((t: Seen) => t.state === 'finished' && t.labels['akrogon.seat'] !== undefined)
            .map((t: Seen) => t.labels['akrogon.repo']),
        );
        for (const repo of ended) wake(repo, `seat finished before subscription in ${session}`);
        clearTimeout(overdue);
        snapshot();
        // Every (re)subscription catches up: a seat may have ended its turn while nothing listened.
        enqueue('next --resume');
        return;
      }
      if (!('terminal' in line.params)) return;
      const { type, terminal, data } = line.params;
      if (type === 'created' || type === 'labels') labels.set(terminal, labelsSchema.parse(data).labels);
      const blocked: boolean = type === 'status' && statusSchema.parse(data).status?.state === 'blocked';
      if (type === 'turn' || blocked || type === 'finished' || type === 'lost') enqueue('next --wake');
      const seat: Record<string, string> | undefined = labels.get(terminal);
      if (seat?.['akrogon.seat'] !== undefined && (blocked || ['finished', 'lost', 'restarted'].includes(type)))
        wake(
          seat['akrogon.repo'],
          `seat ${seat['akrogon.leaf']}/${seat['akrogon.seat']} ${blocked ? 'blocked' : type}`,
        );
    };
    // Watched first: a socket gone since the scan throws here, before anything is started or marked.
    watchSocket(session);
    const stream = follow(session, ['--label', 'akrogon=1'], onLine);
    let late: boolean = false;
    const overdue = setTimeout(() => {
      late = true;
      stream.stop();
    }, SNAPSHOT_MS);
    subscribed.add(session);
    // A session that ended is rescanned at once (a restarted core resubscribes); a failed stream, or
    // one stopped for a missing snapshot, waits for the retry, so it cannot spin.
    stream.ended.then(
      () => {
        clearTimeout(overdue);
        subscribed.delete(session);
        snapshot();
        if (late) retry('next --resume', { listen: 'no first snapshot', session, snapshot_ms: SNAPSHOT_MS });
        else void scan();
      },
      (error: unknown) => {
        clearTimeout(overdue);
        subscribed.delete(session);
        snapshot();
        retry('next --resume', { listen: 'session stream failed', session, error: String(error) });
      },
    );
    return ready;
  };

  // A socket linked from elsewhere (a symlink) is replaced in its real directory, so that directory is
  // watched too.
  const watchDir = (dir: string): void => {
    if (watched.has(dir)) return;
    const watcher: FSWatcher = watch(dir, () => void scan());
    watcher.on('error', fail);
    watched.add(dir);
  };
  const watchSocket = (session: string): void => {
    const socket: string = resolve(socketDir, `${session}.sock`);
    if (lstatSync(socket).isSymbolicLink()) watchDir(dirname(realpathSync(socket)));
  };

  // Scans run one after another, so a session is never subscribed twice; each resolves once the
  // snapshots of the sessions it subscribed arrived.
  let scans: Promise<void> = Promise.resolve();
  const scan = (): Promise<void> => {
    const scanned: Promise<void> = scans.then(async (): Promise<void> => {
      const fresh: string[] = (await sessions()).live.filter((session: string) => !subscribed.has(session));
      await Promise.all(fresh.map((session: string) => subscribe(session)));
    });
    scans = scanned.catch((error: unknown) => retry('next --resume', { listen: 'scan failed', error: String(error) }));
    return scans;
  };

  // hc creates this folder with its first core; made here, a listener started first watches it at once.
  mkdirSync(socketDir, { recursive: true, mode: 0o700 });
  watchDir(socketDir);
  await Promise.race([scan(), fatal]);
  runPasses().catch(fail);
  await fatal;
}
