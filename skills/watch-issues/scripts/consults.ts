#!/usr/bin/env bun
// The watcher's mechanical consult-case gate (plan D1). `dir` prints the case root
// <stateHome>/watch/<repo>/consults and refuses one inside the watched repo; `new`
// allocates the next <anchor>-<seq> folder and records signature.json (anchor,
// cause@phase, failing command, base SHA at <remote>/<default_branch>, each named
// leaf's worktree HEAD, '-' when the leaf has none); `match` recomputes the same
// signature and reports the newest identical case: open / closed / clear; `close` ends a
// case: it removes the case's git worktrees, trims the folder to its record and writes `closed`.
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
  type Dirent,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, within } from '../../../src/config';
import { getTerm, isVerifiedTimer, timerWatcher } from './hc';
import { resolveRepoKey, run, watchTarget, withConsultantLock, type RunResult, type WatchTarget } from './repo';

const signatureSchema = z.strictObject({
  anchor: z.string(),
  cause: z.string(),
  phase: z.string(),
  command: z.string(),
  base: z.string(),
  heads: z.record(z.string(), z.string()),
});

type Signature = z.infer<typeof signatureSchema>;
type Flags = { anchor: string; cause: string; phase: string; command: string; leaves: string[] };
type Config = { repo: string; remote: string; branch: string };

function usage(): never {
  console.error('Usage: consults.ts dir <root>');
  console.error('       consults.ts start <root> <timer> <task>');
  console.error(
    '       consults.ts new <root> --anchor <slug|unknown> --cause <cause|unknown> --phase <phase|unknown> --command <text|-> [--leaf <slug>]...',
  );
  console.error('       consults.ts close <root> <case-dir>');
  console.error(
    '       consults.ts match <root> --anchor <slug|unknown> --cause <cause|unknown> --phase <phase|unknown> --command <text|-> [--leaf <slug>]...',
  );
  process.exit(1);
}

// Bare tokens are skipped (a Judge can only name flags); a missing signature flag
// records its unknown value, the same as passing it explicitly.
function parseFlags(argv: string[]): Flags {
  let anchor: string | undefined;
  let cause: string | undefined;
  let phase: string | undefined;
  let command: string | undefined;
  const leaves: string[] = [];
  for (let i: number = 0; i < argv.length; i++) {
    const name: string = argv[i];
    if (!name.startsWith('--')) continue;
    const value: string | undefined = argv[++i];
    if (value === undefined) throw new Error(`missing value for ${name}`);
    switch (name) {
      case '--anchor':
        anchor = value;
        break;
      case '--cause':
        cause = value;
        break;
      case '--phase':
        phase = value;
        break;
      case '--command':
        command = value;
        break;
      case '--leaf':
        leaves.push(value);
        break;
      default:
        throw new Error(`unknown flag ${name}`);
    }
  }
  return {
    anchor: anchor ?? 'unknown',
    cause: cause ?? 'unknown',
    phase: phase ?? 'unknown',
    command: command ?? '-',
    leaves,
  };
}

// One `akrogon config` call answers the repo name plus the remote and default branch
// the base SHA is read from; absent keys fall back to origin/main.
async function repoConfig(root: string): Promise<Config> {
  const bin: string = process.env.WATCH_AKROGON ?? 'akrogon';
  const result: RunResult = await run([bin, 'config'], root);
  if (result.code !== 0)
    throw new Error(`akrogon config failed: exit ${result.code} ${result.stderr} ${result.stdout}`.trim());
  const parsed: unknown = Bun.YAML.parse(result.stdout);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('akrogon config has no usable repo: expected object with repo field');
  const record: Record<string, unknown> = parsed as Record<string, unknown>;
  const repo: unknown = record.repo;
  if (repo === 'none') throw new Error(`akrogon config reports repo "none": no registered repo for ${root}`);
  if (typeof repo !== 'string' || repo.trim() === '')
    throw new Error('akrogon config has no usable repo: missing or invalid repo field');
  const text = (key: string, fallback: string): string => {
    const value: unknown = record[key];
    return typeof value === 'string' && value !== '' ? value : fallback;
  };
  return { repo, remote: text('remote', 'origin'), branch: text('default_branch', 'main') };
}

// The case root lives in the state home, never inside the watched repo (the repo would
// record itself). The same refusal gates all three verbs.
function consultsRoot(root: string, repo: string): string {
  const dir: string = resolve(globalHome(), 'watch', repo, 'consults');
  if (within(dir, realpathSync(root))) throw new Error('consults root inside the watched repo');
  return dir;
}

