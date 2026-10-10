import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, fakeHerdr, type Fixture } from './helpers';
import { readState, saveState, type State } from '../src/state';
import type { Result } from '../src/shell';
import type { Database } from './fake-herdr';

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
function turn(output: string, slug: string): string {
  return cell(output, leafRow(output, slug), 'TURN');
}

function dependentsGraph(f: Fixture, xStamp: string, yStamp: string): void {
  leaf(f, 'y', 'merge', { merge_stamp: yStamp });
  leaf(f, 'x', 'merge', { merge_stamp: xStamp });
  leaf(f, 'd1', 'implement', { 'blocked-by': ['x'] });
  leaf(f, 'd2', 'implement', { 'blocked-by': ['d1'] });
}

test('TURN places the merge leaf with more unmerged dependents first despite the later stamp', async () => {
  const f: Fixture = await fixture();
  try {
    dependentsGraph(f, '2026-09-12T00:00:00Z', '2026-09-11T00:00:00Z');
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(turn(result.stdout, 'x')).toBe('holder');
    expect(turn(result.stdout, 'y')).toBe('2');
  } finally {
    f.clean();
  }
});

test('TURN keeps the batch record holder first ahead of a leaf with more dependents', async () => {
  const f: Fixture = await fixture();
  try {
    const y: string = leaf(f, 'y', 'merge', { merge_stamp: '2026-09-11T00:00:00Z' });
    leaf(f, 'x', 'merge', { merge_stamp: '2026-09-12T00:00:00Z' });
    leaf(f, 'd1', 'implement', { 'blocked-by': ['x'] });
    leaf(f, 'd2', 'implement', { 'blocked-by': ['d1'] });
    const state: State = readState(y);
    saveState(y, {
      ...state,
      batch: {
        attempt: 't1',
        built_on: '0123456789abcdef0123456789abcdef01234567',
        holder: {
          base: '0123456789abcdef0123456789abcdef01234567',
          head: '0123456789abcdef0123456789abcdef01234567',
        },
        members: [],
        applied: true,
      },
    });
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(turn(result.stdout, 'y')).toBe('holder');
    expect(turn(result.stdout, 'x')).toBe('2');
  } finally {
    f.clean();
  }
});

test('TURN ignores merged leaves when counting dependents', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'y', 'merge', { merge_stamp: '2026-09-11T00:00:00Z' });
    leaf(f, 'x', 'merge', { merge_stamp: '2026-09-12T00:00:00Z' });
    leaf(f, 'm1', 'merged', { 'blocked-by': ['x'] });
    leaf(f, 'm2', 'merged', { 'blocked-by': ['m1'] });
    const result: Result = await cli(f, ['status']);
    expect(result.code).toBe(0);
    expect(turn(result.stdout, 'y')).toBe('holder');
    expect(turn(result.stdout, 'x')).toBe('2');
  } finally {
    f.clean();
  }
});

test('next --all dispatches a leaf with unmerged dependents before an earlier leaf with none', async () => {
  const base: Fixture = await fixture();
  const f: Fixture & { db: string; env: NodeJS.ProcessEnv } = { ...base, ...fakeHerdr(base) };
  try {
    // Discovery enumerates last-created first on tmpfs, so creating few after
    // the many chain puts few before many in the unsorted visit order.
    const many: string = leaf(f, 'many', 'plan.synthesis');
    leaf(f, 'd1', 'plan.synthesis', { 'blocked-by': ['many'] });
    leaf(f, 'd2', 'plan.synthesis', { 'blocked-by': ['d1'] });
    const few: string = leaf(f, 'few', 'plan.synthesis');
    const result: Result = await cli(f, ['next', '--all'], f.root, f.env);
    expect(result.code).toBe(1);
    const prompts: Database['prompts'] = (JSON.parse(readFileSync(f.db, 'utf8')) as Database).prompts;
    expect(prompts.map((prompt) => prompt.text)).toEqual([
      `plan-issue many slot=A phase=plan.synthesis leaf=${many}`,
      `plan-issue few slot=A phase=plan.synthesis leaf=${few}`,
    ]);
  } finally {
    f.clean();
  }
}, 20000);

test('merge and next docs describe dependents-first ordering through blocked-by', () => {
  const merge: string = readFileSync(resolve(import.meta.dir, '../docs/guide/merge.md'), 'utf8');
  const next: string = readFileSync(resolve(import.meta.dir, '../docs/guide/next.md'), 'utf8');
  expect(merge).toContain('blocked-by');
  expect(merge).toContain('transitively');
  expect(next).toContain('blocked-by');
  expect(next).toContain('transitively');
});
