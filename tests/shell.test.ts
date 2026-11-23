import { test, expect, spyOn } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';
import { CommandError, retryCommand, run, spawnCaptured, type Result, type SpawnResult } from '../src/shell';
import { registerTemp, WAIT_MS } from './helpers';

async function until(done: () => boolean, what: string): Promise<void> {
  const begun: number = Date.now();
  while (!done()) {
    if (Date.now() - begun > WAIT_MS) throw new Error(`Timed out waiting for ${what}`);
    await Bun.sleep(20);
  }
}

const lines = (path: string): string[] =>
  existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .filter((line) => line !== '')
    : [];

const alive = (pid: number): boolean => existsSync(`/proc/${pid}`);

// A deadline timer starts at spawn, so a real 100 ms one also covers the attempt's launch, which a
// loaded host can delay past it. The case runs in a child that holds its own timers: once the last
// attempt has written its pid, the child fires that attempt's deadline and prints what it threw.
const deadlineCase = (count: number): string => `
import { existsSync, readFileSync } from 'node:fs';
import { CommandError, retryCommand } from ${JSON.stringify(resolve(import.meta.dir, '../src/shell.ts'))};
const { argv, cwd, budget } = JSON.parse(process.env.DEADLINE_CASE);
const held = [];
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = (handler) => {
  held.push(handler);
  return realSetTimeout(() => {}, 2 ** 31 - 1);
};
let warnings = 0;
console.warn = () => { warnings += 1; };
const marker = cwd + '/attempts';
const started = () => (existsSync(marker) ? readFileSync(marker, 'utf8').split('\\n').filter((row) => row !== '').length : 0);
const attempt = retryCommand(argv, cwd, 100).then(() => undefined, (error) => error);
const end = Date.now() + budget;
while (held.length < ${count} || started() < ${count}) {
  if (Date.now() > end) throw new Error('the last attempt never started under its deadline: ' + JSON.stringify({ held: held.length, started: started() }));
  await Bun.sleep(20);
}
held[${count} - 1]();
const error = await attempt;
console.log(JSON.stringify({
  commandError: error instanceof CommandError,
  argv: error?.argv,
  cwd: error?.cwd,
  code: error?.result?.code,
  stderr: error?.result?.stderr,
  warnings,
}));
`;

const caseReport = z.object({
  commandError: z.boolean(),
  argv: z.array(z.string()),
  cwd: z.string(),
  code: z.number(),
  stderr: z.string(),
  warnings: z.number(),
});

for (const firstFailure of [false, true]) {
  test(`deadline kills sleeping attempt after ${firstFailure ? 'one failure' : 'no failures'}`, async () => {
    const cwd: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'deadline-')));
    const argv: string[] = [
      'sh',
      '-c',
      `${firstFailure ? 'if [ ! -f attempts ]; then echo first >> attempts; echo first >&2; exit 7; fi; ' : ''}echo $$ >> attempts; exec sleep 600`,
    ];
    const count: number = firstFailure ? 2 : 1;
    try {
      // The last attempt sleeps far past the test, so only its deadline can end it.
      const child: SpawnResult = await spawnCaptured([process.execPath, '-e', deadlineCase(count)], {
        env: { ...process.env, DEADLINE_CASE: JSON.stringify({ argv, cwd, budget: WAIT_MS - 10_000 }) },
        timeout: WAIT_MS,
      });
      expect({ code: child.code, stderr: child.code === 0 ? '' : child.stderr }).toEqual({ code: 0, stderr: '' });
      const report: z.infer<typeof caseReport> = caseReport.parse(JSON.parse(child.stdout));
      expect(report.commandError).toBe(true);
      expect(report.argv).toEqual(argv);
      expect(report.cwd).toBe(cwd);
      expect(report.code).not.toBe(0);
      expect(report.stderr).toContain('deadline 100ms exceeded');
      expect(report.warnings).toBe(firstFailure ? 1 : 0);
      const attempts: string[] = lines(resolve(cwd, 'attempts'));
      expect(attempts).toHaveLength(count);
      const pid: number = Number(attempts.at(-1));
      await until(() => !alive(pid), `pid ${pid} to exit`);
    } finally {
      // A failed case leaves its sleeping attempt behind: stop every attempt it recorded.
      for (const pid of lines(resolve(cwd, 'attempts')).map(Number).filter(Number.isInteger))
        if (alive(pid)) process.kill(pid, 'SIGKILL');
      rmSync(cwd, { recursive: true, force: true });
    }
  });
}

