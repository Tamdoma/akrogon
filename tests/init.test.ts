import { test, expect } from 'bun:test';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { fixture, cli, yaml, type Fixture } from './helpers';

test('init writes proposal, registration and toolkit and preserves repeated user files', async () => {
  const f: Fixture = await fixture();
  try {
    const proposal: string = resolve(f.home, 'proposal.yaml');
    yaml(proposal, { checks: { test: 'bun test' }, implement: 'inline' });
    expect((await cli(f, ['init', '--from', proposal, '--toolkit', 'typescript=bun:test'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({ implement: 'inline', remote: 'origin' });
    expect(Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8'))).toMatchObject({ repos: { repo: f.root }, toolkits: { typescript: 'bun:test' } });
    const lessons: string = resolve(f.root, 'learnings/LESSONS.md');
    expect(readFileSync(lessons, 'utf8')).toBe('# Lessons\n');
    writeFileSync(lessons, '# Lessons\nExisting lesson\n');
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(readFileSync(lessons, 'utf8')).toContain('Existing lesson');
    expect(readFileSync(resolve(f.root, '.gitignore'), 'utf8').split('\n').filter(x => x === '.lock')).toHaveLength(1);
    const before: string = readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8');
    yaml(proposal, { scripts_dir: 'retired' });
    expect((await cli(f, ['init', '--from', proposal])).code).not.toBe(0);
    expect(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8')).toBe(before);
    expect(existsSync(resolve(f.root, 'package.json'))).toBe(false);
    rmSync(resolve(f.root, 'issues/config.yaml'));
    expect((await cli(f, ['init'])).code).toBe(0);
    expect(Bun.YAML.parse(readFileSync(resolve(f.root, 'issues/config.yaml'), 'utf8'))).toMatchObject({ implement: 'subagents', checks: {} });
  } finally { f.clean(); }
});
