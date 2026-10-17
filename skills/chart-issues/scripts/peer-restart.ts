#!/usr/bin/env bun
import { z } from 'zod';

type Seat = { seat: string; pane: string };
type Launch = { kind: string; argv: string[] };
type State = {
  seat: string;
  old: string;
  new: string | null;
  kind: string | null;
  closed: boolean;
  restarted: boolean;
};
type Herdr =
  | { ok: true; stdout: string }
  | { ok: false; args: string[]; code: number | null; signal: string | null; stderr: string };

const agentListSchema = z.object({
  result: z.object({
    agents: z.array(
      z.object({
        pane_id: z.string(),
        agent: z.string(),
        name: z.string().optional(),
      }),
    ),
  }),
});

const processInfoSchema = z.object({
  result: z.object({
    process_info: z.object({
      foreground_process_group_id: z.number(),
      foreground_processes: z.array(z.object({ pid: z.number(), argv: z.array(z.string()) })),
    }),
  }),
});

const splitSchema = z.object({
  result: z.object({
    pane: z.object({ pane_id: z.string() }),
  }),
});

// Argv tokens that would relaunch a consultant restoring or forking its old context, which is
// exactly what the restart exists to drop. Matched as exact tokens or `--flag=value` forms.
const historyTokens: Record<string, string[]> = {
  codex: ['resume', 'fork'],
  pi: ['--continue', '-c', '--resume', '-r', '--session', '--session-id', '--fork'],
  claude: ['--continue', '-c', '--resume', '-r', '--session-id'],
};

