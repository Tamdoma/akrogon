import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { readRepo, type RepoConfig } from '../src/config';
import { readLog } from '../src/log';
import { routing } from '../src/routing';
import { readState, saveState, type State } from '../src/state';
import { readTimings } from '../src/timing';
import { cli, fixture, yaml, type Fixture } from './helpers';
import { type Result } from '../src/shell';

const ZERO: string = '2026-10-11T00:00:00.000Z';
const retired: readonly ('plan.positions' | 'plan.rebuttal')[] = ['plan.positions', 'plan.rebuttal'];

function at(minutes: number): string {
  return new Date(Date.parse(ZERO) + minutes * 60000).toISOString();
}

function stateFile(f: Fixture, slug: string, fields: object): string {
  const path: string = resolve(f.root, 'issues/open/issue', slug);
  mkdirSync(path, { recursive: true });
  yaml(resolve(path, 'state.yaml'), { slug, created: '2026-10-25', repo: 'repo', 'blocked-by': [], ...fields });
  return path;
}

function move(slug: string, from: string, to: string, ts: string): object {
  return {
    ts,
    repo: 'repo',
    slug,
    from,
    to,
    slot: 'A',
    attempts: { A: 0, B: 0 },
    fix_rounds: 0,
    verdict: {},
    head: 'h',
    diff: '',
    session: null,
  };
}

function lines(f: Fixture, file: 'log' | 'timings', rows: object[]): void {
  writeFileSync(resolve(f.root, 'issues', `${file}.jsonl`), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}

test('legacy debate states load without the field, debate-less states load, and saves drop the key', async () => {
  const f: Fixture = await fixture();
  try {
    for (const debate of ['no', 'yes']) {
      const path: string = stateFile(f, `legacy-${debate}`, { phase: 'implement', debate });
      const state: State = readState(path);
      expect(state).toMatchObject({ slug: `legacy-${debate}`, phase: 'implement' });
      expect(state).not.toHaveProperty('debate');
      saveState(path, state);
      expect(Bun.YAML.parse(readFileSync(resolve(path, 'state.yaml'), 'utf8'))).not.toHaveProperty('debate');
      expect(readState(path)).toEqual(state);
    }
    const fresh: string = stateFile(f, 'fresh', { phase: 'plan.synthesis' });
    expect(readState(fresh)).toMatchObject({ slug: 'fresh', phase: 'plan.synthesis' });
    const stray: string = stateFile(f, 'stray', { phase: 'implement', debate: 'no', notes: 'stray' });
    expect(() => readState(stray)).toThrow(z.ZodError);
  } finally {
    f.clean();
  }
});

test('legacy rebuttal repo configs load without the setting and unknown keys stay refused', async () => {
  const f: Fixture = await fixture();
  try {
    const file: string = resolve(f.root, 'issues/config.yaml');
    for (const rebuttal of [true, false]) {
      yaml(file, { rebuttal, fix_rounds: 2, grounding: 'none' });
      const config: RepoConfig = readRepo('repo', f.root).config;
      expect(config).toMatchObject({ fix_rounds: 2, grounding: 'none' });
      expect(config).not.toHaveProperty('rebuttal');
    }
    yaml(file, { rebuttal: true, scripts_dir: 'retired', grounding: 'none' });
    expect(() => readRepo('repo', f.root)).toThrow('scripts_dir');
  } finally {
    f.clean();
  }
});

test('init applies legacy rebuttal proposals and existing configs and writes no rebuttal key', async () => {
  const f: Fixture = await fixture();
  try {
    const file: string = resolve(f.root, 'issues/config.yaml');
    yaml(file, { rebuttal: false, checks: { test: 'bun test' }, grounding: 'none' });
    const existing: Result = await cli(f, ['init']);
    expect(existing.code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(file, 'utf8'))).not.toHaveProperty('rebuttal');
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { rebuttal: true, implement: 'inline', grounding: 'none' });
    const proposed: Result = await cli(f, ['init', '--from', proposal]);
    expect(proposed.code).toBe(0);
    const written: ReturnType<typeof Bun.YAML.parse> = Bun.YAML.parse(readFileSync(file, 'utf8'));
    expect(written).toMatchObject({ implement: 'inline' });
    expect(written).not.toHaveProperty('rebuttal');
    const before: string = readFileSync(file, 'utf8');
    yaml(proposal, { rebuttal: true, scripts_dir: 'retired', grounding: 'none' });
    expect((await cli(f, ['init', '--from', proposal])).code).not.toBe(0);
    expect(readFileSync(file, 'utf8')).toBe(before);
  } finally {
    f.clean();
  }
});

