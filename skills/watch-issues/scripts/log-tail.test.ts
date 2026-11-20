// Fixture provenance (all under scripts/fixtures/, captured verbatim, never hand-edited):
// - claude-session.jsonl: claude 2.1.287 (Claude Code), captured 2026-10-02 in a fresh mktemp cwd holding note.txt:
//   claude -p "Run the shell command `false` three times, one at a time, then run `echo done`. Then read the file note.txt and edit it to say bye. Reply with one word." --model claude-haiku-4-5-20251001 --allowedTools Bash,Read,Edit
// - pi-session.jsonl: pi 1.0.0, captured 2026-10-02 in a fresh mktemp cwd (/tmp/log-tail-u2-4A5xZc) holding note.txt:
//   env -u PI_CODING_AGENT -u PI_SESSION_FILE -u PI_SESSION_ID -u PI_PROVIDER -u PI_MODEL -u PI_REASONING_LEVEL -u TAMDOMA_WORKER_COMMAND pi -p --no-extensions --no-skills --no-context-files "Run the shell command `false` three times, one at a time, then run `echo done`. Then read the file note.txt and edit it to say bye. Reply with one word."
// - codex-session.jsonl: codex-cli 0.160.0, captured 2026-10-02 ~16:50 CEST in a mktemp cwd holding note.txt:
//   codex exec -s workspace-write --skip-git-repo-check 'Run the shell command `false` three times, one at a time, then run `echo done`. Then read the file note.txt and edit it to say bye. Reply with one word.'
// - pi-incident-excerpt.jsonl: verbatim source lines 1, 8, 422, 461-462, 485-488, 684-686 of pi 1.0.0 session log
//   ~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-launch--/2026-10-01T10-40-07-084Z_01a0f70c-cfac-7437-a9a0-f4ec47260613.jsonl (recorded 2026-10-01, emdash-launch incident; excerpt, no capture command).
// - codex-exec-excerpt.jsonl: verbatim source lines 1, 18, 460, 466 of codex-cli 0.160.0 rollout log
//   ~/.codex/sessions/2026/10/02/rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl (recorded 2026-10-02; excerpt, no capture command).
// - pi-exec-u1-excerpt.jsonl: verbatim source lines 1, 30, 31, 78, 79, 94, 95, 102, 103, 178, 179, 185, 186,
//   187, 188 of pi session log
//   ~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-akrogon-watch-timer-u1--/2026-11-20T14-25-44-288Z_01a1f959-5760-75b0-ba6d-92fd661f2b43.jsonl
//   (recorded 2026-11-20, watch-timer U1 worker; excerpt, no capture command). Pairs were chosen for a
//   multi-call trace, a running trace, an untraced syntax-error result, an edit and a write trace, a
//   non-zero bash exit, and two identical bash commands.
// Expected lines below are derived from fixture contents and the output contract only; expected
// identity hashes are computed in-test with sha8() over the recorded strings.

import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const logTail: string = join(import.meta.dir, 'log-tail.ts');
const fixtures: string = join(import.meta.dir, 'fixtures');

type RunResult = { code: number; stdout: string; stderr: string };

async function runLogTail(logPath: string): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, logTail, logPath], {
    cwd: import.meta.dir,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code]: [string, string, number] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, stdout, stderr };
}

function sha8(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 8);
}

// One output line per record; per-line trailing whitespace is a print detail the contract leaves open.
function lines(stdout: string): string[] {
  return stdout.split('\n').map((l) => l.trimEnd()).filter((l) => l !== '');
}

function tmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'log-tail-test-'));
}

function writeLog(dir: string, records: string[]): string {
  const path: string = join(dir, 'session.jsonl');
  writeFileSync(path, records.join('\n') + '\n');
  return path;
}

// Minimal record builders for hand-written edge inputs.
function claudeCall(id: string, ts: string, name: string, input: Record<string, unknown>): string {
  return JSON.stringify({
    type: 'assistant',
    timestamp: ts,
    sessionId: 's1',
    message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] },
  });
}

function claudeResult(uid: string, ts: string, content: string): string {
  return JSON.stringify({
    type: 'user',
    timestamp: ts,
    sessionId: 's1',
    message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: uid, content, is_error: false }] },
  });
}

