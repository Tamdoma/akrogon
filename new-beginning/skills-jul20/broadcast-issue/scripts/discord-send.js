#!/usr/bin/env bun
/**
 * DISCORD WEBHOOK SENDER
 *
 * Sends formatted issue lifecycle updates to Discord.
 * Uses this skill's .env store plus project issues/config.yaml routing.
 * Supports multiple configured webhook environment names for broadcasting to multiple channels.
 *
 * Usage:
 *   echo '{"summary":"...","whats_new":["...","...","..."]}' | bun scripts/discord-send.js
 *
 * Or with command line argument:
 *   bun scripts/discord-send.js '{"summary":"...","whats_new":["...","...","..."]}'
 *
 * Flags:
 *   --dry-run  Preview message without sending
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

const https = require('https');
const path = require('path');
const fs = require('fs');

const DEFAULT_WEBHOOK_ENV_NAMES = ['DISCORD_WEBHOOK_URL'];
const ENV_PATH = path.join(path.dirname(__dirname), '.env');

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse .env files manually (minimal dependency approach)
 * Falls back to dotenv if available.
 * Loads only the .env file next to the running skill; existing process env values win.
 */
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  try {
    require('dotenv').config({ path: ENV_PATH, override: false, quiet: true });
    return;
  } catch (e) {
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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.error(`[discord-send] Warning: Could not parse .env at ${ENV_PATH}: ${e.message}`);
  }
}

function findIssuesConfig(startDir) {
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

function getIndent(line) {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
}

function readConfiguredWebhookEnvNames(configPath) {
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
          throw new Error(`Malformed broadcast.discord.webhook_env in ${configPath}: use block-list entries like "- DISCORD_WEBHOOK_URL"`);
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

function getConfiguredWebhookEnvNames() {
  const configPath = findIssuesConfig(process.cwd());
  return configPath ? readConfiguredWebhookEnvNames(configPath) : DEFAULT_WEBHOOK_ENV_NAMES;
}

/**
 * Validate webhook URL format
 */
function validateWebhookUrl(url, name = 'DISCORD_WEBHOOK_URL') {
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
  } catch (e) {
    return { valid: false, error: `${name}: Invalid URL: ${e.message}` };
  }
}

/**
 * Collect webhook URLs from the env-var names configured in issues/config.yaml.
 */
function collectWebhookUrls() {
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
function validateInput(data) {
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
  } else if (data.whats_new.length < 3) {
    errors.push("'whats_new' must have at least 3 items");
  }

  return errors;
}

/**
 * Format message content for Discord
 */
function formatMessage(data) {
  const lines = [];

  // Test tube emoji + summary
  lines.push(`\uD83E\uDDEA ${data.summary}`);
  lines.push('');
  for (const item of data.whats_new) {
    lines.push(`- ${item}`);
  }

  return lines.join('\n');
}

/**
 * Send message to Discord webhook
 */
function sendToDiscord(webhookUrl, content) {
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

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          const error = new Error(`Discord API error: ${res.statusCode} - ${data}`);
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
async function sendWithRetry(webhookUrl, content) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sendToDiscord(webhookUrl, content);
    } catch (e) {
      lastError = e;

      // Don't retry on validation errors (4xx except 429)
      if (e.statusCode && e.statusCode >= 400 && e.statusCode < 500 && e.statusCode !== 429) {
        throw e;
      }

      // Rate limited (429) - use longer exponential backoff
      if (e.statusCode === 429 || e.message.includes('429')) {
        const retryAfter = Math.pow(2, attempt) * INITIAL_RETRY_DELAY_MS;
        console.error(`[discord-send] Rate limited. Waiting ${retryAfter / 1000}s before retry ${attempt}/${MAX_RETRIES}`);
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
async function getInput() {
  // Filter out flags from arguments
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));

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
      process.stdin.on('data', chunk => {
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
function isDryRun() {
  return process.argv.includes('--dry-run');
}

/**
 * Main execution
 */
async function main() {
  const dryRun = isDryRun();

  // Load environment variables
  loadEnv();

  // Collect all webhook URLs
  let webhooks;
  try {
    webhooks = collectWebhookUrls();
  } catch (e) {
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
      invalidWebhooks.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    console.log(`[discord-send] Broadcasting to ${webhooks.length} webhook(s)`);
  }

  // Get input
  const input = await getInput();

  if (!input) {
    console.error('[discord-send] No input provided');
    console.error('[discord-send] Usage: echo \'{"summary":"...","whats_new":["...","...","..."]}\' | bun scripts/discord-send.js');
    console.error('[discord-send] Flags: --dry-run (preview without sending)');
    process.exit(1);
  }

  // Parse input
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    console.error(`[discord-send] Invalid JSON input: ${e.message}`);
    process.exit(1);
  }

  // Validate input structure
  const validationErrors = validateInput(data);
  if (validationErrors.length > 0) {
    console.error('[discord-send] Validation errors:');
    validationErrors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Format message
  const message = formatMessage(data);

  // Check Discord's 2000 character limit
  if (message.length > 2000) {
    console.error(`[discord-send] Message too long: ${message.length} characters (max 2000)`);
    process.exit(1);
  }

  // Dry-run mode: preview and exit
  if (dryRun) {
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

  // Send to all webhooks in parallel
  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      try {
        const result = await sendWithRetry(webhook.url, message);
        return { webhook: webhook.name, success: true, statusCode: result.statusCode };
      } catch (e) {
        return { webhook: webhook.name, success: false, error: e.message };
      }
    })
  );

  // Report results
  let hasFailure = false;
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`[discord-send] ${result.value.webhook}: Success (status ${result.value.statusCode})`);
    } else {
      hasFailure = true;
      const error = result.status === 'fulfilled' ? result.value.error : result.reason;
      console.error(`[discord-send] ${result.value?.webhook || 'unknown'}: Failed - ${error}`);
    }
  }

  process.exit(hasFailure ? 1 : 0);
}

main();
