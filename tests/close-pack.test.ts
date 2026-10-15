import { test, expect } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { command, quote, spawnCaptured } from '../src/shell';
import { readRepo } from '../src/config';
import { readKept } from '../src/reconcile';
import { readState } from '../src/state';
import {
  fixture,
  cli,
  fakeAkrogon,
  leaf,
  leafTempRoot,
  holding,
  registerTemp,
  yaml,
  type Fixture,
} from './helpers';

function writeLog(path: string, data: string | Buffer): void {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, data);
}

// The same listing rule the pack applies: every *.log entry under the root,
// recursive and dotfiles included, non-file entries included.
function logPaths(root: string): string[] {
  return [...new Bun.Glob('**/*.log').scanSync({ cwd: root, dot: true })].sort();
}

function findLogs(root: string): string[] {
  return logPaths(root).map((name) => resolve(root, name));
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

const shims: WeakMap<Fixture, NodeJS.ProcessEnv> = new WeakMap();
function shimEnv(f: Fixture): NodeJS.ProcessEnv {
  let env: NodeJS.ProcessEnv | undefined = shims.get(f);
  if (env === undefined) {
    env = fakeAkrogon(f).env;
    shims.set(f, env);
  }
  return env;
}

async function logBytes(f: Fixture, arg: string): Promise<{ code: number; bytes: Buffer; stderr: string }> {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'close-pack-')));
  const out: string = resolve(dir, 'out');
  const err: string = resolve(dir, 'err');
  const result = await spawnCaptured(['sh', '-c', `akrogon log ${quote(arg)} >${quote(out)} 2>${quote(err)}`], {
    cwd: f.root,
    env: { ...process.env, ...shimEnv(f), HOME: f.home, AKROGON_HOME: f.home },
  });
  return {
    code: result.code,
    bytes: result.code === 0 ? readFileSync(out) : Buffer.alloc(0),
    stderr: readFileSync(err, 'utf8'),
  };
}

