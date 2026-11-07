// Seats are hc terminals (plan D8-D11). A leaf seat starts parentless inside its leaf scope with its
// first task in argv (agy gets it by one send after the trust dialog), proves the task started from
// hc events, and joins its leaf tab when a window is open. A consultant starts under its caller.
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { parse } from 'shell-quote';
import { base, leafTemp, repoPrefix, seats, type GlobalConfig, type Repo, type SlotConfig } from './config';
import { CommandError, quote } from './shell';
import { readState, saveState, type Leaf, type State } from './state';
import { leafSlice } from './scope';
import { type Slot } from './routing';
import {
  consultantName,
  docGet,
  end,
  HcError,
  keys,
  renameTab,
  run,
  screen,
  seatName,
  send,
  terminal,
  waitFor,
  waitForDoc,
  windowOpen,
  type Seen,
  type Space,
} from './hc';

const msSchema = z
  .string()
  .regex(/^[1-9][0-9]*$/)
  .transform(Number)
  .optional();
const START_PROOF_MS: number = msSchema.parse(process.env.AKROGON_START_PROOF_MS) ?? 60_000;
const PANE_WAIT_MS: number = msSchema.parse(process.env.AKROGON_PANE_WAIT_MS) ?? 15_000;

// Claude Code child-session markers: a seat started from inside a Claude session must not inherit them.
const MARKERS: string[] = [
  'CLAUDECODE',
  'CLAUDE_CODE_CHILD_SESSION',
  'CLAUDE_CODE_SESSION_ID',
  'CLAUDE_CODE_ENTRYPOINT',
  'CLAUDE_CODE_EXECPATH',
  'CLAUDE_CODE_MESSAGING_SOCKET',
  'CLAUDE_CODE_MESSAGING_TOKEN',
  'CLAUDE_CODE_SESSION_ATTENDED',
  'CLAUDE_PID',
  'CLAUDE_EFFORT',
];
const UNSET: string[] = MARKERS.flatMap((name: string) => ['-u', name]);

export type Place = { session: string; space: string };

export type Started =
  | { outcome: 'confirmed'; seat: Seen; turn: number }
  | { outcome: 'unconfirmed'; seat: Seen; turn: number; screen: string }
  | { outcome: 'failed'; seat: Seen; screen: string };

type Harness = { kind: string; argv: string[] };

export function harnessArgv(global: GlobalConfig, config: SlotConfig): Harness {
  if (!Object.hasOwn(global.harnesses, config.harness)) throw new Error(`Missing harness template "${config.harness}"`);
  const line: string = global.harnesses[config.harness]
    .replaceAll('{model}', quote(config.model))
    .replaceAll('{effort}', quote(config.effort));
  const argv: string[] = z.array(z.string()).min(1).parse(parse(line));
  if (argv[0] !== config.harness) throw new Error(`Harness launch must start with ${config.harness}`);
  return { kind: config.harness, argv: config.harness === 'pi' ? [...argv, '--session-id', randomUUID()] : argv };
}

function ended(t: Seen): boolean {
  return t.state === 'finished' || t.status?.state === 'error';
}

function remaining(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}

// agy takes no task in argv: answer its trust dialog once, wait for idle, send the task once, and
// resend once when hc refuses it as still starting. Returns the turn the task went in at, or the
// state that ended the seat, or null when the budget ran out first.
async function agyTask(
  session: string,
  address: string,
  task: string,
  deadline: number,
): Promise<{ turn: number } | { ended: Seen } | null> {
  const trust = (t: Seen): boolean => t.status?.state === 'blocked' && t.status.kind === 'permission';
  const ready: Seen | null = await waitFor(
    session,
    address,
    (t: Seen) => ended(t) || trust(t) || (t.status?.state === 'idle' && t.turn === 0),
    remaining(deadline),
  );
  if (ready === null) return null;
  if (ended(ready)) return { ended: ready };
  if (trust(ready)) {
    await keys(session, address, 'enter');
    const idle: Seen | null = await waitFor(
      session,
      address,
      (t: Seen) => ended(t) || t.status?.state === 'idle',
      remaining(deadline),
    );
    if (idle === null) return null;
    if (ended(idle)) return { ended: idle };
  }
  try {
    return { turn: (await send(session, address, task)).turn };
  } catch (error) {
    if (!(error instanceof HcError) || error.kind !== 'unavailable') throw error;
  }
  const settled: Seen | null = await waitFor(
    session,
    address,
    (t: Seen) => ended(t) || t.status?.state === 'idle' || t.status?.state === 'done',
    remaining(deadline),
  );
  if (settled === null) return null;
  if (ended(settled)) return { ended: settled };
  return { turn: (await send(session, address, task)).turn };
}

