import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { base, readGlobal, requireRepo, setupCommand, worktreeStore, type Repo, type RepoConfig } from './config';
import { failedTests } from './flaky';
import { checkLocation } from './guard';
import { createSparseWorktree, emitEnvFile } from './next';
import { trackingRef } from './preflight';
import { checkedRun, leafFields, leafTarget, refuse, type LeafTarget } from './run-check';
import { command, herdr, repoSession, type SessionResolution } from './shell';
import { allLeaves, withLock, type Leaf } from './state';
import { isAncestor } from './batch';

const verifyScopeSchema = z.enum(['leaf', 'merge']);

export type VerifyScope = z.infer<typeof verifyScopeSchema>;

export const verifyRunSchema = z.strictObject({
  run: z.string(),
  repo: z.string(),
  leaf: z.string(),
  sha: z.string(),
  tree: z.string(),
  scope: verifyScopeSchema,
  compares: z.string().optional(),
  notice: z.string().optional(),
  path: z.string(),
  pid: z.number().int(),
  boot_id: z.string(),
  setup: z.number().int().optional(),
  commands: z.array(
    z.strictObject({
      name: z.string(),
      command: z.string(),
      exit: z.number().int(),
      log: z.string(),
      reused: z.string().optional(),
      blocked: z.string().optional(),
    }),
  ),
  start: z.string(),
  end: z.string().optional(),
});

export type VerifyRun = z.infer<typeof verifyRunSchema>;

type NamedCommand = { name: string; command: string };

function recordsPath(repo: Repo): string {
  return resolve(repo.root, 'issues/verify-runs.jsonl');
}

export function readVerifyRuns(repo: Repo): VerifyRun[] {
  const file: string = recordsPath(repo);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => verifyRunSchema.parse(JSON.parse(line)));
}

export function verifyCommands(config: RepoConfig, scope: VerifyScope): NamedCommand[] {
  const checks: [string, string][] = Object.entries(config.checks).filter(
    ([name]) => scope === 'leaf' || !config.merge_covers.includes(name),
  );
  return [...checks, ...(scope === 'merge' ? Object.entries(config.merge_checks) : [])].map(([name, command]) => ({
    name,
    command,
  }));
}

function treeOf(repo: Repo, sha: string): Promise<string> {
  return command(['git', 'rev-parse', `${sha}^{tree}`], repo.root);
}

function sameCommands(actual: VerifyRun['commands'], expected: NamedCommand[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every((item, index) => item.name === expected[index].name && item.command === expected[index].command)
  );
}

function completed(run: VerifyRun): boolean {
  return run.end !== undefined && run.setup === 0;
}

function newest(runs: VerifyRun[]): VerifyRun | undefined {
  return [...runs].sort((a, b) => b.end!.localeCompare(a.end!))[0];
}

// A run that finished with setup passing, under the current command set, and holds at least one failing command.
function redRun(repo: Repo, tree: string, scope: VerifyScope): VerifyRun | undefined {
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  return newest(
    readVerifyRuns(repo).filter(
      (run) =>
        run.tree === tree &&
        completed(run) &&
        sameCommands(run.commands, expected) &&
        run.commands.some((item) => item.exit !== 0),
    ),
  );
}

function greenRun(repo: Repo, tree: string, scope: VerifyScope): VerifyRun | undefined {
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  return readVerifyRuns(repo).find(
    (run) =>
      run.tree === tree &&
      completed(run) &&
      sameCommands(run.commands, expected) &&
      run.commands.every((item) => item.exit === 0),
  );
}

// A failed test name stands in for "no names" when the log is missing or names none.
const noTestNames: readonly string[] = ['(no test name)', '(log gone)'];

function greenEntry(run: VerifyRun, item: NamedCommand): VerifyRun['commands'][number] | undefined {
  return run.commands.find((entry) => entry.name === item.name && entry.command === item.command && entry.exit === 0);
}

