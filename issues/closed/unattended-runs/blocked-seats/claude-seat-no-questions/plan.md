# Plan: claude-seat-no-questions

Slot A plan.synthesis, 2026-11-16. Sources: `brief.md`, `design.md` (blocked-prompts Q1, leaf scope), live checkout at `/home/ivan/.akrogon/worktrees/akrogon/claude-seat-no-questions`.

No operator input is needed; this seat asks nothing. No credentials are named by the design and `akrogon status` prints no `Missing:` lines. No paid or live launch is needed or taken: the flag's effect inside Claude Code was proven free at charting (design, probe record) and is not re-run.

## Decisions

- D1 `harnessArgv` (src/seat.ts) returns `{ kind, argv: [...argv, ...extra] }` where `extra` is `['--session-id', randomUUID()]` for kind `pi`, `['--disallowedTools=AskUserQuestion']` for kind `claude`, and `[]` otherwise. One element, equals form, last element of the returned argv. `startSeat` and `startConsultant` already append the task after `harness.argv`, so the flag lands before the task and the task stays last and unchanged. Equals form is required so the appended task is not taken as the flag's value (design Q1).
- D2 Proof boundary is `harnessArgv` plus the `startSeat` launch line (design: "the existing harnessArgv or start tests"). Unit tests in `tests/seat.test.ts` cover both criteria over the four configured harness templates copied verbatim from `akrogon config`; a launch-line test in `tests/hc-start.test.ts` reads the recorded `hc run` argv from the fixture's `hc-shim` log and the stand-in's delivered task.
- D3 The launch-line test needs a `claude`-kind stand-in seat: `tests/hc-fixture.ts` gets a `claude` symlink in `standinBin` and `setSeat`'s harness parameter widens to `string` so it writes the `<name> --model {model} --effort {effort}` template for any stand-in name (existing `'fake'`/`'agy'` callers unchanged, agy keeps its template).
- D4 No agent or human doc needs a change: `src/AREA.md`'s seat line describes the launch contract without argv contents and `tests/AREA.md` names no file-level list that must gain an entry.

## Read-first

- `src/seat.ts` `harnessArgv` (line ~68), `startSeat` (line ~206) and `startConsultant` (line ~304) — argv assembly and task append.
- `tests/hc-start.test.ts` — the start-verb criteria file the launch test extends.
- `tests/hc-fixture.ts` `hcCore`/`setSeat`, `tests/stand-in.sh`, `tests/hc-shim.sh`, `tests/helpers.ts` `fixture`/`cli`/`leaf` — the real-core fixture machinery reused, not rebuilt.
- `docs/reference-index.md` → `src/AREA.md`, `tests/AREA.md` — doc checklist, no entry to update.

## Interfaces used

- `harnessArgv(global: GlobalConfig, config: SlotConfig): { kind: string; argv: string[] }` (existing export).
- `readGlobal()`, `SlotConfig`, `GlobalConfig` from `src/config.ts`; `fixture`, `cli`, `leaf` from `tests/helpers.ts`; `hcCore`, `setSeat`, `seatOf`-style helpers from `tests/hc-fixture.ts`.
- `HC_SHIM_LOG` file: one `hc` call argv per line, tab-separated fields (existing).
- Stand-in contract: `--model` selects the mode, `--*` consumes a value, bare args are tasks logged to `$STANDIN_DIR/<address>.tasks` (existing; `--disallowedTools` and `AskUserQuestion` are ignored by it in either form).

## File/criterion checklist

Run shape: one wave, one unit — serial-solo; implement A implements the plan itself with no workers.

- Wave 1, unit U1 (owned paths: `src/seat.ts`; shares the criterion test files committed at planning):
  - `harnessArgv` gains the claude append per D1. Nothing else changes.
  - Criterion 1: claude argv gains `--disallowedTools=AskUserQuestion` once, one element, before the appended task; task last and unchanged.
  - Criterion 2: codex, pi and agy argv unchanged (pi keeps `--session-id <uuid>`).

## Verification

