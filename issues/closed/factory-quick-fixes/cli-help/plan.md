# Plan: cli-help

Slot A synthesis, 2026-11-11, from `brief.md`, `design.md` and the live worktree at `/home/ivan/.akrogon/worktrees/akrogon/cli-help` (branch `cli-help`, base a33d967b). No credentials are named in the design; `akrogon status cli-help` shows no `Missing:` lines. No paid or live operation belongs to this leaf; there are no `grants` and no count lines to draw on. Brief and design agree; no conflicts to note.

## Decisions

- **D1. One declaration module `src/usage.ts` feeds parser, help and usage errors.** `VERB_OPTIONS: Record<string, Record<string, FlagSpec>>` holds the flags the parser declares per verb, keyed in the order the public verb list prints. It covers the 30 public verbs only; `verify-pass` (dispatched but internal, documented "Internal:") stays out of the public list. `optionsFor(verb)` returns `VERB_OPTIONS[verb]` plus `help: {type:'boolean'}` for every verb, so `--help` parses anywhere and appears in `verbFlags`. `verbFlags` derives flag names from the same object `parseArgs` consumes; `helpText(verb)` prints `akrogon <verb> <flags>` plus the verb's `USAGE_LINES` entry when one exists. The unknown-flag error reuses `verbFlags`. One data source makes divergence structurally impossible.
- **D2. Shared usage strings live in `src/usage.ts` as exports.** `PACK_USAGE`, `STOP_USAGE`, `TIMING_USAGE`, `GUARD_USAGE`, `RUN_CHECK_USAGE` are constants; `USAGE_LINES` maps verb to its usage constant. `guard.ts` and `run-check.ts` import their constant instead of inlining the string, so the error path and help read one value. No runtime source reading, no invalid call to obtain text. `akrogon.ts`'s three inline usages are replaced by the constants.
- **D3. `verify-pass` omission is deliberate and kept.** The verb list is the public surface; `verify-pass` is the verify service's entry point, documented Internal in `docs/reference/commands.md`. `akrogon --help` and the usage error keep the same verb list; `verify-pass --help` is not answered (parses only `help`, `values.help` check gated on `Object.hasOwn(VERB_OPTIONS, verb)`), falling to dispatch where its missing `<dir>` errors as before.
- **D4. A verb with no declared flags prints `akrogon <verb> --help`** plus its usage line where one exists (`guard`). `--help` is the only flag every verb declares, so it is always printed.
- **D5. Order at the top of `akrogon.ts`**: verb = argv[2]; retired-verb check; `verb === '--help'` prints `VERB_USAGE` on stdout, exit 0; `parseArgs` with `optionsFor(verb)`; catch reformats only `ERR_PARSE_ARGS_UNKNOWN_OPTION` to one stderr line `akrogon <verb> <flags>: unknown flag <flag>` and exits 1; all other parse errors rethrow; `values.help === true && Object.hasOwn(VERB_OPTIONS, verb)` prints `helpText` on stdout, exit 0; `migrateStateHome()`; dispatch. Unknown flags still beat `--help` because parsing rejects them before the `values.help` check. `--` still ends option parsing, so `run-check -- ... --help` stays positional. A bare `akrogon` parses empty args into the default usage error, unchanged. `unhold`/`hold-fix` refuse before everything, unchanged.
- **D6. The `timing --since` form error is caught by `z.ZodError` only**, in a `try/catch` wrapping just the `mode` ternary parse inside the `timing` case. It prints `TIMING_USAGE` on stderr and exits 1. `timingCommand` sits outside the try so a ZodError from the report itself propagates. Shape errors (missing `--since`, extra positionals) keep the thrown `Error(TIMING_USAGE)` with its frame — only the `--since` form error is formatted per contract.
- **D7. Doc-phrase assertions: none touch the changed lines.** `tests/command-reference.test.ts` compares the command table to `case` labels (dispatch unchanged) and argument groups (verb arguments unchanged — `--help` is not a table argument). `tests/docs-links.test.ts` checks links and unrelated literals. `docs/reference/commands.md` gains one intro sentence naming `--help` behavior; the table itself is untouched.
- **D8. Exit is `process.exit(code)`**, matching the CLI's other terminal prints (`console.log` flushes synchronously on this bun; smoke test verified full stdout through a pipe before exit).

## Read-first list

