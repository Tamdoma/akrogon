import * as fs from 'node:fs';
import * as path from 'node:path';
import { findControlRoot } from './broadcast-target';
import type { YamlNode } from '../../../issues/.scripts/lifecycle/run-status-protocol';

export const BROADCAST_LOG_RELATIVE_PATH: string = path.join('issues', 'run', 'broadcast', 'log.jsonl');

export interface BroadcastDelivery {
  readonly webhook: string;
  readonly success: boolean;
  readonly statusCode?: number;
  readonly error?: string;
}

export interface BroadcastReceipt {
  readonly protocol: 'broadcast-record/v1';
  readonly recorded_at: string;
  readonly target: string | null;
  readonly event?: string;
  readonly summary: string;
  readonly whats_new: readonly YamlNode[];
  readonly deliveries: readonly BroadcastDelivery[];
}

export function recordBroadcastDelivery(request: { readonly cwd: string; readonly entry: BroadcastReceipt }): string {
  const controlRoot: string = findControlRoot(request.cwd);
  const logPath: string = path.join(controlRoot, BROADCAST_LOG_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${JSON.stringify(request.entry)}\n`);
  return logPath;
}

function parseReceipt(raw: string, location: string): YamlNode {
  try {
    return JSON.parse(raw) as YamlNode;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new Error(`Invalid broadcast receipt JSON at ${location}: ${error.message}`, { cause: error });
  }
}

function receiptDeliveries(raw: string, location: string, event: string): readonly string[] {
  const parsed: YamlNode = parseReceipt(raw, location);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error(`Invalid broadcast receipt object: ${location}`);
  if (parsed.event !== undefined && typeof parsed.event !== 'string')
    throw new Error(`Invalid broadcast receipt event: ${location}`);
  if (!Array.isArray(parsed.deliveries)) throw new Error(`Invalid broadcast receipt deliveries: ${location}`);
  const successful: string[] = [];
  for (const delivery of parsed.deliveries) {
    if (
      delivery === null ||
      typeof delivery !== 'object' ||
      Array.isArray(delivery) ||
      typeof delivery.webhook !== 'string' ||
      typeof delivery.success !== 'boolean'
    )
      throw new Error(`Invalid broadcast receipt delivery: ${location}`);
    if (delivery.success && parsed.event === event) successful.push(delivery.webhook);
  }
  return successful;
}

export function deliveredWebhooks(cwd: string, event: string): ReadonlySet<string> {
  const logPath: string = path.join(findControlRoot(cwd), BROADCAST_LOG_RELATIVE_PATH);
  if (!fs.existsSync(logPath)) return new Set<string>();
  const content: string = fs.readFileSync(logPath, 'utf8');
  if (content.trimEnd() === '') return new Set<string>();
  const lines: string[] = content.trimEnd().split('\n');
  return new Set(
    lines.flatMap((line: string, index: number): readonly string[] =>
      receiptDeliveries(line, `${logPath}:${index + 1}`, event)
    )
  );
}
