import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

interface Reply {
  readonly status: number;
  readonly body: string;
  readonly networkError?: string;
  readonly bodyError?: string;
}
interface Scenario {
  readonly secrets: string | null;
  readonly targets: readonly string[];
  readonly replies: readonly Reply[];
  readonly payload?: string;
}
interface RequestTrace {
  readonly url: string;
  readonly body: string;
}
const traceSchema: z.ZodType<RequestTrace> = z.strictObject({ url: z.string(), body: z.string() });

interface Result {
  readonly exitCode: number;
  readonly output: string;
  readonly requests: readonly RequestTrace[];
  readonly files: readonly string[];
}

const sender: string = join(import.meta.dir, 'discord-send.ts');
const primary: string = 'https://discord.com/api/webhooks/123456/primary-secret';
const secondary: string = 'https://discord.com/api/webhooks/654321/secondary-secret';
const payload: string = JSON.stringify({ summary: 'Project: Search works', whats_new: ['Search finds saved items.'] });

async function run(scenario: Scenario): Promise<Result> {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-broadcast-'));
  try {
    mkdirSync(join(root, '.config/akrogon'), { recursive: true });
    if (scenario.secrets !== null) writeFileSync(join(root, '.config/akrogon/env'), scenario.secrets);
    writeFileSync(join(root, 'requests.jsonl'), '');
    const boundary: string = join(root, 'boundary.ts');
    writeFileSync(boundary, `
      import { appendFileSync } from 'node:fs';
      const replies = ${JSON.stringify(scenario.replies)};
      let index = 0;
      globalThis.fetch = async (url, init) => {
        appendFileSync(${JSON.stringify(join(root, 'requests.jsonl'))}, JSON.stringify({ url: String(url), body: init.body }) + '\\n');
        const reply = replies[index++];
        if (!reply) throw new Error('Unexpected external request');
        if (reply.networkError) throw new TypeError(reply.networkError);
        const body = reply.bodyError
          ? new ReadableStream({ start(controller) { controller.error(new TypeError(reply.bodyError)); } })
          : reply.status === 204 ? null : reply.body;
        return new Response(body, { status: reply.status });
      };
      const { main } = await import(${JSON.stringify(sender)});
      await main(${JSON.stringify(join(root, '.config/akrogon/env'))});
    `);
    const child: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn({
      cmd: [process.execPath, boundary, ...scenario.targets.flatMap((target: string): string[] => ['--target', target])],
      cwd: root,
      env: { ...process.env, PRIMARY: secondary },
      stdin: 'pipe', stdout: 'pipe', stderr: 'pipe',
    });
    child.stdin.write(scenario.payload ?? payload);
    child.stdin.end();
    const [stdout, stderr, exitCode]: [string, string, number] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    return {
      exitCode,
      output: stdout + stderr,
      requests: readFileSync(join(root, 'requests.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((line: string): RequestTrace => traceSchema.parse(JSON.parse(line))),
      files: readdirSync(root, { recursive: true, encoding: 'utf8' }).sort(),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('delivers one message to configured targets using only the external file, with no record', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY="${primary}"\nSECONDARY=${secondary}\n`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [{ status: 204, body: '' }, { status: 204, body: '' }],
  });
  expect(result.exitCode, result.output).toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, secondary]);
  expect(JSON.parse(result.requests[0]!.body)).toEqual({ content: 'Project: Search works\n\n- Search finds saved items.' });
  expect(result.files).toEqual(['.config', '.config/akrogon', '.config/akrogon/env', 'boundary.ts', 'requests.jsonl']);
});

test('refuses missing secrets, invalid routes and empty targets before sending', async (): Promise<void> => {
  for (const scenario of [
    { secrets: null, targets: ['PRIMARY'] },
    { secrets: `SECONDARY=${secondary}`, targets: ['PRIMARY'] },
    { secrets: 'PRIMARY=http://localhost/secret', targets: ['PRIMARY'] },
    { secrets: `PRIMARY=${primary}`, targets: [] },
  ]) {
    const result: Result = await run({ ...scenario, replies: [] });
    expect(result.exitCode).not.toBe(0);
    expect(result.requests).toEqual([]);
    expect(result.output).not.toContain(primary);
  }
});

test('validates the whole message and all targets before any delivery', async (): Promise<void> => {
  for (const invalid of [
    JSON.stringify({ summary: '', whats_new: ['item'] }),
    JSON.stringify({ summary: 'Title', whats_new: [] }),
    JSON.stringify({ summary: 'Title', whats_new: ['a'.repeat(2000)] }),
  ]) {
    const result: Result = await run({ secrets: `PRIMARY=${primary}`, targets: ['PRIMARY'], replies: [], payload: invalid });
    expect(result.exitCode).not.toBe(0);
    expect(result.requests).toEqual([]);
  }
  const missing: Result = await run({ secrets: `PRIMARY=${primary}`, targets: ['PRIMARY', 'SECONDARY'], replies: [] });
  expect(missing.exitCode).not.toBe(0);
  expect(missing.requests).toEqual([]);
});

test('retries only the failed target once and does not resend a successful target', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [{ status: 204, body: '' }, { status: 500, body: 'busy' }, { status: 204, body: '' }],
  });
  expect(result.exitCode, result.output).toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, secondary, secondary]);
  expect(result.output).toContain('500');
});

test('surfaces the final response after two failures, redacts secrets and still attempts other targets', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [{ status: 500, body: primary }, { status: 429, body: 'primary-secret rejected' }, { status: 204, body: '' }],
  });
  expect(result.exitCode).not.toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, primary, secondary]);
  expect(result.output).toContain('429');
  expect(result.output).toContain('rejected');
  expect(result.output).not.toContain('primary-secret');
});

test('network failures receive one retry without exposing webhook credentials', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}`, targets: ['PRIMARY'],
    replies: [{ status: 0, body: '', networkError: `Failed to fetch ${primary}` }, { status: 204, body: '' }],
  });
  expect(result.exitCode, result.output).toBe(0);
  expect(result.requests).toHaveLength(2);
  expect(result.output).not.toContain('primary-secret');
});


test('retries a failed response body and continues to the next target', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [
      { status: 500, body: '', bodyError: `Connection reset reading ${primary}` },
      { status: 204, body: '' },
      { status: 204, body: '' },
    ],
  });
  expect(result.exitCode, result.output).toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, primary, secondary]);
  expect(result.output).toContain('500');
  expect(result.output).toContain('PRIMARY');
  expect(result.output).toContain('Project: Search works');
  expect(result.output).not.toContain('primary-secret');
});

test('stops after one response-body retry, preserves final context and attempts remaining targets', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [
      { status: 500, body: '', bodyError: `Connection reset reading ${primary}` },
      { status: 502, body: '', bodyError: 'Final reset primary-secret' },
      { status: 204, body: '' },
    ],
  });
  expect(result.exitCode).not.toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, primary, secondary]);
  expect(result.output).toContain('502');
  expect(result.output).toContain('Final reset');
  expect(result.output).toContain('PRIMARY');
  expect(result.output).toContain('Project: Search works');
  expect(result.output).not.toContain('primary-secret');
});
