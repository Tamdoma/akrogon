import { test, expect } from 'bun:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readGlobal } from '../src/config';
import { gaps, readReadiness, readinessSchema, type Gap, type Readiness } from '../src/readiness';
import { fixture, type Fixture } from './helpers';

function readinessBlock(): string {
  const md: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/assets/shapes.md'), 'utf8');
  const heading: number = md.indexOf('### readiness.yaml');
  if (heading === -1) throw new Error('shapes.md: missing "### readiness.yaml" heading');
  const open: number = md.indexOf('```yaml', heading);
  if (open === -1) throw new Error('shapes.md: missing yaml fence under "### readiness.yaml"');
  const body: number = open + '```yaml'.length;
  const close: number = md.indexOf('```', body);
  if (close === -1) throw new Error('shapes.md: unclosed yaml fence under "### readiness.yaml"');
  return md.slice(body, close).trim();
}

test('shapes.md readiness.yaml example parses against readinessSchema', () => {
  const readiness: Readiness = readinessSchema.parse(Bun.YAML.parse(readinessBlock()));
  expect(readiness.inputs.length).toBeGreaterThan(0);
  expect(readiness.produces.length).toBeGreaterThan(0);
  expect(readiness.grants.length).toBeGreaterThan(0);
  expect(readiness.retained.length).toBeGreaterThan(0);
  expect(readiness.proofs.length).toBeGreaterThan(0);
  expect([...new Set(readiness.inputs.map((input: Readiness['inputs'][number]) => input.kind))].sort()).toEqual([
    'env',
    'file',
  ]);
  expect(readiness.grants[0].fixtures.length).toBeGreaterThan(0);
});

test('draft readiness.yaml gaps without state.yaml', async () => {
  const f: Fixture = await fixture();
  const prev: string | undefined = process.env.AKROGON_HOME;
  try {
    const readiness: Readiness = readinessSchema.parse(Bun.YAML.parse(readinessBlock()));
    const env: Readiness['inputs'][number] | undefined = readiness.inputs.find(
      (input: Readiness['inputs'][number]) => input.kind === 'env',
    );
    const file: Readiness['inputs'][number] | undefined = readiness.inputs.find(
      (input: Readiness['inputs'][number]) => input.kind === 'file',
    );
    if (env === undefined || file === undefined) throw new Error('example missing env or file input');

    const draft: string = resolve(f.root, 'issues/open/draft');
    mkdirSync(draft, { recursive: true });
    writeFileSync(resolve(draft, 'readiness.yaml'), readinessBlock());
    writeFileSync(resolve(f.root, '.env'), `${env.name}=x\n`);
    writeFileSync(resolve(f.root, file.name), 'PEM DATA\n');

    process.env.AKROGON_HOME = f.home;
    const parsed: Readiness | null = readReadiness(draft);
    if (parsed === null) throw new Error('readReadiness returned null for a draft without state.yaml');
    expect(gaps(readGlobal(), parsed)).toEqual([]);

    writeFileSync(resolve(f.root, '.env'), 'OTHER=1\n');
    const missing: Gap = { kind: 'env', name: 'EXAMPLE_API_TOKEN', holder: 'repo', steps: env.steps };
    expect(gaps(readGlobal(), parsed)).toEqual([missing]);
  } finally {
    if (prev === undefined) delete process.env.AKROGON_HOME;
    else process.env.AKROGON_HOME = prev;
    f.clean();
  }
});
