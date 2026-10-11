import { test, expect } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { leafTempRoot } from './helpers';
import { repoSchema, type Repo } from '../src/config';
import { selfUpdate } from '../src/self-update';
import { command, type Result } from '../src/shell';
import { run } from '../src/shell';

type SelfUpdateFixture = {
  home: string;
  clone: string;
  seed: string;
  remote: string;
  repo: Repo;
  scratchRoot: string;
  savedTempRoot: string | undefined;
  clean: () => void;
};

async function selfUpdateFixture(): Promise<SelfUpdateFixture> {
  const home: string = mkdtempSync(resolve(tmpdir(), 'akrogon-self-update-'));
  const seed: string = resolve(home, 'seed');
  const remote: string = resolve(home, 'remote.git');
  const clone: string = resolve(home, 'clone');
  mkdirSync(resolve(seed, 'issues'), { recursive: true });
  mkdirSync(resolve(seed, 'skills/skill-one'), { recursive: true });
  mkdirSync(resolve(seed, 'src'), { recursive: true });
  writeFileSync(resolve(seed, 'issues/config.yaml'), 'grounding: none\n');
  writeFileSync(resolve(seed, 'skills/skill-one/SKILL.md'), 'one\n');
  writeFileSync(resolve(seed, 'src/akrogon.ts'), 'x\n');
  writeFileSync(resolve(seed, 'file'), 'initial\n');
  writeFileSync(resolve(seed, '.gitignore'), 'node_modules/\n');
  writeFileSync(resolve(seed, 'package.json'), JSON.stringify({ name: 'self-update-fixture' }));
  await command(['git', 'init', '-b', 'main', seed]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], seed);
  await command(['git', 'config', 'user.name', 'Test'], seed);
  await command([process.execPath, 'install'], seed);
  await command(['git', 'add', '.'], seed);
  await command(['git', 'commit', '-m', 'initial'], seed);
  await command(['git', 'init', '--bare', '-b', 'main', remote]);
  await command(['git', 'remote', 'add', 'origin', remote], seed);
  await command(['git', 'push', 'origin', 'HEAD:main'], seed);
  await command(['git', 'clone', remote, clone]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], clone);
  await command(['git', 'config', 'user.name', 'Test'], clone);
  const repo: Repo = { name: 'akrogon', root: clone, config: repoSchema.parse({ grounding: 'none' }) };
  const savedTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
  const scratchRoot: string = leafTempRoot({ home, root: clone, clean: () => undefined });
  process.env.AKROGON_LEAF_TEMP_ROOT = scratchRoot;
  return {
    home,
    clone,
    seed,
    remote,
    repo,
    scratchRoot,
    savedTempRoot,
    clean: () => {
      if (savedTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
      else process.env.AKROGON_LEAF_TEMP_ROOT = savedTempRoot;
      rmSync(home, { recursive: true, force: true });
    },
  };
}

async function withHome(home: string, body: () => Promise<void>): Promise<void> {
  const previous: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = home;
  try {
    await body();
  } finally {
    if (previous === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = previous;
  }
}

async function captured(home: string, body: () => Promise<void>): Promise<string[]> {
  const lines: string[] = [];
  const original: typeof console.log = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.join(' '));
  };
  try {
    await withHome(home, body);
  } finally {
    console.log = original;
  }
  return lines;
}

async function pushSeed(f: SelfUpdateFixture, path: string, contents: string): Promise<string> {
  mkdirSync(dirname(resolve(f.seed, path)), { recursive: true });
  writeFileSync(resolve(f.seed, path), contents);
  await command(['git', 'add', '--', path], f.seed);
  await command(['git', 'commit', '-m', `seed ${path}`], f.seed);
  await command(['git', 'push', 'origin', 'HEAD:main'], f.seed);
  return await command(['git', 'rev-parse', 'HEAD'], f.seed);
}

async function commitRecord(f: SelfUpdateFixture, path: string, contents: string): Promise<void> {
  mkdirSync(dirname(resolve(f.clone, path)), { recursive: true });
  writeFileSync(resolve(f.clone, path), contents);
  await command(['git', 'add', '--', path], f.clone);
  await command(['git', 'commit', '-m', `record ${path}`], f.clone);
}

async function remoteHead(f: SelfUpdateFixture): Promise<string> {
  return await command(['git', 'rev-parse', 'HEAD'], f.remote);
}

async function worktreeCount(f: SelfUpdateFixture): Promise<number> {
  return (await command(['git', 'worktree', 'list'], f.clone)).split('\n').length;
}

