export class FixerConfigError extends Error {
  readonly label: string;

  constructor(label: string, detail: string) {
    super(`Expected ${label} ${detail}`);
    this.name = 'FixerConfigError';
    this.label = label;
  }
}

interface AlertWebhookWarningRecord {
  readonly boundary: 'fixer-alert-webhook';
  readonly channel: FixerAlertWebhook['kind'] | null;
  readonly reason: string;
  readonly status: number | null;
}

function structuredWarning(record: AlertWebhookWarningRecord): void {
  console.warn(JSON.stringify(record));
}

// R82. The blocked-restart alert had exactly one destination, `herdr notification show`, and R77
// measured that destination answering `{"reason":"disabled","shown":false}` on this deployment. This
// is the second destination, and it is OFF until an env var names a format — the operator asked for
// the option, not the routing.
//
// One channel covers both candidates because they are the same operation: POST JSON to a URL with a
// secret. Discord takes the secret IN the url and Moshi takes it in the body, which is the only
// difference the union has to carry. Moshi (getmoshi.app) is the one that matters later — it is a
// phone terminal for agent sessions, so its push reaches the operator away from the machine, which
// is the failure this whole surface exists for. A Discord webhook reaches a room someone has to be
// looking at.
export const MOSHI_WEBHOOK_ENDPOINT = 'https://api.getmoshi.app/api/webhook';

const ALERT_WEBHOOK_TIMEOUT_MS = 10_000;

export type FixerAlertWebhook =
  { readonly kind: 'discord'; readonly url: string } | { readonly kind: 'moshi'; readonly token: string };

// Parsed once from the environment so nothing downstream branches on a missing string. `off` is a
// value rather than a null because "no second channel" is a legitimate deployment, while `malformed`
// is a configuration the operator meant to work and must hear about.
export type FixerAlertWebhookResolution =
  | { readonly kind: 'off' }
  | { readonly kind: 'configured'; readonly webhook: FixerAlertWebhook }
  | { readonly kind: 'malformed'; readonly reason: string };

export function resolveFixerAlertWebhook(
  env: Readonly<Record<string, string | undefined>>
): FixerAlertWebhookResolution {
  const format: string | undefined = env.FIXER_ALERT_WEBHOOK;
  if (format === undefined || format === '') return { kind: 'off' };
  if (format === 'discord') {
    const url: string | undefined = env.FIXER_ALERT_WEBHOOK_URL;
    return url === undefined || url === ''
      ? { kind: 'malformed', reason: 'FIXER_ALERT_WEBHOOK=discord requires a non-empty FIXER_ALERT_WEBHOOK_URL' }
      : { kind: 'configured', webhook: { kind: 'discord', url } };
  }
  if (format === 'moshi') {
    const token: string | undefined = env.FIXER_ALERT_MOSHI_TOKEN;
    return token === undefined || token === ''
      ? { kind: 'malformed', reason: 'FIXER_ALERT_WEBHOOK=moshi requires a non-empty FIXER_ALERT_MOSHI_TOKEN' }
      : { kind: 'configured', webhook: { kind: 'moshi', token } };
  }
  return {
    kind: 'malformed',
    reason: `FIXER_ALERT_WEBHOOK must be "discord" or "moshi", not ${JSON.stringify(format)}`
  };
}

// R88, from codex F-C191. The resolution above used to run only inside a blocked-restart alert, so a
// typo in the format name started a watchdog that looked healthy, then behaved exactly like an off or
// dead channel and said so only in `watchdog.stderr.log` — a file the launcher tells the operator to
// read for a different failure. The operator who sets this variable meant to be reached, so the
// misconfiguration has to surface at the moment they can still fix it. `off` stays valid, because no
// second channel is a real deployment, and an absent configuration touches no network here.
export function assertFixerAlertWebhookConfigured(env: Readonly<Record<string, string | undefined>>): void {
  const resolution: FixerAlertWebhookResolution = resolveFixerAlertWebhook(env);
  if (resolution.kind === 'malformed')
    throw new FixerConfigError('the FIXER alert webhook environment', resolution.reason);
}

export interface FixerAlertWebhookPost {
  readonly endpoint: string;
  readonly body: string;
}

// Pure, so the payload shape is provable without a network. Discord reads `content` and Moshi reads
// `token`/`title`/`message`; neither accepts the other's field names, which is why this is a switch
// on the union rather than one body with optional keys.
export function fixerAlertWebhookPost(webhook: FixerAlertWebhook, title: string, body: string): FixerAlertWebhookPost {
  return webhook.kind === 'discord'
    ? { endpoint: webhook.url, body: JSON.stringify({ content: `**${title}**\n${body}` }) }
    : { endpoint: MOSHI_WEBHOOK_ENDPOINT, body: JSON.stringify({ token: webhook.token, title, message: body }) };
}