// The newest completed run on the same tree and scope holding {name, command} green lends its entry.
function reuseSource(runs: VerifyRun[], tree: string, scope: VerifyScope, item: NamedCommand): VerifyRun | undefined {
  return newest(
    runs.filter(
      (run) => run.tree === tree && run.scope === scope && completed(run) && greenEntry(run, item) !== undefined,
    ),
  );
}

// Per expected command, a head red is covered when a completed head run holds it red with every
// failed name extractable and a completed base run comparing to that head holds the same command
// red failing all those names. A base entry at exit 0 never covers; pairs may differ per command.
async function knownRedReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<boolean> {
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  const tree: string = await treeOf(repo, sha);
  const heads: VerifyRun[] = runs.filter((run) => run.tree === tree && run.scope === scope && completed(run));
  if (heads.length === 0) return false;
  const mergeBase: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  for (const item of expected) {
    const entryOf = (run: VerifyRun): VerifyRun['commands'][number] | undefined =>
      run.commands.find((entry) => entry.name === item.name && entry.command === item.command);
    if (heads.some((run) => entryOf(run)?.exit === 0)) continue;
    const covered: boolean = await (async () => {
      for (const head of heads) {
        const red: VerifyRun['commands'][number] | undefined = entryOf(head);
        if (red === undefined || red.exit === 0 || red.blocked !== undefined) continue;
        const names: string[] = await failedTests(repo, red.log);
        if (names.some((name) => noTestNames.includes(name))) continue;
        for (const baseRun of runs.filter(
          (run) => run.compares === head.run && run.sha === mergeBase && run.scope === scope && completed(run),
        )) {
          const onBase: VerifyRun['commands'][number] | undefined = entryOf(baseRun);
          if (onBase === undefined || onBase.exit === 0 || onBase.blocked !== undefined) continue;
          const baseNames: string[] = await failedTests(repo, onBase.log);
          if (names.every((name) => baseNames.includes(name))) return true;
        }
      }
      return false;
    })();
    if (!covered) return false;
  }
  return true;
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function bootId(): string {
  return existsSync('/proc/sys/kernel/random/boot_id')
    ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
    : '';
}

// A reservation covers only while its process lives on this boot; `error` never covers.
function noticeCovers(run: VerifyRun, boot: string): boolean {
  if (run.notice === undefined || run.notice === 'error') return false;
  return run.notice !== 'pending' || (run.boot_id === boot && pidAlive(run.pid));
}

// Identity is scope + command name and string + failing test name; sha is evidence, not identity.
type Unit = { scope: VerifyScope; name: string; command: string; test: string };

function matching(run: VerifyRun, unit: Unit): VerifyRun['commands'][number] | undefined {
  return run.scope === unit.scope
    ? run.commands.find(
        (item) => item.name === unit.name && item.command === unit.command && item.blocked === undefined,
      )
    : undefined;
}

// A green observation is a completed record with the unit's command green whose sha sits on landed
// main; a red observation R resolves when a green observation lands at or after R's sha.
async function newRedUnits(repo: Repo, me: VerifyRun, runs: VerifyRun[]): Promise<string[]> {
  const boot: string = bootId();
  const tip: string = await command(['git', 'rev-parse', trackingRef(repo)], repo.root);
  const landed: Map<string, boolean> = new Map();
  const onMain = async (sha: string): Promise<boolean> => {
    if (!landed.has(sha)) landed.set(sha, await isAncestor(repo.root, sha, tip));
    return landed.get(sha)!;
  };
  const covers: Map<string, boolean> = new Map();
  const redOrGreen = async (red: string, green: string): Promise<boolean> => {
    const key: string = `${red}\0${green}`;
    if (!covers.has(key)) covers.set(key, await isAncestor(repo.root, red, green));
    return covers.get(key)!;
  };
  const units: Unit[] = [];
  for (const item of me.commands) {
    if (item.exit === 0 || item.reused !== undefined || item.blocked !== undefined) continue;
    for (const test of await failedTests(repo, item.log))
      units.push({ scope: me.scope, name: item.name, command: item.command, test });
  }
  const fresh: string[] = [];
  for (const unit of units) {
    let covered: boolean = false;
    for (const run of runs) {
      if (run.run === me.run || !completed(run)) continue;
      const item = matching(run, unit);
      if (item === undefined) continue;
      if (item.reused !== undefined) continue;
      if (item.exit === 0) continue;
      if (run.compares === undefined) continue;
      if (!(await failedTests(repo, item.log)).includes(unit.test)) continue;
      const resolved: boolean = await (async () => {
        for (const green of runs) {
          if (!completed(green)) continue;
          if (green.end! <= run.end!) continue;
          const hit = matching(green, unit);
          if (hit === undefined || hit.exit !== 0 || hit.reused !== undefined) continue;
          if (!(await onMain(green.sha))) continue;
          if (await redOrGreen(run.sha, green.sha)) return true;
        }
        return false;
      })();
      if (!resolved && noticeCovers(run, boot)) {
        covered = true;
        break;
      }
    }
    if (!covered) fresh.push(unit.test);
  }
  return [...new Set(fresh)];
}

const noticeSchema = z.object({ shown: z.boolean(), reason: z.string() });

// The reply reason or `error` replaces the pending reservation; a failed send only prints.
async function sendMainRedNotice(repo: Repo, runId: string, lock: string, names: string[]): Promise<void> {
  const args: string[] = [
    'notification',
    'show',
    `${repo.name} main red`,
    '--body',
    `${names.length} new red on main: ${names.slice(0, 3).join(', ')}; receipt ${runId}; chart a repair`,
    '--sound',
    'none',
  ];
  let delivery: string = 'error';
  try {
    const resolved: SessionResolution = await repoSession(repo);
    if (!resolved.ok) throw new Error(resolved.reason);
    delivery = (await herdr(args, noticeSchema, { session: resolved.session.name })).reason;
  } catch (error) {
    process.stderr.write(`notice: ${error instanceof Error ? error.message : String(error)}\n`);
  }
  await withLock(lock, async () => {
    const file: string = recordsPath(repo);
    const runs: VerifyRun[] = readVerifyRuns(repo);
    const index: number = runs.findIndex((run) => run.run === runId);
    if (index === -1) return;
    runs[index] = { ...runs[index], notice: delivery };
    const temporary: string = `${file}.${process.pid}.tmp`;
    writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
    renameSync(temporary, file);
  });
}

export async function requireGreenReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<void> {
  const tree: string = await treeOf(repo, sha);
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const onTree: VerifyRun[] = runs.filter((run) => run.tree === tree && run.scope === scope && completed(run));
  const green: boolean =
    onTree.length > 0 &&
    verifyCommands(repo.config, scope).every((item) => onTree.some((run) => greenEntry(run, item) !== undefined));
  if (!green && !(await knownRedReceipt(repo, sha, scope)))
    throw new Error(
      `No green ${scope} verify receipt for ${sha} under the current config; run akrogon verify on this commit`,
    );
}

async function recordLock(repo: Repo): Promise<string> {
  return resolve(repo.root, await command(['git', 'rev-parse', '--git-path', 'akrogon-verify-runs.lock'], repo.root));
}

async function verifyCaller(
  repo: Repo,
  cwd: string,
  attempt: string | undefined,
  holder: string | undefined,
): Promise<{ caller: LeafTarget; cwd: string }> {
  if (attempt === undefined) return { caller: await leafTarget(repo, cwd, undefined, holder), cwd };
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) => item.state.batch?.attempt === attempt && item.state.phase === 'merge',
  );
  if (leaf === undefined) throw new Error(`No merge leaf for attempt: ${attempt}`);
  return {
    caller: { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') },
    cwd: leaf.state.worktree ?? cwd,
  };
}

