// akrogon direct / direct-drop: the chart door's leaf verbs. A direct leaf is created by the
// charting terminal itself (the door) with the reviewer as seat B: no tab, no seats started, no
// setup run. Every refusal of the create flow runs before any write; a rerun on an existing direct
// leaf rewrites only the two seat refs.
import { chmodSync, existsSync, readdirSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { readGlobal, requireRepo, ensureLeafTemp, within, worktreeStore, type Repo } from './config';
import { HcError, sessions, terminal } from './hc';
import { checkBase } from './preflight';
import { command, writeYaml } from './shell';
import { findLeaf, leafFolders, saveState, seatRefSchema, stateSchema, worktreeLock, withLock, type SeatRef } from './state';
import { createSparseWorktree, writeLeafEnv } from './next';
import { stopLeafWork } from './stop';

// One address probed across every live session: exactly one live session must hold it as a live
// terminal. Zero hits is absence, more than one is ambiguity, and both refuse with the
// caller-supplied label; a probe error other than not-found refuses with the original error.
async function probeExactlyOne(address: string, label: string): Promise<SeatRef> {
  const hits: SeatRef[] = [];
  for (const session of (await sessions()).live) {
    try {
      const found = await terminal(session, address);
      if (found.state === 'live') hits.push({ session, address });
    } catch (error) {
      if (!(error instanceof HcError) || error.kind !== 'not_found') throw error;
    }
  }
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) throw new Error(`${label}: no live session holds that terminal`);
  throw new Error(`${label}: the terminal resolves in ${hits.length} live sessions (${hits.map((hit) => hit.session).join(', ')})`);
}

// The folders <owner>/<slug> under issues/open and issues/closed, depth two exactly: a direct
// leaf is always its owner's direct child.
function slugLeafFolders(repo: Repo, slug: string): string[] {
  const found: string[] = [];
  for (const area of ['open', 'closed']) {
    const root: string = resolve(repo.root, 'issues', area);
    if (!existsSync(root)) continue;
    for (const owner of readdirSync(root)) {
      const candidate: string = resolve(root, owner, slug);
      if (statSync(candidate, { throwIfNoEntry: false })?.isDirectory() === true) found.push(candidate);
    }
  }
  return found;
}

// Raw state.yaml read for the rerun: the rewrite byte-preserves every key it does not touch, so it
// never round-trips through the schema, which would materialize defaults and reorder content.
function readRawState(file: string): Record<string, unknown> {
  return z.record(z.string(), z.unknown()).parse(Bun.YAML.parse(readFileSync(file, 'utf8')));
}

function rewriteSeats(leafPath: string, caller: SeatRef, reviewer: SeatRef): void {
  const file: string = resolve(leafPath, 'state.yaml');
  const raw: Record<string, unknown> = readRawState(file);
  const oldRefs = z.object({ A: z.unknown().optional(), B: z.unknown().optional() }).parse(raw.seat);
  const changed = (slot: 'A' | 'B', next: SeatRef): boolean => {
    const old = seatRefSchema.safeParse(oldRefs[slot]);
    return !old.success || old.data.session !== next.session || old.data.address !== next.address;
  };
  raw.seat = { A: caller, B: reviewer };
  if (typeof raw.delivery_error === 'object' && raw.delivery_error !== null) {
    const errors: Record<string, unknown> = raw.delivery_error as Record<string, unknown>;
    if (changed('A', caller)) delete errors.A;
    if (changed('B', reviewer)) delete errors.B;
  }
  writeYaml(file, raw);
  chmodSync(file, 0o444);
}

