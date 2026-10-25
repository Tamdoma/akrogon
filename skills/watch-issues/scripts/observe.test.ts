import { expect, test } from 'bun:test';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import { sessionSchema, workspaceSchema } from '../../../src/shell';
import { herdrListSchema } from './observe';

const observe: string = join(import.meta.dir, 'observe.ts');

type RunResult = { code: number; stdout: string; stderr: string };

async function runObserve(root: string, envExtra: NodeJS.ProcessEnv): Promise<RunResult> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, observe, root], {
    cwd: process.cwd(),
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

type SessionStub = {
  name: string;
  running?: boolean;
  workspaces: { workspace_id: string; label: string }[];
  agents?: AgentStub[];
  readError?: string;
};

// Session-dispatching herdr fake: answers `session list --json` (bare object),
// per-session `workspace list` and `agent list`, and logs every argv to
// OBSERVE_HERDR_LOG so tests can prove which calls the observer made.
function herdrStub(dir: string, sessions: SessionStub[], listError?: string): string {
  const data: string = JSON.stringify({ sessions, listError });
  const body: string = `#!/usr/bin/env bun
import { appendFileSync } from 'node:fs';
const DATA = ${data};
const argv = process.argv.slice(2);
if (process.env.OBSERVE_HERDR_LOG !== undefined)
  appendFileSync(process.env.OBSERVE_HERDR_LOG, JSON.stringify(argv) + '\\n');
if (argv[0] === 'session' && argv[1] === 'list' && argv[2] === '--json') {
  if (DATA.listError !== undefined) {
    console.error(JSON.stringify({ error: { code: DATA.listError, message: 'fixture failure' } }));
    process.exit(1);
  }
  console.log(JSON.stringify({ sessions: DATA.sessions.map((s) => ({ name: s.name, running: s.running !== false, socket_path: '/sock/' + s.name, session_dir: '/dir/' + s.name, default: false })) }));
  process.exit(0);
}
let session = 'default';
const args = [...argv];
if (args[0] === '--session') { session = args[1]; args.splice(0, 2); }
const found = DATA.sessions.find((s) => s.name === session);
if (args[0] === 'workspace' && args[1] === 'list') {
  if (found !== undefined && found.readError !== undefined) {
    console.error(JSON.stringify({ error: { code: found.readError, message: 'fixture failure' } }));
    process.exit(1);
  }
  console.log(JSON.stringify({ result: { workspaces: found === undefined ? [] : found.workspaces } }));
  process.exit(0);
}
if (args[0] === 'agent' && args[1] === 'list') {
  console.log(JSON.stringify({ result: { agents: found === undefined ? [] : (found.agents ?? []) } }));
  process.exit(0);
}
console.error('unknown herdr-stub call: ' + argv.join(' '));
process.exit(1);
`;
  return stub(join(dir, 'herdr-stub'), body);
}

function herdrOk(dir: string, agents: AgentStub[]): string {
  return herdrStub(dir, [{ name: 'sess', workspaces: [{ workspace_id: 'w1', label: 'testrepo' }], agents }]);
}

function herdrFail(dir: string): string {
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.error("herdr boom");\nprocess.exit(3);\n');
}

function herdrNonJson(dir: string): string {
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.log("not json");\n');
}

// A `herdr` early on PATH that only records a bypass: any observer call that
// escapes OBSERVE_HERDR lands here. From the 2026-10-15 bun-spawn PATH lesson,
// the shim must sit in the child spawn env's PATH.
function herdrPathShim(dir: string): string {
  const bin: string = join(dir, 'bin');
  mkdirSync(bin, { recursive: true });
  const target: string = stub(
    join(dir, 'herdr-bypassed'),
    "#!/usr/bin/env bun\nimport { appendFileSync } from 'node:fs';\nappendFileSync(process.env.OBSERVE_HERDR_LOG ?? '/dev/null', 'bypassed ' + process.argv.slice(2).join(' ') + '\\n');\nprocess.exit(9);\n",
  );
  symlinkSync(target, join(bin, 'herdr'));
  return bin;
}

function stubCalls(logPath: string): string[][] {
  return readFileSync(logPath, 'utf8')
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => JSON.parse(line) as string[]);
}

function baseState(slug: string, phase: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug,
    phase,
    created: '2026-09-10',
    repo: 'testrepo',
    'blocked-by': [],
    ...extra,
  };
}

// readRepo requires issues/config.yaml; repoSchema parses {} into defaults.
function writeRepoConfig(root: string): void {
  mkdirSync(resolve(root, 'issues'), { recursive: true });
  writeFileSync(resolve(root, 'issues/config.yaml'), 'grounding: none\n');
}