function codexCall(id: string, ts: string, input: string): string {
  return JSON.stringify({
    timestamp: ts,
    type: 'response_item',
    payload: { type: 'custom_tool_call', call_id: id, name: 'exec', input },
  });
}

function codexOutput(id: string, ts: string, blocks: string[]): string {
  return JSON.stringify({
    timestamp: ts,
    type: 'response_item',
    payload: {
      type: 'custom_tool_call_output',
      call_id: id,
      output: blocks.map((text) => ({ type: 'input_text', text })),
    },
  });
}

const CODEX_META: string = JSON.stringify({ timestamp: 't0', type: 'session_meta', payload: {} });

const PI_SESSION: string = JSON.stringify({ type: 'session' });

function piExecCall(id: string, ts: string, code: string): string {
  return JSON.stringify({
    type: 'message',
    timestamp: ts,
    message: { role: 'assistant', content: [{ type: 'toolCall', id, name: 'exec', arguments: { code } }] },
  });
}

function flat(s: string): string {
  return s.replace(/\r/g, '␍').replace(/\n/g, '⏎');
}

function cutLike(s: string): string {
  const f: string = flat(s);
  return f.length > 120 ? f.slice(0, 120) + '…' : f;
}

// pi-incident-excerpt.jsonl tool calls, read straight from the fixture so expected
// identities hash the recorded strings, not hand-copied ones.
type PiCall = { ts: string; name: string; command: string; path: string; oldJoined: string; newJoined: string };

function piIncidentCalls(): PiCall[] {
  const out: PiCall[] = [];
  for (const line of readFileSync(join(fixtures, 'pi-incident-excerpt.jsonl'), 'utf8').split('\n')) {
    if (line === '') continue;
    const rec = JSON.parse(line) as {
      timestamp?: string;
      message?: {
        role?: string;
        content?: Array<{
          type?: string;
          name?: string;
          arguments?: { command?: string; path?: string; edits?: Array<{ oldText: string; newText: string }> };
        }>;
      };
    };
    for (const c of rec.message?.content ?? []) {
      if (c.type !== 'toolCall') continue;
      const args = c.arguments ?? {};
      out.push({
        ts: rec.timestamp ?? '',
        name: c.name ?? '',
        command: args.command ?? '',
        path: args.path ?? '',
        oldJoined: (args.edits ?? []).map((e) => e.oldText).join(''),
        newJoined: (args.edits ?? []).map((e) => e.newText).join(''),
      });
    }
  }
  return out;
}

// ---- fixture: claude-session.jsonl ----

const CLAUDE_NOTE: string = '/var/tmp/akrogon-1000/log-tail-d7b9929dab57/tmp.YQjGkd7FgO/note.txt';
const CLAUDE_EDIT_EXCERPT: string =
  'The file ' + CLAUDE_NOTE + ' has been updated successfully. (file state is current in your context — no need to Read it back)';

