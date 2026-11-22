import { test, expect } from 'bun:test';
import { basename, resolve } from 'node:path';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { fixture, cli, entry, leaf, yaml, fakeAkrogon, leafTempRoot, type Fixture } from './helpers';
import { command, finishCaptured, quote, spawnFiles, type Result, type SpawnResult } from '../src/shell';
import { readState, saveState } from '../src/state';
import type { Phase } from '../src/routing';

const sh = (script: string): string[] => ['sh', '-c', script];

async function leafWorktree(f: Fixture, slug: string): Promise<{ leafPath: string; worktree: string }> {
  const worktree: string = resolve(f.home, 'wt', slug);
  await command(['git', 'worktree', 'add', '-b', slug, worktree, 'origin/main'], f.root);
  const leafPath: string = leaf(f, slug, 'implement', { worktree });
  return { leafPath, worktree: realpathSync(worktree) };
}

const baseEnv = (f: Fixture, extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  HOME: f.home,
  ...extra,
});

function runEnv(f: Fixture): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AKROGON_HOME: f.home,
    HERDR_PANE_ID: '',
    HOME: f.home,
    AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
    AKROGON_RETIRED_TEMP_ROOT: resolve(f.home, 'retired-temp'),
    AKROGON_RUN: '',
    PATH: `${resolve(f.home, 'unitbin')}:${process.env.PATH}`,
  };
}

