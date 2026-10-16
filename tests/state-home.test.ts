import { test, expect } from 'bun:test';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, command, type SpawnResult } from '../src/shell';
import { withAdmissionLock } from '../src/admission';

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

test('a process holding the tool root as cwd does not defer cutover', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  const sleeper = Bun.spawn(['sleep', '20'], { cwd: root });
  try {
    const moved: SpawnResult = await cli(root, home, ['config']);
    expect(moved.stderr).toContain('moved state home');
    expect(moved.code).toBe(0);
    expect(Bun.YAML.parse(moved.stdout)).toMatchObject({ max_active: 3 });
    expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(true);
  } finally {
    sleeper.kill();
    await sleeper.exited;
  }
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

test('an already-running command that admits a nested checked run defers cutover; after it ends, cutover proceeds and nothing writes the tool root', async () => {
  const home: string = temp();
  const remote: string = resolve(home, 'remote.git');
  await command(['git', 'init', '--bare', '-b', 'main', remote]);
  const repo: string = resolve(home, 'repo');
  await command(['git', 'clone', remote, repo]);
  await command(['git', 'config', 'user.email', 't@t'], repo);
  await command(['git', 'config', 'user.name', 't'], repo);
  mkdirSync(resolve(repo, 'issues/open'), { recursive: true });
  writeFileSync(resolve(repo, 'issues/config.yaml'), 'grounding: none\nenv: ["AKROGON_HOME"]\n');
  writeFileSync(resolve(repo, 'file'), 'x\n');
  await command(['git', 'add', '.'], repo);
  await command(['git', 'commit', '-m', 'c'], repo);
  await command(['git', 'push', '-u', 'origin', 'main'], repo);
  const root: string = toolCopy(home, { ...globalConfig, repos: { repo } });
  mkdirSync(resolve(home, 'holder'), { recursive: true });
  // Old-code shape: AKROGON_HOME unset, so the copied CLI resolves its state
  // home to the tool root and writes its admission record under runs/.
  const bin: string = resolve(home, 'bin');
  mkdirSync(bin);
  cpSync(resolve(worktreeRoot, 'tests/fake-systemd-run.sh'), resolve(bin, 'systemd-run'));
  cpSync(resolve(worktreeRoot, 'tests/fake-systemctl.sh'), resolve(bin, 'systemctl'));
  const env: NodeJS.ProcessEnv = {
    PATH: `${bin}:${process.env.PATH}`,
    FAKE_SYSTEMD_RUN_LOG: resolve(home, 'systemd-run.log'),
    FAKE_SYSTEMCTL_LOG: resolve(home, 'systemctl.log'),
    AKROGON_LEAF_TEMP_ROOT: resolve(home, 'leaf-temp'),
  };
  // A seeded live run record holds the cutover gate closed, so the outer
  // run-check defers its own migration and writes its admission record to the
  // tool root — the same shape an old-code command has when new code deploys.
  const runsDir: string = resolve(root, 'runs');
  const seed: string = resolve(runsDir, `${'a'.repeat(64)}.yaml`);
  mkdirSync(runsDir, { recursive: true });
  writeFileSync(seed, liveRecord());
  const nested: string = `${process.execPath} ${resolve(root, 'src/akrogon.ts')} run-check --holder ${resolve(
    home,
    'holder',
  )} -- sleep 1`;
  const { AKROGON_HOME: _drop, ...parentEnv } = process.env;
  const outer = Bun.spawn(
    [
      process.execPath,
      resolve(root, 'src/akrogon.ts'),
      'run-check',
      '--holder',
      resolve(home, 'holder'),
      '--',
      'sh',
      '-c',
      // Propagate the nested check's exit: `nested; sleep 6` alone reports the
      // sleep's success even when the nested run-check fails before admission.
      `${nested}; rc=$?; sleep 6; exit $rc`,
    ],
    {
      cwd: repo,
      env: { ...parentEnv, HOME: home, ...env },
      stdout: 'pipe',
      stderr: 'pipe',
    },
  );
  try {
    // Wait until the outer run's admission record exists in the tool root.
    const deadline: number = Date.now() + 10000;
    while (Date.now() < deadline && readdirSync(runsDir).filter((n) => n.endsWith('.yaml')).length < 2)
      await new Promise((r) => setTimeout(r, 50));
    rmSync(seed);
    const live: string[] = readdirSync(runsDir).filter((n) => n.endsWith('.yaml'));
    expect(live.length).toBe(1);
    // Cutover must defer while the admitted run is live.
    const deferred: SpawnResult = await cli(root, home, ['config']);
    expect(deferred.code).toBe(0);
    expect(deferred.stderr).not.toContain('moved state home');
    expect(existsSync(resolve(home, '.akrogon/config.yaml'))).toBe(false);
    // Still deferred while the nested checked run is being admitted.
    await new Promise((r) => setTimeout(r, 1500));
    const deferred2: SpawnResult = await cli(root, home, ['config']);
    expect(deferred2.stderr).not.toContain('moved state home');
    expect(await outer.exited).toBe(0);
    // The nested checked run completed inside the outer check: its own
    // "check run: 0" line was captured in the outer's log.
    const outerErr: string = await new Response(outer.stderr).text();
    const outerLog: string = outerErr
      .trim()
      .split('\n')
      .pop()!
      .replace(/^.*check run: \d+ /, '');
    expect(readFileSync(outerLog, 'utf8')).toContain('check run: 0');
  } finally {
    if (outer.exitCode === null) outer.kill();
    rmSync(seed, { force: true });
  }
  // After the old-code command ends, cutover proceeds and every remaining
  // state file (the slice locks its admission used) moves to the state home.
  const moved: SpawnResult = await cli(root, home, ['config']);
  expect(moved.stderr).toContain('moved state home');
  expect(readdirSync(resolve(home, '.akrogon/runs/locks')).length).toBeGreaterThan(0);
  // Nothing writes the tool root after cutover.
  const marker: string = resolve(home, 'marker');
  writeFileSync(marker, 'x');
  await new Promise((r) => setTimeout(r, 50));
  await cli(root, home, ['config']);
  const stray: string = await command(
    ['sh', '-c', `find . -newer '${marker}' -not -path './node_modules/*' -type f`],
    root,
  );
  expect(stray.trim()).toBe('');
}, 30000);

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

test('cutover takes the global lock and waits for an in-flight admission even when the global lock file is absent', async () => {
  const home: string = temp();
  const root: string = toolCopy(home, globalConfig);
  // An in-flight admission holds the tool root's admission.lock shared.
  const holder: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-s', resolve(root, 'admission.lock'), 'sh', '-c', 'printf locked; cat >/dev/null'],
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

test('an admission waits while the state-home move holds admission.lock', async () => {
  const home: string = temp();
  writeFileSync(resolve(home, 'config.yaml'), Bun.YAML.stringify(globalConfig));
  const previous: string | undefined = process.env.AKROGON_HOME;
  process.env.AKROGON_HOME = home;
  const holder: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-x', resolve(home, 'admission.lock'), 'sh', '-c', 'printf locked; cat >/dev/null'],
    { cwd: home, stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
  );
  const reader: ReadableStreamDefaultReader<Uint8Array> = holder.stdout.getReader();
  try {
    expect((await reader.read()).done).toBe(false);
    let admitted: boolean = false;
    const pending: Promise<void> = withAdmissionLock('akrogon.slice', async (): Promise<void> => {
      admitted = true;
    });
    await Bun.sleep(300);
    expect(admitted).toBe(false);
    holder.stdin.end();
    reader.releaseLock();
    expect(await holder.exited).toBe(0);
    await pending;
    expect(admitted).toBe(true);
  } finally {
    if (holder.exitCode === null) holder.kill();
    if (previous === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = previous;
  }
});
