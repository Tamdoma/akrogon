import { test, expect } from 'bun:test';
import { fixture, cli, leaf, type Fixture } from './helpers';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { yaml, fakeAkrogon, leafTempRoot, holding, registerTemp } from './helpers';
import { command } from '../src/shell';

test('dbg close-pack next', async () => {
  const f: Fixture = await fixture();
  const env = fakeAkrogon(f).env;
  yaml(resolve(f.root, 'issues/config.yaml'), { env: ['AKROGON_HOME','AKROGON_LEAF_TEMP_ROOT'], checks: {}, grounding: 'none' });
  const worktree = resolve(f.home, 'wt', 'root-racer');
  await command(['git', 'worktree', 'add', '-b', 'root-racer', worktree, 'origin/main'], f.root);
  leaf(f, 'root-racer', 'merge', { ...holding(f), worktree }, 'racing');
  const owner = resolve(f.root, 'issues/open/racing');
  const result = await cli(f, ['run-check', '--holder', owner, '--', 'sh', '-c', 'echo root-output; akrogon phase root-racer merged'], f.root,
    { ...env, AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f) });
  console.log('run-check code', result.code);
  const next = await cli(f, ['next'], f.root, env);
  console.log('next code', next.code);
  console.log('next stdout', next.stdout);
  console.log('next stderr', next.stderr);
  f.clean();
}, 30000);
