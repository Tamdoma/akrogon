import { test, expect } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fixture, cli, leaf, type Fixture } from './helpers';
import { writeYaml, type Result } from '../src/shell';

// A leaf folder whose state.yaml carries the direct-leaf shape: written through leaf() first,
// then rewritten with direct: true, a full-ISO creation time, empty frozen records and the
// door/reviewer seat refs the create verb records. At base the strictObject schema rejects
// the direct key, so every read of this state fails — the honest red at planning.
function directLeaf(f: Fixture, slug: string, phase: string, created: string, extra: object = {}): string {
  const path: string = leaf(f, slug, phase, { created, frozen: {}, frozen_cited: [], ...extra });
  const file: string = resolve(path, 'state.yaml');
  const written: object = Bun.YAML.parse(readFileSync(file, 'utf8')) as object;
  writeYaml(file, {
    ...written,
    direct: true,
    created,
    seat: {
      A: { session: 'dt-session', address: 'w1:a-door' },
      B: { session: 'dt-session', address: 'w1:b-reviewer' },
    },
  });
  return path;
}

const columns: string[] = ['LEAF', 'PHASE', 'TIME', 'BLOCKED BY', 'NOTE', 'TURN'];

// Column slicing copied from tests/status.test.ts: cells are cut by the header positions.
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

const leafJsonSchema = z.looseObject({
  slug: z.string(),
  phase: z.string(),
  first_prompt: z.number().nullable(),
  waits_on: z.array(z.string()),
});

const envelopeSchema = z.looseObject({
  repos: z.array(z.looseObject({ name: z.string(), leaves: z.array(leafJsonSchema) })),
  merges: z.array(z.looseObject({ repo: z.string(), slug: z.string(), total_ms: z.number().nullable() })),
});

async function statusJson(f: Fixture): Promise<z.infer<typeof envelopeSchema>> {
  const result: Result = await cli(f, ['status', '--json']);
  expect(result.code).toBe(0);
  return envelopeSchema.parse(JSON.parse(result.stdout));
}

function leafOf(env: z.infer<typeof envelopeSchema>, f: Fixture, slug: string): z.infer<typeof leafJsonSchema> {
  const repo = env.repos.find((item) => item.name === f.repo)!;
  return repo.leaves.find((item) => item.slug === slug)!;
}

const ZERO: string = '2026-10-11T00:00:00.000Z';

type Row = Record<string, unknown>;

function at(minutes: number, seconds = 0, from: string = ZERO): string {
  return new Date(Date.parse(from) + minutes * 60000 + seconds * 1000).toISOString();
}

// Row builders copied from tests/timing-report.test.ts.
function move(f: Fixture, over: Row): Row {
  return {
    ts: ZERO,
    repo: f.repo,
    slug: 'x',
    from: 'plan.synthesis',
    to: 'implement',
    slot: 'A',
    attempts: { A: 0, B: 0 },
    fix_rounds: 0,
    verdict: {},
    head: 'h',
    diff: '',
    session: null,
    ...over,
  };
}

function event(f: Fixture, over: Row): Row {
  return { ts: ZERO, repo: f.repo, slug: 'x', ...over };
}

function visitStart(f: Fixture, slug: string, phase: string, visit: number, ts: string): Row {
  return event(f, { slug, kind: 'visit_start', phase, visit, ts });
}

