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
import { fixture, cli, leaf, yaml, fakeHerdr, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { z } from 'zod';
import { readState, saveState, stateSchema, type State } from '../src/state';

const columns: string[] = ['LEAF', 'PHASE', 'AGE', 'BLOCKED BY', 'NOTE', 'TURN'];
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
function mergeRecord(slug: string, minutes: number): string {
  return JSON.stringify({
    ts: new Date(Date.now() - minutes * 60000).toISOString(),
    repo: 'repo',
    slug,
    from: 'check.review',
    to: 'merge',
    slot: 'B',
    attempts: { A: 0, B: 0 },
    fix_rounds: 0,
    verdict: {},
    head: '0123456789abcdef0123456789abcdef01234567',
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
    const env: NodeJS.ProcessEnv = fakeHerdr(f).env;
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
      expect(empty.stdout.split('\n')[0]).toBe('bad');
      expect(cell(empty.stdout, leafRow(empty.stdout, 'resting'), 'PHASE')).toBe('parked');
      expect(empty.stdout).not.toContain('no open leaves');
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
    const env: NodeJS.ProcessEnv = fakeHerdr(f).env;
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
    const env: NodeJS.ProcessEnv = fakeHerdr(f).env;
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

test('delivery errors surface as prompt tokens unless the seat is busy', async () => {
  const f: Fixture = await fixture();
  try {
    const err = (code: string) => ({
      command: ['herdr', 'agent', 'prompt'],
      code,
      message: 'slow',
      pane: 'p1',
      session: 's1',
      at: '2026-09-19T00:00:00.000Z',
    });
    const idle: string = leaf(f, 'prompt-idle', 'implement');
    saveState(idle, { ...readState(idle), delivery_error: { A: err('timeout') } });
    const busyAt: string = new Date(Date.now() - 60000).toISOString();
    const mixed: string = leaf(f, 'prompt-mixed', 'implement', { busy_since: { B: busyAt } });
    saveState(mixed, {
      ...readState(mixed),
      delivery_error: { A: err('timeout'), B: err('agent_not_ready') },
    });
    const hidden: string = leaf(f, 'prompt-hidden', 'implement', { busy_since: { A: busyAt } });
    saveState(hidden, { ...readState(hidden), delivery_error: { A: err('timeout') } });
    leaf(f, 'legacy-clean', 'implement');
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'prompt-idle'), 'NOTE')).toContain('A prompt timeout');
    const mixedNote: string = cell(result.stdout, leafRow(result.stdout, 'prompt-mixed'), 'NOTE');
    expect(mixedNote).toContain('A prompt timeout');
    expect(mixedNote).not.toContain('B prompt');
    expect(mixedNote).toContain('busy B');
    const hiddenNote: string = cell(result.stdout, leafRow(result.stdout, 'prompt-hidden'), 'NOTE');
    expect(hiddenNote).not.toContain('prompt');
    expect(hiddenNote).toContain('busy A');
    expect(cell(result.stdout, leafRow(result.stdout, 'legacy-clean'), 'NOTE')).not.toContain('prompt');
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

function needs(slug: string, steps: string = 'ask the vault for FOO'): object {
  return {
    inputs: [
      {
        kind: 'env',
        name: 'FOO',
        holder: 'repo',
        purpose: 'authenticate',
        consumers: [slug],
        steps,
        source: 'vault',
        done: 'FOO set in .env',
      },
    ],
    produces: [],
    grants: [],
    retained: [],
    proofs: [],
  };
}

test('status prints Missing lines after Failed lines and before the repo section without env values', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'broken', 'failed');
    leaf(f, 'needy', 'implement');
    const withReadiness: string = leaf(f, 'with-readiness', 'implement');
    yaml(resolve(withReadiness, 'readiness.yaml'), needs('with-readiness'));
    writeFileSync(resolve(f.root, '.env'), 'OTHER=secretvalue123\n');
    const overview: Result = await cli(f, ['status']);
    expect(overview.code).toBe(0);
    const missing: string = 'Missing: repo/with-readiness env FOO in repo: ask the vault for FOO';
    expect(overview.stdout).toContain(missing);
    const rows: string[] = overview.stdout.split('\n');
    const failedIndex: number = rows.findIndex((line) => line.startsWith('Failed: '));
    const missingIndex: number = rows.indexOf(missing);
    const sectionIndex: number = rows.indexOf('repo');
    expect(failedIndex).toBeGreaterThanOrEqual(0);
    expect(missingIndex).toBeGreaterThan(failedIndex);
    expect(sectionIndex).toBeGreaterThan(missingIndex);
    expect(rows.filter((line) => line.startsWith('Missing: '))).toHaveLength(1);
    expect(overview.stdout).not.toContain('secretvalue123');
    expect(overview.stdout).not.toContain('repo/needy ');
    expect(overview.stdout).not.toContain('repo/broken ');
    writeFileSync(resolve(f.root, '.env'), 'OTHER=secretvalue123\nFOO=fill\n');
    const filled: Result = await cli(f, ['status']);
    expect(filled.code).toBe(0);
    expect(filled.stdout).not.toContain('Missing:');
    expect(filled.stdout).not.toContain('secretvalue123');
  } finally {
    f.clean();
  }
});

test('status detail prints Missing lines between state and History without env values', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'needs-env', 'implement');
    yaml(resolve(path, 'readiness.yaml'), needs('needs-env'));
    writeFileSync(resolve(f.root, '.env'), 'OTHER=secretvalue123\n');
    const detail: Result = await cli(f, ['status', 'needs-env']);
    expect(detail.code).toBe(0);
    const missing: string = 'Missing: repo/needs-env env FOO in repo: ask the vault for FOO';
    expect(detail.stdout).toContain(missing);
    expect(detail.stdout.indexOf(missing)).toBeGreaterThan(detail.stdout.indexOf('phase: implement'));
    expect(detail.stdout.indexOf('History:')).toBeGreaterThan(detail.stdout.indexOf(missing));
    expect(detail.stdout).not.toContain('secretvalue123');
    const plain: Result = await cli(f, ['status']);
    expect(plain.stdout).not.toContain('secretvalue123');
  } finally {
    f.clean();
  }
});

