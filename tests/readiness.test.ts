import { test, expect } from 'bun:test';
import { realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { GlobalConfig } from '../src/config';
import { gaps, holderRoot, readinessSchema, readReadiness, type Gap, type Readiness } from '../src/readiness';
import { fixture, yaml, type Fixture } from './helpers';

const complete: z.input<typeof readinessSchema> = {
  inputs: [
    {
      kind: 'env',
      name: 'API_KEY',
      holder: 'repo',
      purpose: 'authenticate to service',
      consumers: ['integration tests'],
      steps: 'copy from the team vault',
      source: 'team vault',
      done: 'API_KEY set in .env',
    },
    {
      kind: 'file',
      name: 'cert.pem',
      holder: 'repo',
      purpose: 'tls client certificate',
      consumers: ['deploy'],
      steps: 'request from ca',
      source: 'internal ca',
      done: 'cert.pem present',
    },
  ],
  produces: [
    {
      name: 'build artifact',
      holder: 'repo',
      consumers: ['ci'],
      save: { entry: 'builds', revision: 'v1', args: ['--release'], value_source: 'ci output' },
    },
  ],
  grants: [
    {
      approved: { by: 'ivan', date: '2026-09-10', answer: 'yes' },
      principal: 'agent',
      account: 'svc',
      credential: { name: 'TOKEN', holder: 'repo' },
      targets: ['api'],
      fixtures: [
        {
          account: 'svc',
          purpose: 'seed data',
          marker: 'akrogon-test',
          naming: 'akrogon-test-{n}',
          count: 1,
          cleanup: [{ step: 'delete fixture', identity: 'by marker' }],
          absence_check: 'fixture list is empty',
        },
      ],
      operations: ['read'],
      effects: 'reads data',
      bounds: 'read only',
      stop_line: 'no writes',
    },
  ],
  retained: [
    {
      resources: ['vm-1'],
      purpose: 'demo environment',
      owner: 'ivan',
      remove_by: '2026-10-01',
      cost: '1 usd/day',
      exposure: 'private network',
      cleanup: { identity: 'tag:demo', route: 'console' },
      reason: 'demo still needed',
    },
  ],
  proofs: [
    {
      operation: 'deploy',
      command: 'make deploy',
      identity: 'ci bot',
      target: 'staging',
      version: 'v1',
      date: '2026-09-10',
      result: 'ok',
      cleanup: 'none needed',
      limits: 'staging only',
      record: 'ci log',
    },
  ],
};

function global(f: Fixture): GlobalConfig {
  return {
    max_active: 3,
    slots: {
      a: { harness: 'fake', model: 'm', effort: 'high' },
      b: { harness: 'fake', model: 'm', effort: 'medium' },
    },
    harnesses: { fake: 'fake --model {model}' },
    repos: { repo: f.root },
    toolkits: {},
  };
}

test('schema accepts a complete holding with every section non-empty', () => {
  const readiness: Readiness = readinessSchema.parse(complete);
  expect(readiness).toMatchObject(complete);
});

test('schema refuses an unknown top-level key', () => {
  expect(() => readinessSchema.parse({ ...complete, extra: [] })).toThrow(z.ZodError);
});

test('schema refuses a whitespace-only text field', () => {
  expect(() => readinessSchema.parse({ ...complete, inputs: [{ ...complete.inputs[0], purpose: '   ' }] })).toThrow(
    z.ZodError,
  );
});

test('schema refuses a fixture without a cleanup step', () => {
  const fixtureless: object = {
    ...complete,
    grants: [
      {
        ...complete.grants[0],
        fixtures: [{ ...complete.grants[0].fixtures[0], cleanup: [] }],
      },
    ],
  };
  expect(() => readinessSchema.parse(fixtureless)).toThrow(z.ZodError);
});

test('schema refuses a retained record without exposure', () => {
  const { exposure, ...rest }: { exposure: string } & object = complete.retained[0];
  expect(() => readinessSchema.parse({ ...complete, retained: [rest] })).toThrow(z.ZodError);
});

test('schema refuses an unknown input kind', () => {
  expect(() => readinessSchema.parse({ ...complete, inputs: [{ ...complete.inputs[0], kind: 'secret' }] })).toThrow(
    z.ZodError,
  );
});

test('holderRoot resolves registered keys and absolute paths, refuses the rest', async () => {
  const f: Fixture = await fixture();
  try {
    const g: GlobalConfig = global(f);
    expect(holderRoot(g, 'repo')).toBe(realpathSync(f.root));
    const dir: string = resolve(f.home, 'outside');
    expect(holderRoot(g, dir)).toBe(dir);
    expect(() => holderRoot(g, 'ghost')).toThrow(/ghost/);
    expect(() => holderRoot(g, 'rel/path')).toThrow(/rel\/path/);
  } finally {
    f.clean();
  }
});

test('readReadiness returns null without readiness.yaml', async () => {
  const f: Fixture = await fixture();
  try {
    expect(readReadiness(f.root)).toBeNull();
  } finally {
    f.clean();
  }
});

test('readReadiness returns the parsed readiness for a valid file', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'readiness.yaml'), complete);
    expect(readReadiness(f.root)).toEqual(readinessSchema.parse(complete));
  } finally {
    f.clean();
  }
});