async function runOnce(
  repo: Repo,
  caller: LeafTarget,
  sha: string,
  scope: VerifyScope,
  akrogonBase: string,
  compares?: string,
): Promise<VerifyRun> {
  const tree: string = await treeOf(repo, sha);
  const id: string = randomUUID();
  const target: string = resolve(worktreeStore(repo), `verify-${id}`);
  checkLocation(target);
  const lock: string = await recordLock(repo);
  mkdirSync(caller.target, { recursive: true });
  const record: VerifyRun = {
    run: id,
    repo: repo.name,
    leaf: caller.slug,
    sha,
    tree,
    scope,
    ...(compares === undefined ? {} : { compares }),
    path: target,
    pid: process.pid,
    boot_id: existsSync('/proc/sys/kernel/random/boot_id')
      ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
      : '',
    commands: [],
    start: new Date().toISOString(),
  };
  await withLock(lock, async () => {
    appendFileSync(recordsPath(repo), JSON.stringify(record) + '\n');
  });
  const ran: VerifyRun['commands'] = [];
  let setupExit: number | undefined;
  let end: string | undefined;
  let send: string[] = [];
  try {
    await createSparseWorktree(repo, target, sha, { detach: true });
    await emitEnvFile(repo, target, repo.config.env);
    const setup: { code: number; log: string } = await checkedRun(
      repo,
      caller,
      akrogonBase,
      'setup',
      ['sh', '-c', setupCommand(repo.config, 'true')],
      target,
    );
    setupExit = setup.code;
    process.stdout.write(`verify setup: ${setup.code} ${setup.log}\n`);
    const expected: NamedCommand[] = verifyCommands(repo.config, scope);
    const members: NamedCommand[] =
      scope === 'merge' ? expected.slice(expected.length - Object.keys(repo.config.merge_checks).length) : [];
    const sequential: NamedCommand[] = expected.slice(0, expected.length - members.length);
    const ledger: VerifyRun[] = readVerifyRuns(repo);
    for (const item of sequential) {
      if (setup.code !== 0) {
        ran.push({ ...item, exit: setup.code, log: setup.log });
        process.stdout.write(`verify ${item.name}: ${setup.code} ${setup.log}\n`);
        continue;
      }
      const source: VerifyRun | undefined = reuseSource(ledger, tree, scope, item);
      if (source === undefined) {
        const { code, log }: { code: number; log: string } = await checkedRun(
          repo,
          caller,
          akrogonBase,
          item.name,
          ['sh', '-c', item.command],
          target,
        );
        ran.push({ ...item, exit: code, log });
        process.stdout.write(`verify ${item.name}: ${code} ${log}\n`);
      } else {
        const { log } = greenEntry(source, item)!;
        ran.push({ ...item, exit: 0, log, reused: source.run });
        process.stdout.write(`verify ${item.name}: reused ${source.run} ${log}\n`);
      }
    }
    // A red sequential stage blocks the members: each is recorded with the blocker's exit and log.
    const blocker: { name: string; exit: number; log: string } | undefined =
      setup.code !== 0 ? { name: 'setup', exit: setup.code, log: setup.log } : ran.find((item) => item.exit !== 0);
    if (blocker !== undefined) {
      for (const item of members) {
        ran.push({ ...item, exit: blocker.exit, log: blocker.log, blocked: blocker.name });
        process.stdout.write(`verify ${item.name}: blocked by ${blocker.name} (${blocker.exit}) ${blocker.log}\n`);
      }
    } else {
      const settled: PromiseSettledResult<{ code: number; log: string; reused?: string }>[] = await Promise.allSettled(
        members.map((item) => {
          const source: VerifyRun | undefined = reuseSource(ledger, tree, scope, item);
          return source === undefined
            ? checkedRun(repo, caller, akrogonBase, item.name, ['sh', '-c', item.command], target)
            : Promise.resolve({ code: 0, log: greenEntry(source, item)!.log, reused: source.run });
        }),
      );
      let first: unknown;
      for (const [index, result] of settled.entries()) {
        if (result.status === 'rejected') {
          first ??= result.reason;
          continue;
        }
        const { code, log, reused } = result.value;
        ran.push({ ...members[index], exit: code, log, ...(reused === undefined ? {} : { reused }) });
        process.stdout.write(
          reused === undefined
            ? `verify ${members[index].name}: ${code} ${log}\n`
            : `verify ${members[index].name}: reused ${reused} ${log}\n`,
        );
      }
      if (first !== undefined) throw first;
    }
    end = new Date().toISOString();
  } finally {
    await withLock(lock, async () => {
      const file: string = recordsPath(repo);
      const runs: VerifyRun[] = readVerifyRuns(repo);
      const index: number = runs.findIndex((run) => run.run === id);
      if (index === -1) return;
      runs[index] = {
        ...runs[index],
        ...(setupExit === undefined ? {} : { setup: setupExit }),
        commands: ran,
        ...(end === undefined ? {} : { end }),
      };
      if (compares !== undefined && completed(runs[index])) {
        send = await newRedUnits(repo, runs[index], runs);
        if (send.length > 0) runs[index] = { ...runs[index], notice: 'pending' };
      }
      const temporary: string = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
      renameSync(temporary, file);
    });
    if (send.length > 0) await sendMainRedNotice(repo, id, lock, send);
    if (existsSync(target)) await command(['git', 'worktree', 'remove', '--force', target], repo.root);
  }
  return {
    ...record,
    ...(setupExit === undefined ? {} : { setup: setupExit }),
    commands: ran,
    ...(end === undefined ? {} : { end }),
  };
}

