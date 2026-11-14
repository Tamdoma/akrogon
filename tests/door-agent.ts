#!/usr/bin/env bun
// Stand-in chart door A for the reset helper tests (criterion 3). Started in an hc terminal as
// `door-agent.ts <claude|codex|pi|agy> <switch|noswitch> <out> [--session-id <id>] <first task>`, with HOME
// and TMPDIR pointing into the fixture. It reports OSC 7501 status, keeps its transcript where the
// resolver looks for that kind, and changes transcript on the reset line as each harness did in P3:
//   claude  keeps ~/.claude/sessions/<pid>.json naming its conversation and writes
//           ~/.claude/projects/<cwd>/<id>.jsonl; /clear is a short turn that opens the new id's file and
//           record, while <TMPDIR>/claude-<uid>/<cwd>/<first id>/tasks stays open under the first id
//   codex   holds ~/.codex/sessions/<date>/rollout-<ts>-<id>.jsonl open from its first prompt; after /new
//           a second rollout opens only at the next prompt, the first stays open
//   pi      holds nothing open; --session-id names ~/.pi/agent/sessions/--<cwd>--/<ts>_<id>.jsonl; after
//           /new the next turn writes a new <ts>_<newid>.jsonl in the same folder
//   agy     writes steps (14 user input, 15 reply) into ~/.gemini/antigravity-cli/conversations/<id>.db
//           (WAL) from its first prompt and locks presence/<id>.lock; /clear runs no turn, opens the new
//           id's database and lock at once and keeps the earlier database open
// `noswitch` keeps the first transcript after the reset line. A first task starting with `hold` keeps
// the turn open until <out>/release is opened for writing. claude's `/rename <name>` is a short turn that
// writes custom-title and agent-name records to the current transcript and stores the name, which the next
// /clear carries as the new transcript's first record; a name starting with `hold` keeps the rename turn
// open on <out>/release the same way.
// <out>/inputs.jsonl gets one line per received input ({input, busy, label}, label being the terminal's
// akrogon.transcript at receipt) and one {turnEnd, transcript} line after each turn's idle status, naming
// the transcript that turn wrote.
import { Database } from 'bun:sqlite';
import { appendFileSync, closeSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';

const args: string[] = process.argv.slice(2);
const [kind, mode, out] = z
  .tuple([z.enum(['claude', 'codex', 'pi', 'agy']), z.enum(['switch', 'noswitch']), z.string()])
  .parse(args.slice(0, 3));
const flag: number = args.indexOf('--session-id');
const first: string = z.string().parse(args.at(-1));
const home: string = z.string().parse(process.env.HOME);
const cwd: string = process.cwd().replace(/[/.]/g, '-');
const terminal: string = z.string().parse(process.env.HC_TERMINAL_ID);
const resetLine: string = kind === 'claude' || kind === 'agy' ? '/clear' : '/new';
const held: number[] = [];
const conversations: Map<string, Database> = new Map();
let lock: number | null = null;

function piFolder(): string {
  return resolve(home, '.pi/agent/sessions', `--${cwd}--`);
}

// The transcript the next turn writes to; codex opens a rollout lazily at a prompt.
let transcript: string | null = null;
let pendingSwitch: boolean = false;
function open(id: string): string {
  if (kind === 'claude') {
    const tasks: string = resolve(
      z.string().parse(process.env.TMPDIR),
      `claude-${process.getuid!()}`,
      cwd,
      id,
      'tasks',
    );
    mkdirSync(tasks, { recursive: true });
    if (held.length === 0) held.push(openSync(tasks, 'r'));
    const stat: string = readFileSync('/proc/self/stat', 'utf8');
    const procStart: string = stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19];
    mkdirSync(resolve(home, '.claude/sessions'), { recursive: true });
    writeFileSync(
      resolve(home, '.claude/sessions', `${process.pid}.json`),
      JSON.stringify({ pid: process.pid, sessionId: id, procStart }),
    );
    mkdirSync(resolve(home, '.claude/projects', cwd), { recursive: true });
    return resolve(home, '.claude/projects', cwd, `${id}.jsonl`);
  }
  if (kind === 'codex') {
    const day: string = new Date().toISOString().slice(0, 10).replaceAll('-', '/');
    const dir: string = resolve(home, '.codex/sessions', day);
    mkdirSync(dir, { recursive: true });
    const path: string = resolve(dir, `rollout-${Date.now()}-${id}.jsonl`);
    held.push(openSync(path, 'a'));
    return path;
  }
  if (kind === 'agy') {
    const root: string = resolve(home, '.gemini/antigravity-cli');
    mkdirSync(resolve(root, 'conversations'), { recursive: true });
    mkdirSync(resolve(root, 'presence'), { recursive: true });
    const path: string = resolve(root, 'conversations', `${id}.db`);
    const db: Database = new Database(path, { create: true });
    db.exec('pragma journal_mode = wal');
    db.exec('create table steps (idx integer primary key, step_type integer, step_payload blob)');
    conversations.set(path, db);
    if (lock !== null) closeSync(lock);
    lock = openSync(resolve(root, 'presence', `${id}.lock`), 'w');
    return path;
  }
  mkdirSync(piFolder(), { recursive: true });
  return resolve(piFolder(), `${Date.now()}_${id}.jsonl`);
}