export interface FixerAlertWebhookResponse {
  readonly status: number;
}

export type FixerAlertWebhookFetch = (
  endpoint: string,
  init: {
    readonly method: string;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: string;
    readonly signal: AbortSignal;
  }
) => Promise<FixerAlertWebhookResponse>;

export const nodeAlertWebhookFetch: FixerAlertWebhookFetch = async (endpoint, init) => {
  const response = await fetch(endpoint, init);
  return { status: response.status };
};

// R84, from codex F-C189. `structuredWarning` lands in `watchdog.stderr.log`, which is durable, and a
// transport's `error.message` is arbitrary text that routinely quotes the request it failed on. For
// this channel the request IS the secret: the Discord url carries it in the path and the Moshi body
// carries the token, so one such message writes a live credential to disk. The message therefore
// never reaches the record. What survives is the error class and, one `cause` level down, an
// allowlisted errno — together they separate a timeout from a refused connection from a DNS miss,
// and neither can carry a url. An unrecognized class is named as unrecognized rather than quoted,
// because the whole point is that this string is not attacker-shaped.
const TRANSPORT_ERROR_NAMES: ReadonlySet<string> = new Set(['AbortError', 'TimeoutError', 'TypeError']);

const TRANSPORT_ERROR_CODES: ReadonlySet<string> = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET'
]);

function allowlistedErrorCode(value: unknown): string | null {
  if (!(value instanceof Error)) return null;
  const code: unknown = (value as { readonly code?: unknown }).code;
  return typeof code === 'string' && TRANSPORT_ERROR_CODES.has(code) ? code : null;
}

// Exported so the redaction is provable on its own, without a network or a captured console.
export function transportFailureReason(error: unknown): string {
  if (!(error instanceof Error)) return 'transport failure';
  const name: string = TRANSPORT_ERROR_NAMES.has(error.name) ? error.name : 'unrecognized error class';
  const code: string | null = allowlistedErrorCode(error) ?? allowlistedErrorCode(error.cause);
  return code === null ? `transport failure (${name})` : `transport failure (${name} ${code})`;
}

// Returns whether the operator was reached, in the same currency as `notificationWasShown`, so the
// caller can OR the two channels and `alertChannelFailures` keeps counting real misses.
//
// A transport failure answers false instead of throwing, for the reason host-io.ts gives for the
// toast parser: this runs on the watchdog action path, and an unreachable webhook must not be the
// thing that kills the loop that was trying to report a stall. It is not swallowed — every failure
// warns structurally, and under R79 three of them drop the whole alert to the hourly cooldown, which
// is the visible consequence. The warning names the channel and never the endpoint or body, because
// the Discord url IS the secret and the Moshi body carries the token.
async function sendFixerAlertWebhook(
  webhook: FixerAlertWebhook,
  title: string,
  body: string,
  send: FixerAlertWebhookFetch
): Promise<boolean> {
  const post: FixerAlertWebhookPost = fixerAlertWebhookPost(webhook, title, body);
  try {
    const response: FixerAlertWebhookResponse = await send(post.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: post.body,
      signal: AbortSignal.timeout(ALERT_WEBHOOK_TIMEOUT_MS)
    });
    if (response.status >= 200 && response.status < 300) return true;
    structuredWarning({
      boundary: 'fixer-alert-webhook',
      channel: webhook.kind,
      reason: 'non-success status',
      status: response.status
    });
    return false;
  } catch (error) {
    structuredWarning({
      boundary: 'fixer-alert-webhook',
      channel: webhook.kind,
      reason: transportFailureReason(error),
      status: null
    });
    return false;
  }
}

export interface FixerAlertWebhookAttempt {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly send: FixerAlertWebhookFetch;
  readonly title: string;
  readonly body: string;
}

// The whole optional-channel decision in one call, so the host's alert effect stays the two lines
// that raise the toast. Answers whether THIS channel reached the operator; the caller ORs it with
// the toast result, because reaching the operator anywhere is the only question
// `alertChannelFailures` asks.
export async function attemptFixerAlertWebhook(request: FixerAlertWebhookAttempt): Promise<boolean> {
  const resolution: FixerAlertWebhookResolution = resolveFixerAlertWebhook(request.env);
  if (resolution.kind === 'off') return false;
  if (resolution.kind === 'malformed') {
    structuredWarning({
      boundary: 'fixer-alert-webhook',
      channel: null,
      reason: resolution.reason,
      status: null
    });
    return false;
  }
  return sendFixerAlertWebhook(resolution.webhook, request.title, request.body, request.send);
}
