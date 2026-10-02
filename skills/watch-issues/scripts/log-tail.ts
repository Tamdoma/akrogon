#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const BT: string = String.fromCharCode(96); // backtick char, avoids quote soup below

const blockSchema = z.looseObject({ type: z.string().optional() });

const claudeSchema = z.looseObject({
  type: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().optional(),
  message: z
    .looseObject({
      role: z.string().optional(),
      content: z.union([z.string(), z.array(blockSchema)]).optional(),
    })
    .optional(),
});

const codexSchema = z.looseObject({
  type: z.string().optional(),
  timestamp: z.string().optional(),
  payload: z
    .looseObject({
      type: z.string().optional(),
      call_id: z.string().optional(),
      name: z.string().optional(),
      input: z.string().optional(),
      output: z.union([z.string(), z.array(blockSchema)]).optional(),
    })
    .optional(),
});

const piSchema = z.looseObject({
  type: z.string().optional(),
  timestamp: z.string().optional(),
  message: z
    .looseObject({
      role: z.string().optional(),
      toolCallId: z.string().optional(),
      toolName: z.string().optional(),
      isError: z.boolean().optional(),
      details: z.looseObject({}).optional(),
      content: z.union([z.string(), z.array(blockSchema)]).optional(),
    })
    .optional(),
});

type Format = 'claude' | 'codex' | 'pi';
type Block = { type?: string | undefined } & Record<string, unknown>;

interface RawCall {
  index: number;
  id: string;
  ts: string;
  name: string;
  kind: 'shell' | 'edit' | 'other';
  target: string;
  allLiteral: boolean;
  editOld: string;
  editNew: string;
}

interface RawResult {
  index: number;
  id: string;
  ts: string;
  name: string;
  isError: boolean;
  texts: string[];
  termination?: { kind?: string; exitCode?: number };
}

interface Entry {
  index: number;
  ts: string;
  name: string;
  kind: 'shell' | 'edit' | 'other' | 'orphan';
  target: string;
  allLiteral: boolean;
  editOld: string;
  editNew: string;
  result?: RawResult;
}

function hash8(text: string): string {
  return new Bun.CryptoHasher('sha256').update(text).digest('hex').slice(0, 8);
}

function cut(text: string): string {
  const flat: string = text.replace(/\r/g, '␍').replace(/\n/g, '⏎');
  return flat.length > 120 ? flat.slice(0, 120) + '…' : flat;
}

function textsOf(content: unknown): string[] {
  if (typeof content === 'string') return [content];
  if (Array.isArray(content)) {
    return content
      .filter((b): b is Block => b !== null && typeof b === 'object' && !Array.isArray(b))
      .filter((b) => typeof b.text === 'string')
      .map((b) => b.text as string);
  }
  return [];
}

// JS source scanning: literal extraction only, the source is never evaluated.

function decodeEscape(raw: string): string {
  const body: string = raw.slice(1);
  if (body.startsWith('x')) return String.fromCharCode(parseInt(body.slice(1), 16));
  if (body.startsWith('u{')) return String.fromCodePoint(parseInt(body.slice(2, -1), 16));
  if (body.startsWith('u')) return String.fromCharCode(parseInt(body.slice(1), 16));
  switch (body) {
    case 'n': return '\n';
    case 't': return '\t';
    case 'r': return '\r';
    case 'b': return '\b';
    case 'f': return '\f';
    case 'v': return '\v';
    case '0': return '\0';
    default: return body;
  }
}

// Read a string literal starting at i; value null means unterminated or an
// interpolated template (non-literal for this contract).
function readString(src: string, i: number): { value: string | null; next: number } {
  const q: string = src[i];
  let j: number = i + 1;
  let out: string = '';
  while (j < src.length) {
    const ch: string = src[j];
    if (ch === '\\') {
      const m: RegExpMatchArray | null = /^\\x[0-9a-fA-F]{2}|\\u\{[0-9a-fA-F]+\}|\\u[0-9a-fA-F]{4}|\\./.exec(src.slice(j));
      if (m === null) return { value: null, next: src.length };
      out += decodeEscape(m[0]);
      j += m[0].length;
      continue;
    }
    if (q === BT && ch === '$' && src[j + 1] === '{') return { value: null, next: j };
    if (ch === q) return { value: out, next: j + 1 };
    out += ch;
    j++;
  }
  return { value: null, next: src.length };
}

