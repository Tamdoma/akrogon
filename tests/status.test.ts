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

const columns: string[] = ['LEAF', 'PHASE', 'AGE', 'BLOCKED BY', 'NOTE'];
function cell(output: string, row: string, name: string): string {
  const lines: string[] = output.split('\n');
  const header: string = lines
    .slice(0, lines.indexOf(row))
    .findLast((line) => columns.every((title) => line.includes(title)))!;
  const index: number = columns.indexOf(name);
  const start: number = header.indexOf(name);
  const end: number = index + 1 < columns.length ? header.indexOf(columns[index + 1]) : row.length;
  return row.slice(start, end).trim();
}
function leafRow(output: string, slug: string): string {
  return output.split('\n').find((line) => new RegExp(`^\\s*${slug}\\s`).test(line))!;
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
        priority: 'n',
        slot: 'B',
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
    const row: string = leafRow(result.stdout, 'broken');
    expect(rows[0]).toContain('repo');
    expect(rows[0]).toContain('broken');
    expect(cell(result.stdout, row, 'PHASE')).toBe('failed');
    const noteText: string = cell(result.stdout, row, 'NOTE');
    expect(noteText).toContain('done A');
    expect(noteText).toContain('A:2 B:3');
    expect(noteText).toContain('fix rounds 2');
    expect(noteText).toContain('A:fix');
    expect(noteText).toContain('B:nits');
    expect(noteText).not.toContain('w1:t9');
    expect(cell(result.stdout, row, 'BLOCKED BY')).toBe('missing');
    expect(cell(result.stdout, row, 'AGE')).toBe('7m');
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
    expect(result.stdout).not.toContain('no open leaves');
    expect(rows.filter((line) => /^\s*\S+\s+failed\b/.test(line))).toHaveLength(1);
    const ordinary: string = leafRow(result.stdout, 'ordinary');
    expect(cell(result.stdout, ordinary, 'PHASE')).toBe('implement');
    expect(cell(result.stdout, ordinary, 'NOTE')).toBe('');
    expect(cell(result.stdout, ordinary, 'BLOCKED BY')).toBe('');
    expect(cell(result.stdout, ordinary, 'AGE')).toBe('-');
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
    const first: string = (await cli(f, ['status'])).stdout;
    expect(cell(first, leafRow(first, 'timed'), 'AGE')).toBe('-');
    for (const lines of [
      [],
      [event('other', 'implement', 1)],
      [event('timed', 'merge', 1)],
      [event('timed', 'implement', -10)],
    ]) {
      log(f, lines);
      const result: Result = await cli(f, ['status']);
      expect(result.code).toBe(0);
      expect(cell(result.stdout, leafRow(result.stdout, 'timed'), 'AGE')).toBe('-');
    }
    log(f, [event('timed', 'implement', 1), event('timed', 'implement', 12)]);
    const aged: string = (await cli(f, ['status'])).stdout;
    expect(cell(aged, leafRow(aged, 'timed'), 'AGE')).toBe('12m');
  } finally {
    f.clean();
  }
});

for (const directory of ['missing', 'empty']) {
  test(`overview reports no open leaves for a ${directory} open directory without writes`, async () => {
    const f: Fixture = await fixture();
    try {
      register(f, { repo: f.root });
      const open: string = resolve(f.root, 'issues/open');
      if (directory === 'missing') rmSync(open, { recursive: true });
      const before: Record<string, string> = snapshot(resolve(f.root, 'issues'));
      const result: Result = await cli(f, ['status'], f.home);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe('repo\n  no open leaves');
      expect(result.stderr).toBe('');
      expect(result.stdout.split('\n').filter((line) => /^\s*\S+\s+failed\b/.test(line))).toHaveLength(0);
      expect(existsSync(open)).toBe(directory === 'empty');
      expect(snapshot(resolve(f.root, 'issues'))).toEqual(before);
    } finally {
      f.clean();
    }
  });
}

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
      expect(result.code).toBe(1);
      const diagnostic: { unreadable: string; path: string } = z
        .object({ unreadable: z.string(), path: z.string() })
        .parse(JSON.parse(result.stdout.split('\n')[0]));
      expect(diagnostic.unreadable).toBe('bad');
      expect(diagnostic.path).toBe(failingPath);
      expect(result.stdout.indexOf('bad')).toBeLessThan(result.stdout.indexOf('visible'));
      expect(result.stdout).toContain('visible');
      expect(result.stdout).not.toContain('no open leaves');
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
    mkdirSync(resolve(f.root, 'issues/parked/resting'), { recursive: true });
    for (const make of [(): void => undefined, (): void => mkdirSync(open)]) {
      make();
      const empty: Result = await cli(f, ['status'], f.home);
      expect(empty.code).toBe(0);
      expect(empty.stdout).not.toContain('unreadable');
      expect(empty.stdout.split('\n').slice(0, 4)).toEqual(['bad', '  no open leaves', '  parked  resting', 'good']);
      expect(cell(empty.stdout, leafRow(empty.stdout, 'visible'), 'PHASE')).toBe('implement');
    }
    rmSync(open, { recursive: true });
    writeFileSync(open, 'file');
    await verify(open);
    rmSync(open);
    mkdirSync(open);
    const config: string = resolve(f.root, 'issues/config.yaml');
    for (const malformed of ['checks: [', 'checks: invalid']) {
      writeFileSync(config, malformed);
      await verify(config);
    }
    const missing: string = resolve(f.home, 'missing');
    register(f, { bad: missing, good: g.root });
    await verify(missing);
  } finally {
    f.clean();
    g.clean();
  }
});