test('readReadiness throws an error naming the file for malformed yaml', async () => {
  const f: Fixture = await fixture();
  try {
    const file: string = resolve(f.root, 'readiness.yaml');
    writeFileSync(file, 'a: [unclosed\n');
    expect(() => readReadiness(f.root)).toThrow(file);
  } finally {
    f.clean();
  }
});

test('readReadiness throws an error naming the file for schema failure', async () => {
  const f: Fixture = await fixture();
  try {
    const file: string = resolve(f.root, 'readiness.yaml');
    yaml(file, { inputs: [] });
    expect(() => readReadiness(f.root)).toThrow(file);
  } finally {
    f.clean();
  }
});

test('gaps reports an env input when .env is absent, the name is missing or the value is blank', async () => {
  const f: Fixture = await fixture();
  try {
    const g: GlobalConfig = global(f);
    const input: Readiness['inputs'][number] = readinessSchema.parse(complete).inputs[0];
    const readiness: Readiness = readinessSchema.parse({ ...complete, inputs: [input] });
    const gap: Gap = { kind: 'env', name: 'API_KEY', holder: 'repo', steps: input.steps };

    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(resolve(f.root, '.env'), 'OTHER=1\n');
    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(resolve(f.root, '.env'), 'API_KEY=\nOTHER=1\n');
    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(resolve(f.root, '.env'), 'API_KEY="   "\n');
    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(resolve(f.root, '.env'), 'API_KEY=abc123\n');
    expect(gaps(g, readiness)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('gaps reports a file input when the file is absent or zero bytes', async () => {
  const f: Fixture = await fixture();
  try {
    const g: GlobalConfig = global(f);
    const input: Readiness['inputs'][number] = readinessSchema.parse(complete).inputs[1];
    const readiness: Readiness = readinessSchema.parse({ ...complete, inputs: [input] });
    const gap: Gap = { kind: 'file', name: 'cert.pem', holder: 'repo', steps: input.steps };
    const file: string = resolve(f.root, 'cert.pem');

    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(file, '');
    expect(gaps(g, readiness)).toEqual([gap]);

    writeFileSync(file, 'PEM DATA\n');
    expect(gaps(g, readiness)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('produces, grants, retained and proofs never produce gaps', async () => {
  const f: Fixture = await fixture();
  try {
    const g: GlobalConfig = global(f);
    const readiness: Readiness = readinessSchema.parse({ ...complete, inputs: [] });
    expect(gaps(g, readiness)).toEqual([]);
  } finally {
    f.clean();
  }
});