// The first task is proven started when the seat goes working or its turn passes the turn the task
// went in at; nothing is sent before that (start proof, plan D9).
async function firstTask(seat: Seen, kind: string, task: string): Promise<Started> {
  const deadline: number = Date.now() + START_PROOF_MS;
  const fail = async (last: Seen): Promise<Started> => ({
    outcome: 'failed',
    seat: last,
    screen: await screen(seat.session, seat.address),
  });
  // A new terminal starts at turn 0, the turn an argv task goes in at.
  let delivered: number = 0;
  if (kind === 'agy') {
    const sent: { turn: number } | { ended: Seen } | null = await agyTask(seat.session, seat.address, task, deadline);
    if (sent !== null && 'ended' in sent) return fail(sent.ended);
    if (sent !== null) delivered = sent.turn;
  }
  const proof: Seen | null = await waitFor(
    seat.session,
    seat.address,
    (t: Seen) => ended(t) || t.status?.state === 'working' || t.turn > delivered,
    remaining(deadline),
  );
  if (proof !== null && ended(proof)) return fail(proof);
  if (proof !== null) return { outcome: 'confirmed', seat: proof, turn: delivered };
  const last: Seen = await terminal(seat.session, seat.address);
  return { outcome: 'unconfirmed', seat: last, turn: last.turn, screen: await screen(seat.session, seat.address) };
}

function announce(started: Started): void {
  const address: string = started.seat.address;
  if (started.outcome === 'confirmed') console.log(address);
  else if (started.outcome === 'unconfirmed') console.log(`started, not confirmed ${address}\n${started.screen}`);
  else console.error(`start failed ${address}\n${started.screen}`);
}

function inTab(doc: { spaces: Space[] }, tab: string, address: string): boolean {
  return doc.spaces.some((space: Space) => space.tabs.some((t) => t.id === tab && t.terminals.includes(address)));
}

// With a window open the seat must show in its leaf tab before the tab is named; a seat that never
// shows is ended. A closed window leaves placement to herdr-app's adoption of the labels (plan D11).
async function place(session: string, address: string, tab: string, name: string): Promise<void> {
  if (!(await windowOpen(session))) return;
  const shown: { version: number; spaces: Space[] } | null = await waitForDoc(
    session,
    (doc) => inTab(doc, tab, address),
    PANE_WAIT_MS,
  );
  if (shown === null) {
    await end(session, address);
    throw new Error(
      JSON.stringify({ seat: address, error: 'seat did not show in its tab', tab, waited_ms: PANE_WAIT_MS }),
    );
  }
  try {
    await renameTab(session, tab, name);
  } catch (error) {
    if (!(error instanceof CommandError)) throw error;
    console.warn(JSON.stringify({ warning: 'tab rename failed', seat: address, tab, name, error: error.message }));
  }
}

export function expectedTabName(state: State): string {
  return state.phase === 'failed' ? `${state.slug} failed` : state.slug;
}

function record(path: string, change: (state: State) => State): void {
  saveState(path, change(readState(path)));
}