test('repo mismatch identifies both keys in overview and detail while healthy repos remain visible', async () => {
  const f: Fixture = await fixture();
  const g: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'wrong-key', 'plan.synthesis', { repo: 'other' });
    leaf(g, 'visible', 'implement', { repo: 'healthy' });
    register(f, { repo: f.root, healthy: g.root });
    const before: Record<string, string> = snapshot(resolve(f.root, 'issues'));
    const overview: Result = await cli(f, ['status'], f.home);
    expect(overview.code).not.toBe(0);
    const diagnostic: { unreadable: string; path: string; error: string } = z
      .object({ unreadable: z.string(), path: z.string(), error: z.string() })
      .parse(JSON.parse(overview.stdout.split('\n')[0]));
    expect(diagnostic).toMatchObject({ unreadable: 'repo', path: resolve(path, 'state.yaml') });
    expect(overview.stdout).toContain('visible');
    const detail: Result = await cli(f, ['status', 'wrong-key']);
    expect(detail.code).not.toBe(0);
    for (const error of [diagnostic.error, detail.stderr]) {
      expect(error).toContain(path);
      expect(error).toMatch(/stored[^\n]*other/i);
      expect(error).toMatch(/registered[^\n]*repo/i);
    }
    expect(snapshot(resolve(f.root, 'issues'))).toEqual(before);
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
    const path: string = leaf(f, 'selected', 'merged', { priority: 'n', slot: 'B' });
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
    const stateText: string = result.stdout.split(/^History\s*:\s*$/m)[0];
    expect(stateText).not.toMatch(/^(priority|slot):/m);
    const state: State = stateSchema.parse(Bun.YAML.parse(stateText));
    expect(state).toEqual(readState(authoritative));
    expect(result.stdout).toContain(resolve(authoritative, 'plan.md'));
    const records: { slug: string; head: string; slot: string }[] = result.stdout
      .split(/^History\s*:\s*$/m)[1]
      .split('\n')
      .filter((line) => line.trimStart().startsWith('{'))
      .map((line) => z.object({ slug: z.string(), head: z.string(), slot: z.string() }).parse(JSON.parse(line)));
    expect(records).toHaveLength(10);
    expect(records.map((record) => record.head)).toEqual(
      Array.from({ length: 10 }, (_, index) => `record-${index + 3}`),
    );
    expect(records.every((record) => record.slug === 'selected' && record.slot === 'B')).toBe(true);
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

test('busy durations appear in NOTE for every recorded seat without writes or herdr calls', async () => {
  const f: Fixture = await fixture();
  try {
    const now: number = Date.now();
    leaf(f, 'long', 'implement', {
      busy_since: { A: new Date(now - 62 * 60000).toISOString(), B: new Date(now - 1503 * 60000).toISOString() },
    });
    leaf(f, 'short', 'implement', {
      busy_since: { A: new Date(now - 2 * 60000).toISOString(), B: new Date(now + 60000).toISOString() },
    });
    leaf(f, 'empty', 'implement');
    const env: NodeJS.ProcessEnv = fakeHerdr(f);
    const before: Record<string, string> = snapshot(resolve(f.root, 'issues'));
    const result: Result = await cli(f, ['status'], f.home, env);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'long'), 'NOTE')).toContain('busy A 1h02m');
    expect(cell(result.stdout, leafRow(result.stdout, 'long'), 'NOTE')).toContain('busy B 25h03m');
    expect(cell(result.stdout, leafRow(result.stdout, 'short'), 'NOTE')).toContain('busy A 0h02m');
    expect(cell(result.stdout, leafRow(result.stdout, 'short'), 'NOTE')).toContain('busy B 0h00m');
    expect(cell(result.stdout, leafRow(result.stdout, 'empty'), 'NOTE')).not.toContain('busy');
    expect(snapshot(resolve(f.root, 'issues'))).toEqual(before);
    expect(existsSync(resolve(f.home, 'herdr.json.calls'))).toBe(false);
  } finally {
    f.clean();
  }
});

