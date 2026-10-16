import { test, expect } from 'bun:test';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, command, type SpawnResult } from '../src/shell';

const worktreeRoot: string = resolve(import.meta.dir, '..');
const tempDirs: Set<string> = new Set();
process.on('exit', () => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function temp(): string {
  const dir: string = mkdtempSync(resolve(tmpdir(), 'akrogon-state-home-'));
  tempDirs.add(dir);
  return dir;
}

const globalConfig: object = {
  slots: {
    a: { harness: 'fake', model: 'a', effort: 'high' },
    b: { harness: 'fake', model: 'b', effort: 'medium' },
  },
  harnesses: { fake: 'fake --model {model} --effort {effort}' },
  repos: {},
};

// A fake tool root: the source tree plus dependencies, so `bun <root>/src/akrogon.ts`
// behaves like an installed akrogon checkout while its state lives inside <root>.
function toolCopy(home: string, config: object): string {
  const root: string = resolve(home, 'toolroot');
  mkdirSync(root, { recursive: true });
  for (const name of ['src', 'package.json', 'bunfig.toml', 'bun.lock'])
    cpSync(resolve(worktreeRoot, name), resolve(root, name), { recursive: true });
  cpSync(resolve(worktreeRoot, 'node_modules'), resolve(root, 'node_modules'), {
    recursive: true,
    verbatimSymlinks: true,
  });
  writeFileSync(resolve(root, 'config.yaml'), Bun.YAML.stringify(config));
  return root;
}

// Runs the copied CLI with AKROGON_HOME absent and HOME pointed at the fixture.
async function cli(
  root: string,
  home: string,
  args: string[],
  cwd: string = home,
  env: NodeJS.ProcessEnv = {},
): Promise<SpawnResult> {
  const { AKROGON_HOME, ...rest } = process.env;
  return spawnCaptured([process.execPath, resolve(root, 'src/akrogon.ts'), ...args], {
    cwd,
    env: { ...rest, HOME: home, ...env },
    timeout: 30000,
    killSignal: 'SIGKILL',
  });
}

const liveRecord = (): string =>
  Bun.YAML.stringify({
    token_hash: 'a'.repeat(64),
    pid: process.pid,
    start_time: readFileSync(`/proc/${process.pid}/stat`, 'utf8')
      .slice(readFileSync(`/proc/${process.pid}/stat`, 'utf8').lastIndexOf(')') + 2)
      .split(' ')[19],
    boot_id: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(),
    repo: 'r',
    leaf: 'l',
    check: 'c',
    state: 'live',
    run: 'run-1',
    slice: 'akrogon.slice',
    scope: '',
    unit: 'u',
    since: new Date().toISOString(),
  });

test('unmigrated state in the tool root moves to ~/.akrogon on the first command, once', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, { ...globalConfig, repos: { rel: '../repo' } });
  writeFileSync(resolve(root, 'paused.yaml'), 'repo: true\n');
  mkdirSync(resolve(root, 'runs/locks'), { recursive: true });
  const first: SpawnResult = await cli(root, home, ['config']);
  expect(first.code).toBe(0);
  expect(first.stderr).toContain(`moved state home: ${root} -> ${resolve(home, '.akrogon')}`);
  const moved: string = resolve(home, '.akrogon/config.yaml');
  expect(existsSync(moved)).toBe(true);
  const parsed = Bun.YAML.parse(readFileSync(moved, 'utf8')) as { repos: Record<string, string> };
  expect(parsed.repos.rel).toBe(resolve(root, '../repo'));
  expect(readFileSync(resolve(home, '.akrogon/paused.yaml'), 'utf8')).toBe('repo: true\n');
  expect(existsSync(resolve(home, '.akrogon/runs/locks'))).toBe(true);
});

