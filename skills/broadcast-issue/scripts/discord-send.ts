#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs, parseEnv } from 'node:util';
import { z } from 'zod';

interface Message {
  readonly summary: string;
  readonly before: readonly string[];
  readonly now: readonly string[];
}
interface Webhook {
  readonly name: string;
  readonly url: string;
  readonly token: string;
}
interface ChunkFailure {
  readonly target: string;
  readonly status: number | null;
  readonly body: string;
  readonly request: { readonly content: string };
}

interface Failure extends ChunkFailure {
  readonly delivered: number;
  readonly failed: number;
  readonly unattempted: number;
}

const bullets: z.ZodType<readonly string[]> = z.array(z.string().trim().min(1)).min(1);
const messageSchema: z.ZodType<Message> = z.strictObject({
  summary: z.string().trim().min(1).max(200),
  before: bullets,
  now: bullets,
});
const chunkSchema: z.ZodType<string> = z.string().max(2000);

function section(title: string, items: readonly string[]): string {
  return `**${title}**\n${items.map((item: string): string => `- ${item}`).join('\n')}`;
}

function stamp(date: Date): string {
  const two = (n: number): string => String(n).padStart(2, '0');
  return `${two(date.getMonth() + 1)}/${two(date.getDate())}/${two(date.getFullYear() % 100)}`;
}

function chunks(message: Message): string[] {
  const parts: string[] = [
    `## 🧪 ${message.summary} (${stamp(new Date())})`,
    section('Before', message.before),
    section('Now', message.now),
  ];
  return parts.reduce((acc: string[], part: string): string[] => {
    const last: string | undefined = acc.at(-1);
    const joined: string = last === undefined ? part : `${last}\n\n${part}`;
    return last !== undefined && joined.length <= 2000 ? [...acc.slice(0, -1), joined] : [...acc, chunkSchema.parse(part)];
  }, []);
}
const targetsSchema: z.ZodType<string[]> = z.array(z.string().regex(/^[A-Z_][A-Z0-9_]*$/)).min(1)
  .refine((names: string[]): boolean => new Set(names).size === names.length, 'Duplicate broadcast target');
const webhookSchema: z.ZodType<string> = z.url().refine((value: string): boolean => {
  const url: URL = new URL(value);
  return url.protocol === 'https:' && ['discord.com', 'discordapp.com'].includes(url.hostname)
    && url.username === '' && url.password === '' && url.port === '' && url.search === '' && url.hash === ''
    && /^\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/.test(url.pathname);
});

class DeliveryError extends Error {
  constructor(readonly failure: ChunkFailure) {
    super(JSON.stringify(failure));
    this.name = 'DeliveryError';
  }
}

function readWebhooks(names: readonly string[], envFile: string): Webhook[] {
  const values: NodeJS.Dict<string> = parseEnv(readFileSync(envFile, 'utf8'));
  return names.map((name: string): Webhook => {
    const result: z.ZodSafeParseResult<string> = webhookSchema.safeParse(values[name]);
    if (!result.success) throw new Error(`Missing or invalid broadcast webhook ${name} in ${envFile}`);
    return { name, url: result.data, token: result.data.slice(result.data.lastIndexOf('/') + 1) };
  });
}

function redact(value: string, webhook: Webhook): string {
  return value.replaceAll(webhook.url, '[redacted webhook]').replaceAll(webhook.token, '[redacted token]');
}

async function deliver(webhook: Webhook, content: string): Promise<void> {
  const request: { readonly content: string } = { content };
  const response: Response = await fetch(webhook.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    redirect: 'error',
  }).catch((cause: Error): never => {
    if (!(cause instanceof TypeError)) throw cause;
    throw new DeliveryError({ target: webhook.name, status: null, body: redact(cause.message, webhook), request });
  });
  if (!response.ok) {
    const body: string = await response.text().catch((cause: Error): never => {
      if (!(cause instanceof TypeError)) throw cause;
      throw new DeliveryError({ target: webhook.name, status: response.status, body: redact(cause.message, webhook), request });
    });
    throw new DeliveryError({ target: webhook.name, status: response.status, body: redact(body, webhook), request });
  }
}

async function sendWithRetry(webhook: Webhook, contents: readonly string[]): Promise<void> {
  let delivered: number = 0;
  try {
    for (const content of contents) {
      try {
        await deliver(webhook, content);
      } catch (cause) {
        if (!(cause instanceof DeliveryError)) throw cause;
        console.warn({ event: 'broadcast retry', attempt: 1, ...cause.failure });
        await deliver(webhook, content);
      }
      delivered += 1;
    }
  } catch (cause) {
    if (!(cause instanceof DeliveryError)) throw cause;
    const failure: Failure = { ...cause.failure, delivered, failed: 1, unattempted: contents.length - delivered - 1 };
    throw new DeliveryError(failure);
  }
}

export async function main(envFile: string): Promise<void> {
  const args: ReturnType<typeof parseArgs> = parseArgs({
    args: process.argv.slice(2),
    options: { target: { type: 'string', multiple: true } },
    strict: true,
    allowPositionals: false,
  });
  const targets: string[] = targetsSchema.parse(args.values.target);
  const message: Message = messageSchema.parse(JSON.parse(await Bun.stdin.text()));
  const contents: string[] = chunks(message);
  const webhooks: Webhook[] = readWebhooks(targets, envFile);
  const failures: DeliveryError[] = [];
  for (const webhook of webhooks) {
    try {
      await sendWithRetry(webhook, contents);
      console.log({ event: 'broadcast delivered', target: webhook.name });
    } catch (cause) {
      if (!(cause instanceof DeliveryError)) throw cause;
      failures.push(cause);
    }
  }
  if (failures.length > 0) throw new AggregateError(failures, 'Broadcast delivery failed after one retry');
}

if (import.meta.main) await main(join(homedir(), '.config', 'akrogon', 'env'));
