import { expect, test } from 'bun:test';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnCaptured, type SpawnResult } from '../src/shell';
import { registerTemp } from './helpers';

const script: string = resolve(import.meta.dir, '../skills/chart-issues/scripts/chart-usage.ts');
const fixtures: string = resolve(import.meta.dir, 'fixtures/chart-usage');
const opened: string = '2026-10-06T16:34:47.701Z';
const until: string = '2026-10-06T20:16:00Z';

type RunResult = { code: number; stdout: string; stderr: string };

type Seat = { seat: string; harness: string; session: string };
type SpanEntry = { from: string; to?: string };

type World = {
  chart: string;
  parent: string;
  chartDir: (name: string) => string;
  putSeats: (chart: string, seats: Seat[], openedAt?: string, spans?: SpanEntry[]) => void;
  putTranscript: (harness: string, session: string, file: string, extraDir?: string) => void;
  run: (...args: string[]) => Promise<RunResult>;
  clean: () => void;
};

function setup(): World {
  const dir: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'chart-usage-')));
  const parent: string = resolve(dir, 'charts');
  const chart: string = resolve(parent, 'c1');
  const claudeHome: string = resolve(dir, 'claude-home');
  const codexHome: string = resolve(dir, 'codex-home');
  mkdirSync(chart, { recursive: true });
  mkdirSync(resolve(claudeHome, 'projects'), { recursive: true });
  mkdirSync(resolve(codexHome, 'sessions'), { recursive: true });
  return {
    chart,
    parent,
    chartDir: (name: string): string => {
      const d: string = resolve(parent, name);
      mkdirSync(d, { recursive: true });
      return d;
    },
    putSeats: (c: string, seats: Seat[], openedAt: string = opened, spans?: SpanEntry[]): void => {
      const lines: string[] = [`opened: '${openedAt}'`];
      if (seats.length === 0) lines.push('seats: []');
      else lines.push('seats:');
      for (const s of seats)
        lines.push(
          `  - seat: ${s.seat}`,
          `    pane: w8:p${s.seat}`,
          `    harness: ${s.harness}`,
          `    session: ${s.session}`,
        );
      if (spans !== undefined) {
        lines.push('spans:');
        for (const sp of spans) {
          lines.push(`  - from: '${sp.from}'`);
          if (sp.to !== undefined) lines.push(`    to: '${sp.to}'`);
        }
      }
      writeFileSync(resolve(c, 'seats.yaml'), lines.join('\n') + '\n');
    },
    putTranscript: (harness: string, session: string, file: string, extraDir?: string): void => {
      if (harness === 'claude') {
        const proj: string = resolve(claudeHome, 'projects', extraDir ?? `proj-${session}`);
        mkdirSync(proj, { recursive: true });
        copyFileSync(resolve(fixtures, file), resolve(proj, `${session}.jsonl`));
      } else {
        const sess: string = resolve(codexHome, 'sessions', '2026', '10', '06');
        mkdirSync(sess, { recursive: true });
        copyFileSync(resolve(fixtures, file), resolve(sess, `rollout-2026-10-06T00-00-00-${session}.jsonl`));
      }
    },
    run: async (...args: string[]): Promise<RunResult> => {
      const { stdout, stderr, code }: SpawnResult = await spawnCaptured([process.execPath, script, ...args], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: claudeHome, CODEX_HOME: codexHome },
      });
      return { code, stdout, stderr };
    },
    clean: (): void => rmSync(dir, { recursive: true, force: true }),
  };
}

