// Seats are hc terminals (plan D8-D11). A leaf seat starts inside its leaf scope with its first task in
// argv (agy gets it by one send after the trust dialog), proves the task started from hc events, and
// joins its leaf tab when a window is open. Slot A starts parentless; slot B starts under the leaf's
// live A, so the sidebar indents it, outliving A and typing no notes into it; with no live A it starts
// parentless too. A consultant starts under its caller.
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { parse } from 'shell-quote';
import { base, homePath, leafTemp, repoPrefix, seats, type GlobalConfig, type Repo, type SlotConfig } from './config';
import { CommandError, quote } from './shell';
import { readState, saveState, type Leaf, type State } from './state';
import { leafSlice, procRoot, sliceCgroup } from './scope';
import { refreshToolEntry } from './tool-cgroup';
import { type Slot } from './routing';
import { leafSeats } from './reconcile';
import {
  consultantName,
  watchConsultName,
  docGet,
  end,
  HcError,
  keys,
  labelArgs,
  renameTab,
  run,
  screen,
  seatName,
  send,
  subscribe,
  terminal,
  waitFor,
  waitForDoc,
  windowOpen,
  type HcLine,
  type Seen,
  type Space,
  type Stream,
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

const settingsSchema = z.looseObject({ permissions: z.looseObject({}).optional() });

export function harnessArgv(global: GlobalConfig, config: SlotConfig): Harness {
  if (!Object.hasOwn(global.harnesses, config.harness)) throw new Error(`Missing harness template "${config.harness}"`);
  const line: string = global.harnesses[config.harness]
    .replaceAll('{model}', quote(config.model))
    .replaceAll('{effort}', quote(config.effort));
  const argv: string[] = z.array(z.string()).min(1).parse(parse(line));
  if (argv[0] !== config.harness) throw new Error(`Harness launch must start with ${config.harness}`);
  if (config.harness === 'claude') {
    // Merge permissions.denyInsteadOfPrompting into the line's one --settings JSON object or append
    // the pair; refuse a line that cannot be merged without dropping a setting (plan D1/D2).
    const refuse = (operand: string, reason: string): never => {
      throw new Error(`Harness claude: --settings operand '${operand}' ${reason}`);
    };
    const settingsAt: number[] = argv.flatMap((arg: string, i: number) =>
      arg === '--settings' || arg.startsWith('--settings=') ? [i] : [],
    );
    const bare: number = argv.indexOf('--');
    if (bare !== -1) refuse(argv[bare], 'ends option parsing');
    if (settingsAt.length > 1) refuse('--settings', 'appears more than once');
    if (settingsAt.length === 0) {
      argv.push('--settings', JSON.stringify({ permissions: { denyInsteadOfPrompting: true } }));
    } else {
      const at: number = settingsAt[0];
      const arg: string = argv[at];
      const pair: boolean = arg === '--settings';
      const value: string | undefined = pair ? argv[at + 1] : arg.slice('--settings='.length);
      if (value === undefined) refuse('--settings', 'needs a value');
      const settings = ((): z.infer<typeof settingsSchema> => {
        try {
          return settingsSchema.parse(JSON.parse(value));
        } catch {
          return refuse(value, 'is not a JSON object with an object "permissions"');
        }
      })();
      const merged: string = JSON.stringify({
        ...settings,
        permissions: { ...(settings.permissions ?? {}), denyInsteadOfPrompting: true },
      });
      if (pair) argv[at + 1] = merged;
      else argv[at] = `--settings=${merged}`;
    }
  }
  const extra: string[] =
    config.harness === 'pi'
      ? ['--session-id', randomUUID()]
      : config.harness === 'claude'
        ? ['--disallowedTools=AskUserQuestion']
        : [];
  return { kind: config.harness, argv: [...argv, ...extra] };
}

function ended(t: Seen): boolean {
  return t.state === 'finished' || t.status?.state === 'error';
}

function remaining(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}

// agy takes no task in argv: answer its trust dialog once, wait for idle, send the task once, and
// retry on the next status when hc refuses it as still starting. Returns the turn the task went in at with
// the seat as it stood, or the state that ended the seat, or null when the budget ran out first.
async function agyTask(
  stream: Stream,
  address: string,
  task: string,
  deadline: number,
): Promise<{ turn: number; seat: Seen } | { ended: Seen } | null> {
  const session: string = stream.session;
  let answered: boolean = false;
  let attempted: boolean = false;
  let turn: number = 0;
  const ready: Seen | null = await waitFor(
    stream,
    address,
    null,
    async (t: Seen, line: HcLine): Promise<boolean> => {
      if (ended(t)) return true;
      if (!('terminals' in line) && line.params.type !== 'status') return false;
      if (!answered && t.status?.state === 'blocked' && t.status.kind === 'permission') {
        answered = true;
        await keys(session, address, 'enter');
        return false;
      }
      if (!((t.status?.state === 'idle' && (attempted || t.turn === 0)) || (attempted && t.status?.state === 'done')))
        return false;
      attempted = true;
      try {
        turn = (await send(session, address, task)).turn;
        return true;
      } catch (error) {
        if (!(error instanceof HcError) || error.kind !== 'unavailable') throw error;
        console.warn(
          JSON.stringify({
            warning: 'first task unavailable, waiting for status',
            session,
            address,
            error: error.message,
          }),
        );
        return false;
      }
    },
    remaining(deadline),
  );
  if (ready === null) return null;
  if (ended(ready)) return { ended: ready };
  return { turn, seat: ready };
}

function cgroupOf(pid: number): string | null {
  try {
    return readFileSync(resolve(procRoot(), String(pid), 'cgroup'), 'utf8').trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

type ScopeEntry = { outcome: 'entered' } | { outcome: 'exited' } | { outcome: 'outside'; cgroup: string };

// systemd-run moves the seat into its leaf scope before it execs the harness, late when the manager is
// slow, so the start-proof window opens only after scope entry. Three outcomes: entered once the
// seat's cgroup ends with the scope path, exited once its /proc entry is gone (firstTask then reports
// the end), outside when PANE_WAIT_MS passes with the seat still elsewhere.
async function scopeEntry(pid: number, scope: string): Promise<ScopeEntry> {
  const deadline: number = Date.now() + PANE_WAIT_MS;
  for (;;) {
    const cgroup: string | null = cgroupOf(pid);
    if (cgroup === null) return { outcome: 'exited' };
    if (cgroup.endsWith(scope)) return { outcome: 'entered' };
    if (Date.now() >= deadline) return { outcome: 'outside', cgroup };
    await Bun.sleep(50);
  }
}

// The first task is proven started when the seat goes working or its turn passes the turn the task
// went in at; nothing is sent before that (start proof, plan D9). It reads the seat's stream, opened before
// the seat ran.
async function firstTask(stream: Stream, seat: Seen, kind: string, task: string): Promise<Started> {
  const deadline: number = Date.now() + START_PROOF_MS;
  const fail = async (last: Seen): Promise<Started> => ({
    outcome: 'failed',
    seat: last,
    screen: await screen(seat.session, seat.address),
  });
  // A new terminal starts at turn 0, the turn an argv task goes in at.
  let delivered: number = 0;
  let start: Seen | null = null;
  if (kind === 'agy') {
    const sent: { turn: number; seat: Seen } | { ended: Seen } | null = await agyTask(
      stream,
      seat.address,
      task,
      deadline,
    );
    if (sent !== null && 'ended' in sent) return fail(sent.ended);
    if (sent !== null) {
      delivered = sent.turn;
      start = sent.seat;
    }
  }
  const proof: Seen | null = await waitFor(
    stream,
    seat.address,
    start,
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
  const slice: string = leafSlice(repo, state.slug, homePath());
  const unit: string = `${slice.replace(/\.slice$/, '')}-${name}-${randomBytes(4).toString('hex')}.scope`;
  const scopeCgroup: string = `${sliceCgroup(slice)}/${unit}`;
  // Both entry files refresh atomically on every start, so a seat never wires a stale script.
  refreshToolEntry(homePath());
  const entryDir: string = resolve(homePath(), 'tool-entry');
  // Every kind carries the seat scope marker; claude gets the wrapper shell, agy the PATH-first
  // wrapper, every other kind the sourced BASH_ENV. Env assignments cannot self-reference, so the
  // agy wrapper prepends the entry dir inside a shell that execs the harness, keeping the terminal's
  // inherited PATH whole.
  const wiring: string[] =
    harness.kind === 'claude'
      ? [`CLAUDE_CODE_SHELL=${resolve(entryDir, 'bash')}`, 'CLAUDE_CODE_TOOL_MEMORY_LIMIT=none']
      : harness.kind === 'agy'
        ? []
        : [`BASH_ENV=${resolve(entryDir, 'bash-env')}`];
  // The agy harness runs through a shell that prepends the entry dir to its inherited PATH and
  // execs the harness tokens unchanged, so the wrapper script shadows bash for agy's shell children.
  const agyWrap: string[] =
    harness.kind === 'agy' ? ['sh', '-c', `export PATH=${quote(entryDir)}:$PATH; exec "$0" "$@"`] : [];
  const a: Seen | undefined = slot === 'B' ? (await leafSeats(space.session, repo, readState(leaf.path))).A : undefined;
  // The seat's own labels: hc sets them at creation and herdr-app never changes them.
  const own: Record<string, string> = { 'akrogon.repo': repo.name, 'akrogon.leaf': state.slug, 'akrogon.seat': seat };
  const stream: Stream = await subscribe(space.session, labelArgs(own));
  try {
    const launched: Seen = await run(space.session, {
      name,
      cwd: worktree,
      parent: a?.state === 'live' ? { address: a.address, outlive: true } : null,
      labels: {
        akrogon: '1',
        ...own,
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
        // Delegate the scope so its tools/, akrogon/ and helpers/ sub-cgroups can exist.
        '-p',
        'Delegate=yes',
        '--',
        'env',
        ...UNSET,
        `AKROGON_BASE=${await base(repo, worktree)}`,
        'GIT_EDITOR=true',
        `TMPDIR=${leafTemp(repo, state.slug)}`,
        'NODE_DISABLE_COMPILE_CACHE=1',
        `AKROGON_SEAT_CGROUP=${scopeCgroup}`,
        ...wiring,
        ...agyWrap,
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
    const entry: ScopeEntry = await scopeEntry(z.number().parse(launched.pid), `/${slice}/${unit}`);
    if (entry.outcome === 'outside') {
      await end(space.session, launched.address);
      throw new Error(
        JSON.stringify({
          seat: launched.address,
          error: 'seat outside its leaf scope',
          expected: unit,
          cgroup: entry.cgroup,
        }),
      );
    }
    // The scope's three sub-cgroups: tools/ minted by the entry, akrogon/ the relocation target,
    // helpers/ the deferred-kill waiters. A creation failure refuses the start like the outside
    // refusal; an exited seat never bootstraps — firstTask reports its end.
    if (entry.outcome === 'entered') {
      try {
        for (const dir of ['tools', 'akrogon', 'helpers']) mkdirSync(resolve(scopeCgroup, dir), { recursive: true });
      } catch (error) {
        await end(space.session, launched.address);
        throw new Error(
          JSON.stringify({
            seat: launched.address,
            error: 'seat scope bootstrap failed',
            expected: unit,
            cause: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    }
    const started: Started = await firstTask(stream, launched, harness.kind, task);
    announce(started);
    if (started.outcome === 'failed') return started;
    record(leaf.path, (s: State) =>
      started.outcome === 'confirmed'
        ? {
            ...s,
            prompted: { ...s.prompted, [slot]: { turn: started.turn, address: launched.address } },
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
    await place(space.session, launched.address, tab, expectedTabName(readState(leaf.path)));
    return started;
  } finally {
    stream.stop();
  }
}

// A consultant or direct reviewer: a child of the calling terminal, in the caller's tab when it sits
// in one, started in the caller's folder without the leaf scope. The caller supplies the hc name and
// the akrogon labels; herdr labels follow the caller's tab.
async function launch(
  global: GlobalConfig,
  repo: Repo,
  space: Place,
  caller: string,
  spec: { name: string; labels: Record<string, string> },
  config: SlotConfig,
  task: string | undefined,
): Promise<Started | null> {
  const harness: Harness = harnessArgv(global, config);
  const tabs: { space: string; tab: string }[] = (await docGet(space.session)).spaces.flatMap((s: Space) =>
    s.tabs.filter((t) => t.terminals.includes(caller)).map((t) => ({ space: s.id, tab: t.id })),
  );
  const stream: Stream = await subscribe(space.session, labelArgs(spec.labels));
  try {
    const launched: Seen = await run(space.session, {
      name: spec.name,
      cwd: process.cwd(),
      parent: { address: caller, outlive: false },
      labels: {
        akrogon: '1',
        'akrogon.repo': repo.name,
        ...spec.labels,
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
    const started: Started = await firstTask(stream, launched, harness.kind, task);
    announce(started);
    return started;
  } finally {
    stream.stop();
  }
}

export async function startConsultant(
  global: GlobalConfig,
  repo: Repo,
  space: Place,
  caller: string,
  letter: string,
  config: SlotConfig,
  task: string | undefined,
): Promise<Started | null> {
  return launch(
    global,
    repo,
    space,
    caller,
    {
      name: consultantName(repoPrefix(global, repo.name), letter),
      labels: { 'akrogon.seat': letter },
    },
    config,
    task,
  );
}

// The watcher repo's consultant: same child-of-caller launch as a door consultant, with its own
// fixed name and watch label so it never collides with <prefix>-slot-<letter> terminals.
export async function startWatchConsult(
  global: GlobalConfig,
  repo: Repo,
  space: Place,
  caller: string,
  recipe: SlotConfig,
  task: string | undefined,
): Promise<Started | null> {
  return launch(
    global,
    repo,
    space,
    caller,
    {
      name: watchConsultName(repoPrefix(global, repo.name)),
      labels: { 'akrogon.watch-consult': repo.name },
    },
    recipe,
    task,
  );
}
