import { test, expect } from 'bun:test';
import { dirname, resolve } from 'node:path';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { fixture, cli, leaf, yaml, type Fixture } from './helpers';
import { command, run, type Result } from '../src/shell';

test('sync commits local changes, rebases on the remote and pushes', async () => {
  const f: Fixture = await fixture();
  try {
    const remote: string = resolve(f.home, 'remote.git');
    const other: string = resolve(f.home, 'other');
    await command(['git', 'clone', remote, other]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
    await command(['git', 'config', 'user.name', 'Test'], other);
    writeFileSync(resolve(other, 'landed'), 'from a leaf\n');
    await command(['git', 'add', 'landed'], other);
    await command(['git', 'commit', '-m', 'leaf work'], other);
    await command(['git', 'push', 'origin', 'HEAD:main'], other);
    writeFileSync(resolve(f.root, 'issues/log.jsonl'), '{"ts":"now"}\n');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    expect(await command(['git', 'status', '--porcelain'], f.root)).toBe('');
    expect(await command(['git', 'log', '--format=%s', '-2'], f.root)).toBe('sync issues\nleaf work');
    expect(await command(['git', 'rev-parse', 'main'], remote)).toBe(
      await command(['git', 'rev-parse', 'HEAD'], f.root),
    );
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    const again: Result = await cli(f, ['sync']);
    expect(again.code, again.stderr).toBe(0);
    expect(await command(['git', 'rev-parse', 'HEAD'], f.root)).toBe(head);
    expect(await command(['git', 'log', '--format=%s', '-1'], f.root)).toBe('sync issues');
  } finally {
    f.clean();
  }
});

async function remoteFixture(
  worktreeRoot: string | null = 'issues/worktrees',
  branch: string = 'main',
): Promise<Fixture> {
  const f: Fixture = await fixture();
  yaml(resolve(f.root, 'issues/config.yaml'), {
    ...(worktreeRoot !== null ? { worktree_root: worktreeRoot } : {}),
    default_branch: branch,
    grounding: 'none',
  });
  if (branch !== 'main') await command(['git', 'branch', '-m', branch], f.root);
  await command(['git', 'add', 'issues/config.yaml'], f.root);
  await command(['git', 'commit', '-m', 'config'], f.root);
  await command(['git', 'init', '--bare', '-b', branch, resolve(f.home, 'remote.git')]);
  await command(['git', 'push', '-u', 'origin', branch], f.root);
  return f;
}

function put(f: Fixture, path: string, contents: string = 'local\n'): void {
  mkdirSync(dirname(resolve(f.root, path)), { recursive: true });
  writeFileSync(resolve(f.root, path), contents);
}

async function advance(f: Fixture, path: string): Promise<void> {
  const other: string = resolve(f.home, 'other');
  await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
  await command(['git', 'config', 'user.name', 'Test'], other);
  writeFileSync(resolve(other, path), 'remote\n');
  await command(['git', 'add', path], other);
  await command(['git', 'commit', '-m', 'remote advance'], other);
  await command(['git', 'push'], other);
}

async function snapshot(f: Fixture): Promise<string[]> {
  return Promise.all([
    command(['git', 'rev-parse', 'HEAD'], f.root),
    command(['git', 'rev-parse', 'HEAD'], resolve(f.home, 'remote.git')),
    command(['git', 'ls-files', '--stage', '-z'], f.root),
  ]);
}

async function locksFree(f: Fixture): Promise<void> {
  for (const path of [resolve(f.home, '.lock')]) expect((await run(['flock', '-n', path, 'true'])).code).toBe(0);
}

for (const advancing of [false, true]) {
  test(`sync preserves unrelated edits with advancing remote=${advancing}`, async () => {
    const f: Fixture = await remoteFixture();
    try {
      put(f, 'file', 'operator edits\n');
      put(f, 'untracked file', 'untracked bytes\n');
      put(f, 'issues/log.jsonl');
      if (advancing) await advance(f, 'landed');
      const result: Result = await cli(f, ['sync']);
      expect(result.code, result.stderr).toBe(0);
      expect(readFileSync(resolve(f.root, 'file'), 'utf8')).toBe('operator edits\n');
      expect(readFileSync(resolve(f.root, 'untracked file'), 'utf8')).toBe('untracked bytes\n');
      expect(await command(['git', 'diff', '--cached', '--name-only'], f.root)).toBe('');
      expect(await command(['git', 'show', '--format=', '--name-only', 'HEAD'], resolve(f.home, 'remote.git'))).toBe(
        'issues/log.jsonl',
      );
      await locksFree(f);
    } finally {
      f.clean();
    }
  });
}

test('sync scopes eligible issue records with the default home worktree store', async () => {
  const f: Fixture = await remoteFixture(null);
  try {
    put(f, 'issues/log.jsonl');
    put(f, 'file', 'operator edits\n');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    expect(await command(['git', 'diff', '--cached', '--name-only'], f.root)).toBe('');
    expect(await command(['git', 'show', '--format=', '--name-only', 'HEAD'], resolve(f.home, 'remote.git'))).toBe(
      'issues/log.jsonl',
    );
    expect(readFileSync(resolve(f.root, 'file'), 'utf8')).toBe('operator edits\n');
    await locksFree(f);
  } finally {
    f.clean();
  }
});

test('sync stages eligible records beside ignored seeds and worktree paths', async () => {
  const f: Fixture = await remoteFixture();
  try {
    put(f, '.gitignore', '.env\nissues/seeds/\nissues/worktrees/\n');
    await command(['git', 'add', '.gitignore'], f.root);
    await command(['git', 'commit', '-m', 'ignore'], f.root);
    await command(['git', 'push'], f.root);
    put(f, 'issues/seeds/note');
    put(f, 'issues/worktrees/branch/file');
    put(f, 'issues/log.jsonl');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    expect(await command(['git', 'show', '--format=', '--name-only', 'HEAD'], resolve(f.home, 'remote.git'))).toBe(
      'issues/log.jsonl',
    );
    await locksFree(f);
  } finally {
    f.clean();
  }
});

test('autostash restoration conflict refuses push and preserves recovery stash', async () => {
  const f: Fixture = await remoteFixture();
  try {
    put(f, 'file', 'operator edits\n');
    put(f, 'issues/log.jsonl');
    await advance(f, 'file');
    const remoteHead: string = await command(['git', 'rev-parse', 'HEAD'], resolve(f.home, 'remote.git'));
    const result: Result = await cli(f, ['sync']);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('file');
    expect(result.stderr).toContain('autostash');
    expect(await command(['git', 'rev-parse', 'HEAD'], resolve(f.home, 'remote.git'))).toBe(remoteHead);
    expect(await command(['git', 'diff', '--name-only', '--diff-filter=U'], f.root)).toBe('file');
    expect(await command(['git', 'show', 'stash:file'], f.root)).toBe('operator edits');
    await locksFree(f);
  } finally {
    f.clean();
  }
});

for (const branch of ['side', 'detached HEAD']) {
  test(`sync refuses ${branch} without touching HEAD or index`, async () => {
    const f: Fixture = await remoteFixture('issues/worktrees', 'trunk');
    try {
      await command(branch === 'side' ? ['git', 'checkout', '-b', branch] : ['git', 'checkout', '--detach'], f.root);
      put(f, 'issues/log.jsonl');
      await command(['git', 'add', 'issues/log.jsonl'], f.root);
      const before: string[] = await snapshot(f);
      const result: Result = await cli(f, ['sync']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(branch);
      expect(result.stderr).toContain('trunk');
      expect(await snapshot(f)).toEqual(before);
      await locksFree(f);
    } finally {
      f.clean();
    }
  });
}

for (const path of [
  'outside file \n',
  'issues/seeds/note',
  'issues/nested/.lock',
  'issues/worktrees/branch/file',
  'rename',
]) {
  test(`sync refuses staged exclusion ${JSON.stringify(path)}`, async () => {
    const f: Fixture = await remoteFixture();
    try {
      put(f, 'issues/log.jsonl');
      if (path === 'rename') await command(['git', 'mv', 'file', 'issues/moved'], f.root);
      else {
        put(f, path);
        await command(['git', 'add', '--', path], f.root);
      }
      const before: string[] = await snapshot(f);
      const result: Result = await cli(f, ['sync']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(path === 'rename' ? 'file' : path);
      expect(await snapshot(f)).toEqual(before);
      await locksFree(f);
    } finally {
      f.clean();
    }
  });
}

for (const worktreeRoot of ['issues/worktrees', 'issues/custom trees', 'issues/tree[1]*', '../external', '.']) {
  test(`sync scopes tracked changes and new files with worktree root ${worktreeRoot}`, async () => {
    const f: Fixture = await remoteFixture(worktreeRoot);
    try {
      const excluded: string[] = ['issues/seeds/note', '.lock', 'issues/record/.lock', 'issues/nested/.lock'];
      if (worktreeRoot !== '.' && !worktreeRoot.startsWith('../')) excluded.push(`${worktreeRoot}/file`);
      const removed: string[] = excluded.map((path: string) => `${dirname(path)}/deleted`);
      // Lock exclusions apply to the basename, so use nested lock files for deleted locks.
      const deleted: string[] = removed.map((path: string, i: number) =>
        excluded[i].endsWith('.lock') ? `${path}/.lock` : path,
      );
      for (const path of [...excluded, ...deleted, 'issues/eligible-delete']) put(f, path, 'initial\n');
      await command(['git', 'add', '-A'], f.root);
      await command(['git', 'commit', '-m', 'tracked fixtures'], f.root);
      await command(['git', 'push'], f.root);
      const before: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
      for (const path of excluded) put(f, path, 'operator edits\n');
      for (const path of [...deleted, 'issues/eligible-delete']) rmSync(resolve(f.root, path));
      for (const path of ['issues/seeds/new', 'issues/another/.lock', `${worktreeRoot}/new`]) put(f, path);
      put(f, 'issues/eligible-new');
      if (worktreeRoot === 'issues/tree[1]*') put(f, 'issues/tree1-match/eligible');
      const result: Result = await cli(f, ['sync']);
      expect(result.code, result.stderr).toBe(0);
      expect(await command(['git', 'diff', '--cached', '--name-only'], f.root)).toBe('');
      if (worktreeRoot === '.') expect(await command(['git', 'rev-parse', 'HEAD'], f.root)).toBe(before);
      else
        expect((await command(['git', 'show', '--format=', '--name-status', 'HEAD'], f.root)).split('\n')).toEqual([
          'D\tissues/eligible-delete',
          'A\tissues/eligible-new',
          ...(worktreeRoot === 'issues/tree[1]*' ? ['A\tissues/tree1-match/eligible'] : []),
        ]);
      for (const path of excluded) expect(readFileSync(resolve(f.root, path), 'utf8')).toBe('operator edits\n');
      for (const path of deleted) expect(existsSync(resolve(f.root, path))).toBe(false);
    } finally {
      f.clean();
    }
  });
}

async function waitFor(path: string): Promise<void> {
  const deadline: number = Date.now() + 3000;
  while (!existsSync(path)) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(5);
  }
}

function signalFlock(f: Fixture): NodeJS.ProcessEnv {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  writeFileSync(
    resolve(bin, 'flock'),
    '#!/bin/sh\nprintf ready > "$AKROGON_HOME/$LOCK_SIGNAL"\nexec /usr/bin/flock "$@"\n',
    { mode: 0o755 },
  );
  return { PATH: `${bin}:${process.env.PATH}` };
}

test('sync holds global lock through push while real park waits', async () => {
  const f: Fixture = await remoteFixture();
  try {
    leaf(f, 'ready', 'plan.synthesis', {}, 'park-me');
    const env: NodeJS.ProcessEnv = signalFlock(f);
    const release: string = resolve(f.home, 'release');
    writeFileSync(
      resolve(f.root, '.git/hooks/pre-push'),
      '#!/bin/sh\nprintf ready > "$AKROGON_HOME/pushing"\nwhile [ ! -e "$AKROGON_HOME/release" ]; do sleep 0.01; done\n',
      { mode: 0o755 },
    );
    const sync: Promise<Result> = cli(f, ['sync']);
    const jobs: Promise<Result>[] = [sync];
    try {
      await waitFor(resolve(f.home, 'pushing'));
      for (const path of [resolve(f.home, '.lock')]) expect((await run(['flock', '-n', path, 'true'])).code).toBe(1);
      const park: Promise<Result> = cli(f, ['park', 'park-me'], f.root, { ...env, LOCK_SIGNAL: 'parking' });
      jobs.push(park);
      await waitFor(resolve(f.home, 'parking'));
      expect(existsSync(resolve(f.root, 'issues/open/park-me'))).toBe(true);
      expect(existsSync(resolve(f.root, 'issues/parked/park-me'))).toBe(false);
      writeFileSync(release, 'release');
      expect((await sync).code).toBe(0);
      expect((await park).code).toBe(0);
      expect(existsSync(resolve(f.root, 'issues/parked/park-me'))).toBe(true);
      await locksFree(f);
    } finally {
      writeFileSync(release, 'release');
      await Promise.all(jobs);
      rmSync(resolve(f.root, '.git/hooks/pre-push'), { force: true });
    }
  } finally {
    f.clean();
  }
});

for (const location of ['settings [1]*/.lock']) {
  for (const source of ['local', 'incoming', 'replay']) {
    test(`sync refuses active coordination lock ${location} from ${source}`, async () => {
      const f: Fixture = await remoteFixture();
      try {
        const home: string = resolve(f.root, dirname(location));
        if (home !== f.home) {
          mkdirSync(home, { recursive: true });
          copyFileSync(resolve(f.home, 'config.yaml'), resolve(home, 'config.yaml'));
        }
        if (source === 'incoming') {
          const other: string = resolve(f.home, 'other');
          await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
          await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
          await command(['git', 'config', 'user.name', 'Test'], other);
          mkdirSync(dirname(resolve(other, location)), { recursive: true });
          writeFileSync(resolve(other, location), 'incoming lock\n');
          await command(['git', '--literal-pathspecs', 'add', '--', location], other);
          await command(['git', 'commit', '-m', 'incoming lock'], other);
          await command(['git', 'push'], other);
        } else {
          put(f, location, 'tracked lock\n');
          await command(['git', '--literal-pathspecs', 'add', '--', location], f.root);
          await command(['git', 'commit', '-m', 'tracked lock'], f.root);
          if (source === 'local') put(f, location, 'operator edits\n');
          else {
            await command(['git', '--literal-pathspecs', 'rm', '--', location], f.root);
            await command(['git', 'commit', '-m', 'remove lock'], f.root);
            await advance(f, 'landed');
            put(f, location, 'operator edits\n');
          }
        }
        put(f, 'issues/log.jsonl');
        put(f, 'file', 'unrelated edits\n');
        const before: string[] = await snapshot(f);
        const result: Result = await cli(f, ['sync'], f.root, { AKROGON_HOME: home });
        expect(result.code).not.toBe(0);
        expect(result.stderr).toContain(location);
        expect(result.stderr).toContain('coordination lock');
        expect(await snapshot(f)).toEqual(before);
        expect(readFileSync(resolve(f.root, 'file'), 'utf8')).toBe('unrelated edits\n');
        expect(readFileSync(resolve(f.root, 'issues/log.jsonl'), 'utf8')).toBe('local\n');
        if (source !== 'incoming') expect(readFileSync(resolve(f.root, location), 'utf8')).toBe('operator edits\n');
        for (const path of [resolve(home, '.lock')]) expect((await run(['flock', '-n', path, 'true'])).code).toBe(0);
      } finally {
        f.clean();
      }
    });
  }
}

for (const source of ['incoming', 'replay']) {
  for (const [ignoredPath, trackedPath] of [
    ['collision [1]* \n', 'collision [1]* \n'],
    ['collision/file', 'collision'],
    ['collision', 'collision/file'],
    ['collision/operator', 'collision'],
  ]) {
    test(`sync preserves ignored ${JSON.stringify(ignoredPath)} against ${source} ${JSON.stringify(trackedPath)}`, async () => {
      const f: Fixture = await remoteFixture();
      try {
        put(f, '.gitignore', 'collision*\n');
        await command(['git', 'add', '.gitignore'], f.root);
        await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
        await command(['git', 'push'], f.root);
        if (source === 'incoming') {
          const other: string = resolve(f.home, 'other');
          await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
          await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
          await command(['git', 'config', 'user.name', 'Test'], other);
          put({ ...f, root: other }, trackedPath, 'remote bytes\n');
          await command(['git', '--literal-pathspecs', 'add', '-f', '--', trackedPath], other);
          await command(['git', 'commit', '-m', 'track collision'], other);
          await command(['git', 'push'], other);
        } else {
          put(f, trackedPath, 'replayed bytes\n');
          await command(['git', '--literal-pathspecs', 'add', '-f', '--', trackedPath], f.root);
          await command(['git', 'commit', '-m', 'track collision'], f.root);
          await command(['git', '--literal-pathspecs', 'rm', '--', trackedPath], f.root);
          await command(['git', 'commit', '-m', 'remove collision'], f.root);
          await advance(f, 'landed');
        }
        if (ignoredPath === 'collision/operator')
          await command(['git', 'init', '-b', 'main', resolve(f.root, 'collision')]);
        put(f, ignoredPath, 'operator ignored bytes\n');
        put(f, 'issues/record', 'eligible issue\n');
        const before: string[] = await snapshot(f);
        const result: Result = await cli(f, ['sync']);
        expect(result.code).not.toBe(0);
        expect(result.stderr).toContain(ignoredPath === 'collision/operator' ? 'collision/' : ignoredPath);
        expect(readFileSync(resolve(f.root, ignoredPath), 'utf8')).toBe('operator ignored bytes\n');
        expect(await snapshot(f)).toEqual(before);
        expect(readFileSync(resolve(f.root, 'issues/record'), 'utf8')).toBe('eligible issue\n');
        await locksFree(f);
      } finally {
        f.clean();
      }
    });
  }
}

test('sync adopts identical ignored entries from the incoming tree', async () => {
  const f: Fixture = await remoteFixture();
  try {
    put(f, '.gitignore', 'collision*\n');
    await command(['git', 'add', '.gitignore'], f.root);
    await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
    await command(['git', 'push'], f.root);
    const other: string = resolve(f.home, 'other');
    await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
    await command(['git', 'config', 'user.name', 'Test'], other);
    put({ ...f, root: other }, 'collision', 'shared bytes\n');
    put({ ...f, root: other }, 'collision-diff', 'shared different\n');
    put({ ...f, root: other }, 'collision [1]* \n', 'odd bytes\n');
    put({ ...f, root: other }, 'collision-tool', '#!/bin/sh\nexit 0\n');
    chmodSync(resolve(other, 'collision-tool'), 0o755);
    put({ ...f, root: other }, 'collision-target', 'link bytes\n');
    symlinkSync('collision-target', resolve(other, 'collision-link'));
    await command(
      [
        'git',
        '--literal-pathspecs',
        'add',
        '-f',
        '--',
        'collision',
        'collision-diff',
        'collision [1]* \n',
        'collision-tool',
        'collision-link',
      ],
      other,
    );
    await command(['git', 'commit', '-m', 'track collisions'], other);
    await command(['git', 'push'], other);
    const incoming: string = await command(['git', 'rev-parse', 'HEAD'], resolve(f.home, 'remote.git'));
    put(f, 'collision', 'shared bytes\n');
    put(f, 'collision-diff', 'shared different\n');
    put(f, 'collision [1]* \n', 'odd bytes\n');
    put(f, 'collision-tool', '#!/bin/sh\nexit 0\n');
    chmodSync(resolve(f.root, 'collision-tool'), 0o755);
    symlinkSync('collision-target', resolve(f.root, 'collision-link'));
    put(f, 'issues/record', 'eligible issue\n');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    const head: string = await command(['git', 'rev-parse', 'HEAD'], f.root);
    expect(await command(['git', 'merge-base', '--is-ancestor', incoming, head], f.root)).toBe('');
    expect(await command(['git', 'rev-parse', 'main'], resolve(f.home, 'remote.git'))).toBe(head);
    const staged: Map<string, string> = new Map(
      (await command(['git', 'ls-files', '--stage', '-z'], f.root))
        .split('\0')
        .filter((line: string) => line !== '')
        .map((line: string) => [line.split('\t')[1], line.split(' ')[0] + ' ' + line.split(' ')[1]]),
    );
    for (const [path, modeId] of [
      ['collision', '100644'],
      ['collision-diff', '100644'],
      ['collision [1]* \n', '100644'],
      ['collision-tool', '100755'],
      ['collision-link', '120000'],
      ['issues/record', '100644'],
    ]) {
      expect(staged.has(path), `${path} tracked`).toBe(true);
      expect(staged.get(path)?.split(' ')[0]).toBe(modeId);
    }
    const tree: Map<string, string> = new Map(
      (await command(['git', 'ls-tree', '-r', '-z', incoming], f.root))
        .split('\0')
        .filter((line: string) => line !== '')
        .map((line: string) => {
          const [meta, path] = line.split('\t');
          return [path, meta.split(' ')[2]];
        }),
    );
    for (const path of ['collision', 'collision-diff', 'collision [1]* \n', 'collision-tool', 'collision-link'])
      expect(staged.get(path)?.split(' ')[1]).toBe(tree.get(path));
    expect(readFileSync(resolve(f.root, 'collision'), 'utf8')).toBe('shared bytes\n');
    expect(readFileSync(resolve(f.root, 'collision-diff'), 'utf8')).toBe('shared different\n');
    expect(readFileSync(resolve(f.root, 'collision [1]* \n'), 'utf8')).toBe('odd bytes\n');
    expect(readFileSync(resolve(f.root, 'collision-tool'), 'utf8')).toBe('#!/bin/sh\nexit 0\n');
    expect(lstatSync(resolve(f.root, 'collision-tool')).mode & 0o111).not.toBe(0);
    expect(readlinkSync(resolve(f.root, 'collision-link'))).toBe('collision-target');
    expect(await command(['git', 'status', '--porcelain'], f.root)).toBe('');
    expect(await command(['git', 'ls-files', '--others', '--ignored', '--exclude-standard', '-z'], f.root)).toBe('');
    await locksFree(f);
  } finally {
    f.clean();
  }
});

for (const variant of [
  'line endings',
  'executable bit local',
  'executable bit incoming',
  'local file incoming symlink',
  'local symlink incoming file',
]) {
  test(`sync refuses an ignored entry differing only in ${variant}`, async () => {
    const f: Fixture = await remoteFixture();
    try {
      put(f, '.gitignore', 'collision*\n');
      await command(['git', 'add', '.gitignore'], f.root);
      await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
      await command(['git', 'push'], f.root);
      const other: string = resolve(f.home, 'other');
      await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
      await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
      await command(['git', 'config', 'user.name', 'Test'], other);
      if (variant === 'line endings') {
        put({ ...f, root: other }, '.gitattributes', 'collision text\n');
        await command(['git', 'add', '.gitattributes'], other);
      }
      const localLink: boolean = variant === 'local symlink incoming file';
      const incomingLink: boolean = variant === 'local file incoming symlink';
      if (incomingLink) symlinkSync('collision', resolve(other, 'collision'));
      else put({ ...f, root: other }, 'collision', 'shared\n');
      if (variant === 'executable bit incoming') chmodSync(resolve(other, 'collision'), 0o755);
      await command(['git', '--literal-pathspecs', 'add', '-f', '--', 'collision'], other);
      await command(['git', 'commit', '-m', 'track collision'], other);
      await command(['git', 'push'], other);
      if (localLink) symlinkSync('collision', resolve(f.root, 'collision'));
      else put(f, 'collision', variant === 'line endings' ? 'shared\r\n' : 'shared\n');
      if (variant === 'executable bit local') chmodSync(resolve(f.root, 'collision'), 0o755);
      const before: string[] = await snapshot(f);
      const result: Result = await cli(f, ['sync']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('ignored operator paths');
      expect(result.stderr).toContain('collision');
      expect(await snapshot(f)).toEqual(before);
      const local: string = resolve(f.root, 'collision');
      if (localLink) expect(readlinkSync(local)).toBe('collision');
      else {
        expect(readFileSync(local, 'utf8')).toBe(variant === 'line endings' ? 'shared\r\n' : 'shared\n');
        expect(lstatSync(local).isFile()).toBe(true);
        if (variant === 'executable bit local') expect(lstatSync(local).mode & 0o111).not.toBe(0);
      }
      await locksFree(f);
    } finally {
      f.clean();
    }
  });
}

for (const [ignoredPath, replayedPath] of [
  ['collision', 'collision'],
  ['collision', 'collision/file'],
  ['collision/file', 'collision'],
]) {
  test(`sync refuses an identical ignored ${JSON.stringify(ignoredPath)} replayed ${JSON.stringify(replayedPath)}`, async () => {
    const f: Fixture = await remoteFixture();
    try {
      put(f, '.gitignore', 'collision*\n');
      await command(['git', 'add', '.gitignore'], f.root);
      await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
      await command(['git', 'push'], f.root);
      put(f, replayedPath, 'replay bytes\n');
      await command(['git', '--literal-pathspecs', 'add', '-f', '--', replayedPath], f.root);
      await command(['git', 'commit', '-m', 'add replay'], f.root);
      await command(['git', '--literal-pathspecs', 'rm', '-q', '-r', '--', replayedPath], f.root);
      await command(['git', 'commit', '-m', 'remove replay'], f.root);
      const other: string = resolve(f.home, 'other');
      await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
      await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
      await command(['git', 'config', 'user.name', 'Test'], other);
      if (ignoredPath === 'collision') put({ ...f, root: other }, 'collision', 'shared\n');
      else {
        mkdirSync(resolve(other, 'collision'), { recursive: true });
        put({ ...f, root: other }, 'collision/file', 'shared\n');
      }
      await command(
        ['git', '--literal-pathspecs', 'add', '-f', '--', ignoredPath === 'collision' ? 'collision' : 'collision/file'],
        other,
      );
      await command(['git', 'commit', '-m', 'track collision'], other);
      await command(['git', 'push'], other);
      put(f, ignoredPath, 'shared\n');
      put(f, 'issues/record', 'eligible issue\n');
      const before: string[] = await snapshot(f);
      const result: Result = await cli(f, ['sync']);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('ignored operator paths');
      expect(result.stderr).toContain(ignoredPath === 'collision' ? 'collision' : 'collision/file');
      expect(readFileSync(resolve(f.root, ignoredPath), 'utf8')).toBe('shared\n');
      expect(readFileSync(resolve(f.root, 'issues/record'), 'utf8')).toBe('eligible issue\n');
      expect(await snapshot(f)).toEqual(before);
      await locksFree(f);
    } finally {
      f.clean();
    }
  });
}

test('sync refusing a mixed ignored batch names only the differing path', async () => {
  const f: Fixture = await remoteFixture();
  try {
    put(f, '.gitignore', 'collision*\n');
    await command(['git', 'add', '.gitignore'], f.root);
    await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
    await command(['git', 'push'], f.root);
    const other: string = resolve(f.home, 'other');
    await command(['git', 'clone', resolve(f.home, 'remote.git'), other]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], other);
    await command(['git', 'config', 'user.name', 'Test'], other);
    put({ ...f, root: other }, 'collision', 'shared\n');
    put({ ...f, root: other }, 'collision-diff', 'shared\n');
    await command(['git', '--literal-pathspecs', 'add', '-f', '--', 'collision', 'collision-diff'], other);
    await command(['git', 'commit', '-m', 'track collisions'], other);
    await command(['git', 'push'], other);
    put(f, 'collision', 'shared\n');
    put(f, 'collision-diff', 'operator bytes\n');
    put(f, 'issues/record', 'eligible issue\n');
    const before: string[] = await snapshot(f);
    const result: Result = await cli(f, ['sync']);
    expect(result.code).not.toBe(0);
    const lines: string[] = result.stderr.split('\n');
    expect(lines).toContain('collision-diff');
    expect(lines).not.toContain('collision');
    expect(readFileSync(resolve(f.root, 'collision'), 'utf8')).toBe('shared\n');
    expect(readFileSync(resolve(f.root, 'collision-diff'), 'utf8')).toBe('operator bytes\n');
    expect(readFileSync(resolve(f.root, 'issues/record'), 'utf8')).toBe('eligible issue\n');
    expect(await snapshot(f)).toEqual(before);
    await locksFree(f);
  } finally {
    f.clean();
  }
});

test('sync permits harmless ignored paths while preserving tracked autostash edits', async () => {
  const f: Fixture = await remoteFixture();
  try {
    put(f, '.gitignore', 'collision*\n');
    put(f, 'collision-other', 'tracked sibling\n');
    await command(['git', 'add', '-f', '.gitignore', 'collision-other'], f.root);
    await command(['git', 'commit', '-m', 'ignore operator files'], f.root);
    await command(['git', 'push'], f.root);
    await advance(f, 'landed');
    put(f, 'collision', 'ignored bytes\n');
    put(f, 'file', 'operator tracked bytes\n');
    put(f, 'issues/record');
    const result: Result = await cli(f, ['sync']);
    expect(result.code, result.stderr).toBe(0);
    expect(readFileSync(resolve(f.root, 'collision'), 'utf8')).toBe('ignored bytes\n');
    expect(readFileSync(resolve(f.root, 'file'), 'utf8')).toBe('operator tracked bytes\n');
    expect(await command(['git', 'diff', '--cached', '--name-only'], f.root)).toBe('');
    await locksFree(f);
  } finally {
    f.clean();
  }
});