function skipWs(src: string, i: number): number {
  while (i < src.length) {
    if (/\s/.test(src[i])) { i++; continue; }
    if (src.startsWith('//', i)) {
      const nl: number = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl + 1;
      continue;
    }
    if (src.startsWith('/*', i)) {
      const end: number = src.indexOf('*/', i + 2);
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    return i;
  }
  return i;
}

// Read the value of key: at depth 1 of the object literal opened at openBrace.
// Returns the decoded string, a number literal as string, or null for non-literals.
function readArg(src: string, openBrace: number, key: string): string | null {
  let i: number = openBrace + 1;
  let depth: number = 1;
  while (i < src.length && depth > 0) {
    const ch: string = src[i];
    if (ch === "'" || ch === '"' || ch === BT) {
      i = readString(src, i).next;
      continue;
    }
    if (ch === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) {
      i = skipWs(src, i);
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') { depth++; i++; continue; }
    if (ch === '}' || ch === ')' || ch === ']') { depth--; i++; continue; }
    if (depth === 1 && /[A-Za-z_$]/.test(ch)) {
      const m: RegExpMatchArray | null = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(src.slice(i));
      const word: string = m === null ? '' : m[0];
      const after: number = skipWs(src, i + word.length);
      if (word === key && src[after] === ':') {
        const v: number = skipWs(src, after + 1);
        const vc: string | undefined = src[v];
        if (vc === "'" || vc === '"' || vc === BT) {
          const literal: { value: string | null; next: number } = readString(src, v);
          const end: string = src[skipWs(src, literal.next)];
          return end === ',' || end === '}' ? literal.value : null;
        }
        const num: RegExpMatchArray | null = /^-?\d+(\.\d+)?/.exec(src.slice(v));
        if (num !== null) return num[0];
        return null;
      }
      i += word.length;
      continue;
    }
    i++;
  }
  return null;
}

// Scan source for exec_command cmd args and write_stdin session_id args, in order.
function scanExecSource(src: string): { target: string; allLiteral: boolean } {
  const parts: string[] = [];
  let allLiteral: boolean = true;
  const re: RegExp = /\b(exec_command|write_stdin)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const i: number = skipWs(src, m.index + m[0].length);
    const arg: string | null =
      src[i] === '{' ? readArg(src, i, m[1] === 'exec_command' ? 'cmd' : 'session_id') : null;
    if (m[1] === 'exec_command') {
      if (arg === null) { parts.push('<expr>'); allLiteral = false; } else parts.push(arg);
    } else {
      if (arg === null) { parts.push('session <expr>'); allLiteral = false; } else parts.push('session ' + arg);
    }
  }
  return { target: parts.join(' ; '), allLiteral: parts.length > 0 && allLiteral };
}

function genericTarget(obj: Record<string, unknown> | undefined): string {
  if (obj === undefined) return '';
  for (const key of ['file_path', 'path', 'pattern', 'url']) {
    const v: unknown = obj[key];
    if (typeof v === 'string' && v !== '') return v;
  }
  return '';
}

function objOf(v: unknown): Record<string, unknown> | undefined {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
}

function strOf(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function collectClaude(records: unknown[]): { calls: RawCall[]; results: RawResult[] } {
  const calls: RawCall[] = [];
  const results: RawResult[] = [];
  for (let i = 0; i < records.length; i++) {
    const p = claudeSchema.safeParse(records[i]);
    if (!p.success) continue;
    const rec = p.data;
    const ts: string = rec.timestamp ?? '-';
    const blocks: Block[] = Array.isArray(rec.message?.content) ? (rec.message.content as Block[]) : [];
    if (rec.type === 'assistant' && rec.message?.role === 'assistant') {
      for (const b of blocks) {
        if (b.type !== 'tool_use') continue;
        const name: string = strOf(b.name);
        const input: Record<string, unknown> | undefined = objOf(b.input);
        if (name === 'Bash') {
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'shell', target: strOf(input?.command), allLiteral: true, editOld: '', editNew: '' });
        } else if (name === 'Edit') {
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'edit', target: genericTarget(input), allLiteral: true, editOld: strOf(input?.old_string), editNew: strOf(input?.new_string) });
        } else {
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'other', target: genericTarget(input), allLiteral: true, editOld: '', editNew: '' });
        }
      }
    } else if (rec.type === 'user' && rec.message?.role === 'user') {
      for (const b of blocks) {
        if (b.type !== 'tool_result') continue;
        results.push({ index: i, id: strOf(b.tool_use_id), ts, name: '?', isError: b.is_error === true, texts: textsOf(b.content) });
      }
    }
  }
  return { calls, results };
}