async function waitForFile(path: string, ms: number = 20000): Promise<void> {
  const begun: number = Date.now();
  while (!existsSync(path)) {
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${path}`);
    await Bun.sleep(20);
  }
}

async function waitForText(path: string, pattern: RegExp, ms: number = 20000): Promise<void> {
  const begun: number = Date.now();
  for (;;) {
    if (existsSync(path) && pattern.test(readFileSync(path, 'utf8'))) return;
    if (Date.now() - begun > ms) throw new Error(`Timed out waiting for ${pattern} in ${path}`);
    await Bun.sleep(50);
  }
}

function failLeaf(leafPath: string, reason: string, phase: Phase = 'implement'): void {
  saveState(leafPath, {
    ...readState(leafPath),
    phase: 'failed',
    failure: { cause: 'attempts', phase, slot: 'A', reason },
  });
}

const ledger = (f: Fixture): string => resolve(f.home, 'budget.jsonl');
const ledgerLock = (f: Fixture): string => resolve(f.home, 'budget.lock');

function budget(f: Fixture, sessionsPerDay: number, minutes: number = 30): void {
  const file: string = resolve(f.home, 'config.yaml');
  yaml(file, {
    ...(Bun.YAML.parse(readFileSync(file, 'utf8')) as object),
    paid_budget: {
      sessions_per_day: sessionsPerDay,
      session_minutes: minutes,
      approved: { date: '2026-11-22', answer: 'standing test approval' },
    },
  });
}

type Row = { at: string; repo: string; slug: string; run: string; sessions: number };

function rows(f: Fixture): Row[] {
  if (!existsSync(ledger(f))) return [];
  return readFileSync(ledger(f), 'utf8')
    .replace(/(?:\r?\n)+$/, '')
    .split('\n')
    .map((line: string) => JSON.parse(line) as Row);
}

function seedRows(f: Fixture, seeded: Row[]): void {
  writeFileSync(ledger(f), seeded.map((row: Row) => JSON.stringify(row)).join('\n') + '\n');
}

function at(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

const row = (repo: string, slug: string, sessions: number, hoursAgo: number): Row => ({
  at: at(hoursAgo),
  repo,
  slug,
  run: 'seeded-run',
  sessions,
});

test('a reserved run exports AKROGON_SESSIONS and AKROGON_SESSION_MINUTES and records its row', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 45);
    const { worktree } = await leafWorktree(f, 'budget-run');
    const ok: Result = await cli(
      f,
      [
        'run-check',
        '--name',
        'paid',
        '--sessions',
        '3',
        '--',
        ...sh(
          'printf %s:%s:%s "$AKROGON_SESSIONS" "$AKROGON_SESSION_MINUTES" "$(wc -l < "$AKROGON_HOME/budget.jsonl")"',
        ),
      ],
      worktree,
      baseEnv(f),
    );
    expect(ok.code, ok.stderr).toBe(0);
    expect(ok.stdout).toBe('3:45:1');
    const run: string = /^run ([0-9a-f-]{36})$/m.exec(ok.stderr)?.[1] ?? '';
    expect(run).not.toBe('');
    expect(rows(f)).toEqual([{ at: expect.any(String), repo: f.repo, slug: 'budget-run', run, sessions: 3 }]);
    expect(Number.isNaN(Date.parse(rows(f)[0].at))).toBe(false);
    const holder: string = resolve(f.home, 'holder');
    mkdirSync(holder);
    const checked: Result = await cli(
      f,
      ['run-check', '--name', 'h', '--holder', holder, '--sessions', '1', '--', 'true'],
      f.root,
      baseEnv(f),
    );
    expect(checked.code, checked.stderr).toBe(0);
    expect(rows(f)[1]).toMatchObject({ repo: f.repo, slug: 'checkout', sessions: 1 });
    const red: Result = await cli(
      f,
      ['run-check', '--name', 'red', '--sessions', '2', '--', 'sh', '-c', 'exit 7'],
      worktree,
      baseEnv(f),
    );
    expect(red.code).toBe(7);
    expect(rows(f)).toHaveLength(3);
    expect(rows(f)[2]).toMatchObject({ slug: 'budget-run', sessions: 2 });
  } finally {
    f.clean();
  }
});

test('an unreserved run exports neither AKROGON_SESSIONS nor AKROGON_SESSION_MINUTES', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 45);
    const { worktree } = await leafWorktree(f, 'unreserved');
    const result: Result = await cli(
      f,
      ['run-check', '--', ...sh('printf %s:%s "${AKROGON_SESSIONS:-unset}" "${AKROGON_SESSION_MINUTES:-unset}"')],
      worktree,
      baseEnv(f, { AKROGON_SESSIONS: '9', AKROGON_SESSION_MINUTES: '9' }),
    );
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toBe('unset:unset');
    expect(rows(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a reservation over the rolling 24-hour ceiling is refused naming the total, ceiling and fits-at', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 3, 30);
    const { worktree } = await leafWorktree(f, 'full-window');
    const stale: Row = row(f.repo, 'old', 1, 25);
    const first: Row = row('other-repo', 'elsewhere', 2, 2);
    const second: Row = row(f.repo, 'recent', 1, 1);
    seedRows(f, [stale, first, second]);
    const marker: string = resolve(f.home, 'over-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('paid session budget');
    expect(result.stderr).toContain('24-hour total 3 of 3');
    expect(result.stderr).toContain('fits at');
    const fitsAt: string = /fits at (\d{4}-\d{2}-\d{2}T\S+)/.exec(result.stderr)?.[1] ?? '';
    const expected: number = Date.parse(first.at) + 24 * 3600_000;
    expect(Math.abs(Date.parse(fitsAt) - expected)).toBeLessThan(5000);
    expect(existsSync(marker)).toBe(false);
    expect(rows(f)).toHaveLength(3);
  } finally {
    f.clean();
  }
});

test('a request larger than the ceiling never fits', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 3, 30);
    const { worktree } = await leafWorktree(f, 'too-big');
    const marker: string = resolve(f.home, 'big-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '4', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('never fits');
    expect(existsSync(marker)).toBe(false);
    expect(rows(f)).toEqual([]);
  } finally {
    f.clean();
  }
});

test('a reservation at the ceiling admits', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 3, 30);
    const { worktree } = await leafWorktree(f, 'edge');
    seedRows(f, [row(f.repo, 'recent', 2, 1)]);
    const result: Result = await cli(
      f,
      ['run-check', '--sessions', '1', '--', 'sh', '-c', 'echo admitted'],
      worktree,
      baseEnv(f),
    );
    expect(result.code, result.stderr).toBe(0);
    expect(rows(f)).toHaveLength(2);
  } finally {
    f.clean();
  }
});

test('--sessions without paid_budget refuses naming the key and the config file', async () => {
  const f: Fixture = await fixture();
  try {
    const { worktree } = await leafWorktree(f, 'no-budget');
    const marker: string = resolve(f.home, 'key-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '2', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('paid_budget');
    expect(result.stderr).toContain('config.yaml');
    expect(existsSync(marker)).toBe(false);
    expect(existsSync(ledger(f))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a non-integer or non-positive --sessions refuses and writes nothing', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { worktree } = await leafWorktree(f, 'bad-count');
    const marker: string = resolve(f.home, 'bad-ran');
    for (const value of ['0', '1.5', '0.99999999999999999', 'abc']) {
      const result: Result = await cli(
        f,
        ['run-check', '--sessions', value, '--', 'touch', marker],
        worktree,
        baseEnv(f),
      );
      expect(result.code, `--sessions ${value}`).not.toBe(0);
      expect(result.stderr, `--sessions ${value}`).toContain('--sessions');
      expect(result.stderr, `--sessions ${value}`).toContain('positive integer');
      expect(existsSync(marker)).toBe(false);
    }
    expect(existsSync(ledger(f))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a malformed ledger row refuses naming the file and the bad row', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { worktree } = await leafWorktree(f, 'bad-ledger');
    writeFileSync(ledger(f), '{"at":"2026-11-22T00:00:00Z","repo":"r","slug":"s","run":"x","sessions":1}\nnot-json\n');
    const marker: string = resolve(f.home, 'malformed-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(ledger(f));
    expect(result.stderr).toContain('not-json');
    expect(existsSync(marker)).toBe(false);
    expect(readFileSync(ledger(f), 'utf8').split('\n')).toHaveLength(3);
  } finally {
    f.clean();
  }
});

test('ledger row boundaries survive append and expose a trailing blank row', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10);
    const { worktree } = await leafWorktree(f, 'ledger-boundary');
    const previous: string = JSON.stringify(row(f.repo, 'earlier', 1, 1));
    writeFileSync(ledger(f), previous);
    const admitted: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'true'], worktree, baseEnv(f));
    const appended: string[] = readFileSync(ledger(f), 'utf8').split('\n');

    const malformed: string = previous + '\n\n';
    writeFileSync(ledger(f), malformed);
    const marker: string = resolve(f.home, 'blank-row-ran');
    const refused: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'touch', marker], worktree, baseEnv(f));
    expect({
      admitted: admitted.code,
      firstRow: appended[0],
      rows: appended.length - 1,
      refused: refused.code,
      started: existsSync(marker),
      ledger: readFileSync(ledger(f), 'utf8'),
    }).toEqual({ admitted: 0, firstRow: previous, rows: 2, refused: 1, started: false, ledger: malformed });
    expect(JSON.parse(appended[1])).toMatchObject({ repo: f.repo, slug: 'ledger-boundary', sessions: 1 });
    expect(refused.stderr).toContain(`${ledger(f)} row 2:`);
  } finally {
    f.clean();
  }
});

test('an unreadable ledger refuses naming the file and leaves its bytes intact', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { worktree } = await leafWorktree(f, 'unreadable');
    seedRows(f, [row(f.repo, 'earlier', 1, 1)]);
    chmodSync(ledger(f), 0o000);
    const marker: string = resolve(f.home, 'unreadable-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(ledger(f));
    expect(result.stderr).toContain('Cannot read');
    expect(existsSync(marker)).toBe(false);
    chmodSync(ledger(f), 0o600);
    expect(rows(f)).toEqual([{ at: expect.any(String), repo: f.repo, slug: 'earlier', run: 'seeded-run', sessions: 1 }]);
  } finally {
    f.clean();
  }
});

test('a failed ledger append refuses and starts no command', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { worktree } = await leafWorktree(f, 'unwritable');
    seedRows(f, [row(f.repo, 'earlier', 1, 1)]);
    chmodSync(ledger(f), 0o444);
    const marker: string = resolve(f.home, 'append-ran');
    const result: Result = await cli(f, ['run-check', '--sessions', '1', '--', 'touch', marker], worktree, baseEnv(f));
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain(ledger(f));
    expect(existsSync(marker)).toBe(false);
    expect(rows(f)).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('a reserved run waits behind the budget lock, then writes its row and runs', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { worktree } = await leafWorktree(f, 'lock-wait');
    const marker: string = resolve(f.home, 'lock-ran');
    const holder: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
      ['flock', '-x', ledgerLock(f), 'sh', '-c', 'printf locked; cat >/dev/null'],
      { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
    );
    const reader: ReadableStreamDefaultReader<Uint8Array> = holder.stdout.getReader();
    try {
      expect((await reader.read()).done).toBe(false);
      const waiting = spawnFiles([process.execPath, entry, 'run-check', '--sessions', '1', '--', 'touch', marker], {
        cwd: worktree,
        env: runEnv(f),
        timeout: 60000,
        killSignal: 'SIGKILL',
      });
      try {
        const deadline: number = Date.now() + 1500;
        while (Date.now() < deadline) {
          expect(waiting.child.exitCode, 'run proceeded while the lock was held').toBeNull();
          await Bun.sleep(50);
        }
        expect(existsSync(marker)).toBe(false);
        expect(existsSync(ledger(f))).toBe(false);
        holder.stdin.end();
        const result: SpawnResult = await finishCaptured(waiting.child, waiting.captured);
        expect(result.code, result.stderr).toBe(0);
      } finally {
        if (waiting.child.exitCode === null) waiting.child.kill('SIGKILL');
      }
    } finally {
      if (holder.exitCode === null) holder.kill();
      reader.releaseLock();
      await holder.exited;
    }
    expect(existsSync(marker)).toBe(true);
    expect(rows(f)).toHaveLength(1);
  } finally {
    f.clean();
  }
});

test('a reservation waiting on the lock uses the lowered ceiling', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 3);
    const { worktree } = await leafWorktree(f, 'lowered-ceiling');
    const marker: string = resolve(f.home, 'ran');
    const waitingAtLock: string = resolve(f.home, 'waiting-at-lock');
    const lock: string = ledgerLock(f);
    const flock: string = Bun.which('flock')!;
    writeFileSync(
      resolve(f.home, 'unitbin/flock'),
      [
        '#!/bin/sh',
        'if [ "$2" = "$TEST_BUDGET_LOCK" ]; then touch "$TEST_BUDGET_WAITING"; fi',
        `exec ${quote(flock)} "$@"`,
        '',
      ].join('\n'),
      { mode: 0o755 },
    );
    const holder: Bun.Subprocess<'pipe', 'pipe', 'pipe'> = Bun.spawn(
      [flock, '-x', lock, 'sh', '-c', 'printf locked; cat >/dev/null'],
      { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
    );
    const reader: ReadableStreamDefaultReader<Uint8Array> = holder.stdout.getReader();
    try {
      expect((await reader.read()).done).toBe(false);
      const waiting = spawnFiles([process.execPath, entry, 'run-check', '--sessions', '2', '--', 'touch', marker], {
        cwd: worktree,
        env: { ...runEnv(f), TEST_BUDGET_LOCK: lock, TEST_BUDGET_WAITING: waitingAtLock },
        timeout: 10000,
        killSignal: 'SIGKILL',
      });
      try {
        await waitForFile(waitingAtLock, 5000);
        budget(f, 1);
        holder.stdin.end();
        const result: SpawnResult = await finishCaptured(waiting.child, waiting.captured);
        expect(result.code, result.stderr).toBe(1);
        expect(result.stderr).toContain('0 of 1');
        expect(existsSync(marker)).toBe(false);
        expect(rows(f)).toEqual([]);
      } finally {
        if (waiting.child.exitCode === null) waiting.child.kill('SIGKILL');
      }
    } finally {
      if (holder.exitCode === null) holder.kill();
      reader.releaseLock();
      await holder.exited;
    }
  } finally {
    f.clean();
  }
});

test('refusals before the reservation write no ledger row', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    const { leafPath, worktree } = await leafWorktree(f, 'reserve-order');
    const marker: string = resolve(f.home, 'order-ran');
    const envRefused: Result = await cli(
      f,
      ['run-check', '--sessions', '1', '--', 'touch', marker],
      worktree,
      baseEnv(f, { NODE_PATH: '/x' }),
    );
    expect(envRefused.code).not.toBe(0);
    expect(envRefused.stderr).toContain('NODE_PATH');
    yaml(resolve(f.root, 'issues/config.yaml'), { merge_checks: { suite: 'echo suite' }, grounding: 'none' });
    const mergeRefused: Result = await cli(
      f,
      ['run-check', '--sessions', '1', '--', 'echo', 'suite'],
      worktree,
      baseEnv(f),
    );
    expect(mergeRefused.code).not.toBe(0);
    const owner: string = resolve(leafPath, '..');
    mkdirSync(resolve(f.root, 'issues/closed'), { recursive: true });
    renameSync(owner, resolve(f.root, 'issues/closed/issue'));
    const closedLeaf: string = resolve(f.root, 'issues/closed/issue/reserve-order');
    const closedRefused: Result = await cli(
      f,
      ['run-check', '--leaf', closedLeaf, '--sessions', '1', '--', 'touch', marker],
      worktree,
      baseEnv(f),
    );
    expect(closedRefused.code).not.toBe(0);
    expect(closedRefused.stderr).toContain('owner closed');
    renameSync(resolve(f.root, 'issues/closed/issue'), owner);
    failLeaf(leafPath, 'operator asked');
    const failedRefused: Result = await cli(
      f,
      ['run-check', '--leaf', leafPath, '--sessions', '1', '--', 'touch', marker],
      worktree,
      baseEnv(f),
    );
    expect(failedRefused.code).toBe(1);
    expect(existsSync(marker)).toBe(false);
    expect(existsSync(ledger(f))).toBe(false);
  } finally {
    f.clean();
  }
});

test('a run refused after reserving keeps its row', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      checks: { test: 'bun test' },
      full: ['test'],
      grounding: 'none',
    });
    const dir: string = resolve(f.home, 'queue');
    mkdirSync(dir);
    const { worktree: first } = await leafWorktree(f, 'holder');
    const { leafPath: waitingLeaf, worktree: second } = await leafWorktree(f, 'waiter');
    const held: string = resolve(dir, 'a.held');
    const release: string = resolve(dir, 'release');
    const marker: string = resolve(dir, 'waiter-ran');
    const a = spawnFiles(
      [
        process.execPath,
        entry,
        'run-check',
        '--name',
        'test',
        '--',
        'sh',
        '-c',
        `touch ${held}; while [ ! -e ${release} ]; do sleep 0.05; done`,
      ],
      { cwd: first, env: runEnv(f) },
    );
    await waitForFile(held);
    const b = spawnFiles(
      [process.execPath, entry, 'run-check', '--name', 'test', '--sessions', '2', '--', 'touch', marker],
      { cwd: second, env: runEnv(f) },
    );
    try {
      await waitForText(b.captured.errPath, new RegExp(`waiting for ${f.repo}/holder test`));
      failLeaf(waitingLeaf, 'seat A ended 3 turns without reporting');
      writeFileSync(release, '');
      const aResult: SpawnResult = await finishCaptured(a.child, a.captured);
      const bResult: SpawnResult = await finishCaptured(b.child, b.captured);
      expect(aResult.code).toBe(0);
      expect(bResult.code).toBe(1);
      expect(existsSync(marker)).toBe(false);
      const kept: Row[] = rows(f);
      expect(kept).toHaveLength(1);
      expect(kept[0]).toMatchObject({ repo: f.repo, slug: 'waiter', sessions: 2 });
    } finally {
      writeFileSync(release, '');
      for (const run of [a, b]) if (run.child.exitCode === null) run.child.kill('SIGKILL');
      rmSync(dir, { recursive: true, force: true });
    }
  } finally {
    f.clean();
  }
});

test('a nested run-check inherits neither AKROGON_SESSIONS nor AKROGON_SESSION_MINUTES', async () => {
  const f: Fixture = await fixture();
  try {
    budget(f, 10, 30);
    yaml(resolve(f.root, 'issues/config.yaml'), {
      env: ['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT'],
      checks: {},
      grounding: 'none',
    });
    const { worktree } = await leafWorktree(f, 'nested');
    const shim = fakeAkrogon(f);
    const inner: string = resolve(f.home, 'inner-env');
    const result: Result = await cli(
      f,
      [
        'run-check',
        '--name',
        'outer',
        '--sessions',
        '1',
        '--',
        'akrogon',
        'run-check',
        '--name',
        'inner',
        '--',
        'sh',
        '-c',
        `printf %s:%s "\${AKROGON_SESSIONS:-unset}" "\${AKROGON_SESSION_MINUTES:-unset}" > ${inner}`,
      ],
      worktree,
      { ...shim.env, HOME: f.home },
    );
    expect(result.code, result.stderr).toBe(0);
    expect(readFileSync(inner, 'utf8')).toBe('unset:unset');
    expect(rows(f)).toHaveLength(1);
  } finally {
    f.clean();
  }
});
