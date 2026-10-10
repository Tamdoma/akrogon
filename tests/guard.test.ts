import { test, expect } from 'bun:test';
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cli, fixture, leaf, printedChecks, yaml, type Fixture } from './helpers';
import { command, type Result } from '../src/shell';
import { checkLocation } from '../src/guard';

test('guard ancestors accepts a clean chain then refuses naming the ancestor holding node_modules', async () => {
  const f: Fixture = await fixture();
  try {
    const clean: Result = await cli(f, ['guard', 'ancestors']);
    expect(clean.code).toBe(0);
    mkdirSync(resolve(f.home, 'node_modules'));
    const refused: Result = await cli(f, ['guard', 'ancestors']);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain(realpathSync(f.home));
  } finally {
    f.clean();
  }
});

test('guard ancestors accepts package.json at the toplevel and refuses a parent holding it', async () => {
  const f: Fixture = await fixture();
  try {
    writeFileSync(resolve(f.root, 'package.json'), '{"name":"repo"}\n');
    const own: Result = await cli(f, ['guard', 'ancestors']);
    expect(own.code).toBe(0);
    writeFileSync(resolve(f.home, 'package.json'), '{"name":"home"}\n');
    const refused: Result = await cli(f, ['guard', 'ancestors']);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain(realpathSync(f.home));
  } finally {
    f.clean();
  }
});

test('guard own-modules refuses naming the missing node_modules and accepts it once created', async () => {
  const f: Fixture = await fixture();
  try {
    const missing: Result = await cli(f, ['guard', 'own-modules']);
    expect(missing.code).toBe(1);
    expect(missing.stderr).toContain(resolve(realpathSync(f.root), 'node_modules'));
    mkdirSync(resolve(f.root, 'node_modules'));
    const present: Result = await cli(f, ['guard', 'own-modules']);
    expect(present.code).toBe(0);
  } finally {
    f.clean();
  }
});

test('checkLocation accepts a nonexistent target under clean ancestors and refuses it under a dirty one', async () => {
  const f: Fixture = await fixture();
  try {
    const target: string = resolve(f.home, 'new/tree');
    expect(() => checkLocation(target)).not.toThrow();
    mkdirSync(resolve(f.home, 'node_modules'));
    expect(() => checkLocation(target)).toThrow(realpathSync(f.home));
  } finally {
    f.clean();
  }
});

test('guard with missing or unknown arguments exits non-zero printing usage', async () => {
  const f: Fixture = await fixture();
  try {
    const bare: Result = await cli(f, ['guard']);
    expect(bare.code).not.toBe(0);
    expect(bare.stderr).toContain('Usage');
    const unknown: Result = await cli(f, ['guard', 'bogus']);
    expect(unknown.code).not.toBe(0);
    expect(unknown.stderr).toContain('Usage');
  } finally {
    f.clean();
  }
});

test('printed check refuses at a worktree with a dirty ancestor before setup runs', async () => {
  const f: Fixture = await fixture();
  try {
    const check: ReturnType<typeof printedChecks> = printedChecks(f);
    const marker: string = resolve(f.home, 'setup-ran');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      setup: `touch ${marker}`,
      checks: { t: 'true' },
      grounding: 'none',
    });
    const parent: string = resolve(f.home, 'bad');
    mkdirSync(resolve(parent, 'node_modules'), { recursive: true });
    const worktree: string = resolve(parent, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    leaf(f, 'check', 'implement', { worktree });
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.t;
    const result: Result = await check(printed, worktree);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(realpathSync(parent));
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});

test('printed check refuses naming missing own node_modules and never runs the check command', async () => {
  const f: Fixture = await fixture();
  try {
    const check: ReturnType<typeof printedChecks> = printedChecks(f);
    const marker: string = resolve(f.home, 'check-ran');
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { t: `touch ${marker}` },
      grounding: 'none',
    });
    const worktree: string = resolve(f.home, 'wt');
    await command(['git', 'worktree', 'add', '--detach', worktree, 'HEAD'], f.root);
    leaf(f, 'check', 'implement', { worktree });
    const printed: string = (
      Bun.YAML.parse((await cli(f, ['config'], worktree)).stdout) as { checks: Record<string, string> }
    ).checks.t;
    const result: Result = await check(printed, worktree);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(resolve(realpathSync(worktree), 'node_modules'));
    expect(existsSync(marker)).toBe(false);
  } finally {
    f.clean();
  }
});
