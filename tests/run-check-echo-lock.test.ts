import { expect, test } from 'bun:test';
import { closeSync, constants, mkdirSync, openSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { command } from '../src/shell';
import { entry, fixture, leafTempRoot, yaml, type Fixture } from './helpers';

test('capture owner can be locked exclusively after publication and before stderr drains', async () => {
  const f: Fixture = await fixture();
  try {
    yaml(resolve(f.root, 'issues/config.yaml'), { checks: {}, grounding: 'none' });
    const holder: string = resolve(f.home, 'holder');
    const fifo: string = resolve(f.home, 'stderr');
    mkdirSync(holder);
    await command(['mkfifo', fifo]);
    // Hold the FIFO open without reading. A Bun child pipe buffers output automatically.
    const reader: number = openSync(fifo, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const writer: number = openSync(fifo, constants.O_WRONLY | constants.O_NONBLOCK);
      const proc = Bun.spawn(
        [
          process.execPath,
          entry,
          'run-check',
          '--holder',
          holder,
          '--name',
          'echo',
          '--',
          'sh',
          '-c',
          "head -c 1048576 /dev/zero | tr '\\0' 'e' >&2; exit 7",
        ],
        {
          cwd: f.root,
          env: {
            ...process.env,
            AKROGON_HOME: f.home,
            HOME: f.home,
            AKROGON_RUN: '',
            AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f),
          },
          stdout: 'ignore',
          stderr: writer,
        },
      );
      closeSync(writer);
      try {
        const deadline: number = Date.now() + 5000;
        for (;;) {
          const names: string[] = readdirSync(holder);
          const kept: string | undefined = names.find((name) => name.startsWith('check-echo-'));
          if (
            kept !== undefined &&
            !names.some((name) => name.startsWith('capture-')) &&
            statSync(resolve(holder, kept)).size === 1048576
          )
            break;
          if (Date.now() > deadline) throw new Error('Check output was not published');
          await Bun.sleep(20);
        }

        const packed = Bun.spawnSync(['flock', '-x', '-w', '1', resolve(holder, '.lock'), 'true']);
        expect(packed.exitCode, 'the pack lock is available before reading the echo').toBe(0);

        const drain = Bun.spawn(['cat', fifo], { stdout: 'pipe', stderr: 'ignore' });
        try {
          const echo: string = await new Response(drain.stdout).text();
          expect(await proc.exited).toBe(7);
          expect(echo).toContain('e'.repeat(1048576));
          expect(echo).toContain('check echo: 7');
        } finally {
          if (drain.exitCode === null) drain.kill();
          await drain.exited;
        }
      } finally {
        if (proc.exitCode === null) proc.kill();
        await proc.exited;
      }
    } finally {
      closeSync(reader);
    }
  } finally {
    f.clean();
  }
});
