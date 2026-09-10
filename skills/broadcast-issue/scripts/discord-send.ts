#!/usr/bin/env bun
/**
 * DISCORD WEBHOOK SENDER
 *
 * Sends formatted issue lifecycle updates to Discord.
 * Uses this skill's .env store plus project issues/config.yaml routing.
 * Supports multiple configured webhook environment names for broadcasting to multiple channels.
 *
 * Usage:
 *   echo '{"summary":"...","whats_new":["...","...","..."]}' | bun scripts/discord-send.ts --target issue:<slug>
 *
 * Or with command line argument:
 *   bun scripts/discord-send.ts --target issue:<slug> '{"summary":"...","whats_new":["...","...","..."]}'
 *
 * Flags:
 *   --dry-run  Preview message without sending
 *   --non-lifecycle  Send an explicit non-lifecycle operator alert without a target
 *
 * Environment:
 *   Configure env-var names in issues/config.yaml:
 *     broadcast:
 *       discord:
 *         webhook_env:
 *           - DISCORD_WEBHOOK_URL
 *
 *   Store matching secret values in this skill's .env file.
 *
 * Exit codes:
 *   0 - Success (all webhooks delivered)
 *   1 - Error (configuration, validation, or any delivery failure)
 */

import * as https from 'node:https';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { BroadcastTargetError, assertBroadcastTargetAllowed } from './broadcast-target';
import { BROADCAST_LOG_RELATIVE_PATH, recordBroadcastDelivery, deliveredWebhooks } from './broadcast-record';

import type { YamlNode } from '../../../issues/.scripts/lifecycle/run-status-protocol';
interface Message {
  readonly summary: string;
  readonly whats_new: readonly YamlNode[];
}
interface Webhook {
  readonly name: string;
  readonly url: string;
}
type DiscordError = Error & { statusCode?: number };
interface DiscordResult {
  readonly success: true;
  readonly statusCode: number;
}
type UrlValidation = { readonly valid: true } | { readonly valid: false; readonly error: string };

const DEFAULT_WEBHOOK_ENV_NAMES = ['DISCORD_WEBHOOK_URL'];
const ENV_PATH = path.join(path.dirname(__dirname), '.env');

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse .env files manually (minimal dependency approach)
 * Falls back to dotenv if available.
 * Loads only the .env file next to the running skill; existing process env values win.
 */