async function mergingLeaf(f: Fixture, slug: string, container: string = 'issue'): Promise<string> {
  const worktree: string = resolve(f.home, 'wt', slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  leaf(f, slug, 'merge', { ...holding(f), worktree }, container);
  return realpathSync(worktree);
}

const IGNORE_LINES: readonly string[] = [
  'issues/open/**/*.log',
  'issues/parked/**/*.log',
  'issues/chart/*/direct/**/*.log',
];

test('completion packs every log into evidence.tar.zst and a logless owner gets no archive', async () => {
  const f: Fixture = await fixture();
  try {
    const packed: string = leaf(f, 'packed', 'merge', holding(f), 'issue');
    writeLog(resolve(packed, 'implementation/check-a-1.log'), 'alpha\n');
    writeLog(resolve(packed, 'implementation/nested/.deep/check-b-1.log'), Buffer.from([0, 13, 255]));
    writeLog(resolve(packed, 'notes.txt'), 'not a log\n');
    const quiet: string = leaf(f, 'quiet', 'merge', holding(f), 'issue2');
    writeLog(resolve(quiet, 'README.md'), 'plain\n');
    expect((await cli(f, ['phase', 'packed', 'merged'])).code).toBe(0);
    expect((await cli(f, ['phase', 'quiet', 'merged'])).code).toBe(0);
    const closed: string = resolve(f.root, 'issues/closed/issue');
    const members: Map<string, Buffer> | null = await archiveMembers(resolve(closed, 'evidence.tar.zst'));
    expect(members).not.toBeNull();
    expect([...members!.keys()].sort()).toEqual([
      'packed/implementation/check-a-1.log',
      'packed/implementation/nested/.deep/check-b-1.log',
    ]);
    expect(members!.get('packed/implementation/check-a-1.log')!.toString()).toBe('alpha\n');
    expect(members!.get('packed/implementation/nested/.deep/check-b-1.log')).toEqual(Buffer.from([0, 13, 255]));
    expect(findLogs(closed)).toEqual([]);
    const reread = await logBytes(f, resolve(f.root, 'issues/open/issue/packed/implementation/check-a-1.log'));
    expect(reread.code).toBe(0);
    expect(reread.bytes.toString()).toBe('alpha\n');
    expect(readFileSync(resolve(closed, 'notes.txt'), 'utf8')).toBe('not a log\n');
    expect(readState(resolve(closed, 'packed')).phase).toBe('merged');
    const noLogs: string = resolve(f.root, 'issues/closed/issue2');
    expect(readdirSync(noLogs)).toContain('quiet');
    expect(await archiveMembers(resolve(noLogs, 'evidence.tar.zst'))).toBeNull();
  } finally {
    f.clean();
  }
});

test('a retried completion merges the partial archive with the remaining plain logs', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = leaf(f, 'union', 'merged', {}, 'issue');
    const owner: string = resolve(f.root, 'issues/open/issue');
    const member: string = 'union/implementation/a.log';
    const bytes: Uint8Array = await new Bun.Archive({ [member]: 'old\n' }).bytes();
    writeFileSync(resolve(owner, 'evidence.tar.zst'), Bun.zstdCompressSync(bytes, { level: 19 }));
    writeFileSync(resolve(owner, '.closing'), '');
    writeLog(resolve(dir, 'implementation/b.log'), 'new\n');
    expect((await cli(f, ['next'])).code).toBe(0);
    const closed: string = resolve(f.root, 'issues/closed/issue');
    const members: Map<string, Buffer> | null = await archiveMembers(resolve(closed, 'evidence.tar.zst'));
    expect(members).not.toBeNull();
    expect([...members!.keys()].sort()).toEqual(['union/implementation/a.log', 'union/implementation/b.log']);
    expect(members!.get('union/implementation/a.log')!.toString()).toBe('old\n');
    expect(members!.get('union/implementation/b.log')!.toString()).toBe('new\n');
    expect(findLogs(closed)).toEqual([]);
    const first = await logBytes(f, resolve(f.root, 'issues/open/issue/union/implementation/a.log'));
    const second = await logBytes(f, resolve(f.root, 'issues/open/issue/union/implementation/b.log'));
    expect(first.bytes.toString()).toBe('old\n');
    expect(second.bytes.toString()).toBe('new\n');
  } finally {
    f.clean();
  }
});

test('a symlinked log stops the completion and the owner stays open with its logs unchanged', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = leaf(f, 'linked', 'merge', holding(f), 'issue');
    writeFileSync(resolve(f.root, 'elsewhere.log'), 'x\n');
    writeLog(resolve(dir, 'implementation/ok.log'), 'ok\n');
    symlinkSync(resolve(f.root, 'elsewhere.log'), resolve(dir, 'implementation/link.log'));
    const result = await cli(f, ['phase', 'linked', 'merged']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('link.log');
    expect(existsSync(resolve(f.root, 'issues/closed/issue'))).toBe(false);
    const open: string = resolve(f.root, 'issues/open/issue');
    expect(logPaths(open)).toEqual(['linked/implementation/link.log', 'linked/implementation/ok.log']);
    expect(readFileSync(resolve(open, 'linked/implementation/ok.log'), 'utf8')).toBe('ok\n');
    expect(lstatSync(resolve(open, 'linked/implementation/link.log')).isSymbolicLink()).toBe(true);
  } finally {
    f.clean();
  }
});

