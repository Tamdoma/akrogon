import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { yaml, type Fixture } from './helpers';

export function register(f: Fixture, repos: Record<string, string>): void {
  const global: object = Bun.YAML.parse(readFileSync(resolve(f.home, 'config.yaml'), 'utf8')) as object;
  yaml(resolve(f.home, 'config.yaml'), { ...global, repos });
}

export function event(
  slug: string,
  to: string,
  minutes: number,
  marker: string = '',
  now: number = Date.now(),
): string {
  return JSON.stringify({
    ts: new Date(now - minutes * 60000).toISOString(),
    repo: 'repo',
    slug,
    from: 'implement',
    to,
    slot: 'B',
    attempts: { A: 0, B: 1 },
    fix_rounds: 0,
    verdict: {},
    head: marker,
    diff: '',
    session: null,
  });
}

export function mergeRecord(slug: string, minutes: number, now: number = Date.now()): string {
  return JSON.stringify({
    ts: new Date(now - minutes * 60000).toISOString(),
    repo: 'repo',
    slug,
    from: 'check.review',
    to: 'merge',
    slot: 'B',
    attempts: { A: 0, B: 0 },
    fix_rounds: 0,
    verdict: {},
    head: '0123456789abcdef0123456789abcdef01234567',
    diff: '',
    session: null,
  });
}

export function log(f: Fixture, lines: string[]): void {
  writeFileSync(resolve(f.root, 'issues/log.jsonl'), lines.join('\n') + '\n');
}

export function prompt(
  slug: string,
  minutes: number,
  outcome: 'delivered' | 'failed' = 'delivered',
  now: number = Date.now(),
): string {
  return JSON.stringify({
    kind: 'prompt',
    slug,
    slot: 'A',
    phase: 'plan.synthesis',
    visit: 0,
    session: null,
    outcome,
    ts: new Date(now - minutes * 60000).toISOString(),
    repo: 'repo',
  });
}

export function timings(f: Fixture, lines: string[]): void {
  writeFileSync(resolve(f.root, 'issues/timings.jsonl'), lines.join('\n') + '\n');
}

export function snapshot(path: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(path, { recursive: true, withFileTypes: true }).map((item) => {
      const full: string = resolve(item.parentPath, item.name);
      return [relative(path, full), item.isDirectory() ? 'directory' : readFileSync(full).toString('base64')];
    }),
  );
}

export function needs(slug: string, steps: string = 'ask the vault for FOO'): object {
  return {
    inputs: [
      {
        kind: 'env',
        name: 'FOO',
        holder: 'repo',
        purpose: 'authenticate',
        consumers: [slug],
        steps,
        source: 'vault',
        done: 'FOO set in .env',
      },
    ],
    produces: [],
    grants: [],
    retained: [],
    proofs: [],
  };
}

export function statStart(pid: number): string {
  const stat: string = readFileSync(`/proc/${pid}/stat`, 'utf8');
  return stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
}

export function seedRunRecord(f: Fixture, fields: Record<string, unknown>): string {
  const dir: string = resolve(f.home, 'runs');
  mkdirSync(dir, { recursive: true });
  const runId: string = (fields.run as string | undefined) ?? randomUUID();
  const token: string = randomUUID();
  const record: Record<string, unknown> = {
    token_hash: createHash('sha256').update(token).digest('hex'),
    pid: process.pid,
    start_time: statStart(process.pid),
    boot_id: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(),
    repo: 'repo',
    leaf: 'seeded',
    check: 'test',
    state: 'live',
    full: true,
    since: new Date().toISOString(),
    run: runId,
    slice: 'akrogon.slice',
    scope: 'seeded.scope',
    unit: `akrogon-run-${runId}.scope`,
    ...fields,
  };
  writeFileSync(resolve(dir, `${record.token_hash as string}.yaml`), Bun.YAML.stringify(record));
  return runId;
}
