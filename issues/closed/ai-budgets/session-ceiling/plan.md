# Plan: session-ceiling

Slot A plan.synthesis, 2026-11-22. Source: brief.md (criteria C1-C8), design.md (locked budget-shape picks + corrections 2', 4', 5', 9'). The design names no `Open for the plan:` questions; the choices below resolve the remaining implementation details.

## Decisions

- D1 `paid_budget` joins `globalSchema` in `src/config.ts` as an optional strictObject: `sessions_per_day` and `session_minutes` as `z.number().int().positive()`, `approved` as a strictObject of nonblank strings (`z.string().trim().min(1)`, per the 2026-09-19 `min1-not-nonblank` lesson) `date` and `answer`. Written only by the operator; no code writes it.
- D2 Ledger `<globalHome>/budget.jsonl`: one JSON object per line, strict schema `{at: z.iso.datetime(), repo: nonblank, slug: nonblank, run: nonblank, sessions: z.number().int().positive()}`. The reader parses every line strictly (trailing newline stripped); any unparseable line is a malformed-ledger refusal, never a silent skip (contrast `readTimings`, which the design rejected). A row counts in the window when `Date.parse(at) > now - 24h`; rows from every `repo` sum.
- D3 Lock: `withLock(<globalHome>/budget.lock, exclusive)` from `src/state.ts` around read→sum→append, inside `reserve()`. It is released when `reserve` returns, before `withAdmission`, and never nests inside `admission.lock`.
- D4 Flag: `sessions: { type: 'string' }` in `VERB_OPTIONS['run-check']`; `RUN_CHECK_USAGE`, `docs/reference/commands.md` and `tests/command-reference.test.ts` contract all gain `[--sessions <n>]`. `src/akrogon.ts` passes raw `values.sessions` through `runCheck` into `checkedRun`; `reserve` parses it with `Number` + `Number.isInteger(n) && n > 0` inside `checkedRun` after the early refusals (design 2'). Callers: `runCheck` and `checkedRun` take an optional `sessions?: string` last parameter; `verify` never passes it (design exclusion).
- D5 Reservation point: in `checkedRun` after the early `ownerRefusal` and first `failedRefusal`, before `mkdtempSync`. `reserve(repo, slug, run, sessionsText)` returns `{sessions, minutes}` or throws a plain `Error` for every refusal; on return `checkedRun` sets `env.AKROGON_SESSIONS`/`env.AKROGON_SESSION_MINUTES` right after `constructedEnv` builds `env` (signature unchanged). `reserve` re-reads `readGlobal()` for `paid_budget`.
- D6 Refusal texts (asserted fragments, not whole strings): invalid n → `Invalid --sessions <v>: a positive integer`; missing key → `paid_budget` + `<globalHome>/config.yaml`; window overflow → `paid session budget: --sessions <n> over the rolling 24-hour total <t> of <cap>; fits at <iso>`; `n > cap` → same prefix + `never fits`; malformed ledger → `<path> row <i>: <line>`; failed append → `Append failed <path>: <err>`.
- D7 `fits at`: earliest `t` among ascending window rows (`row.at + 24h`) where the sum of rows with `at > row.at` plus n is `<= sessions_per_day`. Boundary: `total + n == cap` admits (criterion says "passes", not "reaches").
- D8 Guard (design 9'): `AKROGON_SESSIONS` and `AKROGON_SESSION_MINUTES` join the `constructed` set in `repoSchema.superRefine`, so `env`/`pass_env` entries are refused. They are never added to `copied`, so a nested `run-check` drops them.
- D9 `budget.jsonl` joins `copiedEntries` in `src/state-home.ts`. `akrogon config` needs no printer change: `effectiveConfig` spreads `global`, so `paid_budget` prints through the global spread.
- D10 New test file `tests/budget.test.ts` holds the CLI-boundary proofs for C1-C7; new cases extend `tests/config.test.ts` (C7a, C8a) and `tests/state-home.test.ts` (C8b). Helpers duplicated from `run-check.test.ts` (`leafWorktree`, `baseEnv`, `runEnv`, `failLeaf`, `waitForFile`, `waitForText`) follow the existing run-permit/run-units pattern.

## Read-first paths

- `src/run-check.ts` — `checkedRun` refusal order (early `ownerRefusal` → `run` mint → first `failedRefusal`), `constructedEnv`, `copied`, `withAdmission`, late `failedRefusal`.
- `src/config.ts` — `globalSchema`, `repoSchema` `constructed` set, `globalHome()`, `effectiveConfig` global spread.
- `src/state.ts` `withLock` — blocking exclusive flock helper.
- `src/state-home.ts` `copiedEntries`.
- `src/usage.ts` `VERB_OPTIONS`, `RUN_CHECK_USAGE`; `src/akrogon.ts` `case 'run-check'`.
- `src/budget.ts` — new module: `reserve` (parse n, read `paid_budget`, lock, read/sum/append ledger, fits-at).
- `tests/run-check.test.ts` (fixture/env/spawn patterns), `tests/config.test.ts` (reserved-name cases), `tests/state-home.test.ts` (toolCopy move cases), `tests/command-reference.test.ts` (contract).
- `docs/reference/commands.md`, `docs/reference/config.md`, `src/AREA.md`, `tests/AREA.md`.
- `learnings/LESSONS.md` — applied: `min1` accepts whitespace (D1 uses `.trim().min(1)`); nested negative-test output (T-assertions read the parent exit, not child FAIL text).

## Needed interfaces

- `src/budget.ts`: `export async function reserve(repo: Repo, slug: string, run: string, sessionsText: string): Promise<{ sessions: number; minutes: number }>`. `run` is the run id `withAdmission` later prints as `run <id>`; `slug` is the `leafTarget` slug (`checkout` for `--holder`).
- `checkedRun(repo, caller, akrogonBase, name, argv, cwd, sessions?: string)`; `runCheck(cwd, name, leaf, holder, argv, sessions?: string)`.

## Units and waves

- **W1 U-budget** — owns `src/config.ts`, `src/budget.ts` (new), `src/state-home.ts`. Constrained by `tests/budget.test.ts`, `tests/config.test.ts` new cases, `tests/state-home.test.ts` new case.
- **W1 U-docs** — owns `docs/reference/commands.md`, `docs/reference/config.md`, `src/AREA.md` (run-check bullet gains the `--sessions` reservation), `tests/AREA.md` (names `tests/budget.test.ts`). Constrained by `tests/command-reference.test.ts` and `tests/docs-links.test.ts`.
- **W2 U-runner** — owns `src/run-check.ts`, `src/akrogon.ts`, `src/usage.ts`. Depends on U-budget (`src/budget.ts` must exist to import). Constrained by `tests/budget.test.ts`, `tests/run-check.test.ts`, `tests/cli-help.test.ts`, `tests/command-reference.test.ts`.

W1 holds two units (disjoint paths, no shared fixture, no dependency); W2 holds one. Not serial-solo.

## Criterion proofs

Every proof is an own test at the CLI boundary under the fixture's temp `AKROGON_HOME`; no paid call, no new machinery. Rerun trigger for all: any change under `src/` named above or the named test files.

| Criterion | Test(s) | Proof command | Size |
| --- | --- | --- | --- |
| C1 env + row before start + row kept on red | `tests/budget.test.ts` T1 "a reserved run exports AKROGON_SESSIONS and AKROGON_SESSION_MINUTES and records its row", T1b "an unreserved run exports neither variable" | `akrogon run-check --name budget-c1 -- bun test tests/budget.test.ts` | seconds |
| C2 window refusal, fits-at, never-fits, stale drop, cross-repo sum, boundary | T2 "a reservation over the rolling 24-hour ceiling is refused naming the total, ceiling and fits-at", T2b "a request larger than the ceiling never fits", T2c "a reservation at the ceiling admits" | same file | seconds |
| C3 missing key; bad n | T3a "--sessions without paid_budget refuses naming the key and config file", T3b "a non-integer or non-positive --sessions refuses" | same file | seconds |
| C4 malformed ledger; failed append | T4a "a malformed ledger row refuses naming the file and the bad row", T4b "a failed ledger append refuses and starts no command" | same file | seconds |
| C5 lock wait | T5 "a reserved run waits behind the budget lock, then writes its row and runs" | same file | seconds |
| C6 early refusals write no row; late refusal keeps row | T6a "refusals before the reservation write no ledger row", T6b "a run refused after reserving keeps its row" | same file | seconds |
| C7a repo config refusal | `tests/config.test.ts` new case "config refuses AKROGON_SESSIONS and AKROGON_SESSION_MINUTES in env and pass_env" | `akrogon run-check --name budget-c7 -- bun test tests/config.test.ts -t 'AKROGON_SESSIONS'` | seconds |
| C7b nested non-inheritance | `tests/budget.test.ts` T7 "a nested run-check inherits neither AKROGON_SESSIONS nor AKROGON_SESSION_MINUTES" | `akrogon run-check --name budget-c1 -- bun test tests/budget.test.ts` | seconds |
| C8a config print | `tests/config.test.ts` new case "config prints paid_budget from the machine config" | `akrogon run-check --name budget-c7 -- bun test tests/config.test.ts -t 'paid_budget'` | seconds |
| C8b ledger moves with home | `tests/state-home.test.ts` new case "the session budget ledger moves with the state home" | `akrogon run-check --name budget-c8 -- bun test tests/state-home.test.ts -t 'budget ledger'` | seconds |
| Flag/usage/doc contract | existing `tests/command-reference.test.ts` (contract updated in the test commit) and `tests/cli-help.test.ts` | `akrogon run-check --name budget-contract -- bun test tests/command-reference.test.ts` | seconds |

## Condition trace per decision

| Condition (criterion) | Decision | Case | Violation-red shown |
| --- | --- | --- | --- |
| Row written before command starts, kept on any exit (C1) | D5 reservation before `withAdmission`/spawn | T1: `wc -l $AKROGON_HOME/budget.jsonl` prints 1 inside the command; T1: row intact after `exit 7` | intended-missing: flag unknown at planning |
| Only `--sessions` runs carry the variables (C1, C7) | D5 env assignment gated on `sessions !== undefined`, D8 not in `copied` | T1b: plain run prints `unset/unset`; T7: nested run prints `unset` | intended-missing |
| Stale rows excluded; two repos sum (C2) | D2 window predicate | T2 seeds a 25h-old row (excluded) and a foreign-repo row (included): total printed is 3, not 4 or 2 | intended-missing |
| Refusal starts nothing, writes nothing (C2, C4, C6) | D5 reservation after early refusals, throw before spawn | T2 marker absent + row count unchanged; T4a/T4b same; T6a ledger absent after all four refusal kinds | intended-missing |
| `fits at` is the real earliest fit (C2) | D7 | T2 asserts the printed ISO equals `old1.at + 24h` | intended-missing |
| `n > cap` never fits (C2) | D6 | T2b | intended-missing |
| Boundary `total + n == cap` admits (C2) | D7 | T2c | intended-missing |
| Bad `n` refused (C3) | D4 parse inside `checkedRun` | T3b: `0`, `1.5`, `abc`; ledger absent | intended-missing |
| No `paid_budget` refused naming it (C3) | D5 | T3a asserts `paid_budget` and `config.yaml` | intended-missing |
| Strict reader/append (C4) | D2 | T4a names path + bad row; T4b chmod 0444 ledger, refuses, command never ran | intended-missing |
| Lock excludes concurrent reservation (C5) | D3 | T5: external `flock -x` holder, waiting run produces no row/marker until release | intended-missing |
| Reservation after early refusals only (C6) | D5 order | T6a: `refuse()` env, `merge_checks` argv, owner-closed `ownerRefusal`, first `failedRefusal` → no row; T6b: queued `full` run refused at late `failedRefusal` → row kept | intended-missing |
| Repo cannot inject the variables (C7a) | D8 constructed set | config.test.ts new case: `env`/`pass_env` entries refused | intended-missing |
| No inheritance (C7b) | D8 not in `copied` | T7 nested `akrogon run-check` shim prints `unset` for both | intended-missing |
| `paid_budget` prints; ledger moves with home (C8) | D9 | config.test.ts print case; state-home.test.ts move case | intended-missing |

Violation-red note: the skill asks each condition case be shown red by a temporary edit that makes the violation. Every condition case here fails at plan time for the intended reason (the `--sessions` flag and `paid_budget` schema do not exist), and no temporary edit can produce the violation path before the mechanism exists: a refusal test fails on flag-unknown, and the one inherited-mechanism break (adding the names to `copied`) is unobservable while the flag cannot reserve. Recorded red outputs below are therefore the missing-behavior failures; whether each case would catch a real violation is left to check.review.

## Red outputs recorded at plan.synthesis

All recorded through `akrogon run-check` on head (logs under `issues/open/ai-budgets/session-ceiling/implementation/`).

- `budget-c1` — `check budget-c1: 1` — 13/13 fail. Representative: `error: akrogon run-check --name --leaf --holder --help: unknown flag --sessions / Expected: 0` (env, ceiling, never-fits, edge, missing-key, malformed, append, lock-wait, early-refusals, nested cases); `error: --sessions 0 / Expected to contain: "positive integer"` (bad-n case fails before the flag exists); `a run refused after reserving keeps its row [5000ms] timed out` (waiter exits non-zero without the flag, so `waiting for` text never appears); `error: Cannot find ... / Unrecognized key: "paid_budget"` where `budget()` is written. Log: `check-budget-c1-1795353793076-2064434.log`.
- `budget-c7` — `check budget-c7: 1` — 2/2 fail: `env AKROGON_SESSIONS / Expected: not 0` (env/pass_env entries pass today) and `unrecognized_keys: paid_budget` on the machine config. Log: `check-budget-c7-1795353780122-2063340.log`.
- `budget-c8` — `check budget-c8: 1` — `ENOENT .akrogon/budget.jsonl` (copiedEntries lacks it). Log: `check-budget-c8-1795353781947-2063772.log`.
- `budget-contract` — `check budget-contract: 1` — `the commands reference covers every dispatched command and its argument contract` fails: contract gained `[--sessions <n>]` while the docs row lacks it. Log: `check-budget-contract-1795353782058-2063874.log`.

The `budget-c1` run also confirmed an earlier vacuous pass: the bad-n case passed on the unknown-flag refusal until `positive integer` was asserted; the tightened test is the committed one.

## Deliberate-break evidence (check.fix, 2026-11-22)

Recorded per review-B F7: one temporary violation of the implemented mechanism per criterion, the criterion's own test run red through `akrogon run-check`, then reverted. Logs under `implementation/`.

- C1 — `src/budget.ts` appended the row twice → `a reserved run exports …` red (`3:45:2` not `3:45:1`; the ledger write before start is what the command's `wc -l` observes). `check budget-db-c1: 1 …/check-budget-db-c1-1795355243341-2509292.log`
- C2 — `total + n > cap` weakened to `>=` → `a reservation at the ceiling admits` red; the refusal cases stayed green under the same break, confirming they exercise the refusal not the boundary. `check budget-db-c2: 1 …/check-budget-db-c2-1795355245624-2510724.log`
- C3 — the n pattern replaced with `/.*/` → `a non-integer or non-positive --sessions refuses` red (`--sessions 0` ran). `check budget-db-c3: 1 …/check-budget-db-c3-1795355249344-2512361.log`
- C4 — malformed rows skipped instead of refused → `a malformed ledger row refuses` red (reservation ran). Earlier: read errors swallowed → the F4 unreadable case red as `Append failed` not `Cannot read`. `check budget-db-c4: 1 …/check-budget-db-c4-1795355253552-2513372.log`, `check budget-f4: 1 …/check-budget-f4-1795355227330-2506270.log`
- C5 — `withLock` removed → `waits behind the budget lock` red (`run proceeded while the lock was held`). `check budget-db-c5: 1 …/check-budget-db-c5-1795355256959-2515107.log`
- C6 — `reserve` moved ahead of `ownerRefusal` → both refusal-order cases red (row written for refused runs). `check budget-db-c6: 1 …/check-budget-db-c6-1795355261952-2517101.log`
- C7a — `AKROGON_SESSION*` dropped from `constructed` → config reserved-name case red (entries accepted). `check budget-db-c7a: 1 …/check-budget-db-c7a-1795355264951-2518256.log`
- C7b — both names added to `copied` → nested and unreserved cases red (`1:30` not `unset:unset`). `check budget-db-c7b: 1 …/check-budget-db-c7b-1795355267554-2519138.log`
- C8a — `paid_budget` renamed `session_budget` in `globalSchema` → both print/verbatim cases red. `check budget-db-c8a: 1 …/check-budget-db-c8a-1795355269604-2519962.log`
- C8b — `budget.jsonl` dropped from `copiedEntries` → state-home move case red (`ENOENT`). `check budget-db-c8b: 1 …/check-budget-db-c8b-1795355271725-2520670.log`

All temporary edits reverted; `check budget-c1: 0 …/check-budget-c1-1795355275347-2521463.log` (16/16).

## Docs checklist

- `docs/reference/commands.md` — run-check row gains `[--sessions <n>]` and the reservation/refusal description. (U-docs)
- `docs/reference/config.md` — machine `config.yaml` table gains `paid_budget`; reserved-name prose gains the two `AKROGON_SESSION*` names. (U-docs)
- `src/AREA.md` — run-check bullet gains the `--sessions` reservation, ledger, lock and refusals; `src/config.ts` description line still accurate. (U-docs)
- `tests/AREA.md` — key-files line names `tests/budget.test.ts`. (U-docs)
- `skills/*` — untouched: prose and e2e entry-point refusals are budget-rules' scope per the design's split and exclusion list.
- `docs/reference/files.md`, `docs/reference/where-things-go.md` — unchanged: neither lists akrogon-home state files today.

## Notes and limitations

- Brief vs design conflicts: none found; criteria and design agree.
- L1: `budget.lock` itself is not moved by `state-home` (design names `budget.jsonl` only); a move holding a copy of a stale lock is harmless — the lock guards in-flight reservations and the state-home move does not participate in it. `paid_budget` cannot exist before this build ships (design 5'), so no real ledger can be left behind at deploy time.
- L2: a refusal prints through the thrown error on stderr (bun's uncaught-error print), matching the repo's other refusal surfaces.
- The operator adds `paid_budget` to `~/.akrogon/config.yaml` only once this leaf is the installed build (design 5') — a Pending-step note, not leaf work.
- `akrogon verify` calls `checkedRun` with no `sessions` argument: no reservation, no variables (design exclusion; T7's nested case plus the D5 gate make this unrepresentable without an argument).

## Implementation notes

- 2026-11-22, slot B check.repair. Preserve the raw approval answer while rejecting blank input as required by design budget-shape decision 1. Read the active budget under the reservation lock for brief C2/C5, preserve valid ledger row boundaries for C4, and validate the decimal session count before conversion for C3.