function collectCodex(records: unknown[]): { calls: RawCall[]; results: RawResult[] } {
  const calls: RawCall[] = [];
  const results: RawResult[] = [];
  for (let i = 0; i < records.length; i++) {
    const p = codexSchema.safeParse(records[i]);
    if (!p.success) continue;
    const rec = p.data;
    const ts: string = rec.timestamp ?? '-';
    const payload = rec.payload;
    if (payload === undefined || rec.type !== 'response_item') continue;
    if (payload.type === 'custom_tool_call' && typeof payload.call_id === 'string') {
      const scanned = scanExecSource(typeof payload.input === 'string' ? payload.input : '');
      calls.push({ index: i, id: payload.call_id, ts, name: strOf(payload.name) || 'exec', kind: 'shell', target: scanned.target, allLiteral: scanned.allLiteral, editOld: '', editNew: '' });
    } else if (payload.type === 'custom_tool_call_output' && typeof payload.call_id === 'string') {
      results.push({ index: i, id: payload.call_id, ts, name: '?', isError: false, texts: textsOf(payload.output) });
    }
  }
  return { calls, results };
}

function collectPi(records: unknown[]): { calls: RawCall[]; results: RawResult[] } {
  const calls: RawCall[] = [];
  const results: RawResult[] = [];
  for (let i = 0; i < records.length; i++) {
    const p = piSchema.safeParse(records[i]);
    if (!p.success) continue;
    const rec = p.data;
    const ts: string = rec.timestamp ?? '-';
    const msg = rec.message;
    if (msg === undefined || rec.type !== 'message') continue;
    const blocks: Block[] = Array.isArray(msg.content) ? (msg.content as Block[]) : [];
    if (msg.role === 'assistant') {
      for (const b of blocks) {
        if (b.type !== 'toolCall') continue;
        const name: string = strOf(b.name);
        const args: Record<string, unknown> | undefined = objOf(b.arguments);
        if (name === 'bash') {
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'shell', target: strOf(args?.command), allLiteral: true, editOld: '', editNew: '' });
        } else if (name === 'exec') {
          const scanned = scanExecSource(strOf(args?.code));
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'shell', target: scanned.target, allLiteral: scanned.allLiteral, editOld: '', editNew: '' });
        } else if (name === 'edit') {
          const edits: unknown = args?.edits;
          const list: Record<string, unknown>[] = Array.isArray(edits)
            ? edits.map(objOf).filter((e): e is Record<string, unknown> => e !== undefined)
            : [];
          calls.push({
            index: i, id: strOf(b.id), ts, name, kind: 'edit', target: genericTarget(args), allLiteral: true,
            editOld: list.map((e) => strOf(e.oldText)).join(''),
            editNew: list.map((e) => strOf(e.newText)).join(''),
          });
        } else {
          calls.push({ index: i, id: strOf(b.id), ts, name, kind: 'other', target: genericTarget(args), allLiteral: true, editOld: '', editNew: '' });
        }
      }
    } else if (msg.role === 'toolResult') {
      const term: Record<string, unknown> | undefined = objOf(objOf(objOf(msg.details)?.capture)?.termination);
      results.push({
        index: i, id: strOf(msg.toolCallId), ts, name: strOf(msg.toolName) || '?',
        isError: msg.isError === true, texts: textsOf(msg.content),
        termination: term === undefined
          ? undefined
          : { kind: typeof term.kind === 'string' ? term.kind : undefined, exitCode: typeof term.exitCode === 'number' ? term.exitCode : undefined },
      });
    }
  }
  return { calls, results };
}

function claudeStatus(r: RawResult): string {
  const m: RegExpMatchArray | null = /^Exit code (-?\d+)/.exec(r.texts[0] ?? '');
  if (m !== null) return 'exit ' + m[1];
  if (r.isError) return 'error';
  return 'ok';
}

function piBashStatus(r: RawResult): string {
  const t = r.termination;
  if (t !== undefined) {
    if (typeof t.exitCode === 'number') return t.exitCode === 0 ? 'ok' : 'exit ' + t.exitCode;
    return 'unknown';
  }
  if (r.isError) {
    const m: RegExpMatchArray | null = /\b(?:code|exit) (-?\d+)/.exec(r.texts.join('\n'));
    return m !== null ? 'exit ' + m[1] : 'error';
  }
  return 'ok';
}

