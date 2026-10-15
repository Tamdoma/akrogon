import { existsSync, lstatSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { type Repo } from './config';
import { run, type Result } from './shell';
import { readMember, LogError } from './evidence';
import { packFolder } from './pack';

const FORMS: string = 'accepted forms: issues/closed/<owner> or issues/chart/<chart>';
const ARCHIVE: string = 'evidence.tar.zst';

type Target = { arg: string; folder: string; packDir: string; kind: 'closed' | 'chart' };
type Refused = { arg: string; reason: string };
type Folder = Target | Refused;

function plainLogs(root: string): string[] {
  if (!existsSync(root)) return [];
  return [...new Bun.Glob('**/*.log').scanSync({ cwd: root, dot: true, onlyFiles: false })]
    .filter((name) => !lstatSync(resolve(root, name)).isDirectory())
    .sort();
}

// Args must resolve inside the registered checkout: issues/closed/<one segment>
// or issues/chart/<one segment>. A worktree's issues/ copy resolves under the
// worktree root, never repo.root, so it lands here as refused.
function classify(repo: Repo, arg: string, cwd: string): Folder {
  const fail = (reason: string): Refused => ({ arg, reason });
  let absolute: string;
  try {
    absolute = realpathSync(resolve(cwd, arg));
  } catch {
    return fail(`${FORMS}; not an existing path`);
  }
  if (!lstatSync(absolute).isDirectory()) return fail(FORMS);
  const closed: string = resolve(repo.root, 'issues/closed');
  if (dirname(absolute) === closed) return { arg, folder: absolute, packDir: absolute, kind: 'closed' };
  const charts: string = resolve(repo.root, 'issues/chart');
  if (dirname(absolute) === charts)
    return { arg, folder: absolute, packDir: resolve(absolute, 'direct'), kind: 'chart' };
  return fail(FORMS);
}

async function gitPaths(repo: Repo, owner: string, flags: string[]): Promise<string[]> {
  const args: string[] = ['git', 'ls-files', '-z', ...flags, '--', relative(repo.root, owner)];
  const result: Result = await run(args, repo.root);
  if (result.code !== 0) throw new Error(`git ls-files failed: ${result.stderr}`);
  return result.stdout.split('\0').filter((path) => path !== '' && path.endsWith('.log'));
}

// A tracked log changed on disk refuses the owner; a tracked log missing on
// disk is accepted only when the archive already holds that member with bytes
// hashing to the indexed blob oid, so log bytes are compared never as text.
async function trackedRefusals(repo: Repo, owner: string): Promise<string[]> {
  const tracked: string[] = await gitPaths(repo, owner, []);
  if (tracked.length === 0) return [];
  const modified: Set<string> = new Set(await gitPaths(repo, owner, ['--modified']));
  const deleted: Set<string> = new Set(await gitPaths(repo, owner, ['--deleted']));
  const refusals: string[] = tracked
    .filter((path) => modified.has(path) && !deleted.has(path))
    .map((path) => `tracked log modified on disk: ${path}`);
  const missing: string[] = tracked.filter((path) => deleted.has(path));
  if (missing.length === 0) return refusals;
  const ownerRel: string = relative(repo.root, owner);
  const indexed: Result = await run(['git', 'ls-files', '-s', '-z', '--', ownerRel], repo.root);
  if (indexed.code !== 0) throw new Error(`git ls-files failed: ${indexed.stderr}`);
  const oids: Map<string, string> = new Map(
    indexed.stdout
      .split('\0')
      .map((entry) => entry.match(/^\d+ ([0-9a-f]+) \d+\t(.+)$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => [match[2], match[1]]),
  );
  const format: Result = await run(['git', 'rev-parse', '--show-object-format'], repo.root);
  if (format.code !== 0) throw new Error(`git rev-parse failed: ${format.stderr}`);
  const archive: string = resolve(owner, ARCHIVE);
  for (const path of missing) {
    const member: string = path.slice(ownerRel.length + 1);
    const oid: string | undefined = oids.get(path);
    let bytes: Uint8Array | undefined;
    if (existsSync(archive)) {
      try {
        bytes = await readMember(owner, member);
      } catch (error) {
        if (!(error instanceof LogError)) throw error;
      }
    }
    const holds: boolean =
      bytes !== undefined &&
      oid !== undefined &&
      new Bun.CryptoHasher(format.stdout as Bun.SupportedCryptoAlgorithms)
        .update(new Uint8Array([...new TextEncoder().encode(`blob ${bytes.length}\0`), ...bytes]))
        .digest('hex') === oid;
    if (!holds) refusals.push(`tracked log missing on disk without matching archive member: ${path}`);
  }
  return refusals;
}

async function packOne(repo: Repo, target: Target): Promise<void> {
  const marker: string = resolve(target.folder, '.closing');
  try {
    if (target.kind === 'closed') {
      const refusals: string[] = await trackedRefusals(repo, target.folder);
      if (refusals.length > 0) {
        for (const reason of refusals) console.error(`refused ${target.arg}: ${reason}`);
        throw new RefusalError();
      }
    }
    writeFileSync(marker, '');
    const plain: string[] = plainLogs(target.packDir);
    const tracked: Set<string> =
      target.kind === 'closed'
        ? new Set(
            (await gitPaths(repo, target.folder, [])).map((path) =>
              path.slice(relative(repo.root, target.folder).length + 1),
            ),
          )
        : new Set();
    if (plain.length > 0 || existsSync(resolve(target.packDir, ARCHIVE))) await packFolder(repo, target.packDir);
    rmSync(marker);
    const untracked: number = plain.filter((name) => !tracked.has(name)).length;
    const counts: string =
      target.kind === 'closed'
        ? `${plain.length} packed (${plain.length - untracked} tracked, ${untracked} untracked), ${plain.length} deleted`
        : `${plain.length} packed, ${plain.length} deleted`;
    console.log(`packed ${target.arg}: ${counts}`);
  } catch (error) {
    if (error instanceof RefusalError) throw error;
    console.error(`failed ${target.arg}: ${error instanceof Error ? error.message : String(error)}`);
    if (existsSync(marker)) console.error(`closing marker kept: ${marker}`);
    throw new PackFailure();
  }
}

class RefusalError extends Error {}
class PackFailure extends Error {}

export async function packCommand(repo: Repo, args: string[], cwd: string): Promise<number> {
  const failed: string[] = [];
  for (const arg of args) {
    const folder: Folder = classify(repo, arg, cwd);
    if ('reason' in folder) {
      console.error(`refused ${arg}: ${folder.reason}`);
      failed.push(arg);
      continue;
    }
    try {
      await packOne(repo, folder);
    } catch (error) {
      if (error instanceof RefusalError || error instanceof PackFailure) failed.push(arg);
      else throw error;
    }
  }
  if (failed.length > 0) {
    console.error(`not packed: ${failed.join(' ')}`);
    return 1;
  }
  return 0;
}
