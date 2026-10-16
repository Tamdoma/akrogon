import { test, expect, describe } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  type Stats,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { z } from 'zod';
import { repoSchema, toolRoot, type Repo } from '../src/config';
import { command, quote, type Result } from '../src/shell';
import { selfUpdate } from '../src/self-update';
import { fixture, cli, leafTempRoot, registerTemp, yaml, type Fixture } from './helpers';

const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];
const skills: string[] = readdirSync(resolve(toolRoot, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function installEnv(f: Fixture): NodeJS.ProcessEnv {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  symlinkSync(resolve(import.meta.dir, 'fake-systemctl.sh'), resolve(bin, 'systemctl'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0 }));
  yaml(resolve(f.home, 'config.yaml'), {
    slots: {
      a: { harness: 'claude', model: 'a', effort: 'high' },
      b: { harness: 'codex', model: 'b', effort: 'medium' },
    },
    harnesses: { claude: 'claude', codex: 'codex', pi: 'pi' },
  });
  return {
    HOME: f.home,
    PATH: `${bin}:${process.env.PATH}`,
    FAKE_HERDR: db,
    FAKE_SYSTEMCTL_LOG: resolve(f.home, 'systemctl.log'),
    FAKE_SLICE_LINK: resolve(f.home, '.config/systemd/user/akrogon.slice'),
  };
}

function calls(f: Fixture): string[][] {
  return readFileSync(resolve(f.home, 'herdr.json.calls'), 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.array(z.string()).parse(JSON.parse(line)));
}

function expectedCalls(f: Fixture): string[][] {
  return [
    ['integration', 'install', 'claude'],
    ['integration', 'install', 'codex'],
    ['integration', 'install', 'pi'],
    ['plugin', 'link', resolve(f.home, 'current', 'plugin')],
  ];
}

test('install links akrogon.slice with the ceiling values and reloads the user manager after linking', async () => {
  const f: Fixture = await fixture();
  try {
    const env: NodeJS.ProcessEnv = installEnv(f);
    expect(await cli(f, ['install'], f.root, env)).toMatchObject({ code: 0 });
    const link: string = resolve(f.home, '.config/systemd/user/akrogon.slice');
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(realpathSync(link)).toBe(resolve(toolRoot, 'systemd/akrogon.slice'));
    const unit: string[] = readFileSync(link, 'utf8')
      .split('\n')
      .map((line) => line.trim());
    for (const line of ['CPUWeight=20', 'MemoryHigh=64G', 'MemoryMax=96G', 'MemorySwapMax=0'])
      expect(unit).toContain(line);
    expect(unit.some((line) => line.startsWith('TasksMax'))).toBe(false);
    expect(readFileSync(resolve(f.home, 'systemctl.log'), 'utf8').trim().split('\n')).toContain(
      '--user daemon-reload linked=yes',
    );
  } finally {
    f.clean();
  }
});

test('install reports a non-link akrogon.slice path as a conflict', async () => {
  const f: Fixture = await fixture();
  try {
    const env: NodeJS.ProcessEnv = installEnv(f);
    const link: string = resolve(f.home, '.config/systemd/user/akrogon.slice');
    mkdirSync(dirname(link), { recursive: true });
    writeFileSync(link, '[Slice]\n');
    const result: Result = await cli(f, ['install'], f.root, env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(quote(link));
    expect(lstatSync(link).isSymbolicLink()).toBe(false);
  } finally {
    f.clean();
  }
});

test('install creates all four absent harness roots and repeats without changing links or herdr arguments', async () => {
  const f: Fixture = await fixture();
  try {
    expect(skills).toContain('watch-issues');
    const env: NodeJS.ProcessEnv = installEnv(f);
    for (const root of roots) expect(existsSync(resolve(f.home, root))).toBe(false);
    expect(await cli(f, ['install'], f.root, env)).toMatchObject({ code: 0, stderr: '' });
    const destinations: string[] = [
      resolve(f.home, '.local/bin/akrogon'),
      ...roots.flatMap((root) => skills.map((skill) => resolve(f.home, root, skill))),
    ];
    const targets: string[] = destinations.map((destination) => readlinkSync(destination));
    expect(realpathSync(destinations[0])).toBe(resolve(toolRoot, 'src/akrogon.ts'));
    for (const root of roots) {
      expect(readdirSync(resolve(f.home, root)).sort()).toEqual([...skills].sort());
      for (const skill of skills) {
        const destination: string = resolve(f.home, root, skill);
        expect(lstatSync(destination).isSymbolicLink()).toBe(true);
        expect(realpathSync(destination)).toBe(resolve(toolRoot, 'skills', skill));
      }
    }
    expect(calls(f)).toEqual(expectedCalls(f));
    expect(await cli(f, ['install'], f.root, env)).toMatchObject({ code: 0, stderr: '' });
    expect(destinations.map((destination) => readlinkSync(destination))).toEqual(targets);
    expect(calls(f)).toEqual([...expectedCalls(f), ...expectedCalls(f)]);
  } finally {
    f.clean();
  }
});

test('install prunes only dangling owned links and preserves real entries and foreign links in every root', async () => {
  const f: Fixture = await fixture();
  const artifact: string = resolve(toolRoot, '.evidence/install-prune-links/home-listing.json');
  try {
    const env: NodeJS.ProcessEnv = installEnv(f);
    const missing: string = resolve(toolRoot, 'skills', `missing-${f.home.split('/').pop()}`);
    expect(existsSync(missing)).toBe(false);
    for (const root of roots) {
      const directory: string = resolve(f.home, root);
      mkdirSync(resolve(directory, 'real-directory'), { recursive: true });
      writeFileSync(resolve(directory, 'real-directory/keep'), 'contents');
      writeFileSync(resolve(directory, 'regular-file'), 'contents');
      symlinkSync(missing, resolve(directory, 'stale-absolute'));
      symlinkSync(relative(directory, missing), resolve(directory, 'stale-relative'));
      symlinkSync(resolve(missing, 'nested'), resolve(directory, 'stale-nested'));
      symlinkSync(relative(directory, resolve(toolRoot, 'skills', skills[0])), resolve(directory, skills[0]));
      symlinkSync(resolve(toolRoot, 'skills', skills[0]), resolve(directory, 'resolving-owned'));
      symlinkSync(f.root, resolve(directory, 'resolving-foreign'));
      symlinkSync(resolve(f.home, 'foreign-missing'), resolve(directory, 'dangling-foreign'));
      symlinkSync(resolve(toolRoot, 'skills-old/missing'), resolve(directory, 'sibling-prefix'));
    }
    const result: Result = await cli(f, ['install'], f.root, env);
    expect(result).toMatchObject({ code: 0, stderr: '' });
    for (const root of roots) {
      const directory: string = resolve(f.home, root);
      for (const stale of ['stale-absolute', 'stale-relative', 'stale-nested'])
        expect(lstatSync(resolve(directory, stale), { throwIfNoEntry: false })).toBeUndefined();
      expect(lstatSync(resolve(directory, 'real-directory')).isDirectory()).toBe(true);
      expect(readFileSync(resolve(directory, 'real-directory/keep'), 'utf8')).toBe('contents');
      expect(lstatSync(resolve(directory, 'regular-file')).isFile()).toBe(true);
      expect(readFileSync(resolve(directory, 'regular-file'), 'utf8')).toBe('contents');
      for (const [name, target] of [
        ['resolving-owned', resolve(toolRoot, 'skills', skills[0])],
        ['resolving-foreign', f.root],
        ['dangling-foreign', resolve(f.home, 'foreign-missing')],
        ['sibling-prefix', resolve(toolRoot, 'skills-old/missing')],
      ]) {
        expect(lstatSync(resolve(directory, name)).isSymbolicLink()).toBe(true);
        expect(readlinkSync(resolve(directory, name))).toBe(target);
      }
      expect(readlinkSync(resolve(directory, skills[0]))).toBe(
        relative(directory, resolve(toolRoot, 'skills', skills[0])),
      );
      for (const skill of skills)
        expect(realpathSync(resolve(directory, skill))).toBe(resolve(toolRoot, 'skills', skill));
    }
    expect(calls(f)).toEqual(expectedCalls(f));
    mkdirSync(dirname(artifact), { recursive: true });
    writeFileSync(
      artifact,
      JSON.stringify(
        roots.map((root) => {
          const directory: string = resolve(f.home, root);
          return {
            root: directory,
            entries: readdirSync(directory).map((name) => {
              const path: string = resolve(directory, name);
              const info: Stats = lstatSync(path);
              return info.isSymbolicLink()
                ? {
                    name,
                    type: 'symlink',
                    target: readlinkSync(path),
                    resolved: existsSync(path) ? realpathSync(path) : null,
                  }
                : { name, type: info.isDirectory() ? 'directory' : 'file' };
            }),
          };
        }),
        null,
        2,
      ) + '\n',
    );
    console.log(`Install filesystem evidence: ${artifact}`);
  } finally {
    f.clean();
  }
  expect(existsSync(f.home)).toBe(false);
  expect(existsSync(artifact)).toBe(true);
});

for (const root of roots) {
  for (const kind of ['directory', 'foreign-link']) {
    test(`install prunes before refusing ${kind} at ${root} without installing links or calling herdr`, async () => {
      const f: Fixture = await fixture();
      try {
        const env: NodeJS.ProcessEnv = installEnv(f);
        const directory: string = resolve(f.home, root);
        mkdirSync(directory, { recursive: true });
        const destination: string = resolve(directory, skills[0]);
        const target: string = kind === 'foreign-link' ? f.root : resolve(toolRoot, 'skills', skills[1]);
        if (kind === 'directory') mkdirSync(destination);
        else symlinkSync(target, destination);
        const stale: string = resolve(directory, 'stale-owned');
        symlinkSync(resolve(toolRoot, 'skills', `missing-${f.home.split('/').pop()}`), stale);
        const result: Result = await cli(f, ['install'], f.root, env);
        expect(result.code).not.toBe(0);
        expect(result.stderr).toContain(`rm -r -- ${quote(destination)}`);
        if (kind === 'directory') expect(lstatSync(destination).isDirectory()).toBe(true);
        else expect(readlinkSync(destination)).toBe(target);
        expect(lstatSync(stale, { throwIfNoEntry: false })).toBeUndefined();
        expect(readdirSync(directory)).toEqual([skills[0]]);
        for (const other of roots.filter((other) => other !== root))
          expect(existsSync(resolve(f.home, other))).toBe(false);
        expect(existsSync(resolve(f.home, '.local/bin/akrogon'))).toBe(false);
        expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
      } finally {
        f.clean();
      }
    });
  }

  test(`install repoints an owned link at ${root} instead of refusing it`, async () => {
    const f: Fixture = await fixture();
    try {
      const env: NodeJS.ProcessEnv = installEnv(f);
      const directory: string = resolve(f.home, root);
      mkdirSync(directory, { recursive: true });
      const destination: string = resolve(directory, skills[0]);
      symlinkSync(resolve(toolRoot, 'skills', skills[1]), destination);
      const result: Result = await cli(f, ['install'], f.root, env);
      expect(result).toMatchObject({ code: 0, stderr: '' });
      expect(readlinkSync(destination)).toBe(resolve(f.home, 'current', 'skills', skills[0]));
      expect(realpathSync(destination)).toBe(resolve(toolRoot, 'skills', skills[0]));
    } finally {
      f.clean();
    }
  });
}

test('install still refuses an executable destination conflict before linking or herdr calls', async () => {
  const f: Fixture = await fixture();
  try {
    const env: NodeJS.ProcessEnv = installEnv(f);
    const destination: string = resolve(f.home, '.local/bin/akrogon');
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, 'keep');
    const result: Result = await cli(f, ['install'], f.root, env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(`rm -r -- ${quote(destination)}`);
    expect(readFileSync(destination, 'utf8')).toBe('keep');
    for (const root of roots) expect(existsSync(resolve(f.home, root))).toBe(false);
    expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
  } finally {
    f.clean();
  }
});

describe('self-update', () => {
  type SelfUpdateFixture = {
    home: string;
    clone: string;
    seed: string;
    remote: string;
    repo: Repo;
    savedTempRoot: string | undefined;
    clean: () => void;
  };

  async function selfUpdateFixture(): Promise<SelfUpdateFixture> {
    const home: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'akrogon-self-update-')));
    // An active state home needs config.yaml; without it globalHome() stays on
    // the tool root and .lock lands in the checkout, not the fixture home.
    writeFileSync(resolve(home, 'config.yaml'), 'repos: {}\n');
    const seed: string = resolve(home, 'seed');
    const remote: string = resolve(home, 'remote.git');
    const clone: string = resolve(home, 'clone');
    mkdirSync(resolve(seed, 'skills/skill-one'), { recursive: true });
    mkdirSync(resolve(seed, 'skills/skill-two'), { recursive: true });
    mkdirSync(resolve(seed, 'vendor/tiny'), { recursive: true });
    writeFileSync(resolve(seed, 'skills/skill-one/SKILL.md'), 'one\n');
    writeFileSync(resolve(seed, 'skills/skill-two/SKILL.md'), 'two\n');
    mkdirSync(resolve(seed, 'src'));
    writeFileSync(resolve(seed, 'src/akrogon.ts'), 'x\n');
    writeFileSync(resolve(seed, 'file'), 'initial\n');
    writeFileSync(resolve(seed, '.gitignore'), 'node_modules/\n');
    writeFileSync(resolve(seed, 'vendor/tiny/package.json'), JSON.stringify({ name: 'tiny', version: '1.0.0' }));
    writeFileSync(
      resolve(seed, 'package.json'),
      JSON.stringify({ name: 'self-update-fixture', dependencies: { tiny: 'file:vendor/tiny' } }),
    );
    await command(['git', 'init', '-b', 'main', seed]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], seed);
    await command(['git', 'config', 'user.name', 'Test'], seed);
    await command([process.execPath, 'install'], seed);
    expect(existsSync(resolve(seed, 'bun.lock'))).toBe(true);
    await command(['git', 'add', '.'], seed);
    await command(['git', 'commit', '-m', 'initial'], seed);
    await command(['git', 'init', '--bare', '-b', 'main', remote]);
    await command(['git', 'remote', 'add', 'origin', remote], seed);
    await command(['git', 'push', 'origin', 'HEAD:main'], seed);
    await command(['git', 'clone', remote, clone]);
    await command(['git', 'config', 'user.email', 'test@example.invalid'], clone);
    await command(['git', 'config', 'user.name', 'Test'], clone);
    const repo: Repo = {
      name: 'akrogon',
      root: clone,
      config: repoSchema.parse({ grounding: 'none' }),
    };
    const savedTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
    const scratchRoot: string = leafTempRoot({ home, root: clone, clean: () => undefined });
    process.env.AKROGON_LEAF_TEMP_ROOT = scratchRoot;
    return {
      home,
      clone,
      seed,
      remote,
      repo,
      savedTempRoot,
      clean: () => {
        if (savedTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
        else process.env.AKROGON_LEAF_TEMP_ROOT = savedTempRoot;
        rmSync(home, { recursive: true, force: true });
      },
    };
  }

  async function pushSeed(f: SelfUpdateFixture, change: () => void): Promise<string> {
    change();
    await command(['git', 'add', '-A'], f.seed);
    await command(['git', 'commit', '-m', 'change'], f.seed);
    await command(['git', 'push', 'origin', 'HEAD:main'], f.seed);
    return await command(['git', 'rev-parse', 'HEAD'], f.seed);
  }

  async function withHome(home: string, body: () => Promise<void>): Promise<void> {
    const previous: string | undefined = process.env.AKROGON_HOME;
    const previousPath: string | undefined = process.env.PATH;
    const bin: string = resolve(home, 'fake-bin');
    if (!existsSync(bin)) {
      mkdirSync(bin);
      symlinkSync(resolve(import.meta.dir, 'fake-systemctl.sh'), resolve(bin, 'systemctl'));
      symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
      writeFileSync(resolve(home, 'herdr.json'), JSON.stringify({ panes: [], tabs: [], serial: 0 }));
    }
    process.env.AKROGON_HOME = home;
    process.env.PATH = `${bin}:${previousPath}`;
    process.env.FAKE_SYSTEMCTL_LOG = resolve(home, 'systemctl.log');
    process.env.FAKE_SLICE_LINK = resolve(home, '.config/systemd/user/akrogon.slice');
    process.env.FAKE_HERDR = resolve(home, 'herdr.json');
    try {
      await body();
    } finally {
      if (previous === undefined) delete process.env.AKROGON_HOME;
      else process.env.AKROGON_HOME = previous;
      process.env.PATH = previousPath;
      delete process.env.FAKE_SYSTEMCTL_LOG;
      delete process.env.FAKE_SLICE_LINK;
      delete process.env.FAKE_HERDR;
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

  test.serial('fast-forwards a behind checkout, keeps an unrelated dirty file and prints deployed', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      const oldSha: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const newSha: string = await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      writeFileSync(resolve(f.clone, 'skills/skill-one/SKILL.md'), 'local edit\n');
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.home));
      expect(logs).toEqual([
        `deployed ${oldSha.slice(0, 12)}..${newSha.slice(0, 12)}; deployed ${newSha.slice(0, 12)}; switched from checkout to release`,
      ]);
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(newSha);
      expect(readFileSync(resolve(f.clone, 'skills/skill-one/SKILL.md'), 'utf8')).toBe('local edit\n');
      expect(realpathSync(resolve(f.home, 'current'))).toBe(resolve(f.home, 'releases', newSha));
      for (const root of roots) {
        const link: string = resolve(f.home, root, 'skill-one');
        expect(lstatSync(link).isSymbolicLink()).toBe(true);
        expect(realpathSync(link)).toBe(resolve(f.home, 'releases', newSha, 'skills/skill-one'));
      }
      expect(realpathSync(resolve(f.home, '.local/bin/akrogon'))).toBe(
        resolve(f.home, 'releases', newSha, 'src/akrogon.ts'),
      );
      expect(existsSync(resolve(f.clone, '.git/akrogon-install.lock'))).toBe(true);
      expect(existsSync(resolve(f.home, '.lock'))).toBe(true);
    } finally {
      f.clean();
    }
  });

  test.serial('refuses a fast-forward overlapping a dirty edit and reports step, error, lag and remedy', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const newSha: string = await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      writeFileSync(resolve(f.clone, 'file'), 'dirty\n');
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('checkout pending');
      expect(logs[0]).toContain("Entry 'file'");
      expect(logs[0]).toContain('1 behind origin/main');
      expect(logs[0]).toContain('commit or finish the overlapping edit');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
      expect(await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.clone)).toBe(newSha);
      expect(readFileSync(resolve(f.clone, 'file'), 'utf8')).toBe('dirty\n');
    } finally {
      f.clean();
    }
  });

  test.serial('skips a checkout on another branch and reports the branch', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      await command(['git', 'checkout', '-b', 'topic'], f.clone);
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('self-update skipped:');
      expect(logs[0]).toContain('topic');
      expect(logs[0]).toContain('1 behind origin/main');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
      expect(await command(['git', 'symbolic-ref', '--short', 'HEAD'], f.clone)).toBe('topic');
    } finally {
      f.clean();
    }
  });

  test.serial('skips a detached HEAD checkout and reports it', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      await command(['git', 'checkout', '--detach', 'HEAD'], f.clone);
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('self-update skipped: detached HEAD');
      expect(logs[0]).toContain('1 behind origin/main');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
      expect(
        (await command(['git', 'symbolic-ref', '--short', 'HEAD'], f.clone).catch(() => 'detached')) === 'detached',
      ).toBe(true);
    } finally {
      f.clean();
    }
  });

  test.serial('skips a checkout ahead of the remote and names akrogon sync', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      writeFileSync(resolve(f.clone, 'local-only'), 'x\n');
      await command(['git', 'add', '.'], f.clone);
      await command(['git', 'commit', '-m', 'ahead'], f.clone);
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('self-update skipped:');
      expect(logs[0]).toContain('akrogon sync');
      expect(logs[0]).toContain('0 behind origin/main');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
    } finally {
      f.clean();
    }
  });

  test.serial('skips a checkout diverged from the remote and names akrogon sync', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      writeFileSync(resolve(f.clone, 'local-only'), 'x\n');
      await command(['git', 'add', '.'], f.clone);
      await command(['git', 'commit', '-m', 'ahead'], f.clone);
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const newSha: string = await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.clone, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('self-update skipped:');
      expect(logs[0]).toContain('diverged');
      expect(logs[0]).toContain('akrogon sync');
      expect(logs[0]).toContain('1 behind origin/main');
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
      expect(await command(['git', 'rev-parse', 'refs/remotes/origin/main'], f.clone)).toBe(newSha);
    } finally {
      f.clean();
    }
  });

  test.serial(
    'ignores a dirty workspace lockfile and reports current once the release is already deployed',
    async () => {
      const f: SelfUpdateFixture = await selfUpdateFixture();
      try {
        const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
        writeFileSync(resolve(f.clone, 'bun.lock'), 'garbage\n');
        const first: string[] = await captured(f.home, () => selfUpdate(f.repo, f.home));
        expect(first).toHaveLength(1);
        expect(first[0]).toContain(`deployed ${head.slice(0, 12)}`);
        expect(first[0]).not.toContain('failed');
        expect(readFileSync(resolve(f.clone, 'bun.lock'), 'utf8')).toBe('garbage\n');
        writeFileSync(resolve(f.clone, 'bun.lock'), readFileSync(resolve(f.seed, 'bun.lock'), 'utf8'));
        const second: string[] = await captured(f.home, () => selfUpdate(f.repo, f.home));
        expect(second).toEqual([`current ${head.slice(0, 12)}`]);
      } finally {
        f.clean();
      }
    },
  );

  test.serial('runs the git stage but skips install and links when the repo is not akrogon', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      mkdirSync(resolve(f.clone, 'issues'), { recursive: true });
      writeFileSync(resolve(f.clone, 'issues/record'), 'local record\n');
      await command(['git', 'add', '--', 'issues/record'], f.clone);
      await command(['git', 'commit', '-m', 'record'], f.clone);
      const head: string = await command(['git', 'rev-parse', 'HEAD'], f.clone);
      const repo: Repo = { ...f.repo, name: 'other' };
      const logs: string[] = await captured(f.home, () => selfUpdate(repo, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('pushed');
      expect(await command(['git', 'rev-parse', 'main'], f.remote)).toBe(head);
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(head);
      expect(existsSync(resolve(f.home, '.local/bin'))).toBe(false);
      expect(existsSync(resolve(f.home, 'current'))).toBe(false);
      expect(existsSync(resolve(f.clone, '.git/akrogon-install.lock'))).toBe(false);
    } finally {
      f.clean();
    }
  });

  test.serial('links a skill added on the remote and prunes links to a removed skill after deploying', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      for (const root of roots) {
        const directory: string = resolve(f.home, root);
        mkdirSync(directory, { recursive: true });
        symlinkSync(resolve(f.clone, 'skills/skill-two'), resolve(directory, 'skill-two'));
      }
      const newSha: string = await pushSeed(f, () => {
        mkdirSync(resolve(f.seed, 'skills/skill-three'));
        writeFileSync(resolve(f.seed, 'skills/skill-three/SKILL.md'), 'three\n');
        rmSync(resolve(f.seed, 'skills/skill-two'), { recursive: true, force: true });
      });
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain(`deployed ${newSha.slice(0, 12)}`);
      expect(await command(['git', 'rev-parse', 'HEAD'], f.clone)).toBe(newSha);
      for (const root of roots) {
        const directory: string = resolve(f.home, root);
        expect(lstatSync(resolve(directory, 'skill-two'), { throwIfNoEntry: false })).toBeUndefined();
        expect(realpathSync(resolve(directory, 'skill-three'))).toBe(
          resolve(f.home, 'releases', newSha, 'skills/skill-three'),
        );
        expect(realpathSync(resolve(directory, 'skill-one'))).toBe(
          resolve(f.home, 'releases', newSha, 'skills/skill-one'),
        );
      }
    } finally {
      f.clean();
    }
  });

  test.serial('names a conflicting directory in the line and still creates the other links', async () => {
    const f: SelfUpdateFixture = await selfUpdateFixture();
    try {
      mkdirSync(resolve(f.home, '.claude/skills/skill-one'), { recursive: true });
      const newSha: string = await pushSeed(f, () => {
        writeFileSync(resolve(f.seed, 'file'), 'changed\n');
      });
      const logs: string[] = await captured(f.home, () => selfUpdate(f.repo, f.home));
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('deploy failed');
      expect(logs[0]).toContain('links');
      expect(logs[0]).toContain(resolve(f.home, '.claude/skills/skill-one'));
      expect(logs[0]).toContain('remove');
      expect(lstatSync(resolve(f.home, '.claude/skills/skill-one')).isDirectory()).toBe(true);
      for (const root of roots.filter((root) => root !== '.claude/skills'))
        expect(realpathSync(resolve(f.home, root, 'skill-one'))).toBe(
          resolve(f.home, 'releases', newSha, 'skills/skill-one'),
        );
      expect(realpathSync(resolve(f.home, '.local/bin/akrogon'))).toBe(
        resolve(f.home, 'releases', newSha, 'src/akrogon.ts'),
      );
    } finally {
      f.clean();
    }
  });
});
