import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, yaml, fakeGh, type Fixture, type GhFixture } from './helpers';
import { command } from '../src/shell';
import type { GhStep } from './fake-gh';

const ZERO: string = '2026-10-11T00:00:00.000Z';
const SINCE: string = '2026-10-01T00:00:00.000Z';

type Row = Record<string, unknown>;

function at(minutes: number, seconds = 0, from: string = ZERO): string {
  return new Date(Date.parse(from) + minutes * 60000 + seconds * 1000).toISOString();
}

function move(over: Row): Row {
  return {
    ts: ZERO,
    repo: 'repo',
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

function event(over: Row): Row {
  return { ts: ZERO, repo: 'repo', slug: 'x', ...over };
}

function visitStart(slug: string, phase: string, visit: number, ts: string): Row {
  return event({ slug, kind: 'visit_start', phase, visit, ts });
}

function prompt(slug: string, slot: string, phase: string, visit: number, ts: string): Row {
  return event({ slug, kind: 'prompt', slot, phase, visit, session: null, outcome: 'delivered', ts });
}

function records(f: Fixture, file: 'log' | 'timings' | 'merge-attempts', rows: Row[]): void {
  writeFileSync(resolve(f.root, 'issues', `${file}.jsonl`), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}

async function timing(
  f: Fixture,
  args: string[],
  env: NodeJS.ProcessEnv = {},
): Promise<{ code: number; stdout: string; stderr: string }> {
  return cli(f, ['timing', ...args], f.root, env);
}

test('slug report: each closed visit decomposes into priority waits, prompted time and unattributed waiting', async () => {
  const f: Fixture = await fixture();
  try {
    records(f, 'log', [
      move({ slug: 't1', from: 'failed', to: 'plan.synthesis', ts: at(0) }),
      move({ slug: 't1', from: 'plan.synthesis', to: 'implement', ts: at(40) }),
      move({ slug: 't1', from: 'implement', to: 'check.review', ts: at(50) }),
      move({ slug: 't1', from: 'check.review', to: 'merge', ts: at(52) }),
      move({ slug: 't1', from: 'merge', to: 'merged', ts: at(60) }),
    ]);
    records(f, 'timings', [
      visitStart('t1', 'plan.synthesis', 0, at(0)),
      prompt('t1', 'A', 'plan.synthesis', 0, at(10)),
      event({ slug: 't1', kind: 'wait', reason: 'parked', ts: at(21) }),
      { ts: at(22), repo: 'repo', kind: 'repo_pause', pause: 'on' },
      { ts: at(25), repo: 'repo', kind: 'repo_pause', pause: 'off' },
      event({ slug: 't1', kind: 'wait', reason: 'none', ts: at(26) }),
      visitStart('t1', 'implement', 0, at(40)),
      prompt('t1', 'A', 'implement', 0, at(41)),
      event({
        slug: 't1',
        kind: 'check_start',
        run: 'r1',
        name: 'unit',
        scope: 'leaf',
        phase: 'implement',
        ts: at(42),
      }),
      event({
        slug: 't1',
        kind: 'check_end',
        run: 'r1',
        name: 'unit',
        scope: 'leaf',
        phase: 'implement',
        exit: 0,
        duration_ms: 300000,
        log: 'x',
        ts: at(47),
      }),
      visitStart('t1', 'check.review', 0, at(50)),
      prompt('t1', 'A', 'check.review', 0, at(50, 30)),
      prompt('t1', 'B', 'check.review', 0, at(51)),
      event({ slug: 't1', kind: 'seat_done', slot: 'A', phase: 'check.review', visit: 0, ts: at(51, 30) }),
      visitStart('t1', 'merge', 0, at(52)),
      prompt('t1', 'B', 'merge', 0, at(53)),
      visitStart('t1', 'merged', 0, at(60)),
    ]);
    const result = await timing(f, ['t1']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(
      [
        'plan.synthesis #0 40m',
        '  wait repo_pause 3m',
        '  wait parked 2m',
        '  prompted 25m',
        '  wait none 10m',
        'implement #0 10m',
        '  prompted 9m',
        '    check leaf:unit 5m',
        '  wait none 1m',
        'check.review #0 2m',
        '  prompted 1m30s',
        '  wait none 30s',
        'merge #0 8m',
        '  prompted 7m',
        '  wait none 1m',
        'merged #0 open',
      ].join('\n'),
    );
  } finally {
    f.clean();
  }
});

test('slug report: missing expected events are named per visit while exempt visits stay clean', async () => {
  const f: Fixture = await fixture();
  try {
    records(f, 'log', [
      move({ slug: 't2', from: 'failed', to: 'plan.synthesis', ts: at(0) }),
      move({ slug: 't2', from: 'plan.synthesis', to: 'implement', ts: at(10) }),
      move({ slug: 't2', from: 'implement', to: 'check.review', ts: at(20) }),
      move({ slug: 't2', from: 'check.review', to: 'check.fix', ts: at(30) }),
      move({ slug: 't2', from: 'check.fix', to: 'check.review', ts: at(40), fix_rounds: 1 }),
      move({ slug: 't2', from: 'check.review', to: 'merge', ts: at(50), fix_rounds: 1 }),
      move({ slug: 't2', from: 'merge', to: 'failed', ts: at(60), fix_rounds: 1 }),
      move({ slug: 't2', from: 'failed', to: 'implement', ts: at(70), fix_rounds: 1 }),
    ]);
    records(f, 'timings', [
      visitStart('t2', 'plan.synthesis', 0, at(0)),
      prompt('t2', 'A', 'plan.synthesis', 0, at(5)),
      visitStart('t2', 'implement', 0, at(10)),
      visitStart('t2', 'check.review', 0, at(20)),
      prompt('t2', 'A', 'check.review', 0, at(21)),
      prompt('t2', 'B', 'check.review', 0, at(22)),
      visitStart('t2', 'check.fix', 0, at(30)),
      prompt('t2', 'A', 'check.fix', 0, at(31)),
      event({
        slug: 't2',
        kind: 'check_start',
        run: 'r5',
        name: 'fixunit',
        scope: 'leaf',
        phase: 'check.fix',
        ts: at(32),
      }),
      visitStart('t2', 'check.review', 1, at(40)),
      prompt('t2', 'B', 'check.review', 1, at(41)),
      visitStart('t2', 'merge', 0, at(50)),
      event({ slug: 't2', kind: 'check_start', run: 'r9', name: 'lint', scope: 'leaf', phase: 'merge', ts: at(55) }),
      visitStart('t2', 'implement', 1, at(70)),
      event({
        slug: 't2',
        kind: 'check_start',
        run: 'r10',
        name: 'run',
        scope: 'leaf',
        phase: 'implement',
        ts: at(71),
      }),
    ]);
    const result = await timing(f, ['t2']);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(
      [
        'plan.synthesis #0 10m',
        '  prompted 5m',
        '  wait none 5m',
        'implement #0 10m',
        '  wait none 10m',
        '  incomplete prompt',
        'check.review #0 10m',
        '  prompted 9m',
        '  wait none 1m',
        '  incomplete seat_done',
        'check.fix #0 10m',
        '  prompted 9m',
        '  wait none 1m',
        '  incomplete check_end fixunit',
        'check.review #1 10m',
        '  prompted 9m',
        '  wait none 1m',
        'merge #0 10m',
        '  wait none 10m',
        'implement #1 open',
      ].join('\n'),
    );
  } finally {
    f.clean();
  }
});

type MemberSpec = {
  failed?: string;
  failedFrom?: string;
  stalled?: boolean;
  diff?: string;
  waitRows?: Row[];
  extraLog?: Row[];
  extraTimings?: Row[];
};

function member(slug: string, planTs: string, fMin: number, spec: MemberSpec = {}): { log: Row[]; timings: Row[] } {
  const implPrompt: string = new Date(Date.parse(planTs) + 10 * 60000).toISOString();
  const implEnd: string = new Date(Date.parse(planTs) + 20 * 60000).toISOString();
  const merged: string = new Date(Date.parse(planTs) + (fMin + 10) * 60000).toISOString();
  const log: Row[] = [move({ slug, from: 'failed', to: 'plan.synthesis', ts: planTs })];
  const timings: Row[] = [
    visitStart(slug, 'plan.synthesis', 0, planTs),
    prompt(slug, 'A', 'plan.synthesis', 0, planTs),
  ];
  if (spec.failedFrom !== 'plan.synthesis') {
    log.push(move({ slug, from: 'plan.synthesis', to: 'implement', ts: implPrompt }));
    timings.push(visitStart(slug, 'implement', 0, implPrompt), prompt(slug, 'A', 'implement', 0, implPrompt));
    log.push(move({ slug, from: 'implement', to: 'check.review', ts: implEnd, diff: spec.diff ?? '' }));
  }
  if (spec.extraLog !== undefined) log.push(...spec.extraLog);
  if (spec.failed !== undefined)
    log.push(move({ slug, from: spec.failedFrom ?? 'implement', to: 'failed', ts: spec.failed }));
  if (spec.failed === undefined && spec.stalled !== true)
    log.push(move({ slug, from: 'merge', to: 'merged', ts: merged }));
  if (spec.waitRows !== undefined) timings.push(...spec.waitRows);
  if (spec.extraTimings !== undefined) timings.push(...spec.extraTimings);
  return { log, timings };
}

function cohortFixture(f: Fixture, log: Row[], timings: Row[], attempts: Row[] = []): void {
  records(f, 'log', log);
  records(f, 'timings', timings);
  records(f, 'merge-attempts', attempts);
}

test('cohort gate: pass applies membership, 600-line exit, stall and failure accounting in prompt order', async () => {
  const f: Fixture = await fixture();
  try {
    const log: Row[] = [];
    const timings: Row[] = [];
    const old = member('l_old', at(0, 0, '2026-09-01T00:00:00.000Z'), 30);
    log.push(...old.log);
    timings.push(...old.timings);
    const slugs: string[] = Array.from({ length: 21 }, (_, index) => `l${String(index + 1).padStart(2, '0')}`);
    for (const [index, slug] of slugs.entries()) {
      const planTs: string = at(index + 1);
      if (index === 4) {
        const big = member('lbig', at(4, 30), 30, { diff: ' 1 file changed, 700 insertions(+)' });
        log.push(...big.log);
        timings.push(...big.timings);
      }
      const spec: MemberSpec = {};
      if (slug === 'l19') {
        spec.failed = at(40);
        spec.failedFrom = 'plan.synthesis';
      }
      if (slug === 'l20') spec.stalled = true;
      if (slug === 'l02')
        spec.waitRows = [
          event({ slug, kind: 'wait', reason: 'parked', ts: at(index + 3) }),
          event({ slug, kind: 'wait', reason: 'prerequisite', blocking: 'l01', ts: at(index + 8) }),
          event({ slug, kind: 'wait', reason: 'none', ts: at(index + 11) }),
        ];
      if (slug === 'l03') {
        spec.extraLog = [move({ slug, from: 'check.review', to: 'merge', ts: at(index + 31) })];
        spec.extraTimings = [
          visitStart(slug, 'check.review', 0, at(index + 23)),
          prompt(slug, 'A', 'check.review', 0, at(index + 24)),
          prompt(slug, 'B', 'check.review', 0, at(index + 25)),
        ];
      }
      const part = member(slug, planTs, 30, spec);
      log.push(...part.log);
      timings.push(...part.timings);
    }
    cohortFixture(f, log, timings);
    const result = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    const lines: string[] = result.stdout.split('\n');
    expect(lines[0]).toBe('pass');
    const members: string[] = lines.slice(1);
    expect(members).toHaveLength(20);
    expect(members.join('\n')).not.toContain('lbig');
    expect(members.join('\n')).not.toContain('l21');
    expect(members.join('\n')).not.toContain('l_old');
    expect(members[0]).toBe('l01 F 30m');
    expect(members[1]).toBe('l02 F 30m wait parked 5m prerequisite 3m');
    expect(members[2]).toBe('l03 F 30m gaps: check.review#0 seat_done');
    expect(members.find((line) => line.startsWith('l19'))).toBe('l19 over 45 (failed)');
    expect(members.find((line) => line.startsWith('l20'))).toBe('l20 over 45 (stalled)');
  } finally {
    f.clean();
  }
});

test('cohort gate: fail when fewer than 18 members merge', async () => {
  const f: Fixture = await fixture();
  try {
    const log: Row[] = [];
    const timings: Row[] = [];
    for (let index = 0; index < 20; index++) {
      const slug: string = `f${String(index + 1).padStart(2, '0')}`;
      const spec: MemberSpec = index >= 17 ? { failed: at(90, 0), failedFrom: 'implement' } : {};
      const part = member(slug, at(index + 1), 20, spec);
      log.push(...part.log);
      timings.push(...part.timings);
    }
    cohortFixture(f, log, timings);
    const result = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    expect(result.stdout.split('\n')[0]).toBe('fail');
  } finally {
    f.clean();
  }
});

test('cohort gate: insufficient while a member is unmerged and younger than 24 hours', async () => {
  const f: Fixture = await fixture();
  try {
    const log: Row[] = [];
    const timings: Row[] = [];
    for (let index = 0; index < 19; index++) {
      const slug: string = `s${String(index + 1).padStart(2, '0')}`;
      const part = member(slug, at(index + 1), 20);
      log.push(...part.log);
      timings.push(...part.timings);
    }
    const recent: string = new Date(Date.now() - 60 * 60000).toISOString();
    const part = member('s20', recent, 20, { stalled: true });
    log.push(...part.log);
    timings.push(...part.timings);
    cohortFixture(f, log, timings);
    const result = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    expect(result.stdout.split('\n')[0]).toBe('insufficient');
    expect(result.stdout).toContain('s20');
  } finally {
    f.clean();
  }
});

test('cohort gate: fails when the two central F values average above 35 minutes', async () => {
  const f: Fixture = await fixture();
  try {
    const log: Row[] = [];
    const timings: Row[] = [];
    for (let index = 0; index < 20; index++) {
      const fMin: number = index < 10 ? 30 : index < 15 ? 42 : 60;
      const part: { log: Row[]; timings: Row[] } = member(`median${index}`, at(index + 1), fMin);
      log.push(...part.log);
      timings.push(...part.timings);
    }
    cohortFixture(f, log, timings);
    const result: { code: number; stdout: string; stderr: string } = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    expect(result.stdout.split('\n')[0]).toBe('fail');
  } finally {
    f.clean();
  }
});

test('cohort gate: remains insufficient with 17 merged and three stalled members', async () => {
  const f: Fixture = await fixture();
  try {
    const log: Row[] = [];
    const timings: Row[] = [];
    for (let index = 0; index < 20; index++) {
      const part: { log: Row[]; timings: Row[] } = member(`stalled${index}`, at(index + 1), 20, {
        stalled: index >= 17,
      });
      log.push(...part.log);
      timings.push(...part.timings);
    }
    cohortFixture(f, log, timings);
    const result: { code: number; stdout: string; stderr: string } = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    expect(result.stdout.split('\n')[0]).toBe('insufficient');
  } finally {
    f.clean();
  }
});

function listingArgs(repo: string): string[] {
  return ['api', '--hostname', 'github.com', `repos/${repo}/issues?state=all&per_page=100`, '--paginate', '--slurp'];
}

type GIssue = { number: number; created_at: string; state: 'open' | 'closed'; pull_request?: object };

function gissue(number: number, created_at: string, state: 'open' | 'closed', pr: boolean = false): GIssue {
  return { number, created_at, state, ...(pr ? { pull_request: {} } : {}) };
}

function carrier(
  f: Fixture,
  area: 'open' | 'closed' | 'parked',
  issueFolder: string,
  slug: string,
  created: string,
  sources: string[],
): void {
  const dir: string = resolve(f.root, 'issues', area, issueFolder, slug);
  mkdirSync(dir, { recursive: true });
  yaml(resolve(dir, 'state.yaml'), {
    slug,
    phase: 'implement',
    created,
    repo: 'repo',
    debate: 'no',
    'blocked-by': [],
    sources,
  });
}

function ghScript(gh: GhFixture, steps: GhStep[]): void {
  writeFileSync(gh.db, JSON.stringify(steps));
}

function ghCalls(gh: GhFixture): { args: string[]; cwd: string }[] {
  const content: string = readFileSync(gh.db + '.calls', 'utf8').trim();
  return content === '' ? [] : content.split('\n').map((line) => JSON.parse(line));
}

test('flow report: carried issues print one sorted line each with day spans and the medians split on handoff', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'set-url', 'origin', 'https://github.com/acme/project.git'], f.root);
    carrier(f, 'closed', 'first-issue', 'a1', '2026-10-03', ['acme/project#1']);
    carrier(f, 'closed', 'first-issue', 'a2', '2026-10-05', ['acme/project#1']);
    carrier(f, 'closed', 'second-issue', 'a3', '2026-10-10', ['acme/project#2']);
    carrier(f, 'closed', 'gone', 'a5', '2026-10-12', ['other/repo#99']);
    records(f, 'log', [
      move({ slug: 'a1', from: 'implement', to: 'merge', ts: '2026-10-08T06:00:00.000Z' }),
      move({ slug: 'a1', from: 'merge', to: 'merged', ts: '2026-10-08T12:00:00.000Z' }),
      move({ slug: 'a2', from: 'merge', to: 'merged', ts: '2026-10-06T10:00:00.000Z' }),
      move({ slug: 'a3', from: 'merge', to: 'merged', ts: '2026-10-11T00:00:00.000Z' }),
      move({ slug: 'a5', from: 'merge', to: 'merged', ts: '2026-10-13T00:00:00.000Z' }),
    ]);
    ghScript(gh, [
      {
        stdout: JSON.stringify([
          [
            gissue(1, '2026-10-01T12:00:00Z', 'closed'),
            gissue(2, '2026-10-04T00:00:00Z', 'closed'),
            gissue(9, '2026-10-09T00:00:00Z', 'closed', true),
          ],
        ]),
        args: listingArgs('acme/project'),
      },
      { stdout: '[[]]', args: listingArgs('other/repo') },
    ]);
    const result: { code: number; stdout: string; stderr: string } = await timing(
      f,
      ['--flow', '--since', '2026-10-10'],
      gh.env,
    );
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(
      [
        'acme/project#1 filed 2026-10-01T12:00:00Z handoff 2026-10-03 merged 2026-10-08T12:00:00Z wait 2d total 7.0d leaves 2',
        'acme/project#2 filed 2026-10-04T00:00:00Z handoff 2026-10-10 merged 2026-10-11T00:00:00Z wait 6d total 7.0d leaves 1',
        'other/repo#99 not in listing',
        'summary before: 1 merged 1 wait 2.0d total 7.0d',
        'summary since: 2 merged 2 wait 6.0d total 7.0d',
        'summary backlog: 0 median - oldest -',
        'summary uncarried closed: 0',
      ].join('\n'),
    );
    expect(ghCalls(gh).map((call) => call.args)).toEqual([
      listingArgs('acme/project'),
      listingArgs('other/repo'),
    ]);
  } finally {
    f.clean();
  }
});