test('writes USAGE.md, counts transcripts exactly, prints summary and outcome done', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [
      { seat: 'A', harness: 'claude', session: 'claude-A' },
      { seat: 'B', harness: 'codex', session: 'codex-B' },
    ]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    w.putTranscript('codex', 'codex-B', 'codex/rollout-B.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    expect(r.stderr).toBe('');
    const lines: string[] = r.stdout.trimEnd().split('\n');
    expect(lines).toHaveLength(2);
    const summary: string = lines[0];
    expect(summary).toContain('operator wait 99.4 min');
    expect(summary).toContain('operator turns 20');
    expect(summary).toMatch(/A=\d+/);
    expect(summary).toMatch(/B=\d+/);
    expect(lines[1]).toBe('outcome done');
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md.split('\n')[0]).toBe(summary);
    // seat A: streamed records with one message.id count once (152 messages, not 346 records)
    expect(md).toContain('seat A');
    expect(md).toContain('harness claude');
    expect(md).toContain('claude-fable-5-1');
    expect(md).toContain('effort high');
    expect(md).toContain('turns 19');
    expect(md).toContain('calls 152');
    expect(md).toContain('working minutes 99.4');
    expect(md).toContain('output_tokens 270787');
    expect(md).toContain('input_tokens 326');
    expect(md).toContain('cache_read_input_tokens 19768778');
    expect(md).toContain('cache_creation_input_tokens 638581');
    expect(md).not.toContain('calls 346');
    // seat B: codex counters read as differences, never summed
    expect(md).toContain('seat B');
    expect(md).toContain('harness codex');
    expect(md).toContain('gpt-6.1-sol');
    expect(md).toContain('effort medium');
    expect(md).toContain('turns 19');
    expect(md).toContain('input_tokens 12716484');
    expect(md).toContain('cached_input_tokens 12255616');
    expect(md).toContain('output_tokens 49427');
    expect(md).toContain('reasoning_output_tokens 9681');
    // required rows and labels
    expect(md).toContain('first turn in window');
    expect(md).toContain('operator turns');
    expect(md).toContain('incomplete');
    // no transcript text leaks into stdout or USAGE.md
    expect(r.stdout).not.toContain('USAGE_LEAK_MARKER');
    expect(md).not.toContain('USAGE_LEAK_MARKER');
    // nothing else written into the chart folder
    expect(readdirSync(w.chart).sort()).toEqual(['USAGE.md', 'seats.yaml']);
  } finally {
    w.clean();
  }
});

test('USAGE.md states the required limits', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'A', harness: 'claude', session: 'claude-A' }]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    for (const fragment of [/tokens|token/, /not.*(dollar|cost)/i, /whole-session|whole session/i, /subagent/i]) {
      expect(md).toMatch(fragment);
    }
    // opening reply was split by compaction -> not-whole-map note on the first-turn row
    const firstRow: string = md.split('\n').find((l: string) => l.includes('first turn in window'))!;
    expect(firstRow).toMatch(/whole map/);
  } finally {
    w.clean();
  }
});

test('Codex door associates operator messages with completed turns and excludes injected context', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'A', harness: 'codex', session: 'codex-B' }]);
    w.putTranscript('codex', 'codex-B', 'codex/rollout-B.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T16:49:30Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('operator turns 2');
    expect(md).toContain('operator wait 8.5 min');
    const rows: string[] = md.split('\n').filter((line: string) => line.startsWith('  2026'));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain('2026-10-06T16:35:54.647Z 8.5 min');
    expect(rows[1]).toContain('2026-10-06T16:49:09.345Z incomplete');
    expect(md).not.toContain('USAGE_LEAK_MARKER');
  } finally {
    w.clean();
  }
});

test('operator rows use seat A when the peer is recorded first', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [
      { seat: 'B', harness: 'codex', session: 'codex-B' },
      { seat: 'A', harness: 'claude', session: 'claude-A' },
    ]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    w.putTranscript('codex', 'codex-B', 'codex/rollout-B.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('operator wait 99.4 min');
    expect(md).toContain('operator turns 20');
    expect(md).toContain('A=270787');
    expect(md).toContain('B=49427');
  } finally {
    w.clean();
  }
});