for (const nesting of ['', 'invalid', 'epic/issue/extra/invalid']) {
  test(`status reports invalid open/${nesting} while showing another repo without writes`, async () => {
    const f: Fixture = await fixture();
    const g: Fixture = await fixture();
    try {
      register(f, { repo: f.root, good: g.root });
      leaf(g, 'visible', 'implement', { repo: 'good' });
      const source: string = leaf(f, 'invalid', 'implement');
      const path: string = resolve(f.root, 'issues/open', nesting);
      mkdirSync(path, { recursive: true });
      renameSync(resolve(source, 'state.yaml'), resolve(path, 'state.yaml'));
      rmSync(source, { recursive: true });
      const before: Record<string, string> = snapshot(f.root);
      const overview: Result = await cli(f, ['status'], f.home);
      expect(overview.code).toBe(1);
      expect(overview.stdout).toContain('"unreadable":"repo"');
      expect(overview.stdout).toContain(resolve(path, 'state.yaml'));
      expect(overview.stdout).toContain('visible');
      expect(snapshot(f.root)).toEqual(before);
      for (const area of ['open', 'closed']) {
        const detailed: Result = await cli(f, ['status', 'invalid']);
        expect(detailed.code).toBe(1);
        expect(detailed.stderr).toContain(resolve(f.root, 'issues', area, nesting, 'state.yaml'));
        if (area === 'open') renameSync(resolve(f.root, 'issues/open'), resolve(f.root, 'issues/closed'));
      }
      renameSync(resolve(f.root, 'issues/closed'), resolve(f.root, 'issues/open'));
      expect(snapshot(f.root)).toEqual(before);
    } finally {
      f.clean();
      g.clean();
    }
  });
}

for (const owner of ['issue', 'epic/issue']) {
  test(`status identifies dormant ${owner}/resting and prefers open or closed leaves`, async () => {
    const f: Fixture = await fixture();
    try {
      const parked: string = resolve(f.root, 'issues/parked', owner, 'resting');
      mkdirSync(parked, { recursive: true });
      writeFileSync(resolve(parked, 'state.yaml'), 'slug: [');
      const before: Record<string, string> = snapshot(f.root);
      const result: Result = await cli(f, ['status', 'resting']);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Missing leaf: resting (parked)');
      for (const slug of ['absent', 'issue', 'epic']) {
        const missing: Result = await cli(f, ['status', slug]);
        expect(missing.code).toBe(1);
        expect(missing.stderr).toContain(`Missing leaf: ${slug}`);
        expect(missing.stderr.split('\n').find((line) => line.startsWith('error: '))).toBe(
          `error: Missing leaf: ${slug}`,
        );
      }
      expect(snapshot(f.root)).toEqual(before);
      leaf(f, 'resting', 'implement');
      for (const area of ['open', 'closed']) {
        const active: Result = await cli(f, ['status', 'resting']);
        expect(active.code).toBe(0);
        expect(active.stdout).toContain('phase: implement');
        if (area === 'open') renameSync(resolve(f.root, 'issues/open'), resolve(f.root, 'issues/closed'));
      }
    } finally {
      f.clean();
    }
  });
}

test('--charts lists every chart with taken counts, fog items, stage and age', async () => {
  const f: Fixture = await fixture();
  try {
    const store: string = resolve(f.root, 'issues/chart');
    mkdirSync(resolve(store, 'routed/forks'), { recursive: true });
    writeFileSync(
      resolve(store, 'routed/CHART.md'),
      '# Chart: routed\n\n## Forks taken\n- one\n\n## Fog\n- a gap\n- another\n\nHanded off 2026-09-11\n',
    );
    writeFileSync(resolve(store, 'routed/forks/one.md'), '# One\n\n## Question\nq\n\n## Taken\nyes\n');
    writeFileSync(resolve(store, 'routed/forks/two.md'), '# Two\n\n## Question\nq\n\n## Taken\n');
    mkdirSync(resolve(store, 'blank'), { recursive: true });
    writeFileSync(resolve(store, 'blank/CHART.md'), '# Chart: blank\n\n## Fog\n- None.\n');
    const result: Result = await cli(f, ['status', '--charts']);
    expect(result.code).toBe(0);
    expect(result.stdout).not.toContain('no open leaves');
    const routed: string = result.stdout.split('\n').find((line) => /^\s*routed\s/.test(line))!;
    expect(routed).toMatch(/routed\s+1\/2\s+2\s+handed off\s+\d+m$/);
    const blank: string = result.stdout.split('\n').find((line) => /^\s*blank\s/.test(line))!;
    expect(blank).toMatch(/blank\s+0\/0\s+0\s+empty\s+\d+m$/);
    expect((await cli(f, ['status', 'x', '--charts'])).code).not.toBe(0);
    rmSync(store, { recursive: true });
    expect((await cli(f, ['status', '--charts'])).stdout).toBe('repo\n  no charts');
  } finally {
    f.clean();
  }
});

