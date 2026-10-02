import { expect, test } from 'bun:test';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
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

function herdrOk(dir: string, agents: AgentStub[]): string {
  const payload: string = JSON.stringify({ result: { agents } });
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.log(' + JSON.stringify(payload) + ');\n');
}

function herdrFail(dir: string): string {
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.error("herdr boom");\nprocess.exit(3);\n');
}

function herdrNonJson(dir: string): string {
  return stub(join(dir, 'herdr-stub'), '#!/usr/bin/env bun\nconsole.log("not json");\n');
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
    expect(lines(r.stdout)).toEqual(['slug=wait-leaf phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('mixed A working and B idle', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'mix-leaf', baseState('mix-leaf', 'plan.positions', {
      attempts: { A: 1, B: 2 },
      pane: { A: 'pane-a', B: 'pane-b' },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-a', agent_status: 'working' },
      { pane_id: 'pane-b', agent_status: 'idle' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual(['slug=mix-leaf phase=plan.positions attempts=A1,B2 blocked= A=pane-a/working logA=- B=pane-b/idle notified=']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('busy with and without busy_notified', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const now: string = new Date().toISOString();
    writeLeaf(root, 'owner', 'busy-notified', baseState('busy-notified', 'implement', {
      pane: { A: 'pane-n' },
      busy_since: { A: now },
      busy_notified: { A: now },
    }));
    writeLeaf(root, 'owner', 'busy-plain', baseState('busy-plain', 'implement', {
      pane: { A: 'pane-p' },
      busy_since: { A: now },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-n', agent_status: 'working' },
      { pane_id: 'pane-p', agent_status: 'working' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
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
    writeLeaf(root, 'owner', 'busy-garbage', baseState('busy-garbage', 'implement', {
      pane: { A: 'pane-g' },
      busy_since: { A: 'not-a-date' },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-g', agent_status: 'working' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
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
    writeLeaf(root, 'owner', 'busy-future', baseState('busy-future', 'implement', {
      pane: { A: 'pane-f' },
      busy_since: { A: future },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, [
      { pane_id: 'pane-f', agent_status: 'working' },
    ]);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'slug=busy-future phase=implement attempts=A0,B0 blocked= A=pane-f/working busy=0h00m logA=- B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('failed blocked appends failure detail', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'fail-blocked', baseState('fail-blocked', 'failed', {
      attempts: { A: 1, B: 2 },
      failure: { cause: 'blocked', phase: 'implement', slot: 'B', reason: 'needs human', delivery: 'shown' },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'slug=fail-blocked phase=failed attempts=A1,B2 blocked= A=-/- B=-/- notified= failed=blocked@implement delivery=shown reason="needs human"',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('failed attempts with missing delivery prints dash', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'fail-attempts', baseState('fail-attempts', 'failed', {
      failure: { cause: 'attempts', phase: 'check.review', slot: 'A', reason: 'tried 3 times' },
    }));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'slug=fail-attempts phase=failed attempts=A0,B0 blocked= A=-/- B=-/- notified= failed=attempts@check.review delivery=- reason="tried 3 times"',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('legacy failed without failure record prints unknown', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'fail-legacy', {
      ...baseState('fail-legacy', 'failed'),
      priority: 1,
      slot: 'A',
      failed_notified: '2026-09-10',
    });
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
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
    expect(lines(r.stdout)).toEqual(['slug=merged-leaf phase=merged attempts=A1,B1 blocked= A=-/- B=-/- notified=']);
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
    expect(lines(r.stdout)).toEqual(['slug=absent-pane phase=implement attempts=A0,B0 blocked= A=gone-1/- B=-/- notified=']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('unreadable state.yaml exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const dir: string = resolve(root, 'issues/open/owner/bad-leaf');
    mkdirSync(dir, { recursive: true });
    mkdirSync(resolve(dir, 'state.yaml'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('state.yaml');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('schema-invalid state.yaml exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'bad-schema', { phase: 'implement', repo: 'testrepo' });
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('state.yaml');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('wrong-repo state exits non-zero naming stored and registered keys', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const dir: string = writeLeaf(root, 'owner', 'foreign-leaf', baseState('foreign-leaf', 'implement', { repo: 'other' }));
    const akrogon: string = akrogonOk(root, 'testrepo');
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain(dir);
    expect(r.stderr).toContain('other');
    expect(r.stderr).toContain('testrepo');
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
    expect(r.stderr).toContain('herdr');
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
    expect(r.stderr).toContain('herdr');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('empty issues/open exits 0 printing nothing without calling herdr', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    mkdirSync(resolve(root, 'issues/open'), { recursive: true });
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrFail(root);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(r.stdout).toBe('');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('blocked and notified lists join with commas and slugs sort', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const now: string = new Date().toISOString();
    writeLeaf(root, 'owner', 'zebra-leaf', baseState('zebra-leaf', 'implement', {
      'blocked-by': ['a', 'b'],
      busy_notified: { A: now, B: now },
    }));
    writeLeaf(root, 'owner', 'apple-leaf', baseState('apple-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(lines(r.stdout)).toEqual([
      'slug=apple-leaf phase=implement attempts=A0,B0 blocked= A=-/- B=-/- notified=',
      'slug=zebra-leaf phase=implement attempts=A0,B0 blocked=a,b A=-/- B=-/- notified=A,B',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('missing issues/open exits 0 printing nothing', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrFail(root);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code, r.stderr).toBe(0);
    expect(r.stdout).toBe('');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid leaf depth exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    const dir: string = resolve(root, 'issues/open/shallow-leaf');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'state.yaml'), Bun.YAML.stringify(baseState('shallow-leaf', 'implement')));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('Invalid leaf depth');
    expect(r.stderr).toContain('state.yaml');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('duplicate slug exits non-zero naming it', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner-a', 'dup-leaf', baseState('dup-leaf', 'implement'));
    writeLeaf(root, 'owner-b', 'dup-leaf', baseState('dup-leaf', 'implement'));
    const akrogon: string = akrogonOk(root);
    const herdr: string = herdrOk(root, []);
    const r: RunResult = await runObserve(root, { OBSERVE_AKROGON: akrogon, OBSERVE_HERDR: herdr });
    expect(r.code).not.toBe(0);
    expect(r.stdout.trim()).toBe('');
    expect(r.stderr).toContain('Duplicate leaf slug');
    expect(r.stderr).toContain('dup-leaf');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('non-zero akrogon config exits non-zero naming the cause', async (): Promise<void> => {
  const root: string = mkdtempSync(join(tmpdir(), 'akrogon-observe-'));
  try {
    writeLeaf(root, 'owner', 'wait-leaf', baseState('wait-leaf', 'implement'));
    const akrogon: string = stub(join(root, 'akrogon-stub'), '#!/usr/bin/env bun\nconsole.error("akrogon boom");\nprocess.exit(2);\n');
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
      'slug=log-idle phase=implement attempts=A0,B0 blocked= A=pane-i/idle B=-/- notified=',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});
