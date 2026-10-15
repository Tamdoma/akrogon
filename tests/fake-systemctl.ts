#!/usr/bin/env bun
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

// Test seam for the user manager: units and cgroup paths come from
// FAKE_SYSTEMCTL_DB, every call appends argv to FAKE_SYSTEMCTL_LOG.
const unitSchema = z.object({ unit: z.string(), sub: z.string(), cgroup: z.string().optional() });
const databaseSchema = z.object({ units: z.array(unitSchema) });
type Database = z.infer<typeof databaseSchema>;

const path: string = z.string().parse(process.env.FAKE_SYSTEMCTL_DB);
const db: Database = databaseSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
const args: string[] = process.argv.slice(2);
if (process.env.FAKE_SYSTEMCTL_LOG !== undefined)
  appendFileSync(z.string().parse(process.env.FAKE_SYSTEMCTL_LOG), args.join(' ') + '\n');

function save(): void {
  writeFileSync(path, JSON.stringify(db));
}

function glob(name: string, pattern: string): boolean {
  if (!pattern.endsWith('*')) return name === pattern;
  return name.startsWith(pattern.slice(0, -1));
}

const verb: string | undefined = args.find((arg) => !arg.startsWith('-') && !arg.includes('=') && arg !== 'user');
if (args[0] !== '--user') throw new Error(`Unexpected systemctl call: ${JSON.stringify(args)}`);

if (verb === 'list-units') {
  const pattern: string | undefined = args.find((arg) => arg.includes('*'));
  const rows = db.units
    .filter((unit) => pattern === undefined || glob(unit.unit, pattern))
    .map((unit) => ({ unit: unit.unit, load: 'loaded', active: unit.sub === 'failed' ? 'failed' : 'active', sub: unit.sub, description: '' }));
  console.log(JSON.stringify(rows));
  process.exit(0);
}

if (verb === 'show') {
  const unit: string = z.string().parse(args.find((arg) => arg.endsWith('.slice') || arg.endsWith('.scope')));
  const found = db.units.find((item) => item.unit === unit);
  if (found === undefined) {
    console.error(`Failed to show unit: Unit ${unit} not found.`);
    process.exit(1);
  }
  const pi: number = args.indexOf('-p');
  const name: string | undefined = pi === -1 ? undefined : args[pi + 1];
  if (args.includes('--value')) console.log(name === 'ControlGroup' ? (found.cgroup ?? '') : '');
  else console.log(`ControlGroup=${found.cgroup ?? ''}`);
  process.exit(0);
}

if (verb === 'stop' || verb === 'reset-failed') {
  const names: string[] = args.filter((arg) => arg.includes('.') && !arg.startsWith('-'));
  const missing: string[] = names.filter((name) => !db.units.some((unit) => unit.unit === name));
  if (missing.length > 0 && verb === 'stop') {
    console.error(`Failed to stop ${missing[0]}: Unit ${missing[0]} not loaded.`);
    process.exit(5);
  }
  db.units = db.units.filter((unit) => !names.includes(unit.unit));
  save();
  process.exit(0);
}

console.log('');
process.exit(0);