| Criterion | Proof command (exists at AKROGON_BASE) | Observation | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | `bun test tests/seat.test.ts -t 'disallowedTools'` | `harnessArgv(claude)` returns `[...template, '--disallowedTools=AskUserQuestion']`: filter on the prefix equals the equals form once and `argv.at(-1)` is it. Product failure caught: claude seats keep `AskUserQuestion` (missing/renamed flag) or the task is taken as the flag's value (space form). | seconds | any edit to `harnessArgv` or the claude template |
| 1 | `bun test tests/hc-start.test.ts -t 'AskUserQuestion'` | The recorded `hc run` argv after the second `--` holds the flag once at `at(-2)` and the dispatch task at `at(-1)`; `core.tasks` equals `[task]` — the real boundary's state before/after: launch argv and delivered task. | seconds | any edit to `harnessArgv`, `startSeat`'s argv assembly, or `run()`/`hc` invocation |
| 2 | `bun test tests/seat.test.ts` (the three `template argv unchanged` tests) | For codex, pi, agy: built argv equals the template words (pi: plus `--session-id <uuid>` asserted by position and shape) and no `--disallowedTools` element. Product failure caught: the flag reaching kinds it must not touch, or a dropped template/session-id element. | seconds | any edit to `harnessArgv` or the three templates |

The launch test replays a real fixture recording: model-facing inputs are the slot config (`claude`, stand-in mode `work`, effort `low`) and the leaf task text; the recording is the `hc-shim` log plus the stand-in's `*.tasks` file; consumers replaying it are this test's shim-log and `core.tasks` reads. No live or paid stage is consumed.

## Condition checks and violation cases (each shown red, edits discarded before the test commit)

| Condition (from done-criteria) | Decision | Case / traced reason | Red evidence |
|---|---|---|---|
| flag present, once, one element (claude) | D1 | V0 absent append (unbuilt behavior): T1 `hits` is `[]`, T2 cmd filter `[]` | `check plan-red-missing: 1 …check-plan-red-missing-1794844602690-743193.log`; `check plan-red-missing-launch: 1 …check-plan-red-missing-launch-1794844607421-743546.log` |
| equals form, not space form | D1 | V1 `['--disallowedTools','AskUserQuestion']`: T1 `hits` is `["--disallowedTools"]`, T2 cmd filter `["--disallowedTools"]` (and downstream the stand-in consumes `AskUserQuestion` as the flag's value) | `check plan-red-spaceform: 1 …check-plan-red-spaceform-1794844615523-744116.log`; `check plan-red-spaceform-launch: 1 …check-plan-red-spaceform-launch-1794844617754-744479.log` |
| placed before the appended task | D1 | V3 flag before template argv: T1 `argv[0]` is the flag and `at(-1)` is not | `check plan-red-notlast: 1 …check-plan-red-notlast-1794844631737-746111.log` |
| task stays last and unchanged | D1 | Traced, no case possible at `harnessArgv`: it takes no task; both consumers append `[task]` after `harness.argv` (src/seat.ts:257, :328). The T2 launch case asserts `at(-1)` is the task and `core.tasks` is `[task]`. | launch-line red runs above also show flag assertions failing |
| no flag for codex, pi, agy | D1 | V2 flag appended unconditionally: all three `template argv unchanged` tests fail `some(…disallowedTools)` toBe false | `check plan-red-allkinds: 1 …check-plan-red-allkinds-1794844627753-745808.log` |
| other template elements unchanged (pi's existing append) | D1 | V4 `--session-id` append removed: pi test fails `at(-2)` | `check plan-red-nosid: 1 …check-plan-red-nosid-1794844663261-748910.log` |

## Test commit

`0e33d47b` on branch `claude-seat-no-questions`: `tests/seat.test.ts` (new), `tests/hc-start.test.ts` (+1 launch test), `tests/hc-fixture.ts` (`claude` stand-in name, `setSeat` widened). Trailers name both changed existing test files. `bun run typecheck` green: `check plan-typecheck: 0 …check-plan-typecheck-1794844598135-741531.log`.

## Stated limits kept

- Operator-started claude sessions (chart doors, operator tabs) are not launched by akrogon and stay uncovered (blocked-prompts Q3).
- A machine-config claude template that already carries `--disallowedTools` gets a second flag; unproven, and the live config carries none (design stated limit).
- The free stub probe at charting proved the flag's effect for Claude Code 2.1.325 interactive; no live session or paid call is re-run by this leaf.