export async function directCommand(
  slug: string,
  reviewerAddress: string,
  sources: string[],
  cwd: string,
): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const callerAddress: string | undefined = process.env.HC_TERMINAL_ID;
  if (callerAddress === undefined || callerAddress.trim() === '')
    throw new Error('akrogon direct runs inside an hc terminal: HC_TERMINAL_ID is not set');
  const caller: SeatRef = await probeExactlyOne(callerAddress, `HC_TERMINAL_ID ${callerAddress}`);
  const folders: string[] = slugLeafFolders(repo, slug);
  if (folders.length === 0) throw new Error(`Missing leaf folder for ${slug} under issues/open and issues/closed`);
  if (folders.length > 1) throw new Error(`Ambiguous leaf slug ${slug}: ${folders.join(' and ')} both hold it`);
  const leafPath: string = folders[0];
  const stateFile: string = resolve(leafPath, 'state.yaml');
  if (existsSync(stateFile)) {
    if (readRawState(stateFile).direct !== true) throw new Error(`${slug} is not a direct leaf`);
    const reviewer: SeatRef = await probeExactlyOne(reviewerAddress, `the reviewer address ${reviewerAddress}`);
    rewriteSeats(leafPath, caller, reviewer);
    console.log(`leaf: ${realpathSync(leafPath)}`);
    return;
  }
  for (const file of ['ISSUE.md', 'brief.md', 'design.md'])
    if (!existsSync(resolve(leafPath, file)))
      throw new Error(
        `${leafPath} lacks ${file}: the chart door writes ISSUE.md, brief.md and design.md before akrogon direct`,
      );
  const ownerPath: string = dirname(leafPath);
  const siblings: string[] = leafFolders(ownerPath).filter((path) => path !== leafPath);
  if (siblings.length > 0)
    throw new Error(
      `${ownerPath} already holds the leaf ${siblings.map((path) => basename(path)).join(', ')}: a direct leaf is its owner's only leaf`,
    );
  const reviewer: SeatRef = await probeExactlyOne(reviewerAddress, `the reviewer address ${reviewerAddress}`);
  const base: string = await checkBase(repo, true);
  const worktree: string = resolve(worktreeStore(repo), slug);
  // Everything after the worktree's creation rolls back when it fails: worktree, branch and state
  // go together or not at all.
  await createSparseWorktree(repo, worktree, base, { branch: slug });
  try {
    await writeLeafEnv(repo, worktree, false);
    ensureLeafTemp(repo, slug);
    saveState(
      leafPath,
      stateSchema.parse({
        slug,
        phase: 'implement',
        created: new Date().toISOString(),
        repo: repo.name,
        'blocked-by': [],
        sources,
        worktree,
        env_names: repo.config.env,
        seat: { A: caller, B: reviewer },
        frozen: {},
        direct: true,
      }),
    );
  } catch (error) {
    const lock: string = await worktreeLock(repo.root);
    await withLock(lock, () => command(['git', 'worktree', 'remove', '--force', worktree], repo.root));
    await command(['git', 'update-ref', '-d', `refs/heads/${slug}`], repo.root);
    throw error;
  }
  console.log(`leaf: ${realpathSync(leafPath)}`);
  console.log(`worktree: ${realpathSync(worktree)}`);
}

export async function directDropCommand(slug: string, chart: string, cwd: string): Promise<void> {
  const repo: Repo = await requireRepo(readGlobal(), cwd);
  const leaf = findLeaf(repo, slug);
  if (leaf.state.direct !== true) throw new Error(`${slug} is not a direct leaf`);
  if (leaf.state.phase === 'merge' || leaf.state.phase === 'merged')
    throw new Error(`Refusing to drop ${slug}: phase ${leaf.state.phase} is not an unmerged attempt`);
  if (!within(leaf.path, resolve(repo.root, 'issues/open')))
    throw new Error(`Refusing to drop ${slug}: the leaf is not under issues/open`);
  if (!existsSync(resolve(cwd, chart))) throw new Error(`Not a chart folder: ${chart}`);
  const chartPath: string = realpathSync(resolve(cwd, chart));
  if (!statSync(chartPath).isDirectory()) throw new Error(`Not a chart folder: ${chartPath}`);
  const destination: string = resolve(chartPath, 'direct');
  if (existsSync(destination)) throw new Error(`Refusing to drop ${slug}: ${destination} already exists`);
  const worktree: string = resolve(worktreeStore(repo), slug);
  await stopLeafWork(repo, slug);
  const lock: string = await worktreeLock(repo.root);
  await withLock(lock, () => command(['git', 'worktree', 'remove', '--force', worktree], repo.root));
  await command(['git', 'update-ref', '-d', `refs/heads/${slug}`], repo.root);
  renameSync(dirname(leaf.path), destination);
  console.log(`moved: ${destination}`);
}
