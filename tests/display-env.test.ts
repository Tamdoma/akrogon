import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, storeDir, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { readState, saveState } from '../src/state';

const sh = (script: string): string[] => ['sh', '-c', script];

async function leafWorktree(f: Fixture, slug: string): Promise<{ leafPath: string; worktree: string }> {
  const worktree: string = resolve(f.home, 'wt', slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  const leafPath: string = leaf(f, slug, 'implement', { worktree });
  return { leafPath, worktree: realpathSync(worktree) };
}

// One `name=value` probe line per display-relevant variable; `<unset>` marks a
// name the payload does not hold, since an empty held value prints empty.
const probe: string =
  'printf "disp=%s\\nxauth=%s\\nwly=%s\\nxdg=%s\\nbus=%s\\nsess=%s\\nwsock=%s\\n"' +
  ' "${DISPLAY-<unset>}" "${XAUTHORITY-<unset>}" "${WAYLAND_DISPLAY-<unset>}" "${XDG_RUNTIME_DIR-<unset>}"' +
  ' "${DBUS_SESSION_BUS_ADDRESS-<unset>}" "${XDG_SESSION_TYPE-<unset>}" "${WAYLAND_SOCKET-<unset>}"';

function probeValues(stdout: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of stdout.split('\n')) {
    const match: RegExpMatchArray | null = /^([a-z]+)=(.*)$/.exec(line);
    if (match !== null) values[match[1]] = match[2];
  }
  return values;
}

function passArgv(log: string): string[] {
  const lines: string[] = existsSync(log) ? readFileSync(log, 'utf8').split('\n') : [];
  const passes: string[] = lines.filter((line) => line.includes('--unit=akrogon-verify-'));
  expect(passes, `verify pass launches in ${log}`).toHaveLength(1);
  return passes[0].split(' ');
}

function landArgv(log: string): string[] {
  const lines: string[] = existsSync(log) ? readFileSync(log, 'utf8').split('\n') : [];
  const lands: string[] = lines.filter((line) => line.includes('--unit=akrogon-land-'));
  expect(lands.length, `land launches in ${log}`).toBeGreaterThan(0);
  return lands[0].split(' ');
}

test.each([
  ['unset', undefined],
  ['empty', ''],
  ['nonempty', '/run/user/4242'],
] as const)(
  'run-check copies each display variable the caller holds, empty included, and none the caller lacks (%s runtime directory)',
  async (_state: string, runtime: string | undefined) => {
    const f: Fixture = await fixture();
    try {
      const { worktree } = await leafWorktree(f, 'disp-copy');
      const result: Result = await cli(f, ['run-check', '--', ...sh(probe)], worktree, {
        DISPLAY: ':66',
        XAUTHORITY: '',
        WAYLAND_DISPLAY: 'wly-9',
        XDG_RUNTIME_DIR: runtime,
        XDG_SESSION_TYPE: 'wayland',
        WAYLAND_SOCKET: '41',
      });
      expect(result.code, result.stderr).toBe(0);
      const values: Record<string, string> = probeValues(result.stdout);
      // Pre-existing conditions first, so a violation red lands on its own assertion.
      expect(values.bus).toBe('unix:path=/nonexistent');
      expect(values.sess).toBe('<unset>');
      expect(values.wsock).toBe('<unset>');
      expect(values.disp).toBe(':66');
      expect(values.xauth).toBe('');
      expect(values.wly).toBe('wly-9');
      expect(values.xdg).toBe(runtime ?? '<unset>');
    } finally {
      f.clean();
    }
  },
);

test('a repo listing the display names in pass_env still loads and its run-check copies the same caller values', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      pass_env: ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY', 'XDG_RUNTIME_DIR'],
      checks: {},
      grounding: 'none',
    });
    const { worktree } = await leafWorktree(f, 'disp-passenv');
    const result: Result = await cli(f, ['run-check', '--', ...sh(probe)], worktree, {
      DISPLAY: ':77',
      XDG_RUNTIME_DIR: '/run/user/4242',
    });
    expect(result.code, result.stderr).toBe(0);
    const values: Record<string, string> = probeValues(result.stdout);
    expect(values.disp).toBe(':77');
    expect(values.xdg).toBe('/run/user/4242');
    expect(values.xauth).toBe('<unset>');
    expect(values.wly).toBe('<unset>');
  } finally {
    f.clean();
  }
});

