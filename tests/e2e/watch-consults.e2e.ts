// watch-consults criteria 1-2, the paid attended run under the applicable readiness grant:
// a real watcher in the akr-e2e-watch tier meets a staged notify-only failure
// (failed=blocked@check.review after two unproductive cycles, a base-red repo check), starts
// its consultant with `akrogon seat --watch-consultant` from the machine slots.consultant
// recipe, exchanges a turn file over hc send inside its own turn, lets the consultant fix the
// base and push fast-forward, resumes the leaf with `akrogon phase` + `akrogon next`, writes
// the case record and its signature, notices the push and the move non-attention, and closes
// the consultant before the resume.
// The tier records the watcher (pi), initial consultant (agy neon high) and all consultant
// replacements. Pass at least 2 sessions. The resumed leaf uses a stand-in.
// Run: akrogon run-check --name watch-consults -- env AKROGON_SESSIONS=<n> AKROGON_SESSION_MINUTES=<m>
//      AKROGON_E2E=watch-consults
//      AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/watch-consults-e2e
//      WATCH_TICK_SECONDS=15
//      bun test --timeout=720000 ./tests/e2e/watch-consults.e2e.ts
import { test, expect } from 'bun:test';
import type { Subprocess } from 'bun';
import { cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { realRuntime, required, reservedSessions } from './tier';
import { absent, holdSession, killSlice, session, slice, stopAndRemove } from './watch-tier';

await holdSession();

const leafTemp: string = realpathSync(required('AKROGON_E2E_ROOT'));
const out: string = required('AKROGON_E2E_OUT');
// The seat's minute budget bounds the whole run. Teardown gets its own margin past it.
const minutes: number = z.coerce.number().positive().parse(process.env.AKROGON_SESSION_MINUTES);
const teardownMs: number = 120_000;
const realBus: Record<string, string> = {
  DBUS_SESSION_BUS_ADDRESS: `unix:path=${realRuntime}/bus`,
  XDG_RUNTIME_DIR: realRuntime,
};

// This test is the judge. It holds the session (watch-tier.ts holdSession), then runs the body
// (watch-consults-body.ts) as one process in the session's slice, and everything the body starts stays in
// that slice (watch-tier.ts sessionPaths). The body writes only to the judge's private control folder. The
// judge stays outside: at the body's exit or the deadline, whichever comes first, it decides the outcome
// from the files the body wrote, kills the slice, counts the sessions, stops the slices and removes the
// core state and runtime, replaces <out> with the control folder as the run's report and checks absence,
// all before its process exits and drops the lock.
const written = (control: string, file: string): string | null =>
  existsSync(resolve(control, file)) ? readFileSync(resolve(control, file), 'utf8') : null;
const lines = (text: string | null): string[] => (text ?? '').split('\n').filter(Boolean);

// Decided before the kill: an exit is a pass or a red; at the deadline a red the body already wrote
// stays a red, otherwise it is a deadline stop at the last stage the body reached.
function verdict(control: string, ended: number | 'deadline'): Error | null {
  if (ended === 0) return null;
  const red: string | null = written(control, 'red.txt');
  if (ended !== 'deadline') return new Error(`watch-consults body exited ${ended}${red === null ? '' : `: ${red}`}`);
  if (red !== null) return new Error(red);
  return new Error(
    `watch-consults exceeded its ${minutes}-minute session deadline; last completed stage: ${written(control, 'stage.txt') ?? 'none'}`,
  );
}

// paid-starts.jsonl: a line per launch request, written before the request goes out; a line with the
// address it got (or `failed` when it got none) under the same id; and a line per consultant terminal
// the core reported. Every request counts, and so does a reported terminal no request got.
const startLine = z.union([
  z.object({ id: z.string(), role: z.enum(['watcher', 'consultant']) }),
  z.object({ id: z.string(), address: z.string() }),
  z.object({ id: z.string(), failed: z.literal(true) }),
  z.object({ event: z.string() }),
]);
type Usage = { watcher: string | null; consultants: (string | null)[]; sessions: number };

function usage(control: string): Usage {
  const starts: z.infer<typeof startLine>[] = lines(written(control, 'paid-starts.jsonl')).map((l: string) =>
    startLine.parse(JSON.parse(l)),
  );
  const address = (id: string): string | null =>
    starts.flatMap((s) => ('address' in s && s.id === id ? [s.address] : []))[0] ?? null;
  const requested: Set<string> = new Set(starts.flatMap((s) => ('address' in s ? [s.address] : [])));
  const requests: { id: string; role: 'watcher' | 'consultant' }[] = starts.flatMap((s) => ('role' in s ? [s] : []));
  const unannounced: string[] = [
    ...new Set(starts.flatMap((s) => ('event' in s && !requested.has(s.event) ? [s.event] : []))),
  ];
  return {
    watcher: requests.filter((s) => s.role === 'watcher').map((s) => address(s.id))[0] ?? null,
    consultants: [...requests.filter((s) => s.role === 'consultant').map((s) => address(s.id)), ...unannounced],
    sessions: requests.length + unannounced.length,
  };
}

// `systemd-run --scope` becomes the body once the scope is registered, so killing `launcher` also
// ends a launcher that has not registered yet: it then creates no scope.
async function teardown(launcher: Subprocess, control: string): Promise<void> {
  try {
    launcher.kill('SIGKILL');
    await launcher.exited;
    await killSlice();
    // Counted once the slice is empty, so a failed stop or removal still leaves the count.
    const used: Usage = usage(control);
    writeFileSync(resolve(control, 'paid-sessions.json'), JSON.stringify(used, null, 2));
    console.log(JSON.stringify(used));
    await stopAndRemove();
  } finally {
    rmSync(out, { recursive: true, force: true });
    cpSync(control, out, { recursive: true });
  }
  // Every tier folder but the core runtime lives under leafTemp, and so does the control folder.
  rmSync(leafTemp, { recursive: true, force: true });
  const left: string[] = absent(session);
  writeFileSync(resolve(out, 'absence.json'), JSON.stringify({ left }, null, 2));
  expect(left).toEqual([]);
}

test.serial(
  'watch consults: a notify-only failure consults, fixes the base and resumes the leaf',
  async () => {
    expect(required('AKROGON_E2E')).toBe('watch-consults');
    reservedSessions(2);
    const control: string = mkdtempSync(resolve(leafTemp, 'control-'));
    const deadline: number = Date.now() + minutes * 60_000;
    console.log(`session deadline: ${new Date(deadline).toISOString()} (AKROGON_SESSION_MINUTES=${minutes})`);
    const body = Bun.spawn(
      [
        'systemd-run',
        '--user',
        '--scope',
        '--quiet',
        `--slice=${slice}`,
        '--',
        process.execPath,
        resolve(import.meta.dir, 'watch-consults-body.ts'),
      ],
      {
        env: {
          ...process.env,
          ...realBus,
          AKROGON_RUN_SLICE: slice,
          AKROGON_E2E_ROOT: leafTemp,
          AKROGON_E2E_OUT: control,
          AKROGON_E2E_DEADLINE: String(deadline),
        },
        stdout: 'inherit',
        stderr: 'inherit',
      },
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ended: number | 'deadline' = await Promise.race([
      body.exited,
      new Promise<'deadline'>((done): void => {
        timer = setTimeout((): void => done('deadline'), deadline - Date.now());
      }),
    ]);
    clearTimeout(timer);
    const outcome: Error | null = verdict(control, ended);
    const failed: Error | null = await teardown(body, control).then(
      (): null => null,
      (error: Error): Error => error,
    );
    // A teardown failure is reported with the run's outcome, never in place of it.
    if (outcome !== null && failed !== null)
      throw new Error(`${outcome.message}\nteardown also failed: ${failed.message}`, { cause: outcome });
    if (outcome !== null) throw outcome;
    if (failed !== null) throw failed;
  },
  minutes * 60_000 + teardownMs,
);
