import { test, expect } from 'bun:test';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { command, finishCaptured, spawnFiles, type Captured, type Result } from '../src/shell';
import { readState, type State } from '../src/state';
import { z } from 'zod';
import { cli, entry, fakeSystemctl, killTree, leaf, leafTempRoot, yaml, type Fixture } from './helpers';
import { delivered, hcFixture, setPrefixes, type HcFixture } from './hc-fixture';

type DispatchFixture = HcFixture;

// akrogon's mutating hc calls (start, send, keys, kill, rm, label) recorded by the fixture's hc shim.
function mutating(f: DispatchFixture): string[][] {
  return readFileSync(f.core.shimLog, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => line.split('\t'))
    .filter((argv) => ['run', 'send', 'keys', 'kill', 'rm', 'label'].includes(argv[0]));
}

// Every task any seat received, removed terminals included (the stand-in task logs outlive them).
function prompts(f: DispatchFixture): string[] {
  return readdirSync(f.core.standin)
    .filter((name) => name.endsWith('.tasks'))
    .flatMap((name) => readFileSync(resolve(f.core.standin, name), 'utf8').split('\n'))
    .filter((text) => text !== '');
}

async function next(
  f: DispatchFixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  cwd: string = f.root,
): Promise<Result> {
  return cli(f, ['next', ...args], cwd, { ...f.env, ...env });
}

// Waits until every live seat of the leaf has finished its turn: an automatic pass then prompts it
// again (a turn that ended without a phase move, plan D13).
async function idle(f: DispatchFixture, slug: string): Promise<void> {
  for (const seat of await f.core.terminals({ 'akrogon.leaf': slug }, false))
    await f.core.waitFor(seat.address, (t) => t.status?.state === 'idle');
}

/** Allocate a leaf with a manual pass, then let its seat finish the turn so an automatic pass would prompt. */
async function allocatedIdle(f: DispatchFixture, slug: string): Promise<string> {
  const path: string = leaf(f, slug, 'plan.synthesis');
  const run: Result = await next(f, [slug]);
  expect(run.code).toBe(0);
  expect((await delivered(f, slug)).length).toBeGreaterThan(0);
  await idle(f, slug);
  return path;
}

// Starts a new evidence window: clears the hc call record and returns the task count so far.
function resetEvidence(f: DispatchFixture): number {
  writeFileSync(f.core.shimLog, '');
  return prompts(f).length;
}

test('automatic next --wake does nothing for a paused repo', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    const path: string = await allocatedIdle(f, 'build');
    const control: Result = await next(f, ['--wake']);
    expect(control.code).toBe(0);
    expect((await delivered(f, 'build')).length).toBe(2);
    await idle(f, 'build');
    const before: number = resetEvidence(f);
    const worktree: string = readState(path).worktree as string;
    expect((await cli(f, ['pause'])).code).toBe(0);
    const gated: Result = await next(f, ['--wake']);
    expect(gated.code).toBe(0);
    expect(gated.stderr).toBe('');
    expect(mutating(f)).toEqual([]);
    expect(prompts(f)).toHaveLength(before);
    expect(readState(path).phase).toBe('plan.synthesis');
    expect(existsSync(worktree)).toBe(true);
  } finally {
    await f.clean();
  }
});

// A second repo's space in the fixture core's herdr-app document, so the core holds both repos.
async function addSpace(f: DispatchFixture, name: string, folder: string): Promise<void> {
  const doc = z
    .object({ version: z.number(), value: z.object({ spaces: z.array(z.unknown()) }).passthrough() })
    .parse(await f.core.rpc('doc.get', { name: 'herdr-app' }));
  await f.core.rpc('doc.set', {
    name: 'herdr-app',
    value: { ...doc.value, spaces: [...doc.value.spaces, { folder, id: `sp-${name}`, name, tabs: [] }] },
    version: doc.version,
  });
}