test('the verify pass unit is launched with every held display value, empty included, and no UnsetEnvironment', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'verify-held');
    // First with no pass_env entry (the feature proper), then with the names
    // listed: the launch still emits exactly one form per name, never both.
    for (const listed of [false, true]) {
      yaml(resolve(f.root, 'issues/config.yaml'), {
        setup: 'mkdir -p node_modules',
        ...(listed ? { pass_env: ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY'] } : {}),
        // Distinct check names per round, so the second verify reuses no receipt.
        checks: { [listed ? 'listed' : 'plain']: 'true' },
        grounding: 'none',
      });
      const log: string = resolve(f.home, `systemd-run-${listed ? 'listed' : 'plain'}.log`);
      const result: Result = await cli(f, ['verify'], worktree, {
        FAKE_SYSTEMD_RUN_LOG: log,
        DISPLAY: ':66',
        XAUTHORITY: '',
        WAYLAND_DISPLAY: 'wly-9',
      });
      expect(result.code, result.stderr).toBe(0);
      const argv: string[] = passArgv(log);
      expect(argv.filter((word) => word === '--setenv=DISPLAY=:66')).toHaveLength(1);
      expect(argv.filter((word) => word === '--setenv=XAUTHORITY=')).toHaveLength(1);
      expect(argv.filter((word) => word === '--setenv=WAYLAND_DISPLAY=wly-9')).toHaveLength(1);
      expect(argv.filter((word) => word.startsWith('UnsetEnvironment='))).toEqual([]);
      expect(argv.filter((word) => word.startsWith('--setenv=XDG_RUNTIME_DIR='))).toHaveLength(1);
    }
  } finally {
    f.clean();
  }
});

test('the verify pass unit launched by a caller lacking the display names unsets each and sets none', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: 'mkdir -p node_modules',
      checks: { ok: 'true' },
      grounding: 'none',
    });
    const { worktree } = await leafWorktree(f, 'verify-lacking');
    const log: string = resolve(f.home, 'systemd-run.log');
    const result: Result = await cli(f, ['verify'], worktree, {
      FAKE_SYSTEMD_RUN_LOG: log,
      DISPLAY: undefined,
      XAUTHORITY: undefined,
      WAYLAND_DISPLAY: undefined,
    });
    expect(result.code, result.stderr).toBe(0);
    const argv: string[] = passArgv(log);
    for (const name of ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY']) {
      const tokens: number[] = argv.flatMap((word, index) => (word === `UnsetEnvironment=${name}` ? [index] : []));
      expect(tokens, `one UnsetEnvironment=${name}`).toHaveLength(1);
      expect(argv[tokens[0] - 1]).toBe('-p');
      expect(argv.some((word) => word.startsWith(`--setenv=${name}=`))).toBe(false);
    }
  } finally {
    f.clean();
  }
});

// A merge leaf at the head of the queue claims its batch and its merge turn
// launches the land unit; the fake systemd-run records the argv and exits.
async function mergeLaunch(f: Fixture, slug: string, env: NodeJS.ProcessEnv): Promise<Result> {
  const path: string = leaf(f, slug, 'merge', { merge_stamp: '2026-10-19T00:00:00.000Z' });
  const worktree: string = resolve(storeDir(f), slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree], f.root);
  writeFileSync(resolve(worktree, `${slug}-file`), 'x\n');
  await command(['git', 'add', `${slug}-file`], worktree);
  await command(['git', 'commit', '-m', 'work'], worktree);
  saveState(path, { ...readState(path), worktree });
  return cli(f, ['next', slug], f.root, env);
}

test('the land unit is launched with every held display value, empty included, one XDG_RUNTIME_DIR and no UnsetEnvironment', async () => {
  const f: Fixture = await fixture();
  try {
    const log: string = resolve(f.home, 'systemd-run.log');
    const result: Result = await mergeLaunch(f, 'land-held', {
      FAKE_SYSTEMD_RUN_LOG: log,
      DISPLAY: ':66',
      XAUTHORITY: '',
      WAYLAND_DISPLAY: 'wly-9',
    });
    expect(result.code, result.stderr).toBe(0);
    const argv: string[] = landArgv(log);
    expect(argv).toContain('--setenv=DISPLAY=:66');
    expect(argv).toContain('--setenv=XAUTHORITY=');
    expect(argv).toContain('--setenv=WAYLAND_DISPLAY=wly-9');
    expect(argv.filter((word) => word.startsWith('UnsetEnvironment='))).toEqual([]);
    expect(argv.filter((word) => word.startsWith('--setenv=XDG_RUNTIME_DIR='))).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('the land unit launched by a caller lacking the display names carries neither form for them and one XDG_RUNTIME_DIR', async () => {
  const f: Fixture = await fixture();
  try {
    const log: string = resolve(f.home, 'systemd-run.log');
    const result: Result = await mergeLaunch(f, 'land-lacking', {
      FAKE_SYSTEMD_RUN_LOG: log,
      DISPLAY: undefined,
      XAUTHORITY: undefined,
      WAYLAND_DISPLAY: undefined,
    });
    expect(result.code, result.stderr).toBe(0);
    const argv: string[] = landArgv(log);
    for (const name of ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY']) {
      expect(argv.some((word) => word.startsWith(`--setenv=${name}=`))).toBe(false);
      expect(argv.some((word) => word === `UnsetEnvironment=${name}`)).toBe(false);
    }
    expect(argv.filter((word) => word.startsWith('--setenv=XDG_RUNTIME_DIR='))).toHaveLength(1);
  } finally {
    f.clean();
  }
});