test('merged leaves show gaps in open and closed detail but not overview', async () => {
  const f: Fixture = await fixture();
  try {
    const merged: string = leaf(f, 'done-ready', 'merged');
    yaml(resolve(merged, 'readiness.yaml'), {
      inputs: [
        {
          kind: 'file',
          name: 'required.pem',
          holder: 'repo',
          purpose: 'certificate',
          consumers: ['done-ready'],
          steps: 'restore required.pem',
          source: 'operator certificate',
          done: 'file present',
        },
      ],
      produces: [],
      grants: [],
      retained: [],
      proofs: [],
    });
    const open: string = leaf(f, 'still-open', 'implement');
    yaml(resolve(open, 'readiness.yaml'), needs('still-open'));
    const overview: Result = await cli(f, ['status']);
    expect(overview.code).toBe(0);
    expect(overview.stdout).toContain('Missing: repo/still-open env FOO');
    expect(overview.stdout).not.toContain('Missing: repo/done-ready');
    const detail: Result = await cli(f, ['status', 'done-ready']);
    expect(detail.code).toBe(0);
    const missing: string = 'Missing: repo/done-ready file required.pem in repo: restore required.pem';
    expect(detail.stdout).toContain(missing);
    expect(detail.stdout.indexOf('History:')).toBeGreaterThan(detail.stdout.indexOf(missing));
    const closed: string = resolve(f.root, 'issues/closed/issue');
    mkdirSync(closed, { recursive: true });
    renameSync(merged, resolve(closed, 'done-ready'));
    const closedDetail: Result = await cli(f, ['status', 'done-ready']);
    expect(closedDetail.code).toBe(0);
    expect(closedDetail.stdout).toContain(missing);
  } finally {
    f.clean();
  }
});