function record(role: 'user' | 'assistant', text: string): object {
  if (kind === 'claude')
    return role === 'user'
      ? { type: 'user', origin: { kind: 'human' }, message: { role, content: text } }
      : { type: 'assistant', message: { role, content: [{ type: 'text', text }] } };
  if (kind === 'agy') return { step_type: role === 'user' ? 14 : 15, text };
  if (kind === 'codex')
    return { type: 'response_item', payload: { type: 'message', role, content: [{ type: 'input_text', text }] } };
  return { type: 'message', message: { role, content: [{ type: 'text', text }] } };
}

function write(entry: object): void {
  const path: string = z.string().parse(transcript);
  if (kind !== 'agy') return appendFileSync(path, `${JSON.stringify(entry)}\n`);
  const step = z.object({ step_type: z.number(), text: z.string() }).parse(entry);
  z.instanceof(Database)
    .parse(conversations.get(path))
    .query('insert into steps values ((select coalesce(max(idx), -1) + 1 from steps), ?, ?)')
    .run(step.step_type, Buffer.from(step.text));
}

function status(state: string): void {
  process.stdout.write(`\u001b]7501;state=${state}\u0007`);
}

function label(): string | null {
  const got = Bun.spawnSync(['hc', 'get', '--json', terminal], { stdout: 'pipe', stderr: 'pipe' });
  if (got.exitCode !== 0) throw new Error(`hc get ${terminal} failed: ${got.stderr.toString()}`);
  return (
    z.object({ labels: z.record(z.string(), z.string()) }).parse(JSON.parse(got.stdout.toString())).labels[
      'akrogon.transcript'
    ] ?? null
  );
}

let busy: boolean = false;
function received(input: string): void {
  appendFileSync(resolve(out, 'inputs.jsonl'), `${JSON.stringify({ input, busy, label: label() })}\n`);
}

function endTurn(): void {
  status('idle');
  busy = false;
  appendFileSync(
    resolve(out, 'inputs.jsonl'),
    `${JSON.stringify({ turnEnd: new Date().toISOString(), transcript })}\n`,
  );
}

async function turn(input: string): Promise<void> {
  busy = true;
  status('working');
  if (transcript === null || pendingSwitch) {
    transcript = open(kind === 'pi' && transcript === null && flag !== -1 ? args[flag + 1] : randomUUID());
    pendingSwitch = false;
  }
  write(record('user', input));
  if (input.startsWith('hold')) await readFile(resolve(out, 'release'));
  else await Bun.sleep(300);
  write(record('assistant', 'done'));
  endTurn();
}

// claude answers a pasted `/rename <name>` with the command alone (no model reply): one hc turn writing
// custom-title and agent-name records; the stored name is carried to the next /clear transcript.
let agentName: string | null = null;
async function renameTurn(input: string): Promise<void> {
  busy = true;
  status('working');
  agentName = input.slice('/rename '.length);
  write({ type: 'custom-title', customTitle: agentName });
  write({ type: 'agent-name', agentName });
  if (agentName.startsWith('hold')) await readFile(resolve(out, 'release'));
  else await Bun.sleep(300);
  endTurn();
}

// claude runs /clear as a short turn of its own: its status leaves working once (hc's turn moves) and the
// new conversation opens with the command, before any prompt. On t3k that turn ended 2 ms after the
// helper's warm-up went in and 45 ms before claude wrote the warm-up into the transcript; the stand-in ends
// its /clear turn when the next line arrives and starts that line's turn a moment later. A line typed
// meanwhile finds A working, so hc counts it started at the pre-clear turn; it is not busy input.
let endClear: (() => void) | null = null;
async function clearTurn(): Promise<void> {
  status('working');
  if (mode === 'switch') {
    transcript = open(randomUUID());
    if (agentName !== null) write({ type: 'custom-title', customTitle: agentName });
    write({ type: 'system', subtype: 'local_command', content: '<command-name>/clear</command-name>' });
  }
  await new Promise<void>((done) => {
    endClear = done;
  });
  status('idle');
  await Bun.sleep(300);
}

// Lines are logged on receipt, so one typed while a turn runs shows busy; turns then run in order.
// codex and pi start no turn on /new: the next prompt writes the new transcript. agy's /clear runs no turn
// either but opens the new conversation at once.
let queue: Promise<void> = Promise.resolve();
function take(input: string): void {
  received(input);
  if (endClear !== null) {
    endClear();
    endClear = null;
  }
  if (kind === 'claude' && input.startsWith('/rename ')) {
    queue = queue.then(() => renameTurn(input));
    return;
  }
  if (input === resetLine) {
    queue = queue.then(() => {
      if (kind === 'claude') return clearTurn();
      if (mode === 'switch' && kind === 'agy') transcript = open(randomUUID());
      else if (mode === 'switch') pendingSwitch = true;
    });
    return;
  }
  queue = queue.then(() => turn(input));
}

status('idle');
take(first);
for await (const line of console) take(line.trim());
