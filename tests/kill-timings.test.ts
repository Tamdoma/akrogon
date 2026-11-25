// Proven-bug reproduction (review-B F4): the tool_kill rows must be written where an older
// akrogon reading the shared timings.jsonl after a rollback loses nothing — the strict union
// schema of every older release fails the whole file on one unknown kind, so the rows belong
// in their own ledger file, never in timings.jsonl.
import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { appendTiming, readTimings } from '../src/timing';
import type { Repo } from '../src/config';

function killRowsIn(file: string): Record<string, unknown>[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('{'))
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

test('tool kill rows land in their own ledger, leaving timings.jsonl parseable by older releases', () => {
  const root: string = mkdtempSync('/tmp/akr-killledger-');
  try {
    mkdirSync(resolve(root, 'issues'), { recursive: true });
    writeFileSync(
      resolve(root, 'issues/timings.jsonl'),
      JSON.stringify({
        kind: 'visit_start',
        slug: 'x',
        phase: 'implement',
        visit: 1,
        ts: '2026-01-01T00:00:00.000Z',
        repo: 'r',
      }) + '\n',
    );
    const repo: Repo = { name: 'r', root } as Repo;
    appendTiming(repo, {
      kind: 'tool_kill',
      slug: 'x',
      unit: 'u.scope',
      seen: 1,
      populated: [],
      deferred: [],
      errors: 0,
    });
    appendTiming(repo, { kind: 'tool_kill_deferred', slug: 'x', unit: 'u.scope', t: 't-1-2', outcome: 'written' });

    // The shared ledger holds no unknown kind: an older release's strict union still parses
    // every row it holds — exactly what the rollback path needs.
    const shared: string = readFileSync(resolve(root, 'issues/timings.jsonl'), 'utf8');
    expect(shared).not.toContain('tool_kill');
    expect(readTimings(root).map((row) => row.kind)).toEqual(['visit_start']);

    // The rows are not lost: their own ledger carries both kinds with their fields.
    const ledger: string = resolve(root, 'issues/timings-kill.jsonl');
    const rows: Record<string, unknown>[] = killRowsIn(ledger);
    expect(rows.map((row) => row.kind)).toEqual(['tool_kill', 'tool_kill_deferred']);
    expect(rows[0]).toMatchObject({ slug: 'x', unit: 'u.scope', seen: 1 });
    expect(rows[1]).toMatchObject({ t: 't-1-2', outcome: 'written' });

    // A mixed shared ledger with one foreign kind still yields its valid rows line by line.
    writeFileSync(resolve(root, 'issues/timings.jsonl'), shared + '{"kind":"future-kind","slug":"x"}\n');
    expect(readdirSync(resolve(root, 'issues'))).toContain('timings-kill.jsonl');
    expect(readTimings(root).map((row) => row.kind)).toEqual(['visit_start']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
