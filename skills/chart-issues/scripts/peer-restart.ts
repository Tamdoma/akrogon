#!/usr/bin/env bun
import { z } from 'zod';

type Seat = { seat: string; pane: string };
type Launch = { kind: string; group: number; argv: string[] };
type State = {
  seat: string;
  pane: string;
  kind: string | null;
  stopped: boolean;
  restarted: boolean;
};
export type Herdr =
  | { ok: true; stdout: string }
  | { ok: false; args: string[]; code: number | null; signal: string | null; stderr: string };

const agentListSchema = z.object({
  result: z.object({
    agents: z.array(
      z.object({
        pane_id: z.string(),
        agent: z.string().nullish(),
        name: z.string().optional(),
      }),
    ),
  }),
});

// While an agent exits herdr keeps its row, without `agent` but still holding the name, for about
// a second before dropping it (probed 2026-10-17 with codex).
type AgentRow = z.infer<typeof agentListSchema>['result']['agents'][number];
type Agent = AgentRow & { agent: string };

const processInfoSchema = z.object({
  result: z.object({
    process_info: z.object({
      foreground_process_group_id: z.number(),
      foreground_processes: z.array(z.object({ pid: z.number(), argv: z.array(z.string()) })),
    }),
  }),
});

// herdr frees a pane's agent and its name about a second after the process exits; probed
// 2026-10-17 with codex and pi, a start before that fails `agent_name_taken`.
const STOP_TIMEOUT_MS: number = 30_000;
const STOP_POLL_MS: number = 250;

// Argv tokens that would relaunch a consultant restoring or forking its old context, which is
// exactly what the restart exists to drop. Matched as exact tokens or `--flag=value` forms.
const historyTokens: Record<string, string[]> = {
  codex: ['resume', 'fork'],
  pi: ['--continue', '-c', '--resume', '-r', '--session', '--session-id', '--fork'],
  claude: ['--continue', '-c', '--resume', '-r', '--session-id'],
};

export function run(args: string[]): Herdr {
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

export function failureText(fail: Extract<Herdr, { ok: false }>): string {
  return `${fail.args.join(' ')} failed (exit ${fail.code ?? `signal ${fail.signal}`}): ${fail.stderr}`;
}

// The agent name is stable per door and seat so a name held by any pane outside this restart
// means an older attempt's pane survived; herdr refuses uppercase, so lowercased ids only.
export function agentName(aPane: string, seat: string): string {
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
      pane: state.pane,
      kind: state.kind,
      state: state.restarted ? 'restarted' : state.stopped ? 'stopped' : 'untouched',
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  }
}

function paneListed(pane: string): Extract<Herdr, { ok: false }> | boolean {
  const list: Herdr = run(['agent', 'list']);
  if (!list.ok) return list;
  return agentListSchema.parse(JSON.parse(list.stdout)).result.agents.some((a) => a.pane_id === pane);
}

async function main(): Promise<void> {
  const argv: string[] = process.argv.slice(2);
  if (argv.length < 3 || argv.length % 2 !== 1) {
    process.stderr.write('Usage: peer-restart.ts <A pane> <seat> <pane> [<seat> <pane>...]\n');
    process.exit(1);
  }
  const aPane: string = argv[0];
  const seats: Seat[] = Array.from({ length: (argv.length - 1) / 2 }, (_: unknown, i: number): Seat => ({
    seat: argv[1 + i * 2],
    pane: argv[2 + i * 2],
  }));
  const states: State[] = seats.map((seat: Seat): State => ({
    seat: seat.seat,
    pane: seat.pane,
    kind: null,
    stopped: false,
    restarted: false,
  }));
  const stateOf: Map<string, State> = new Map(states.map((state: State): [string, State] => [state.seat, state]));

  // Read phase: every kind and launch is collected and every refusal checked before any stop.
  const list: Herdr = run(['agent', 'list']);
  if (!list.ok) {
    process.stderr.write(failureText(list));
    emit(states);
    process.exit(1);
  }
  const rows: AgentRow[] = agentListSchema.parse(JSON.parse(list.stdout)).result.agents;
  const agents: Agent[] = rows.filter((a: AgentRow): a is Agent => a.agent !== null && a.agent !== undefined);
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
    const holder = rows.find((a) => a.name === name && !seats.some((s) => s.pane === a.pane_id));
    if (holder !== undefined) {
      refused = `seat ${seat.seat}: agent name ${name} held by pane ${holder.pane_id}`;
      break;
    }
    launches.set(seat.seat, { kind: agent.agent, group: leaders[0].pid, argv: leaders[0].argv });
  }
  if (refused !== null) {
    process.stderr.write(`refusing restart, ${refused}\n`);
    emit(states);
    process.exit(1);
  }

  // Mutate phase, in naming order and in each seat's own pane, so the layout never changes: stop
  // the agent's process group, wait until herdr no longer lists an agent on the pane, start the
  // same kind and argv again. The first failure stops all later steps and every seat reports
  // where it stood.
  for (const seat of seats) {
    const state: State = stateOf.get(seat.seat)!;
    const launch: Launch = launches.get(seat.seat)!;
    const kill: Bun.SyncSubprocess<'pipe', 'pipe'> = Bun.spawnSync(['kill', '-TERM', '--', `-${launch.group}`], {
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe',
    });
    if (kill.exitCode !== 0) {
      process.stderr.write(
        `kill -TERM -- -${launch.group} failed (exit ${kill.exitCode ?? `signal ${kill.signalCode}`}): ${kill.stderr.toString()}`,
      );
      emit(states);
      process.exit(1);
    }
    state.stopped = true;
    const deadline: number = Date.now() + STOP_TIMEOUT_MS;
    let present: Extract<Herdr, { ok: false }> | boolean = paneListed(seat.pane);
    while (present === true && Date.now() < deadline) {
      await Bun.sleep(STOP_POLL_MS);
      present = paneListed(seat.pane);
    }
    if (present !== false) {
      process.stderr.write(
        present === true
          ? `seat ${seat.seat}: herdr still lists an agent on pane ${seat.pane} ${STOP_TIMEOUT_MS} ms after SIGTERM to process group ${launch.group}\n`
          : failureText(present),
      );
      emit(states);
      process.exit(1);
    }
    const start: Herdr = run([
      'agent',
      'start',
      agentName(aPane, seat.seat),
      '--kind',
      launch.kind,
      '--pane',
      seat.pane,
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
