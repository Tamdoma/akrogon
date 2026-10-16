import { test, expect } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { z } from 'zod';
import { cli } from './helpers';
import { deployFixture, deployRecord, head, pushSeed, releases, roots, type DeployFixture } from './deploy-fixture';
import { command, run, spawnCaptured, type Result } from '../src/shell';

test.serial('a records fetch failure persists the attempted deployment and retries after recovery', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const active: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const attempted: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'incoming\n'));
    await command(['git', 'fetch', 'origin', 'main'], d.f.root);
    await command(['git', 'remote', 'set-url', 'origin', resolve(d.home, 'missing.git')], d.f.root);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(deployRecord(d)).toMatchObject({ attempted, ok: false, step: 'fetch' });
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), active));
    const status: Result = await cli(d.f, ['status'], d.f.root, d.env);
    expect(status.stdout).toContain(
      `deploy failed: attempted ${attempted.slice(0, 12)}, active ${active.slice(0, 12)}, step fetch`,
    );
    await command(['git', 'remote', 'set-url', 'origin', resolve(d.home, 'remote.git')], d.f.root);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(deployRecord(d)).toMatchObject({ commit: attempted, ok: true });
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), attempted));
  } finally {
    d.f.clean();
  }
});

test.serial('fetch recovery on unchanged main preserves the previous release and its replacement time', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const previous: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const active: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'active\n'));
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const record: ReturnType<typeof deployRecord> = deployRecord(d);
    const stamps: Record<string, string> = z.record(z.string(), z.string()).parse(record.replaced);
    const replacedAt: string = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    writeFileSync(
      resolve(d.home, 'deploy.yaml'),
      Bun.YAML.stringify({ ...record, replaced: { ...stamps, [previous]: replacedAt } }),
    );
    await command(['git', 'remote', 'set-url', 'origin', resolve(d.home, 'missing.git')], d.f.root);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(deployRecord(d)).toMatchObject({ ok: false, commit: active, previous });
    await command(['git', 'remote', 'set-url', 'origin', resolve(d.home, 'remote.git')], d.f.root);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(deployRecord(d)).toMatchObject({
      ok: true,
      commit: active,
      previous,
      replaced: { [previous]: replacedAt },
    });
    expect(readdirSync(releases(d)).sort()).toEqual([previous, active].sort());
    const next: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'next\n'));
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(deployRecord(d)).toMatchObject({ ok: true, commit: next, previous: active });
    expect(readdirSync(releases(d)).sort()).toEqual([active, next].sort());
  } finally {
    d.f.clean();
  }
});

test.serial('replacement timestamps start at the flip and unchanged main prunes expired releases', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const first: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const second: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'second\n'));
    const before: number = Date.now();
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const replacedSchema = z.record(z.string(), z.iso.datetime());
    const replaced: Record<string, string> = replacedSchema.parse(deployRecord(d).replaced);
    expect(Object.keys(replaced)).toContain(first);
    expect(Date.parse(replaced[first])).toBeGreaterThanOrEqual(before);
    expect(Date.parse(replaced[first])).toBeLessThanOrEqual(Date.now());
    const third: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'third\n'));
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    const record = deployRecord(d);
    const timestamps: Record<string, string> = replacedSchema.parse(record.replaced);
    const aged: string = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    writeFileSync(
      resolve(d.home, 'deploy.yaml'),
      Bun.YAML.stringify({ ...record, replaced: { ...timestamps, [first]: aged, [second]: aged } }),
    );
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(readdirSync(releases(d)).sort()).toEqual([second, third].sort());
    expect(deployRecord(d)).toMatchObject({ commit: third, previous: second, ok: true });
  } finally {
    d.f.clean();
  }
});

test.serial('deploy builds a complete release, flips current and prints the deployed commit', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await head(d);
    const result: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    const current: string = resolve(d.home, 'current');
    expect(lstatSync(current).isSymbolicLink()).toBe(true);
    expect(realpathSync(current)).toBe(resolve(releases(d), sha));
    expect(readFileSync(resolve(releases(d), sha, 'src/akrogon.ts'), 'utf8')).toBe('console.log("release");\n');
    expect(existsSync(resolve(releases(d), sha, 'node_modules'))).toBe(true);
    expect(readdirSync(releases(d)).sort()).toEqual([sha]);
  } finally {
    d.f.clean();
  }
});