async function secondRepo(f: Fixture, name: string): Promise<string> {
  const root: string = resolve(f.home, name);
  mkdirSync(resolve(root, 'issues/open'), { recursive: true });
  await command(['git', 'init', '-b', 'main', root]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], root);
  await command(['git', 'config', 'user.name', 'Test'], root);
  writeFileSync(resolve(root, 'file'), 'initial\n');
  writeFileSync(resolve(root, '.gitignore'), '.env\n');
  await command(['git', 'add', '.'], root);
  await command(['git', 'commit', '-m', 'initial'], root);
  await command(['git', 'init', '--bare', '-b', 'main', resolve(f.home, `${name}.git`)]);
  await command(['git', 'remote', 'add', 'origin', resolve(f.home, `${name}.git`)], root);
  await command(['git', 'push', 'origin', 'HEAD:main'], root);
  yaml(resolve(root, 'issues/config.yaml'), { checks: { test: 'bun test' }, grounding: 'none' });
  const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as Record<string, unknown>;
  const repos = (global.repos ?? {}) as Record<string, string>;
  repos[name] = root;
  yaml(resolve(f.home, 'config.yaml'), { ...global, repos });
  return root;
}

function leafIn(root: string, repo: string, slug: string, phase: string, extra: object = {}): string {
  const path: string = resolve(root, 'issues/open/issue', slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), {
    slug,
    phase,
    created: '2026-09-10',
    repo,
    'blocked-by': [],
    ...extra,
  });
  return path;
}

test('resume skips the paused repo and still dispatches the unpaused repo', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'xleaf', 'plan.synthesis');
    const x: string = resolve(f.root, 'issues/open/issue/xleaf');
    expect((await next(f, ['xleaf'])).code).toBe(0);
    const yRoot: string = await secondRepo(f, 'y');
    const yPath: string = leafIn(yRoot, 'y', 'yleaf', 'plan.synthesis');
    setPrefixes(f, { repo: 'rp', y: 'yp' });
    await addSpace(f, 'y', yRoot);
    expect((await next(f, ['yleaf'], {}, yRoot)).code).toBe(0);
    expect(readState(yPath).tab).not.toBe(undefined);
    await idle(f, 'xleaf');
    await idle(f, 'yleaf');
    const yBefore: number = (await delivered(f, 'yleaf')).length;
    const xBefore: number = (await delivered(f, 'xleaf')).length;
    resetEvidence(f);
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['--resume']);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'yleaf')).length).toBeGreaterThan(yBefore);
    expect((await delivered(f, 'xleaf')).length).toBe(xBefore);
    expect(readState(x).phase).toBe('plan.synthesis');
  } finally {
    await f.clean();
  }
});

const appliedBatch: object = {
  attempt: 't1',
  built_on: 'base',
  holder: { base: 'base', head: 'head' },
  applied: true,
};

test('phase move in a paused repo commits while its merge wake prompts nothing', async () => {
  for (const paused of [true, false]) {
    const f: DispatchFixture = await hcFixture();
    try {
      leaf(f, 'mover', 'implement');
      leaf(f, 'holder', 'merge', { batch: appliedBatch });
      if (paused) expect((await cli(f, ['pause'])).code).toBe(0);
      const moved: Result = await cli(f, ['phase', 'mover', 'check.review', '--slot', 'A'], f.root, f.env);
      expect(moved.code).toBe(0);
      expect(readState(resolve(f.root, 'issues/open/issue/mover')).phase).toBe('check.review');
      if (paused) {
        expect(prompts(f)).toEqual([]);
        expect(mutating(f)).toEqual([]);
      } else {
        expect(prompts(f).length).toBeGreaterThan(0);
      }
    } finally {
      await f.clean();
    }
  }
});

test('manual next target dispatches a paused repo and stays paused', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['build']);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'build')).length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    await f.clean();
  }
});

test('manual next all dispatches a paused repo and stays paused', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['--all']);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'build')).length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    await f.clean();
  }
});

