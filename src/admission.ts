import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome } from './config';
import { procRoot, runUnitBase, stopRunUnits } from './scope';
import { withLock } from './state';

export interface AdmissionHolder {
  repo: string;
  leaf: string;
  check: string;
  run: string;
  slice: string;
  scope: string;
  unit: string;
  full: boolean;
}

export type Admission =
  | { kind: 'held'; token: string; wait_ms: number; record_path: string; release: () => void }
  | { kind: 'nested'; token: string };

const recordSchema = z.object({
  token_hash: z.string(),
  pid: z.number().int(),
  start_time: z.string(),
  boot_id: z.string(),
  repo: z.string(),
  leaf: z.string(),
  check: z.string(),
  state: z.enum(['waiting', 'live', 'ended']),
  run: z.string(),
  slice: z.string(),
  scope: z.string(),
  unit: z.string(),
  full: z.boolean().default(false),
  since: z.iso.datetime(),
});
export type RunRecord = z.infer<typeof recordSchema>;

const runsDir = (): string => resolve(globalHome(), 'runs');
const bootId = (): string => readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();

// The state-home move takes the home's admission.lock exclusively, so no
// admission straddles it: each one lands wholly in the old home or the new.
export async function withAdmissionLock<T>(slice: string, action: () => Promise<T>): Promise<T> {
  mkdirSync(resolve(runsDir(), 'locks'), { recursive: true });
  return withLock(
    resolve(globalHome(), 'admission.lock'),
    () => withLock(resolve(runsDir(), 'locks', slice), action),
    'shared',
  );
}

