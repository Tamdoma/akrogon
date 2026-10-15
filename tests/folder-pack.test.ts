import { test, expect } from 'bun:test';
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command } from '../src/shell';
import { fixture, cli, leaf, type Fixture } from './helpers';

function writeLog(path: string, data: string | Buffer): void {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, data);
}

// The same listing rule the pack applies: every *.log file under the root,
// recursive and dotfiles included.
function findLogs(root: string): string[] {
  return [...new Bun.Glob('**/*.log').scanSync({ cwd: root, dot: true, onlyFiles: false })]
    .map((name) => resolve(root, name))
    .filter((path) => lstatSync(path).isFile())
    .sort();
}

async function archiveMembers(archive: string): Promise<Map<string, Buffer> | null> {
  try {
    const files: Map<string, File> = await new Bun.Archive(Bun.zstdDecompressSync(readFileSync(archive))).files();
    const out = new Map<string, Buffer>();
    for (const [name, file] of files) out.set(name, Buffer.from(await file.arrayBuffer()));
    return out;
  } catch {
    return null;
  }
}

async function writeArchive(archive: string, members: Record<string, string | Buffer>): Promise<void> {
  const bytes: Uint8Array = await new Bun.Archive(members).bytes();
  writeFileSync(archive, Bun.zstdCompressSync(bytes, { level: 19 }));
}

async function commitAll(root: string): Promise<void> {
  await command(['git', 'add', '-A'], root);
  await command(['git', 'commit', '-m', 'seed'], root);
}

