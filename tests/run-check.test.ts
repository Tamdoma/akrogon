import { test, expect } from 'bun:test';
import { z } from 'zod';
import { basename, dirname, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import {
  fixture,
  cli,
  entry,
  leaf,
  yaml,
  fakeAkrogon,
  printedChecks,
  leafTempRoot,
  storeDir,
  unitBin,
  type Fixture,
} from './helpers';
import { command, finishCaptured, spawnCaptured, spawnFiles, type Result } from '../src/shell';
import { readRepo, setupCommand } from '../src/config';
import { readState, saveState } from '../src/state';
import { readTimings, type TimingEvent } from '../src/timing';
import type { Phase } from '../src/routing';

const sh = (script: string): string[] => ['sh', '-c', script];

const envNames = async (
  f: Fixture,
  cwd: string,
  env: NodeJS.ProcessEnv,
): Promise<{ code: number; names: Set<string>; stdout: string; stderr: string }> => {
  const result = await cli(f, ['run-check', '--', ...sh('env')], cwd, env);
  const names: Set<string> = new Set(
    result.stdout
      .split('\n')
      .filter((line: string) => line.includes('='))
      .map((line: string) => line.split('=', 1)[0]),
  );
  return { code: result.code, names, stdout: result.stdout, stderr: result.stderr };
};

async function leafWorktree(f: Fixture, slug: string): Promise<{ leafPath: string; worktree: string }> {
  const worktree: string = resolve(f.home, 'wt', slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  const leafPath: string = leaf(f, slug, 'implement', { worktree });
  return { leafPath, worktree: realpathSync(worktree) };
}

const baseEnv = (f: Fixture, extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  HOME: f.home,
  ...extra,
});

function runEnv(f: Fixture): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
    AKROGON_RUN: '',
    PATH: `${unitBin(f)}:${process.env.PATH}`,
  };
}

async function waitForFile(path: string, ms: number = 20000): Promise<void> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(20);
  }
}

