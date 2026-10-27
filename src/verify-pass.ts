import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome } from './config';
import { writeYaml } from './shell';
import type { LeafTarget } from './run-check';
import type { Phase } from './routing';

const namedCommandSchema = z.strictObject({ name: z.string(), command: z.string() });

export const passRecordSchema = z.strictObject({
  run: z.string(),
  repo: z.string(),
  root: z.string(),
  unit_name: z.string(),
  caller: z.strictObject({
    slug: z.string(),
    target: z.string(),
    scope: z.enum(['leaf', 'worker']),
    unit: z.string().optional(),
    phase: z.string().optional(),
    attempt: z.string().optional(),
  }),
  caller_scope: z.string(),
  sha: z.string(),
  tree: z.string(),
  scope: z.enum(['leaf', 'merge']),
  commands: z.array(namedCommandSchema),
  member_count: z.number().int(),
  setup: z.string(),
  akrogon_base: z.string(),
  compares: z.string().optional(),
  pid: z.number().int(),
  boot_id: z.string(),
  pending: z.boolean(),
  created: z.string(),
});

export type PassRecord = z.infer<typeof passRecordSchema>;

export function passCaller(record: PassRecord): LeafTarget {
  return {
    slug: record.caller.slug,
    target: record.caller.target,
    scope: record.caller.scope,
    ...(record.caller.unit === undefined ? {} : { unit: record.caller.unit }),
    ...(record.caller.phase === undefined ? {} : { phase: record.caller.phase as Phase }),
    ...(record.caller.attempt === undefined ? {} : { attempt: record.caller.attempt }),
  };
}

export function passesRoot(): string {
  return resolve(globalHome(), 'verify-passes');
}

export function passUnit(id: string): string {
  return `akrogon-verify-${id}`;
}

export function readPassRecord(dir: string): PassRecord | undefined {
  try {
    return passRecordSchema.parse(Bun.YAML.parse(readFileSync(resolve(dir, 'record.yaml'), 'utf8')));
  } catch {
    return undefined;
  }
}

export function writePassRecord(dir: string, record: PassRecord): void {
  writeYaml(resolve(dir, 'record.yaml'), record);
}

export function listPassRecords(): { dir: string; record: PassRecord }[] {
  const root: string = passesRoot();
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const dir: string = resolve(root, name);
    if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
    const record: PassRecord | undefined = readPassRecord(dir);
    return record === undefined ? [] : [{ dir, record }];
  });
}

export function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

export function bootId(): string {
  return existsSync('/proc/sys/kernel/random/boot_id')
    ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
    : '';
}

// A pending record is fresh while its service can still write its pid; a live
// record is the pass process itself. Anything else is dead and never joined.
const PENDING_MS: number = 30_000;

export function passLive(record: PassRecord): boolean {
  if (record.pending) return Date.now() - Date.parse(record.created) < PENDING_MS;
  return record.boot_id === bootId() && pidAlive(record.pid);
}