test('the .closing marker rides through the failed pack and is absent after the move', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = leaf(f, 'marked', 'merge', holding(f), 'issue');
    writeLog(resolve(dir, 'implementation/stub.log'), 'stub\n');
    symlinkSync(resolve(dir, 'implementation/stub.log'), resolve(dir, '.bad.log'));
    const owner: string = resolve(f.root, 'issues/open/issue');
    const failed = await cli(f, ['phase', 'marked', 'merged']);
    expect(failed.code).not.toBe(0);
    expect(failed.stderr).toContain('.bad.log');
    expect(existsSync(resolve(owner, '.closing'))).toBe(true);
    rmSync(resolve(dir, '.bad.log'));
    writeFileSync(resolve(dir, '.bad.log'), 'dotfile log\n');
    expect((await cli(f, ['next'])).code).toBe(0);
    const closed: string = resolve(f.root, 'issues/closed/issue');
    expect(readdirSync(closed)).not.toContain('.closing');
    const members: Map<string, Buffer> | null = await archiveMembers(resolve(closed, 'evidence.tar.zst'));
    expect(members).not.toBeNull();
    expect(members!.get('marked/.bad.log')!.toString()).toBe('dotfile log\n');
  } finally {
    f.clean();
  }
});

test('run-check refuses closed and closing owners at start and right before publish', async () => {
  const f: Fixture = await fixture();
  try {
    // Early refusal: target under issues/closed.
    const done: string = leaf(f, 'done', 'merge', holding(f), 'issue');
    writeLog(resolve(done, 'implementation/x.log'), 'x\n');
    expect((await cli(f, ['phase', 'done', 'merged'])).code).toBe(0);
    const closedTarget: string = resolve(f.root, 'issues/closed/issue/done');
    const refused = await cli(f, ['run-check', '--leaf', closedTarget, '--', 'echo', 'late']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('closed');
    expect(refused.stdout).not.toContain('late');

    // Early refusal: the open owner holds .closing and the command never runs.
    const closing: string = leaf(f, 'closer', 'implement', {}, 'issue2');
    writeFileSync(resolve(f.root, 'issues/open/issue2/.closing'), '');
    const mark: string = resolve(f.home, 'ran-marker');
    const early = await cli(f, ['run-check', '--leaf', closing, '--', 'sh', '-c', `touch ${quote(mark)}`]);
    expect(early.code).not.toBe(0);
    expect(existsSync(mark)).toBe(false);
    expect(existsSync(resolve(closing, 'implementation'))).toBe(false);
    rmSync(resolve(f.root, 'issues/open/issue2/.closing'));

    // Late refusal: the leaf's own merge lands mid-run and closes the owner.
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    const worktree: string = await mergingLeaf(f, 'racer');
    const raced = await cli(
      f,
      [
        'run-check',
        '--name',
        'during',
        '--',
        'sh',
        '-c',
        'echo before-close; akrogon phase racer merged >/dev/null 2>&1',
      ],
      worktree,
      { HOME: f.home, ...shimEnv(f), AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) },
    );
    expect(raced.code).not.toBe(0);
    const outLog: RegExpMatchArray | null = raced.stderr.match(/(\S*run-[^/\s]*\/out\.log)/);
    expect(outLog).not.toBeNull();
    const runRoot: string = resolve(outLog![1], '..');
    expect(readFileSync(outLog![1], 'utf8')).toContain('before-close');
    expect(existsSync(resolve(f.root, 'issues/open/issue'))).toBe(false);
    expect(existsSync(runRoot)).toBe(true);
    expect(existsSync(resolve(runRoot, '.owner'))).toBe(false);
    expect(readFileSync(resolve(runRoot, 'refusal.json'), 'utf8')).toContain('racer');
    expect((await cli(f, ['next'])).code).toBe(0);
    expect(readFileSync(outLog![1], 'utf8')).toContain('before-close');
    const kept: { path: string; reason: string }[] = readKept(readRepo('repo', f.root));
    expect(kept.some((entry) => entry.path === runRoot && entry.reason !== '')).toBe(true);
    const before: string[] = readdirSync(resolve(f.root, 'issues/open'));
    expect((await cli(f, ['next'])).code).toBe(0);
    expect(readdirSync(resolve(f.root, 'issues/open')).sort()).toEqual(before.sort());

    // A --holder under issues/chart is still accepted.
    const direct: string = resolve(f.root, 'issues/chart/camp/direct');
    mkdirSync(direct, { recursive: true });
    const held = await cli(f, ['run-check', '--holder', direct, '--name', 'd', '--', 'echo', 'direct-ok']);
    expect(held.code).toBe(0);
    expect(readdirSync(direct).some((name) => /^check-d-.+\.log$/.test(name))).toBe(true);
  } finally {
    f.clean();
  }
});