async function waitForText(path: string, pattern: RegExp, ms: number = 20000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    if (existsSync(path) && pattern.test(readFileSync(path, 'utf8'))) return;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${pattern} in ${path}`);
    await Bun.sleep(50);
  }
}

function failLeaf(leafPath: string, reason: string, phase: Phase = 'implement'): void {
  saveState(leafPath, {
    ...readState(leafPath),
    phase: 'failed',
    failure: { cause: 'attempts', phase, slot: 'A', reason },
  });
}

function scratchRuns(f: Fixture): string[] {
  const root: string = leafTempRoot(f);
  return existsSync(root)
    ? readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          readdirSync(resolve(root, entry.name), { withFileTypes: true })
            .filter((run) => run.isDirectory() && run.name.startsWith('run-'))
            .map((run) => resolve(root, entry.name, run.name)),
        )
    : [];
}

test('run-check never recreates an owner moved between the existence check and lock acquisition', async () => {
  const f: Fixture = await fixture();
  try {
    const target: string = leaf(f, 'racing', 'implement');
    const owner: string = resolve(target, '..');
    const parked: string = resolve(f.root, 'issues/parked/issue');
    const marker: string = resolve(f.home, 'command-ran');
    const script: string = resolve(f.home, 'move-before-lock.ts');
    writeFileSync(
      script,
      `import { mock } from 'bun:test';
import * as fs from 'node:fs';
const originalExists = fs.existsSync;
const owner = ${JSON.stringify(owner)};
const parked = ${JSON.stringify(parked)};
let moved = false;
mock.module('node:fs', () => ({ ...fs, existsSync(path) {
  const exists = originalExists(path);
  if (path === owner && exists && !moved) {
    moved = true;
    fs.mkdirSync(${JSON.stringify(resolve(parked, '..'))}, { recursive: true });
    fs.renameSync(owner, parked);
  }
  return exists;
} }));
await import(${JSON.stringify(entry)});
`,
    );
    const result: Result = await spawnCaptured(
      [process.execPath, script, 'run-check', '--leaf', target, '--', 'touch', marker],
      {
        cwd: f.root,
        env: {
          ...process.env,
          HOME: f.home,
          AKROGON_HOME: f.home,
          AKROGON_RUN: '',
          AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
          PATH: `${resolve(f.home, 'unitbin')}:${process.env.PATH}`,
        },
      },
    );
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('owner gone');
    expect(existsSync(owner)).toBe(false);
    expect(existsSync(resolve(parked, 'racing/state.yaml'))).toBe(true);
    expect(existsSync(marker)).toBe(false);
    const refusals: string[] = [...new Bun.Glob('**/run-*/refusal.json').scanSync({ cwd: leafTempRoot(f) })];
    expect(refusals).toHaveLength(1);
    expect(readFileSync(resolve(leafTempRoot(f), refusals[0]), 'utf8')).toContain('owner gone');
    expect(existsSync(resolve(dirname(resolve(leafTempRoot(f), refusals[0])), '.akrogon-kept'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check builds an allowlisted env, copies declared names and omits undeclared ones', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { env: ['CHECK_TOKEN'], checks: {}, grounding: 'none' });
    const { worktree } = await leafWorktree(f, 'env-leaf');
    const { code, names } = await envNames(f, worktree, baseEnv(f, { CHECK_TOKEN: 'declared-value' }));
    expect(code).toBe(0);
    const allowed: Set<string> = new Set([
      'HOME',
      'PATH',
      'XDG_CACHE_HOME',
      'NODE_DISABLE_COMPILE_CACHE',
      'TMPDIR',
      'AKROGON_BASE',
      'AKROGON_RUN',
      'AKROGON_HOME',
      'AKROGON_CAPTURES',
      'DBUS_SESSION_BUS_ADDRESS',
      'LANG',
      'CHECK_TOKEN',
      'PWD',
      'SHLVL',
      '_',
    ]);
    for (const name of names) expect(allowed.has(name)).toBe(true);
    expect(names.has('CHECK_TOKEN')).toBe(true);
    expect(names.has('TMPDIR')).toBe(true);
    expect(names.has('AKROGON_BASE')).toBe(true);
    expect(names.has('AKROGON_CAPTURES')).toBe(true);
  } finally {
    f.clean();
  }
});

test('run-check cuts the session bus even when the caller has one', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { pass_env: ['DISPLAY'], checks: {}, grounding: 'none' });
    const { worktree } = await leafWorktree(f, 'bus-cut');
    const result: Result = await cli(
      f,
      ['run-check', '--', ...sh('printf "bus=%s\\n" "$DBUS_SESSION_BUS_ADDRESS"')],
      worktree,
      baseEnv(f, { DBUS_SESSION_BUS_ADDRESS: 'unix:path=/run/user/1000/bus', DISPLAY: ':0' }),
    );
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('bus=unix:path=/nonexistent');
  } finally {
    f.clean();
  }
});

test('run-check gives the command LANG=C.UTF-8 unless the repo declares LANG in env or pass_env', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'lang-default');
    const probe = 'printf "lang=%s\\n" "$LANG"; printf "Č" | wc -m';
    const plain: Result = await cli(f, ['run-check', '--', ...sh(probe)], worktree, baseEnv(f, { LANG: 'undeclared' }));
    expect(plain.code).toBe(0);
    expect(plain.stdout).toBe('lang=C.UTF-8\n1');
    const config: string = resolve(f.root, 'issues/config.yaml');
    const before: string = readFileSync(config, 'utf8');
    yaml(config, { ...(Bun.YAML.parse(before) as object), pass_env: ['LANG'] });
    const declared: Result = await cli(
      f,
      ['run-check', '--', ...sh(probe)],
      worktree,
      baseEnv(f, { LANG: 'akrogon-test-lang' }),
    );
    writeFileSync(config, before);
    expect(declared.code).toBe(0);
    expect(declared.stdout).toBe('lang=akrogon-test-lang\n2');
  } finally {
    f.clean();
  }
});

test('run-check drops an exported but undeclared variable', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'undeclared');
    const { code, names } = await envNames(f, worktree, baseEnv(f, { SECRET_TOKEN: 'not-declared' }));
    expect(code).toBe(0);
    expect(names.has('SECRET_TOKEN')).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check sets AKROGON_BASE to the merge base', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'base-leaf');
    const expected: string = await command(['git', 'merge-base', 'HEAD', 'origin/main'], worktree);
    const result = await cli(f, ['run-check', '--', ...sh('printf %s "$AKROGON_BASE"')], worktree, baseEnv(f));
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(expected);
  } finally {
    f.clean();
  }
});

test('run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'tmpdir-leaf');
    const ok = await cli(f, ['run-check', '--', ...sh('printf %s "$TMPDIR"')], worktree, baseEnv(f));
    expect(ok.code).toBe(0);
    expect(ok.stdout.startsWith(leafTempRoot(f))).toBe(true);
    expect(basename(ok.stdout).startsWith('run-')).toBe(true);
    expect(existsSync(ok.stdout)).toBe(false);
    expect(scratchRuns(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

// A red run marks its run root with .akrogon-kept and leaves it where the
// command printed it, so evidence the child wrote under $TMPDIR stays
// readable until the leaf temp is released.
test('a red run-check run keeps its run root marked .akrogon-kept and its files readable', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'tmpdir-red');
    const result = await cli(
      f,
      [
        'run-check',
        '--',
        ...sh('mkdir -p "$TMPDIR/evidence" && echo kept > "$TMPDIR/evidence/f"; printf %s "$TMPDIR"; exit 7'),
      ],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(7);
    const root: string = result.stdout.split('\n').pop()!;
    expect(existsSync(resolve(root, '.akrogon-kept'))).toBe(true);
    expect(existsSync(resolve(root, '.owner'))).toBe(true);
    expect(readFileSync(resolve(root, 'evidence/f'), 'utf8')).toBe('kept\n');
    const runs: string[] = [...new Bun.Glob('*/*/run-*').scanSync({ cwd: leafTempRoot(f), onlyFiles: false })].map(
      (entry) => resolve(leafTempRoot(f), entry),
    );
    expect(runs).toEqual([root]);
  } finally {
    f.clean();
  }
});

// A command that deleted its own $TMPDIR still exits with its code and leaves
// no run root: there is nothing left to mark.
test('a red run-check command that deleted its own TMPDIR keeps its exit and leaves no run root', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'tmpdir-gone');
    const result = await cli(f, ['run-check', '--', ...sh('rm -rf "$TMPDIR"; exit 7')], worktree, baseEnv(f));
    expect(result.code).toBe(7);
    expect(scratchRuns(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('run-check gives the command a private run root as TMPDIR and captures output live in the holder', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'capture-leaf');
    const callerTmp: string = resolve(f.home, 'caller-tmp');
    mkdirSync(callerTmp);
    const result = await cli(
      f,
      ['run-check', '--', ...sh('ls -A "$TMPDIR"')],
      worktree,
      baseEnv(f, { TMPDIR: callerTmp }),
    );
    expect(result.code).toBe(0);
    // The run root holds only the .owner record: captures live in the holder,
    // never in the caller TMPDIR.
    expect(result.stdout).toMatch(/^\.owner$/m);
    expect(readdirSync(callerTmp)).toEqual([]);
    expect(readdirSync(resolve(leafPath, 'implementation')).every((name) => !name.startsWith('capture-'))).toBe(true);
  } finally {
    f.clean();
  }
});

test('concurrent run-check invocations get distinct TMPDIR roots', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'concurrent');
    const [a, b] = await Promise.all([
      cli(f, ['run-check', '--', ...sh('printf %s "$TMPDIR"')], worktree, baseEnv(f)),
      cli(f, ['run-check', '--', ...sh('printf %s "$TMPDIR"')], worktree, baseEnv(f)),
    ]);
    expect(a.code).toBe(0);
    expect(b.code).toBe(0);
    expect(a.stdout).not.toBe(b.stdout);
  } finally {
    f.clean();
  }
});

test('run-check refuses a forbidden caller env before the command runs', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'refused');
    const values: Record<string, string> = {
      NODE_PATH: '/x',
      BUN_OPTIONS: '--no-env-file',
      BUN_INSTALL_CACHE_DIR: resolve(f.home, 'bcache'),
      FFMPEG_BIN: '/x',
      CHROME_PATH: '/x',
      CDP_BROWSER_BINARY: '/x',
    };
    for (const [name, value] of Object.entries(values)) {
      const marker: string = resolve(f.home, `marker-${name}`);
      const result = await cli(
        f,
        ['run-check', '--', ...sh(`touch ${marker}`)],
        worktree,
        baseEnv(f, { [name]: value }),
      );
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(name);
      expect(result.stderr).toContain('Refusing');
      expect(existsSync(marker)).toBe(false);
      expect(scratchRuns(f)).toEqual([]);
    }
  } finally {
    f.clean();
  }
});

test('run-check refuses a caller-side global bunfig before the command runs', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'bunfig');
    const marker: string = resolve(f.home, 'marker');
    writeFileSync(resolve(f.home, '.bunfig.toml'), '');
    const homeResult = await cli(f, ['run-check', '--', ...sh(`touch ${marker}`)], worktree, baseEnv(f));
    expect(homeResult.code).not.toBe(0);
    expect(homeResult.stderr).toContain('.bunfig.toml');
    expect(existsSync(marker)).toBe(false);
    const xdg: string = resolve(f.home, 'xdg');
    mkdirSync(xdg, { recursive: true });
    writeFileSync(resolve(xdg, '.bunfig.toml'), '');
    const home2: string = resolve(f.home, 'home2');
    mkdirSync(home2);
    const xdgResult = await cli(f, ['run-check', '--', ...sh(`touch ${marker}`)], worktree, {
      HOME: home2,
      XDG_CONFIG_HOME: xdg,
    });
    expect(xdgResult.code).not.toBe(0);
    expect(xdgResult.stderr).toContain(resolve(xdg, '.bunfig.toml'));
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check writes .owner with pid, boot_id and started while the command runs', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'owner-leaf');
    const result = await cli(f, ['run-check', '--', ...sh('cat "$TMPDIR/.owner"')], worktree, baseEnv(f));
    expect(result.code).toBe(0);
    const owner = JSON.parse(result.stdout);
    expect(typeof owner.pid).toBe('number');
    expect(owner.boot_id).toBe(readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim());
    expect(Number.isNaN(Date.parse(owner.started))).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check echoes child output, returns its exit code and lands the log in the leaf on failure', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'lint-leaf');
    const result = await cli(
      f,
      ['run-check', '--name', 'lint', '--', ...sh('echo out-line; echo err-line >&2; exit 3')],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(3);
    expect(result.stdout).toContain('out-line');
    expect(result.stderr).toContain('err-line');
    const logs: string[] = readdirSync(resolve(leafPath, 'implementation')).filter((name) =>
      /^check-lint-.+\.log$/.test(name),
    );
    expect(logs.length).toBe(1);
    const log: string = readFileSync(resolve(leafPath, 'implementation', logs[0]), 'utf8');
    expect(log).toContain('out-line');
    expect(log).toContain('err-line');
  } finally {
    f.clean();
  }
});

test('run-check --leaf overrides the derived leaf and defaults name to run', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'derived');
    const override: string = leaf(f, 'other-leaf', 'implement', {});
    const result = await cli(
      f,
      ['run-check', '--leaf', override, '--', ...sh('echo marker-line')],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(0);
    const logs: string[] = readdirSync(resolve(override, 'implementation')).filter((name) =>
      /^check-run-.+\.log$/.test(name),
    );
    expect(logs.length).toBe(1);
    expect(readFileSync(resolve(override, 'implementation', logs[0]), 'utf8')).toContain('marker-line');
    expect(existsSync(resolve(f.root, 'issues/open/issue/derived/implementation'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check on the registered checkout requires --holder and writes the log there', async () => {
  const f: Fixture = await fixture();
  try {
    const refused = await cli(f, ['run-check', '--', ...sh('true')], f.root, baseEnv(f));
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('--holder');
    const holder: string = resolve(f.home, 'holder');
    mkdirSync(holder);
    const result = await cli(
      f,
      ['run-check', '--name', 'h', '--holder', holder, '--', ...sh('echo holder-line')],
      f.root,
      baseEnv(f),
    );
    expect(result.code).toBe(0);
    const logs: string[] = readdirSync(holder).filter((name) => /^check-h-.+\.log$/.test(name));
    expect(logs.length).toBe(1);
    expect(readFileSync(resolve(holder, logs[0]), 'utf8')).toContain('holder-line');
    const both = await cli(
      f,
      ['run-check', '--leaf', f.root, '--holder', holder, '--', ...sh('true')],
      f.root,
      baseEnv(f),
    );
    expect(both.code).not.toBe(0);
    expect(both.stderr).toContain('--leaf');
    expect(both.stderr).toContain('--holder');
    const empty = await cli(f, ['run-check'], f.root, baseEnv(f));
    expect(empty.code).not.toBe(0);
    expect(empty.stderr).toContain('argv');
  } finally {
    f.clean();
  }
});

test('run-check creates new ordinary and chart direct holders on first use', async () => {
  const f: Fixture = await fixture();
  try {
    mkdirSync(resolve(f.root, 'issues/chart/new-chart'), { recursive: true });
    for (const holder of [resolve(f.home, 'new-holder'), resolve(f.root, 'issues/chart/new-chart/direct')]) {
      const result: Result = await cli(f, [
        'run-check',
        '--holder',
        holder,
        '--name',
        'new',
        '--',
        'echo',
        'new-output',
      ]);
      expect(result.code, result.stderr).toBe(0);
      expect(result.stdout).toBe('new-output');
      const logs: string[] = readdirSync(holder).filter((name) => name.startsWith('check-new-'));
      expect(logs).toHaveLength(1);
      expect(readFileSync(resolve(holder, logs[0]), 'utf8')).toBe('new-output\n');
      expect(readdirSync(holder).filter((name) => name.startsWith('capture-'))).toEqual([]);
    }
  } finally {
    f.clean();
  }
});

test('run-check refuses forbidden env for a repo without setup', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'no-setup');
    const result = await cli(
      f,
      ['run-check', '--', ...sh('echo never-ran')],
      worktree,
      baseEnv(f, { CDP_BROWSER_BINARY: '/x' }),
    );
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('CDP_BROWSER_BINARY');
    expect(result.stdout).not.toContain('never-ran');
  } finally {
    f.clean();
  }
});

test('constructed PATH can dispatch akrogon itself', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    const { leafPath, worktree } = await leafWorktree(f, 'nested');
    const shim = fakeAkrogon(f);
    const result = await cli(
      f,
      ['run-check', '--name', 'outer', '--', 'akrogon', 'run-check', '--name', 'inner', '--', 'echo', 'nested-line'],
      worktree,
      { ...shim.env, HOME: f.home },
    );
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('nested-line');
    const logs: string[] = readdirSync(resolve(leafPath, 'implementation')).filter((name) =>
      /^check-(outer|inner)-.+\.log$/.test(name),
    );
    expect(logs.length).toBe(2);
  } finally {
    f.clean();
  }
});

test('printed checks refuse before setup and isolate both setup and check environments', async () => {
  const f: Fixture = await fixture();
  try {
    const marker: string = resolve(f.home, 'setup-output');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['CHECK_TOKEN'],
      grounding: 'none',
      setup: `mkdir -p node_modules && printf '%s|%s|%s' "$CHECK_TOKEN" "$EXTRA_TOKEN" "$TMPDIR" > '${marker}'`,
      checks: { probe: `cat '${marker}'; printf '\n%s|%s|%s' "$CHECK_TOKEN" "$EXTRA_TOKEN" "$TMPDIR"` },
    });
    const { worktree, leafPath } = await leafWorktree(f, 'printed');
    const check: ReturnType<typeof printedChecks> = printedChecks(f);
    const printed: string = z
      .object({ checks: z.record(z.string(), z.string()) })
      .parse(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout)).checks.probe;
    const refused: Result = await check(printed, worktree, { NODE_PATH: '/fixture' });
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('NODE_PATH');
    expect(existsSync(marker)).toBe(false);
    const passed: Result = await check(printed, worktree, { CHECK_TOKEN: 'declared', EXTRA_TOKEN: 'omit' });
    expect(passed.code).toBe(0);
    const lines: string[] = passed.stdout.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(lines[1]);
    const [token, extra, root]: string[] = lines[0].split('|');
    expect(token).toBe('declared');
    expect(extra).toBe('');
    expect(root.startsWith(leafTempRoot(f) + '/')).toBe(true);
    expect(existsSync(root)).toBe(false);
    expect(readdirSync(resolve(leafPath, 'implementation'))).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('pass_env names reach printed checks from the session without a .env entry', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      pass_env: ['SESSION_TOKEN'],
      grounding: 'none',
      setup: 'mkdir -p node_modules',
      checks: { probe: `printf '%s|%s' "$SESSION_TOKEN" "$EXTRA_TOKEN"` },
    });
    const { worktree } = await leafWorktree(f, 'session');
    const check: ReturnType<typeof printedChecks> = printedChecks(f);
    const printed: string = z
      .object({ checks: z.record(z.string(), z.string()) })
      .parse(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout)).checks.probe;
    const passed: Result = await check(printed, worktree, { SESSION_TOKEN: 'session', EXTRA_TOKEN: 'omit' });
    expect(passed.stderr).toMatch(/^run [0-9a-f-]{36}\ncapture probe: \S+ \S+\n.*check probe: 0 \S+\.log$/s);
    expect(passed.code).toBe(0);
    expect(passed.stdout).toBe('session|');
  } finally {
    f.clean();
  }
});

// C1: run-check refuses a configured merge_checks command in each of its three
// forms and names the merge-turn route plus the narrower reproduction; nothing starts.
test('run-check refuses a merge_checks entry in its words, sh -c and printed forms', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'merge-refusal');
    for (const setup of [true, false]) {
      const text = `touch ${resolve(f.home, 'marker-' + (setup ? 'setup' : 'plain'))} && echo suite`;
      yaml(resolve(f.root, 'issues/config.yaml'), {
        ...(setup ? { setup: 'mkdir -p node_modules' } : {}),
        checks: { unit: 'echo unit' },
        merge_checks: { suite: text },
        grounding: 'none',
      });
      const config = readRepo(f.repo, f.root).config;
      const forms: string[][] = [text.split(' '), ['sh', '-c', text], ['sh', '-c', setupCommand(config, text)]];
      for (const argv of forms) {
        const result: Result = await cli(f, ['run-check', '--', ...argv], worktree, baseEnv(f));
        expect(result.code).not.toBe(0);
        expect(result.stderr).toContain('akrogon verify --attempt');
        expect(result.stderr).toMatch(/narrow/i);
      }
      expect(existsSync(resolve(f.home, 'marker-' + (setup ? 'setup' : 'plain')))).toBe(false);
      expect(
        existsSync(resolve(leafPath, 'implementation'))
          ? readdirSync(resolve(leafPath, 'implementation')).filter((name) => name.startsWith('check-'))
          : [],
      ).toEqual([]);
    }
  } finally {
    f.clean();
  }
});

// C2: the printed form of a checks entry, the entry text with extra arguments
// and any other command still run.
test('run-check runs checks printed form, a merge_checks text with extra args and other commands', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { unit: 'echo unit-check' },
      merge_checks: { suite: 'echo suite', wide: 'printf %s a b' },
      grounding: 'none',
    });
    const { worktree } = await leafWorktree(f, 'still-runs');
    const printed: string = z
      .object({ checks: z.record(z.string(), z.string()) })
      .parse(Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout)).checks.unit;
    const fromConfig: Result = await printedChecks(f)(printed, worktree, baseEnv(f));
    expect(fromConfig.code).toBe(0);
    expect(fromConfig.stdout).toContain('unit-check');
    for (const argv of [
      ['echo', 'suite', 'extra'],
      ['sh', '-c', 'echo suite', 'extra'],
      ['echo', 'other'],
      // 'printf %s a b' configured: ['printf','%s','a b'] is not its words
      ['printf', '%s', 'a b'],
    ]) {
      // every allowed argv keeps its own exit status and output
      expect(argv.length).toBeGreaterThan(0);
      const result: Result = await cli(f, ['run-check', '--', ...argv], worktree, baseEnv(f));
      expect(result.code).toBe(0);
    }
  } finally {
    f.clean();
  }
});

test('run-check prints check name, exit and kept path on its own stderr line', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'path-print');
    const result: Result = await cli(
      f,
      ['run-check', '--name', 'probe', '--', ...sh('printf tail >&2; exit 7')],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(7);
    const match: RegExpMatchArray | null = result.stderr.match(/^check probe: 7 (\S+\.log)$/m);
    expect(match, 'stderr carries the check line at line start').not.toBeNull();
    const kept: string = match![1];
    expect(existsSync(kept)).toBe(true);
    expect(kept.startsWith(resolve(leafPath, 'implementation') + '/')).toBe(true);
    expect(readFileSync(kept, 'utf8')).toContain('tail');
  } finally {
    f.clean();
  }
});

test('run-check preserves failed executable errors and removes their capture directories', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'missing-executable');
    const captureRoot: string = resolve(f.home, 'capture');
    const executable: string = resolve(f.home, 'unavailable-check-executable');
    mkdirSync(captureRoot);
    const result: Result = await cli(f, ['run-check', '--', executable], worktree, baseEnv(f, { TMPDIR: captureRoot }));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(executable);
    expect(readdirSync(captureRoot)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('run-check refuses a failed leaf before admission for a worktree cwd and a --leaf target', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'doomed');
    const marker: string = resolve(f.home, 'doomed-ran');
    failLeaf(leafPath, 'operator asked', 'plan.synthesis');
    const cwd_result: Result = await cli(
      f,
      ['run-check', '--name', 'probe', '--', 'touch', marker],
      worktree,
      baseEnv(f),
    );
    expect(cwd_result.code).toBe(1);
    expect(cwd_result.stderr).toContain(
      `Refusing run-check probe for leaf ${f.repo}/doomed: the leaf is failed (operator asked).`,
    );
    expect(cwd_result.stderr).toContain('akrogon phase doomed plan.synthesis');
    expect(cwd_result.stderr).not.toMatch(/^run [0-9a-f-]{36}/m);
    expect(cwd_result.stderr).not.toMatch(/^capture /m);
    expect(existsSync(marker)).toBe(false);
    const folder: string = resolve(leafPath, 'implementation');
    if (existsSync(folder))
      expect(readdirSync(folder).every((name) => !name.startsWith('check-') && !name.startsWith('capture-'))).toBe(
        true,
      );
    expect(readTimings(f.root).some((event) => event.kind === 'check_refused' && event.name === 'probe')).toBe(true);
    const { worktree: healthy } = await leafWorktree(f, 'healthy');
    const leaf_result: Result = await cli(
      f,
      ['run-check', '--leaf', leafPath, '--', 'touch', marker],
      healthy,
      baseEnv(f),
    );
    expect(leaf_result.code).toBe(1);
    expect(leaf_result.stderr).toContain(`Refusing run-check run for leaf ${f.repo}/doomed`);
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check refuses a failed leaf with no failure record and names no recovery phase', async () => {
  const f: Fixture = await fixture();
  try {
    const leafPath: string = leaf(f, 'recordless', 'failed', {});
    const { worktree } = await leafWorktree(f, 'elsewhere');
    const marker: string = resolve(f.home, 'recordless-ran');
    const result: Result = await cli(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'probe', '--', 'touch', marker],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('the leaf is failed (failure record unavailable)');
    expect(result.stderr).toContain('the operator recovers it with akrogon phase recordless.');
    expect(result.stderr).not.toMatch(/phase recordless \S+/);
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});

test('run-check refuses a worker-scoped run for a failed leaf', async () => {
  const f: Fixture = await fixture();
  try {
    const leafPath: string = leaf(f, 'wfail', 'failed', {
      failure: { cause: 'attempts', phase: 'implement', slot: 'A', reason: 'seat A ended 3 turns without reporting' },
    });
    const worker: string = resolve(storeDir(f), 'wfail-u1');
    await command(['git', 'worktree', 'add', '--detach', worker, 'HEAD'], f.root);
    const marker: string = resolve(f.home, 'worker-ran');
    const result: Result = await cli(f, ['run-check', '--', 'touch', marker], worker, baseEnv(f));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Refusing run-check run for leaf ${f.repo}/wfail: the leaf is failed`);
    expect(result.stderr).toContain('(seat A ended 3 turns without reporting)');
    expect(existsSync(marker)).toBe(false);
    await command(['git', 'worktree', 'remove', '--force', worker], f.root);
    expect(readTimings(f.root).some((event) => event.kind === 'check_refused' && event.scope === 'worker')).toBe(true);
    void leafPath;
  } finally {
    f.clean();
  }
});