test('invalid readiness.yaml reports its path in overview and detail', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'healthy', 'implement');
    const bad: string = leaf(f, 'bad-readiness', 'implement');
    const file: string = resolve(bad, 'readiness.yaml');
    writeFileSync(file, 'inputs: [\n');
    const overview: Result = await cli(f, ['status']);
    expect(overview.code).toBe(1);
    const diagnostic: { unreadable: string; path: string; error: string } = z
      .object({ unreadable: z.string(), path: z.string(), error: z.string() })
      .parse(JSON.parse(overview.stdout.split('\n')[0]));
    expect(diagnostic.unreadable).toBe('repo');
    expect(diagnostic.path).toBe(file);
    expect(diagnostic.error).toContain(file);
    const detail: Result = await cli(f, ['status', 'bad-readiness']);
    expect(detail.code).not.toBe(0);
    expect(detail.stderr).toContain(file);
    writeFileSync(file, 'inputs: []\n');
    const stillBad: Result = await cli(f, ['status']);
    expect(stillBad.code).toBe(1);
    expect(stillBad.stdout.split('\n')[0]).toContain(file);
  } finally {
    f.clean();
  }
});

test('TURN names the holder and later stamp places', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'aa', 'merge', { merge_stamp: new Date(Date.now() - 20 * 60000).toISOString() });
    leaf(f, 'bb', 'merge', { merge_stamp: new Date(Date.now() - 10 * 60000).toISOString() });
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'aa'), 'TURN')).toBe('holder');
    expect(cell(result.stdout, leafRow(result.stdout, 'bb'), 'TURN')).toBe('2');
  } finally {
    f.clean();
  }
});

test('TURN orders unstamped merge leaves by last to: merge record and marks no record last', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'queued', 'merge');
    leaf(f, 'waiting', 'merge');
    leaf(f, 'unmarked', 'merge');
    log(f, [mergeRecord('queued', 15), mergeRecord('waiting', 10), mergeRecord('queued', 5)]);
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'waiting'), 'TURN')).toBe('holder');
    expect(cell(result.stdout, leafRow(result.stdout, 'queued'), 'TURN')).toBe('2');
    expect(cell(result.stdout, leafRow(result.stdout, 'unmarked'), 'TURN')).toBe('3 no merge record');
  } finally {
    f.clean();
  }
});

test('TURN is empty for ineligible merge leaves and non-merge leaves', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'manual', 'merge', { hand_built: true });
    leaf(f, 'building', 'implement');
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(cell(result.stdout, leafRow(result.stdout, 'manual'), 'TURN')).toBe('');
    expect(cell(result.stdout, leafRow(result.stdout, 'building'), 'TURN')).toBe('');
  } finally {
    f.clean();
  }
});
test('status detail prints the seats the next agent start uses with the file each came from', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'seated', 'implement');
    const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
    writeFileSync(index, '---\nslots:\n  a: {harness: fake, model: index-a, effort: low}\n---\n# Issue\n');
    const repoConfig: object = Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8')) as object;
    yaml(resolve(f.root, 'issues/config.yaml'), {
      ...repoConfig,
      slots: { b: { harness: 'fake', model: 'repo-b', effort: 'medium' } },
    });
    const result: Result = await cli(f, ['status', 'seated']);
    expect(result.code).toBe(0);
    const lines: string[] = result.stdout.split('\n');
    const label: number = lines.findIndex((line) => /seats/i.test(line) && /next agent start/i.test(line));
    expect(label).toBeGreaterThan(lines.findIndex((line) => line.startsWith('phase:')));
    expect(label).toBeGreaterThan(lines.findIndex((line) => line === 'History:'));
    const block: Record<string, { harness: string; model: string; effort: string; source: string }> = z
      .record(
        z.string(),
        z.strictObject({ harness: z.string(), model: z.string(), effort: z.string(), source: z.string() }),
      )
      .parse(Bun.YAML.parse(lines.slice(label + 1).join('\n')));
    expect(block.a).toEqual({ harness: 'fake', model: 'index-a', effort: 'low', source: index });
    expect(block.b).toEqual({
      harness: 'fake',
      model: 'repo-b',
      effort: 'medium',
      source: resolve(f.root, 'issues/config.yaml'),
    });
  } finally {
    f.clean();
  }
});