test('flow report: parked-carried and open-carried issues stay carried while open uncarried issues print', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'set-url', 'origin', 'https://github.com/acme/project.git'], f.root);
    carrier(f, 'parked', 'held', 'p1', '2026-10-06', ['acme/project#4']);
    carrier(f, 'open', 'moving', 'o1', '2026-10-12', ['acme/project#7']);
    ghScript(gh, [
      {
        stdout: JSON.stringify([
          [
            gissue(4, '2026-10-02T00:00:00Z', 'open'),
            gissue(5, '2026-10-11T00:00:00Z', 'open'),
            gissue(6, '2026-10-13T00:00:00Z', 'open'),
            gissue(7, '2026-10-07T00:00:00Z', 'open'),
            gissue(8, '2026-10-05T00:00:00Z', 'closed'),
          ],
        ]),
        args: listingArgs('acme/project'),
      },
    ]);
    const result: { code: number; stdout: string; stderr: string } = await timing(
      f,
      ['--flow', '--since', '2026-10-10'],
      gh.env,
    );
    expect(result.code).toBe(0);
    const lines: string[] = result.stdout.split('\n');
    expect(lines).toHaveLength(8);
    expect(lines[0]).toMatch(
      /^acme\/project#4 filed 2026-10-02T00:00:00Z handoff 2026-10-06 merged open wait 4d total \d+\.\dd leaves 1$/,
    );
    expect(lines[1]).toMatch(
      /^acme\/project#7 filed 2026-10-07T00:00:00Z handoff 2026-10-12 merged open wait 5d total \d+\.\dd leaves 1$/,
    );
    expect(lines[2]).toMatch(/^acme\/project#5 filed 2026-10-11T00:00:00Z uncarried \d+\.\dd$/);
    expect(lines[3]).toMatch(/^acme\/project#6 filed 2026-10-13T00:00:00Z uncarried \d+\.\dd$/);
    expect(result.stdout).not.toContain('acme/project#4 filed 2026-10-02T00:00:00Z uncarried');
    expect(lines[4]).toBe('summary before: 1 merged 0 wait - total -');
    expect(lines[5]).toBe('summary since: 1 merged 0 wait - total -');
    const backlog: RegExpMatchArray | null = /^summary backlog: 2 median (\d+\.\d)d oldest (\d+)d$/.exec(lines[6]);
    expect(backlog).not.toBeNull();
    const oldest: number = Number(backlog![2]);
    expect(oldest).toBeGreaterThanOrEqual(3);
    expect(oldest).toBeLessThanOrEqual(5);
    expect(Number(backlog![1])).toBeGreaterThanOrEqual(1);
    expect(Number(backlog![1])).toBeLessThanOrEqual(oldest);
    expect(lines[7]).toBe('summary uncarried closed: 1');
  } finally {
    f.clean();
  }
});