test('bare manual next dispatches a paused repo and stays paused', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, []);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'build')).length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
  } finally {
    await f.clean();
  }
});

test('manual next target completes a leaf and dispatches its dependent while paused', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'done', 'merged', {}, 'done-issue');
    const dependent: string = leaf(f, 'dep', 'plan.synthesis', { 'blocked-by': ['done'] }, 'dep-issue');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['done']);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'dep')).some((prompt) => prompt.seat === 'a')).toBe(true);
    expect(readState(dependent).tab).not.toBe(undefined);
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8'))).toEqual({ repo: true });
  } finally {
    await f.clean();
  }
});

test('manual next target prompts the waiting merge holder while paused', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'build', 'plan.synthesis', {}, 'build-issue');
    leaf(f, 'holder', 'merge', { batch: appliedBatch }, 'merge-issue');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await next(f, ['build']);
    expect(run.code).toBe(0);
    expect((await delivered(f, 'holder')).some((prompt) => prompt.seat === 'b')).toBe(true);
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8'))).toEqual({ repo: true });
  } finally {
    await f.clean();
  }
});

test('unpause relaunches closed seats with the current seat config', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'build', 'plan.synthesis');
    expect((await next(f, ['build'])).code).toBe(0);
    const global = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as {
      slots: Record<string, Record<string, string>>;
    };
    global.slots.a.model = 'fresh-model';
    yaml(resolve(f.home, 'config.yaml'), global);
    const closed: string = z.string().parse(readState(path).seat.A?.address);
    expect((await f.core.hc(['kill', closed])).code).toBe(0);
    expect((await f.core.hc(['rm', closed])).code).toBe(0);
    resetEvidence(f);
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('unpaused');
    const seats = await f.core.terminals({ 'akrogon.leaf': 'build' }, false);
    expect(seats).toHaveLength(1);
    expect(f.core.tasks(seats[0].address).length).toBeGreaterThan(0);
    const pid: number = z.number().parse(seats[0].pid);
    expect(readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0')).toContain('fresh-model');
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([]);
    expect(readState(path).tab).not.toBe(undefined);
  } finally {
    await f.clean();
  }
});

test('unpause runs deferred merged cleanup', async () => {
  const f: DispatchFixture = await hcFixture({ window: 'open' });
  f.env = { ...f.env, ...fakeSystemctl(f).env };
  try {
    // The live leaf's seat terminal holds its tab in the repo space, the shape a recorded tab needs to be closable.
    const tab: string = 'aklivetab';
    leaf(f, 'live', 'merged', { tab }, 'issue-a');
    leaf(f, 'dead', 'merged', { tab: 'akdeadtab' }, 'issue-b');
    const seat: Result = await f.core.hc([
      'run',
      '--bg',
      '--json',
      '--no-parent',
      '--cwd',
      f.home,
      '--label',
      'akrogon=1',
      '--label',
      'akrogon.repo=repo',
      '--label',
      'akrogon.leaf=live',
      '--label',
      'akrogon.seat=a',
      '--label',
      `herdr.space=sp-${f.core.session}`,
      '--label',
      `herdr.tab=${tab}`,
      '--',
      'cat',
    ]);
    expect(seat.code).toBe(0);
    const { createHash } = await import('node:crypto');
    const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
    const temp: string = resolve(leafTempRoot(f), hex(f.root).slice(0, 4), hex(f.root + '\n' + 'dead').slice(0, 8));
    mkdirSync(temp, { recursive: true });
    writeFileSync(resolve(temp, 'scratch'), 'x');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    expect(f.core.appCalls().map((call) => call.argv)).toContainEqual(['do', 'tab.close', '--id', tab]);
    expect(existsSync(temp)).toBe(false);
  } finally {
    await f.clean();
  }
});