test('run-check waiting on the full line is refused after the leaf fails while it waits', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      full: ['test'],
      grounding: 'none',
    });
    const dir: string = resolve(f.home, 'line');
    mkdirSync(dir);
    const { worktree: first } = await leafWorktree(f, 'holder');
    const { leafPath: waitingLeaf, worktree: second } = await leafWorktree(f, 'waiter');
    const held: string = resolve(dir, 'a.held');
    const release: string = resolve(dir, 'release');
    const marker: string = resolve(dir, 'waiter-ran');
    const a = spawnFiles(
      [
        process.execPath,
        entry,
        'run-check',
        '--name',
        'test',
        '--',
        'sh',
        '-c',
        `touch ${held}; while [ ! -e ${release} ]; do sleep 0.05; done`,
      ],
      { cwd: first, env: runEnv(f) },
    );
    await waitForFile(held);
    const b = spawnFiles([process.execPath, entry, 'run-check', '--name', 'test', '--', 'touch', marker], {
      cwd: second,
      env: runEnv(f),
    });
    await waitForText(b.captured.errPath, new RegExp(`waiting for ${f.repo}/holder test`));
    failLeaf(waitingLeaf, 'seat A ended 3 turns without reporting');
    writeFileSync(release, '');
    const aResult = await finishCaptured(a.child, a.captured);
    const bResult = await finishCaptured(b.child, b.captured);
    expect(aResult.code).toBe(0);
    expect(bResult.code).toBe(1);
    expect(bResult.stderr).toContain(`waiting for ${f.repo}/holder test`);
    expect(bResult.stderr).toMatch(/run [0-9a-f-]{36}/);
    expect(bResult.stderr).toContain(
      `Refusing run-check test for leaf ${f.repo}/waiter: the leaf is failed (seat A ended 3 turns without reporting)`,
    );
    expect(existsSync(marker)).toBe(false);
    expect(
      readTimings(f.root).some(
        (event) => event.kind === 'check_refused' && event.slug === 'waiter' && event.name === 'test',
      ),
    ).toBe(true);
  } finally {
    f.clean();
  }
});

