import { existsSync, lstatSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { type Repo } from './config';
import { locate, readMember } from './evidence';

const ARCHIVE: string = 'evidence.tar.zst';

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}

export async function packFolder(repo: Repo, folder: string, cwd: string = repo.root): Promise<void> {
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
