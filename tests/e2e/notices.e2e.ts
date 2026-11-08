// Criterion 4, attended notices tier (free): a real herdr-app window in akr-e2e-notices with
// herdr-setup's session-status handler. Run: AKROGON_E2E=notices
// AKROGON_E2E_HANDLER=$HOME/.config/herdr-app/mods/session-status/notices.js AKROGON_E2E_ROOT=<leaf temp>
// AKROGON_E2E_OUT=<leaf>/implementation/notices-tier bun test --timeout=600000 ./tests/e2e/notices.e2e.ts
// Exactly two herdr starts (startTier's openOnce, then the window below); a missing handler fails
// before either.
import { test, expect } from 'bun:test';
import { existsSync, readFileSync, realpathSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { spawnCaptured, type SpawnResult } from '../../src/shell';
import { realEnv, realHome, required, startTier, stopTier, tierSession, type Tier, type TierSession } from './tier';

const notices: TierSession = tierSession('akr-e2e-notices');
const folder: string = resolve(notices.appHome, 'akrogon-notices');
const windowLog: string = resolve(realHome, '.local/state/herdrapp', `${notices.name}.log`);

// run-check passes a clean environment; the window, shots and pactl need the desktop's display and
// bus, read from the user manager the desktop session exported them to.
function desktopEnv(): Record<string, string> {
  const shown: string = Bun.spawnSync(['systemctl', '--user', 'show-environment'], {
    env: realEnv(),
  }).stdout.toString();
  const vars: Map<string, string> = new Map(
    shown
      .split('\n')
      .filter((line: string) => line.includes('='))
      .map((line: string): [string, string] => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
  return Object.fromEntries(
    ['WAYLAND_DISPLAY', 'DISPLAY', 'DBUS_SESSION_BUS_ADDRESS'].map((name: string): [string, string] => [
      name,
      z.string().min(1, `${name} is not in the user manager's environment`).parse(vars.get(name)),
    ]),
  );
}

function app(desktop: Record<string, string>, args: string[]): Promise<SpawnResult> {
  return spawnCaptured(['herdr-app', ...args], {
    env: realEnv({ ...desktop, HERDR_APP_HOME: notices.appHome }),
  });
}

// Writes one notice through the verb the watcher uses and returns its file.
async function notice(tier: Tier, title: string, body: string, attention: boolean): Promise<string> {
  const written: SpawnResult = await tier.akrogon([
    'notice',
    '--title',
    title,
    '--body',
    body,
    ...(attention ? ['--attention'] : []),
  ]);
  expect(written.code, written.stderr).toBe(0);
  const path: string = written.stdout.trim();
  expect(path.startsWith(`${folder}/`)).toBe(true);
  expect(existsSync(path)).toBe(true);
  return path;
}

// Waits, bounded, for the handler to delete a notice, following the folder's change events; the watch
// is armed before the first check, so a delete in between is not missed.
function gone(path: string, seconds: number): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const watcher = watch(folder, (): void => {
      if (!existsSync(path)) finish(true);
    });
    const timer = setTimeout((): void => finish(!existsSync(path)), seconds * 1000);
    function finish(result: boolean): void {
      clearTimeout(timer);
      watcher.close();
      done(result);
    }
    if (!existsSync(path)) finish(true);
  });
}

function shownLine(path: string): boolean {
  const name: string = path.slice(folder.length + 1);
  return (
    existsSync(windowLog) &&
    readFileSync(windowLog, 'utf8')
      .split('\n')
      .some(
        (line: string) =>
          line.includes('akrogon-notice') && line.includes(`"name":"${name}"`) && line.includes('"outcome":"shown"'),
      )
  );
}

function toasts(status: SpawnResult): number {
  const parsed = z
    .object({ overlays: z.array(z.string()) })
    .passthrough()
    .parse(JSON.parse(status.stdout));
  return parsed.overlays.filter((overlay: string) => overlay === 'toast').length;
}

// pactl subscribe's output so far; `changed` settles on the next chunk.
type Captured = { text: string; changed: Promise<void> };

function capture(stream: ReadableStream<Uint8Array>): Captured {
  let signal: () => void = (): void => undefined;
  const captured: Captured = { text: '', changed: new Promise<void>((done) => (signal = done)) };
  void (async (): Promise<void> => {
    for await (const chunk of stream) {
      captured.text += new TextDecoder().decode(chunk);
      const settle: () => void = signal;
      captured.changed = new Promise<void>((done) => (signal = done));
      settle();
    }
  })();
  return captured;
}