function reportRun(scope: VerifyScope, run: VerifyRun): number {
  const green: boolean = run.setup === 0 && run.commands.every((item) => item.exit === 0);
  process.stdout.write(`verify ${scope} ${run.sha}: ${green ? 'green' : 'red'}\n`);
  return green ? 0 : 1;
}

export async function verify(
  cwd: string,
  rev: string | undefined,
  attempt: string | undefined,
  holder: string | undefined,
  knownRed: boolean,
): Promise<number> {
  if (attempt !== undefined && holder !== undefined) throw new Error('Use --attempt or --holder, not both');
  refuse();
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const { caller, cwd: at }: { caller: LeafTarget; cwd: string } = await verifyCaller(repo, cwd, attempt, holder);
  const scope: VerifyScope = caller.phase === undefined || caller.phase === 'merge' ? 'merge' : 'leaf';
  const sha: string = await command(['git', 'rev-parse', '--verify', `${rev ?? 'HEAD'}^{commit}`], at);
  const tree: string = await treeOf(repo, sha);
  const reused: VerifyRun | undefined = greenRun(repo, tree, scope);
  if (reused !== undefined) {
    process.stdout.write(`reuse receipt ${reused.run} tree=${tree}\n`);
    return 0;
  }
  const akrogonBase: string = await base(repo, at);
  if (!knownRed) return reportRun(scope, await runOnce(repo, caller, sha, scope, akrogonBase));
  const recorded: VerifyRun | undefined = redRun(repo, tree, scope);
  const head: VerifyRun = recorded ?? (await runOnce(repo, caller, sha, scope, akrogonBase));
  if (recorded === undefined) {
    const code: number = reportRun(scope, head);
    if (code === 0) return 0;
  }
  const baseSha: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  await runOnce(repo, caller, baseSha, scope, baseSha, head.run);
  const pass: boolean = await knownRedReceipt(repo, sha, scope);
  process.stdout.write(`verify known-red ${sha}: ${pass ? 'pass' : 'fail'}\n`);
  return pass ? 0 : 1;
}
