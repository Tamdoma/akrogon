#!/usr/bin/env bun
// Scratch probe of the in-place door reset; discarded after charting.
import { spawn } from 'node:child_process';
import { openSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';

type Row = { pane_id: string; agent?: string | null; agent_status?: string; agent_session?: { value: string; source?: string } | null; screen_detection_skipped?: boolean | null };
const resetCommand: Record<string, string> = { claude: '/clear', codex: '/new', pi: '/new' };

function herdr(args: string[]): { code: number; out: string; err: string } {
  const r = Bun.spawnSync(['herdr', ...args], { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' });
  return { code: r.exitCode ?? -1, out: r.stdout.toString(), err: r.stderr.toString() };
}
function row(pane: string): Row | undefined {
  return (JSON.parse(herdr(['agent', 'list']).out).result.agents as Row[]).find((a) => a.pane_id === pane);
}
function log(step: string, extra: Record<string, unknown> = {}): void {
  process.stdout.write(`${JSON.stringify({ t: new Date().toISOString(), step, ...extra })}\n`);
}
function claudeTurnOpen(session: string): boolean {
  const m = Array.from(new Bun.Glob(`*/${session}.jsonl`).scanSync({ cwd: `${homedir()}/.claude/projects`, absolute: true }));
  const lines = readFileSync(m[0], 'utf8').trimEnd().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const e = JSON.parse(lines[i]);
    if (e.type === 'system' && e.subtype === 'turn_duration') return false;
    if (e.type === 'user' && typeof e.message?.content === 'string') return true;
  }
  return false;
}
function codexTurnOpen(session: string): boolean {
  const m = Array.from(new Bun.Glob(`**/rollout-*-${session}.jsonl`).scanSync({ cwd: `${homedir()}/.codex/sessions`, absolute: true }));
  const lines = readFileSync(m[0], 'utf8').trimEnd().split('\n').map((l) => JSON.parse(l));
  const started = lines.filter((l) => l.payload?.type === 'task_started').at(-1)?.payload?.turn_id;
  return !lines.some((l) => l.payload?.turn_id === started && (l.payload.type === 'task_complete' || l.payload.type === 'turn_aborted'));
}
function ended(kind: string, r: Row, session: string): boolean {
  if (r.agent_status === 'working') return false;
  if (kind === 'claude') return !claudeTurnOpen(session);
  if (kind === 'codex') return !codexTurnOpen(session);
  return r.agent_session?.source === 'herdr:pi' && r.screen_detection_skipped === true && (r.agent_status === 'idle' || r.agent_status === 'done');
}

const [pane, session, logPath, prompt] = process.argv.slice(2);
if (process.env.HANDOVER_CHILD !== '1') {
  const r = row(pane);
  if (r === undefined || !((r.agent ?? '') in resetCommand) || r.agent_session?.value !== session) {
    process.stderr.write(`refused: pane ${pane} holds ${r?.agent} ${r?.agent_session?.value}, expected ${session}\n`);
    process.exit(1);
  }
  const fd = openSync(logPath, 'a');
  spawn(process.execPath, [import.meta.path, ...process.argv.slice(2)], { detached: true, stdio: ['ignore', fd, fd], env: { ...process.env, HANDOVER_CHILD: '1' } }).unref();
  process.stdout.write('queued\n');
  process.exit(0);
}

const kind = row(pane)!.agent!;
log('child', { pid: process.pid, kind });
const deadline = Date.now() + 600_000;
while (true) {
  const r = row(pane)!;
  if (ended(kind, r, session)) { log('turn-ended', { status: r.agent_status }); break; }
  if (Date.now() > deadline) { log('fail', { reason: 'turn end not seen' }); process.exit(1); }
  await Bun.sleep(1000);
}
const again = row(pane);
if (again?.agent !== kind || again.agent_session?.value !== session) { log('fail', { reason: 'identity changed', again }); process.exit(1); }
const sessionsBefore = existsSync(`${homedir()}/.codex/sessions`) ? Array.from(new Bun.Glob('**/rollout-*.jsonl').scanSync({ cwd: `${homedir()}/.codex/sessions` })).length : 0;
const sent = herdr(['agent', 'prompt', pane, resetCommand[kind]]);
log('reset-sent', { code: sent.code, err: sent.err });
let confirmed = false;
for (let i = 0; i < 60 && !confirmed; i++) {
  await Bun.sleep(500);
  const r = row(pane);
  const s = r?.agent_session?.value ?? null;
  const sessionsNow = Array.from(new Bun.Glob('**/rollout-*.jsonl').scanSync({ cwd: `${homedir()}/.codex/sessions` })).length;
  if (i % 4 === 0) log('poll', { session: s, status: r?.agent_status, rollouts: sessionsNow - sessionsBefore });
  confirmed = s !== null && s !== session;
}
log(confirmed ? 'reset-confirmed' : 'reset-unconfirmed', { session: row(pane)?.agent_session?.value });
if (!confirmed && kind !== 'codex') process.exit(1);
const p = herdr(['agent', 'prompt', pane, prompt]);
log('prompt-sent', { code: p.code, err: p.err });