// New sink-input events after `from`, waiting up to `ms` on pactl's own output for the first one.
async function sinkInputs(output: Captured, from: number, ms: number): Promise<number> {
  const count = (): number => (output.text.slice(from).match(/Event 'new' on sink-input #\d+/g) ?? []).length;
  const deadline: Promise<void> = new Promise<void>((done) => setTimeout(done, ms));
  let expired: boolean = false;
  void deadline.then((): void => {
    expired = true;
  });
  while (count() === 0 && !expired) await Promise.race([output.changed, deadline]);
  return count();
}

test('notices tier: closed-window wait, toast and deletion, attention sound only when asked', async () => {
  expect(required('AKROGON_E2E')).toBe('notices');
  const handler: string = required('AKROGON_E2E_HANDLER');
  if (!existsSync(handler))
    throw new Error(
      `herdr-setup's notice handler is not installed: ${handler} is missing; land herdr-setup's status-notices leaf and run /home/ivan/Work/infra/herdr-setup/install`,
    );
  const desktop: Record<string, string> = desktopEnv();
  const tier: Tier = await startTier(
    notices,
    'notices',
    { fake: 'true' },
    {
      a: { harness: 'fake', model: 'none', effort: 'low' },
      b: { harness: 'fake', model: 'none', effort: 'low' },
    },
  );
  let window: Bun.Subprocess | null = null;
  let pactl: Bun.Subprocess<'ignore', 'pipe', 'ignore'> | null = null;
  try {
    // startTier's first start made the session home and linked the personal mods into it.
    const linked: string = resolve(notices.appHome, 'mods/session-status/notices.js');
    if (!existsSync(linked) || realpathSync(linked) !== realpathSync(handler))
      throw new Error(
        `herdr-setup's session-status handler is not linked into ${notices.name}: ${linked} does not resolve to ${handler}; run /home/ivan/Work/infra/herdr-setup/install`,
      );

    // Window closed: the notice waits on disk.
    const closed: string = await notice(tier, 'akre2e closed', 'written with the window closed', true);

    // Start 2: the window opens, shows the waiting notice and deletes it.
    window = Bun.spawn(['herdr', '--session', notices.name], {
      env: realEnv(desktop),
      stdout: 'ignore',
      stderr: 'ignore',
    });
    expect(await gone(closed, 20)).toBe(true);
    const afterClosed: SpawnResult = await app(desktop, ['status']);
    tier.record('status-closed.json', afterClosed.stdout);
    expect(toasts(afterClosed)).toBeGreaterThanOrEqual(1);
    tier.record('shot-closed.txt', JSON.stringify(await app(desktop, ['shot', resolve(tier.out, 'closed.png')])));

    // Window open: an attention notice plays a sound, a silent one does not.
    pactl = Bun.spawn(['pactl', 'subscribe'], { env: realEnv(), stdout: 'pipe', stderr: 'ignore' });
    const output: Captured = capture(pactl.stdout);
    const loudFrom: number = output.text.length;
    const loud: string = await notice(tier, 'akre2e open', 'attention notice with the window open', true);
    expect(await gone(loud, 20)).toBe(true);
    expect(await sinkInputs(output, loudFrom, 5000)).toBeGreaterThanOrEqual(1);
    const afterLoud: SpawnResult = await app(desktop, ['status']);
    tier.record('status-open.json', afterLoud.stdout);
    expect(toasts(afterLoud)).toBeGreaterThanOrEqual(1);
    tier.record('shot-open.txt', JSON.stringify(await app(desktop, ['shot', resolve(tier.out, 'open.png')])));

    const quietFrom: number = output.text.length;
    const quiet: string = await notice(tier, 'akre2e silent', 'silent notice with the window open', false);
    expect(await gone(quiet, 20)).toBe(true);
    expect(await sinkInputs(output, quietFrom, 5000)).toBe(0);
    tier.record('status-silent.json', (await app(desktop, ['status'])).stdout);
    tier.record('pactl.txt', output.text);
    // The window log was still empty while the window ran (implementation/report.md, launch T1), so the
    // handler's shown lines are read once the window has stopped.
    const stopped: SpawnResult = await spawnCaptured(['herdr', 'session', 'stop', notices.name], { env: realEnv() });
    expect(stopped.code, stopped.stderr).toBe(0);
    for (const path of [closed, loud, quiet]) expect(shownLine(path)).toBe(true);
  } finally {
    pactl?.kill();
    // herdr session delete removes the window log, so it is kept first.
    tier.record('window.log', existsSync(windowLog) ? readFileSync(windowLog, 'utf8') : '(no window log)\n');
    const left: string[] = await stopTier(tier, []);
    window?.kill();
    tier.record('absence.txt', left.length === 0 ? 'absent\n' : left.join('\n'));
    expect(left).toEqual([]);
  }
}, 600_000);