test('with AKROGON_HOME unset, commands read and write state only under ~/.akrogon after cutover', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  await cli(root, home, ['config']);
  writeFileSync(resolve(root, 'config.yaml'), Bun.YAML.stringify({ ...globalConfig, max_active: 1 }));
  writeFileSync(resolve(root, 'paused.yaml'), 'other: true\n');
  const second: SpawnResult = await cli(root, home, ['config']);
  expect(second.code).toBe(0);
  expect(Bun.YAML.parse(second.stdout)).toMatchObject({ max_active: 3 });
  const repo: string = resolve(home, 'repo');
  mkdirSync(resolve(repo, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', repo]);
  writeFileSync(resolve(repo, 'issues/config.yaml'), 'grounding: none\n');
  const homeConfig = Bun.YAML.parse(readFileSync(resolve(home, '.akrogon/config.yaml'), 'utf8')) as Record<
    string,
    unknown
  > & { repos: Record<string, string> };
  homeConfig.repos = { repo };
  writeFileSync(resolve(home, '.akrogon/config.yaml'), Bun.YAML.stringify(homeConfig));
  const pause: SpawnResult = await cli(root, home, ['pause'], repo);
  expect(pause.code).toBe(0);
  expect(readFileSync(resolve(home, '.akrogon/paused.yaml'), 'utf8')).toContain('repo');
  expect(readFileSync(resolve(root, 'paused.yaml'), 'utf8')).toBe('other: true\n');
});

test('AKROGON_HOME selects the state home directory', async () => {
  const home: string = temp();
  const elsewhere: string = resolve(temp(), 'custom');
  const root: string = toolCopy(home, globalConfig);
  await cli(root, home, ['config'], home, { AKROGON_HOME: elsewhere });
  expect(existsSync(resolve(elsewhere, 'config.yaml'))).toBe(true);
  expect(existsSync(resolve(home, '.akrogon'))).toBe(false);
});

test('cutover is deferred while a live run record exists in the tool root runs/', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  mkdirSync(resolve(root, 'runs'), { recursive: true });
  writeFileSync(resolve(root, `runs/${'a'.repeat(64)}.yaml`), liveRecord());
  const skipped: SpawnResult = await cli(root, home, ['config']);
  expect(skipped.code).toBe(0);
  expect(skipped.stderr).not.toContain('moved state home');
  expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(false);
  rmSync(resolve(root, `runs/${'a'.repeat(64)}.yaml`));
  const moved: SpawnResult = await cli(root, home, ['config']);
  expect(moved.stderr).toContain('moved state home');
  expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(true);
});

test('cutover is deferred while a foreign process holds the tool root as cwd', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  const sleeper = Bun.spawn(['sleep', '20'], { cwd: root });
  try {
    const skipped: SpawnResult = await cli(root, home, ['config']);
    expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(false);
    expect(skipped.stderr).not.toContain('moved state home');
  } finally {
    sleeper.kill();
    await sleeper.exited;
  }
  const moved: SpawnResult = await cli(root, home, ['config']);
  expect(moved.stderr).toContain('moved state home');
});

test('cutover leaves no tracked file of the checkout modified or deleted', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 't@t'], root);
  await command(['git', 'config', 'user.name', 't'], root);
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'c'], root);
  await cli(root, home, ['config']);
  const status: string = await command(['git', 'status', '--porcelain'], root);
  // Tracked files must be untouched; untracked additions (a created .lock,
  // node_modules) are ignored state, not checkout changes.
  const trackedChanges: string[] = status.split('\n').filter((line) => line !== '' && !line.startsWith('??'));
  expect(trackedChanges).toEqual([]);
});

test('init registers into the state home config and leaves the checkout untouched', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  await cli(root, home, ['config']); // cut over first
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 't@t'], root);
  await command(['git', 'config', 'user.name', 't'], root);
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'c'], root);
  const repo: string = resolve(home, 'initrepo');
  mkdirSync(resolve(repo, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', repo]);
  await command(['git', 'config', 'user.email', 't@t'], repo);
  await command(['git', 'config', 'user.name', 't'], repo);
  writeFileSync(resolve(repo, 'proposal.yaml'), 'grounding: none\n');
  const init: SpawnResult = await cli(root, home, ['init', '--from', 'proposal.yaml'], repo);
  expect(init.code).toBe(0);
  const config = Bun.YAML.parse(readFileSync(resolve(home, '.akrogon/config.yaml'), 'utf8')) as {
    repos: Record<string, string>;
  };
  expect(config.repos.initrepo).toBe(repo);
  expect(readFileSync(resolve(root, 'config.yaml'), 'utf8')).toBe(Bun.YAML.stringify(globalConfig));
  const status: string = await command(['git', 'status', '--porcelain'], root);
  expect(status.split('\n').filter((line) => line !== '' && !line.startsWith('??'))).toEqual([]);
});

