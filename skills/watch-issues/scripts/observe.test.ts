import { expect, test } from 'bun:test';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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

function herdrOk(dir: string, agents: Array<{ pane_id: string; agent_status: string }>): string {
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
    expect(lines(r.stdout)).toEqual(['slug=mix-leaf phase=plan.positions attempts=A1,B2 blocked= A=pane-a/working B=pane-b/idle notified=']);
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
      'slug=busy-notified phase=implement attempts=A0,B0 blocked= A=pane-n/working+0h00m B=-/- notified=A',
      'slug=busy-plain phase=implement attempts=A0,B0 blocked= A=pane-p/working+0h00m B=-/- notified=',
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