test('a refused run appends exactly one check_refused row with the run identity', async () => {
  const f: Fixture = await fixture();
  try {
    const head: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    const leafPath: string = leaf(f, 'timing-leaf', 'implement', {
      batch: { attempt: 'att-9', built_on: head, holder: { base: head, head }, applied: true },
    });
    failLeaf(leafPath, 'seat A ended 3 turns without reporting');
    const { worktree } = await leafWorktree(f, 'caller');
    const result: Result = await cli(
      f,
      ['run-check', '--leaf', leafPath, '--name', 'audit', '--', 'true'],
      worktree,
      baseEnv(f),
    );
    expect(result.code).toBe(1);
    const refused: TimingEvent[] = readTimings(f.root).filter((event) => event.kind === 'check_refused');
    expect(refused).toHaveLength(1);
    expect(refused[0]).toMatchObject({
      slug: 'timing-leaf',
      name: 'audit',
      scope: 'leaf',
      phase: 'failed',
      attempt: 'att-9',
    });
    expect(refused[0].kind === 'check_refused' && /^[0-9a-f-]{36}$/.test(refused[0].run)).toBe(true);
    const events: TimingEvent[] = readTimings(f.root);
    const run: string = refused[0].kind === 'check_refused' ? refused[0].run : '';
    expect(
      events.some((event) => (event.kind === 'check_start' || event.kind === 'check_end') && event.run === run),
    ).toBe(false);
  } finally {
    f.clean();
  }
});

