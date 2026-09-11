import { test, expect } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve, relative } from 'node:path';
import { fixture, cli, leaf, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { z } from 'zod';
import { readState, saveState, stateSchema, type State } from '../src/state';

function field(row: string, name: string): string {
  const match: RegExpMatchArray | null = row.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(.*?)(?=\\s+[\\w-]+\\s*=|$)`));
  expect(match).not.toBeNull();
  return match![1].trim();
}
function slots(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.replace(/\s/g, ''))
    .sort();
}

function register(f: Fixture, repos: Record<string, string>): void {
  const global: object = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, repos });
}
function event(slug: string, to: string, minutes: number, marker: string = ''): string {
  return JSON.stringify({
    ts: new Date(Date.now() - minutes * 60000).toISOString(),
    repo: 'repo',
    slug,
    from: 'implement',
    to,
    slot: 'B',
    attempts: { A: 0, B: 1 },
    fix_rounds: 0,
    verdict: {},
    head: marker,
    diff: '',
    session: null,
  });
}
function log(f: Fixture, lines: string[]): void {
  writeFileSync(resolve(f.root, 'issues/log.jsonl'), lines.join('\n') + '\n');
}
function snapshot(path: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(path, { recursive: true, withFileTypes: true }).map((item) => {
      const full: string = resolve(item.parentPath, item.name);
      return [relative(path, full), item.isDirectory() ? 'directory' : readFileSync(full).toString('base64')];
    }),
  );
}
function fakeHerdr(f: Fixture): NodeJS.ProcessEnv {
  const bin: string = resolve(f.home, 'bin');
  mkdirSync(bin);
  symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
  const db: string = resolve(f.home, 'herdr.json');
  writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0 }));
  return { PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db };
}

test('overview reads multiple repos outside git, retains hierarchy and recorded fields without writes', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    register(f, { repo: f.root, other: g.root });
    const failed: string = leaf(
      f,
      'broken',
      'failed',
      {
        done: ['A'],
        attempts: { A: 2, B: 3 },
        fix_rounds: 2,
        verdict: { A: 'fix', B: 'nits' },
        tab: 'w1:t9',
        'blocked-by': ['missing'],
        hand_built: true,
      },
      'epic/job',
    );
    leaf(f, 'ordinary', 'implement');
    const closed: string = leaf(f, 'closed-leaf', 'merged', {}, 'finished');
    mkdirSync(resolve(f.root, 'issues/closed'));
    renameSync(resolve(closed, '..'), resolve(f.root, 'issues/closed/finished'));
    leaf(g, 'remote-leaf', 'check.review', { repo: 'other' });
    mkdirSync(resolve(failed, 'plan.md'));
    mkdirSync(resolve(failed, 'review-A.md'));
    log(f, [
      event('broken', 'failed', 40),
      event('broken', 'implement', 1),
      event('broken', 'failed', 7),
      event('ordinary', 'failed', 0),
    ]);
    const env: NodeJS.ProcessEnv = fakeHerdr(f);
    const before: Record<string, string> = snapshot(resolve(f.root, 'issues'));
    const otherBefore: Record<string, string> = snapshot(resolve(g.root, 'issues'));
    const result: Result = await cli(f, ['status'], f.home, env);
    expect(result.code).toBe(0);
    const rows: string[] = result.stdout.split('\n');
    const row: string = rows.find((line) => /\bphase\s*=\s*failed\b/.test(line))!;
    expect(rows[0]).toContain('repo');
    expect(rows[0]).toContain('broken');
    expect(Bun.YAML.parse(field(row, 'done'))).toEqual(['A']);
    expect(slots(field(row, 'attempts'))).toEqual(['A:2', 'B:3']);
    expect(field(row, 'fix_rounds')).toBe('2');
    expect(slots(field(row, 'verdict'))).toEqual(['A:fix', 'B:nits']);
    expect(Bun.YAML.parse(field(row, 'tab'))).toBe('w1:t9');
    expect(Bun.YAML.parse(field(row, 'blocked-by'))).toEqual(['missing']);
    expect(field(row, 'age')).toBe('7m');
    const epic: number = rows.findIndex((line) => line.trim() === 'epic');
    const job: number = rows.findIndex((line) => line.trim() === 'job');
    const broken: number = rows.indexOf(row);
    expect(epic).toBeGreaterThan(0);
    expect(job).toBeGreaterThan(epic);
    expect(broken).toBeGreaterThan(job);
    expect(rows[job].search(/\S/)).toBeGreaterThan(rows[epic].search(/\S/));
    expect(row.search(/\S/)).toBeGreaterThan(rows[job].search(/\S/));
    expect(result.stdout).toContain('remote-leaf');
    expect(result.stdout).not.toContain('closed-leaf');
    expect(result.stdout).not.toContain('hand_built');
    expect(rows.filter((line) => /\bphase\s*=\s*failed\b/.test(line))).toHaveLength(1);
    const ordinary: string = rows.find((line) => /\bphase\s*=\s*implement\b/.test(line))!;
    expect(Bun.YAML.parse(field(ordinary, 'done'))).toEqual([]);
    expect(slots(field(ordinary, 'attempts'))).toEqual(['A:0', 'B:0']);
    expect(field(ordinary, 'fix_rounds')).toBe('0');
    expect(Bun.YAML.parse(field(ordinary, 'verdict'))).toEqual([]);
    expect(field(ordinary, 'tab')).toBe('unavailable');
    expect(Bun.YAML.parse(field(ordinary, 'blocked-by'))).toEqual([]);
    expect(field(ordinary, 'age')).toBe('unavailable');
    expect(snapshot(resolve(f.root, 'issues'))).toEqual(before);
    expect(snapshot(resolve(g.root, 'issues'))).toEqual(otherBefore);
    expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
  } finally {
    f.clean();
    g.clean();
  }
});

test('age is unavailable for missing, empty, unrelated and future history and uses file order', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'timed', 'implement');
    expect(
      field(
        (await cli(f, ['status'])).stdout.split('\n').find((line) => /^\s*timed\b/.test(line))!,
        'age',
      ),
    ).toBe('unavailable');
    for (const lines of [
      [],
      [event('other', 'implement', 1)],
      [event('timed', 'merge', 1)],
      [event('timed', 'implement', -10)],
    ]) {
      log(f, lines);
      const result: Result = await cli(f, ['status']);
      expect(result.code).toBe(0);
      expect(
        field(
          result.stdout.split('\n').find((line) => /^\s*timed\b/.test(line))!,
          'age',
        ),
      ).toBe('unavailable');
    }
    log(f, [event('timed', 'implement', 1), event('timed', 'implement', 12)]);
    expect(
      field(
        (await cli(f, ['status'])).stdout.split('\n').find((line) => /^\s*timed\b/.test(line))!,
        'age',
      ),
    ).toBe('12m');
  } finally {
    f.clean();
  }
});

test('incomplete repositories report exact paths before readable trees and exit nonzero', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    leaf(g, 'visible', 'implement', { repo: 'good' });
    register(f, { bad: f.root, good: g.root });
    const path: string = leaf(f, 'bad-leaf', 'implement', { repo: 'bad' });
    const state: string = resolve(path, 'state.yaml');
    const original: string = readFileSync(state, 'utf8');
    const verify = async (failingPath: string): Promise<void> => {
      const result: Result = await cli(f, ['status'], f.home);
      expect(result.code).not.toBe(0);
      const diagnostic: { unreadable: string; path: string } = z
        .object({ unreadable: z.string(), path: z.string() })
        .parse(JSON.parse(result.stdout.split('\n')[0]));
      expect(diagnostic.unreadable).toBe('bad');
      expect(diagnostic.path).toBe(failingPath);
      expect(result.stdout.indexOf('bad')).toBeLessThan(result.stdout.indexOf('visible'));
      expect(result.stdout).toContain('visible');
    };
    rmSync(state);
    symlinkSync(resolve(f.home, 'missing-state.yaml'), state);
    await verify(state);
    rmSync(state);
    for (const malformed of ['slug: [', 'slug: bad-leaf\nphase: invalid']) {
      writeFileSync(state, malformed);
      await verify(state);
    }
    writeFileSync(state, original);
    const history: string = resolve(f.root, 'issues/log.jsonl');
    for (const malformed of ['{', '{}', event('bad-leaf', 'implement', 1).replace('"slot":"B"', '"slot":"C"')]) {
      writeFileSync(history, malformed);
      await verify(history);
    }
    rmSync(history);
    mkdirSync(history);
    await verify(history);
    rmSync(history, { recursive: true });
    const open: string = resolve(f.root, 'issues/open');
    rmSync(open, { recursive: true });
    await verify(open);
    writeFileSync(open, 'file');
    await verify(open);
    rmSync(open);
    mkdirSync(open);
    expect((await cli(f, ['status'], f.home)).code).toBe(0);
    const missing: string = resolve(f.home, 'missing');
    register(f, { bad: missing, good: g.root });
    await verify(missing);
  } finally {
    f.clean();
    g.clean();
  }
});

test('overview rejects repo mismatches and duplicate slugs within an open repo', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'same', 'implement', { repo: 'wrong' });
    expect((await cli(f, ['status'])).code).not.toBe(0);
    saveState(path, { ...readState(path), repo: 'repo' });
    leaf(f, 'same', 'implement', {}, 'another');
    const result: Result = await cli(f, ['status']);
    expect(result.code).not.toBe(0);
    expect(result.stdout).toContain('same');
  } finally {
    f.clean();
  }
});

test('detail resolves authoritative closed state from a worktree, limits history, and never reads prose or writes', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'selected', 'merged');
    mkdirSync(resolve(f.root, 'issues/closed'));
    renameSync(resolve(path, '..'), resolve(f.root, 'issues/closed/issue'));
    const authoritative: string = resolve(f.root, 'issues/closed/issue/selected');
    mkdirSync(resolve(authoritative, 'plan.md'));
    const worktree: string = resolve(f.home, 'worktree');
    await command(['git', 'worktree', 'add', '-b', 'detail', worktree], f.root);
    leaf({ ...f, root: worktree }, 'selected', 'failed');
    log(
      f,
      Array.from({ length: 13 }, (_, index) =>
        event('selected', index % 2 === 0 ? 'implement' : 'merged', 20 - index, `record-${index}`),
      ).flatMap((line) => [line, event('other', 'merged', 0)]),
    );
    const env: NodeJS.ProcessEnv = fakeHerdr(f);
    const before: Record<string, string> = snapshot(resolve(f.root, 'issues'));
    const inertBefore: Record<string, string> = snapshot(resolve(worktree, 'issues'));
    const result: Result = await cli(f, ['status', 'selected'], worktree, env);
    expect(result.code).toBe(0);
    const state: State = stateSchema.parse(Bun.YAML.parse(result.stdout.split(/^History\s*:\s*$/m)[0]));
    expect(state).toEqual(readState(authoritative));
    expect(result.stdout).toContain(resolve(authoritative, 'plan.md'));
    const records: { slug: string; head: string }[] = result.stdout
      .split(/^History\s*:\s*$/m)[1]
      .split('\n')
      .filter((line) => line.trimStart().startsWith('{'))
      .map((line) => z.object({ slug: z.string(), head: z.string() }).parse(JSON.parse(line)));
    expect(records).toHaveLength(10);
    expect(records.map((record) => record.head)).toEqual(
      Array.from({ length: 10 }, (_, index) => `record-${index + 3}`),
    );
    expect(records.every((record) => record.slug === 'selected')).toBe(true);
    expect(snapshot(resolve(f.root, 'issues'))).toEqual(before);
    expect(snapshot(resolve(worktree, 'issues'))).toEqual(inertBefore);
    expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
    rmSync(resolve(f.root, 'issues/log.jsonl'));
    rmSync(resolve(authoritative, 'plan.md'), { recursive: true });
    const noHistory: Result = await cli(f, ['status', 'selected'], worktree, env);
    expect(noHistory.code).toBe(0);
    expect(noHistory.stdout).toContain('unavailable');
    expect(noHistory.stdout).toContain(resolve(authoritative, 'plan.md'));
    expect((await cli(f, ['status', 'missing'], worktree, env)).code).not.toBe(0);
    expect((await cli(f, ['status', 'selected', 'extra'], worktree, env)).code).not.toBe(0);
  } finally {
    f.clean();
  }
});
