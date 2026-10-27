export class FlockError extends Error {
  constructor(
    readonly path: string,
    readonly code: number,
    readonly stderr: string,
  ) {
    super(JSON.stringify({ lock: path, code, stderr }));
  }
}

// A flock held for this process's lifetime: -F keeps the spawned process as the
// locked command itself so $PPID inside it is the wrapper and tail --pid drops
// the lock even when the wrapper is SIGKILLed. The 'ready' line is the positive
// signal that the lock is held; flock blocks before it while contended.
export async function flockHold(path: string, mode: '-s' | '-x'): Promise<{ release: () => Promise<void> }> {
  const child: Bun.Subprocess<'ignore', 'pipe', 'pipe'> = Bun.spawn(
    ['flock', '-F', mode, path, 'sh', '-c', 'printf ready\\n; exec tail --pid=$PPID -f /dev/null'],
    { stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' },
  );
  const reader: ReadableStreamDefaultReader<Uint8Array> = child.stdout.getReader();
  const first: Awaited<ReturnType<typeof reader.read>> = await reader.read();
  reader.releaseLock();
  if (first.done) throw new FlockError(path, await child.exited, await new Response(child.stderr).text());
  return {
    release: async (): Promise<void> => {
      child.kill('SIGKILL');
      await child.exited;
    },
  };
}