test('a run whose command already started finishes and publishes when the leaf fails mid-run', async () => {
  const f: Fixture = await fixture();
  try {
    const { leafPath, worktree } = await leafWorktree(f, 'midway');
    const dir: string = resolve(f.home, 'mid');
    mkdirSync(dir);
    const started: string = resolve(dir, 'started');
    const marker: string = resolve(dir, 'done');
    const spawned = spawnFiles(
      [
        process.execPath,
        entry,
        'run-check',
        '--name',
        'slow',
        '--',
        'sh',
        '-c',
        `touch ${started}; sleep 0.4; touch ${marker}`,
      ],
      { cwd: worktree, env: runEnv(f) },
    );
    await waitForFile(started);
    failLeaf(leafPath, 'seat A ended 3 turns without reporting');
    const result = await finishCaptured(spawned.child, spawned.captured);
    expect(result.code).toBe(0);
    expect(existsSync(marker)).toBe(true);
    const events: TimingEvent[] = readTimings(f.root);
    expect(events.some((event) => event.kind === 'check_end' && event.slug === 'midway')).toBe(true);
    expect(events.some((event) => event.kind === 'check_refused')).toBe(false);
  } finally {
    f.clean();
  }
});

test('a --holder run-check is never refused for a leaf phase', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'failed-elsewhere', 'failed', {
      failure: { cause: 'attempts', phase: 'implement', slot: 'A', reason: 'ended' },
    });
    const holder: string = resolve(f.home, 'holder');
    mkdirSync(holder);
    const result: Result = await cli(
      f,
      ['run-check', '--name', 'h', '--holder', holder, '--', 'echo', 'holder-out'],
      f.root,
      baseEnv(f),
    );
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('holder-out');
    expect(readTimings(f.root).some((event) => event.kind === 'check_refused')).toBe(false);
  } finally {
    f.clean();
  }
});