test.serial('an uncommitted workspace edit stays pending in records while the deploy still lands', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await pushSeed(d, () =>
      writeFileSync(resolve(d.seed, 'src/akrogon.ts'), 'console.log("edited-remote");\n'),
    );
    writeFileSync(resolve(d.f.root, 'src/akrogon.ts'), 'console.log("edited-local");\n');
    const result: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('checkout pending');
    expect(result.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    const current: string = resolve(d.home, 'current');
    expect(realpathSync(current)).toBe(resolve(releases(d), sha));
    const ran: Result = await spawnCaptured([process.execPath, resolve(current, 'src/akrogon.ts')]);
    expect(ran.stdout.trim()).toBe('edited-remote');
    expect(readFileSync(resolve(d.f.root, 'src/akrogon.ts'), 'utf8')).toBe('console.log("edited-local");\n');
  } finally {
    d.f.clean();
  }
});

test.serial('every link resolves through current and a skill add or remove leaves no dangling link', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const first: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(first.code).toBe(0);
    const stale: string = resolve(releases(d), 'stale-release/skills/skill-removed');
    mkdirSync(dirname(resolve(d.home, '.claude/skills')), { recursive: true });
    symlinkSync(stale, resolve(d.home, '.claude/skills/skill-removed'));
    const sha: string = await pushSeed(d, () => {
      mkdirSync(resolve(d.seed, 'skills/skill-two'), { recursive: true });
      writeFileSync(resolve(d.seed, 'skills/skill-two/SKILL.md'), 'two\n');
      rmSync(resolve(d.seed, 'skills/skill-one'), { recursive: true, force: true });
    });
    const result: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    const current: string = resolve(d.home, 'current');
    expect(realpathSync(current)).toBe(resolve(releases(d), sha));
    expect(readlinkSync(resolve(d.home, '.local/bin/akrogon'))).toBe(resolve(current, 'src/akrogon.ts'));
    expect(readlinkSync(resolve(d.home, '.config/systemd/user/akrogon.slice'))).toBe(
      resolve(current, 'systemd/akrogon.slice'),
    );
    for (const root of roots) {
      const directory: string = resolve(d.home, root);
      expect(readdirSync(directory).sort()).toEqual(['skill-two']);
      const link: string = resolve(directory, 'skill-two');
      expect(readlinkSync(link)).toBe(resolve(current, 'skills/skill-two'));
      expect(realpathSync(link)).toBe(resolve(releases(d), sha, 'skills/skill-two'));
    }
    const calls: string = readFileSync(resolve(d.home, 'herdr.json.calls'), 'utf8');
    expect(calls).toContain(JSON.stringify(['plugin', 'link', resolve(current, 'plugin')]));
  } finally {
    d.f.clean();
  }
});

test.serial('a failed release build keeps current, reports in status and retries', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const first: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(first.code).toBe(0);
    const active: string = realpathSync(resolve(d.home, 'current'));
    const lock: string = readFileSync(resolve(d.seed, 'bun.lock'), 'utf8');
    const bad: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'bun.lock'), 'garbage\n'));
    const failed: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(failed.code).toBe(0);
    expect(failed.stdout).toContain('deploy failed');
    expect(failed.stdout).toContain('install');
    expect(realpathSync(resolve(d.home, 'current'))).toBe(active);
    expect(existsSync(resolve(releases(d), bad))).toBe(false);
    const record = deployRecord(d);
    expect(record.ok).toBe(false);
    expect(record.attempted).toBe(bad);
    expect(record.step).toBe('install');
    const status: Result = await cli(d.f, ['status'], d.f.root, d.env);
    expect(status.stdout).toContain(
      `deploy failed: attempted ${bad.slice(0, 12)}, active ${basename(active).slice(0, 12)}, step install`,
    );
    await pushSeed(d, () => writeFileSync(resolve(d.seed, 'bun.lock'), lock));
    const recovered: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(recovered.code).toBe(0);
    expect(recovered.stdout).toContain('deployed');
    expect(readdirSync(releases(d)).every((name) => !name.startsWith('.build-'))).toBe(true);
    const clean: Result = await cli(d.f, ['status'], d.f.root, d.env);
    expect(clean.stdout).not.toContain('deploy failed');
  } finally {
    d.f.clean();
  }
});