test.serial('ordinary retry preserves warning and second result with optional deadlines', async () => {
  const cwd: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'retry-')));
  const warning = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    expect(await run(['sh', '-c', 'echo output'])).toEqual({ code: 0, stdout: 'output', stderr: '' });
    expect(await run(['sh', '-c', 'echo error >&2; exit 4'])).toEqual({ code: 4, stdout: '', stderr: 'error' });
    expect(await retryCommand(['sh', '-c', 'echo fast'], cwd, WAIT_MS)).toBe('fast');
    const argv: string[] = ['sh', '-c', 'if [ ! -f first ]; then touch first; echo first >&2; exit 7; fi; echo second'];
    expect(await retryCommand(argv, cwd, WAIT_MS)).toBe('second');
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      JSON.stringify({ warning: 'retrying command', command: argv, cwd, code: 7, stdout: '', stderr: 'first' }),
    );
    warning.mockClear();
    const failed: string[] = ['sh', '-c', 'if [ ! -f failed ]; then touch failed; exit 3; fi; echo second >&2; exit 9'];
    await expect(retryCommand(failed, cwd, WAIT_MS)).rejects.toEqual(
      new CommandError(failed, cwd, { code: 9, stdout: '', stderr: 'second' }),
    );
    expect(warning).toHaveBeenCalledTimes(1);
  } finally {
    warning.mockRestore();
    rmSync(cwd, { recursive: true, force: true });
  }
});

for (const code of [0, 7]) {
  test(`standalone command clears long deadline on exit ${code}`, async () => {
    // A deadline left armed would hold the child for an hour, far past the WAIT_MS kill.
    const {
      code: exit,
      stdout,
      stderr,
    }: SpawnResult = await spawnCaptured(
      [
        process.execPath,
        '-e',
        `import {run} from ${JSON.stringify(resolve(import.meta.dir, '../src/shell.ts'))}; const result = await run(['sh', '-c', 'exit ${code}'], process.cwd(), 3600000); if (result.code !== ${code}) throw new Error('wrong exit');`,
      ],
      { timeout: WAIT_MS },
    );
    expect({ exit, stdout, stderr }).toEqual({ exit: 0, stdout: '', stderr: '' });
  });
}

test('git and gh get the user session bus back under the seat bus cut; other programs keep the cut', async () => {
  const script: string = `
import {run} from ${JSON.stringify(resolve(import.meta.dir, '../src/shell.ts'))};
const git = await run(['git', '-c', 'alias.bus=!printenv DBUS_SESSION_BUS_ADDRESS', 'bus']);
const other = await run(['sh', '-c', 'printenv DBUS_SESSION_BUS_ADDRESS']);
console.log(JSON.stringify([git.stdout, other.stdout]));
`;
  const child: Result = await spawnCaptured([process.execPath, '-e', script], {
    env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: 'unix:path=/nonexistent', XDG_RUNTIME_DIR: '/run/user/test' },
  });
  expect(JSON.parse(child.stdout)).toEqual(['unix:path=/run/user/test/bus', 'unix:path=/nonexistent']);
});

// Lesson 11 (learnings/history/2026-09-10-stderr-json-parse.md): an outside CLI's plain-text stderr
// (a panic, usage error or socket failure) reaches the caller with its raw text, never as a SyntaxError.
// A driver child gets the stub hc on its startup PATH, which is the PATH spawned commands resolve.
test('hc plain-text stderr rejects with HcError kind exit 1 carrying the raw stderr', async () => {
  const bin: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'hc-plain-')));
  writeFileSync(resolve(bin, 'hc'), "#!/bin/sh\nprintf 'hc: socket gone\\n' >&2\nexit 1\n", { mode: 0o755 });
  const script: string = `import assert from 'node:assert/strict';
import {hc, HcError} from ${JSON.stringify(resolve(import.meta.dir, '../src/hc.ts'))};
await assert.rejects(hc('plain', ['get', 't1']), (error) => {
  assert(error instanceof HcError, String(error));
  assert.equal(error.kind, 'exit 1');
  assert.equal(error.result.stderr, 'hc: socket gone\\n');
  return true;
});`;
  const { code, stderr }: Result = await spawnCaptured([process.execPath, '-e', script], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
  });
  expect({ code, stderr }).toEqual({ code: 0, stderr: '' });
});
