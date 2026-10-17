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
import { command } from './shell';
import { allLeaves, withLock, type Leaf } from './state';

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
  path: z.string(),
  pid: z.number().int(),
  boot_id: z.string(),
  setup: z.number().int().optional(),
  commands: z.array(z.strictObject({ name: z.string(), command: z.string(), exit: z.number().int(), log: z.string() })),
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

async function baseCoversHead(repo: Repo, head: VerifyRun, base: VerifyRun): Promise<boolean> {
  if (!completed(head) || !completed(base) || !sameCommands(base.commands, head.commands)) return false;
  for (const [index, item] of head.commands.entries()) {
    if (item.exit === 0) continue;
    const names: string[] = await failedTests(repo, item.log);
    if (names.some((name) => noTestNames.includes(name))) return false;
    const onBase: string[] = await failedTests(repo, base.commands[index].log);
    if (!names.every((name) => onBase.includes(name))) return false;
  }
  return true;
}

async function knownRedReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<boolean> {
  const runs: VerifyRun[] = readVerifyRuns(repo);
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  const tree: string = await treeOf(repo, sha);
  const heads: VerifyRun[] = runs.filter(
    (run) =>
      run.tree === tree &&
      completed(run) &&
      sameCommands(run.commands, expected) &&
      run.commands.some((item) => item.exit !== 0),
  );
  if (heads.length === 0) return false;
  const mergeBase: string = await command(['git', 'merge-base', sha, trackingRef(repo)], repo.root);
  for (const head of heads) {
    for (const base of runs.filter((run) => run.compares === head.run && run.sha === mergeBase))
      if (await baseCoversHead(repo, head, base)) return true;
  }
  return false;
}

export async function requireGreenReceipt(repo: Repo, sha: string, scope: VerifyScope): Promise<void> {
  const green: VerifyRun | undefined = greenRun(repo, await treeOf(repo, sha), scope);
  if (green === undefined && !(await knownRedReceipt(repo, sha, scope)))
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
    for (const item of verifyCommands(repo.config, scope)) {
      const { code, log }: { code: number; log: string } =
        setup.code === 0
          ? await checkedRun(repo, caller, akrogonBase, item.name, ['sh', '-c', item.command], target)
          : setup;
      ran.push({ ...item, exit: code, log });
      process.stdout.write(`verify ${item.name}: ${code} ${log}\n`);
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
      const temporary: string = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
      renameSync(temporary, file);
    });
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
  const baseRun: VerifyRun = await runOnce(repo, caller, baseSha, scope, baseSha, head.run);
  const pass: boolean = await baseCoversHead(repo, head, baseRun);
  process.stdout.write(`verify known-red ${sha}: ${pass ? 'pass' : 'fail'}\n`);
  return pass ? 0 : 1;
}