test('akrogon pack packs a chart direct folder, merges and rides .closing through failures', async () => {
  const f: Fixture = await fixture();
  try {
    const direct: string = resolve(f.root, 'issues/chart/camp/direct');
    writeLog(resolve(direct, 'check-a-1.log'), 'alpha\n');
    writeLog(resolve(direct, 'nested/.deep/check-b-1.log'), Buffer.from([0, 13, 255]));
    writeFileSync(resolve(direct, 'notes.txt'), 'not a log\n');
    writeFileSync(resolve(f.root, 'issues/chart/camp/CHART.md'), '# camp\n');
    await commitAll(f.root);

    const packed = await cli(f, ['pack', 'issues/chart/camp']);
    expect(packed.code, packed.stderr).toBe(0);
    const archive: string = resolve(direct, 'evidence.tar.zst');
    let members: Map<string, Buffer> | null = await archiveMembers(archive);
    expect(members).not.toBeNull();
    expect([...members!.keys()].sort()).toEqual(['check-a-1.log', 'nested/.deep/check-b-1.log']);
    expect(members!.get('check-a-1.log')!.toString()).toBe('alpha\n');
    expect(members!.get('nested/.deep/check-b-1.log')).toEqual(Buffer.from([0, 13, 255]));
    expect(findLogs(direct)).toEqual([]);
    expect(existsSync(resolve(f.root, 'issues/chart/camp/.closing'))).toBe(false);
    expect(readFileSync(resolve(direct, 'notes.txt'), 'utf8')).toBe('not a log\n');

    // New plain logs merge with the archive a reopened chart wrote.
    writeLog(resolve(direct, 'check-c-1.log'), 'reopened\n');
    await commitAll(f.root);
    expect((await cli(f, ['pack', 'issues/chart/camp'])).code).toBe(0);
    members = await archiveMembers(archive);
    expect([...members!.keys()].sort()).toEqual(['check-a-1.log', 'check-c-1.log', 'nested/.deep/check-b-1.log']);

    // A failed pack leaves .closing and exits non-zero naming it; a rerun finishes and removes it.
    writeLog(resolve(direct, 'ok.log'), 'fine\n');
    symlinkSync(resolve(direct, 'notes.txt'), resolve(direct, '.bad.log'));
    const failed = await cli(f, ['pack', 'issues/chart/camp']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('camp');
    expect(existsSync(resolve(f.root, 'issues/chart/camp/.closing'))).toBe(true);
    rmSync(resolve(direct, '.bad.log'));
    writeFileSync(resolve(direct, '.bad.log'), 'dotfile log\n');
    const retried = await cli(f, ['pack', 'issues/chart/camp']);
    expect(retried.code).toBe(0);
    expect(existsSync(resolve(f.root, 'issues/chart/camp/.closing'))).toBe(false);
    members = await archiveMembers(archive);
    expect(members!.get('.bad.log')!.toString()).toBe('dotfile log\n');
  } finally {
    f.clean();
  }
});

test('akrogon pack reports packed, tracked, untracked and deleted counts for a closed owner', async () => {
  const f: Fixture = await fixture();
  try {
    const owner: string = resolve(f.root, 'issues/closed/issue');
    mkdirSync(owner, { recursive: true });
    writeLog(resolve(owner, 'leaf/implementation/check-a-1.log'), 'one\n');
    writeLog(resolve(owner, 'leaf/implementation/check-b-1.log'), 'two\n');
    writeFileSync(resolve(owner, 'leaf/state.yaml'), 'x\n');
    await commitAll(f.root);
    writeLog(resolve(owner, 'leaf/check-stray-1.log'), 'untracked\n');

    const result = await cli(f, ['pack', 'issues/closed/issue']);
    expect(result.code, result.stderr).toBe(0);
    const line: string = result.stdout.split('\n').find((part) => part.includes('issues/closed/issue'))!;
    for (const count of ['3', '2', '1']) expect(line).toContain(count);
    expect(line).toContain('tracked');
    expect(line).toContain('untracked');
    expect(line).toContain('deleted');
    const members: Map<string, Buffer> | null = await archiveMembers(resolve(owner, 'evidence.tar.zst'));
    expect([...members!.keys()].sort()).toEqual([
      'leaf/check-stray-1.log',
      'leaf/implementation/check-a-1.log',
      'leaf/implementation/check-b-1.log',
    ]);
    expect(findLogs(owner)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a tracked log modified on disk refuses the owner and a missing one joins only through matching archive bytes', async () => {
  const f: Fixture = await fixture();
  try {
    const owner: string = resolve(f.root, 'issues/closed/issue');
    mkdirSync(owner, { recursive: true });
    const memberA: string = 'leaf/a.log';
    const memberB: string = 'leaf/b.log';
    writeLog(resolve(owner, memberA), 'ends with newline\n');
    writeLog(resolve(owner, memberB), Buffer.from([0, 255, 10, 13]));
    writeLog(resolve(owner, 'leaf/keep.log'), 'kept\n');
    await commitAll(f.root);

    // Missing tracked log refused while its member is absent from the archive.
    rmSync(resolve(owner, memberA));
    rmSync(resolve(owner, memberB));
    await writeArchive(resolve(owner, 'evidence.tar.zst'), { [memberA]: 'ends with newline\n' });
    const refusedMissing: { code: number; stderr: string } = await cli(f, ['pack', 'issues/closed/issue']);
    expect(refusedMissing.code).not.toBe(0);
    expect(refusedMissing.stderr).toContain(memberB);
    expect(existsSync(resolve(owner, '.closing'))).toBe(false);

    // Missing tracked logs with archived bytes matching the index are accepted.
    await writeArchive(resolve(owner, 'evidence.tar.zst'), {
      [memberA]: 'ends with newline\n',
      [memberB]: Buffer.from([0, 255, 10, 13]),
    });
    const archived = await cli(f, ['pack', 'issues/closed/issue']);
    expect(archived.code, archived.stderr).toBe(0);
    const members: Map<string, Buffer> | null = await archiveMembers(resolve(owner, 'evidence.tar.zst'));
    expect(members!.get(memberB)).toEqual(Buffer.from([0, 255, 10, 13]));
    expect(findLogs(owner)).toEqual([]);

    // A tracked log rewritten on disk refuses, naming the path, with no marker left.
    writeLog(resolve(owner, memberA), 'changed after commit\n');
    const refused = await cli(f, ['pack', 'issues/closed/issue']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain(memberA);
    expect(existsSync(resolve(owner, '.closing'))).toBe(false);
    expect(readFileSync(resolve(owner, memberA), 'utf8')).toBe('changed after commit\n');
  } finally {
    f.clean();
  }
});

test('unaccepted folders are refused by form and every failure is named while good folders still pack', async () => {
  const f: Fixture = await fixture();
  try {
    const open: string = leaf(f, 'running', 'implement', {}, 'issue');
    const parked: string = resolve(f.root, 'issues/parked/rested');
    mkdirSync(parked, { recursive: true });
    const outside: string = resolve(f.home, 'elsewhere');
    mkdirSync(outside, { recursive: true });
    const wt: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '-b', 'side', wt], f.root);
    mkdirSync(resolve(wt, 'issues/closed/copy'), { recursive: true });
    const direct: string = resolve(f.root, 'issues/chart/camp/direct');
    writeLog(resolve(direct, 'check-a-1.log'), 'alpha\n');
    writeFileSync(resolve(f.root, 'issues/chart/camp/CHART.md'), '# camp\n');
    await commitAll(f.root);

    const result = await cli(f, [
      'pack',
      open,
      parked,
      outside,
      resolve(wt, 'issues/closed/copy'),
      'issues',
      'issues/chart/camp',
    ]);
    expect(result.code).not.toBe(0);
    for (const refused of [open, parked, outside, resolve(wt, 'issues/closed/copy'), 'issues']) {
      expect(result.stderr + result.stdout).toContain(String(refused));
    }
    expect(result.stderr + result.stdout).toContain('closed');
    expect(result.stderr + result.stdout).toContain('chart');
    expect(findLogs(direct)).toEqual([]);
    expect(await archiveMembers(resolve(direct, 'evidence.tar.zst'))).not.toBeNull();
  } finally {
    f.clean();
  }
});