test('claude fixture: statuses, targets, identities in record order', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'claude-session.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const out: string[] = lines(r.stdout);
  expect(out.length).toBe(6);
  // three 'false' calls: "Exit code 1" text; contract reads exit 1, error is the open alternative
  const falseTs: string[] = ['2026-10-02T14:50:03.748Z', '2026-10-02T14:50:05.265Z', '2026-10-02T14:50:06.559Z'];
  for (let i: number = 0; i < 3; i++) {
    expect(out[i]).toMatch(new RegExp('^' + falseTs[i] + ' Bash false #' + sha8('false') + ' -> (exit 1|error): Exit code 1$'));
  }
  // same command -> same identity; different command -> different identity
  const falseIds: string[] = out.slice(0, 3).map((l) => (l.match(/#([0-9a-f]{8})/) ?? ['', ''])[1]);
  const echoId: string = (out[3].match(/#([0-9a-f]{8})/) ?? ['', ''])[1];
  expect(new Set(falseIds).size).toBe(1);
  expect(echoId).not.toBe(falseIds[0]);
  expect(out[3]).toBe('2026-10-02T14:50:07.796Z Bash echo done #' + sha8('echo done') + ' -> ok: done');
  expect(out[4]).toBe('2026-10-02T14:50:10.139Z Read ' + CLAUDE_NOTE + ' - -> ok: 1\thello');
  expect(out[5]).toBe(
    '2026-10-02T14:50:11.836Z Edit ' + CLAUDE_NOTE +
      ' old#' + sha8('hello') + ' new#' + sha8('bye') +
      ' -> ok: ' + CLAUDE_EDIT_EXCERPT.slice(0, 120) + '…',
  );
});

// ---- fixture: codex-session.jsonl ----

test('codex fixture: literal cmd targets, per-block statuses, inner output excerpts', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'codex-session.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const out: string[] = lines(r.stdout);
  // first block of every result is envelope prose ("Script completed\nWall time...") -> unknown
  expect(out).toEqual([
    '2026-10-02T14:50:27.010Z exec false #' + sha8('false') + ' -> unknown,exit 1:',
    '2026-10-02T14:50:31.073Z exec false #' + sha8('false') + ' -> unknown,exit 1:',
    '2026-10-02T14:50:34.857Z exec false #' + sha8('false') + ' -> unknown,exit 1:',
    '2026-10-02T14:50:40.217Z exec echo done #' + sha8('echo done') + ' -> unknown,ok: done',
    '2026-10-02T14:50:44.793Z exec cat note.txt #' + sha8('cat note.txt') + ' -> unknown,ok: hello',
    // apply_patch result block is '{}' -> unknown; second exec_command result exit_code 0 -> ok, output "bye"
    '2026-10-02T14:50:51.243Z exec cat note.txt #' + sha8('cat note.txt') + ' -> unknown,unknown,ok: bye',
  ]);
  // the excerpt is the inner "output" field, never envelope text
  for (const l of out) expect(l).not.toContain('Script completed');
});

// ---- fixture: pi-session.jsonl ----

test('pi fixture: isError+text exits, targets, edit old#/new# identities', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'pi-session.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  // this capture has no details.capture.termination; failures come from isError:true + "Command exited with code 1"
  expect(lines(r.stdout)).toEqual([
    '2026-10-02T14:52:01.217Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
    '2026-10-02T14:52:03.831Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
    '2026-10-02T14:52:06.948Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
    '2026-10-02T14:52:08.897Z bash echo done #' + sha8('echo done') + ' -> ok: done',
    '2026-10-02T14:52:10.556Z read note.txt - -> ok: hello',
    '2026-10-02T14:52:13.129Z edit note.txt old#' + sha8('hello\n') + ' new#' + sha8('bye\n') +
      ' -> ok: Successfully replaced 1 block(s) in note.txt.',
  ]);
});

// ---- fixture: pi-incident-excerpt.jsonl ----

test('pi incident excerpt: recorded exits 1/143/2 surface, edits show target and old#/new#', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'pi-incident-excerpt.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const out: string[] = lines(r.stdout);
  // source lines 422/684/686 record results with details.capture.termination exitCode 1/143/2, isError:false
  expect(r.stdout).toMatch(/-> exit 1:/);
  expect(r.stdout).toMatch(/-> exit 143:/);
  expect(r.stdout).toMatch(/-> exit 2:/);
  const calls: PiCall[] = piIncidentCalls();
  // the pgrep call pairs in-file to the exit-2 result
  const pgrep: PiCall = calls.filter((c) => c.name === 'bash' && c.command.startsWith('pgrep'))[0];
  const pgrepLine: string | undefined = out.find((l) => l.startsWith(pgrep.ts + ' bash ' + pgrep.command));
  expect(pgrepLine).toBeDefined();
  expect(pgrepLine!).toContain('#' + sha8(pgrep.command));
  expect(pgrepLine!).toMatch(/-> exit 2:/);
  // capture-log "[exit N. Full output ...]" lines are metadata, not excerpt
  expect(pgrepLine!).not.toContain('Full output');
  // three edit calls on launch-core.ts; the recorded path is 125 chars so the target ends '…'
  const edits: PiCall[] = calls.filter((c) => c.name === 'edit');
  expect(edits.length).toBe(3);
  for (const e of edits) {
    const expected: string =
      e.ts + ' edit ' + e.path.slice(0, 120) + '… old#' + sha8(e.oldJoined) + ' new#' + sha8(e.newJoined) + ' -> ok:';
    const hit: string | undefined = out.find((l) => l.startsWith(expected));
    expect(hit, 'edit line for ' + e.ts + ' missing or wrong').toBeDefined();
    expect(hit!).toContain('old#');
    expect(hit!).toContain('new#');
  }
});

// ---- fixture: codex-exec-excerpt.jsonl ----

test('codex exec excerpt: joined literal cmds, multi-block status, session <expr>', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'codex-exec-excerpt.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const out: string[] = lines(r.stdout);
  // source line 18: Promise.allSettled batch of three literal exec_command cmds
  const cmds: string[] = [
    'akrogon config',
    'cat /home/ivan/.codex/skills/check-issue/ponytail.md',
    "pwd; rg --files -g AGENTS.md -g akrogon.yaml -g '!node_modules' -g '!vendor' /home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-operations/emdash-fleet-backup /home/ivan/Work/infra/tamdoma/framework/issues/worktrees/emdash-fleet-backup",
  ];
  const joined: string = cmds.join(' ; ');
  const callLine: string | undefined = out.find((l) => l.startsWith('2026-10-02T10:46:12.075Z exec '));
  expect(callLine).toBeDefined();
  // the joined target exceeds 120 chars: each command prefix visible in source order, cut marked '…'
  expect(callLine!).toContain(cmds[0] + ' ; ' + cmds[1] + ' ; ' + 'pwd; rg --files');
  expect(callLine!).toContain('…');
  // identity hashes the full joined target before the 120-char cut
  expect(callLine!).toContain('#' + sha8(joined));
  // output of source line 460: envelope + exit_code 1 + exit_code 0 + two session_id blocks, in block order
  expect(r.stdout).toContain('unknown,exit 1,ok,running,running');
  // source line 466: cmd is an interpolated template -> <expr>; write_stdin session_id is non-literal -> session <expr>
  const stdinLine: string | undefined = out.find((l) => l.includes('session <expr>'));
  expect(stdinLine).toBeDefined();
  expect(stdinLine!).toContain('#-');
  expect(stdinLine!).toContain('<expr>');
});