for (const own of [true, false]) {
  test.serial(`self-update pushes and moves record-only commits on ${own ? 'own' : 'other'} repo`, async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const incoming: string = await pushSeed(f, 'file', 'remote advance\n');
      await commitRecord(f, 'issues/log.jsonl', '{"ts":"now"}\n');
      await commitRecord(f, 'issues/open/x/brief.md', 'brief\n');
      const repo: Repo = own ? f.repo : { ...f.repo, name: 'other' };
      const logs: string[] = await captured(f.home, () =>
        selfUpdate(repo, own ? f.clone : resolve(f.home, 'elsewhere'), f.home),
      );
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('pushed');
      expect(logs[0]).toContain('record');
      const remoteTip: string = await remoteHead(f);
      expect(await command(['git', 'merge-base', '--is-ancestor', head, remoteTip], f.remote)).toBe('');
      expect(await command(['git', 'merge-base', '--is-ancestor', incoming, remoteTip], f.remote)).toBe('');
      expect(await command(['git', 'show', `${remoteTip}:issues/log.jsonl`], f.remote)).toBe('{"ts":"now"}');
      expect(await command(['git', 'show', `${remoteTip}:file`], f.remote)).toBe('remote advance');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(remoteTip);
      expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe('');
      expect(await worktreeCount(f)).toBe(1);
    } finally {
      f.clean();
    }
  });
}