test('second run replaces USAGE.md and prints sibling first lines sorted', async (): Promise<void> => {
  const w: World = setup();
  try {
    const sibA: string = w.chartDir('a-sib');
    writeFileSync(resolve(sibA, 'USAGE.md'), 'sib-a summary line\nrest\n');
    const sibZ: string = w.chartDir('z-sib');
    writeFileSync(resolve(sibZ, 'USAGE.md'), 'sib-z summary line\nrest\n');
    w.chartDir('no-usage');
    writeFileSync(resolve(w.parent, 'stray-file'), 'x');
    w.putSeats(w.chart, []);
    const r1: RunResult = await w.run(w.chart);
    expect(r1.code).toBe(0);
    const lines1: string[] = r1.stdout.trimEnd().split('\n');
    expect(lines1[1]).toBe('sib-a summary line');
    expect(lines1[2]).toBe('sib-z summary line');
    expect(lines1[3]).toBe('outcome partial');
    expect(readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8')).toContain('usage unmeasured');
    writeFileSync(resolve(w.chart, 'USAGE.md'), 'stale content\n');
    const r2: RunResult = await w.run(w.chart);
    expect(r2.code).toBe(0);
    const lines2: string[] = r2.stdout.trimEnd().split('\n');
    expect(lines2[0]).toBe(lines1[0]);
    expect(readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8')).not.toContain('stale');
    expect(readdirSync(w.chart).sort()).toEqual(['USAGE.md', 'seats.yaml']);
  } finally {
    w.clean();
  }
});

test('two sessions of one seat are added and an ended session shows whole-session dollars', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [
      { seat: 'A', harness: 'claude', session: 'claude-A' },
      { seat: 'A', harness: 'claude', session: 'claude-A2' },
    ]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    w.putTranscript('claude', 'claude-A2', 'claude/claude-A2.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('calls 153');
    expect(md).toContain('output_tokens 270977');
    expect(md).toContain('input_tokens 341');
    expect(md).toContain('totalCostUSD 1.2345');
    expect(md).toMatch(/whole[- ]session/i);
    expect(md).toContain('fixture-model-9');
    expect(md).toMatch(/effort.*max/);
    // A2 recorded only one first-turn row (first session only)
    expect(md.split('\n').filter((l: string) => l.includes('first turn in window'))).toHaveLength(1);
    expect(r.stdout.trimEnd().split('\n').at(-1)).toBe('outcome done');
    // records after until are excluded: rerun with an earlier window drops A2
    const r2: RunResult = await w.run(w.chart, '2026-10-06T19:00:00Z');
    const md2: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md2).not.toContain('totalCostUSD');
  } finally {
    w.clean();
  }
});

test('records outside the window are excluded on both sides', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'B', harness: 'codex', session: 'codex-diff' }], '2026-10-06T10:30:00Z');
    w.putTranscript('codex', 'codex-diff', 'codex/codex-diff.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    // diff of last in-window counter minus pre-window baseline, never a sum
    expect(md).toContain('input_tokens 660');
    expect(md).toContain('cached_input_tokens 260');
    expect(md).toContain('output_tokens 130');
    expect(md).toContain('reasoning_output_tokens 30');
    expect(md).toContain('turns 2');
    expect(md).not.toContain('1180');
    // widen the window: the post-until records join
    const r2: RunResult = await w.run(w.chart, '2026-10-06T12:01:00Z');
    const md2: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md2).toContain('output_tokens 240');
  } finally {
    w.clean();
  }
});

test('a codex counter reset marks the seat usage unmeasured and partial', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [
      { seat: 'A', harness: 'claude', session: 'claude-A' },
      { seat: 'C', harness: 'codex', session: 'codex-reset' },
    ]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    w.putTranscript('codex', 'codex-reset', 'codex/codex-reset.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    expect(r.stdout.trimEnd().split('\n').at(-1)).toBe('outcome partial');
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    const row: string = md.split('\n').find((l: string) => l.includes('seat C'))!;
    expect(row).toContain('usage unmeasured');
    expect(row).toMatch(/reset|decreas|counter/i);
    // seat A still measured
    expect(md).toContain('calls 152');
  } finally {
    w.clean();
  }
});

test('a counter reset wholly inside the window is reported instead of losing earlier usage', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'A', harness: 'codex', session: 'codex-reset' }], '2026-10-06T10:00:00Z');
    w.putTranscript('codex', 'codex-reset', 'codex/codex-reset.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    expect(r.stdout.trimEnd().split('\n').at(-1)).toBe('outcome partial');
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('usage unmeasured');
    expect(md).toContain('counter reset');
    expect(md).not.toContain('output_tokens 50');
  } finally {
    w.clean();
  }
});

