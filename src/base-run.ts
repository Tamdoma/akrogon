import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { leafTemp, readGlobal, requireRepo, within, worktreeStore, type Repo } from './config';
import { checkLocation } from './guard';
import { createSparseWorktree, emitEnvFile } from './next';
import { constructedEnv, spawnLogged } from './run-check';
import { command, quote, type Result } from './shell';
import { allLeaves, withLock, type Leaf } from './state';
import { requiredSlots, slotSchema, type Slot } from './routing';

export const baseRunSchema = z.strictObject({
  run: z.string(),
  repo: z.string(),
  leaf: z.string(),
  slot: z.string(),
  attempt: z.string().optional(),
  base: z.string(),
  command: z.array(z.string()),
  cwd: z.string(),
  path: z.string(),
  env_generation: z.number().int().nonnegative(),
  pid: z.number().int(),
  boot_id: z.string(),
  start: z.string(),
  end: z.string().optional(),
  exit: z.number().int().optional(),
  removed: z.string().optional(),
});

export type BaseRun = z.infer<typeof baseRunSchema>;

function recordsPath(repo: Repo): string {
  return resolve(repo.root, 'issues/base-runs.jsonl');
}

export function readBaseRuns(repo: Repo): BaseRun[] {
  const file: string = recordsPath(repo);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => baseRunSchema.parse(JSON.parse(line)));
}

async function recordLock(repo: Repo): Promise<string> {
  return resolve(repo.root, await command(['git', 'rev-parse', '--git-path', 'akrogon-base-runs.lock'], repo.root));
}

async function callerLeaf(repo: Repo, cwd: string, attempt: string | undefined): Promise<Leaf> {
  if (attempt !== undefined) {
    const leaf: Leaf | undefined = allLeaves(repo).find(
      (item) => item.state.batch?.attempt === attempt && item.state.phase === 'merge',
    );
    if (leaf === undefined) throw new Error(`No merge leaf for attempt: ${attempt}`);
    return leaf;
  }
  const top: string = realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], cwd));
  const leaf: Leaf | undefined = allLeaves(repo).find(
    (item) =>
      item.state.worktree !== undefined && existsSync(item.state.worktree) && realpathSync(item.state.worktree) === top,
  );
  if (leaf === undefined) throw new Error('No leaf worktree matches cwd');
  return leaf;
}

function runCwd(leaf: Leaf, cwd: string, prefix: string, override: string | undefined): string {
  if (
    leaf.state.worktree !== undefined &&
    existsSync(leaf.state.worktree) &&
    within(realpathSync(cwd), realpathSync(leaf.state.worktree))
  )
    return prefix;
  return override ?? '';
}

function pickSlot(leaf: Leaf): Slot {
  const pane: string = process.env.HERDR_PANE_ID ?? '';
  if (pane !== '') {
    for (const [slot, id] of Object.entries(leaf.state.pane)) if (id === pane) return slotSchema.parse(slot);
  }
  const pending: readonly Slot[] = requiredSlots(leaf.state.phase, leaf.state.fix_rounds).filter(
    (slot) => !leaf.state.done.includes(slot),
  );
  if (pending.length !== 1) throw new Error(`Cannot determine base-run slot for leaf ${leaf.state.slug}`);
  return pending[0];
}

export async function baseRun(
  cwd: string,
  baseSha: string,
  attempt: string | undefined,
  cwdOverride: string | undefined,
  argv: string[],
): Promise<number> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const leaf: Leaf = await callerLeaf(repo, cwd, attempt);
  const prefix: string = (await command(['git', 'rev-parse', '--show-prefix'], cwd)).replace(/\/$/, '');
  const inside: string = runCwd(leaf, cwd, prefix, cwdOverride);
  const slot: Slot = pickSlot(leaf);
  const id: string = randomUUID();
  const target: string = resolve(worktreeStore(repo), `base-${id}`);
  checkLocation(target);
  const lock: string = await recordLock(repo);
  const record: BaseRun = {
    run: id,
    repo: repo.name,
    leaf: leaf.state.slug,
    slot,
    ...(attempt === undefined ? {} : { attempt }),
    base: baseSha,
    command: argv,
    cwd: inside,
    path: target,
    env_generation: leaf.state.env_generation,
    pid: process.pid,
    boot_id: existsSync('/proc/sys/kernel/random/boot_id')
      ? readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
      : '',
    start: new Date().toISOString(),
  };
  await withLock(lock, async () => {
    appendFileSync(recordsPath(repo), JSON.stringify(record) + '\n');
  });
  const scratch: string = leafTemp(repo, leaf.state.slug);
  let code: number = 1;
  let removed: string | undefined;
  try {
    await createSparseWorktree(repo, target, baseSha, { detach: true });
    await emitEnvFile(repo, target, leaf.state.env_names);
    mkdirSync(scratch, { recursive: true, mode: 0o700 });
    const runRoot: string = mkdtempSync(resolve(scratch, 'run-'));
    writeFileSync(
      join(runRoot, '.owner'),
      JSON.stringify({ pid: process.pid, boot_id: record.boot_id, started: record.start }),
    );
    const env: Record<string, string> = constructedEnv(repo, runRoot);
    env.AKROGON_BASE = baseSha;
    const setup: string | undefined = repo.config.setup;
    const enter: string = inside === '' ? '' : `cd ${quote(inside)} && `;
    const script: string =
      setup === undefined
        ? `akrogon guard ancestors && akrogon guard own-modules && ${enter}exec "$@"`
        : `akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c ${quote(
            setup,
          )} && akrogon guard own-modules && ${enter}exec "$@"`;
    const implementation: string = resolve(leaf.path, 'implementation');
    mkdirSync(implementation, { recursive: true });
    if (inside !== '') mkdirSync(resolve(target, inside), { recursive: true });
    const log: string = resolve(implementation, `base-${id}.log`);
    const ran: Result = await spawnLogged(['sh', '-c', script, 'akrogon-base-run', ...argv], target, env, log);
    code = ran.code;
    process.stdout.write(`log: ${log}\nstatus: ${ran.code}\n`);
  } finally {
    if (existsSync(target)) {
      await command(['git', 'worktree', 'remove', '--force', target], repo.root);
      removed = new Date().toISOString();
    }
    await withLock(lock, async () => {
      if (!existsSync(recordsPath(repo))) return;
      const file: string = recordsPath(repo);
      const runs: BaseRun[] = readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => baseRunSchema.parse(JSON.parse(line)));
      const index: number = runs.findIndex((run) => run.run === id);
      if (index === -1) return;
      runs[index] = {
        ...runs[index],
        end: new Date().toISOString(),
        exit: code,
        ...(removed === undefined ? {} : { removed }),
      };
      const temporary: string = `${file}.${process.pid}.tmp`;
      writeFileSync(temporary, runs.map((run) => JSON.stringify(run)).join('\n') + '\n');
      renameSync(temporary, file);
    });
  }
  return code;
}