function loadEnv(): void {
  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  try {
    require('dotenv').config({ path: ENV_PATH, override: false, quiet: true });
    return;
  } catch (cause) {
    if (!(cause instanceof Error)) throw cause;
    // dotenv not installed, parse manually
  }

  try {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (cause) {
    if (!(cause instanceof Error)) throw cause;
    const e: Error = cause;
    console.error(`[discord-send] Warning: Could not parse .env at ${ENV_PATH}: ${e.message}`);
  }
}

function findIssuesConfig(startDir: string): string | null {
  let currentDir = startDir;

  while (true) {
    const candidate = path.join(currentDir, 'issues', 'config.yaml');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function getIndent(line: string): number {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function readConfiguredWebhookEnvNames(configPath: string): string[] {
  const lines = fs.readFileSync(configPath, 'utf8').split(/\r?\n/);
  let broadcastIndent = -1;
  let discordIndent = -1;
  let webhookIndent = -1;
  const names = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indent = getIndent(line);

    if (broadcastIndent === -1) {
      if (indent === 0 && trimmed === 'broadcast:') {
        broadcastIndent = indent;
      }
      continue;
    }

    if (indent <= broadcastIndent) {
      break;
    }

    if (discordIndent === -1) {
      if (indent > broadcastIndent && trimmed === 'discord:') {
        discordIndent = indent;
      }
      continue;
    }

    if (indent <= discordIndent) {
      break;
    }

    if (webhookIndent === -1) {
      if (indent > discordIndent && trimmed.startsWith('webhook_env:')) {
        const value = trimmed.slice('webhook_env:'.length).trim();
        if (value) {
          throw new Error(
            `Malformed broadcast.discord.webhook_env in ${configPath}: use block-list entries like "- DISCORD_WEBHOOK_URL"`
          );
        }
        webhookIndent = indent;
      }
      continue;
    }

    if (indent <= webhookIndent) {
      break;
    }

    if (!trimmed.startsWith('- ')) {
      throw new Error(`Malformed broadcast.discord.webhook_env in ${configPath}: expected "- ENV_VAR_NAME"`);
    }

    const name = trimmed.slice(2).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
      throw new Error(`Malformed broadcast.discord.webhook_env in ${configPath}: invalid env var name "${name}"`);
    }

    names.push(name);
  }

  if (webhookIndent === -1) {
    return DEFAULT_WEBHOOK_ENV_NAMES;
  }

  if (names.length === 0) {
    throw new Error(`Malformed broadcast.discord.webhook_env in ${configPath}: at least one env var name is required`);
  }

  return names;
}

function getConfiguredWebhookEnvNames(): string[] {
  const configPath = findIssuesConfig(process.cwd());
  return configPath ? readConfiguredWebhookEnvNames(configPath) : DEFAULT_WEBHOOK_ENV_NAMES;
}

/**
 * Validate webhook URL format
 */
function validateWebhookUrl(url: string, name: string = 'DISCORD_WEBHOOK_URL'): UrlValidation {
  if (!url) {
    return { valid: false, error: `${name} is not set` };
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'discord.com' && parsed.hostname !== 'discordapp.com') {
      return { valid: false, error: `${name}: URL must be a Discord webhook URL` };
    }
    if (!parsed.pathname.startsWith('/api/webhooks/')) {
      return { valid: false, error: `${name}: URL must be a Discord webhook path` };
    }
    return { valid: true };
  } catch (cause) {
    if (!(cause instanceof Error)) throw cause;
    const e: Error = cause;
    return { valid: false, error: `${name}: Invalid URL: ${e.message}` };
  }
}

/**
 * Collect webhook URLs from the env-var names configured in issues/config.yaml.
 */
function collectWebhookUrls(): Webhook[] {
  const webhooks = [];
  const webhookEnvNames = getConfiguredWebhookEnvNames();

  for (const name of webhookEnvNames) {
    const url = process.env[name];
    if (!url) {
      throw new Error(`${name} is not set`);
    }

    webhooks.push({ name, url });
  }

  // Sort by name for consistent ordering
  webhooks.sort((a, b) => a.name.localeCompare(b.name));

  return webhooks;
}

/**
 * Validate input message structure
 */
function validateInput(data: Message): string[] {
  const errors = [];

  if (!data.summary || typeof data.summary !== 'string') {
    errors.push('summary is required and must be a string');
  } else if (data.summary.length > 200) {
    errors.push('summary must be under 200 characters');
  }

  if (Object.prototype.hasOwnProperty.call(data, 'whats_new_nontechie')) {
    errors.push("'whats_new_nontechie' is no longer accepted. Use 'whats_new' instead.");
  }

  if (Object.prototype.hasOwnProperty.call(data, 'whats_new_techie')) {
    errors.push("'whats_new_techie' is no longer accepted. Use 'whats_new' instead.");
  }

  if (!Array.isArray(data.whats_new)) {
    errors.push("'whats_new' is required and must be an array");
  } else if (data.whats_new.length < 1) {
    errors.push("'whats_new' must have at least one item");
  }

  return errors;
}

/**
 * Format message content for Discord
 */
function formatMessage(data: Message, continuation: boolean): string {
  const lines = [];

  // Test tube emoji + summary
  if (!continuation) {
    lines.push(`\uD83E\uDDEA ${data.summary}`);
    lines.push('');
  }
  for (const item of data.whats_new) {
    lines.push(`- ${item}`);
  }

  return lines.join('\n');
}

/**
 * Send message to Discord webhook
 */
function sendToDiscord(webhookUrl: string, content: string): Promise<DiscordResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);

    const payload = JSON.stringify({
      content: content,
      // Prevent @everyone and @here mentions for safety
      allowed_mentions: { parse: [] }
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode! >= 200 && res.statusCode! < 300) {
          resolve({ success: true, statusCode: res.statusCode! });
        } else {
          const error: DiscordError = new Error(`Discord API error: ${res.statusCode} - ${data}`);
          error.statusCode = res.statusCode;
          reject(error);
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    // Set timeout to prevent hanging
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Send with retry logic and exponential backoff
 */
async function sendWithRetry(webhookUrl: string, content: string): Promise<DiscordResult> {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sendToDiscord(webhookUrl, content);
    } catch (cause) {
      if (!(cause instanceof Error)) throw cause;
      const e: DiscordError = cause;
      lastError = e;

      // Don't retry on validation errors (4xx except 429)
      if (e.statusCode && e.statusCode >= 400 && e.statusCode < 500 && e.statusCode !== 429) {
        throw e;
      }

      // Rate limited (429) - use longer exponential backoff
      if (e.statusCode === 429 || e.message.includes('429')) {
        const retryAfter = Math.pow(2, attempt) * INITIAL_RETRY_DELAY_MS;
        console.error(
          `[discord-send] Rate limited. Waiting ${retryAfter / 1000}s before retry ${attempt}/${MAX_RETRIES}`
        );
        await sleep(retryAfter);
        continue;
      }

      // Network/timeout errors - brief retry
      if (attempt < MAX_RETRIES) {
        const delay = attempt * INITIAL_RETRY_DELAY_MS;
        console.error(`[discord-send] Attempt ${attempt} failed: ${e.message}. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError;
}

/**
 * Read input from stdin or command line
 */
async function getInput(): Promise<string> {
  // Filter out flags from arguments
  const args = process.argv.slice(2).filter((arg, index, values) => {
    if (arg === '--target' || arg === '--event') return false;
    if (index > 0 && ['--target', '--event'].includes(values[index - 1])) return false;
    return !arg.startsWith('--');
  });

  // Check for command line argument (non-flag)
  if (args.length > 0) {
    return args[0];
  }

  // Read from stdin
  return new Promise((resolve) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    // Handle piped input
    if (!process.stdin.isTTY) {
      process.stdin.on('data', (chunk) => {
        data += chunk;
      });

      process.stdin.on('end', () => {
        resolve(data.trim());
      });
    } else {
      // No piped input and no argument
      resolve('');
    }
  });
}

/**
 * Check for --dry-run flag
 */
function isDryRun(): boolean {
  return process.argv.includes('--dry-run');
}

function isNonLifecycle(): boolean {
  return process.argv.includes('--non-lifecycle');
}

function targetArgument(): string | undefined {
  const index = process.argv.indexOf('--target');
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error('--target requires an issue or series target');
  if (process.argv.indexOf('--target', index + 1) >= 0) throw new Error('--target may appear once');
  return value;
}

function eventArgument(): string | undefined {
  const index: number = process.argv.indexOf('--event');
  if (index < 0) return undefined;
  const value: string | undefined = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error('--event requires a completion identity');
  if (process.argv.indexOf('--event', index + 1) >= 0) throw new Error('--event may appear once');
  return value;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const dryRun = isDryRun();
  const nonLifecycle = isNonLifecycle();
  const event: string | undefined = eventArgument();

  if (nonLifecycle && process.argv.includes('--target')) {
    console.error('[discord-send] --non-lifecycle cannot be combined with --target');
    process.exit(1);
  }
  if (nonLifecycle && event !== undefined) throw new Error('--event requires a lifecycle --target');
  const target = nonLifecycle ? undefined : targetArgument();
  if (!nonLifecycle) {
    assertBroadcastTargetAllowed({ cwd: process.cwd(), target });
  }

  // Load environment variables
  loadEnv();

  // Collect all webhook URLs
  let webhooks: Webhook[];
  try {
    webhooks = collectWebhookUrls();
  } catch (cause) {
    if (!(cause instanceof Error)) throw cause;
    const e: Error = cause;
    console.error(`[discord-send] ${e.message}`);
    console.error('[discord-send] See setup-guide.md for instructions');
    process.exit(1);
  }

  if (!dryRun) {
    // Validate that at least one webhook is configured
    if (webhooks.length === 0) {
      console.error('[discord-send] No webhooks configured');
      console.error('[discord-send] Configure broadcast.discord.webhook_env in issues/config.yaml');
      console.error('[discord-send] See setup-guide.md for instructions');
      process.exit(1);
    }

    // Validate all webhook URLs
    const invalidWebhooks = [];
    for (const webhook of webhooks) {
      const validation = validateWebhookUrl(webhook.url, webhook.name);
      if (!validation.valid) {
        invalidWebhooks.push(validation.error);
      }
    }

    if (invalidWebhooks.length > 0) {
      console.error('[discord-send] Invalid webhook URL(s):');
      invalidWebhooks.forEach((err) => console.error(`  - ${err}`));
      process.exit(1);
    }

    console.log(`[discord-send] Broadcasting to ${webhooks.length} webhook(s)`);
  }

  // Get input
  const input = await getInput();

  if (!input) {
    console.error('[discord-send] No input provided');
    console.error(
      '[discord-send] Usage: echo \'{"summary":"...","whats_new":["...","...","..."]}\' | bun scripts/discord-send.ts --target issue:<slug>'
    );
    console.error('[discord-send] Flags: --dry-run (preview without sending)');
    process.exit(1);
  }

  // Parse input
  let data: Message;
  try {
    data = JSON.parse(input);
  } catch (cause) {
    if (!(cause instanceof Error)) throw cause;
    const e: Error = cause;
    console.error(`[discord-send] Invalid JSON input: ${e.message}`);
    process.exit(1);
  }

  // Validate input structure
  const validationErrors = validateInput(data);
  if (validationErrors.length > 0) {
    console.error('[discord-send] Validation errors:');
    validationErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  const delivered: ReadonlySet<string> =
    event === undefined ? new Set<string>() : deliveredWebhooks(process.cwd(), event);
  const skipped: string[] = webhooks.filter((webhook) => delivered.has(webhook.name)).map((webhook) => webhook.name);
  webhooks = webhooks.filter((webhook) => !delivered.has(webhook.name));

  // Format message
  const message = formatMessage(data, process.argv.includes('--continuation'));

  // Check Discord's 2000 character limit
  if (message.length > 2000) {
    console.error(`[discord-send] Message too long: ${message.length} characters (max 2000)`);
    process.exit(1);
  }

  // Dry-run mode: preview and exit
  if (dryRun) {
    if (skipped.length > 0) console.log('[discord-send] Already delivered:', { event, webhooks: skipped });
    const webhookCount = webhooks.length || '(none configured)';
    console.log('');
    console.log('============================================================');
    console.log('DRY RUN - Message preview (not sent)');
    console.log('============================================================');
    console.log('');
    console.log(message);
    console.log('');
    console.log('------------------------------------------------------------');
    console.log(`Characters: ${message.length}/2000`);
    console.log(`Webhooks: ${webhookCount}`);
    if (webhooks.length > 0) {
      for (const webhook of webhooks) {
        console.log(`  - ${webhook.name}`);
      }
    }
    console.log(`Status: ${message.length <= 2000 ? 'OK - within limit' : 'ERROR - too long'}`);
    console.log('============================================================');
    console.log('');
    process.exit(0);
  }

  if (webhooks.length === 0) {
    console.log('[discord-send] Already delivered', { event, webhooks: skipped });
    process.exit(0);
  }

  // Send to all webhooks in parallel
  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      try {
        const result = await sendWithRetry(webhook.url, message);
        return { webhook: webhook.name, success: true, statusCode: result.statusCode };
      } catch (cause) {
        if (!(cause instanceof Error)) throw cause;
        const e: Error = cause;
        return { webhook: webhook.name, success: false, error: e.message };
      }
    })
  );

  // Report results
  let hasFailure = false;
  const deliveries = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`[discord-send] ${result.value.webhook}: Success (status ${result.value.statusCode})`);
      deliveries.push({ webhook: result.value.webhook, success: true, statusCode: result.value.statusCode });
    } else {
      hasFailure = true;
      const error = result.status === 'fulfilled' ? result.value.error : result.reason;
      console.error(
        `[discord-send] ${result.status === 'fulfilled' ? result.value.webhook : 'unknown'}: Failed - ${error}`
      );
      deliveries.push({
        webhook: result.status === 'fulfilled' ? result.value.webhook : 'unknown',
        success: false,
        error: String(error)
      });
    }
  }

  // Durably record any broadcast that reached Discord, so a later session can
  // verify a send happened instead of re-firing a duplicate.
  if (deliveries.some((delivery) => delivery.success)) {
    try {
      const logPath = recordBroadcastDelivery({
        cwd: process.cwd(),
        entry: {
          protocol: 'broadcast-record/v1',
          ...(event === undefined ? {} : { event }),
          recorded_at: new Date().toISOString(),
          target: nonLifecycle ? 'non-lifecycle' : (target ?? null),
          summary: data.summary,
          whats_new: data.whats_new,
          deliveries
        }
      });
      console.log(`[discord-send] Recorded delivery at ${logPath}`);
    } catch (cause) {
      if (!(cause instanceof Error)) throw cause;
      const e: Error = cause;
      if (e instanceof BroadcastTargetError) {
        console.error(`[discord-send] Delivery not recorded: no issues/config.yaml above ${process.cwd()}`);
      } else {
        console.error(`[discord-send] Delivered but failed to record at ${BROADCAST_LOG_RELATIVE_PATH}: ${e.message}`);
        process.exit(1);
      }
    }
  }

  process.exit(hasFailure ? 1 : 0);
}

main();
