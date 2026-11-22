#!/usr/bin/env bun
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { leafSlice } from '../src/scope';

// The real systemctl for a case's real passes, with the akrogon-l*.slice listing cut to the slices
// of its own repo's leaves. The host step stops every listed slice that matches no leaf and holds no
// process; on the shared user manager those are other cases' slices, and their seats can join one
// between that check and the stop.
const args: string[] = process.argv.slice(2);
const real: Bun.SyncSubprocess<'pipe', 'inherit'> = Bun.spawnSync(
  [z.string().parse(process.env.OWN_SLICES_SYSTEMCTL), ...args],
  { stdout: 'pipe', stderr: 'inherit' },
);
if (!args.includes('list-units') || !args.includes('akrogon-l*.slice') || !real.success) {
  process.stdout.write(real.stdout);
  // A signaled systemctl dies by the same signal here, never reading as exit 0.
  if (real.signalCode !== undefined) process.kill(process.pid, real.signalCode);
  process.exit(real.exitCode);
}
const folders = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => [entry.name, ...folders(resolve(dir, entry.name))]);
const repo: string = z.string().parse(process.env.OWN_SLICES_REPO);
const own: Set<string> = new Set(
  folders(resolve(z.string().parse(process.env.OWN_SLICES_ROOT), 'issues')).map((slug: string) =>
    leafSlice({ name: repo }, slug),
  ),
);
const rows: { unit: string }[] = z
  .array(z.object({ unit: z.string() }).passthrough())
  .parse(JSON.parse(real.stdout.toString()));
process.stdout.write(JSON.stringify(rows.filter((row) => own.has(row.unit))));
