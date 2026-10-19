import { test, expect } from 'bun:test';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, type Fixture } from './helpers';
import { readRepo } from '../src/config';
import { readAttempts, attemptRecordSchema } from '../src/attempts';
import { readTimings, type TimingEvent } from '../src/timing';
import { batchSchema } from '../src/state';
import { command, type Result } from '../src/shell';

const root: string = resolve(import.meta.dir, '..');

test('old attempt and timing lines carrying members still parse', async () => {
  const f: Fixture = await fixture();
  try {
    const line = (outcome: string, members: (string | { slug: string; head: string })[]): string =>
      JSON.stringify({
        attempt: 'a0',
        repo: 'repo',
        holder: 'hold',
        built_on: 'a'.repeat(40),
        outcome,
        members,
        end: '2026-10-10T00:00:00.000Z',
      });
    writeFileSync(
      resolve(f.root, 'issues/merge-attempts.jsonl'),
      [line('red', ['mem-a']), line('merged', [{ slug: 'mem-a', head: 'b'.repeat(40) }])].join('\n') + '\n',
    );
    expect(readAttempts(readRepo('repo', f.root)).map((record) => record.outcome)).toEqual(['red', 'merged']);
    writeFileSync(
      resolve(f.root, 'issues/timings.jsonl'),
      JSON.stringify({
        kind: 'batch',
        ts: '2026-10-10T00:00:00.000Z',
        repo: 'repo',
        slug: 'hold',
        attempt: 'a0',
        holder: 'hold',
        members: ['mem-a', 'mem-b'],
        built_on: 'a'.repeat(40),
      }) + '\n',
    );
    const events: TimingEvent[] = readTimings(f.root);
    expect(events.map((event) => event.kind)).toEqual(['batch']);
  } finally {
    f.clean();
  }
});

test('a non-empty or malformed batch.members is refused naming the state.yaml path', async () => {
  const f: Fixture = await fixture();
  try {
    const main: string = await command(['git', 'rev-parse', 'origin/main'], f.root);
    for (const members of [[{ slug: 'bb', base: main, head: main, tip: main }], 'x']) {
      const path: string = leaf(f, 'aa', 'merge', {
        merge_stamp: '2026-10-05T00:00:00.000Z',
        batch: { attempt: 'a1', built_on: main, holder: { base: main, head: main }, applied: true, top: main, members },
      });
      const file: string = resolve(path, 'state.yaml');
      const before: string = readFileSync(file, 'utf8');
      const refused: Result = await cli(f, ['phase', 'aa', 'merged', '--slot', 'B', '--check', '--attempt', 'a1']);
      expect(refused.code).not.toBe(0);
      expect(refused.stderr).toContain(file);
      expect(refused.stderr).toContain('members');
      expect(readFileSync(file, 'utf8')).toBe(before);
      expect(await command(['git', 'rev-parse', 'origin/main'], f.root)).toBe(main);
    }
  } finally {
    f.clean();
  }
});

test('no member stacking code remains in src', () => {
  const sources: string[] = readdirSync(resolve(root, 'src'), { recursive: true })
    .map(String)
    .filter((entry) => entry.endsWith('.ts'));
  for (const entry of sources) {
    const text: string = readFileSync(resolve(root, 'src', entry), 'utf8');
    for (const name of ['pickMembers', 'redMemberHeads', 'BatchMember', 'batchMemberSchema'])
      expect(text, `src/${entry} names ${name}`).not.toContain(name);
  }
  expect(readFileSync(resolve(root, 'src/batch.ts'), 'utf8')).not.toMatch(/\bmembers\b/);
  expect(Object.keys(batchSchema.shape)).not.toContain('members');
  expect(
    attemptRecordSchema.parse({
      attempt: 'a0',
      repo: 'repo',
      holder: 'hold',
      built_on: 'x',
      outcome: 'red',
      members: [{ slug: 'm', head: 'h' }],
      end: '2026-10-10T00:00:00.000Z',
    }).outcome,
  ).toBe('red');
});

test('merge docs describe the holder alone', () => {
  for (const path of ['skills/merge-issue/SKILL.md', 'skills/check-issue/SKILL.md', 'src/AREA.md']) {
    const text: string = readFileSync(resolve(root, path), 'utf8');
    for (const pattern of [/\bmembers?\b/i, /stack red/, /stack top/])
      expect(text, `${path} matches ${pattern}`).not.toMatch(pattern);
  }
  for (const path of ['docs/guide/merge.md', 'docs/guide/next.md', 'docs/guide/state.md', 'docs/guide/files.md']) {
    const text: string = readFileSync(resolve(root, path), 'utf8');
    for (const pattern of [/members=/, /stack red/, /restarts alone/, /member tip/, /member branch/])
      expect(text, `${path} matches ${pattern}`).not.toMatch(pattern);
  }
});