test('--charts derives stage from last terminal marker line', async () => {
  const f: Fixture = await fixture();
  try {
    const store: string = resolve(f.root, 'issues/chart');
    mkdirSync(resolve(store, 'trailing'), { recursive: true });
    writeFileSync(
      resolve(store, 'trailing/CHART.md'),
      '# Chart: trailing\n\n## Fog\n- None.\n\nHanded off 2026-09-11 into foo\n',
    );
    mkdirSync(resolve(store, 'forward'), { recursive: true });
    writeFileSync(
      resolve(store, 'forward/CHART.md'),
      '# Chart: forward\n\n## Fog\n- None.\n\nHeld 2026-09-15: waiting\n\nHanded off 2026-09-17\n',
    );
    mkdirSync(resolve(store, 'backward'), { recursive: true });
    writeFileSync(
      resolve(store, 'backward/CHART.md'),
      '# Chart: backward\n\n## Fog\n- None.\n\nHanded off 2026-09-11\n\nHeld 2026-09-15: waiting\n',
    );
    mkdirSync(resolve(store, 'buried'), { recursive: true });
    writeFileSync(
      resolve(store, 'buried/CHART.md'),
      '# Chart: buried\n\n## Fog\n- None.\n\n## Off route\n- Closed the gap on x\n',
    );
    mkdirSync(resolve(store, 'shuttered/forks'), { recursive: true });
    writeFileSync(
      resolve(store, 'shuttered/CHART.md'),
      '# Chart: shuttered\n\n## Fog\n- None.\n\nClosed 2026-09-12: done\n',
    );
    writeFileSync(resolve(store, 'shuttered/forks/keep.md'), '# Keep\n\n## Question\nq\n\n## Taken\n');
    const result: Result = await cli(f, ['status', '--charts']);
    expect(result.code).toBe(0);
    const row = (name: string): string =>
      result.stdout.split('\n').find((line) => new RegExp(`^\\s*${name}\\s`).test(line))!;
    expect(row('trailing')).toMatch(/trailing\s+0\/0\s+0\s+handed off\s+\d+m$/);
    expect(row('forward')).toMatch(/forward\s+0\/0\s+0\s+handed off\s+\d+m$/);
    expect(row('backward')).toMatch(/backward\s+0\/0\s+0\s+held\s+\d+m$/);
    expect(row('buried')).toMatch(/buried\s+0\/0\s+0\s+empty\s+\d+m$/);
    expect(row('shuttered')).toMatch(/shuttered\s+0\/1\s+0\s+closed\s+\d+m$/);
    rmSync(store, { recursive: true });
    mkdirSync(store, { recursive: true });
    writeFileSync(resolve(store, 'CHART.md'), '# Chart: solo\n\n## Fog\n- None.\n\nHeld 2026-09-15: waiting\n');
    const single: Result = await cli(f, ['status', '--charts']);
    expect(single.code).toBe(0);
    const solo: string = single.stdout.split('\n').find((line) => /^\s*chart\s/.test(line))!;
    expect(solo).toMatch(/chart\s+0\/0\s+0\s+held\s+\d+m$/);
  } finally {
    f.clean();
  }
});

test('failed leaves show cause and reason in NOTE and terminal phases suppress busy', async () => {
  const f: Fixture = await fixture();
  try {
    const now: number = Date.now();
    const busy: string = new Date(now - 62 * 60000).toISOString();
    leaf(f, 'with-cause', 'failed', {
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs api key' },
      busy_since: { A: busy },
    });
    leaf(f, 'legacy-failed', 'failed', { busy_since: { A: busy } });
    leaf(f, 'done-leaf', 'merged', { busy_since: { A: busy, B: busy } });
    leaf(f, 'active-leaf', 'implement', { busy_since: { A: busy } });
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'with-cause'), 'NOTE')).toContain('failed blocked needs api key');
    expect(cell(result.stdout, leafRow(result.stdout, 'legacy-failed'), 'NOTE')).toBe('failed');
    expect(cell(result.stdout, leafRow(result.stdout, 'with-cause'), 'NOTE')).not.toContain('busy');
    expect(cell(result.stdout, leafRow(result.stdout, 'legacy-failed'), 'NOTE')).not.toContain('busy');
    expect(cell(result.stdout, leafRow(result.stdout, 'done-leaf'), 'NOTE')).not.toContain('busy');
    expect(cell(result.stdout, leafRow(result.stdout, 'active-leaf'), 'NOTE')).toContain('busy A 1h02m');
  } finally {
    f.clean();
  }
});