test('a member byte conflict between the archive and a plain log stops the pack unchanged', async () => {
  const f: Fixture = await fixture();
  try {
    const dir: string = leaf(f, 'conflict', 'merge', holding(f), 'issue');
    const owner: string = resolve(f.root, 'issues/open/issue');
    const member: string = 'conflict/implementation/a.log';
    const archiveBytes: Uint8Array = Bun.zstdCompressSync(await new Bun.Archive({ [member]: 'old\n' }).bytes(), {
      level: 19,
    });
    writeFileSync(resolve(owner, 'evidence.tar.zst'), archiveBytes);
    writeLog(resolve(dir, 'implementation/a.log'), 'different\n');
    writeLog(resolve(dir, 'implementation/b.log'), 'other\n');
    const result = await cli(f, ['phase', 'conflict', 'merged']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(member);
    expect(readFileSync(resolve(owner, 'evidence.tar.zst'))).toEqual(archiveBytes);
    expect(readFileSync(resolve(dir, 'implementation/a.log'), 'utf8')).toBe('different\n');
    expect(readFileSync(resolve(dir, 'implementation/b.log'), 'utf8')).toBe('other\n');
    expect(existsSync(resolve(owner, 'evidence.tar.zst.tmp'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('sync commits neither a stranded .closing nor a pack temp file but still commits other issue changes', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'stranded', 'implement', {}, 'issue');
    const owner: string = resolve(f.root, 'issues/open/issue');
    writeFileSync(resolve(owner, '.closing'), '');
    writeFileSync(resolve(owner, 'evidence.tar.zst.tmp'), 'partial');
    writeFileSync(resolve(owner, 'stranded/note.txt'), 'keep me\n');
    expect((await cli(f, ['sync'])).code).toBe(0);
    const tracked: string[] = (await command(['git', 'ls-files', 'issues'], f.root)).split('\n');
    expect(tracked.some((path) => path.endsWith('.closing'))).toBe(false);
    expect(tracked.some((path) => path.endsWith('.tar.zst.tmp'))).toBe(false);
    expect(tracked).toContain('issues/open/issue/stranded/note.txt');
  } finally {
    f.clean();
  }
});

test('init adds the log ignore lines once and sync stages no new plain log afterwards', async () => {
  const f: Fixture = await fixture();
  try {
    expect((await cli(f, ['init'])).code).toBe(0);
    expect((await cli(f, ['init'])).code).toBe(0);
    const ignore: string = readFileSync(resolve(f.root, '.gitignore'), 'utf8');
    for (const line of IGNORE_LINES) expect(ignore.split('\n').filter((item) => item === line)).toHaveLength(1);
    leaf(f, 'noisy', 'implement', {}, 'issue');
    writeLog(resolve(f.root, 'issues/open/issue/noisy/check-run-1.log'), 'plain\n');
    writeLog(resolve(f.root, 'issues/parked/rested/check-old-1.log'), 'parked\n');
    writeLog(resolve(f.root, 'issues/chart/camp/direct/check-d-1.log'), 'chart\n');
    expect((await cli(f, ['sync'])).code).toBe(0);
    const tracked: string[] = (await command(['git', 'ls-files', 'issues'], f.root)).split('\n');
    expect(tracked.some((path) => path.endsWith('.log'))).toBe(false);
    expect(tracked).toContain('issues/open/issue/noisy/state.yaml');
  } finally {
    f.clean();
  }
});
