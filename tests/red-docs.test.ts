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

test('the implement and check skills state the retry, comparison record and --compare rules', () => {
  const implement: string = readFileSync(resolve(root, 'skills/implement-issue/SKILL.md'), 'utf8');
  const check: string = readFileSync(resolve(root, 'skills/check-issue/SKILL.md'), 'utf8');
  for (const [name, text] of [
    ['implement-issue', implement],
    ['check-issue', check],
  ] as const) {
    expect(text, name).toContain('--compare');
    expect(text, name).toContain('base-run');
    expect(text, name).toMatch(/retry/i);
    expect(text, name).toMatch(/known-red/);
    // The incomplete base-run stop stays; the completed-comparison failed stop is gone.
    expect(text, name).toContain('incomplete base run');
    expect(text, name).not.toContain('failed --reason "<command> red on base');
  }
  // A failed checks command still blocks unless every failing unit is known-red.
  expect(check).toMatch(/[Ff]ailed `checks` commands? always block[^.\n]*known-red/);
});

test('plan.synthesis states that a planned test intended red is never compared', () => {
  const plan: string = readFileSync(resolve(root, 'skills/plan-issue/SKILL.md'), 'utf8');
  const synthesis: string = plan.slice(plan.indexOf('## plan.synthesis'));
  expect(synthesis).toContain('--compare');
  expect(synthesis).toMatch(/(never|not)[^\n.]*compar/i);
});

test('the guide and README carry the comparison flow, not the retired base-red stop', () => {
  const phases: string = readFileSync(resolve(root, 'docs/guide/phases.md'), 'utf8');
  expect(phases).toMatch(/--compare|known-red/);
  const readme: string = readFileSync(resolve(root, 'README.md'), 'utf8');
  expect(readme).toContain('--compare');
});

test('no skill or guide tells a pre-merge seat to stop, wait or fail on a base red or to reuse an earlier base result', () => {
  const retired: RegExp[] = [
    /failed --reason "<command> red on base/,
    /one base run at `AKROGON_BASE`/,
    /still ends the pass `failed`/,
  ];
  for (const dir of ['skills', 'docs/guide']) {
    for (const file of markdown(dir)) {
      const text: string = readFileSync(file, 'utf8');
      for (const pattern of retired) expect(text, `${file} contains retired stop ${pattern}`).not.toMatch(pattern);
    }
  }
});