function execBlockStatus(text: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return 'unknown';
  }
  const obj: Record<string, unknown> | undefined = objOf(parsed);
  if (obj === undefined) return 'unknown';
  if (typeof obj.exit_code === 'number') return obj.exit_code === 0 ? 'ok' : 'exit ' + obj.exit_code;
  if (obj.session_id !== undefined) return 'running';
  return 'unknown';
}

function statusOf(format: Format, name: string, r: RawResult): string {
  if (format === 'claude') return claudeStatus(r);
  if (format === 'codex') return r.texts.map(execBlockStatus).join(',') || 'unknown';
  if (name === 'bash') return piBashStatus(r);
  if (name === 'exec') return r.texts.map(execBlockStatus).join(',') || 'unknown';
  return r.isError ? 'error' : 'ok';
}

function firstNonEmpty(lines: string[]): string {
  for (const line of lines) if (line.trim() !== '') return line;
  return '';
}

function excerptOf(format: Format, name: string, r: RawResult): string {
  if (format === 'codex' || (format === 'pi' && name === 'exec')) {
    for (const text of r.texts) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        continue;
      }
      const obj: Record<string, unknown> | undefined = objOf(parsed);
      if (obj === undefined) continue;
      if (typeof obj.output === 'string' && obj.output !== '') return firstNonEmpty(obj.output.split('\n'));
    }
    return '';
  }
  let lines: string[] = r.texts.flatMap((t) => t.split('\n'));
  if (format === 'pi') lines = lines.filter((l) => !/^\[exit \d+\./.test(l));
  return firstNonEmpty(lines);
}

function render(format: Format, e: Entry): string {
  const identity: string =
    e.kind === 'shell'
      ? e.allLiteral ? '#' + hash8(e.target) : '#-'
      : e.kind === 'edit'
        ? 'old#' + hash8(e.editOld) + ' new#' + hash8(e.editNew)
        : '-';
  const status: string = e.result === undefined ? 'running' : statusOf(format, e.name, e.result);
  const excerpt: string = e.result === undefined ? '' : excerptOf(format, e.name, e.result);
  return (e.ts + ' ' + e.name + ' ' + cut(e.target) + ' ' + identity + ' -> ' + status + ': ' + cut(excerpt)).trimEnd();
}

function main(): void {
  const path: string | undefined = process.argv[2];
  if (path === undefined || process.argv.length !== 3) {
    console.error('Usage: log-tail.ts <path>');
    process.exit(1);
  }
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    console.error('Cannot read ' + path + ': ' + (error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
  const lines: string[] = raw.split('\n');
  lines.pop(); // trailing '' when the file ends with newline; the unterminated fragment otherwise
  const records: unknown[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];
    if (line.trim() === '') continue;
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      console.error(path + ':' + (i + 1) + ': invalid JSON: ' + (error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }

  let format: Format | undefined;
  for (const rec of records) {
    if (format !== undefined) break;
    const obj: Record<string, unknown> | undefined = objOf(rec);
    if (obj === undefined) continue;
    if (obj.type === 'session') format = 'pi';
    else if (obj.type === 'session_meta') format = 'codex';
    else if (obj.sessionId !== undefined) format = 'claude';
  }
  if (format === undefined) {
    console.error(path + ': unknown session log format');
    process.exit(1);
  }

  const collected: { calls: RawCall[]; results: RawResult[] } =
    format === 'claude' ? collectClaude(records) : format === 'codex' ? collectCodex(records) : collectPi(records);

  const byCallId = new Map<string, Entry>();
  const entries: Entry[] = collected.calls.map((c): Entry => {
    const e: Entry = { index: c.index, ts: c.ts, name: c.name, kind: c.kind, target: c.target, allLiteral: c.allLiteral, editOld: c.editOld, editNew: c.editNew };
    if (c.id !== '') byCallId.set(c.id, e);
    return e;
  });
  for (const r of collected.results) {
    const entry: Entry | undefined = byCallId.get(r.id);
    if (entry !== undefined) {
      entry.result = r;
    } else {
      // Result whose call is outside this file (excerpt or truncated read):
      // the recorded status is evidence no call line could carry, so print it.
      entries.push({ index: r.index, ts: r.ts, name: r.name, kind: 'orphan', target: '', allLiteral: false, editOld: '', editNew: '', result: r });
    }
  }
  entries.sort((a, b) => a.index - b.index);

  for (const e of entries.slice(-20)) {
    console.log(render(format, e));
  }
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
