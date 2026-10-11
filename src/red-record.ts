import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { type Repo } from './config';
import { isAncestor } from './batch';
import { type Comparison } from './compare';

const unitIdentitySchema = z.strictObject({
  runner: z.string(),
  file: z.string(),
  name: z.string(),
});

const provenanceSchema = z.strictObject({
  command: z.array(z.string()),
  cwd: z.string(),
  scope: z.string(),
  material: z.string(),
});

export const redEventSchema = z.discriminatedUnion('event', [
  z.strictObject({
    event: z.literal('opened'),
    id: z.string(),
    repo: z.string(),
    unit: unitIdentitySchema,
    provenance: provenanceSchema,
    first_seen: z.string(),
    at: z.string(),
    file: z.string(),
  }),
  z.strictObject({
    event: z.literal('resolved'),
    id: z.string(),
    resolving: z.string(),
    at: z.string(),
    file: z.string(),
  }),
  z.strictObject({
    event: z.literal('notice'),
    id: z.string(),
    shown: z.boolean().optional(),
    reason: z.string().optional(),
    error: z.string().optional(),
    at: z.string(),
  }),
]);

export type RedEvent = z.infer<typeof redEventSchema>;

export type NoticeResult = { shown: boolean; reason: string } | { error: string };

export type RedEntry = {
  id: string;
  unit: { runner: string; file: string; name: string };
  provenance: { command: string[]; cwd: string; scope: string; material: string };
  first_seen: string;
  at: string;
  file: string;
  notice?: NoticeResult;
};

export function redRecordsPath(repo: Repo): string {
  return resolve(repo.root, 'issues/red-records.jsonl');
}

export function readRedRecords(repo: Repo): RedEvent[] {
  const file: string = redRecordsPath(repo);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => redEventSchema.parse(JSON.parse(line)));
}

export function activeRed(repo: Repo): RedEntry[] {
  const entries: RedEntry[] = [];
  const open: Map<string, RedEntry> = new Map();
  for (const event of readRedRecords(repo)) {
    if (event.event === 'opened') {
      const entry: RedEntry = {
        id: event.id,
        unit: event.unit,
        provenance: event.provenance,
        first_seen: event.first_seen,
        at: event.at,
        file: event.file,
      };
      entries.push(entry);
      open.set(entry.id, entry);
    } else if (event.event === 'resolved') {
      const entry: RedEntry | undefined = open.get(event.id);
      if (entry !== undefined) {
        open.delete(event.id);
        entries.splice(entries.indexOf(entry), 1);
      }
    } else {
      const entry: RedEntry | undefined = open.get(event.id);
      if (entry === undefined) continue;
      entry.notice =
        event.error !== undefined
          ? { error: event.error }
          : { shown: event.shown ?? false, reason: event.reason ?? '' };
    }
  }
  return entries;
}

function provenanceOf(record: Comparison): { command: string[]; cwd: string; scope: string; material: string } {
  return { command: record.command, cwd: record.cwd, scope: record.scope, material: record.material };
}

function sameIdentity(entry: RedEntry, unit: { runner: string; file: string; name: string }): boolean {
  return entry.unit.runner === unit.runner && entry.unit.file === unit.file && entry.unit.name === unit.name;
}

function sameProvenance(
  entry: RedEntry,
  provenance: { command: string[]; cwd: string; scope: string; material: string },
): boolean {
  return (
    entry.provenance.cwd === provenance.cwd &&
    entry.provenance.scope === provenance.scope &&
    entry.provenance.material === provenance.material &&
    JSON.stringify(entry.provenance.command) === JSON.stringify(provenance.command)
  );
}

export function applyComparison(repo: Repo, file: string, record: Comparison): RedEntry[] {
  const entries: RedEntry[] = [];
  if (record.state !== 'compared') return entries;
  const provenance: { command: string[]; cwd: string; scope: string; material: string } = provenanceOf(record);
  for (const unit of record.units) {
    if (unit.verdict !== 'known-red' || unit.own_criterion === true) continue;
    const active: RedEntry | undefined = activeRed(repo).find(
      (entry) => sameIdentity(entry, unit) && sameProvenance(entry, provenance),
    );
    if (active !== undefined) continue;
    const event: RedEvent = redEventSchema.parse({
      event: 'opened',
      id: randomUUID(),
      repo: repo.name,
      unit: { runner: unit.runner, file: unit.file, name: unit.name },
      provenance,
      first_seen: record.counterpart_revision,
      at: new Date().toISOString(),
      file,
    });
    appendFileSync(redRecordsPath(repo), JSON.stringify(event) + '\n');
    if (event.event === 'opened')
      entries.push({
        id: event.id,
        unit: event.unit,
        provenance: event.provenance,
        first_seen: event.first_seen,
        at: event.at,
        file: event.file,
      });
  }
  return entries;
}

export async function resolveComparison(repo: Repo, file: string, record: Comparison): Promise<void> {
  if (record.state !== 'compared') return;
  const provenance: { command: string[]; cwd: string; scope: string; material: string } = provenanceOf(record);
  const resolved: Set<string> = new Set();
  for (const unit of record.units) {
    if (unit.base.outcome !== 'pass') continue;
    const entry: RedEntry | undefined = activeRed(repo).find(
      (candidate) =>
        !resolved.has(candidate.id) && sameIdentity(candidate, unit) && sameProvenance(candidate, provenance),
    );
    if (entry === undefined) continue;
    if (
      entry.first_seen !== record.counterpart_revision &&
      !(await isAncestor(repo.root, entry.first_seen, record.counterpart_revision))
    )
      continue;
    const event: RedEvent = redEventSchema.parse({
      event: 'resolved',
      id: entry.id,
      resolving: record.counterpart_revision,
      at: new Date().toISOString(),
      file,
    });
    appendFileSync(redRecordsPath(repo), JSON.stringify(event) + '\n');
    resolved.add(entry.id);
  }
}

export function appendNotice(repo: Repo, id: string, result: NoticeResult): void {
  const event: RedEvent = redEventSchema.parse({
    event: 'notice',
    id,
    ...result,
    at: new Date().toISOString(),
  });
  appendFileSync(redRecordsPath(repo), JSON.stringify(event) + '\n');
}
