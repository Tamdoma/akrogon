import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { base, readGlobal, requireRepo, setupCommand, worktreeStore, type Repo, type RepoConfig } from './config';
import { checkLocation } from './guard';
import { createSparseWorktree, emitEnvFile } from './next';
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
  scope: verifyScopeSchema,
  path: z.string(),
  pid: z.number().int(),
  boot_id: z.string(),
  commands: z.array(z.strictObject({ name: z.string(), command: z.string(), exit: z.number().int(), log: z.string() })),
  start: z.string(),
  end: z.string().optional(),
  removed: z.string().optional(),
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

export function requireGreenReceipt(repo: Repo, sha: string, scope: VerifyScope): void {
  const expected: NamedCommand[] = verifyCommands(repo.config, scope);
  const green: boolean = readVerifyRuns(repo).some(
    (run) =>
      run.sha === sha &&
      run.scope === scope &&
      run.end !== undefined &&
      run.commands.length === expected.length &&
      run.commands.every(
        (item, index) =>
          item.exit === 0 && item.name === expected[index].name && item.command === expected[index].command,
      ),
  );
  if (!green)
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
): Promise<LeafTarget> {
  if (attempt === undefined) return leafTarget(repo, cwd, undefined, holder);
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) => item.state.batch?.attempt === attempt && item.state.phase === 'merge',
  );
  if (leaf === undefined) throw new Error(`No merge leaf for attempt: ${attempt}`);
  return { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') };
}

export async function verify(
  cwd: string,
  rev: string | undefined,
  attempt: string | undefined,
  holder: string | undefined,
): Promise<number> {
  if (attempt !== undefined && holder !== undefined) throw new Error('Use --attempt or --holder, not both');
  refuse();
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const caller: LeafTarget = await verifyCaller(repo, cwd, attempt, holder);
  const scope: VerifyScope = caller.phase === undefined || caller.phase === 'merge' ? 'merge' : 'leaf';
  const sha: string = await command(['git', 'rev-parse', '--verify', `${rev ?? 'HEAD'}^{commit}`], cwd);
  const akrogonBase: string = await base(repo, cwd);
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
    scope,
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
  let end: string | undefined;
  let removed: string | undefined;
  try {
    await createSparseWorktree(repo, target, sha, { detach: true });
    await emitEnvFile(repo, target, repo.config.env);
    for (const item of verifyCommands(repo.config, scope)) {
      const { code, log }: { code: number; log: string } = await checkedRun(
        repo,
        caller,
        akrogonBase,
        item.name,
        ['sh', '-c', setupCommand(repo.config, item.command)],
        target,
      );
      ran.push({ ...item, exit: code, log });
      process.stdout.write(`verify ${item.name}: ${code} ${log}\n`);
    }
    end = new Date().toISOString();
  } finally {
    if (existsSync(target)) {
      await command(['git', 'worktree', 'remove', '--force', target], repo.root);
      removed = new Date().toISOString();
    }
    await withLock(lock, async () => {
      const file: string = recordsPath(repo);
      const runs: VerifyRun[] = readVerifyRuns(repo);
      const index: number = runs.findIndex((run) => run.run === id);
      if (index === -1) return;
      runs[index] = {
        ...runs[index],
        commands: ran,
        ...(end === undefined ? {} : { end }),
        ...(removed === undefined ? {} : { removed }),
      };
      const temporary: string = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
      renameSync(temporary, file);
    });
  }
  const green: boolean = ran.every((item) => item.exit === 0);
  process.stdout.write(`verify ${scope} ${sha}: ${green ? 'green' : 'red'}\n`);
  return green ? 0 : 1;
}
