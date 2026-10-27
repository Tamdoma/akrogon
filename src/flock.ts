// A flock held for this process's lifetime: -F keeps the spawned process as the
// locked command itself so $PPID inside it is the wrapper and tail --pid drops
// the lock even when the wrapper is SIGKILLed. The 'ready' line is the positive
// signal that the lock is held; flock blocks before it while contended.
export async function flockHold(
  path: string,
  mode: '-s' | '-x',
): Promise<{ release: () => Promise<void> }> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-F', mode, path, 'sh', '-c', 'printf ready\\n; exec tail --pid=$PPID -f /dev/null'],
    { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
  );
  let ready: boolean = false;
  const exited: Promise<never> = child.exited.then(async (code: number) => {
    if (ready) return new Promise<never>(() => {});
    throw new Error(
      JSON.stringify({ lock: path, code, stderr: await new Response(child.stderr).text() }),
    );
  });
  const reader: ReadableStreamDefaultReader<Uint8Array> = child.stdout.getReader();
  const first: Promise<void> = (async (): Promise<void> => {
    const read: Awaited<ReturnType<typeof reader.read>> = await reader.read();
    if (read.done) {
      const stderr: string = await new Response(child.stderr).text();
      throw new Error(JSON.stringify({ lock: path, code: await child.exited, stderr }));
    }
    ready = true;
    reader.releaseLock();
  })();
  try {
    await Promise.race([first, exited]);
  } finally {
    first.catch(() => undefined);
    exited.catch(() => undefined);
  }
  return {
    release: async (): Promise<void> => {
      child.kill('SIGKILL');
      await child.exited;
    },
  };
}
