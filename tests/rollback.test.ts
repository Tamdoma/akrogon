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
import { repoSchema } from '../src/config';
import { cli, unitBin } from './helpers';
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
import { command, spawnCaptured, type Result, type SpawnResult } from '../src/shell';

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

test.serial('the roll-back page manual steps roll a broken release back using the real previous release', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    // The real predecessor: the newest commit before the rollback work,
    // pinned so the proof still selects a pre-rollback tree after this leaf
    // lands on main (ROLLBACK_BREAK_PREV removes install.ts, which turns this
    // proof red only when the predecessor code actually runs).
    const base: string = '6121559ee158f559842715a552248645f05bd026';
    const homeEnv: NodeJS.ProcessEnv = {
      ...process.env,
      ...d.env,
      HOME: d.home,
      AKROGON_HOME: d.home,
      AKROGON_RUN: '',
      HERDR_PANE_ID: '',
      PATH: `${unitBin(d.f)}:${d.env.PATH}`,
    };
    const priorHome: string | undefined = process.env.AKROGON_HOME;
    process.env.AKROGON_HOME = d.home;
    const { buildRelease, flip } = await import('../src/release');
    try {
      await buildRelease(
        { name: 'akrogon', root: resolve(import.meta.dir, '..'), config: repoSchema.parse({ grounding: 'none' }) },
        base,
      );
      flip(base);
    } finally {
      process.env.AKROGON_HOME = priorHome;
    }
    const prevDir: string = resolve(releases(d), base);
    expect(existsSync(resolve(prevDir, 'node_modules/zod'))).toBe(true);
    expect(readFileSync(resolve(prevDir, 'src/akrogon.ts'), 'utf8')).not.toContain("case 'rollback'");
    if (process.env.ROLLBACK_BREAK_PREV === '1') rmSync(resolve(prevDir, 'src/install.ts'));
    // A normal deploy records the predecessor as previous; the stub release
    // it replaces is the broken current.
    const bad: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'src/akrogon.ts'), 'process.exit(1);\n'));
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), bad));
    const cannotStart: SpawnResult = await spawnCaptured(
      [process.execPath, resolve(releases(d), bad, 'src/akrogon.ts')],
      { env: homeEnv },
    );
    expect(cannotStart.code).not.toBe(0);
    // The roll-back page's manual steps, verbatim against the fixture's state home.
    const page: string = readFileSync(resolve(import.meta.dir, '../docs/use/roll-back-a-release.md'), 'utf8');
    expect(page).toContain('mv -T .next-current current');
    expect(page).toContain('release-hold.yaml');
    expect(page).toContain('writeDeploySuccess');
    await command(['ln', '-s', resolve(releases(d), base), '.next-current'], d.home);
    await command(['mv', '-T', '.next-current', 'current'], d.home);
    writeFileSync(resolve(d.home, 'release-hold.yaml'), `commit: ${bad}\n`);
    const install: SpawnResult = await spawnCaptured(
      [process.execPath, resolve(prevDir, 'src/akrogon.ts'), 'install'],
      { cwd: d.home, env: homeEnv },
    );
    expect(install.code).toBe(0);
    const recordWrite: SpawnResult = await spawnCaptured(
      [
        process.execPath,
        '-e',
        `import { writeDeploySuccess } from "./releases/${base}/src/release.ts"; writeDeploySuccess("${base}", "${bad}")`,
      ],
      { cwd: d.home, env: homeEnv },
    );
    expect(recordWrite.code).toBe(0);
    expectRolledBack(d, base, bad, { skills: [] });
    // The previous release's own skills are linked again through current.
    for (const skill of ['plan-issue', 'merge-issue']) {
      const link: string = resolve(d.home, '.claude/skills', skill);
      expect(realpathSync(link)).toBe(resolve(releases(d), base, 'skills', skill));
    }
    expect(deployRecord(d)).toMatchObject({
      commit: base,
      previous: bad,
      ok: true,
      replaced: { [bad]: expect.any(String) },
    });
    // The restored predecessor honors the hold with its own next pass.
    const held: SpawnResult = await spawnCaptured(
      [process.execPath, resolve(prevDir, 'src/akrogon.ts'), 'next', '--all'],
      { cwd: d.f.root, env: homeEnv },
    );
    expect(held.code).toBe(0);
    expect(held.stdout).toContain(`deploy held: ${bad.slice(0, 12)}`);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(prevDir);
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
    const good: object = Bun.YAML.parse(readFileSync(configPath, 'utf8')) as object;
    writeFileSync(configPath, Bun.YAML.stringify({ ...good, bogus_key: true }));
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