function records(f: Fixture, file: 'log' | 'timings', rows: Row[]): void {
  writeFileSync(resolve(f.root, 'issues', `${file}.jsonl`), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}

// The log and visit rows of one leaf moving failed -> implement -> check.review -> merge -> merged,
// shaped exactly like the visitGaps precedent in tests/timing-report.test.ts: visit rows exist,
// prompt and seat_done rows do not, so a lifecycle leaf shows both gap kinds.
function journey(f: Fixture, slug: string): { log: Row[]; timings: Row[] } {
  return {
    log: [
      move(f, { slug, from: 'failed', to: 'implement', ts: at(0) }),
      move(f, { slug, from: 'implement', to: 'check.review', ts: at(10) }),
      move(f, { slug, from: 'check.review', to: 'merge', ts: at(20) }),
      move(f, { slug, from: 'merge', to: 'merged', ts: at(30), slot: null }),
    ],
    timings: [
      visitStart(f, slug, 'implement', 0, at(0)),
      visitStart(f, slug, 'check.review', 0, at(10)),
      visitStart(f, slug, 'merge', 0, at(20)),
      visitStart(f, slug, 'merged', 0, at(30)),
    ],
  };
}

test('a direct leaf shows TIME from its creation and first_prompt in json, with waits_on for its phase', async () => {
  const f: Fixture = await fixture();
  try {
    const created: string = new Date(Date.now() - 42 * 60000).toISOString();
    directLeaf(f, 'dt-time', 'implement', created);
    directLeaf(f, 'dt-review', 'check.review', created);
    leaf(f, 'ctl-time', 'implement');
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    const time: string = cell(result.stdout, leafRow(result.stdout, 'dt-time'), 'TIME');
    const parsed: RegExpMatchArray | null = /^(\d+)h (\d+)m$/.exec(time);
    expect(parsed, `TIME cell "${time}"`).not.toBeNull();
    const minutes: number = Number(parsed![1]) * 60 + Number(parsed![2]);
    expect(minutes).toBeGreaterThanOrEqual(41);
    expect(minutes).toBeLessThanOrEqual(43);
    // A lifecycle leaf with no delivered prompt rows keeps the blank TIME cell.
    expect(cell(result.stdout, leafRow(result.stdout, 'ctl-time'), 'TIME')).toBe('-');
    const env: z.infer<typeof envelopeSchema> = await statusJson(f);
    expect(leafOf(env, f, 'dt-time').first_prompt).toBe(Date.parse(created));
    expect(leafOf(env, f, 'dt-time').waits_on).toEqual(['A']);
    // check.review round 0 on a direct leaf waits on the reviewer alone.
    expect(leafOf(env, f, 'dt-review').waits_on).toEqual(['B']);
  } finally {
    f.clean();
  }
});

test('a merged direct leaf totals its merge time from creation, not null', async () => {
  const f: Fixture = await fixture();
  try {
    const now: number = Date.now();
    const created: string = new Date(now - 50 * 60000).toISOString();
    const close: string = new Date(now - 8 * 60000).toISOString();
    directLeaf(f, 'dt-merged', 'merged', created);
    records(f, 'log', [
      move(f, { slug: 'dt-merged', from: 'merge', to: 'merged', ts: close, slot: null }),
    ]);
    const env: z.infer<typeof envelopeSchema> = await statusJson(f);
    const row = env.merges.find((item) => item.repo === f.repo && item.slug === 'dt-merged');
    expect(row).toBeDefined();
    expect(row!.total_ms).not.toBeNull();
    expect(row!.total_ms).toBe(Date.parse(close) - Date.parse(created));
  } finally {
    f.clean();
  }
});

test('a direct leaf shows no prompt or seat_done gaps, its run pair counts, and an unpaired check start is still flagged', async () => {
  const f: Fixture = await fixture();
  try {
    const dt: { log: Row[]; timings: Row[] } = journey(f, 'dt');
    const ctl: { log: Row[]; timings: Row[] } = journey(f, 'ctl');
    // One complete run pair inside the direct leaf's implement visit.
    dt.timings.push(
      event(f, { slug: 'dt', kind: 'check_start', run: 'r1', name: 'unit', scope: 'leaf', phase: 'implement', ts: at(2) }),
      event(f, {
        slug: 'dt',
        kind: 'check_end',
        run: 'r1',
        name: 'unit',
        scope: 'leaf',
        phase: 'implement',
        exit: 0,
        duration_ms: 300000,
        log: 'x',
        ts: at(7),
      }),
    );
    records(f, 'log', [...dt.log, ...ctl.log]);
    records(f, 'timings', [...dt.timings, ...ctl.timings]);
    directLeaf(f, 'dt', 'merged', ZERO);
    leaf(f, 'ctl', 'merged');
    const direct: Result = await cli(f, ['timing', 'dt']);
    expect(direct.code).toBe(0);
    // The run pair is counted in the report's lines.
    expect(direct.stdout).toContain('    check leaf:unit 5m');
    // No prompt-kind and no seat_done-kind gap is reported for the direct leaf.
    expect(direct.stdout).not.toContain('incomplete prompt');
    expect(direct.stdout).not.toContain('incomplete seat_done');
    expect(direct.stdout).not.toMatch(/incomplete prompt:[AB]/);
    // The lifecycle control with the identical shape produces both gap kinds.
    const control: Result = await cli(f, ['timing', 'ctl']);
    expect(control.code).toBe(0);
    expect(control.stdout).toContain('incomplete prompt');
    expect(control.stdout).toContain('incomplete seat_done');
    // Pairing detection stays intact: an unmatched run start yields exactly one check_end-kind gap.
    writeFileSync(
      resolve(f.root, 'issues/timings.jsonl'),
      readFileSync(resolve(f.root, 'issues/timings.jsonl'), 'utf8') +
        JSON.stringify(
          event(f, { slug: 'dt', kind: 'check_start', run: 'r2', name: 'lint', scope: 'leaf', phase: 'implement', ts: at(4) }),
        ) +
        '\n',
    );
    const flagged: Result = await cli(f, ['timing', 'dt']);
    expect(flagged.code).toBe(0);
    const incomplete: string[] = flagged.stdout.split('\n').filter((line) => line.startsWith('  incomplete '));
    expect(incomplete).toEqual(['  incomplete check_end lint']);
  } finally {
    f.clean();
  }
});
