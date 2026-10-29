#!/usr/bin/env bun
import { z } from 'zod';
import { verifyAnchor } from './peer-anchor';
import { agentName, failureText, run, type Herdr } from './peer-restart';

type State = { seat: string; pane: string | null; kind: string; started: boolean };

const specSchema = z
  .array(z.object({ seat: z.string().min(1), kind: z.string().min(1), argv: z.array(z.string()) }))
  .min(1);

const splitSchema = z.object({
  result: z.object({
    pane: z.object({ pane_id: z.string() }),
  }),
});

function emit(states: State[]): void {
  for (const state of states) {
    const line = {
      seat: state.seat,
      pane: state.pane,
      kind: state.kind,
      state: state.started ? 'started' : state.pane !== null ? 'split' : 'untouched',
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  }
}

// The first consultant takes the right 35% of A's area; each later one splits the previous pane
// keeping 1/k of its height, k being the seats still to place from it, so the column's heights
// come out equal (probed 2026-10-17: three seats at 1/3 then 1/2 gave rows 12, 13, 12).
function splitArgs(root: string, source: string, index: number, count: number): string[] {
  return [
    'pane',
    'split',
    source,
    '--direction',
    index === 0 ? 'right' : 'down',
    '--ratio',
    index === 0 ? '0.65' : (1 / (count - index + 1)).toFixed(4),
    '--cwd',
    root,
    '--no-focus',
  ];
}

function main(): void {
  if (process.argv.length !== 5) {
    process.stderr.write(
      'Usage: peer-create.ts <root> <A pane> \'[{"seat":"B","kind":"<kind>","argv":["<arg>",...]},...]\'\n',
    );
    process.exit(1);
  }
  const root: string = process.argv[2];
  const aPane: string = process.argv[3];
  const spec: z.infer<typeof specSchema> = specSchema.parse(JSON.parse(process.argv[4]));
  const states: State[] = spec.map((s): State => ({ seat: s.seat, pane: null, kind: s.kind, started: false }));
  const verified: string = verifyAnchor();
  if (aPane !== verified) {
    process.stderr.write(`refusing create, A-pane argument ${aPane} is not the verified pane ${verified}\n`);
    emit(states);
    process.exit(1);
  }
  let source: string = aPane;
  for (const [index, seat] of spec.entries()) {
    const state: State = states[index];
    const split: Herdr = run(splitArgs(root, source, index, spec.length));
    if (!split.ok) {
      process.stderr.write(failureText(split));
      emit(states);
      process.exit(1);
    }
    state.pane = splitSchema.parse(JSON.parse(split.stdout)).result.pane.pane_id;
    const start: Herdr = run([
      'agent',
      'start',
      agentName(aPane, seat.seat),
      '--kind',
      seat.kind,
      '--pane',
      state.pane,
      '--',
      ...seat.argv,
    ]);
    if (!start.ok) {
      process.stderr.write(failureText(start));
      emit(states);
      process.exit(1);
    }
    state.started = true;
    source = state.pane;
  }
  emit(states);
  process.exit(0);
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
