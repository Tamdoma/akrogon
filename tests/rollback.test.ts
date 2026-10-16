import { test, expect } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { cli } from './helpers';
import {
  deployFixture,
  deployedPair,
  deployRecord,
  head,
  pushSeed,
  releases,
  roots,
  type DeployFixture,
} from './deploy-fixture';
import { spawnCaptured, type Result, type SpawnResult } from '../src/shell';

// The end-state contract every rollback path must reach: current on the
// previous release, the rolled-away commit held, links resolved through
// current, and both commits printed on the success line.
function expectRolledBack(
  d: DeployFixture,
  previous: string,
  held: string,
  opts: { line?: Result; skills?: string[] } = {},
): void {
  const current: string = resolve(d.home, 'current');
  expect(realpathSync(current)).toBe(resolve(releases(d), previous));
  expect(Bun.YAML.parse(readFileSync(resolve(d.home, 'release-hold.yaml'), 'utf8'))).toEqual({ commit: held });
  if (opts.line !== undefined) {
    expect(opts.line.stdout).toContain(held.slice(0, 12));
    expect(opts.line.stdout).toContain(previous.slice(0, 12));
  }
  for (const skill of opts.skills ?? ['skill-one']) {
    for (const root of roots) {
      const link: string = resolve(d.home, root, skill);
      expect(lstatSync(link).isSymbolicLink()).toBe(true);
      expect(realpathSync(link)).toBe(resolve(releases(d), previous, 'skills', skill));
    }
  }
}

test.serial('rollback flips current to the previous release, prints both commits and holds the bad one', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const { previous, current } = await deployedPair(d);
    const result: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`rolled back ${current.slice(0, 12)} -> ${previous.slice(0, 12)}`);
    expectRolledBack(d, previous, current, { line: result });
    expect(readlinkSync(resolve(d.home, '.local/bin/akrogon'))).toBe(resolve(d.home, 'current/src/akrogon.ts'));
  } finally {
    d.f.clean();
  }
});

test.serial('the hold blocks redeploy of the rolled-back commit until main moves past it', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const { previous, current } = await deployedPair(d);
    expect((await cli(d.f, ['rollback'], d.f.root, d.env)).code).toBe(0);
    const held: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(held.code).toBe(0);
    expect(held.stdout).toContain(`deploy held: ${current.slice(0, 12)}`);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), previous));
    const next: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'past\n'));
    const released: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(released.code).toBe(0);
    expect(released.stdout).toContain(`deployed ${next.slice(0, 12)}`);
    expect(existsSync(resolve(d.home, 'release-hold.yaml'))).toBe(false);
    expect(deployRecord(d)).toMatchObject({ commit: next, ok: true });
  } finally {
    d.f.clean();
  }
});

test.serial('the README manual steps roll a broken release back to the same end state', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const { previous, current } = await deployedPair(d);
    // The current release cannot start: its entry exits non-zero.
    const broken: SpawnResult = await spawnCaptured(
      [process.execPath, resolve(releases(d), current, 'src/akrogon.ts')],
      { env: { ...d.env, RELEASE_BROKEN: '1' } },
    );
    expect(broken.code).not.toBe(0);
    const readme: string = readFileSync(resolve(import.meta.dir, '../README.md'), 'utf8');
    expect(readme).toContain('release-hold.yaml');
    // The three manual steps from the README's rollback section, verbatim
    // against the fixture's state home: flip via temp link, write the hold,
    // run the previous release's install.
    await Bun.$`ln -s ${resolve(releases(d), previous)} ${resolve(d.home, '.next-current')}`.quiet();
    await Bun.$`mv -T ${resolve(d.home, '.next-current')} ${resolve(d.home, 'current')}`.quiet();
    writeFileSync(resolve(d.home, 'release-hold.yaml'), `commit: ${current}\n`);
    const install: SpawnResult = await spawnCaptured(
      [process.execPath, resolve(releases(d), previous, 'src/akrogon.ts'), 'install'],
      { env: { ...d.env, HOME: d.home, AKROGON_HOME: d.home } },
    );
    expect(install.code).toBe(0);
    expectRolledBack(d, previous, current);
  } finally {
    d.f.clean();
  }
});

test.serial('rollback with no previous release fails and changes nothing', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const before: string = realpathSync(resolve(d.home, 'current'));
    const result: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('no previous release');
    expect(realpathSync(resolve(d.home, 'current'))).toBe(before);
    expect(existsSync(resolve(d.home, 'release-hold.yaml'))).toBe(false);
    expect(deployRecord(d)).toMatchObject({ commit: sha, previous: null, ok: true });
  } finally {
    d.f.clean();
  }
});

test.serial('rollback with a global config key the schema rejects fails naming file and key', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    await deployedPair(d);
    const configPath: string = resolve(d.home, 'config.yaml');
    const good: string = readFileSync(configPath, 'utf8');
    writeFileSync(configPath, `${good}bogus_key: true\n`);
    const currentBefore: string = realpathSync(resolve(d.home, 'current'));
    const result: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(configPath);
    expect(result.stderr).toContain('bogus_key');
    expect(realpathSync(resolve(d.home, 'current'))).toBe(currentBefore);
    expect(existsSync(resolve(d.home, 'release-hold.yaml'))).toBe(false);
  } finally {
    d.f.clean();
  }
});

test.serial(
  'rollback restores the previous release skill links and a failed link step leaves current on it',
  async () => {
    const d: DeployFixture = await deployFixture();
    try {
      const previous: string = await head(d);
      expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
      const current: string = await pushSeed(d, () => {
        mkdirSync(resolve(d.seed, 'skills/skill-two'), { recursive: true });
        writeFileSync(resolve(d.seed, 'skills/skill-two/SKILL.md'), 'two\n');
        rmSync(resolve(d.seed, 'skills/skill-one'), { recursive: true, force: true });
      });
      expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
      const result: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
      expect(result.code).toBe(0);
      expectRolledBack(d, previous, current, { line: result });
      // The skill the bad release added is unlinked; the one it removed is back.
      for (const root of roots) {
        expect(lstatSync(resolve(d.home, root, 'skill-two'), { throwIfNoEntry: false })).toBe(undefined);
        expect(realpathSync(resolve(d.home, root, 'skill-one'))).toBe(
          resolve(releases(d), previous, 'skills/skill-one'),
        );
      }
      // A conflicting destination fails the link step: non-zero, printed, and
      // current still on the previous release. Removing it lets a retry finish.
      await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'later\n'));
      expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
      const blocker: string = resolve(d.home, '.claude/skills/skill-one');
      rmSync(blocker, { recursive: true, force: true });
      mkdirSync(blocker, { recursive: true });
      const recordBefore: string = readFileSync(resolve(d.home, 'deploy.yaml'), 'utf8');
      const failed: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
      expect(failed.code).not.toBe(0);
      expect(failed.stderr).toContain(blocker);
      expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), previous));
      expect(readFileSync(resolve(d.home, 'deploy.yaml'), 'utf8')).toBe(recordBefore);
      rmSync(blocker, { recursive: true, force: true });
      const retried: Result = await cli(d.f, ['rollback'], d.f.root, d.env);
      expect(retried.code).toBe(0);
      expect(realpathSync(resolve(d.home, '.claude/skills/skill-one'))).toBe(
        resolve(releases(d), previous, 'skills/skill-one'),
      );
    } finally {
      d.f.clean();
    }
  },
);