test.serial('an interrupted deploy is shown in status and finished by the next pass', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), sha));
    // A deploy that reached the flip but never recorded success still has a
    // failure (or stale) record; it must be visible and retried, not skipped.
    writeFileSync(
      resolve(d.home, 'deploy.yaml'),
      Bun.YAML.stringify({
        attempted: sha,
        ok: false,
        step: 'reload',
        error: 'interrupted',
        at: new Date().toISOString(),
      }),
    );
    const status: Result = await cli(d.f, ['status'], d.f.root, d.env);
    expect(status.stdout).toContain(
      `deploy failed: attempted ${sha.slice(0, 12)}, active ${sha.slice(0, 12)}, step reload`,
    );
    const pass: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(pass.code).toBe(0);
    expect(pass.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(deployRecord(d)).toMatchObject({ commit: sha, ok: true });
    const clean: Result = await cli(d.f, ['status'], d.f.root, d.env);
    expect(clean.stdout).not.toContain('deploy failed');
  } finally {
    d.f.clean();
  }
});

test.serial('a first-switch conflict leaves the workspace-pointing command usable', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const bin: string = resolve(d.home, '.local/bin/akrogon');
    mkdirSync(dirname(bin), { recursive: true });
    const workspaceEntry: string = resolve(d.f.root, 'src/akrogon.ts');
    mkdirSync(dirname(workspaceEntry), { recursive: true });
    writeFileSync(workspaceEntry, 'workspace\n');
    symlinkSync(workspaceEntry, bin);
    mkdirSync(resolve(d.home, '.claude/skills/skill-one'), { recursive: true });
    const sha: string = await head(d);
    const failed: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(failed.code).toBe(0);
    expect(failed.stdout).toContain('deploy failed');
    expect(failed.stdout).toContain('links');
    // No link was created or repointed: the installed command still works.
    expect(existsSync(resolve(d.home, 'current'))).toBe(false);
    expect(readlinkSync(bin)).toBe(workspaceEntry);
    expect(existsSync(bin)).toBe(true);
    rmSync(resolve(d.home, '.claude/skills/skill-one'), { recursive: true });
    const retried: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(retried.code).toBe(0);
    expect(retried.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(realpathSync(bin)).toBe(resolve(releases(d), sha, 'src/akrogon.ts'));
  } finally {
    d.f.clean();
  }
});

test.serial('a rejected add or remove deploy keeps the active release skill links', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const first: string = await head(d);
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    await pushSeed(d, () => {
      mkdirSync(resolve(d.seed, 'skills/skill-two'), { recursive: true });
      writeFileSync(resolve(d.seed, 'skills/skill-two/SKILL.md'), 'two\n');
      rmSync(resolve(d.seed, 'skills/skill-one'), { recursive: true, force: true });
    });
    mkdirSync(resolve(d.home, '.claude/skills/skill-two'), { recursive: true });
    const failed: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(failed.code).toBe(0);
    expect(failed.stdout).toContain('deploy failed');
    expect(failed.stdout).toContain('links');
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), first));
    for (const root of roots) {
      const kept: string = resolve(d.home, root, 'skill-one');
      expect(existsSync(kept)).toBe(true);
      const added: string = resolve(d.home, root, 'skill-two');
      if (root === '.claude/skills') {
        expect(lstatSync(added).isDirectory()).toBe(true);
      } else {
        expect(lstatSync(added, { throwIfNoEntry: false })).toBe(undefined);
      }
    }
  } finally {
    d.f.clean();
  }
});

test.serial('releases other than current and previous are deleted 24 hours after replacement', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const shas: string[] = [await head(d)];
    await cli(d.f, ['next', '--all'], d.f.root, d.env);
    for (const name of ['c1', 'c2']) {
      shas.push(await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), `${name}\n`)));
      expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    }
    const recordPath: string = resolve(d.home, 'deploy.yaml');
    const record = deployRecord(d);
    const replaced: { [key: string]: string } = (record.replaced as { [key: string]: string }) ?? {};
    const aged: string = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    replaced[shas[0]] = aged;
    replaced[shas[1]] = aged;
    writeFileSync(recordPath, Bun.YAML.stringify({ ...record, replaced }));
    shas.push(await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'c3\n')));
    expect((await cli(d.f, ['next', '--all'], d.f.root, d.env)).code).toBe(0);
    expect(readdirSync(releases(d)).sort()).toEqual([shas[2], shas[3]].sort());
  } finally {
    d.f.clean();
  }
});

