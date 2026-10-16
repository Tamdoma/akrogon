import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect } from 'bun:test';
import { fixture, cli, fakeHerdr, entry, type Fixture } from './helpers';
import { command } from '../src/shell';

export const roots: string[] = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills'];

export type DeployFixture = {
  f: Fixture;
  env: NodeJS.ProcessEnv;
  seed: string;
  home: string;
};

// The release stub serves three roles: it proves the deployed tree runs (any
// deploy test), exits non-zero on demand (a broken current release), and
// delegates `install` to the real entry point so a previous release restores
// links exactly as the real program does.
const stubAkrogon: string = `const arg = process.argv[2];
if (arg === 'install') {
  const status = Bun.spawnSync([process.execPath, process.env.AKROGON_FIXTURE_ENTRY ?? '', 'install'], {
    env: process.env,
    stdout: 'inherit',
    stderr: 'inherit',
  }).exitCode;
  process.exit(status ?? 1);
}
if (process.env.RELEASE_BROKEN === '1') process.exit(1);
console.log("release");
`;

// Builds the plain fixture repo into an akrogon-shaped repo: the real CLI
// entry point is tests' `entry`, but the deployed release is built from the
// seed's committed tree, which must carry every file the links point at.
export async function deployFixture(): Promise<DeployFixture> {
  const f: Fixture = await fixture();
  const home: string = f.home;
  const seed: string = resolve(home, 'seed');
  await command(['git', 'clone', resolve(home, 'remote.git'), seed]);
  await command(['git', 'config', 'user.email', 'test@example.invalid'], seed);
  await command(['git', 'config', 'user.name', 'Test'], seed);
  mkdirSync(resolve(seed, 'src'), { recursive: true });
  mkdirSync(resolve(seed, 'skills/skill-one'), { recursive: true });
  mkdirSync(resolve(seed, 'systemd'), { recursive: true });
  mkdirSync(resolve(seed, 'plugin'), { recursive: true });
  mkdirSync(resolve(seed, 'vendor/tiny'), { recursive: true });
  writeFileSync(resolve(seed, 'vendor/tiny/package.json'), '{"name":"tiny","version":"1.0.0"}\n');
  writeFileSync(resolve(seed, 'src/akrogon.ts'), stubAkrogon);
  writeFileSync(resolve(seed, 'src/config.ts'), 'export const releaseConfig = true;\n');
  writeFileSync(resolve(seed, 'src/lessons.ts'), 'export const lessonsLoaded = true;\n');
  writeFileSync(resolve(seed, 'skills/skill-one/SKILL.md'), 'one\n');
  writeFileSync(resolve(seed, 'systemd/akrogon.slice'), '[Slice]\n');
  writeFileSync(resolve(seed, 'plugin/herdr-plugin.toml'), 'x\n');
  writeFileSync(
    resolve(seed, 'package.json'),
    '{"name":"fixture-release","dependencies":{"tiny":"file:vendor/tiny"}}\n',
  );
  await command([process.execPath, 'install'], seed);
  await command(['git', 'add', '-A'], seed);
  await command(['git', 'commit', '-m', 'shape'], seed);
  await command(['git', 'push', 'origin', 'HEAD:main'], seed);
  await command(['git', 'fetch', 'origin', 'main'], f.root);
  await command(['git', 'merge', '--ff-only', 'origin/main'], f.root);
  const global = Bun.YAML.parse(readFileSync(resolve(home, 'config.yaml'), 'utf8')) as object;
  writeFileSync(resolve(home, 'config.yaml'), Bun.YAML.stringify({ ...global, repos: { akrogon: f.root } }));
  const herdr = fakeHerdr(f);
  symlinkSync(resolve(import.meta.dir, 'fake-systemctl.sh'), resolve(home, 'bin/systemctl'));
  const env: NodeJS.ProcessEnv = {
    ...herdr.env,
    FAKE_SYSTEMCTL_LOG: resolve(home, 'systemctl.log'),
    FAKE_SLICE_LINK: resolve(home, '.config/systemd/user/akrogon.slice'),
    AKROGON_FIXTURE_ENTRY: entry,
  };
  return { f, env, seed, home };
}

export async function pushSeed(d: DeployFixture, mutate: () => void): Promise<string> {
  mutate();
  await command(['git', 'add', '-A'], d.seed);
  await command(['git', 'commit', '-m', 'change'], d.seed);
  await command(['git', 'push', 'origin', 'HEAD:main'], d.seed);
  return await command(['git', 'rev-parse', 'HEAD'], d.seed);
}

export async function head(d: DeployFixture): Promise<string> {
  return await command(['git', 'rev-parse', 'HEAD'], d.seed);
}

export function releases(d: DeployFixture): string {
  return resolve(d.home, 'releases');
}

export function deployRecord(d: DeployFixture): { [key: string]: unknown } {
  return Bun.YAML.parse(readFileSync(resolve(d.home, 'deploy.yaml'), 'utf8')) as {
    [key: string]: unknown;
  };
}

// Two deployed releases on main: previous first, then the current release,
// with current pointing at the second.
export async function deployedPair(d: DeployFixture): Promise<{ previous: string; current: string }> {
  const previous: string = await head(d);
  expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
  const current: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'second\n'));
  expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
  return { previous, current };
}