test('unmeasured seats name the file or field; other seats still measure', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [
      { seat: 'A', harness: 'claude', session: 'claude-A' },
      { seat: 'D', harness: 'claude', session: 'claude-missing' },
      { seat: 'E', harness: 'claude', session: 'claude-ambig' },
      { seat: 'F', harness: 'watson', session: 'watson-1' },
      { seat: 'G', harness: 'claude', session: 'claude-broken' },
    ]);
    w.putTranscript('claude', 'claude-A', 'claude/claude-A.jsonl');
    w.putTranscript('claude', 'claude-ambig', 'claude/claude-A2.jsonl', 'proj-1');
    w.putTranscript('claude', 'claude-ambig', 'claude/claude-A2.jsonl', 'proj-2');
    w.putTranscript('claude', 'claude-broken', 'claude/claude-broken.jsonl');
    const r: RunResult = await w.run(w.chart, until);
    expect(r.code).toBe(0);
    expect(r.stdout.trimEnd().split('\n').at(-1)).toBe('outcome partial');
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    const unmeasured: string[] = md.split('\n').filter((l: string) => l.includes('usage unmeasured'));
    expect(unmeasured).toHaveLength(4);
    expect(unmeasured.find((l: string) => l.includes('seat D'))).toMatch(/claude-missing\.jsonl/);
    expect(unmeasured.find((l: string) => l.includes('seat E'))).toMatch(/claude-ambig\.jsonl/);
    expect(unmeasured.find((l: string) => l.includes('seat F'))).toMatch(/watson/);
    expect(unmeasured.find((l: string) => l.includes('seat G'))).toMatch(/claude-broken\.jsonl/);
    expect(unmeasured.find((l: string) => l.includes('seat G'))).toMatch(/message\.usage/);
    expect(md).toContain('calls 152');
  } finally {
    w.clean();
  }
});

test('non-operator user records start no turn and an unfinished turn is incomplete', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'A', harness: 'claude', session: 'claude-ops' }], '2026-10-06T10:00:00Z');
    w.putTranscript('claude', 'claude-ops', 'claude/claude-ops.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('operator turns 3');
    expect(md).toContain('operator wait 10.0 min');
    expect(md).toContain('calls 3');
    expect(md).toContain('turns 2');
    expect(md).toContain('working minutes 10.0');
    expect(md).toContain('output_tokens 810');
    const opRows: string[] = md.split('\n').filter((l: string) => /^\s+2026-10-06T10:/.test(l));
    expect(opRows).toHaveLength(3);
    const rowAt = (ts: string): string => md.split('\n').find((l: string) => l.startsWith('  2026') && l.includes(ts))!;
    expect(rowAt('10:00:00')).toContain('6.0 min');
    expect(rowAt('10:10:00')).toContain('4.0 min');
    const incomplete: string = rowAt('10:20:00');
    expect(incomplete).toContain('incomplete');
    expect(incomplete).not.toMatch(/\d+\.\d+ min/);
    // meta and tool-result user records produced no rows
    expect(md).not.toContain('10:15:00Z');
    // sidechain assistant excluded from token totals (would push output to 1809)
    expect(md).not.toContain('1809');
  } finally {
    w.clean();
  }
});

test('missing chart folder or bad seats.yaml exit non-zero with no USAGE.md', async (): Promise<void> => {
  const w: World = setup();
  try {
    const gone: RunResult = await w.run(resolve(w.parent, 'nope'));
    expect(gone.code).toBe(1);
    expect(gone.stderr).not.toBe('');
    const r2: RunResult = await w.run(w.chart);
    expect(r2.code).toBe(1);
    expect(r2.stderr).toMatch(/seats\.yaml/);
    writeFileSync(resolve(w.chart, 'seats.yaml'), 'opened: [\n');
    const r3: RunResult = await w.run(w.chart);
    expect(r3.code).toBe(1);
    expect(readdirSync(w.chart)).toEqual(['seats.yaml']);
    writeFileSync(resolve(w.chart, 'seats.yaml'), "opened: '2026-10-06T16:34:47Z'\nseats: many\n");
    const r4: RunResult = await w.run(w.chart);
    expect(r4.code).toBe(1);
    expect(r4.stderr).toMatch(/seats/);
    expect(readdirSync(w.chart)).toEqual(['seats.yaml']);
  } finally {
    w.clean();
  }
});