// Leaf worktrees are read from `git worktree list`, never by walking issues/ for
// state.yaml (tests/state-inventory forbids a second state walker): an akrogon leaf
// worktree is <store>/<slug>, so the worktree's basename is its slug.
async function leafWorktrees(root: string): Promise<Map<string, string>> {
  const found: Map<string, string> = new Map();
  const listed: RunResult = await run(['git', 'worktree', 'list', '--porcelain'], root);
  if (listed.code !== 0) throw new Error(`git worktree list failed: exit ${listed.code} ${listed.stderr}`.trim());
  for (const line of listed.stdout.split('\n')) {
    if (!line.startsWith('worktree ')) continue;
    const path: string = line.slice('worktree '.length);
    const slug: string = basename(path);
    if (!found.has(slug)) found.set(slug, path);
  }
  return found;
}

async function computeSignature(root: string, flags: Flags, config: Config): Promise<Signature> {
  const base: RunResult = await run(['git', 'rev-parse', `${config.remote}/${config.branch}`], root);
  if (base.code !== 0)
    throw new Error(`git rev-parse ${config.remote}/${config.branch} failed: exit ${base.code} ${base.stderr}`.trim());
  const worktrees: Map<string, string> = await leafWorktrees(root);
  const heads: Record<string, string> = {};
  for (const slug of flags.leaves) {
    const worktree: string | undefined = worktrees.get(slug);
    if (worktree === undefined) {
      heads[slug] = '-';
      continue;
    }
    const head: RunResult = await run(['git', 'rev-parse', 'HEAD'], worktree);
    if (head.code !== 0)
      throw new Error(`git rev-parse HEAD in ${worktree} failed: exit ${head.code} ${head.stderr}`.trim());
    heads[slug] = head.stdout;
  }
  return {
    anchor: flags.anchor,
    cause: flags.cause,
    phase: flags.phase,
    command: flags.command,
    base: base.stdout,
    heads,
  };
}

function identical(a: Signature, raw: unknown): boolean {
  const parsed: z.ZodSafeParseResult<Signature> = signatureSchema.safeParse(raw);
  if (!parsed.success) return false;
  const b: Signature = parsed.data;
  const sameHeads: boolean =
    Object.keys(a.heads).length === Object.keys(b.heads).length &&
    Object.entries(a.heads).every(([slug, head]) => b.heads[slug] === head);
  return (
    a.anchor === b.anchor &&
    a.cause === b.cause &&
    a.phase === b.phase &&
    a.command === b.command &&
    a.base === b.base &&
    sameHeads
  );
}

type Case = { dir: string; closed: boolean };

// Every case folder whose signature.json is identical to the current signature,
// newest first; a missing status file reads open.
function matchingCases(consults: string, current: Signature): Case[] {
  if (!existsSync(consults)) return [];
  const seq = (name: string): number => {
    const match: RegExpExecArray | null = /-(\d+)$/.exec(name);
    return match === null ? 0 : Number(match[1]);
  };
  const cases: Case[] = [];
  const dirs: Dirent[] = readdirSync(consults, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => seq(b.name) - seq(a.name));
  for (const entry of dirs) {
    const dir: string = resolve(consults, entry.name);
    const file: string = resolve(dir, 'signature.json');
    if (!existsSync(file)) continue;
    if (!identical(current, JSON.parse(readFileSync(file, 'utf8')))) continue;
    const statusFile: string = resolve(dir, 'status');
    const status: string = existsSync(statusFile) ? readFileSync(statusFile, 'utf8').trim() : 'open';
    cases.push({ dir, closed: status === 'closed' || status === 'resumed' });
  }
  return cases;
}

function verbNew(consults: string, signature: Signature): void {
  const anchor: string = signature.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing: RegExp = new RegExp(`^${anchor}-(\\d+)$`);
  let seq: number = 0;
  if (existsSync(consults))
    for (const entry of readdirSync(consults)) {
      const match: RegExpExecArray | null = existing.exec(entry);
      if (match !== null) seq = Math.max(seq, Number(match[1]));
    }
  mkdirSync(consults, { recursive: true });
  const dir: string = resolve(consults, `${signature.anchor}-${seq + 1}`);
  mkdirSync(dir);
  writeFileSync(resolve(dir, 'signature.json'), JSON.stringify(signature, null, 2) + '\n');
  process.stdout.write(dir);
}

function verbMatch(consults: string, current: Signature): void {
  const cases: Case[] = matchingCases(consults, current);
  const open: Case | undefined = cases.find((entry) => !entry.closed);
  if (open !== undefined) {
    process.stdout.write(`open ${open.dir}`);
  } else if (cases.length > 0) {
    process.stdout.write(`closed ${cases[0].dir}`);
  } else {
    process.stdout.write('clear');
  }
}

const RECORD_FILES: RegExp = /^(case\.md|signature\.json|status|turn-\d+-(watch|consultant)\.md)$/;