function run(args: string[]): Herdr {
  const result: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['herdr', ...args], {
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const stdout: string = result.stdout.toString();
  if (result.exitCode === 0) return { ok: true, stdout };
  return {
    ok: false,
    args: ['herdr', ...args],
    code: result.exitCode,
    signal: result.signalCode ?? null,
    stderr: result.stderr.toString(),
  };
}

function failureText(fail: Extract<Herdr, { ok: false }>): string {
  return `${fail.args.join(' ')} failed (exit ${fail.code ?? `signal ${fail.signal}`}): ${fail.stderr}`;
}

// The relaunched agent name is stable per door and seat so a name held by any pane outside this
// restart means an older attempt's pane survived; herdr refuses uppercase, so lowercased ids only.
function agentName(aPane: string, seat: string): string {
  return `peer-${aPane.toLowerCase().replaceAll(':', '-')}-${seat.toLowerCase()}`;
}

function historyToken(kind: string, argv: string[]): string | undefined {
  const tokens: string[] = historyTokens[kind] ?? [];
  return argv
    .slice(1)
    .find((arg: string): boolean =>
      tokens.some((token: string): boolean => arg === token || (token.startsWith('--') && arg.startsWith(`${token}=`))),
    );
}

function emit(states: State[]): void {
  for (const state of states) {
    const line = {
      seat: state.seat,
      old: state.old,
      new: state.restarted ? state.new : null,
      kind: state.kind,
      state: state.restarted ? 'restarted' : state.closed ? 'closed' : 'untouched',
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  }
}

async function main(): Promise<void> {
  const argv: string[] = process.argv.slice(2);
  if (argv.length < 4 || argv.length % 2 !== 0) {
    process.stderr.write('Usage: peer-restart.ts <root> <A pane> <seat> <pane> [<seat> <pane>...]\n');
    process.exit(1);
  }
  const root: string = argv[0];
  const aPane: string = argv[1];
  const seats: Seat[] = Array.from({ length: (argv.length - 2) / 2 }, (_: unknown, i: number): Seat => ({
    seat: argv[2 + i * 2],
    pane: argv[3 + i * 2],
  }));
  const states: State[] = seats.map((seat: Seat): State => ({
    seat: seat.seat,
    old: seat.pane,
    new: null,
    kind: null,
    closed: false,
    restarted: false,
  }));
  const stateOf: Map<string, State> = new Map(states.map((state: State): [string, State] => [state.seat, state]));

  // Read phase: every kind and launch is collected and every refusal checked before any close.
  const list: Herdr = run(['agent', 'list']);
  if (!list.ok) {
    process.stderr.write(failureText(list));
    emit(states);
    process.exit(1);
  }
  const agents: z.infer<typeof agentListSchema>['result']['agents'] = agentListSchema.parse(JSON.parse(list.stdout))
    .result.agents;
  for (const seat of seats) {
    const agent = agents.find((a) => a.pane_id === seat.pane);
    if (agent !== undefined) stateOf.get(seat.seat)!.kind = agent.agent;
  }
  const launches: Map<string, Launch> = new Map();
  let refused: string | null = null;
  for (const seat of seats) {
    const agent = agents.find((a) => a.pane_id === seat.pane);
    if (agent === undefined) {
      refused = `seat ${seat.seat}: no agent on pane ${seat.pane}`;
      break;
    }
    const info: Herdr = run(['pane', 'process-info', '--pane', seat.pane]);
    if (!info.ok) {
      process.stderr.write(failureText(info));
      emit(states);
      process.exit(1);
    }
    const processes = processInfoSchema.parse(JSON.parse(info.stdout)).result.process_info;
    const leaders = processes.foreground_processes.filter((p) => p.pid === processes.foreground_process_group_id);
    if (leaders.length !== 1) {
      refused = `seat ${seat.seat}: no unique foreground leader on pane ${seat.pane}`;
      break;
    }
    const token: string | undefined = historyToken(agent.agent, leaders[0].argv);
    if (token !== undefined) {
      refused = `seat ${seat.seat}: argv restores or forks history (${token})`;
      break;
    }
    const name: string = agentName(aPane, seat.seat);
    const holder = agents.find((a) => a.name === name && !seats.some((s) => s.pane === a.pane_id));
    if (holder !== undefined) {
      refused = `seat ${seat.seat}: agent name ${name} held by pane ${holder.pane_id}`;
      break;
    }
    launches.set(seat.seat, { kind: agent.agent, argv: leaders[0].argv });
  }
  if (refused !== null) {
    process.stderr.write(`refusing restart, ${refused}\n`);
    emit(states);
    process.exit(1);
  }

  // Mutate phase: closes in reverse naming order, then splits and starts in naming order; the
  // first failure stops all later steps and every seat reports where it stood.
  for (const seat of [...seats].reverse()) {
    const close: Herdr = run(['pane', 'close', seat.pane]);
    if (!close.ok) {
      process.stderr.write(failureText(close));
      emit(states);
      process.exit(1);
    }
    stateOf.get(seat.seat)!.closed = true;
  }
  let source: string = aPane;
  let index: number = 0;
  for (const seat of seats) {
    const split: Herdr = run([
      'pane',
      'split',
      source,
      '--direction',
      index === 0 ? 'right' : 'down',
      '--ratio',
      index === 0 ? '0.65' : '0.5',
      '--cwd',
      root,
      '--no-focus',
    ]);
    if (!split.ok) {
      process.stderr.write(failureText(split));
      emit(states);
      process.exit(1);
    }
    const paneId: string = splitSchema.parse(JSON.parse(split.stdout)).result.pane.pane_id;
    stateOf.get(seat.seat)!.new = paneId;
    source = paneId;
    index += 1;
  }
  for (const seat of seats) {
    const state: State = stateOf.get(seat.seat)!;
    const launch: Launch = launches.get(seat.seat)!;
    const start: Herdr = run([
      'agent',
      'start',
      agentName(aPane, seat.seat),
      '--kind',
      launch.kind,
      '--pane',
      state.new!,
      '--',
      ...launch.argv.slice(1),
    ]);
    if (!start.ok) {
      process.stderr.write(failureText(start));
      emit(states);
      process.exit(1);
    }
    state.restarted = true;
  }
  emit(states);
  process.exit(0);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
