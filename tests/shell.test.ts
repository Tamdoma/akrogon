import assert from 'node:assert/strict';
import { test, expect, spyOn } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { CommandError, retryCommand, run, spawnCaptured, type Result } from '../src/shell';
import { registerTemp } from './helpers';

for (const firstFailure of [false, true]) {
  test.serial(`deadline kills sleeping attempt after ${firstFailure ? 'one failure' : 'no failures'}`, async () => {
    const cwd: string = registerTemp(mkdtempSync(resolve(tmpdir(), 'deadline-')));
    const argv: string[] = [
      'sh',
      '-c',
      `${firstFailure ? 'if [ ! -f attempts ]; then echo first >> attempts; echo first >&2; exit 7; fi; ' : ''}echo $$ >> attempts; exec sleep 3`,
    ];
    const warning = spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const start: number = performance.now();
      await assert.rejects(retryCommand(argv, cwd, 100), (error: Error): boolean => {
        assert(error instanceof CommandError);
        expect(error.argv).toEqual(argv);
        expect(error.cwd).toBe(cwd);
        expect(error.result.code).not.toBe(0);
        expect(error.result.stderr).toContain('deadline 100ms exceeded');
        return true;
      });
      expect(performance.now() - start).toBeLessThan(1500);
      expect(warning).toHaveBeenCalledTimes(firstFailure ? 1 : 0);
      const attempts: string[] = readFileSync(resolve(cwd, 'attempts'), 'utf8').trim().split('\n');
      expect(attempts).toHaveLength(firstFailure ? 2 : 1);
      const pid: number = Number(attempts.at(-1));
      for (let i: number = 0; i < 100 && existsSync(`/proc/${pid}`); i++) await Bun.sleep(10);
      expect(existsSync(`/proc/${pid}`)).toBe(false);
    } finally {
      warning.mockRestore();
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
    expect(await retryCommand(['sh', '-c', 'echo fast'], cwd, 1000)).toBe('fast');
    const argv: string[] = ['sh', '-c', 'if [ ! -f first ]; then touch first; echo first >&2; exit 7; fi; echo second'];
    expect(await retryCommand(argv, cwd, 1000)).toBe('second');
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(
      JSON.stringify({ warning: 'retrying command', command: argv, cwd, code: 7, stdout: '', stderr: 'first' }),
    );
    warning.mockClear();
    const failed: string[] = ['sh', '-c', 'if [ ! -f failed ]; then touch failed; exit 3; fi; echo second >&2; exit 9'];
    await expect(retryCommand(failed, cwd, 1000)).rejects.toEqual(
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
    const start: number = performance.now();
    const result: Result = await run([
      'timeout',
      '2',
      process.execPath,
      '-e',
      `import {run} from ${JSON.stringify(resolve(import.meta.dir, '../src/shell.ts'))}; const result = await run(['sh', '-c', 'exit ${code}'], process.cwd(), 10000); if (result.code !== ${code}) throw new Error('wrong exit');`,
    ]);
    expect(result).toEqual({ code: 0, stdout: '', stderr: '' });
    expect(performance.now() - start).toBeLessThan(2000);
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
