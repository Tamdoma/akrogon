import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { readState, saveState, stateSchema, type State } from '../src/state';
import { fixture, leaf, yaml, type Fixture } from './helpers';

const canonical: z.input<typeof stateSchema> = {
  slug: 'example',
  phase: 'implement',
  created: '2026-09-10',
  repo: 'repo',
  debate: 'no',
  'blocked-by': [],
};

test('canonical states parse and save without retired fields and retain defaults', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'example', 'implement');
    expect(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8'))).not.toHaveProperty('priority');
    expect(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8'))).not.toHaveProperty('slot');
    const state: State = stateSchema.parse(canonical);
    expect(state).toMatchObject({ attempts: { A: 0, B: 0 }, done: [], prompted: {}, failed_notified: false });
    saveState(path, state);
    expect(readState(path)).toEqual(state);
    expect(readFileSync(resolve(path, 'state.yaml'), 'utf8')).not.toMatch(/^(priority|slot):/m);
  } finally {
    f.clean();
  }
});

for (const legacy of [{ priority: 'n' }, { slot: 'B' }, { priority: 'h', slot: 'A' }]) {
  test(`strict schema rejects legacy keys ${Object.keys(legacy).join(', ')}`, () => {
    expect(() => stateSchema.parse({ ...canonical, ...legacy })).toThrow(z.ZodError);
  });
}

for (const area of ['open', 'closed', 'parked']) {
  for (const legacy of [{ priority: null }, { slot: ['invalid'] }, { priority: { old: true }, slot: 42 }]) {
    test(`${area} lazily migrates ${Object.keys(legacy).join(', ')} regardless of legacy value type`, async () => {
      const f: Fixture = await fixture();
      try {
        const created: string = leaf(f, 'example', 'implement');
        const path: string = resolve(f.root, 'issues', area, 'issue/example');
        if (area !== 'open') {
          mkdirSync(resolve(path, '..'), { recursive: true });
          renameSync(created, path);
        }
        const supported: State = {
          ...canonical,
          sources: ['team/project#1'],
          hand_built: true,
          failed_notified: true,
          busy_since: { A: '2026-09-10T10:00:00Z' },
          busy_notified: { A: '2026-09-10T10:00:00Z' },
          attempts: { A: 1, B: 2 },
          done: ['A'],
          fix_rounds: 1,
          verdict: { A: 'fix', B: 'nits' },
          tab: 'tab',
          worktree: '/worktree',
          pane: { A: 'pane-a', B: 'pane-b' },
          prompted: { B: 'session-b' },
        };
        const file: string = resolve(path, 'state.yaml');
        yaml(file, { ...supported, ...legacy });
        const before: string = readFileSync(file, 'utf8');
        const state: State = readState(path);
        expect(state).toEqual(supported);
        expect(readFileSync(file, 'utf8')).toBe(before);
        saveState(path, state);
        const saved: string = readFileSync(file, 'utf8');
        expect(saved).not.toMatch(/^(priority|slot):/m);
        expect(readState(path)).toEqual(supported);
        saveState(path, readState(path));
        expect(readFileSync(file, 'utf8')).toBe(saved);
      } finally {
        f.clean();
      }
    });
  }
}

test('migration retains strict validation of unknown keys, required fields, known values and YAML shapes', async () => {
  const f: Fixture = await fixture();
  try {
    const path: string = leaf(f, 'example', 'implement');
    const file: string = resolve(path, 'state.yaml');
    yaml(file, { ...canonical, priority: 'n', slot: 'B', unexpected: true });
    expect(() => readState(path)).toThrow(z.ZodError);
    expect(() => readState(path)).toThrow('unexpected');
    const { repo, ...missingRepo } = canonical;
    for (const invalid of [missingRepo, { ...canonical, phase: 'invalid' }, { ...canonical, done: ['A', 'A'] }]) {
      yaml(file, { ...invalid, priority: 'n', slot: 'B' });
      expect(() => readState(path)).toThrow(z.ZodError);
    }
    for (const invalid of ['null', 'false', '42', 'text', '[]', '- priority: n\n  slot: B', '']) {
      writeFileSync(file, invalid);
      expect(() => readState(path)).toThrow(z.ZodError);
    }
  } finally {
    f.clean();
  }
});