test('spans filter records, calls and minutes into their half-open windows', async (): Promise<void> => {
  const w: World = setup();
  try {
    // t1=10:00 t2=10:20 t3=10:30; last span open, until 12:00
    w.putSeats(
      w.chart,
      [{ seat: 'A', harness: 'claude', session: 'claude-spans' }],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:20:00Z' }, { from: '2026-10-06T10:30:00Z' }],
    );
    w.putTranscript('claude', 'claude-spans', 'claude/claude-spans.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain(
      'window 2026-10-06T10:00:00.000Z to 2026-10-06T10:20:00.000Z, 2026-10-06T10:30:00.000Z to 2026-10-06T12:00:00.000Z (open)',
    );
    expect(md).not.toContain('legacy window');
    // groups g1, g2, g4 placed by final record: 3 calls; g3 (last record in gap), g6 (after spans) excluded
    expect(md).toContain('calls 3');
    expect(md).toContain('average context per call 5133');
    expect(md).toContain('output_tokens 850');
    expect(md).toContain('input_tokens 1400');
    expect(md).toContain('cache_read_input_tokens 11000');
    expect(md).toContain('cache_creation_input_tokens 1500');
    // gap and edge records never leak: none of the 9000-token sentinels appear
    expect(md).not.toContain('9000');
    // turn 1 10:00-10:19 = 19 min; turn 2 10:35-10:45 clipped to the open span = 5 min
    expect(md).toContain('turns 2');
    expect(md).toContain('working minutes 24.0');
    expect(md).toContain('first turn in window 2026-10-06T10:00:00.000Z 19.0 min');
    expect(md).toContain('operator wait 24.0 min');
    expect(md).toContain('operator turns 2');
    const opRows: string[] = md.split('\n').filter((l: string) => /^  2026-10-06T10:/.test(l));
    expect(opRows).toHaveLength(2);
    expect(opRows[0]).toContain('2026-10-06T10:00:00.000Z 19.0 min');
    expect(opRows[1]).toContain('2026-10-06T10:35:00.000Z 5.0 min');
    expect(r.stdout).not.toContain('USAGE_LEAK_MARKER');
    expect(md).not.toContain('USAGE_LEAK_MARKER');

    // a closed span ending after until is clipped at until
    w.putSeats(
      w.chart,
      [{ seat: 'A', harness: 'claude', session: 'claude-spans' }],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T12:30:00Z' }],
    );
    const r2: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r2.code).toBe(0);
    const md2: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md2).toContain('calls 5');
    expect(md2).toContain('working minutes 40.0');

    // a span starting at or after until counts nothing
    w.putSeats(
      w.chart,
      [{ seat: 'A', harness: 'claude', session: 'claude-spans' }],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T13:00:00Z', to: '2026-10-06T14:00:00Z' }],
    );
    const r3: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r3.code).toBe(0);
    const md3: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md3).toContain('calls 0');
    expect(md3).toContain('average context per call n/a');
    expect(md3).toContain('output_tokens 0');
    expect(md3).toContain('working minutes 0.0');
    expect(md3).not.toContain('operator turns 1');
    expect(md3).not.toContain('first turn in window');
  } finally {
    w.clean();
  }
});

