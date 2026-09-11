import assert from 'node:assert/strict';
import { test, expect, spyOn } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fixture, type Fixture } from './helpers';
import { CommandError, retryCommand, run, type Result } from '../src/shell';

for (const firstFailure of [false, true]) {
  test(`deadline kills sleeping attempt after ${firstFailure ? 'one failure' : 'no failures'}`, async () => {
    const cwd: string = mkdtempSync(resolve(tmpdir(), 'deadline-'));
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

test('ordinary retry preserves warning and second result with optional deadlines', async () => {
  const cwd: string = mkdtempSync(resolve(tmpdir(), 'retry-'));
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

for (const stdout of ['not-json-response', '{"result":{"panes":"invalid-panes"}}']) {
  test(`Herdr response retains native cause for ${stdout}`, async () => {
    const f: Fixture = await fixture();
    try {
      const bin: string = resolve(f.home, 'bin');
      mkdirSync(bin);
      symlinkSync(resolve(import.meta.dir, 'fake-herdr.ts'), resolve(bin, 'herdr'));
      const db: string = resolve(f.home, 'herdr.json');
      writeFileSync(db, JSON.stringify({ panes: [], tabs: [], serial: 0, paneListStdout: stdout }));
      const script: string = `import assert from 'node:assert/strict';
import {z} from ${JSON.stringify(import.meta.resolve('zod'))};
import {panes, herdr, CommandError} from ${JSON.stringify(resolve(import.meta.dir, '../src/shell.ts'))};
await assert.rejects(panes(), (error) => {
  assert(error.cause instanceof ${stdout.startsWith('{') ? 'z.ZodError' : 'SyntaxError'});
  const context = JSON.parse(error.message);
  assert.deepEqual(context.command, ['herdr', 'pane', 'list']);
  assert.equal(context.cwd, process.cwd());
  assert.equal(context.stdout, ${JSON.stringify(stdout)});
  assert.equal(context.error, error.cause.message);
  return true;
});
await assert.rejects(herdr(['invalid-command'], z.object({})), (error) => {
  assert(error instanceof CommandError);
  assert.equal(error.result.code, 1);
  assert.equal(error.cause, undefined);
  return true;
});`;
      const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn([process.execPath, '-e', script], {
        cwd: f.root,
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_HERDR: db },
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const stderr: string = await new Response(child.stderr).text();
      expect({ code: await child.exited, stderr }).toEqual({ code: 0, stderr: '' });
    } finally {
      f.clean();
    }
  });
}
