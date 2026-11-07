// `akrogon listen` (plan D15): follows every live hc session's labelled terminals and runs engine
// passes as `akrogon` child processes, one at a time. A new or restarted session's socket is seen
// through fs.watch on the socket directories, never by polling.
import { dirname, resolve } from 'node:path';
import { lstatSync, realpathSync, watch, type FSWatcher } from 'node:fs';
import { z } from 'zod';
import { readGlobal, readRepo, type GlobalConfig } from './config';
import { follow, sessions, wakeWatcher, type HcLine, type Seen } from './hc';

type Pass = 'pull --all' | 'next --resume' | 'next --wake';

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
  const queue: Pass[] = [];
  let running: boolean = false;
  const runPasses = async (): Promise<void> => {
    running = true;
    for (let pass: Pass | undefined = queue.shift(); pass !== undefined; pass = queue.shift()) {
      const argv: string[] = ['akrogon', ...pass.split(' ')];
      const child = Bun.spawn(argv, { env: process.env, stdin: 'ignore', stdout: 'inherit', stderr: 'inherit' });
      const code: number = await child.exited;
      if (code !== 0) console.error(JSON.stringify({ listen: 'pass failed', command: argv, code }));
    }
    running = false;
  };
  const enqueue = (pass: Pass): void => {
    if (!queue.includes(pass)) queue.push(pass);
    if (!running) runPasses().catch(fail);
  };

  // Watcher wakes run one after another so a burst of seat events does not race the watch lock.
  let wakes: Promise<void> = Promise.resolve();
  const wake = (name: string, reason: string): void => {
    const global: GlobalConfig = readGlobal();
    if (!Object.hasOwn(global.repos, name)) {
      console.error(JSON.stringify({ listen: 'watcher wake skipped: unknown repo', repo: name, reason }));
      return;
    }
    wakes = wakes.then(() => wakeWatcher(readRepo(name, global.repos[name]), reason)).catch(fail);
  };

  const subscribed: Set<string> = new Set();
  const catchUp: Set<string> = new Set();
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
        snapshot();
        if (catchUp.delete(session)) enqueue('next --resume');
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
    const stream = follow(session, ['--label', 'akrogon=1'], onLine);
    subscribed.add(session);
    watchSocket(session);
    stream.ended.then(() => {
      subscribed.delete(session);
      catchUp.add(session);
      snapshot();
      void scan();
    }, fail);
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
    scans = scanned.catch(fail);
    return scans;
  };

  watchDir(socketDir);
  await Promise.race([scan(), fatal]);
  enqueue('pull --all');
  enqueue('next --resume');
  await fatal;
}