test('history naming retired phases parses: log moves, timing events and a failed state', async () => {
  const f: Fixture = await fixture();
  try {
    lines(f, 'log', [
      move('old', 'failed', 'plan.positions', at(0)),
      move('old', 'plan.positions', 'plan.rebuttal', at(10)),
      move('old', 'plan.rebuttal', 'plan.synthesis', at(20)),
    ]);
    expect(readLog(f.root).map((entry) => [entry.record.from, entry.record.to])).toEqual([
      ['failed', 'plan.positions'],
      ['plan.positions', 'plan.rebuttal'],
      ['plan.rebuttal', 'plan.synthesis'],
    ]);
    const events: object[] = retired.flatMap((phase) => [
      { ts: at(0), repo: 'repo', slug: 'old', kind: 'visit_start', phase, visit: 0 },
      {
        ts: at(1),
        repo: 'repo',
        slug: 'old',
        kind: 'prompt',
        slot: 'B',
        phase,
        visit: 0,
        session: null,
        outcome: 'delivered',
      },
      { ts: at(2), repo: 'repo', slug: 'old', kind: 'seat_done', slot: 'A', phase, visit: 0 },
      { ts: at(3), repo: 'repo', slug: 'old', kind: 'check_start', run: 'r1', phase, name: 'unit', scope: 'leaf' },
    ]);
    lines(f, 'timings', events);
    expect(readTimings(f.root)).toHaveLength(events.length);
    for (const phase of retired) {
      const path: string = stateFile(f, `stopped-${phase.slice(5)}`, {
        phase: 'failed',
        debate: 'yes',
        failure: { cause: 'blocked', phase, slot: 'B', reason: 'x' },
      });
      expect(readState(path).failure).toEqual({ cause: 'blocked', phase, slot: 'B', reason: 'x' });
    }
  } finally {
    f.clean();
  }
});

test('timing report over retired-phase history completes and counts each retired visit as A+B', async () => {
  const f: Fixture = await fixture();
  try {
    lines(f, 'log', [
      move('old', 'failed', 'plan.positions', at(0)),
      move('old', 'plan.positions', 'plan.rebuttal', at(10)),
      move('old', 'plan.rebuttal', 'plan.synthesis', at(20)),
      move('old', 'plan.synthesis', 'implement', at(30)),
    ]);
    const prompt: (slot: string, phase: string, minute: number) => object = (slot, phase, minute) => ({
      ts: at(minute),
      repo: 'repo',
      slug: 'old',
      kind: 'prompt',
      slot,
      phase,
      visit: 0,
      session: null,
      outcome: 'delivered',
    });
    const start: (phase: string, minute: number) => object = (phase, minute) => ({
      ts: at(minute),
      repo: 'repo',
      slug: 'old',
      kind: 'visit_start',
      phase,
      visit: 0,
    });
    lines(f, 'timings', [
      start('plan.positions', 0),
      prompt('A', 'plan.positions', 1),
      prompt('B', 'plan.positions', 1),
      start('plan.rebuttal', 10),
      prompt('A', 'plan.rebuttal', 11),
      start('plan.synthesis', 20),
      prompt('A', 'plan.synthesis', 21),
      start('implement', 30),
    ]);
    const result: Result = await cli(f, ['timing', 'old'], f.root);
    expect(result).toMatchObject({ code: 0 });
    const report: string[] = result.stdout.split('\n');
    const block: (phase: string) => string[] = (phase) => {
      const head: number = report.findIndex((line) => line.startsWith(`${phase} #0`));
      const rest: number = report.slice(head + 1).findIndex((line) => !line.startsWith('  '));
      return report.slice(head, rest === -1 ? undefined : head + 1 + rest);
    };
    expect(block('plan.positions')[0]).toBe('plan.positions #0 10m');
    expect(block('plan.positions').some((line) => line.includes('incomplete'))).toBe(false);
    expect(block('plan.rebuttal')).toContain('  incomplete prompt:B');
    expect(block('plan.synthesis').some((line) => line.includes('incomplete'))).toBe(false);
  } finally {
    f.clean();
  }
});

test('retired phases are no live state, route or move', async () => {
  const f: Fixture = await fixture();
  try {
    for (const phase of retired) {
      const path: string = stateFile(f, `live-${phase.slice(5)}`, { phase, debate: 'yes' });
      expect(() => readState(path)).toThrow(z.ZodError);
    }
    for (const [from, route] of Object.entries(routing)) {
      expect(retired).not.toContain(from);
      for (const to of route.next) expect(retired).not.toContain(to);
    }
    const stopped: string = stateFile(f, 'stopped', {
      phase: 'failed',
      debate: 'no',
      failure: { cause: 'blocked', phase: 'plan.synthesis', slot: 'A', reason: 'x' },
    });
    const planning: string = stateFile(f, 'planning', { phase: 'plan.synthesis', debate: 'no' });
    for (const phase of retired) {
      const stoppedBefore: string = readFileSync(resolve(stopped, 'state.yaml'), 'utf8');
      expect((await cli(f, ['phase', 'stopped', phase])).code).not.toBe(0);
      expect(readFileSync(resolve(stopped, 'state.yaml'), 'utf8')).toBe(stoppedBefore);
      const planningBefore: string = readFileSync(resolve(planning, 'state.yaml'), 'utf8');
      expect((await cli(f, ['phase', 'planning', phase, '--slot', 'A'])).code).not.toBe(0);
      expect(readFileSync(resolve(planning, 'state.yaml'), 'utf8')).toBe(planningBefore);
    }
    const recovered: Result = await cli(f, ['phase', 'stopped', 'plan.synthesis']);
    expect(recovered.stdout).toBe('moved plan.synthesis');
    expect(readState(stopped)).toMatchObject({ phase: 'plan.synthesis' });
  } finally {
    f.clean();
  }
});