test('overview NOTE marks only leaves whose seat comes from an index', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'seated', 'implement');
    const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
    writeFileSync(
      index,
      '---\nslots:\n  a: {harness: fake, model: index-a, effort: low}\n  b: {harness: fake, model: index-b, effort: low}\n---\n# Issue\n',
    );
    leaf(f, 'plain', 'implement', {}, 'other');
    writeFileSync(resolve(f.root, 'issues/open/other/ISSUE.md'), '# Other\nno front matter\n');
    leaf(f, 'deep', 'implement', {}, 'epic/child');
    const epic: string = resolve(f.root, 'issues/open/epic/EPIC.md');
    writeFileSync(epic, '---\nslots:\n  a: {harness: fake, model: epic-a, effort: low}\n---\n# Epic\n');
    writeFileSync(resolve(f.root, 'issues/open/epic/child/ISSUE.md'), '# Child\n');
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    const note: string = cell(result.stdout, leafRow(result.stdout, 'seated'), 'NOTE');
    expect(note.match(/seats ISSUE\.md/g)).toHaveLength(1);
    expect(cell(result.stdout, leafRow(result.stdout, 'plain'), 'NOTE')).toBe('');
    expect(cell(result.stdout, leafRow(result.stdout, 'deep'), 'NOTE')).toBe('seats EPIC.md');
  } finally {
    f.clean();
  }
});

const malformedIndexes: Record<string, string> = {
  'unparseable front matter': '---\nslots: [\n---\n# Issue\n',
  'missing seat field': '---\nslots:\n  a: {harness: fake, model: index-a}\n---\n# Issue\n',
};

test('status rejects malformed epic front matter when the issue overrides both seats', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'shadowed', 'implement', {}, 'epic/issue');
    writeFileSync(
      resolve(f.root, 'issues/open/epic/issue/ISSUE.md'),
      '---\nslots:\n  a: {harness: fake, model: issue-a, effort: high}\n  b: {harness: fake, model: issue-b, effort: medium}\n---\n# Issue\n',
    );
    const epic: string = resolve(f.root, 'issues/open/epic/EPIC.md');
    writeFileSync(epic, '---\nslots: [\n---\n# Epic\n');
    const detail: Result = await cli(f, ['status', 'shadowed']);
    expect(detail.code).not.toBe(0);
    expect(detail.stderr).toContain(epic);
    const overview: Result = await cli(f, ['status']);
    expect(overview.code).toBe(1);
    const diagnostic: { unreadable: string; path: string; error: string } = z
      .object({ unreadable: z.string(), path: z.string(), error: z.string() })
      .parse(JSON.parse(overview.stdout.split('\n')[0]));
    expect(diagnostic.path).toBe(epic);
  } finally {
    f.clean();
  }
});

for (const [name, content] of Object.entries(malformedIndexes)) {
  test(`malformed index (${name}) reports unreadable in overview and fails detail naming the file`, async () => {
    const f: Fixture = await fixture();
    try {
      leaf(f, 'indexed', 'implement');
      const index: string = resolve(f.root, 'issues/open/issue/ISSUE.md');
      writeFileSync(index, content);
      const overview: Result = await cli(f, ['status']);
      expect(overview.code).toBe(1);
      const diagnostic: { unreadable: string; path: string; error: string } = z
        .object({ unreadable: z.string(), path: z.string(), error: z.string() })
        .parse(JSON.parse(overview.stdout.split('\n')[0]));
      expect(diagnostic.unreadable).toBe('repo');
      expect(diagnostic.path).toBe(index);
      expect(diagnostic.error).toContain(index);
      const detail: Result = await cli(f, ['status', 'indexed']);
      expect(detail.code).not.toBe(0);
      expect(detail.stderr).toContain(index);
    } finally {
      f.clean();
    }
  });
}
