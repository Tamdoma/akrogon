import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { expandPath, globalHome, readRepo, within, type GlobalConfig, type Repo } from './config';
import { run, type Result } from './shell';

export type LogErrorKind = 'nomatch' | 'ambiguous' | 'archive' | 'member';
export class LogError extends Error {
  readonly kind: LogErrorKind;
  constructor(kind: LogErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.kind = kind;
  }
}

export type LogTarget = { ownerDirs: string[]; member: string };

const boundary: RegExp = /(?:^|\/)issues\/(?:open|closed|parked|chart)\//;

async function roots(repo: Repo): Promise<string[]> {
  const roots: string[] = [repo.root];
  const result: Result = await run(['git', 'worktree', 'list', '--porcelain'], repo.root);
  if (result.code === 0)
    for (const line of result.stdout.split('\n')) {
      const path: string | undefined = line.match(/^worktree (.+)$/)?.[1];
      if (path !== undefined && path !== repo.root) roots.push(path);
    }
  return roots;
}

export async function locate(recorded: string, cwd: string, repo: Repo): Promise<LogTarget | null> {
  const absolute: string = isAbsolute(recorded) ? recorded : resolve(cwd, recorded);
  let path: string = recorded;
  const root: string | undefined = (await roots(repo)).find((root) => within(absolute, root));
  if (root !== undefined) path = relative(root, absolute);
  const found: RegExpMatchArray | null = path.match(boundary);
  if (found === null || found.index === undefined) return null;
  const rest: string = path.slice(found.index + found[0].length);
  const parts: string[] = rest.split('/');
  if (found[0].includes('chart')) {
    const [chart, direct, ...member]: string[] = parts;
    if (direct !== 'direct' || member.join('/') === '') return null;
    return {
      ownerDirs: [resolve(repo.root, 'issues/chart', chart, 'direct')],
      member: member.join('/'),
    };
  }
  const [owner, ...member]: string[] = parts;
  if (member.join('/') === '') return null;
  return {
    ownerDirs: ['open', 'closed', 'parked'].map((state) => resolve(repo.root, 'issues', state, owner)),
    member: member.join('/'),
  };
}

export async function readMember(ownerDir: string, member: string): Promise<Uint8Array> {
  const archivePath: string = resolve(ownerDir, 'evidence.tar.zst');
  let files: Map<string, File>;
  try {
    files = await new Bun.Archive(Bun.zstdDecompressSync(readFileSync(archivePath))).files();
  } catch (error) {
    throw new LogError('archive', `unreadable archive: ${archivePath}`, { cause: error });
  }
  const file: File | undefined = files.get(member);
  if (file === undefined) throw new LogError('member', `no member ${member} in ${archivePath}`);
  return new Uint8Array(await file.arrayBuffer());
}

export async function readLog(repo: Repo, recorded: string, cwd: string): Promise<Uint8Array> {
  const target: LogTarget | null = await locate(recorded, cwd, repo);
  if (target === null) throw new LogError('nomatch', `no log for recorded path: ${recorded}`);
  let firstExisting: string | undefined;
  for (const ownerDir of target.ownerDirs) {
    const plain: string = resolve(ownerDir, target.member);
    if (existsSync(plain)) return readFileSync(plain);
    if (firstExisting === undefined && existsSync(ownerDir)) firstExisting = ownerDir;
  }
  if (firstExisting === undefined) throw new LogError('nomatch', `no log for recorded path: ${recorded}`);
  return readMember(firstExisting, target.member);
}

export async function readLogAcross(
  global: GlobalConfig,
  recorded: string,
  cwd: string = process.cwd(),
): Promise<Uint8Array> {
  const matches: ({ name: string } & ({ bytes: Uint8Array } | { error: LogError }))[] = [];
  for (const [name, path] of Object.entries(global.repos)) {
    try {
      matches.push({ name, bytes: await readLog(readRepo(name, expandPath(path, globalHome())), recorded, cwd) });
    } catch (error) {
      if (error instanceof LogError && error.kind !== 'nomatch') matches.push({ name, error });
      else if (!(error instanceof LogError)) throw error;
    }
  }
  if (matches.length === 0) throw new LogError('nomatch', `no log for recorded path: ${recorded}`);
  if (matches.length > 1)
    throw new LogError('ambiguous', `recorded path ${recorded} matches repos: ${matches.map((match) => match.name).join(', ')}`);
  const only: { name: string } & ({ bytes: Uint8Array } | { error: LogError }) = matches[0];
  if ('error' in only) throw only.error;
  return only.bytes;
}
