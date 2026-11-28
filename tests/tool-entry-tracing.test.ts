import { expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
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

// Criterion 2: with a foreign home's tool-entry folder first on PATH — directly, through a
// symlinked folder, or through a symlinked bash file — refreshToolEntry of a scratch home
// renders a wrapper whose interpreter and exec target are a real bash outside every
// tool-entry folder. The render runs in a `bun` child with a fully controlled PATH, since
// realBash reads process.env and `[test]` preload never applies outside `bun test`.
test('the rendered wrapper never resolves a bash inside a tool-entry folder', () => {
  const root: string = mkdtempSync(resolve(tmpdir(), 'akrogon-foreign-entry-'));
  try {
    const foreign: string = resolve(root, 'foreign');
    refreshToolEntry(foreign);
    const foreignEntry: string = resolve(foreign, 'tool-entry');

    const linkedFolder: string = resolve(root, 'linked-entry');
    symlinkSync(foreignEntry, linkedFolder);
    const symlinkedBin: string = resolve(root, 'symlinked-bin');
    mkdirSync(symlinkedBin);
    symlinkSync(resolve(foreignEntry, 'bash'), resolve(symlinkedBin, 'bash'));

    const script: string = resolve(root, 'render.ts');
    writeFileSync(
      script,
      [
        `import { refreshToolEntry } from ${JSON.stringify(resolve(import.meta.dir, '../src/tool-cgroup.ts'))};`,
        'refreshToolEntry(process.argv[2]);',
        '',
      ].join('\n'),
    );

    for (const [label, wiredDir] of [
      ['foreign entry directly', foreignEntry],
      ['symlinked folder', linkedFolder],
      ['symlinked bash file', symlinkedBin],
    ] as const) {
      const scratch: string = resolve(
        root,
        `scratch-${wiredDir === foreignEntry ? 'direct' : wiredDir === linkedFolder ? 'folder' : 'file'}`,
      );
      mkdirSync(scratch);
      const render: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync([process.execPath, script, scratch], {
        cwd: root,
        env: { PATH: `${wiredDir}:/usr/bin` },
        stdout: 'pipe',
        stderr: 'pipe',
      });
      expect(render.exitCode, `${label}: render; stderr: ${render.stderr.toString()}`).toBe(0);

      const wrapper: string = readFileSync(resolve(scratch, 'tool-entry', 'bash'), 'utf8');
      const shebang: string | undefined = wrapper.split('\n')[0].match(/^#!(.+)$/)?.[1];
      const execTarget: string | undefined = wrapper.match(/^exec "([^"]+)" "\$@"$/m)?.[1];
      expect(shebang, `${label}: shebang present`).toBeDefined();
      expect(execTarget, `${label}: exec target present`).toBeDefined();
      for (const [what, token] of [
        ['interpreter', shebang],
        ['exec target', execTarget],
      ] as const) {
        const real: string = realpathSync(token as string);
        expect(basename(dirname(real)), `${label}: ${what} ${real} outside any tool-entry`).not.toBe('tool-entry');
      }
      const execution = Bun.spawnSync([resolve(scratch, 'tool-entry', 'bash'), '-c', 'echo wrapper-ok'], {
        env: { PATH: '/usr/bin' },
        stdout: 'pipe',
        stderr: 'pipe',
      });
      expect(execution.stdout.toString(), `${label}: wrapper executes a real bash`).toBe('wrapper-ok\n');
      expect(execution.exitCode, `${label}: wrapper exit`).toBe(0);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
