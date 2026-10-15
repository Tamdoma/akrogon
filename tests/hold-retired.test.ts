import { test, expect, afterEach } from 'bun:test';
import { z } from 'zod';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { cli, fakeHerdr, fixture, leaf, leafTempRoot, storeDir, yaml, type Fixture } from './helpers';
import type { Database } from './fake-herdr';
import { readState } from '../src/state';
import { attemptRecordSchema } from '../src/attempts';
import { command, type Result } from '../src/shell';

const originalTempRoot: string | undefined = process.env.AKROGON_LEAF_TEMP_ROOT;
const originalHome: string | undefined = process.env.HOME;
afterEach(() => {
  if (originalTempRoot === undefined) delete process.env.AKROGON_LEAF_TEMP_ROOT;
  else process.env.AKROGON_LEAF_TEMP_ROOT = originalTempRoot;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
});

const POINTER: string = 'skills/merge-issue/SKILL.md';

function database(db: string): Database {
  return JSON.parse(readFileSync(db, 'utf8')) as Database;
}

function legacyHeld(f: Fixture): string {
  const file: string = resolve(f.home, 'held.yaml');
  writeFileSync(
    file,
    Bun.YAML.stringify({
      repo: {
        sha: '0123456789abcdef0123456789abcdef01234567',
        command: 'bun test',
        holder: 'hold',
        attempt: 'a1',
        at: '2026-10-10T00:00:00.000Z',
        evidence: '/x/review-B.md',
        fix: 'hold',
      },
    }),
  );
  return file;
}

for (const verb of ['unhold', 'hold-fix']) {
  test(`retired verb ${verb} fails naming the merge skill`, async () => {
    const f: Fixture = await fixture();
    try {
      const args: string[] = verb === 'hold-fix' ? [verb, 'hold'] : [verb];
      const res: Result = await cli(f, args);
      expect(res.code).not.toBe(0);
      expect(res.stderr).toContain(POINTER);
    } finally {
      f.clean();
    }
  });
}

test.serial('a nonempty legacy held.yaml is inert for status, pause, unpause and the merge turn', async () => {
  const f: Fixture = await fixture();
  try {
    process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(f);
    process.env.HOME = f.home;
    const file: string = legacyHeld(f);
    const before: string = readFileSync(file, 'utf8');
    const worktree: string = resolve(storeDir(f), 'hold');
    const sha: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    await command(['git', 'worktree', 'add', '-b', 'hold', worktree, sha], f.root);
    writeFileSync(resolve(worktree, 'file-hold'), 'hold\n');
    await command(['git', 'add', '.'], worktree);
    await command(['git', 'commit', '-m', 'hold'], worktree);
    const holderPath: string = leaf(f, 'hold', 'merge', {
      worktree,
      merge_stamp: '2026-10-05T00:00:00.000Z',
    });
    const herdr = fakeHerdr(f);
    const board: Result = await cli(f, ['status'], f.root, herdr.env);
    expect(board.code).toBe(0);
    expect(board.stdout).not.toContain('held');
    const targeted: Result = await cli(f, ['status', 'hold'], f.root, herdr.env);
    expect(targeted.code).toBe(0);
    expect(targeted.stdout).not.toContain('held:');
    expect((await cli(f, ['pause'], f.root, herdr.env)).code).toBe(0);
    const unpause: Result = await cli(f, ['unpause'], f.root, herdr.env);
    expect(unpause.code).toBe(0);
    expect(unpause.stdout).not.toContain('held');
    const db: Database = database(herdr.db);
    expect(db.prompts.some((prompt) => prompt.text.includes('merge-issue hold slot=B'))).toBe(true);
    expect(readState(holderPath).batch).toBeDefined();
    expect(readFileSync(file, 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
});

test('a held outcome already in merge-attempts.jsonl still parses and status still runs', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'hold', 'merge', { merge_stamp: '2026-10-05T00:00:00.000Z' });
    writeFileSync(
      resolve(f.root, 'issues/merge-attempts.jsonl'),
      JSON.stringify({
        attempt: 'a1',
        repo: 'repo',
        holder: 'hold',
        members: [],
        built_on: 'a'.repeat(40),
        outcome: 'held',
        end: '2026-10-10T00:00:00.000Z',
      }) + '\n',
    );
    const res: Result = await cli(f, ['status', 'hold']);
    expect(res.code).toBe(0);
    const parsed = attemptRecordSchema.safeParse(
      JSON.parse(readFileSync(resolve(f.root, 'issues/merge-attempts.jsonl'), 'utf8').trim()),
    );
    expect(parsed.success).toBe(true);
  } finally {
    f.clean();
  }
});

test('no source file reads or writes held.yaml and the hold module is gone', () => {
  const root: string = resolve(import.meta.dir, '..');
  const srcFiles: string[] = readdirSync(resolve(root, 'src'))
    .map((entry) => String(entry))
    .filter((entry) => entry.endsWith('.ts'));
  const banned: RegExp[] = [
    /heldFor/,
    /readHeld/,
    /writeHeld/,
    /dropHeld/,
    /setHeld/,
    /clearHeld/,
    /holdSchema/,
    /mergeHolder/,
    /holdFixCommand/,
    /unholdCommand/,
    /held\.ya?ml/,
  ];
  for (const name of srcFiles) {
    const text: string = readFileSync(resolve(root, 'src', name), 'utf8');
    for (const pattern of banned) {
      // state-home.ts names the retired file in its cutover copy list (state-home brief criterion 1); the ban stands for every other reference.
      if (name === 'state-home.ts' && pattern.source === 'held\\.ya?ml') continue;
      expect(text, `${name} matches ${pattern}`).not.toMatch(pattern);
    }
  }
  expect(existsSync(resolve(root, 'src/hold.ts'))).toBe(false);
});

test('sweep: no hold or merge red-on-base surface remains in skills, docs or the readme', () => {
  const root: string = resolve(import.meta.dir, '..');
  const files: string[] = [
    ...readdirSync(resolve(root, 'skills'), { recursive: true })
      .map((entry) => resolve(root, 'skills', String(entry)))
      .filter((file) => file.endsWith('.md')),
    ...readdirSync(resolve(root, 'docs'), { recursive: true })
      .map((entry) => resolve(root, 'docs', String(entry)))
      .filter((file) => file.endsWith('.md')),
    resolve(root, 'README.md'),
    resolve(root, 'src/AREA.md'),
    resolve(root, 'tests/AREA.md'),
  ];
  const banned: RegExp[] = [/hold-fix/, /\bunhold\b/, /--red-on-base/, /held\.ya?ml/];
  for (const file of files) {
    const text: string = readFileSync(file, 'utf8');
    for (const pattern of banned) expect(text, `${file} matches ${pattern}`).not.toMatch(pattern);
  }
});