test('unpause starts tab-less leaves only through the dependent cascade', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'm', 'merged');
    leaf(f, 'c', 'plan.synthesis', { 'blocked-by': ['m'] });
    leaf(f, 'd', 'plan.synthesis');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).toBe(0);
    const c: State = readState(resolve(f.root, 'issues/open/issue/c'));
    expect(c.tab).not.toBe(undefined);
    expect((await delivered(f, 'c')).length).toBeGreaterThan(0);
    const d: State = readState(resolve(f.root, 'issues/open/issue/d'));
    expect(d.tab).toBe(undefined);
    expect(d.worktree).toBe(undefined);
  } finally {
    await f.clean();
  }
});

test('unpause starts an open dependent of an already closed leaf', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'm', 'merged', {}, 'm-owner');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(resolve(f.root, 'issues/open/m-owner'), resolve(f.root, 'issues/closed/m-owner'));
    leaf(f, 'c', 'plan.synthesis', { 'blocked-by': ['m'] });
    expect((await cli(f, ['pause'])).code).toBe(0);
    expect((await cli(f, ['unpause'], f.root, f.env)).code).toBe(0);
    expect(readState(resolve(f.root, 'issues/open/issue/c')).tab).not.toBe(undefined);
  } finally {
    await f.clean();
  }
});

test('unpause failure exits non-zero with the pause cleared', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    const path: string = leaf(f, 'z', 'plan.synthesis', { worktree: '/nonexistent-z' });
    writeFileSync(resolve(path, 'state.yaml'), 'slug: [');
    expect((await cli(f, ['pause'])).code).toBe(0);
    const run: Result = await cli(f, ['unpause'], f.root, f.env);
    expect(run.code).not.toBe(0);
    expect(run.stdout).toContain('unpaused');
    expect(run.stderr.length).toBeGreaterThan(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([]);
  } finally {
    await f.clean();
  }
});

test('invalid pause file fails automatic and manual next naming the file', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    leaf(f, 'build', 'plan.synthesis');
    const file: string = resolve(f.home, 'paused.yaml');
    writeFileSync(file, '["not", "a", "map"]\n');
    expect((await next(f, ['--resume'])).code).not.toBe(0);
    expect((await next(f, ['--resume'])).stderr).toContain(file);
    expect((await next(f, ['build'])).code).not.toBe(0);
    expect((await next(f, ['build'])).stderr).toContain(file);
  } finally {
    await f.clean();
  }
});

test('invalid pause file fails an automatic wake naming the file', async () => {
  const f: DispatchFixture = await hcFixture();
  try {
    const file: string = resolve(f.home, 'paused.yaml');
    writeFileSync(file, '[invalid]\n');
    const run: Result = await next(f, ['--wake']);
    expect(run.code).not.toBe(0);
    expect(run.stderr).toContain(file);
    expect(mutating(f)).toEqual([]);
  } finally {
    await f.clean();
  }
});

function barrierGit(bin: string, barrier: string, realGit: string): void {
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    resolve(bin, 'git'),
    `#!/bin/sh\nif [ "$1" = "fetch" ] && [ ! -e '${barrier}/done' ]; then\n  touch '${barrier}/entered'\n  while [ ! -e '${barrier}/release' ]; do sleep 0.05; done\n  touch '${barrier}/done'\nfi\nexec '${realGit}' "$@"\n`,
  );
  chmodSync(resolve(bin, 'git'), 0o755);
}

async function waitFor(path: string, ms: number): Promise<void> {
  const start: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - start > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(50);
  }
}

function cliEnv(f: DispatchFixture, extra: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    ...extra,
  };
}