- `issues/open/factory-quick-fixes/cli-help/brief.md`, `design.md` — binding task.
- `src/akrogon.ts` — the argument boundary: verb resolution, `optionsFor` consumption, help/arg-error exits before `migrateStateHome()`, the `timing` case, the default verb-list error.
- `src/usage.ts` — new module; the declaration, flag lists, usage constants, `helpText`.
- `src/guard.ts`, `src/run-check.ts` — only to switch their inline usage strings to the imported constants; command behavior unchanged.
- `src/state-home.ts` — confirms `migrateStateHome` writes only when the tool root holds `config.yaml` and the target home lacks one; irrelevant in a worktree but the reason help must run before it.
- `tests/helpers.ts` — `cli`, `fixture`, `leaf`, `spawnCaptured`, `registerTemp`; the test harness.
- `tests/cli-help.test.ts` — the committed criterion tests (import `VERB_OPTIONS`, `verbFlags`, `USAGE_LINES`).
- `tests/guard.test.ts`, `tests/timing-report.test.ts`, `tests/run-check.test.ts` — the existing CLI-boundary patterns and the designed `--since` forms' existing proof.
- `tests/command-reference.test.ts` — the doc-table contract; unaffected, kept green by leaving `case` labels and verb arguments alone.
- `docs/reference/commands.md` — human doc; one intro sentence added.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md` — grounding. No lesson changes this plan's shape.
- `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md` (named in the design) — CLI-boundary proof convention the tests follow.

## Interfaces

```ts
// src/usage.ts (new)
export type FlagSpec = { type: 'string' | 'boolean' };
export const VERB_OPTIONS: Record<string, Record<string, FlagSpec>>;
export const USAGE_LINES: Record<string, string>;          // pack|stop|timing|guard|run-check
export const VERB_USAGE: string;                           // Usage: akrogon <install|...|rollback>
export const PACK_USAGE / STOP_USAGE / TIMING_USAGE / GUARD_USAGE / RUN_CHECK_USAGE: string;
export function optionsFor(verb: string): Record<string, FlagSpec>;  // declared flags + help
export function verbFlags(verb: string): string[];                   // ['--task', ..., '--help']
export function helpText(verb: string): string;                      // flags line + optional usage line
```

`akrogon.ts` consumes `optionsFor` in the single `parseArgs` call and `verbFlags`/`helpText`/`VERB_USAGE` for output. `guard.ts` and `run-check.ts` consume `GUARD_USAGE`/`RUN_CHECK_USAGE`.

## Wave checklist

**U1** — `src/usage.ts` (new), `src/akrogon.ts`, `src/guard.ts`, `src/run-check.ts`. One unit because the four files form one connected change: `akrogon.ts` imports `usage.ts`, and the two leaf imports keep error-path wording identical to help. Proof: `bun test tests/cli-help.test.ts` plus the unchanged files' existing suites (`tests/guard.test.ts`, `tests/run-check.test.ts`, `tests/timing-report.test.ts`, `tests/command-reference.test.ts`) stay green.

**U2** — `docs/reference/commands.md`. One sentence in the intro paragraph documenting `--help` on stdout with exit 0 and the one-line unknown-flag error. Disjoint from U1's paths, no shared resource, no ordering: same wave.

Waves: `[U1, U2]` — two units, two workers. Tests are already committed (`c8075967`) before product code, per plan.synthesis.

Docs affected, one line each: `docs/reference/commands.md` (U2). No agent docs, no README, no skill files, no other doc page names this behavior.

## Done-criteria → observation → condition checks

Every proof is a real invocation of the CLI through `cli()`/`bareCli()` judging exit code, stdout and stderr — the standing-design boundary. All run under `akrogon run-check`; outputs kept are cited by their `check <label>: <exit> <path>` lines. Rerun trigger for every criterion: `src/akrogon.ts`, `src/usage.ts`, `tests/cli-help.test.ts` change, or the verb/`timing` dispatch changes. Sizes: seconds.

**C1 — every public verb `--help`.** Before: `seat --help` exited 1 with a TypeError and code frame. After: exit 0, declared flags on stdout, empty stderr, `USAGE_LINES` line where present. Test: `every public verb answers --help...` iterates `Object.keys(VERB_OPTIONS)`, asserts each declared flag is printed and every printed `--flag` is declared. Failure caught: help built from stale or hand-written flag lists. Command: `bun test tests/cli-help.test.ts` (proof log `check cli-help-green: 0 …`). Conditions checked: *all declared flags printed* → temp-edit helpText to drop the first flag and append undeclared `--extra` → red (`install` missing `--help`, `check cli-help-te1: 1`); *stdout stream and empty stderr* → temp-edit `console.error(helpText)` → red (`check cli-help-te2: 1`); *exit 0* → cannot break without losing the help answer itself; the fall-through demo (TE6) also covers it.

**C2 — `akrogon --help`.** Exit 0, verb list on stdout, empty stderr; bare `akrogon` still exits 1 with the same list on stderr (kept behavior asserted in the same test). Failure caught: `akrogon --help` falling into the default verb-list throw (the base behavior). Condition check: the `verb === '--help'` branch precedes parse — a later placement reaches `default` first; verified by the test failing on base (red at `check cli-help-natural: 1`).

**C3 — unknown flag.** Exit 1, empty stdout, one stderr line naming the flag and `verbFlags`, no `TypeError`/`^` frame. Covered inputs: `--compare` on `seat`, `-h` on `seat` (kept refusal), `--help --bogus` (unknown flag wins). Conditions checked: *message names the flag* → temp-edit drop `${flag}` → red (`check cli-help-te45: 1`); *`--help` must not beat the unknown flag* → temp-edit scan `argv` for `--help` before `parseArgs` → `seat --help --bogus` exits 0, red (same log); *no frame* → natural red on base (TypeError with caret); *only unknown-option reformatted* → TE9 (below) and the `seat --slot` missing-value assertion in the C7 test.

**C4 — `--since` form.** Both wrong forms exit 1 with `TIMING_USAGE` on stderr, no `ZodError`, no frame; stdout empty. Conditions checked: *no ZodError text* → temp-edit print usage then rethrow → red, ZodError JSON present (`check cli-help-te8: 1`); *exit 1* and *usage line* → natural red on base (`timing --flow --since 2026-10-25T00:00:00Z` dumped ZodError); *designed forms stay* → existing `tests/timing-report.test.ts` `--cohort --since SINCE` and `--flow --since 2026-10-10` cases at the same CLI boundary already prove this; no new case. *Only the parse is caught, not `timingCommand`* → traced: `timingCommand` is outside the try, so a ZodError raised inside report code propagates unformatted; cannot produce a red without breaking timing-report internals.

**C5 — no work.** Empty `AKROGON_HOME`+`HOME`: `seat --help`, `seat --compare`, `timing --help`, `stop --help` exit per criteria and leave the home byte-identical (`readdirSync` before/after equal). `stop --help x` on a fixture exits 0 and never writes `stopped.yaml` — stopping nothing. Conditions checked: *help must exit before dispatch* → temp-edit drop `process.exit(0)` after `helpText` → `seat --help` falls through to the `seat` dispatch, exits 1 and `migrateStateHome` writes `.lock` (`check cli-help-te6: 1`); *help before `migrateStateHome`* → traced, not shown red: `migrateStateHome` in this worktree sees no `config.yaml` at the tool root and returns without writing, so the ordering is unobservable under this harness (TE11 ran green at `check cli-help-te11: 0`). The ordering is still decided because a real install root always holds `config.yaml`.

**C6 — `--help` after `--`.** `run-check --name help-child --leaf <leaf> -- sh -c 'printf %s "$1" > <probe>' x --help` exits 0 and the probe file holds `--help` — the flag reached the child unhandled. Condition checked: *help must not scan post-`--` argv* → the TE45 argv-scan edit answered it as akrogon help, exit 0, probe never written → red (`check cli-help-te45: 1`).

**C7 — other errors unchanged.** `seat --slot` keeps `TypeError: Option '--slot <value>' argument missing` with frame; `config extra` keeps the ZodError; `status no-such-leaf` keeps `Missing leaf: no-such-leaf`. Conditions checked: *missing-value parse errors not reformatted* → temp-edit widen the catch to `ERR_PARSE_ARGS*` → red (`check cli-help-te9: 1`); *dispatch errors not swallowed* → temp-edit wrap the switch in a catch-all → `config extra` loses `ZodError` → red (`check cli-help-te10: 1`); *runtime error message preserved* → same catch-all; *wrong positional shape preserved* → same catch-all.

## Recorded check runs

- `check cli-help-natural: 1` — natural red on base: `Cannot find module '../src/usage'` (feature absent); direct CLI probes on base showed `seat --help` exit 1 TypeError+frame and `timing --flow --since 2026-10-25T00:00:00Z` exit 1 ZodError.
- `check cli-help-te1: 1` — flag-list divergence red.
- `check cli-help-te2: 1` — help on stderr red.
- `check cli-help-te45: 1` — flag name omitted + `--help` beating `--bogus` + post-`--` `--help` answered (three reds, one run).
- `check cli-help-te6: 1` — help without exit red.
- `check cli-help-te8: 1` — ZodError leaking after usage red.
- `check cli-help-te9: 1` — missing-value reformatted red.
- `check cli-help-te10: 1` — dispatch catch-all red.
- `check cli-help-te11: 0` — ordering demo not observable (see C5).
- `check cli-help-green: 0` — all 7 tests pass against the real implementation.
- `check cli-help-red-before-tests: 1` — the committed test file's red before product code.

All temp edits were discarded before the test commit (`git checkout` on the four src files, `rm src/usage.ts`); the committed diff holds only `tests/cli-help.test.ts`.

## Known limitations carried from the design

Positional argument shapes appear in help only through existing `USAGE_LINES`; no new usage lines are written (foreclosed). `verify-pass` keeps its dispatch-only status and `--help` refusal. Other parse errors (missing values) keep their frame — only the unknown-option error is formatted, per contract.

## Implementation notes

- 2026-11-11, check.repair F1: defer timing's migration until after timing argument validation, as the design's binding question 1 requires the argument-error path to finish before `migrateStateHome()`; reproduce both named malformed forms with the existing tool-root migration fixture.
