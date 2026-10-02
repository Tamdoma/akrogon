// Proves observe->log-tail wiring only: real observe.ts prints a working pi seat's session
// path as logA, and real log-tail.ts summarizes that file. The watch's judgment is out of scope.
// Fixture provenance (captured verbatim, never hand-edited; copied out to a temp path, fixtures/ is never written):
// - pi-session.jsonl: pi 1.0.0, captured 2026-10-02 in a fresh mktemp cwd (/tmp/log-tail-u2-4A5xZc) holding note.txt:
//   env -u PI_CODING_AGENT -u PI_SESSION_FILE -u PI_SESSION_ID -u PI_PROVIDER -u PI_MODEL -u PI_REASONING_LEVEL -u TAMDOMA_WORKER_COMMAND pi -p --no-extensions --no-skills --no-context-files "Run the shell command `false` three times, one at a time, then run `echo done`. Then read the file note.txt and edit it to say bye. Reply with one word."
// Expected lines are derived from fixture contents and the output contract only; expected
// identity hashes are computed in-test with sha8() over the recorded strings.

import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const observe: string = join(import.meta.dir, 'observe.ts');
const logTail: string = join(import.meta.dir, 'log-tail.ts');

type RunResult = { code: number; stdout: string; stderr: string };

async function run(argv: string[], envExtra?: NodeJS.ProcessEnv): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(argv, {
    cwd: import.meta.dir,
    env: { ...process.env, ...envExtra },
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

function stub(path: string, body: string): string {
  writeFileSync(path, body);
  chmodSync(path, 0o755);
  return path;
}

function akrogonOk(dir: string, repo: string = 'testrepo'): string {
  return stub(join(dir, 'akrogon-stub'), '#!/usr/bin/env bun\nconsole.log(' + JSON.stringify('repo: ' + repo) + ');\n');
}

type AgentStub = {
  pane_id: string;
  agent_status: string;
  agent?: string;
  cwd?: string;
  agent_session?: { kind: 'id' | 'path'; value: string } | null;
};

function herdrOk(dir: string, agents: AgentStub[]): string {
  const payload: string = JSON.stringify({ result: { agents } });
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.log(' + JSON.stringify(payload) + ');\n');
}

function baseState(slug: string, phase: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug,
    phase,
    created: '2026-09-10',
    repo: 'testrepo',
    debate: 'no',
    'blocked-by': [],
    ...extra,
  };
}

function writeLeaf(root: string, owner: string, slug: string, data: Record<string, unknown>): string {
  const dir: string = resolve(root, 'issues/open', owner, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'state.yaml'), Bun.YAML.stringify(data));
  return dir;
}

function sha8(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 8);
}

// One output line per record; per-line trailing whitespace is a print detail the contract leaves open.
function lines(stdout: string): string[] {
  return stdout.split('\n').map((l) => l.trimEnd()).filter((l) => l !== '');
}

test('observe logA path feeds log-tail: pi fixture summarizes to six calls', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-log-tail-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-log-tail-home-'));
  try {
    writeLeaf(root, 'owner', 'wire-pi', baseState('wire-pi', 'implement', { pane: { A: 'pane-p' } }));
    const log: string = join(home, '.pi/agent/sessions/test/pi-session.jsonl');
    mkdirSync(dirname(log), { recursive: true });
    copyFileSync(join(import.meta.dir, 'fixtures/pi-session.jsonl'), log);
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-p', agent_status: 'working', agent: 'pi', agent_session: { kind: 'path', value: log } },
    ]);
    const seen: RunResult = await run([process.execPath, observe, root], {
      OBSERVE_AKROGON: akrogon,
      OBSERVE_HERDR: herdr,
      HOME: home,
    });
    expect(seen.code, seen.stderr).toBe(0);
    expect(lines(seen.stdout)).toEqual([
      `slug=wire-pi phase=implement attempts=A0,B0 blocked= A=pane-p/working logA=${log} B=-/- notified=`,
    ]);
    const logA: RegExpMatchArray | null = seen.stdout.match(/ logA=(\S+)/);
    expect(logA).not.toBeNull();
    const tail: RunResult = await run([process.execPath, logTail, logA![1]]);
    expect(tail.code, tail.stderr).toBe(0);
    // this capture has no details.capture.termination; failures come from isError:true + "Command exited with code 1"
    expect(lines(tail.stdout)).toEqual([
      '2026-10-02T14:52:01.217Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:03.831Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:06.948Z bash false #' + sha8('false') + ' -> exit 1: (no output)',
      '2026-10-02T14:52:08.897Z bash echo done #' + sha8('echo done') + ' -> ok: done',
      '2026-10-02T14:52:10.556Z read note.txt - -> ok: hello',
      '2026-10-02T14:52:13.129Z edit note.txt old#' + sha8('hello\n') + ' new#' + sha8('bye\n') +
        ' -> ok: Successfully replaced 1 block(s) in note.txt.',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});