test('invalid spans exit non-zero, name the field and write no USAGE.md', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putTranscript('claude', 'claude-spans', 'claude/claude-spans.jsonl');
    const seats: Seat[] = [{ seat: 'A', harness: 'claude', session: 'claude-spans' }];
    const cases: { name: string; spans: SpanEntry[]; field: RegExp }[] = [
      {
        name: 'to not after from',
        spans: [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:00:00Z' }],
        field: /spans.*to|to.*from/i,
      },
      {
        name: 'out of order',
        spans: [
          { from: '2026-10-06T10:30:00Z', to: '2026-10-06T10:40:00Z' },
          { from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:10:00Z' },
        ],
        field: /spans/i,
      },
      {
        name: 'overlapping',
        spans: [
          { from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:35:00Z' },
          { from: '2026-10-06T10:30:00Z', to: '2026-10-06T10:40:00Z' },
        ],
        field: /spans/i,
      },
      {
        name: 'non-last span open',
        spans: [{ from: '2026-10-06T10:00:00Z' }, { from: '2026-10-06T10:30:00Z', to: '2026-10-06T10:40:00Z' }],
        field: /spans.*to|to.*required|open/i,
      },
    ];
    for (const c of cases) {
      w.putSeats(w.chart, seats, '2026-10-06T09:30:00Z', c.spans);
      const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
      expect(r.code).not.toBe(0);
      expect(r.stderr).toMatch(/spans/);
      expect(r.stderr).toMatch(c.field);
      expect(readdirSync(w.chart)).toEqual(['seats.yaml']);
    }
  } finally {
    w.clean();
  }
});

test('claude calls and average context per call', async (): Promise<void> => {
  const w: World = setup();
  try {
    // no spans: legacy window, window line named, records at exactly until excluded
    w.putSeats(w.chart, [{ seat: 'A', harness: 'claude', session: 'claude-spans' }], '2026-10-06T10:00:00Z');
    w.putTranscript('claude', 'claude-spans', 'claude/claude-spans.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T10:45:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    expect(md).toContain('legacy window 2026-10-06T10:00:00.000Z to 2026-10-06T10:45:00.000Z');
    // g1..g6 all inside -> calls 4 counted + g3 and g6 = 6 groups? g1,g2,g3,g4,g5,g6 -> 6 distinct message.ids
    expect(md).toContain('calls 6');
    // context: g1 200+2000+300, g2 300+3000+400, g3 9000+9000+9000, g4 600+5000+600, g5 700+6000+700, g6 9000+9000+9000
    // = 2500 + 3700 + 27000 + 6200 + 7400 + 27000 = 73800 / 6 = 12300
    expect(md).toContain('average context per call 12300');
    expect(md).toContain('output_tokens 19385');
  } finally {
    w.clean();
  }
});

test('codex token_usage_record calls skip compacted copies', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(
      w.chart,
      [{ seat: 'A', harness: 'codex', session: 'codex-tur' }],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:20:00Z' }, { from: '2026-10-06T10:30:00Z' }],
    );
    w.putTranscript('codex', 'codex-tur', 'codex/rollout-tur.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    // resp-1, resp-2, resp-4 count; resp-3 sits in the gap; the embedded copy inside compacted is never counted
    expect(md).toContain('calls 3');
    // context = input_tokens only (cached never added): 100+200+300 = 600 / 3 = 200
    expect(md).toContain('average context per call 200');
    expect(md).toContain('input_tokens 600');
    expect(md).toContain('cached_input_tokens 330');
    expect(md).toContain('output_tokens 180');
    expect(md).toContain('reasoning_output_tokens 60');
    // token_count cumulative line is ignored in this mode: none of its 9000 values leak
    expect(md).not.toContain('9000');
    expect(md).toContain('fixture-codex');
    expect(md).toContain('turns 2');
    expect(md).toContain('operator turns 1');
  } finally {
    w.clean();
  }
});

test('cumulative-only rollout prints calls unavailable', async (): Promise<void> => {
  const w: World = setup();
  try {
    w.putSeats(w.chart, [{ seat: 'B', harness: 'codex', session: 'codex-diff' }], '2026-10-06T10:30:00Z');
    w.putTranscript('codex', 'codex-diff', 'codex/codex-diff.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    // cumulative counters still measured; no per-response records exist
    expect(md).toContain('calls unavailable (cumulative-only rollout)');
    expect(md).toContain('input_tokens 660');
    expect(md).toContain('output_tokens 130');
    expect(md).not.toContain('average context per call');
    expect(md).toContain('legacy window');
  } finally {
    w.clean();
  }
});

test('pi calls, compaction and error entries', async (): Promise<void> => {
  const w: World = setup();
  try {
    const session: string = resolve(fixtures, 'pi/pi-A.jsonl');
    w.putSeats(
      w.chart,
      [{ seat: 'C', harness: 'pi', session }],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T10:20:00Z' }, { from: '2026-10-06T10:30:00Z' }],
    );
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    // calls: 3 stop/toolUse assistants + compaction with usage + nonzero-usage... zero-usage error skipped;
    // gap record 10:25 and post-span 10:45 excluded -> a1, compaction, a3, a5 = 4 + error-zero skipped
    expect(md).toContain('calls 4');
    // context: 1300 + 3700 + 2500 + 4900 = 12400? hand-computed below:
    // a1 100+1000+200=1300, comp 300+3000+400=3700, a3 200+2000+300=2500, a5 400+4000+500=4900 -> 12400/4 = 3100
    expect(md).toContain('average context per call 3100');
    expect(md).toContain('input_tokens 1000');
    expect(md).toContain('cache_read_input_tokens 10000');
    expect(md).toContain('cache_creation_input_tokens 1400');
    expect(md).toContain('output_tokens 260');
    // usage.reasoning maps to reasoning_output_tokens, kept out of context and output: 2+2+1+2=7
    expect(md).toContain('reasoning_output_tokens 7');
    expect(md).not.toContain('9000');
    expect(md).toContain('harness pi');
    expect(md).toContain('fixture-pi-1');
    expect(md).toContain('effort high');
    // turns mirror claude: user at 10:00 -> last assistant before 10:35 is 10:19 = 19 min;
    // user at 10:35 -> 10:38 clipped by span end 10:40? end is replyEnd 10:38 = 3 min... hand-computed 19+3=22
    expect(md).toContain('operator turns 2');
    expect(md).toContain('turns 2');
    expect(md).not.toContain('USAGE_LEAK_MARKER');
  } finally {
    w.clean();
  }
});

test('mixed sessions print calls unavailable; zero calls print n/a; missing pi path is unmeasured', async (): Promise<void> => {
  const w: World = setup();
  try {
    const piA: string = resolve(fixtures, 'pi/pi-A.jsonl');
    // seat B: one measurable pi session + one cumulative-only codex rollout -> calls unavailable, tokens still print
    w.putSeats(
      w.chart,
      [
        { seat: 'B', harness: 'pi', session: piA },
        { seat: 'B', harness: 'codex', session: 'codex-diff' },
        { seat: 'D', harness: 'pi', session: resolve(fixtures, 'pi/pi-nousage.jsonl') },
        { seat: 'E', harness: 'pi', session: resolve(fixtures, 'pi/pi-zero.jsonl') },
        { seat: 'F', harness: 'pi', session: resolve(w.parent, 'pi-does-not-exist.jsonl') },
      ],
      '2026-10-06T09:30:00Z',
      [{ from: '2026-10-06T10:00:00Z', to: '2026-10-06T12:30:00Z' }],
    );
    w.putTranscript('codex', 'codex-diff', 'codex/codex-diff.jsonl');
    const r: RunResult = await w.run(w.chart, '2026-10-06T12:00:00Z');
    expect(r.code).toBe(0);
    const md: string = readFileSync(resolve(w.chart, 'USAGE.md'), 'utf8');
    const bSection: string = md.split('\n\n').find((s: string) => s.startsWith('seat B'))!;
    expect(bSection).toContain('calls unavailable');
    expect(bSection).toContain('input_tokens');
    expect(bSection).not.toContain('average context per call');
    // pi assistant without usage -> unmeasured naming the field
    const dRow: string = md.split('\n').find((l: string) => l.includes('seat D'))!;
    expect(dRow).toContain('usage unmeasured');
    expect(dRow).toMatch(/usage/);
    // pi session with only a zero-usage error -> measured, zero calls, n/a average
    const eSection: string = md.split('\n\n').find((s: string) => s.startsWith('seat E'))!;
    expect(eSection).toContain('calls 0');
    expect(eSection).toContain('average context per call n/a');
    // missing pi path -> unmeasured naming the path
    const fRow: string = md.split('\n').find((l: string) => l.includes('seat F'))!;
    expect(fRow).toContain('usage unmeasured');
    expect(fRow).toContain('pi-does-not-exist.jsonl');
    expect(r.stdout.trimEnd().split('\n').at(-1)).toBe('outcome partial');
  } finally {
    w.clean();
  }
});
