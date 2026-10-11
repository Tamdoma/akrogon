import { test, expect } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root: string = resolve(import.meta.dir, '..');

function markdown(dir: string): string[] {
  const base: string = resolve(root, dir);
  return readdirSync(base, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => resolve(base, entry));
}

// Literal contracts only: CLI flags, command strings and record-schema tokens that
// run verbatim. Rule wording is reviewed by the seats, never asserted here.
const seatSkills: string[] = [
  resolve(root, 'skills/implement-issue/SKILL.md'),
  resolve(root, 'skills/check-issue/SKILL.md'),
];

test('seat skills carry the literal flag, command and record-token contracts', () => {
  for (const file of seatSkills) {
    const text: string = readFileSync(file, 'utf8');
    expect(text, file).toContain('--compare');
    expect(text, file).toContain('akrogon base-run --base "$AKROGON_BASE" -- <command>');
    expect(text, file).toContain('known-red');
    expect(text, file).toContain('failed --reason "<command> incomplete base run');
    expect(text, file).not.toContain('failed --reason "<command> red on base');
  }
  const plan: string = readFileSync(resolve(root, 'skills/plan-issue/SKILL.md'), 'utf8');
  expect(plan.slice(plan.indexOf('## plan.synthesis'))).toContain('--compare');
});

test('the guide and README carry the literal flag and record tokens', () => {
  const phases: string = readFileSync(resolve(root, 'docs/guide/phases.md'), 'utf8');
  expect(phases).toContain('--compare');
  expect(phases).toContain('known-red');
  const readme: string = readFileSync(resolve(root, 'README.md'), 'utf8');
  expect(readme).toContain('--compare');
});

test('no skill or guide retains the retired red-on-base stop command', () => {
  const retired: RegExp = /failed --reason "<command> red on base/;
  for (const dir of ['skills', 'docs/guide']) {
    for (const file of markdown(dir)) {
      const text: string = readFileSync(file, 'utf8');
      expect(text, `${file} contains the retired stop`).not.toMatch(retired);
    }
  }
});

test('the merge skill carries the merge comparison, green-record and batch-base contracts', () => {
  const text: string = readFileSync(resolve(root, 'skills/merge-issue/SKILL.md'), 'utf8');
  expect(text).toContain('--compare');
  expect(text).toContain('--attempt <id>');
  expect(text).toContain('akrogon base-run');
  expect(text).toContain('known-red');
});