test('race A: pause recorded before the locked merge section suppresses the launch', async () => {
  const control: DispatchFixture = await hcFixture();
  try {
    const controlPath: string = leaf(control, 'holder', 'merge');
    const run: Result = await next(control, ['--resume']);
    expect(run.code).toBe(0);
    expect(readState(controlPath).batch?.owner).toBe('command');
  } finally {
    await control.clean();
  }
  const f: DispatchFixture = await hcFixture();
  const child: { current?: Bun.Subprocess } = {};
  try {
    const holderPath: string = leaf(f, 'holder', 'merge');
    const barrier: string = resolve(f.home, 'barrier');
    mkdirSync(barrier);
    const realGit: string = await command(['sh', '-c', 'command -v git']);
    barrierGit(resolve(f.home, 'gitbin'), barrier, realGit);
    const env: NodeJS.ProcessEnv = cliEnv(f, {
      ...f.env,
      PATH: `${resolve(f.home, 'gitbin')}:${f.env.PATH}`,
    });
    const spawned: { child: Bun.Subprocess; captured: Captured } = spawnFiles(
      [process.execPath, entry, 'next', '--resume'],
      {
        cwd: f.root,
        env,
      },
    );
    child.current = spawned.child;
    await waitFor(resolve(barrier, 'entered'), 15000);
    const paused: Result = await cli(f, ['pause']);
    expect(paused.code).toBe(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
    writeFileSync(resolve(barrier, 'release'), '');
    const { stdout, stderr, code }: Result = await finishCaptured(child.current, spawned.captured);
    expect({ stdout, stderr, code }).toMatchObject({ code: 0 });
    expect(mutating(f)).toEqual([]);
    expect(prompts(f)).toEqual([]);
    expect(readState(holderPath).batch?.owner).toBeUndefined();
  } finally {
    if (child.current !== undefined) killTree(child.current);
    await f.clean();
  }
});

test('race B: pause waits for a held launch lock, later automatic work is suppressed', async () => {
  const f: DispatchFixture = await hcFixture();
  const procs: Bun.Subprocess<'ignore', 'pipe', 'pipe'>[] = [];
  try {
    await allocatedIdle(f, 'build');
    const sent: number = resetEvidence(f);
    const barrier: string = resolve(f.home, 'barrier');
    mkdirSync(barrier);
    // The pass blocks inside its prompt send until the test releases it.
    const wrapper: string = resolve(f.home, 'hcbin-barrier');
    mkdirSync(wrapper, { recursive: true });
    const shim: string = z.string().parse(Bun.which('hc', { PATH: f.env.PATH }));
    writeFileSync(
      resolve(wrapper, 'hc'),
      `#!/bin/sh\nif [ "$1" = "send" ] && [ ! -e '${barrier}/done' ]; then\n  touch '${barrier}/entered'\n  while [ ! -e '${barrier}/release' ]; do sleep 0.05; done\n  touch '${barrier}/done'\nfi\nexec '${shim}' "$@"\n`,
    );
    chmodSync(resolve(wrapper, 'hc'), 0o755);
    const env: NodeJS.ProcessEnv = cliEnv(f, {
      ...f.env,
      PATH: `${wrapper}:${f.env.PATH}`,
    });
    const pass = Bun.spawn([process.execPath, entry, 'next', '--resume'], {
      cwd: f.root,
      env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pass);
    await waitFor(resolve(barrier, 'entered'), 15000);
    const pausing = Bun.spawn([process.execPath, entry, 'pause'], {
      cwd: f.root,
      env: cliEnv(f, {}),
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    procs.push(pausing);
    await Bun.sleep(500);
    expect(existsSync(resolve(f.home, 'paused.yaml'))).toBe(false);
    expect(pausing.exitCode).toBe(null);
    writeFileSync(resolve(barrier, 'release'), '');
    expect(await pass.exited).toBe(0);
    expect(await pausing.exited).toBe(0);
    expect(Object.keys(Bun.YAML.parse(readFileSync(resolve(f.home, 'paused.yaml'), 'utf8')) as object)).toEqual([
      'repo',
    ]);
    expect(prompts(f).length).toBeGreaterThan(sent);
    const before: number = mutating(f).length;
    await idle(f, 'build');
    const again: Result = await next(f, ['--resume']);
    expect(again.code).toBe(0);
    expect(mutating(f).length).toBe(before);
  } finally {
    for (const proc of procs) killTree(proc);
    await f.clean();
  }
});
