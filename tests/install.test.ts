import { test, expect } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
  type Stats,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { z } from 'zod';
import { toolRoot } from '../src/config';
import { quote, type Result } from '../src/shell';
import { fixture, cli, yaml, type Fixture } from './helpers';

const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];
const skills: string[] = readdirSync(resolve(toolRoot, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function installEnv(f: Fixture): NodeJS.ProcessEnv {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0 }));
  yaml(resolve(f.home, 'config.yaml'), {
    slots: {
      a: { harness: 'claude', model: 'a', effort: 'high' },
      b: { harness: 'codex', model: 'b', effort: 'medium' },
    },
    harnesses: { claude: 'claude', codex: 'codex', pi: 'pi' },
  });
  return { HOME: f.home, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db };
}

function calls(f: Fixture): string[][] {
  return readFileSync(resolve(f.home, 'herdr.json.calls'), 'utf8')
    .trim()
    .split('\n')
    .map((line) => z.array(z.string()).parse(JSON.parse(line)));
}

function expectedCalls(): string[][] {
  return [
    ['integration', 'install', 'claude'],
    ['integration', 'install', 'codex'],
    ['integration', 'install', 'pi'],
    ['plugin', 'link', resolve(toolRoot, 'plugin')],
  ];
}

test('install creates all four absent harness roots and repeats without changing links or herdr arguments', async () => {
  const f: Fixture = await fixture();
  try {
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
    expect(calls(f)).toEqual(expectedCalls());
    expect(await cli(f, ['install'], f.root, env)).toMatchObject({ code: 0, stderr: '' });
    expect(destinations.map((destination) => readlinkSync(destination))).toEqual(targets);
    expect(calls(f)).toEqual([...expectedCalls(), ...expectedCalls()]);
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
    expect(calls(f)).toEqual(expectedCalls());
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
  for (const kind of ['directory', 'foreign-link', 'wrong-owned-link']) {
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