test('flow report: a failed listing retries once then exits non-zero with command and output', async () => {
  const f: Fixture = await fixture();
  try {
    const gh: GhFixture = fakeGh(f);
    await command(['git', 'remote', 'set-url', 'origin', 'https://github.com/acme/project.git'], f.root);
    ghScript(gh, [
      { stdout: '', code: 1, stderr: 'boom one' },
      { stdout: '', code: 1, stderr: 'boom two' },
    ]);
    const result: { code: number; stdout: string; stderr: string } = await timing(
      f,
      ['--flow', '--since', '2026-10-10'],
      gh.env,
    );
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('boom one');
    expect(result.stderr).toContain('boom two');
    expect(result.stderr).toContain('repos/acme/project/issues?state=all&per_page=100');
    expect(ghCalls(gh)).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('flow report: usage errors name the three timing forms', async () => {
  const f: Fixture = await fixture();
  try {
    for (const args of [
      ['--flow'],
      ['--flow', '--since', '2026-10-10', 'extra'],
      ['--flow', '--cohort', '--since', '2026-10-10'],
      ['--since', '2026-10-10'],
    ]) {
      const result: { code: number; stdout: string; stderr: string } = await timing(f, args);
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('--cohort --since');
      expect(result.stderr).toContain('--flow --since');
    }
    expect((await timing(f, ['--flow', '--since', 'not-a-date'])).code).not.toBe(0);
    expect((await timing(f, ['--cohort', '--since', '2026-10-10'])).code).not.toBe(0);
  } finally {
    f.clean();
  }
});

test('cohort member: parked waiting continues after the last phase move', async () => {
  const f: Fixture = await fixture();
  try {
    const joined: string = new Date(Date.now() - 48 * 60 * 60000).toISOString();
    const part: { log: Row[]; timings: Row[] } = member('parked', joined, 20, {
      stalled: true,
      waitRows: [event({ slug: 'parked', kind: 'wait', reason: 'parked', ts: at(25, 0, joined) })],
    });
    cohortFixture(f, part.log, part.timings);
    const result: { code: number; stdout: string; stderr: string } = await timing(f, ['--cohort', '--since', SINCE]);
    expect(result.code).toBe(0);
    const hours: RegExpMatchArray | null = /wait parked (\d+)h/.exec(result.stdout);
    expect(hours).not.toBeNull();
    expect(Number(hours![1])).toBeGreaterThanOrEqual(47);
  } finally {
    f.clean();
  }
});
