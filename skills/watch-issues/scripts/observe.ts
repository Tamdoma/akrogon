#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readRepo, type Repo } from '../../../src/config';
import { repoSpace, type Seen, type SpaceResolution } from '../../../src/hc';
import { leafSeats, type Seats } from '../../../src/reconcile';
import { transcriptFor } from '../../../src/transcript';
import {
  repoInventory,
  RepoMismatchError,
  type Inventory,
  type Leaf,
  type LeafFailure,
  type State,
} from '../../../src/state';

type RunResult = { code: number; stdout: string; stderr: string };

async function run(argv: string[], cwd: string): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout: stdout.trimEnd(), stderr: stderr.trimEnd() };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function resolveRepoKey(root: string, bin: string): Promise<string> {
  let result: RunResult;
  try {
    result = await run([bin, 'config'], root);
  } catch (error) {
    throw new Error(`akrogon config failed to spawn ${bin}: ${messageOf(error)}`);
  }
  if (result.code !== 0) {
    throw new Error(`akrogon config failed: exit ${result.code} ${result.stderr} ${result.stdout}`.trim());
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(result.stdout);
  } catch (error) {
    throw new Error(`akrogon config returned invalid YAML: ${messageOf(error)}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('akrogon config has no usable repo: expected object with repo field');
  }
  const repo: unknown = (parsed as Record<string, unknown>).repo;
  if (repo === 'none') {
    throw new Error(`akrogon config reports repo "none": no registered repo for ${root}`);
  }
  if (typeof repo !== 'string' || repo.trim() === '') {
    throw new Error('akrogon config has no usable repo: missing or invalid repo field');
  }
  return repo;
}

// A finished seat or hc's keep shell (a lost program, status cleared) is absent; a live seat that never
// reported prints unknown.
function statusWord(t: Seen | undefined): string {
  if (t === undefined || t.state === 'finished' || (t.keep && t.status === null)) return '-';
  return t.status === null ? 'unknown' : t.status.state;
}

async function logPath(session: string, address: string): Promise<string> {
  const path: string | null = await transcriptFor({ session, address });
  return path !== null && existsSync(path) ? path : '-';
}

function ageSuffix(value: string | undefined, now: number): string {
  if (value === undefined) return '';
  const parsed: number = Date.parse(value);
  if (Number.isNaN(parsed)) return '';
  let diff: number = now - parsed;
  if (diff < 0) diff = 0;
  const h: number = Math.floor(diff / 3600000);
  const m: number = Math.floor((diff % 3600000) / 60000);
  return ` busy=${h}h${String(m).padStart(2, '0')}m`;
}

async function formatLeaf(leaf: Leaf, session: string, repo: Repo, now: number): Promise<string> {
  const s: State = leaf.state;
  const seats: Seats = await leafSeats(session, repo, s);
  const field = async (slot: 'A' | 'B'): Promise<string> => {
    const address: string = s.seat[slot]?.address ?? '-';
    const status: string = statusWord(seats[slot]);
    const log: string = status === 'working' ? ` log${slot}=${await logPath(session, address)}` : '';
    return `${slot}=${address}/${status}${ageSuffix(s.busy_since[slot], now)}${log}`;
  };
  const notified: string = (['A', 'B'] as const).filter((seat) => s.busy_notified[seat] !== undefined).join(',');
  const base: string = `slug=${s.slug} phase=${s.phase} attempts=A${s.attempts.A},B${s.attempts.B} blocked=${s['blocked-by'].join(',')} ${await field('A')} ${await field('B')} notified=${notified}`;
  if (s.phase !== 'failed') return base;
  if (s.failure === undefined) return `${base} failed=unknown`;
  return `${base} failed=${s.failure.cause}@${s.failure.phase} delivery=${s.failure.delivery ?? '-'} reason="${s.failure.reason}"`;
}

async function main(): Promise<void> {
  const root: string | undefined = process.argv[2];
  if (root === undefined || process.argv.length !== 3) {
    console.error('Usage: observe.ts <root>');
    process.exit(1);
  }
  const akrogonBin: string = process.env.OBSERVE_AKROGON ?? 'akrogon';
  const repoKey: string = await resolveRepoKey(root, akrogonBin);
  const repo: Repo = readRepo(repoKey, root);
  const resolved: SpaceResolution = await repoSpace(repo);
  if (!resolved.ok) throw new Error(resolved.reason);
  console.log(`session=${resolved.session}`);
  const inv: Inventory = repoInventory({ name: repoKey, root }, ['open']);
  const leaves: Leaf[] = inv.leaves;
  const failures: LeafFailure[] = [
    ...inv.unreadable.map((f): LeafFailure => ({
      path: resolve(f.path, 'state.yaml'),
      error: f.error.replaceAll('\n', ' '),
    })),
    ...inv.foreign.map((f): LeafFailure => ({
      path: resolve(f.path, 'state.yaml'),
      error: new RepoMismatchError(f.path, f.stored, repoKey).message,
    })),
    ...inv.unknown.map((f): LeafFailure => ({ path: f.path, error: f.error.replaceAll('\n', ' ') })),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const reportFailures = (): void => {
    for (const failure of failures) console.log(`unreadable=${failure.path} error=${failure.error}`);
  };
  if (leaves.length === 0) {
    reportFailures();
    return;
  }
  const now: number = Date.now();
  const sorted: Leaf[] = [...leaves].sort((a, b) => a.state.slug.localeCompare(b.state.slug));
  for (const leaf of sorted) {
    console.log(await formatLeaf(leaf, resolved.session, repo, now));
  }
  reportFailures();
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
