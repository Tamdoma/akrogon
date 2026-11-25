import { expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { refreshToolEntry } from '../src/tool-cgroup';

test('the entry preserves Bash long options and the caller trace descriptor', () => {
  const home: string = mkdtempSync(resolve(tmpdir(), 'akrogon-entry-tracing-'));
  try {
    refreshToolEntry(home);
    const entry: string = resolve(home, 'tool-entry');
    const trace: string = resolve(home, 'trace');
    const bash: string = '/usr/bin/bash';
    const run = (
      executable: string,
      bashEnv: string,
    ): { code: number; stdout: string; stderr: string; trace: string } => {
      const result = Bun.spawnSync([
        bash,
        '-c',
        'exec 3>"$1"; shift; exec "$@"',
        'trace',
        trace,
        '/usr/bin/env',
        'SHELLOPTS=xtrace',
        'BASH_XTRACEFD=3',
        'AKROGON_SEAT_CGROUP=',
        `BASH_ENV=${bashEnv}`,
        executable,
        '--noprofile',
        '--norc',
        '-c',
        'echo command-output; exit 7',
      ]);
      return {
        code: result.exitCode,
        stdout: result.stdout.toString(),
        stderr: result.stderr.toString(),
        trace: readFileSync(trace, 'utf8'),
      };
    };

    const plain = run(bash, '');
    expect(plain).toMatchObject({ code: 7, stdout: 'command-output\n', stderr: '' });
    expect(plain.trace).toContain('command-output');
    expect(run(resolve(entry, 'bash'), ''), 'executed entry').toEqual(plain);
    expect(run(bash, resolve(entry, 'bash-env')), 'sourced entry').toEqual(plain);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
