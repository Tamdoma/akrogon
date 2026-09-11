import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fixture, cli, leaf, type Fixture } from './helpers';
import { type Result } from '../src/shell';

test('park and unpark move whole issues by name, refuse running ones, and keep the loop blind to parked work', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'docs-a', 'plan.synthesis', {}, 'docs');
    leaf(f, 'docs-b', 'plan.synthesis', { 'blocked-by': ['docs-a'] }, 'docs');
    leaf(f, 'small', 'plan.synthesis', {}, 'small-issue');
    leaf(f, 'busy', 'implement', { tab: 'w1:t1' }, 'busy-issue');
    const parked: Result = await cli(f, ['park', 'docs', 'small-issue']);
    expect(parked.code).toBe(0);
    expect(parked.stdout).toContain('parked');
    expect(existsSync(resolve(f.root, 'issues/parked/docs/docs-b/state.yaml'))).toBe(true);
    expect(existsSync(resolve(f.root, 'issues/open/docs'))).toBe(false);
    expect(readdirSync(resolve(f.root, 'issues/open'))).toEqual(['busy-issue']);
    const status: Result = await cli(f, ['status']);
    expect(status.code).toBe(0);
    expect(status.stdout).not.toContain('docs-a');
    expect(status.stdout).toContain('parked  docs, small-issue');
    expect((await cli(f, ['next', '--all'])).stdout).not.toContain('docs-a');
    expect(existsSync(resolve(f.root, 'issues/parked/docs/docs-a/state.yaml'))).toBe(true);
    const refused: Result = await cli(f, ['park', 'busy-issue']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('running leaf');
    expect(existsSync(resolve(f.root, 'issues/open/busy-issue/busy/state.yaml'))).toBe(true);
    expect((await cli(f, ['park', 'nope'])).code).not.toBe(0);
    expect((await cli(f, ['unpark', 'busy-issue'])).code).not.toBe(0);
    expect((await cli(f, ['park'])).code).not.toBe(0);
    expect((await cli(f, ['park', 'docs', '--all'])).code).not.toBe(0);
    const back: Result = await cli(f, ['unpark', 'docs']);
    expect(back.code).toBe(0);
    expect(back.stdout).toContain('unparked docs');
    expect(existsSync(resolve(f.root, 'issues/open/docs/docs-b/state.yaml'))).toBe(true);
    expect(readdirSync(resolve(f.root, 'issues/parked'))).toEqual(['small-issue']);
  } finally {
    f.clean();
  }
});

test('park --all skips running issues and unpark --all restores everything', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'one', 'plan.synthesis', {}, 'first');
    leaf(f, 'two', 'plan.synthesis', {}, 'second');
    leaf(f, 'busy', 'implement', { worktree: resolve(f.home, 'wt') }, 'busy-issue');
    const parked: Result = await cli(f, ['park', '--all']);
    expect(parked.code).toBe(0);
    expect(parked.stdout).toContain('running  busy-issue');
    expect(readdirSync(resolve(f.root, 'issues/open'))).toEqual(['busy-issue']);
    expect(readdirSync(resolve(f.root, 'issues/parked')).sort()).toEqual(['first', 'second']);
    const restored: Result = await cli(f, ['unpark', '--all']);
    expect(restored.code).toBe(0);
    expect(readdirSync(resolve(f.root, 'issues/open')).sort()).toEqual(['busy-issue', 'first', 'second']);
    expect(readdirSync(resolve(f.root, 'issues/parked'))).toEqual([]);
    expect((await cli(f, ['status'])).stdout).not.toContain('parked  ');
  } finally {
    f.clean();
  }
});

test('park keeps prerequisites that open leaves still depend on, and unpark refuses dependents of parked work', async () => {
  const f: Fixture = await fixture();
  try {
    leaf(f, 'prereq', 'plan.synthesis', {}, 'first');
    leaf(f, 'dependent', 'plan.synthesis', { 'blocked-by': ['prereq'] }, 'second');
    leaf(f, 'free', 'plan.synthesis', {}, 'third');
    const refused: Result = await cli(f, ['park', 'first']);
    expect(refused.code).not.toBe(0);
    expect(refused.stderr).toContain('prereq');
    expect(existsSync(resolve(f.root, 'issues/open/first/prereq/state.yaml'))).toBe(true);
    mkdirSync(resolve(f.root, 'issues/parked/second'), { recursive: true });
    const collision: Result = await cli(f, ['park', 'first', 'second']);
    expect(collision.code).not.toBe(0);
    expect(collision.stderr).toContain('already exists');
    expect(existsSync(resolve(f.root, 'issues/open/first/prereq/state.yaml'))).toBe(true);
    rmSync(resolve(f.root, 'issues/parked/second'), { recursive: true });
    expect((await cli(f, ['park', 'first', 'second', 'first'])).code).toBe(0);
    expect(readdirSync(resolve(f.root, 'issues/open'))).toEqual(['third']);
    const dependent: Result = await cli(f, ['unpark', 'second']);
    expect(dependent.code).not.toBe(0);
    expect(dependent.stderr).toContain('prereq');
    expect((await cli(f, ['unpark', 'first', 'second'])).code).toBe(0);
    leaf(f, 'busy', 'implement', { tab: 'w1:t1', 'blocked-by': ['free'] }, 'busy-issue');
    const all: Result = await cli(f, ['park', '--all']);
    expect(all.code).toBe(0);
    expect(all.stdout).toContain('running  busy-issue');
    expect(all.stdout).toContain('needed   third');
    expect(readdirSync(resolve(f.root, 'issues/open')).sort()).toEqual(['busy-issue', 'third']);
    expect(readdirSync(resolve(f.root, 'issues/parked')).sort()).toEqual(['first', 'second']);
    expect((await cli(f, ['next', '--all'])).stderr).not.toContain('Missing leaf');
  } finally {
    f.clean();
  }
});