test.serial('the first deploy switches workspace-pointing links to the release without a hand step', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const sha: string = await head(d);
    for (const root of roots) {
      mkdirSync(resolve(d.home, root), { recursive: true });
      symlinkSync(resolve(d.f.root, 'skills/skill-one'), resolve(d.home, root, 'skill-one'));
    }
    mkdirSync(resolve(d.home, '.local/bin'), { recursive: true });
    symlinkSync(resolve(d.f.root, 'src/akrogon.ts'), resolve(d.home, '.local/bin/akrogon'));
    mkdirSync(resolve(d.home, '.config/systemd/user'), { recursive: true });
    symlinkSync(resolve(d.f.root, 'systemd/akrogon.slice'), resolve(d.home, '.config/systemd/user/akrogon.slice'));
    const result: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`deployed ${sha.slice(0, 12)}`);
    expect(result.stdout).toContain('switched');
    const current: string = resolve(d.home, 'current');
    expect(realpathSync(current)).toBe(resolve(releases(d), sha));
    expect(readlinkSync(resolve(d.home, '.local/bin/akrogon'))).toBe(resolve(current, 'src/akrogon.ts'));
    for (const root of roots)
      expect(readlinkSync(resolve(d.home, root, 'skill-one'))).toBe(resolve(current, 'skills/skill-one'));
    expect(readlinkSync(resolve(d.home, '.config/systemd/user/akrogon.slice'))).toBe(
      resolve(current, 'systemd/akrogon.slice'),
    );
  } finally {
    d.f.clean();
  }
});

test.serial('skill steps resolve the akrogon root through the release, never through git', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    await cli(d.f, ['next', '--all'], d.f.root, d.env);
    const sha: string = await head(d);
    const akrogon: string = resolve(d.home, '.local/bin/akrogon');
    expect(lstatSync(akrogon).isSymbolicLink()).toBe(true);
    const resolved: string = realpathSync(akrogon);
    expect(resolved).toBe(resolve(releases(d), sha, 'src/akrogon.ts'));
    const root: string = dirname(dirname(resolved));
    const imported: Result = await spawnCaptured([
      process.execPath,
      '-e',
      'const m = await import(process.argv[1]); console.log(m.releaseConfig);',
      resolve(root, 'src/config.ts'),
    ]);
    expect(imported.stdout.trim()).toBe('true');
    const lessons: Result = await spawnCaptured([
      process.execPath,
      '-e',
      'const m = await import(process.argv[1]); console.log(m.lessonsLoaded);',
      resolve(dirname(resolved), 'lessons.ts'),
    ]);
    expect(lessons.stdout.trim()).toBe('true');
    const git: Result = await run(['git', '-C', root, 'rev-parse', '--show-toplevel'], d.home);
    expect(git.code).not.toBe(0);
    const global = Bun.YAML.parse(readFileSync(resolve(d.home, 'config.yaml'), 'utf8')) as {
      repos: { [key: string]: string };
    };
    const workspace: string | undefined = global.repos['akrogon'];
    expect(workspace).toBeDefined();
    expect(realpathSync(workspace as string)).toBe(realpathSync(d.f.root));
  } finally {
    d.f.clean();
  }
});

test.serial('a hold record blocks the named commit while it is main', async () => {
  const d: DeployFixture = await deployFixture();
  try {
    const c0: string = await head(d);
    await cli(d.f, ['next', '--all'], d.f.root, d.env);
    const held: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'held\n'));
    const holdPath: string = resolve(d.home, 'release-hold.yaml');
    writeFileSync(holdPath, Bun.YAML.stringify({ commit: held }));
    const blocked: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(blocked.code).toBe(0);
    expect(blocked.stdout).toContain(`deploy held: ${held.slice(0, 12)}`);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), c0));
    const next: string = await pushSeed(d, () => writeFileSync(resolve(d.seed, 'file'), 'past\n'));
    const released: Result = await cli(d.f, ['next', '--all'], d.f.root, d.env);
    expect(released.code).toBe(0);
    expect(released.stdout).toContain(`deployed ${next.slice(0, 12)}`);
    expect(realpathSync(resolve(d.home, 'current'))).toBe(resolve(releases(d), next));
    expect(existsSync(holdPath)).toBe(false);
  } finally {
    d.f.clean();
  }
});