test.serial('self-update pushes then reports a pending checkout the next trigger moves', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    await pushSeed(f, 'file', 'incoming\n');
    await commitRecord(f, 'issues/log.jsonl', '{"ts":"now"}\n');
    const localTip: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    writeFileSync(resolve(f.clone, 'file'), 'dirty\n');
    const first: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(first).toHaveLength(1);
    expect(first[0]).toContain('pushed');
    expect(first[0]).toContain('pending');
    expect(first[0]).toContain('file');
    const pushedTip: string = await remoteHead(f);
    expect(await command(['git', 'merge-base', '--is-ancestor', head, pushedTip], f.remote)).toBe('');
    expect(await command(['git', 'show', `${pushedTip}:issues/log.jsonl`], f.remote)).toBe('{"ts":"now"}');
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(localTip);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('dirty\n');
    expect((await run(['git', 'stash', 'list'], f.clone)).stdout).toBe('');
    expect(await worktreeCount(f)).toBe(1);
    writeFileSync(resolve(f.clone, 'file'), 'incoming\n');
    const second: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(second).toHaveLength(1);
    expect(second[0]).not.toContain('pushed');
    expect(await remoteHead(f)).toBe(pushedTip);
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(pushedTip);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('incoming\n');
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('self-update reports a pending checkout on a behind-only move without pushing', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    await pushSeed(f, 'file', 'incoming\n');
    const remoteBefore: string = await remoteHead(f);
    writeFileSync(resolve(f.clone, 'file'), 'dirty\n');
    const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(logs).toHaveLength(1);
    expect(logs[0]).not.toContain('pushed');
    expect(logs[0]).toContain('pending');
    expect(logs[0]).toContain('file');
    expect(await remoteHead(f)).toBe(remoteBefore);
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('dirty\n');
    expect((await run(['git', 'stash', 'list'], f.clone)).stdout).toBe('');
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('a record commit landed while the lock waits is replayed, not dropped', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    await pushSeed(f, 'file', 'incoming\n');
    await commitRecord(f, 'issues/log.jsonl', '{"ts":"a"}\n');
    const lockPath: string = resolve(f.home, '.lock');
    writeFileSync(lockPath, '');
    const held: Bun.Subprocess = Bun.spawn(['flock', '-x', lockPath, 'sleep', '3']);
    const update: Promise<string[]> = captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    await Bun.sleep(500);
    await commitRecord(f, 'issues/open/y/brief.md', 'brief\n');
    await held.exited;
    const logs: string[] = await update;
    expect(logs.join(' ')).toContain('pushed');
    const remoteTip: string = await remoteHead(f);
    // the commit landed mid-wait is replayed, so its content and subject reach
    // the remote under a rewritten sha
    expect(await command(['git', 'show', `${remoteTip}:issues/open/y/brief.md`], f.remote)).toBe('brief');
    expect(await command(['git', 'log', '--format=%s', '-3', remoteTip], f.remote)).toContain(
      'record issues/open/y/brief.md',
    );
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(remoteTip);
    expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe('');
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('a record commit landed at the branch write is pending, not dropped', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    await pushSeed(f, 'file', 'incoming\n');
    await commitRecord(f, 'issues/log.jsonl', '{"ts":"a"}\n');
    const realGit: string = (await command(['which', 'git'])).trim();
    const shimDir: string = resolve(f.home, 'shim');
    mkdirSync(shimDir, { recursive: true });
    const marker: string = resolve(f.home, 'in-update-ref');
    writeFileSync(
      resolve(shimDir, 'git'),
      // pausing only the branch move's compare-and-swap leaves a real commit
      // window between HEAD validation and the ref write; other update-ref
      // calls (rebase ORIG_HEAD and friends) pass through
      `#!/bin/sh\nif [ "$1" = update-ref ] && [ "$2" = refs/heads/main ]; then touch "${marker}"; sleep 2; fi\nexec "${realGit}" "$@"\n`,
      { mode: 0o755 },
    );
    const runner: string = resolve(f.home, 'run-self-update.ts');
    writeFileSync(
      runner,
      `import { repoSchema } from '${resolve(process.cwd(), 'src/config.ts')}';\n` +
        `import { selfUpdate } from '${resolve(process.cwd(), 'src/self-update.ts')}';\n` +
        `import { readFileSync } from 'node:fs';\n` +
        `await selfUpdate({ name: 'akrogon', root: '${f.clone}', config: repoSchema.parse({ grounding: 'none' }) }, '${f.clone}', '${f.home}');\n`,
    );
    const child: Bun.Subprocess = Bun.spawn([process.execPath, 'run', runner], {
      cwd: f.home,
      env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}` },
      stdout: 'pipe',
      stderr: 'pipe',
    });
    for (let i: number = 0; i < 100 && !existsSync(marker); i += 1) await Bun.sleep(50);
    mkdirSync(resolve(f.clone, 'issues/open/late'), { recursive: true });
    await commitRecord(f, 'issues/open/late/brief.md', 'late\n');
    const lateTip: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    await child.exited;
    const out: string = await new Response(child.stdout as ReadableStream).text();
    const res: Result = { code: child.exitCode ?? 1, stdout: out, stderr: '' };
    expect(res.stdout).toContain('checkout pending');
    expect(res.stdout).toContain('the checkout moved to');
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(lateTip);
    expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe('');
    expect(
      await run(['git', 'cat-file', '-e', `${await remoteHead(f)}:issues/open/late/brief.md`], f.remote),
    ).toMatchObject({ code: 128 });
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('a local code commit ahead leaves the checkout and remote unchanged', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    const remoteBefore: string = await remoteHead(f);
    writeFileSync(resolve(f.clone, 'code.ts'), 'code\n');
    await command(['git', 'add', 'code.ts'], f.clone);
    await command(['git', 'commit', '-m', 'code change'], f.clone);
    await commitRecord(f, 'issues/log.jsonl', '{"ts":"now"}\n');
    writeFileSync(resolve(f.clone, 'code.ts'), 'reverted\n');
    await command(['git', 'rm', '-f', 'code.ts'], f.clone);
    await command(['git', 'commit', '-m', 'undo code change'], f.clone);
    const localTip: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('skipped');
    expect(logs[0]).not.toContain('pushed');
    expect(await remoteHead(f)).toBe(remoteBefore);
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(localTip);
    expect(await command(['git', 'rev-list', '--count', `${head}..HEAD`], f.clone)).toBe('3');
  } finally {
    f.clean();
  }
});

test.serial('an incoming tracked active lock path refuses a behind-only move', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    const remoteBefore: string = await remoteHead(f);
    mkdirSync(resolve(f.seed, 'settings'), { recursive: true });
    writeFileSync(resolve(f.seed, 'settings/.lock'), 'incoming lock\n');
    await command(['git', 'add', 'settings/.lock'], f.seed);
    await command(['git', 'commit', '-m', 'incoming lock'], f.seed);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.seed);
    const home: string = resolve(f.clone, 'settings');
    mkdirSync(home, { recursive: true });
    writeFileSync(resolve(home, 'config.yaml'), 'repos: {}\n');
    writeFileSync(resolve(home, '.lock'), '');
    const logs: string[] = await captured(home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('coordination lock');
    expect(logs[0]).toContain('settings/.lock');
    expect(logs[0]).not.toContain('pending');
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
    expect(await remoteHead(f)).not.toBe(remoteBefore);
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('an incoming tracked path colliding with an ignored file refuses a behind-only move', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    const remoteBefore: string = await remoteHead(f);
    writeFileSync(resolve(f.seed, 'collision'), 'remote bytes\n');
    await command(['git', 'add', '-f', 'collision'], f.seed);
    await command(['git', 'commit', '-m', 'track collision'], f.seed);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.seed);
    writeFileSync(resolve(f.clone, '.gitignore'), 'node_modules/\ncollision*\n');
    writeFileSync(resolve(f.clone, 'collision'), 'operator ignored bytes\n');
    const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('ignored operator path');
    expect(logs[0]).toContain('collision');
    expect(logs[0]).not.toContain('pending');
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
    expect(await remoteHead(f)).not.toBe(remoteBefore);
    expect(readFileSync(resolve(f.clone, 'collision'), 'utf8')).toBe('operator ignored bytes\n');
    expect(await worktreeCount(f)).toBe(1);
  } finally {
    f.clean();
  }
});

test.serial('a record changed on both sides pushes nothing and names the path and akrogon sync', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    const remoteBefore: string = await remoteHead(f);
    await pushSeed(f, 'issues/log.jsonl', 'remote version\n');
    await commitRecord(f, 'issues/log.jsonl', 'local version\n');
    const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('issues/log.jsonl');
    expect(logs[0]).toContain('akrogon sync');
    expect(logs[0]).not.toContain('pushed');
    const localTip: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    expect(await remoteHead(f)).not.toBe(remoteBefore);
    expect(await command(['git', 'rev-list', '--count', `${head}..${localTip}`], f.clone)).toBe('1');
    expect(await command(['git', 'rev-list', '--count', `${head}..${await remoteHead(f)}`], f.clone)).toBe('1');
    expect(readFileSync(resolve(f.clone, 'issues/log.jsonl'), 'utf8')).toBe('local version\n');
    expect((await run(['git', 'status', '--porcelain'], f.clone)).stdout).toBe('');
    expect(await worktreeCount(f)).toBe(1);
    expect(existsSync(resolve(f.clone, '.git/rebase-merge'))).toBe(false);
    expect(existsSync(resolve(f.clone, '.git/rebase-apply'))).toBe(false);
  } finally {
    f.clean();
  }
});

test.serial('another repo finishes a pending checkout after its records are already upstream', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    await pushSeed(f, 'file', 'incoming\n');
    await commitRecord(f, 'issues/log.jsonl', '{"ts":"now"}\n');
    writeFileSync(resolve(f.clone, 'file'), 'dirty\n');
    const repo: Repo = { ...f.repo, name: 'other' };
    const ownRoot: string = resolve(f.home, 'elsewhere');
    await captured(f.home, () => selfUpdate(repo, ownRoot, f.home));
    const pushedTip: string = await remoteHead(f);
    await command(['git', 'restore', 'file'], f.clone);
    await captured(f.home, () => selfUpdate(repo, ownRoot, f.home));
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(pushedTip);
    expect(await remoteHead(f)).toBe(pushedTip);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('incoming\n');
    expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe('');
    expect(await command(['git', 'stash', 'list'], f.clone)).toBe('');
    expect(await worktreeCount(f)).toBe(1);
    expect(existsSync(resolve(f.clone, '.git/akrogon-install.lock'))).toBe(false);
  } finally {
    f.clean();
  }
});

test.serial('a content-equal overlap does not report deployment with another incoming file left stale', async () => {
  const f: SelfUpdateFixture = await selfUpdateFixture();
  try {
    await pushSeed(f, 'second', 'old second\n');
    await command(['git', 'fetch', 'origin', 'main'], f.clone);
    await command(['git', 'merge', '--ff-only', 'origin/main'], f.clone);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
    await pushSeed(f, 'file', 'incoming\n');
    const incoming: string = await pushSeed(f, 'second', 'incoming second\n');
    writeFileSync(resolve(f.clone, 'file'), 'incoming\n');
    await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('incoming\n');
    expect(readFileSync(resolve(f.clone, 'second'), 'utf8')).toBe('old second\n');
    expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe(' M file');
    await command(['git', 'restore', 'file'], f.clone);
    await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
    expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(incoming);
    expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('incoming\n');
    expect(readFileSync(resolve(f.clone, 'second'), 'utf8')).toBe('incoming second\n');
    expect(await command(['git', 'status', '--porcelain'], f.clone)).toBe('');
    expect(await remoteHead(f)).toBe(incoming);
  } finally {
    f.clean();
  }
});
