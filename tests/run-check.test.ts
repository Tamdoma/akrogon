import { test, expect } from 'bun:test';
import { z } from 'zod';
import { basename, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { fixture, cli, leaf, yaml, fakeAkrogon, printedChecks, leafTempRoot, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';

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
      'CHECK_TOKEN',
      'PWD',
      'SHLVL',
      '_',
    ]);
    for (const name of names) expect(allowed.has(name)).toBe(true);
    expect(names.has('CHECK_TOKEN')).toBe(true);
    expect(names.has('TMPDIR')).toBe(true);
    expect(names.has('AKROGON_BASE')).toBe(true);
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

test('run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success and failure', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'tmpdir-leaf');
    const ok = await cli(f, ['run-check', '--', ...sh('printf %s "$TMPDIR"')], worktree, baseEnv(f));
    expect(ok.code).toBe(0);
    expect(ok.stdout.startsWith(leafTempRoot(f))).toBe(true);
    expect(basename(ok.stdout).startsWith('run-')).toBe(true);
    expect(existsSync(ok.stdout)).toBe(false);
    const bad = await cli(f, ['run-check', '--', ...sh('printf %s "$TMPDIR" >&2; exit 7')], worktree, baseEnv(f));
    expect(bad.code).toBe(7);
    expect(existsSync(bad.stderr)).toBe(false);
    expect(scratchRuns(f)).toEqual([]);
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