test('a command running at cutover defers it; after it ends, cutover proceeds and nothing writes the tool root', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  mkdirSync(resolve(root, 'runs/locks'), { recursive: true });
  writeFileSync(resolve(root, 'runs/locks/holder.slice'), '');
  const holder = Bun.spawn([process.execPath, '-e', 'setTimeout(() => {}, 30000)'], { cwd: root });
  const stat: string = readFileSync(`/proc/${holder.pid}/stat`, 'utf8');
  const recordFile: string = resolve(root, `runs/${'b'.repeat(64)}.yaml`);
  writeFileSync(
    recordFile,
    Bun.YAML.stringify({
      token_hash: 'b'.repeat(64),
      pid: holder.pid,
      start_time: stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19],
      boot_id: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(),
      repo: 'r',
      leaf: 'l',
      check: 'c',
      state: 'live',
      run: 'run-held',
      slice: 'holder.slice',
      scope: '',
      unit: 'u',
      since: new Date().toISOString(),
    }),
  );
  const deferred: SpawnResult = await cli(root, home, ['config']);
  expect(deferred.code).toBe(0);
  expect(deferred.stderr).not.toContain('moved state home');
  expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(false);
  // The old-code run ends: its record is removed, its lock file stays.
  rmSync(recordFile);
  holder.kill();
  await holder.exited;
  const moved: SpawnResult = await cli(root, home, ['config']);
  expect(moved.stderr).toContain('moved state home');
  expect(existsSync(resolve(home, '.akrogon/runs/locks/holder.slice'))).toBe(true);
  // Cutover is done; a marker newer than every tool-root file, then a later
  // command must write nothing to the tool root.
  const marker: string = resolve(home, 'marker');
  writeFileSync(marker, 'x');
  await new Promise((r) => setTimeout(r, 50)); // ordering guarantee for -newer
  await cli(root, home, ['config']);
  const stray: string = await command(
    ['sh', '-c', `find . -newer '${marker}' -not -path './node_modules/*' -type f`],
    root,
  );
  expect(stray.trim()).toBe('');
});

test('an explicit empty state home keeps using the tool root while cutover is deferred', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  const destination: string = resolve(home, 'custom');
  mkdirSync(resolve(root, 'runs'), { recursive: true });
  const record: string = resolve(root, `runs/${'a'.repeat(64)}.yaml`);
  writeFileSync(record, liveRecord());
  const deferred: SpawnResult = await cli(root, home, ['config'], home, { AKROGON_HOME: destination });
  expect(deferred.code).toBe(0);
  expect(Bun.YAML.parse(deferred.stdout)).toMatchObject({ max_active: 3 });
  expect(existsSync(resolve(destination, 'config.yaml'))).toBe(false);
  rmSync(record);
  const moved: SpawnResult = await cli(root, home, ['config'], home, { AKROGON_HOME: destination });
  expect(moved.code).toBe(0);
  expect(existsSync(resolve(destination, 'config.yaml'))).toBe(true);
});

test('cutover takes the global and admission locks even when the global lock file is absent', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  const locks: string = resolve(root, 'runs/locks');
  mkdirSync(locks, { recursive: true });
  const holder: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-x', resolve(locks, 'akrogon.slice'), 'sh', '-c', 'printf locked; cat >/dev/null'],
    { cwd: home, stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
  );
  const reader: ReadableStreamDefaultReader<Uint8Array> = holder.stdout.getReader();
  expect((await reader.read()).done).toBe(false);
  let finished: boolean = false;
  const pending: Promise<SpawnResult> = cli(root, home, ['config']).then((result: SpawnResult): SpawnResult => {
    finished = true;
    return result;
  });
  const mainLock: string = resolve(root, '.lock');
  try {
    const deadline: number = Date.now() + 5000;
    while (!existsSync(mainLock) && !finished && Date.now() < deadline) await Bun.sleep(10);
    expect(existsSync(mainLock)).toBe(true);
    const competing: SpawnResult = await spawnCaptured(['flock', '-n', mainLock, 'true'], { cwd: home });
    expect(competing.code).toBe(1);
    expect(finished).toBe(false);
    expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(false);
  } finally {
    holder.stdin.end();
    reader.releaseLock();
    expect(await holder.exited).toBe(0);
    await pending;
  }
});