// Field 22 of /proc/<pid>/stat. The command name in field 2 may hold spaces, so split after the last ')'.
function startTime(pid: number): string {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

export function liveStartTime(pid: number): string | undefined {
  try {
    return startTime(pid);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

const recordPath = (hash: string): string => resolve(runsDir(), `${hash}.yaml`);

function writeRecord(record: RunRecord): void {
  const path: string = recordPath(record.token_hash);
  const temp: string = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, Bun.YAML.stringify(record));
  renameSync(temp, path);
}

function readRecord(path: string): RunRecord | undefined {
  try {
    return recordSchema.parse(Bun.YAML.parse(readFileSync(path, 'utf8')));
  } catch {
    return undefined;
  }
}

const live = (record: RunRecord, boot: string): boolean =>
  record.boot_id === boot && liveStartTime(record.pid) === record.start_time;

function nested(token: string): boolean {
  const hash: string = createHash('sha256').update(token).digest('hex');
  const record: RunRecord | undefined = readRecord(recordPath(hash));
  return record !== undefined && record.token_hash === hash && record.state === 'live' && live(record, bootId());
}

export function liveRuns(): RunRecord[] {
  const dir: string = runsDir();
  if (!existsSync(dir)) return [];
  const boot: string = bootId();
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .flatMap((name) => {
      const record: RunRecord | undefined = readRecord(resolve(dir, name));
      return record !== undefined && record.state === 'live' && live(record, boot) ? [record] : [];
    });
}

// Full suites from every repo, oldest first: holders (live or ended, whose
// units may still be stopping) before waiters. Only one holder runs at a time.
export function fullSuites(): RunRecord[] {
  const dir: string = runsDir();
  if (!existsSync(dir)) return [];
  const boot: string = bootId();
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml'))
    .flatMap((name) => {
      const record: RunRecord | undefined = readRecord(resolve(dir, name));
      return record !== undefined && record.full && live(record, boot) ? [record] : [];
    })
    .sort(
      (a, b) =>
        Number(a.state === 'waiting') - Number(b.state === 'waiting') ||
        a.since.localeCompare(b.since) ||
        a.token_hash.localeCompare(b.token_hash),
    );
}

const fullLock = (): string => resolve(runsDir(), 'locks', 'full-suite');
const POLL_MS: number = 1000;

// A full suite waits until it is the oldest full suite on the host. The turn
// check and the switch to live share one exclusive lock, so two waiters never
// both start.
async function awaitFullTurn(record: RunRecord): Promise<void> {
  let shown: string = '';
  for (;;) {
    const started: boolean = await withAdmissionLock(record.slice, () =>
      withLock(fullLock(), async (): Promise<boolean> => {
        if (!existsSync(recordPath(record.token_hash))) writeRecord(record);
        const [first]: RunRecord[] = fullSuites();
        if (first.token_hash !== record.token_hash) {
          const holder: string = `${first.repo}/${first.leaf} ${first.check}`;
          if (holder !== shown) process.stderr.write(`waiting for full suite ${holder}\n`);
          shown = holder;
          return false;
        }
        writeRecord({ ...record, state: 'live' });
        return true;
      }),
    );
    if (started) return;
    await Bun.sleep(POLL_MS);
  }
}

// Records whose writer is gone (or whose file is unreadable) are stale: drop
// the file and best-effort stop the units it left behind. Hashes in skip name
// records the caller still owns.
async function sweepStale(skip: ReadonlySet<string>): Promise<void> {
  const dir: string = runsDir();
  if (!existsSync(dir)) return;
  const boot: string = bootId();
  const units: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.yaml') || skip.has(name.slice(0, -'.yaml'.length))) continue;
    const path: string = resolve(dir, name);
    const record: RunRecord | undefined = readRecord(path);
    if (record !== undefined && live(record, boot)) continue;
    rmSync(path, { force: true });
    if (record !== undefined) units.push(record.unit, `${runUnitBase(record.run)}-guard.service`);
  }
  await stopRunUnits(...units);
}

export function callerScope(): string {
  const token: string | undefined = process.env.AKROGON_RUN;
  if (token !== undefined && token !== '') {
    const hash: string = createHash('sha256').update(token).digest('hex');
    const record: RunRecord | undefined = readRecord(recordPath(hash));
    if (record !== undefined && live(record, bootId())) return record.scope;
  }
  const selfCgroup: string = resolve(procRoot(), 'self', 'cgroup');
  if (!existsSync(selfCgroup)) return '';
  const scopes: string[] = [...readFileSync(selfCgroup, 'utf8').matchAll(/\/([^/]+\.scope)/g)].map((match) => match[1]);
  return scopes[scopes.length - 1] ?? '';
}

// Admission registers the run and starts it at once: the memory reading, the
// 48 GiB limit, per-run reservations and the 30 s start spacing were dropped
// by the operator on 2026-10-14 (run-units brief criterion 5). The one bound is
// for runs the repo marks `full`: they start one at a time host-wide, in
// arrival order (operator 2026-10-24, host-run-load).
export async function withAdmission<T>(holder: AdmissionHolder, fn: (admission: Admission) => Promise<T>): Promise<T> {
  const inherited: string | undefined = process.env.AKROGON_RUN;
  if (inherited !== undefined && inherited !== '' && nested(inherited)) return fn({ kind: 'nested', token: inherited });
  mkdirSync(runsDir(), { recursive: true });
  const token: string = randomUUID();
  const ownHash: string = createHash('sha256').update(token).digest('hex');
  await sweepStale(
    new Set([
      ownHash,
      ...(inherited === undefined || inherited === '' ? [] : [createHash('sha256').update(inherited).digest('hex')]),
    ]),
  );
  const record: RunRecord = {
    token_hash: ownHash,
    pid: process.pid,
    start_time: startTime(process.pid),
    boot_id: bootId(),
    ...holder,
    state: holder.full ? 'waiting' : 'live',
    since: new Date().toISOString(),
  };
  const begun: number = Date.now();
  try {
    if (holder.full) await awaitFullTurn(record);
    else
      await withAdmissionLock(holder.slice, async (): Promise<void> => {
        writeRecord(record);
      });
    process.stderr.write(`run ${holder.run}\n`);
    let ended: boolean = false;
    return await fn({
      kind: 'held',
      token,
      wait_ms: Date.now() - begun,
      record_path: recordPath(record.token_hash),
      release: () => {
        if (!ended) writeRecord({ ...record, state: 'ended' });
        ended = true;
      },
    });
  } finally {
    rmSync(recordPath(record.token_hash), { force: true });
  }
}