// ---- hand-written edge inputs ----

test('edge a: 21 calls print exactly the last 20, oldest first', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const recs: string[] = [];
    for (let i: number = 0; i < 21; i++) {
      recs.push(claudeCall('c' + i, 't' + i, 'Bash', { command: 'cmd' + i }));
      recs.push(claudeResult('c' + i, 'r' + i, 'out ' + i));
    }
    const r: RunResult = await runLogTail(writeLog(dir, recs));
    expect(r.code, r.stderr).toBe(0);
    const expected: string[] = [];
    for (let i: number = 1; i <= 20; i++) expected.push('t' + i + ' Bash cmd' + i + ' #' + sha8('cmd' + i) + ' -> ok: out ' + i);
    expect(lines(r.stdout)).toEqual(expected);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge b: commands sharing the first 120 chars get different identities', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const base: string = 'x'.repeat(120);
    const r: RunResult = await runLogTail(writeLog(dir, [
      claudeCall('a', 't1', 'Bash', { command: base + 'A' }),
      claudeResult('a', 'r1', 'done'),
      claudeCall('b', 't2', 'Bash', { command: base + 'B' }),
      claudeResult('b', 'r2', 'done'),
    ]));
    expect(r.code, r.stderr).toBe(0);
    // both printed targets cut identically; identity hashes the full joined target
    expect(lines(r.stdout)).toEqual([
      't1 Bash ' + base + '… #' + sha8(base + 'A') + ' -> ok: done',
      't2 Bash ' + base + '… #' + sha8(base + 'B') + ' -> ok: done',
    ]);
    expect(sha8(base + 'A')).not.toBe(sha8(base + 'B'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge c: two different non-literal cmds both print #-', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const r: RunResult = await runLogTail(writeLog(dir, [
      CODEX_META,
      codexCall('c1', 't1', 'text(await tools.exec_command({cmd: someVar,max_output_tokens:1000}));'),
      codexOutput('c1', 'o1', ['{"exit_code":0,"output":"one"}']),
      codexCall('c2', 't2', 'text(await tools.exec_command({cmd:`x${y}`,max_output_tokens:1000}));'),
      codexOutput('c2', 'o2', ['{"exit_code":0,"output":"two"}']),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      't1 exec <expr> #- -> ok: one',
      't2 exec <expr> #- -> ok: two',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge d: a non-JSON exec output block prints unknown', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const r: RunResult = await runLogTail(writeLog(dir, [
      CODEX_META,
      codexCall('c1', 't1', 'text(await tools.exec_command({cmd:"whoami"}));'),
      codexOutput('c1', 'o1', ['this is not json']),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual(['t1 exec whoami #' + sha8('whoami') + ' -> unknown:']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge e: an edit then its exact inverse swap old#/new#', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const r: RunResult = await runLogTail(writeLog(dir, [
      claudeCall('e1', 't1', 'Edit', { file_path: 'f.txt', old_string: 'AAA', new_string: 'BBB' }),
      claudeResult('e1', 'r1', 'done'),
      claudeCall('e2', 't2', 'Edit', { file_path: 'f.txt', old_string: 'BBB', new_string: 'AAA' }),
      claudeResult('e2', 'r2', 'done'),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      't1 Edit f.txt old#' + sha8('AAA') + ' new#' + sha8('BBB') + ' -> ok: done',
      't2 Edit f.txt old#' + sha8('BBB') + ' new#' + sha8('AAA') + ' -> ok: done',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge f: target and excerpt over 120 chars end with …', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const cmd: string = 'c'.repeat(130);
    const big: string = 'o'.repeat(130);
    const r: RunResult = await runLogTail(writeLog(dir, [
      claudeCall('b1', 't1', 'Bash', { command: cmd }),
      claudeResult('b1', 'r1', big),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      't1 Bash ' + 'c'.repeat(120) + '… #' + sha8(cmd) + ' -> ok: ' + 'o'.repeat(120) + '…',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge g: a call with no result record prints running', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const r: RunResult = await runLogTail(writeLog(dir, [
      claudeCall('b1', 't1', 'Bash', { command: 'sleep 99' }),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual(['t1 Bash sleep 99 #' + sha8('sleep 99') + ' -> running:']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge h: an unterminated final record is skipped, earlier calls still print', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const path: string = join(dir, 'session.jsonl');
    // second record has no trailing newline -> unterminated fragment the seat is still writing
    writeFileSync(path, [
      claudeCall('b1', 't1', 'Bash', { command: 'true' }),
      claudeResult('b1', 'r1', 'done'),
      '',
    ].join('\n') + claudeCall('b2', 't2', 'Bash', { command: 'false' }));
    const r: RunResult = await runLogTail(path);
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual(['t1 Bash true #' + sha8('true') + ' -> ok: done']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge i: a complete unparsable record exits non-zero naming path and line', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const path: string = writeLog(dir, [
      claudeCall('b1', 't1', 'Bash', { command: 'true' }),
      claudeResult('b1', 'r1', 'done'),
      '{oops',
    ]);
    const r: RunResult = await runLogTail(path);
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain(path);
    expect(r.stderr).toContain('3');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('edge j: missing file and unknown format exit non-zero naming the path', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const missing: string = join(dir, 'nope.jsonl');
    const r1: RunResult = await runLogTail(missing);
    expect(r1.code).not.toBe(0);
    expect(r1.stdout.trim()).toBe('');
    expect(r1.stderr).toContain(missing);
    const unknown: string = writeLog(dir, ['{"a":1}', '{"b":2}']);
    const r2: RunResult = await runLogTail(unknown);
    expect(r2.code).not.toBe(0);
    expect(r2.stdout.trim()).toBe('');
    expect(r2.stderr).toContain(unknown);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Recorded Codex source: rollout-2026-10-02T12-45-55-01a0fc38-7cb2-7f31-8388-738b9b09bf4b.jsonl, line 334.
test('concatenated recorded command has no literal identity', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const code: string = "const dir=load(\"recheckTmp\");const base=\"./.claude/skills/admin-emdash-fleet/test/\";\nconst names=[\"backup-site\",\"backup-store\",\"export-tool\",\"fleet\",\"fleet-lock\",\"register\",\"restore-drill\",\"schedule-install\"];\ntext(await tools.exec_command({cmd:\"bun test \"+names.map(n=>base+n+\".test.ts\").join(\" \")+\" > \"+dir+\"/unit.log 2>&1; result=$?; tail -n 6 \"+dir+\"/unit.log; exit \\\"$result\\\"\",max_output_tokens:800,yield_time_ms:10000}));\n";
    const r: RunResult = await runLogTail(writeLog(dir, [
      CODEX_META,
      codexCall('call_XeabmjvlKAMz9PwGwEd5AqR5', '2026-10-02T11:35:12.999Z', code),
    ]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual(['2026-10-02T11:35:12.999Z exec <expr> #- -> running:']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Recorded pi source: 2026-09-13T23-58-25-640Z_01a09d35-3768-73ed-8f93-ac97197d0b25.jsonl, lines 13, 15.
test('pi exec running: literal tools.bash commands print command and #hash', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const cmd1: string =
      'wc -l /home/ivan/.pi/agent/extensions/tamdoma-subagents/{index,tools,setup-tools,formatting,command-output,ui,paths,identity,capabilities,install,read-pdf,schemas,host-proof,lifecycle-proof}.ts; echo ---; cat /home/ivan/.pi/agent/extensions/tamdoma-subagents/package.json';
    const cmd2: string =
      'cat -n /home/ivan/.pi/agent/extensions/tamdoma-subagents/index.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/setup-tools.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/paths.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/identity.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/capabilities.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/schemas.ts';
    const records: string[] = ["{\"type\": \"session\"}", "{\"type\": \"message\", \"timestamp\": \"2026-09-13T23:58:36.812Z\", \"message\": {\"role\": \"assistant\", \"content\": [{\"type\": \"toolCall\", \"id\": \"call_01a09d355fb07c82a4ad187ba2ca9a1a|fc_01a09d355fb07c82a4ad187ba2ca9a1a\", \"name\": \"exec\", \"arguments\": {\"code\": \"const r = await tools.bash({command:\\\"wc -l /home/ivan/.pi/agent/extensions/tamdoma-subagents/{index,tools,setup-tools,formatting,command-output,ui,paths,identity,capabilities,install,read-pdf,schemas,host-proof,lifecycle-proof}.ts; echo ---; cat /home/ivan/.pi/agent/extensions/tamdoma-subagents/package.json\\\"});\\ntext(r);\"}}]}}", "{\"type\": \"message\", \"timestamp\": \"2026-09-13T23:58:40.010Z\", \"message\": {\"role\": \"assistant\", \"content\": [{\"type\": \"toolCall\", \"id\": \"call_01a09d356bc67bb29a614f47760919d6|fc_01a09d356bc67bb29a614f47760919d6\", \"name\": \"exec\", \"arguments\": {\"code\": \"const r = await tools.bash({command:\\\"cat -n /home/ivan/.pi/agent/extensions/tamdoma-subagents/index.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/setup-tools.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/paths.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/identity.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/capabilities.ts /home/ivan/.pi/agent/extensions/tamdoma-subagents/schemas.ts\\\"});\\ntext(String(r).slice(0, 30000));\"}}]}}"];
    const r: RunResult = await runLogTail(writeLog(dir, records));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      '2026-09-13T23:58:36.812Z bash ' + cutLike(cmd1) + ' #' + sha8(cmd1) + ' -> running:',
      '2026-09-13T23:58:40.010Z bash ' + cutLike(cmd2) + ' #' + sha8(cmd2) + ' -> running:',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- fixture: pi-exec-u1-excerpt.jsonl ----

// Expected output lines for the fixture, derived by walking its records in order: every exec call
// without a result yields one scanned line per literal tools.* call, every traced result yields one
// line per inner call, an untraced result yields the single `exec  #- -> unknown:` line.
test('pi exec traced: per-inner-call lines from details.traces', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'pi-exec-u1-excerpt.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const out: string[] = lines(r.stdout);

  const recs: unknown[] = readFileSync(join(fixtures, 'pi-exec-u1-excerpt.jsonl'), 'utf8')
    .split('\n')
    .filter((l) => l !== '')
    .map((l) => JSON.parse(l));
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  // the arg regex reads the first literal for key in the remainder; fixture scan code is literal-only
  const litArg = (rest: string, key: string): string | null => {
    const mm = new RegExp('\\b' + key + '\\s*:\\s*([\'"`])((?:\\\\.|(?!\\1)[^])*)\\1').exec(rest);
    return mm === null ? null : mm[2].replace(/\\(.)/g, '$1');
  };
  const resultIds: Set<string> = new Set();
  const callTs: Map<string, string> = new Map();
  for (const rec of recs) {
    const msg = (rec as { message?: { role?: string; toolCallId?: string; content?: Array<{ type?: string; name?: string; id?: string }> } }).message;
    const ts: string = str((rec as { timestamp?: string }).timestamp);
    if (msg?.role === 'toolResult') resultIds.add(str(msg.toolCallId));
    if (msg?.role === 'assistant') {
      for (const c of msg.content ?? []) if (c.type === 'toolCall' && c.name === 'exec') callTs.set(str(c.id), ts);
    }
  }

  const ordered: string[] = [];
  for (const rec of recs) {
    const ts: string = str((rec as { timestamp?: string }).timestamp);
    const msg = (rec as {
      message?: {
        role?: string;
        toolName?: string;
        toolCallId?: string;
        content?: Array<{ type?: string; name?: string; id?: string; arguments?: { code?: string } }>;
        details?: {
          traces?: Array<{
            name?: string;
            status?: string;
            input?: Record<string, unknown>;
            result?: {
              isError?: boolean;
              details?: { capture?: { termination?: { exitCode?: number } } };
            };
          }>;
        };
      };
    }).message;
    if (msg?.role === 'assistant') {
      // unpaired exec calls print their scanned literal tools.* calls as running lines
      for (const c of msg.content ?? []) {
        if (c.type !== 'toolCall' || c.name !== 'exec' || resultIds.has(str(c.id))) continue;
        const code: string = str(c.arguments?.code);
        for (const m of code.matchAll(/\btools\.(bash|edit|read|write|ls)\s*\(/g)) {
          const rest: string = code.slice(m.index);
          const name: string = m[1];
          if (name === 'bash') {
            const cmd: string | null = litArg(rest, 'command');
            ordered.push(cmd === null ? ts + ' bash <expr> #- -> running:' : ts + ' bash ' + cutLike(cmd) + ' #' + sha8(cmd) + ' -> running:');
          } else if (name === 'edit') {
            const path: string | null = litArg(rest, 'path');
            const oldT: string | null = litArg(rest, 'oldText');
            const newT: string | null = litArg(rest, 'newText');
            ordered.push(
              path !== null && oldT !== null && newT !== null
                ? ts + ' edit ' + cutLike(path) + ' old#' + sha8(oldT) + ' new#' + sha8(newT) + ' -> running:'
                : ts + ' edit ' + (path === null ? '<expr>' : cutLike(path)) + ' - -> running:',
            );
          } else {
            const path: string | null = litArg(rest, 'path');
            ordered.push(ts + ' ' + name + ' ' + (path === null ? '<expr>' : cutLike(path)) + ' - -> running:');
          }
        }
      }
    } else if (msg?.role === 'toolResult' && msg.toolName === 'exec') {
      const traces = msg.details?.traces;
      if (traces === undefined || traces.length === 0) {
        // the kept exec line stamps the call's time, not the result's
        ordered.push((callTs.get(str(msg.toolCallId)) ?? ts) + ' exec  #- -> unknown:');
        continue;
      }
      for (const t of traces) {
        const input = t.input ?? {};
        const name: string = str(t.name);
        const term = t.result?.details?.capture?.termination;
        const isError: boolean = t.result?.isError === true;
        if (t.status === 'running' || name === 'bash') {
          const cmd: string = str(input.command);
          const status: string =
            t.status === 'running' ? 'running' : term?.exitCode === undefined ? (isError ? 'error' : 'ok') : term.exitCode === 0 ? 'ok' : 'exit ' + term.exitCode;
          ordered.push(ts + ' ' + name + ' ' + cutLike(cmd) + ' #' + sha8(cmd) + ' -> ' + status + (t.status === 'running' ? ':' : ': '));
        } else if (name === 'edit') {
          const edits = (input.edits ?? []) as Array<{ oldText: string; newText: string }>;
          const idt: string = 'old#' + sha8(edits.map((e) => e.oldText).join('')) + ' new#' + sha8(edits.map((e) => e.newText).join(''));
          ordered.push(ts + ' edit ' + cutLike(str(input.path)) + ' ' + idt + ' -> ' + (isError ? 'error' : 'ok') + ': ');
        } else {
          ordered.push(ts + ' ' + name + ' ' + cutLike(str(input.path)) + ' - -> ' + (isError ? 'error' : 'ok') + ': ');
        }
      }
    }
  }

  expect(out.length).toBe(ordered.length);
  // lines ending ': ' assert a prefix (excerpt follows); the rest assert full equality
  for (let i = 0; i < ordered.length; i++) {
    const exp: string = ordered[i];
    if (exp.endsWith(': ')) expect(out[i].startsWith(exp), 'line ' + i + ': ' + out[i]).toBe(true);
    else expect(out[i], 'line ' + i).toBe(exp);
  }
  // identical commands in different execs share one identity (the two grep -v pairs)
  const hashes: string[] = out.map((l) => (l.match(/#([0-9a-f]{8})/) ?? ['', ''])[1]).filter((h) => h !== '');
  const counts: Map<string, number> = new Map();
  for (const h of hashes) counts.set(h, (counts.get(h) ?? 0) + 1);
  expect([...counts.values()].some((c) => c === 2)).toBe(true);
  // the only surviving exec line is the untraced one, and it carries no counting identity
  const execLines: string[] = out.filter((l) => l.includes(' exec '));
  expect(execLines).toEqual(['2026-11-20T14:56:33.649Z exec  #- -> unknown:']);
  // no bash line excerpt is the [exit N. metadata line
  for (const l of out.filter((l) => l.includes(' bash '))) expect(l).not.toContain('[exit ');
});

test('pi exec running: tools calls in code print one line each, in order', async (): Promise<void> => {
  const dir: string = tmpDir();
  try {
    const code: string = [
      'const a = await tools.bash({command: "echo hi"});',
      'const b = await tools.bash({command: someVar});',
      'const e = await tools.edit({path: "src/x.ts", edits: [{oldText: "a", newText: "b"}]});',
      'const w = await tools.write({path: "src/y.ts", content: "c"});',
      'const r = await tools.read({path: p});',
      'const l = await tools.ls({path: "."});',
    ].join('\n');
    const r: RunResult = await runLogTail(writeLog(dir, [PI_SESSION, piExecCall('x1', 't1', code)]));
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      't1 bash echo hi #' + sha8('echo hi') + ' -> running:',
      't1 bash <expr> #- -> running:',
      't1 edit src/x.ts old#' + sha8('a') + ' new#' + sha8('b') + ' -> running:',
      't1 write src/y.ts - -> running:',
      't1 read <expr> - -> running:',
      't1 ls . - -> running:',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Verbatim lines 1, 49–50 of the design-close-evidence-u3 pi recording
// 2026-11-18T19-54-32-148Z_01a1f039-a554-765a-a7d2-21860b1c24dc.jsonl (review B F1).
test('pi exec recorded edit failure prints error', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'pi-exec-error-excerpt.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  expect(lines(r.stdout)).toEqual([
    expect.stringMatching(/^\S+ edit .+ old#[0-9a-f]{8} new#[0-9a-f]{8} -> error: \S/),
  ]);
});

// Verbatim lines 1, 364–367 of the resolver-log-path-u4 pi recording
// 2026-11-12T23-00-45-260Z_01a1d1fd-fa4c-7494-a60c-f399eca2d400.jsonl (review B F2).
test('pi exec recorded wait completes bash trace', async (): Promise<void> => {
  const r: RunResult = await runLogTail(join(fixtures, 'pi-exec-wait-excerpt.jsonl'));
  expect(r.code, r.stderr).toBe(0);
  const bashLines: string[] = lines(r.stdout).filter((line) => /^\S+ bash /.test(line));
  expect(bashLines).toEqual([expect.stringMatching(/ #15457a9c -> exit 1:/)]);
});