function writeLeaf(root: string, owner: string, slug: string, data: Record<string, unknown>): string {
  writeRepoConfig(root);
  const dir: string = resolve(root, 'issues/open', owner, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'state.yaml'), Bun.YAML.stringify(data));
  return dir;
}

function lines(stdout: string): string[] {
  const t: string = stdout.trim();
  return t === '' ? [] : t.split('\n');
}

function touch(path: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, '');
  return path;
}

test('waiting leaf produces one documented line', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=wait-leaf phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('mixed A working and B idle', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(
      root,
      'owner',
      'mix-leaf',
      baseState('mix-leaf', 'check.review', {
        attempts: { A: 1, B: 2 },
        pane: { A: 'pane-a', B: 'pane-b' },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-a', agent_status: 'working' },
      { pane_id: 'pane-b', agent_status: 'idle' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=mix-leaf phase=check.review attempts=A1,B2 blocked= A=pane-a/working logA=- B=pane-b/idle notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('busy with and without busy_notified', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const now: string = new Date().toISOString();
    writeLeaf(
      root,
      'owner',
      'busy-notified',
      baseState('busy-notified', 'implement', {
        pane: { A: 'pane-n' },
        busy_since: { A: now },
        busy_notified: { A: now },
      }),
    );
    writeLeaf(
      root,
      'owner',
      'busy-plain',
      baseState('busy-plain', 'implement', {
        pane: { A: 'pane-p' },
        busy_since: { A: now },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-n', agent_status: 'working' },
      { pane_id: 'pane-p', agent_status: 'working' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=busy-notified phase=implement attempts=A0,B0 blocked= A=pane-n/working busy=0h00m logA=- B=-/- notified=A',
      'slug=busy-plain phase=implement attempts=A0,B0 blocked= A=pane-p/working busy=0h00m logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('unparsable busy_since prints no suffix', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(
      root,
      'owner',
      'busy-garbage',
      baseState('busy-garbage', 'implement', {
        pane: { A: 'pane-g' },
        busy_since: { A: 'not-a-date' },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [{ pane_id: 'pane-g', agent_status: 'working' }]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=busy-garbage phase=implement attempts=A0,B0 blocked= A=pane-g/working logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('future busy_since prints busy=0h00m', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const future: string = new Date(Date.now() + 3600000).toISOString();
    writeLeaf(
      root,
      'owner',
      'busy-future',
      baseState('busy-future', 'implement', {
        pane: { A: 'pane-f' },
        busy_since: { A: future },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [{ pane_id: 'pane-f', agent_status: 'working' }]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=busy-future phase=implement attempts=A0,B0 blocked= A=pane-f/working busy=0h00m logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('failed blocked appends failure detail', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(
      root,
      'owner',
      'fail-blocked',
      baseState('fail-blocked', 'failed', {
        attempts: { A: 1, B: 2 },
        failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs human', delivery: 'shown' },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=fail-blocked phase=failed attempts=A1,B2 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=shown reason="needs human"',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('failed attempts with missing delivery prints dash', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(
      root,
      'owner',
      'fail-attempts',
      baseState('fail-attempts', 'failed', {
        failure: { cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'tried 3 times' },
      }),
    );
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=fail-attempts phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=attempts@check.review delivery=- reason="tried 3 times"',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('legacy failed without failure record prints unknown', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'fail-legacy', baseState('fail-legacy', 'failed'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=fail-legacy phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=unknown',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('merged still under open prints one line without failure', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'merged-leaf', baseState('merged-leaf', 'merged', { attempts: { A: 1, B: 1 } }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=merged-leaf phase=merged attempts=A1,B1 blocked= A=-/- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('recorded pane absent from agent list prints dash status', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'absent-pane', baseState('absent-pane', 'implement', { pane: { A: 'gone-1' } }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=absent-pane phase=implement attempts=A0,B0 blocked= A=gone-1/- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('unreadable state.yaml is reported beside a healthy leaf and names its file', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'healthy', baseState('healthy', 'implement'));
    const dir: string = resolve(root, 'issues/open/owner/bad-leaf');
    mkdirSync(dir, { recursive: true });
    mkdirSync(resolve(dir, 'state.yaml'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    const output: string[] = lines(r.stdout);
    expect(output).toHaveLength(3);
    expect(output[1]).toBe('slug=healthy phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=');
    expect(output[2]).toContain('unreadable=');
    expect(output[2]).toContain(resolve(dir, 'state.yaml'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('schema-invalid state.yaml is reported beside a healthy leaf', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'healthy', baseState('healthy', 'implement'));
    const dir: string = writeLeaf(root, 'owner', 'bad-schema', { phase: 'implement', repo: 'testrepo' });
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    const output: string[] = lines(r.stdout);
    expect(output).toHaveLength(3);
    expect(output[1]).toContain('slug=healthy');
    expect(output[2]).toContain('unreadable=');
    expect(output[2]).toContain(resolve(dir, 'state.yaml'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('wrong-repo state is reported beside a healthy leaf naming stored and registered keys', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'healthy', baseState('healthy', 'implement'));
    const dir: string = writeLeaf(
      root,
      'owner',
      'foreign-leaf',
      baseState('foreign-leaf', 'implement', { repo: 'other' }),
    );
    const akrogon: string = akrogonOk(root, 'testrepo');
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    const output: string[] = lines(r.stdout);
    expect(output).toHaveLength(3);
    expect(output[1]).toContain('slug=healthy');
    expect(output[2]).toContain('unreadable=');
    expect(output[2]).toContain(resolve(dir, 'state.yaml'));
    expect(output[2]).toContain('other');
    expect(output[2]).toContain('testrepo');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('non-zero herdr exit exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrFail(root);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('herdr boom');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('non-JSON herdr stdout exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrNonJson(root);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('session list failed');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('empty issues/open prints only the session line', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeRepoConfig(root);
    mkdirSync(resolve(root, 'issues/open'), { recursive: true });
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(r.stdout).toBe('session=sess\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('blocked and notified lists join with commas and slugs sort', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const now: string = new Date().toISOString();
    writeLeaf(
      root,
      'owner',
      'zebra-leaf',
      baseState('zebra-leaf', 'implement', {
        'blocked-by': ['a', 'b'],
        busy_notified: { A: now, B: now },
      }),
    );
    writeLeaf(root, 'owner', 'apple-leaf', baseState('apple-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=apple-leaf phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=',
      'slug=zebra-leaf phase=implement attempts=A0,B0 blocked=a,b A=-/- B=-/- notified=A,B',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('missing issues/open prints only the session line', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeRepoConfig(root);
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(r.stdout).toBe('session=sess\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid leaf depth is reported beside a healthy leaf', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'healthy', baseState('healthy', 'implement'));
    const dir: string = resolve(root, 'issues/open/shallow-leaf');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'state.yaml'), Bun.YAML.stringify(baseState('shallow-leaf', 'implement')));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    const output: string[] = lines(r.stdout);
    expect(output).toHaveLength(3);
    expect(output[1]).toContain('slug=healthy');
    expect(output[2]).toContain('unreadable=');
    expect(output[2]).toContain(resolve(dir, 'state.yaml'));
    expect(output[2]).toContain('Invalid leaf depth');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('duplicate slugs are reported once each beside a healthy leaf', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'healthy', baseState('healthy', 'implement'));
    writeLeaf(root, 'owner-a', 'dup-leaf', baseState('dup-leaf', 'implement'));
    writeLeaf(root, 'owner-b', 'dup-leaf', baseState('dup-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    const output: string[] = lines(r.stdout);
    expect(output).toHaveLength(4);
    expect(output[1]).toContain('slug=healthy');
    const reports: string[] = output.slice(2).filter((line) => line.startsWith('unreadable='));
    expect(reports).toHaveLength(2);
    expect(reports.join('\n')).toContain('Duplicate leaf slug');
    expect(reports.join('\n')).toContain('dup-leaf');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('non-zero akrogon config exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = stub(
      join(root, 'akrogon-stub'),
      '#!/usr/bin/env bun\nconsole.error("akrogon boom");\nprocess.exit(2);\n',
    );
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('akrogon config');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('akrogon config with repo none exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = akrogonOk(root, 'none');
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('akrogon config');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('recorded herdr agent list parses against the schema', (): void => {
  // Fixture: verbatim `herdr agent list` output, herdr 0.9.3, captured 2026-10-02 via
  // `herdr agent list > skills/watch-issues/scripts/fixtures/herdr-agent-list.json`.
  const raw: string = readFileSync(join(import.meta.dir, 'fixtures/herdr-agent-list.json'), 'utf8');
  expect(herdrListSchema.safeParse(JSON.parse(raw)).success).toBe(true);
});

test('working claude seat resolves its session jsonl under HOME', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-claude', baseState('log-claude', 'implement', { pane: { A: 'pane-c' } }));
    const log: string = touch(join(home, '.claude/projects/-tmp-My-Dir/sess-1.jsonl'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      {
        pane_id: 'pane-c',
        agent_status: 'working',
        agent: 'claude',
        cwd: '/tmp/My.Dir',
        agent_session: { kind: 'id', value: 'sess-1' },
      },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      `slug=log-claude phase=implement attempts=A0,B0 blocked= A=pane-c/working logA=${log} B=-/- notified=`,
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('working codex seat resolves a unique depth-3 rollout under HOME', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-codex', baseState('log-codex', 'implement', { pane: { A: 'pane-x' } }));
    const log: string = touch(join(home, '.codex/sessions/2026/10/02/rollout-2026-10-02T14-41-39-sess-2.jsonl'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-x', agent_status: 'working', agent: 'codex', agent_session: { kind: 'id', value: 'sess-2' } },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      `slug=log-codex phase=implement attempts=A0,B0 blocked= A=pane-x/working logA=${log} B=-/- notified=`,
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('working pi seat prints its path-kind session verbatim', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-pi', baseState('log-pi', 'implement', { pane: { A: 'pane-p' } }));
    const log: string = touch(join(home, '.pi/agent/sessions/test/sess-3.jsonl'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-p', agent_status: 'working', agent: 'pi', agent_session: { kind: 'path', value: log } },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      `slug=log-pi phase=implement attempts=A0,B0 blocked= A=pane-p/working logA=${log} B=-/- notified=`,
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('working seat without agent_session prints logA=-', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-none', baseState('log-none', 'implement', { pane: { A: 'pane-n' } }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-n', agent_status: 'working', agent: 'claude', cwd: '/tmp/work' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=log-none phase=implement attempts=A0,B0 blocked= A=pane-n/working logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('working seat whose resolved log file is absent prints logA=-', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-missing', baseState('log-missing', 'implement', { pane: { A: 'pane-m' } }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      {
        pane_id: 'pane-m',
        agent_status: 'working',
        agent: 'claude',
        cwd: '/tmp/work',
        agent_session: { kind: 'id', value: 'sess-9' },
      },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=log-missing phase=implement attempts=A0,B0 blocked= A=pane-m/working logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('ambiguous codex rollout matches exit non-zero naming pane and both paths', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-dup', baseState('log-dup', 'implement', { pane: { A: 'pane-d' } }));
    const first: string = touch(join(home, '.codex/sessions/2026/10/02/rollout-a-sess-4.jsonl'));
    const second: string = touch(join(home, '.codex/sessions/2026/10/03/rollout-b-sess-4.jsonl'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-d', agent_status: 'working', agent: 'codex', agent_session: { kind: 'id', value: 'sess-4' } },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code).not.toBe(0);
    expect(r.stderr).toContain('pane-d');
    expect(r.stderr).toContain(first);
    expect(r.stderr).toContain(second);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('idle seat with agent_session prints no log field', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'log-idle', baseState('log-idle', 'implement', { pane: { A: 'pane-i' } }));
    const log: string = touch(join(home, '.pi/agent/sessions/test/sess-5.jsonl'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-i', agent_status: 'idle', agent: 'pi', agent_session: { kind: 'path', value: log } },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr, HOME: home });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess',
      'slug=log-idle phase=implement attempts=A0,B0 blocked= A=pane-i/idle B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('reports seats from the resolved session and never touches the other session', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  const home: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-home-'));
  try {
    writeLeaf(root, 'owner', 'seat-x', baseState('seat-x', 'implement', { pane: { A: 'pane-s' } }));
    const log: string = touch(join(home, '.pi/agent/sessions/test/sess-x1.jsonl'));
    const callsLog: string = join(root, 'calls.log');
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrStub(root, [
      {
        name: 'sess-x',
        workspaces: [
          { workspace_id: 'w8', label: 'testrepo' },
          { workspace_id: 'w9', label: 'other' },
        ],
        agents: [
          { pane_id: 'pane-s', agent_status: 'working', agent: 'pi', agent_session: { kind: 'path', value: log } },
        ],
      },
      {
        name: 'sess-y',
        workspaces: [{ workspace_id: 'w1', label: 'other' }],
        // Same pane id, different data: if the observer listed sess-y the seat
        // would read idle and the log path would be '-'.
        agents: [{ pane_id: 'pane-s', agent_status: 'idle', agent: 'pi' }],
      },
    ]);
    const r: RunResult = await runObserve(root, {
      OBSERVE_AKROGON: akrogon,
      OBSERVE_HERDR: herdr,
      OBSERVE_HERDR_LOG: callsLog,
      HOME: home,
    });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'session=sess-x',
      `slug=seat-x phase=implement attempts=A0,B0 blocked= A=pane-s/working logA=${log} B=-/- notified=`,
    ]);
    const calls: string[][] = stubCalls(callsLog);
    expect(calls.filter((a) => a[0] === 'agent' && a[1] === 'list').length).toBe(0);
    expect(calls.filter((a) => a.includes('agent') && !(a[0] === '--session' && a[1] === 'sess-x'))).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

test('resolution refusal exits non-zero with the reason on stderr and no stdout', async (): Promise<void> => {
  const scenarios: { name: string; sessions: SessionStub[]; listError?: string; stderr: string }[] = [
    {
      name: 'missing',
      sessions: [{ name: 'sess-x', workspaces: [{ workspace_id: 'w1', label: 'other' }] }],
      stderr: 'no running session holds it',
    },
    {
      name: 'duplicate',
      sessions: [
        { name: 'sess-x', workspaces: [{ workspace_id: 'w8', label: 'testrepo' }] },
        { name: 'sess-y', workspaces: [{ workspace_id: 'w1', label: 'testrepo' }] },
      ],
      stderr: 'held by multiple sessions',
    },
    {
      name: 'unreadable',
      sessions: [
        { name: 'sess-x', workspaces: [{ workspace_id: 'w8', label: 'testrepo' }] },
        { name: 'sess-y', workspaces: [], readError: 'locked' },
      ],
      stderr: 'uniqueness unknown',
    },
    {
      name: 'session list failed',
      sessions: [],
      listError: 'io_error',
      stderr: 'session list failed',
    },
  ];
  for (const scenario of scenarios) {
    const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
    try {
      writeLeaf(root, 'owner', 'seat', baseState('seat', 'implement', { pane: { A: 'pane-s' } }));
      const akrogon: string = akrogonOk(root);
      const herdr: string = herdrStub(root, scenario.sessions, scenario.listError);
      const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
      expect(r.code, `${scenario.name}: ${r.stderr}`).not.toBe(0);
      expect(r.stdout.trim(), scenario.name).toBe('');
      expect(r.stderr, scenario.name).toContain('testrepo');
      expect(r.stderr, scenario.name).toContain(scenario.stderr);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test('OBSERVE_HERDR covers every herdr call the observer makes', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'seat', baseState('seat', 'implement', { pane: { A: 'pane-s' } }));
    const callsLog: string = join(root, 'calls.log');
    const binDir: string = herdrPathShim(root);
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrStub(root, [
      {
        name: 'sess-x',
        workspaces: [{ workspace_id: 'w8', label: 'testrepo' }],
        agents: [{ pane_id: 'pane-s', agent_status: 'idle' }],
      },
    ]);
    const r: RunResult = await runObserve(root, {
      OBSERVE_AKROGON: akrogon,
      OBSERVE_HERDR: herdr,
      OBSERVE_HERDR_LOG: callsLog,
      PATH: `${binDir}:${process.env.PATH}`,
    });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)[0]).toBe('session=sess-x');
    const calls: string[][] = stubCalls(callsLog);
    expect(calls.filter((a) => a[0] === 'bypassed')).toEqual([]);
    expect(calls).toEqual([
      ['session', 'list', '--json'],
      ['--session', 'sess-x', 'workspace', 'list'],
      ['--session', 'sess-x', 'agent', 'list'],
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('SKILL.md documents the session line and acting commands carry --session', (): void => {
  const skill: string = readFileSync(join(import.meta.dir, '..', 'SKILL.md'), 'utf8');
  expect(skill).toContain('session=<name>');
  const herdrCommands: string[] = skill
    .split('\n')
    .flatMap((line) => [...line.matchAll(/`herdr [^`]+`/g)].map((match) => match[0]));
  expect(herdrCommands.length).toBeGreaterThan(0);
  for (const command of herdrCommands) {
    expect(command).toContain('--session');
  }
});

test('recorded herdr session list parses against the schema', (): void => {
  // Fixture: verbatim `herdr session list --json` output, herdr 0.9.1, captured 2026-10-24.
  const raw: string = readFileSync(join(import.meta.dir, 'fixtures/herdr-session-list.json'), 'utf8');
  expect(z.object({ sessions: sessionSchema.array() }).safeParse(JSON.parse(raw)).success).toBe(true);
});

test('recorded herdr workspace list parses against the schema', (): void => {
  // Fixture: verbatim `herdr --session infra workspace list` output, herdr 0.9.1, captured 2026-10-24.
  const raw: string = readFileSync(join(import.meta.dir, 'fixtures/herdr-workspace-list.json'), 'utf8');
  expect(
    z.object({ result: z.object({ workspaces: workspaceSchema.array() }) }).safeParse(JSON.parse(raw)).success,
  ).toBe(true);
});
