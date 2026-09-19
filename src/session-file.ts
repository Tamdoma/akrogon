import { readdirSync, readFileSync, statSync, type Dirent, type Stats } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

function isMissingCode(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code: unknown = (error as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

export function sessionFile(ref: { kind: 'id' | 'path'; value: string }, home: string): string | undefined {
  if (ref.kind === 'path') return ref.value;
  if (home === '') return undefined;
  const root: string = join(home, '.pi', 'agent', 'sessions');
  const rootStat: Stats | undefined = statSync(root, { throwIfNoEntry: false });
  if (rootStat === undefined || !rootStat.isDirectory()) return undefined;
  const suffix: string = `_${ref.value}.jsonl`;
  const matches: string[] = [];
  const dirs: Dirent[] = readdirSync(root, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    let files: string[];
    try {
      files = readdirSync(join(root, dir.name));
    } catch (error) {
      if (isMissingCode(error)) continue;
      throw error;
    }
    for (const file of files) {
      if (file.endsWith(suffix)) matches.push(join(root, dir.name, file));
    }
  }
  return matches.length === 1 ? matches[0] : undefined;
}

const textContentSchema = z.object({ type: z.string(), text: z.string().optional() }).passthrough();
const messageSchema = z.object({ role: z.string(), content: z.array(textContentSchema) }).passthrough();
const recordSchema = z.object({ type: z.string(), message: messageSchema }).passthrough();

export function deliveredAfter(file: string, offset: number, text: string): boolean {
  const stat: Stats | undefined = statSync(file, { throwIfNoEntry: false });
  if (stat === undefined || !stat.isFile() || stat.size <= offset) return false;
  let buf: Buffer;
  try {
    buf = readFileSync(file);
  } catch (error) {
    if (isMissingCode(error)) return false;
    throw error;
  }
  if (buf.length <= offset) return false;
  let start: number = offset;
  if (start > 0 && buf[start - 1] !== 10) {
    const next: number = buf.indexOf(10, start);
    if (next === -1) return false;
    start = next + 1;
  }
  const suffix: string = buf.slice(start).toString('utf8');
  if (suffix === '') return false;
  const parts: string[] = suffix.split('\n');
  const lines: string[] = parts.slice(0, -1);
  for (const line of lines) {
    if (line === '') continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    const record = recordSchema.safeParse(parsed);
    if (!record.success) continue;
    if (record.data.type !== 'message') continue;
    if (record.data.message.role !== 'user') continue;
    if (record.data.message.content.some((item) => item.type === 'text' && item.text === text)) return true;
  }
  return false;
}
