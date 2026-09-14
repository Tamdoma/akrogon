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

interface FailureTrace {
  readonly target: string;
  readonly status: number | null;
  readonly body: string;
  readonly request: { readonly content: string };
  readonly delivered: number;
  readonly failed: number;
  readonly unattempted: number;
}
const failureSchema: z.ZodType<FailureTrace> = z.strictObject({
  target: z.string(), status: z.number().nullable(), body: z.string(),
  request: z.strictObject({ content: z.string() }),
  delivered: z.number(), failed: z.number(), unattempted: z.number(),
});

interface Result {
  readonly exitCode: number;
  readonly output: string;
  readonly requests: readonly RequestTrace[];
  readonly files: readonly string[];
  readonly failures: readonly FailureTrace[];
}

const sender: string = join(import.meta.dir, 'discord-send.ts');
const primary: string = 'https://discord.com/api/webhooks/123456/primary-secret';
const secondary: string = 'https://discord.com/api/webhooks/654321/secondary-secret';
const today: string = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
const twoChunks: string[] = [
  `## 🧪 Title (${today})\n\n**Before**\n- ${'a'.repeat(1500)}`,
  `**Now**\n- ${'b'.repeat(1500)}`,
];
const twoChunkPayload: string = JSON.stringify({ summary: 'Title', before: ['a'.repeat(1500)], now: ['b'.repeat(1500)] });
const success: Reply = { status: 204, body: '' };
const rejected: Reply = { status: 500, body: 'busy' };
const payload: string = JSON.stringify({ summary: 'Project: Search works', before: ['Saved items were lost.'], now: ['Search finds saved items.'] });

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
      try {
        await main(${JSON.stringify(join(root, '.config/akrogon/env'))});
      } catch (cause) {
        if (!(cause instanceof AggregateError)) throw cause;
        console.log('FAILURES:' + JSON.stringify(cause.errors.map((error) => error.message)));
        throw cause;
      }
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
      failures: stdout.split('\n').filter((line: string): boolean => line.startsWith('FAILURES:'))
        .flatMap((line: string): string[] => z.array(z.string()).parse(JSON.parse(line.slice('FAILURES:'.length))))
        .map((failure: string): FailureTrace => failureSchema.parse(JSON.parse(failure))),
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
  expect(JSON.parse(result.requests[0]!.body)).toEqual({
    content: `## 🧪 Project: Search works (${today})\n\n**Before**\n- Saved items were lost.\n\n**Now**\n- Search finds saved items.`,
  });
  expect(JSON.parse(result.requests[0]!.body).content).not.toContain(`**${'Next'}**`);
  expect(result.files).toEqual(['.config', '.config/akrogon', '.config/akrogon/env', 'boundary.ts', 'requests.jsonl']);
});

test('splits a long message into several deliveries at section boundaries', async (): Promise<void> => {
  const long: string = JSON.stringify({ summary: 'Title', before: ['a'.repeat(1500)], now: ['b'.repeat(1500)] });
  const result: Result = await run({
    secrets: `PRIMARY=${primary}`, targets: ['PRIMARY'], payload: long,
    replies: [{ status: 204, body: '' }, { status: 204, body: '' }],
  });
  expect(result.exitCode, result.output).toBe(0);
  const bodies: string[] = result.requests.map((request): string => JSON.parse(request.body).content);
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toStartWith(`## 🧪 Title (${today})\n\n**Before**`);
  expect(bodies[1]).toStartWith('**Now**');
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
    JSON.stringify({ summary: '', before: ['a'], now: ['b'] }),
    JSON.stringify({ summary: 'Title', before: [], now: ['b'] }),
    JSON.stringify({ summary: 'Title', before: ['a'] }),
    JSON.stringify({ summary: 'Title', before: ['a'], now: ['b'], next: ['c'] }),
    JSON.stringify({ summary: 'Title', before: ['a'.repeat(2000)], now: ['b'] }),
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
  expect(result.failures).toEqual([{
    target: 'PRIMARY', status: 429, body: '[redacted token] rejected',
    request: JSON.parse(result.requests[1]!.body), delivered: 0, failed: 1, unattempted: 0,
  }]);
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
  expect(result.failures).toEqual([{
    target: 'PRIMARY', status: 502, body: 'Final reset [redacted token]',
    request: JSON.parse(result.requests[1]!.body), delivered: 0, failed: 1, unattempted: 0,
  }]);
  expect(result.output).toContain('502');
  expect(result.output).toContain('Final reset');
  expect(result.output).toContain('PRIMARY');
  expect(result.output).toContain('Project: Search works');
  expect(result.output).not.toContain('primary-secret');
});


