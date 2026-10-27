import { existsSync, lstatSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { type Repo } from './config';
import { locate, readMember } from './evidence';
import { flockHold } from './flock';

const ARCHIVE: string = 'evidence.tar.zst';

// The enclosing run-check capture, when the caller sits inside one that owns
// this folder: the owner dir itself, its parent (a --holder <chart>/direct
// capture against the chart folder), or its open/closed/parked sibling moved
// since the run started. The check is env state, so it refuses before the
// folder's own lock wait could deadlock on the caller's held lock.
export function enclosingCapture(folder: string): string | undefined {
  const owner: string | undefined = process.env.AKROGON_CAPTURE_OWNER;
  const run: string | undefined = process.env.AKROGON_CAPTURE_RUN;
  if (owner === undefined || owner === '' || run === undefined || run === '') return undefined;
  const real = (path: string): string => {
    try {
      return realpathSync(path);
    } catch {
      return resolve(path);
    }
  };
  const o: string = real(owner);
  const f: string = real(folder);
  if (o === f || dirname(o) === f) return run;
  const sibling = (dir: string): string | undefined => {
    const state: string = basename(dir);
    return ['open', 'closed', 'parked'].includes(state) ? dirname(dir) : undefined;
  };
  const fsib: string | undefined = sibling(dirname(f));
  if (fsib !== undefined && fsib === sibling(dirname(o)) && basename(f) === basename(o)) return run;
  return undefined;
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}

export async function packFolder(repo: Repo, folder: string, cwd: string = repo.root): Promise<void> {
  const enclosing: string | undefined = enclosingCapture(folder);
  if (enclosing !== undefined)
    throw new Error(`Refusing to pack ${folder}: inside run-check run ${enclosing}`);
  const holder: { release: () => Promise<void> } = await flockHold(resolve(folder, '.lock'), '-x');
  try {
    await packFolderLocked(repo, folder, cwd);
  } finally {
    await holder.release();
  }
}

// The pack under a lock the caller already holds: completeOwner wraps its own
// .closing, pack and move in the same exclusive hold.
export async function packFolderLocked(repo: Repo, folder: string, cwd: string): Promise<void> {
  const plain: Map<string, Uint8Array> = new Map();
  for (const name of new Bun.Glob('**/*.log').scanSync({ cwd: folder, dot: true, onlyFiles: false })) {
    const stat = lstatSync(resolve(folder, name));
    if (stat.isSymbolicLink()) throw new Error(`Log is a symlink: ${relative(repo.root, resolve(folder, name))}`);
    if (!stat.isFile()) continue;
    plain.set(name, readFileSync(resolve(folder, name)));
  }
  const archivePath: string = resolve(folder, ARCHIVE);
  const archived: Map<string, Uint8Array> = new Map();
  if (existsSync(archivePath))
    for (const [name, file] of await new Bun.Archive(Bun.zstdDecompressSync(readFileSync(archivePath))).files())
      archived.set(name, new Uint8Array(await file.arrayBuffer()));
  for (const [name, bytes] of plain) {
    const existing: Uint8Array | undefined = archived.get(name);
    if (existing !== undefined && !sameBytes(existing, bytes))
      throw new Error(`Log member conflicts with archive: ${name}`);
  }
  if (plain.size === 0 && !existsSync(archivePath)) return;
  const union: Map<string, Uint8Array> = new Map([...archived, ...plain]);
  const bytes: Uint8Array = await new Bun.Archive(
    Object.fromEntries([...union.entries()].sort(([a], [b]) => a.localeCompare(b))),
  ).bytes();
  const tmp: string = archivePath + '.tmp';
  writeFileSync(tmp, Bun.zstdCompressSync(bytes, { level: 19 }));
  try {
    const reread: Map<string, File> = await new Bun.Archive(Bun.zstdDecompressSync(readFileSync(tmp))).files();
    for (const [name, expected] of union) {
      const file: File | undefined = reread.get(name);
      if (file === undefined || !sameBytes(expected, new Uint8Array(await file.arrayBuffer())))
        throw new Error(`Packed archive member mismatch: ${name}`);
    }
  } catch (error) {
    unlinkSync(tmp);
    throw error;
  }
  renameSync(tmp, archivePath);
  for (const [member, expected] of union) {
    const target = await locate(resolve(folder, member), cwd, repo);
    if (target === null || target.member !== member) throw new Error(`Packed member fails to resolve: ${member}`);
    const ownerDir: string | undefined = target.ownerDirs.find((dir) => existsSync(dir));
    if (ownerDir === undefined) throw new Error(`Packed member has no owner dir: ${member}`);
    if (!sameBytes(await readMember(ownerDir, member), expected))
      throw new Error(`Packed member verification failed: ${member}`);
  }
  for (const name of plain.keys()) unlinkSync(resolve(folder, name));
}
