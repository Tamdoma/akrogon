// Criterion 3, signature gate: `consults.ts` resolves the case root outside the watched repo,
// writes the case signature (anchor cause@phase or unknown, failing command, base SHA, each
// leaf HEAD), and `match` compares it against recorded cases: `closed` for a matching closed
// case, `open` for a matching still-open one, `clear` otherwise. No test consults a model:
// the signature read and compare is the whole mechanical surface this criterion names.
import { expect, test } from 'bun:test';
import {
  chmodSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { command, spawnCaptured, type SpawnResult } from '../../../src/shell';

const script: string = resolve(import.meta.dir, 'consults.ts');
const REPO: string = 'consulttest';
const tempDirs: Set<string> = new Set();
process.on('exit', () => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

// A throwaway watched repo: git root with origin on a local bare remote, issues/open/<leaf>
// state.yaml records and, for named leaves, a worktree under <home>/worktrees/<slug>. The
// `akrogon` shim answers `akrogon config` with this repo's name and prefix, as the watched
// repo's registered machine config would.
type Rig = {
  root: string;
  home: string;
  baseSha: string;
  leaf: (slug: string, extra?: { head?: boolean }) => Promise<string>;
  run: (argv: string[]) => Promise<SpawnResult>;
};

async function rig(): Promise<Rig> {
  const home: string = mkdtempSync(resolve(tmpdir(), 'akr-consults-'));
  tempDirs.add(home);
  const root: string = resolve(home, 'repo');
  const remote: string = resolve(home, 'remote.git');
  const worktrees: string = resolve(home, 'worktrees');
  const bin: string = resolve(home, 'bin');
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  mkdirSync(bin, { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 't@example.invalid'], root);
  await command(['git', 'config', 'user.name', 't'], root);
  writeFileSync(resolve(root, 'file'), 'one\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'one'], root);
  await command(['git', 'init', '--bare', '-b', 'main', remote]);
  await command(['git', 'remote', 'add', 'origin', remote], root);
  await command(['git', 'push', '-u', 'origin', 'HEAD:main'], root);
  writeFileSync(
    resolve(root, 'issues/config.yaml'),
    Bun.YAML.stringify({ grounding: 'none', worktree_root: worktrees }),
  );
  writeFileSync(resolve(bin, 'akrogon'), `#!/bin/sh\nprintf 'repo: ${REPO}\\nprefixes: {${REPO}: ct}\\n'\n`);
  chmodSync(resolve(bin, 'akrogon'), 0o755);
  const baseSha: string = await command(['git', 'rev-parse', 'origin/main'], root);

  const leaf = async (slug: string, extra: { head?: boolean } = {}): Promise<string> => {
    const path: string = resolve(root, 'issues/open/issue', slug);
    mkdirSync(path, { recursive: true });
    writeFileSync(
      resolve(path, 'state.yaml'),
      Bun.YAML.stringify({
        slug,
        phase: 'failed',
        created: '2026-11-21',
        repo: REPO,
        'blocked-by': [],
        ...(extra.head === true ? { worktree: resolve(worktrees, slug) } : {}),
      }),
    );
    if (extra.head === true) {
      await command(['git', 'worktree', 'add', '--detach', resolve(worktrees, slug), 'main'], root);
    }
    return path;
  };

  const run = async (argv: string[]): Promise<SpawnResult> =>
    spawnCaptured([process.execPath, script, ...argv], {
      env: { ...process.env, AKROGON_HOME: home, PATH: `${bin}:${process.env.PATH}` },
    });
  return { root, home, baseSha, leaf, run };
}

const signatureSchema = z.strictObject({
  anchor: z.string(),
  cause: z.string(),
  phase: z.string(),
  command: z.string(),
  base: z.string(),
  heads: z.record(z.string(), z.string()),
});

type NewCase = { dir: string; signature: z.infer<typeof signatureSchema> };

async function newCase(r: Rig, args: string[] = []): Promise<NewCase> {
  const out: SpawnResult = await r.run(['new', r.root, ...args]);
  expect(out.code).toBe(0);
  const dir: string = out.stdout.trim();
  expect(dirname(dir)).toBe(resolve(r.home, 'watch', REPO, 'consults'));
  const signature: z.infer<typeof signatureSchema> = signatureSchema.parse(
    JSON.parse(readFileSync(resolve(dir, 'signature.json'), 'utf8')),
  );
  return { dir, signature };
}

function statusOf(dir: string, status: string): void {
  writeFileSync(resolve(dir, 'status'), status);
}

test('new writes the signature with anchor, command, base SHA and leaf HEADs', async () => {
  const r: Rig = await rig();
  await r.leaf('leaf-one', { head: true });
  await r.leaf('leaf-two', { head: true });
  const { dir, signature } = await newCase(r, [
    '--anchor',
    'leaf-one',
    '--cause',
    'blocked',
    '--phase',
    'check.review',
    '--command',
    'bun test tests/next.test.ts',
    '--leaf',
    'leaf-one',
    '--leaf',
    'leaf-two',
  ]);
  const headOne: string = await command(['git', 'rev-parse', 'HEAD'], resolve(r.home, 'worktrees/leaf-one'));
  const headTwo: string = await command(['git', 'rev-parse', 'HEAD'], resolve(r.home, 'worktrees/leaf-two'));
  expect(signature.anchor).toBe('leaf-one');
  expect(signature.cause).toBe('blocked');
  expect(signature.phase).toBe('check.review');
  expect(signature.command).toBe('bun test tests/next.test.ts');
  expect(signature.base).toBe(r.baseSha);
  expect(signature.heads).toEqual({ 'leaf-one': headOne, 'leaf-two': headTwo });
  expect(dir.startsWith(resolve(r.home, 'watch', REPO))).toBe(true);
});

test('match reports open, closed and clear for a current signature', async () => {
  const r: Rig = await rig();
  await r.leaf('leaf-one');
  const { dir } = await newCase(r, [
    '--anchor',
    'leaf-one',
    '--cause',
    'blocked',
    '--phase',
    'check.review',
    '--command',
    'bun test',
    '--leaf',
    'leaf-one',
  ]);
  const argv: string[] = [
    'match',
    r.root,
    '--anchor',
    'leaf-one',
    '--cause',
    'blocked',
    '--phase',
    'check.review',
    '--command',
    'bun test',
    '--leaf',
    'leaf-one',
  ];
  expect((await r.run(argv)).stdout).toBe(`open ${dir}`);
  statusOf(dir, 'closed');
  expect((await r.run(argv)).stdout).toBe(`closed ${dir}`);
  const different: SpawnResult = await r.run([...argv.slice(0, 6), 'merge', ...argv.slice(7)]);
  expect(different.stdout).toBe('clear');
});

test('a case ended by an operator resume stays closed on the same signature', async () => {
  const r: Rig = await rig();
  await r.leaf('leaf-one', { head: true });
  const flags: string[] = ['--anchor', 'leaf-one', '--cause', 'blocked', '--leaf', 'leaf-one'];
  const { dir }: NewCase = await newCase(r, flags);
  statusOf(dir, 'resumed');
  const matched: SpawnResult = await r.run(['match', r.root, ...flags]);
  expect(matched.code).toBe(0);
  expect(matched.stdout).toBe(`closed ${dir}`);
});

test('a moved base or leaf HEAD is clear; an unknown anchor matches unknown', async () => {
  const r: Rig = await rig();
  await r.leaf('leaf-one', { head: true });
  const { dir: first } = await newCase(r, [
    '--anchor',
    'leaf-one',
    '--cause',
    'attempts',
    '--phase',
    'merge',
    '--command',
    'akrogon verify --attempt x',
    '--leaf',
    'leaf-one',
  ]);
  statusOf(first, 'closed');
  writeFileSync(resolve(r.root, 'file'), 'two\n');
  await command(['git', 'add', '.'], r.root);
  await command(['git', 'commit', '-m', 'two'], r.root);
  await command(['git', 'push', 'origin', 'HEAD:main'], r.root);
  const moved: SpawnResult = await r.run([
    'match',
    r.root,
    '--anchor',
    'leaf-one',
    '--cause',
    'attempts',
    '--phase',
    'merge',
    '--command',
    'akrogon verify --attempt x',
    '--leaf',
    'leaf-one',
  ]);
  expect(moved.stdout).toBe('clear');

  const unknown: SpawnResult = await r.run([
    'new',
    r.root,
    '--anchor',
    'unknown',
    '--cause',
    'unknown',
    '--phase',
    'unknown',
    '--command',
    '-',
    '--leaf',
    'leaf-one',
  ]);
  expect(unknown.code).toBe(0);
  const unknownDir: string = unknown.stdout.trim();
  statusOf(unknownDir, 'closed');
  const again: SpawnResult = await r.run([
    'match',
    r.root,
    '--anchor',
    'unknown',
    '--cause',
    'unknown',
    '--phase',
    'unknown',
    '--command',
    '-',
    '--leaf',
    'leaf-one',
  ]);
  expect(again.stdout).toBe(`closed ${unknownDir}`);
});

test('the case root refuses to resolve inside the watched repo', async () => {
  const r: Rig = await rig();
  const dir: SpawnResult = await r.run(['dir', r.root]);
  expect(dir.code).toBe(0);
  expect(dir.stdout.trim()).toBe(resolve(r.home, 'watch', REPO, 'consults'));
  const inside: SpawnResult = await spawnCaptured([process.execPath, script, 'dir', r.root], {
    env: {
      ...process.env,
      AKROGON_HOME: resolve(r.root, '.akrogon-inside'),
      PATH: `${resolve(r.home, 'bin')}:${process.env.PATH}`,
    },
  });
  expect(inside.code).toBe(1);
  expect(`${inside.stderr}${inside.stdout}`).toContain('inside the watched repo');
});

// A case with the consultant's detached worktree registered under it, the record files and the
// evidence a close must trim.
async function caseWithWorktree(r: Rig): Promise<string> {
  const { dir }: NewCase = await newCase(r, ['--anchor', 'leaf-one']);
  statusOf(dir, 'open');
  await command(['git', 'worktree', 'add', '--detach', resolve(dir, 'worktree'), 'main'], r.root);
  for (const name of ['case.md', 'brief.md', 'turn-1-watch.md', 'turn-1-consultant.md', 'verify.log'])
    writeFileSync(resolve(dir, name), `${name}\n`);
  mkdirSync(resolve(dir, 'evidence'));
  writeFileSync(resolve(dir, 'evidence/shot.png'), 'png');
  return dir;
}

test('close removes the case worktree, trims the folder to its record and writes closed', async () => {
  const r: Rig = await rig();
  const dir: string = await caseWithWorktree(r);
  const closed: SpawnResult = await r.run(['close', r.root, dir]);
  expect(closed.code).toBe(0);
  expect(readdirSync(dir).sort()).toEqual([
    'case.md',
    'signature.json',
    'status',
    'turn-1-consultant.md',
    'turn-1-watch.md',
  ]);
  expect(readFileSync(resolve(dir, 'status'), 'utf8').trim()).toBe('closed');
  expect(await command(['git', 'worktree', 'list', '--porcelain'], r.root)).not.toContain(dir);
  const matched: SpawnResult = await r.run(['match', r.root, '--anchor', 'leaf-one']);
  expect(matched.stdout).toBe(`closed ${dir}`);
});

test('close exits non-zero and leaves the case open when the worktree holds an untracked file', async () => {
  const r: Rig = await rig();
  const dir: string = await caseWithWorktree(r);
  writeFileSync(resolve(dir, 'worktree/scratch.txt'), 'unsaved\n');
  const refused: SpawnResult = await r.run(['close', r.root, dir]);
  expect(refused.code).not.toBe(0);
  expect(refused.stderr).toContain('git worktree remove');
  expect(readFileSync(resolve(dir, 'status'), 'utf8').trim()).toBe('open');
  expect(existsSync(resolve(dir, 'worktree/scratch.txt'))).toBe(true);
  expect(existsSync(resolve(dir, 'brief.md'))).toBe(true);
  expect(existsSync(resolve(dir, 'evidence/shot.png'))).toBe(true);
});

test('close refuses a symlinked case that points outside the consults root and deletes nothing', async () => {
  const r: Rig = await rig();
  const { dir }: NewCase = await newCase(r, ['--anchor', 'leaf-one']);
  const outside: string = resolve(r.home, 'archive');
  mkdirSync(outside);
  writeFileSync(resolve(outside, 'evidence.txt'), 'keep\n');
  const link: string = resolve(dirname(dir), 'linked-1');
  symlinkSync(outside, link);
  const refused: SpawnResult = await r.run(['close', r.root, link]);
  expect(refused.code).not.toBe(0);
  expect(readdirSync(outside)).toEqual(['evidence.txt']);
  expect(readFileSync(resolve(outside, 'evidence.txt'), 'utf8')).toBe('keep\n');
});

test('close refuses a case whose status is a symlink to an outside file and deletes nothing', async () => {
  const r: Rig = await rig();
  const dir: string = await caseWithWorktree(r);
  const outside: string = resolve(r.home, 'outside-status');
  writeFileSync(outside, 'keep\n');
  rmSync(resolve(dir, 'status'));
  symlinkSync(outside, resolve(dir, 'status'));
  const refused: SpawnResult = await r.run(['close', r.root, dir]);
  expect(refused.code).not.toBe(0);
  expect(readFileSync(outside, 'utf8')).toBe('keep\n');
  expect(existsSync(resolve(dir, 'worktree'))).toBe(true);
  expect(existsSync(resolve(dir, 'brief.md'))).toBe(true);
});

test('close replaces a hard-linked status instead of writing through it', async () => {
  const r: Rig = await rig();
  const dir: string = await caseWithWorktree(r);
  const backup: string = resolve(r.home, 'status-backup');
  linkSync(resolve(dir, 'status'), backup);
  const closed: SpawnResult = await r.run(['close', r.root, dir]);
  expect(closed.code).toBe(0);
  expect(readFileSync(resolve(dir, 'status'), 'utf8').trim()).toBe('closed');
  expect(readFileSync(backup, 'utf8').trim()).toBe('open');
  expect(readdirSync(dir)).not.toContain('.status.tmp');
});