// Ends a case under the consultant lock so it cannot overlap a consultant start. Git's own
// refusal (modified or untracked files) stops the verb before anything else is deleted, and
// the status stays `open`.
async function verbClose(root: string, caseArg: string): Promise<void> {
  const key: { repo: string; prefix: string | null } = await resolveRepoKey(
    root,
    process.env.WATCH_AKROGON ?? 'akrogon',
  );
  const consults: string = consultsRoot(root, key.repo);
  const dir: string = resolve(caseArg);
  if (
    !existsSync(consults) ||
    !existsSync(dir) ||
    lstatSync(dir).isSymbolicLink() ||
    dirname(realpathSync(dir)) !== realpathSync(consults)
  )
    throw new Error(`${dir} is not a case folder under ${consults}`);
  const caseDir: string = realpathSync(dir);
  await withConsultantLock({ repo: key.repo }, async (): Promise<void> => {
    const linked: string | undefined = readdirSync(caseDir).find(
      (entry) => RECORD_FILES.test(entry) && lstatSync(resolve(caseDir, entry)).isSymbolicLink(),
    );
    if (linked !== undefined)
      throw new Error(`${resolve(caseDir, linked)} is a symlink: close writes only real record files`);
    const listed: RunResult = await run(['git', 'worktree', 'list', '--porcelain'], root);
    if (listed.code !== 0) throw new Error(`git worktree list failed: exit ${listed.code} ${listed.stderr}`.trim());
    const worktrees: string[] = listed.stdout
      .split('\n')
      .filter((line) => line.startsWith('worktree '))
      .map((line) => line.slice('worktree '.length))
      .filter((path) => path !== caseDir && within(path, caseDir));
    for (const path of worktrees) {
      const removed: RunResult = await run(['git', 'worktree', 'remove', path], root);
      if (removed.code !== 0)
        throw new Error(`git worktree remove ${path} failed: exit ${removed.code} ${removed.stderr}`.trim());
    }
    for (const entry of readdirSync(caseDir))
      if (!RECORD_FILES.test(entry)) rmSync(resolve(caseDir, entry), { recursive: true, force: true });
    // A temp file renamed over `status` gives it a new inode, so a hard link to the old one is untouched.
    const pending: string = resolve(caseDir, '.status.tmp');
    writeFileSync(pending, 'closed\n');
    renameSync(pending, resolve(caseDir, 'status'));
  });
}

async function startConsultant(root: string, address: string, task: string): Promise<void> {
  const caller: string | undefined = process.env.HC_TERMINAL_ID;
  if (!caller) throw new Error('consultant launch requires HC_TERMINAL_ID');
  const target: WatchTarget = await watchTarget(root);
  const result: RunResult = await withConsultantLock(target, async (): Promise<RunResult> => {
    const timer: Awaited<ReturnType<typeof getTerm>> = await getTerm(target.session, address);
    if (!timer.ok && timer.kind !== 'not_found') throw new Error(`timer ${address}: ${timer.kind}`);
    if (!timer.ok || timer.term.state !== 'live') return { code: 0, stdout: `stopped ${address}`, stderr: '' };
    if (
      timer.term.labels['akrogon.watch-timer'] !== target.repo ||
      !isVerifiedTimer(target.prefix, timer.term) ||
      timerWatcher(timer.term) !== caller
    )
      throw new Error(`timer ${address} does not belong to watcher ${caller} for ${target.repo}`);
    return run([process.env.WATCH_AKROGON ?? 'akrogon', 'seat', '--watch-consultant', '--task', task], root);
  });
  if (result.stdout !== '') console.log(result.stdout);
  if (result.stderr !== '') console.error(result.stderr);
  process.exitCode = result.code;
}

async function main(): Promise<void> {
  const verb: string | undefined = process.argv[2];
  const root: string | undefined = process.argv[3];
  if (verb === undefined || root === undefined) usage();
  if (verb === 'start') {
    const timer: string | undefined = process.argv[4];
    const task: string | undefined = process.argv[5];
    if (process.argv.length !== 6 || !timer || !task) usage();
    return startConsultant(root, timer, task);
  }
  if (verb === 'dir') {
    if (process.argv.length !== 4) usage();
    const { repo }: { repo: string; prefix: string | null } = await resolveRepoKey(
      root,
      process.env.WATCH_AKROGON ?? 'akrogon',
    );
    process.stdout.write(consultsRoot(root, repo));
    return;
  }
  if (verb === 'close') {
    const caseDir: string | undefined = process.argv[4];
    if (process.argv.length !== 5 || !caseDir) usage();
    return verbClose(root, caseDir);
  }
  if (verb !== 'new' && verb !== 'match') usage();
  const flags: Flags = parseFlags(process.argv.slice(4));
  const config: Config = await repoConfig(root);
  const consults: string = consultsRoot(root, config.repo);
  const signature: Signature = await computeSignature(root, flags, config);
  if (verb === 'new') verbNew(consults, signature);
  else verbMatch(consults, signature);
}

if (import.meta.main) {
  const verb: string = process.argv[2] ?? '';
  try {
    await main();
  } catch (error) {
    console.error(`consults ${verb}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