test('reports partial delivery and sends every chunk to the remaining target', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'], payload: twoChunkPayload,
    replies: [success, { status: 500, body: 'busy' }, { status: 429, body: 'primary-secret rejected' }, success, success],
  });
  expect(result.exitCode).not.toBe(0);
  expect(result.requests).toEqual([
    ...[twoChunks[0], twoChunks[1], twoChunks[1]].map((content: string): RequestTrace => ({ url: primary, body: JSON.stringify({ content }) })),
    ...twoChunks.map((content: string): RequestTrace => ({ url: secondary, body: JSON.stringify({ content }) })),
  ]);
  expect(result.failures).toEqual([{
    target: 'PRIMARY', status: 429, body: '[redacted token] rejected', request: { content: twoChunks[1] },
    delivered: 1, failed: 1, unattempted: 0,
  }]);
  expect(result.output).toContain('broadcast retry');
  expect(result.output).toContain('broadcast delivered');
  expect(result.output).not.toContain('primary-secret');
  expect(result.files).toEqual(['.config', '.config/akrogon', '.config/akrogon/env', 'boundary.ts', 'requests.jsonl']);
});

for (const delivered of [0, 1]) {
  test(`reports exhaustion after ${delivered} completed chunks`, async (): Promise<void> => {
    const result: Result = await run({
      secrets: `PRIMARY=${primary}`, targets: ['PRIMARY'], payload: twoChunkPayload,
      replies: [...Array<Reply>(delivered).fill(success), rejected, rejected],
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.requests).toEqual([...twoChunks.slice(0, delivered), twoChunks[delivered], twoChunks[delivered]]
      .map((content: string): RequestTrace => ({ url: primary, body: JSON.stringify({ content }) })));
    expect(result.failures).toEqual([{
      target: 'PRIMARY', status: 500, body: 'busy', request: { content: twoChunks[delivered] },
      delivered, failed: 1, unattempted: 1 - delivered,
    }]);
  });
}

test('counts recovered retries once and keeps failing targets independent', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'], payload: twoChunkPayload,
    replies: [rejected, success, rejected, rejected, success, rejected, rejected],
  });
  expect(result.exitCode).not.toBe(0);
  expect(result.requests).toEqual([
    ...[twoChunks[0], twoChunks[0], twoChunks[1], twoChunks[1]].map((content: string): RequestTrace => ({ url: primary, body: JSON.stringify({ content }) })),
    ...[twoChunks[0], twoChunks[1], twoChunks[1]].map((content: string): RequestTrace => ({ url: secondary, body: JSON.stringify({ content }) })),
  ]);
  expect(result.failures).toEqual([
    { target: 'PRIMARY', status: 500, body: 'busy', request: { content: twoChunks[1] }, delivered: 1, failed: 1, unattempted: 0 },
    { target: 'SECONDARY', status: 500, body: 'busy', request: { content: twoChunks[1] }, delivered: 1, failed: 1, unattempted: 0 },
  ]);
});

test('reports exhausted network retries with redacted final context', async (): Promise<void> => {
  const result: Result = await run({
    secrets: `PRIMARY=${primary}\nSECONDARY=${secondary}`, targets: ['PRIMARY', 'SECONDARY'],
    replies: [
      { status: 0, body: '', networkError: `Failed to fetch ${primary}` },
      { status: 0, body: '', networkError: 'Final failure primary-secret' },
      success,
    ],
  });
  expect(result.exitCode).not.toBe(0);
  expect(result.requests.map((request): string => request.url)).toEqual([primary, primary, secondary]);
  expect(result.failures).toEqual([{
    target: 'PRIMARY', status: null, body: 'Final failure [redacted token]',
    request: JSON.parse(result.requests[1]!.body), delivered: 0, failed: 1, unattempted: 0,
  }]);
  expect(result.output).toContain('broadcast retry');
  expect(result.output).not.toContain('primary-secret');
});