// Starts seat <slot> of an allocated leaf (worktree, temp and tab already set) with its task.
export async function startSeat(
  global: GlobalConfig,
  repo: Repo,
  leaf: Leaf,
  slot: Slot,
  task: string,
  space: Place,
): Promise<Started> {
  const state: State = leaf.state;
  const worktree: string = z.string().parse(state.worktree);
  const tab: string = z.string().parse(state.tab);
  const seat: 'a' | 'b' = slot === 'A' ? 'a' : 'b';
  const name: string = seatName(repo.name, repoPrefix(global, repo.name), state.slug, seat);
  const harness: Harness = harnessArgv(global, seats(global, repo, leaf.path)[seat]);
  const slice: string = leafSlice(repo, state.slug);
  const unit: string = `${slice.replace(/\.slice$/, '')}-${name}-${randomBytes(4).toString('hex')}.scope`;
  const launched: Seen = await run(space.session, {
    name,
    cwd: worktree,
    parent: null,
    labels: {
      akrogon: '1',
      'akrogon.repo': repo.name,
      'akrogon.leaf': state.slug,
      'akrogon.seat': seat,
      'herdr.space': space.space,
      'herdr.tab': tab,
    },
    argv: [
      'systemd-run',
      '--user',
      '--scope',
      '--quiet',
      '--expand-environment=no',
      `--unit=${unit}`,
      `--slice=${slice}`,
      '-p',
      'TimeoutStopSec=5',
      '-p',
      'CollectMode=inactive-or-failed',
      '-p',
      'SendSIGHUP=yes',
      '--',
      'env',
      ...UNSET,
      `AKROGON_BASE=${await base(repo, worktree)}`,
      'GIT_EDITOR=true',
      `TMPDIR=${leafTemp(repo, state.slug)}`,
      'NODE_DISABLE_COMPILE_CACHE=1',
      ...harness.argv,
      ...(harness.kind === 'agy' ? [] : [task]),
    ],
  });
  record(leaf.path, (s: State) => ({
    ...s,
    seat: { ...s.seat, [slot]: { session: space.session, address: launched.address } },
    prompted: { ...s.prompted, [slot]: undefined },
    delivery_error: { ...s.delivery_error, [slot]: undefined },
  }));
  const started: Started = await firstTask(launched, harness.kind, task);
  announce(started);
  if (started.outcome === 'failed') return started;
  record(leaf.path, (s: State) =>
    started.outcome === 'confirmed'
      ? {
          ...s,
          prompted: { ...s.prompted, [slot]: { turn: started.turn, address: launched.address } },
          attempts: { ...s.attempts, [slot]: s.attempts[slot] + 1 },
        }
      : {
          ...s,
          delivery_error: {
            ...s.delivery_error,
            [slot]: {
              code: 'not_confirmed',
              address: launched.address,
              turn: started.turn,
              screen: started.screen,
              at: new Date().toISOString(),
            },
          },
        },
  );
  const cgroup: string = readFileSync(`/proc/${z.number().parse(started.seat.pid)}/cgroup`, 'utf8').trim();
  if (!cgroup.endsWith(`/${slice}/${unit}`)) {
    await end(space.session, launched.address);
    throw new Error(
      JSON.stringify({ seat: launched.address, error: 'seat outside its leaf scope', expected: unit, cgroup }),
    );
  }
  await place(space.session, launched.address, tab, expectedTabName(readState(leaf.path)));
  return started;
}

// A consultant or direct reviewer: a child of the calling terminal, in the caller's tab when it sits
// in one, started in the caller's folder without the leaf scope.
export async function startConsultant(
  global: GlobalConfig,
  repo: Repo,
  space: Place,
  caller: string,
  letter: string,
  config: SlotConfig,
  task: string | undefined,
): Promise<Started | null> {
  const harness: Harness = harnessArgv(global, config);
  const tabs: { space: string; tab: string }[] = (await docGet(space.session)).spaces.flatMap((s: Space) =>
    s.tabs.filter((t) => t.terminals.includes(caller)).map((t) => ({ space: s.id, tab: t.id })),
  );
  const launched: Seen = await run(space.session, {
    name: consultantName(repoPrefix(global, repo.name), letter),
    cwd: process.cwd(),
    parent: caller,
    labels: {
      akrogon: '1',
      'akrogon.repo': repo.name,
      'akrogon.seat': letter,
      ...(tabs.length === 0
        ? { 'herdr.space': space.space }
        : { 'herdr.space': tabs[0].space, 'herdr.tab': tabs[0].tab }),
    },
    argv: ['env', ...UNSET, ...harness.argv, ...(task === undefined || harness.kind === 'agy' ? [] : [task])],
  });
  if (task === undefined) {
    console.log(launched.address);
    return null;
  }
  const started: Started = await firstTask(launched, harness.kind, task);
  announce(started);
  return started;
}
