# Seat D Map: Issue Lifecycle & Test Feedback Speed (`akrogon`)

## 1. Measurements

### 1.1 Commands Run & Leaf Windows

All numbers below were gathered read-only from live state in `/home/ivan/Work/infra/akrogon`:

1. `akrogon config` (`full: [test]`, `checks: { format, test, typecheck }`, `max_active_checks: 6`, `max_full_checks: 1`, `verify_Order: [format, test, typecheck]`).
2. `akrogon flaky` (`0` quarantined tests on current `HEAD`).
3. `akrogon timing --cohort --since 2026-10-12T00:00:00Z` and `akrogon timing --cohort --since 2026-10-24T00:00:00Z`, plus `akrogon timing leaf-stop`.
4. Read-only `bun -e` aggregations over:
   - `issues/timings.jsonl` (`10,501` events from `2026-10-12T23:41:49.795Z` to `2026-10-29T08:22:28.152Z`; `235` distinct slugs, of which **`71` leaves** have actual lifecycle prompts/checks and all `71` reached `merged`; `163` older already-merged leaves have only a single reconciliation `visit_start` at `2026-10-13T17:38:08Z`, plus pseudo-slug `checkout` with `411` checks).
   - `issues/verify-runs.jsonl` (`330` verify runs; `305` completed, `25` killed/in-progress; `260` completed on real leaves + `45` on `checkout`).
   - `issues/log.jsonl` (`1,298` phase-transition records) and `issues/merge-attempts.jsonl` (`103` records).
   - Latest full-suite verify log `issues/closed/peer-wait-discovery/peer-pane-anchor/implementation/check-test-1793262089319-2316843.log` (`1,262` pass, `0` fail across `72` files, `1,262.80s` summed test time in `70.11s` wall).

Two leaf windows are reported:
- **Window A (All 71 timed leaves)**: `timing-readout` (`2026-10-12T23:41:49.811Z`) through `peer-pane-anchor` (`2026-10-29T08:22:28.152Z`).
- **Window B (Last 13 leaves — post-`drop-debate` single-seat synthesis cohort)**: `remove-plan-debate` (`2026-10-25T07:09:00.419Z`) through `peer-pane-anchor` (`2026-10-29T08:22:28.152Z`), with a sub-window for checks after `suite-time` / `full: [test]` landed (`2026-10-26T13:47:00Z` to `2026-10-29T08:22:28.152Z`, `8` leaves, `525` paired checks).

---

### 1.2 Live Measurement Bug Found First (The "1-Year Cache Bug" Inside `akrogon timing`)

Before trusting `akrogon timing`, inspecting raw `issues/timings.jsonl` against `src/timing-report.ts` exposed two severe classification bugs in `src/timing-report.ts` and `src/next.ts`:

1. **`reasonAt` never clears an open `wait` when a `prompt` or `batch` arrives (`src/timing-report.ts:84-89`)**:
   - In `src/timing.ts:102-108` (`recordWait`), a delivered `prompt` closes an open `wait` (`const open: WaitReason = last !== undefined && last.kind === 'wait' ? last.reason : 'none'`). Consequently, when `dispatchLeaf` (`src/next.ts:979-982`) calls `recordPrompt` and then `end('none')` (`recordWait(repo, slug, 'none')`), `recordWait` sees `open === 'none'` and returns without writing `{ kind: 'wait', reason: 'none' }`.
   - In `src/timing-report.ts:91-95` (`waitTotals`), the author included `event.kind === 'prompt'` in `edges`, **but `reasonAt` (`src/timing-report.ts:84-89`) only updates `reason` when `event.kind === 'wait'`**.
   - Why unit tests missed it: `tests/timing-report.test.ts:75` and `tests/timing-report.test.ts:277` hand-authored synthetic `{ kind: 'wait', reason: 'none' }` events that `src/next.ts` never emits after a prompt.
   - **Impact**: Every leaf that ever waited on `prerequisite` at `plan.synthesis` (14 of the 71 leaves, including `leaf-stop`, `close-pack`, `folder-pack`, `release-rollback`) has **100% of its subsequent active work across `plan.synthesis`, `implement`, `check.review`, `check.repair`, and `check.fix` misclassified as `wait prerequisite` with `0s` `prompted`!** For example, `akrogon timing leaf-stop` reports `implement: wall 27m 44s, prompted 0s, wait prerequisite 27m 44s`. Worse, `cohortComparison` (`src/timing-report.ts:278-289`) computes `implPrompted = impl.promptedMs`, setting it to `0` for any leaf that ever had a prerequisite wait and corrupting the `--cohort` gate `F`.
2. **`merge_turn` wait is recorded on the merge-turn holder itself (`src/next.ts:956-957, 1172-1174`)**:
   - When `akrogon next --all` runs `sweep` before `mergeTurn`, `dispatchLeaf` hits `phase === 'merge'` (`src/next.ts:956-957`) and records `wait merge_turn` (`blocking: undefined`) on the leaf that is about to run `mergeTurn` ms later; and while `landAlive` is true (`src/next.ts:1172-1174`), `mergeTurn` records `wait merge_turn` on the leaf currently running `akrogon land`. Of `57` `wait merge_turn` events in `issues/timings.jsonl`, **`55` have `blocking: undefined` (the holder itself)** and only **`2`** waited behind another leaf (`blocking: 'check-admission'`, `blocking: 'retire-check-changed'`). Because `akrogon land` writes `batch` and no `prompt` or `wait none`, `reasonAt` classifies the holder's entire `akrogon land` execution (`1.93h` across 71 leaves) as `wait merge_turn`.

Both tables below report the **corrected** split (resetting wait state on `prompt`/`batch` and treating `merge_turn` with `blocking === undefined` after `batch` as active merge execution), alongside the uncorrected `src/timing-report.ts` numbers in brackets.

---

### 1.3 Per-Phase Time Split (Agent Turn vs Check vs Wait)

#### Window A: All 71 Timed Leaves (`2026-10-12` to `2026-10-29`, `124.62h` total phase wall)

| Phase | Visits (Leaves) | Phase Wall Sum (Med) | Active Prompted/Batch Sum (Med) | Agent Turn Net of Checks Sum (Med) | Check Union Inside Phase Sum (Med) | Check Sum (Count) | True Wait Sum (Breakdown) | `[Uncorrected timing-report.ts Prompted / Wait]` |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- | :--- |
| `plan.synthesis` | 71 (71) | **52.30h** (`14.6m`) | **18.64h** (`8.9m`) | **18.12h** (`8.3m`) | **0.52h** (`0.0m`) | 0.60h (307) | **33.66h** (`32.01h` prereq, `1.52h` pause, `0.13h` unprompted) | `[13.87h prompted / 38.30h wait]` |
| `implement` | 73 (71) | **41.14h** (`14.5m`) | **40.25h** (`14.5m`) | **30.85h** (`8.6m`) | **9.41h** (`4.9m`) | 9.47h (1,348) | **0.88h** (`0.76h` pause, `0.12h` unprompted) | `[26.88h prompted / 14.16h wait]` |
| `check.fix` | 45 (30) | **16.20h** (`10.6m`) | **16.10h** (`10.5m`) | **9.49h** (`6.4m`) | **6.61h** (`2.7m`) | 6.61h (468) | **0.10h** (`0.10h` unprompted) | `[12.79h prompted / 3.33h wait]` |
| `check.review` | 115 (71) | **6.31h** (`2.3m`) | **5.99h** (`2.2m`) | **5.76h** (`2.2m`) | **0.23h** (`0.0m`) | 0.23h (682) | **0.32h** (`0.32h` unprompted) | `[4.19h prompted / 1.86h wait]` |
| `check.repair` | 66 (51) | **5.50h** (`4.0m`) | **5.33h** (`3.9m`) | **2.55h** (`1.4m`) | **2.78h** (`2.4m`) | 2.94h (978) | **0.17h** (`0.17h` unprompted) | `[4.11h prompted / 1.24h wait]` |
| `merge` | 72 (71) | **3.17h** (`1.1m`) | **2.74h** (`1.1m`) | **0.93h** (`0.1m`) | **1.81h** (`1.0m`) | 1.83h (290) | **0.43h** (`0.42h` true `merge_turn`, `0.01h` unprompted) | `[0.69h prompted / 2.35h wait]` |
| **Total (71 leaves)** | **442** | **124.62h** | **89.06h (71.5%)** | **67.70h (54.3%)** | **21.36h (17.1%)** | **21.67h (4,073)** | **35.55h (28.5%)** | `[62.53h prompted / 61.24h wait]` |

*Note on active time*: Removing `35.55h` of wait leaves **`89.06h` of active leaf execution**, of which **`67.70h` (76.0%) is agent turn time outside checks** and **`21.36h` (24.0%) is wall time inside `run-check` / `verify`**. Post-implementation verification + review + repair + fix + merge (`check.review` + `check.repair` + `check.fix` + `merge` = **`31.18h` wall / `30.16h` active**) consumes **75% as much active time as `implement` itself (`40.25h`)**.

#### Window B: Last 13 Leaves (Post-`drop-debate`, `2026-10-25` to `2026-10-29`, `14.68h` total phase wall)

| Phase | Visits (Leaves) | Phase Wall Sum (Med) | Active Sum (Med) | Agent Turn Net Sum (Med) | Check Union Sum (Med) | Check Count | True Wait Sum |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `plan.synthesis` | 13 (13) | **2.59h** (`14.6m`) | **2.51h** (`14.6m`) | **2.45h** (`14.0m`) | **0.06h** (`0.0m`) | 57 | **0.08h** |
| `implement` | 13 (13) | **4.84h** (`14.4m`) | **4.81h** (`14.4m`) | **3.65h** (`10.0m`) | **1.16h** (`2.5m`) | 225 | **0.03h** |
| `check.fix` | 7 (5) | **3.71h** (`4.6m`) | **3.68h** (`4.4m`) | **0.69h** (`2.8m`) | **2.99h** (`1.3m`)* | 134 | **0.03h** |
| `check.repair` | 10 (7) | **1.66h** (`8.6m`) | **1.62h** (`8.5m`) | **1.11h** (`5.4m`) | **0.51h** (`2.0m`) | 274 | **0.04h** |
| `check.review` | 20 (13) | **1.47h** (`3.6m`) | **1.44h** (`3.4m`) | **1.42h** (`3.4m`) | **0.02h** (`0.0m`) | 250 | **0.03h** |
| `merge` | 13 (13) | **0.40h** (`1.3m`) | **0.13h** (`1.2m` incl. batch) | **0.02h** (`0.1m`) | **0.33h** (`1.2m`) | 72 | **0.27h** |
| **Total (13 leaves)** | **76** | **14.68h** | **14.19h (96.7%)** | **9.34h (63.6%)** | **5.07h (34.5%)** | **1,012** | **0.49h (3.3%)** |

*\*Note*: `check.fix` check union in Window B includes `fewer-repeat-calls`, whose criterion required running 20 pairs of full-suite benchmarks (`191.3m` across `implement` + `check.fix`). Excluding `fewer-repeat-calls`, check union is ~22% of active leaf time.

---

### 1.4 Per-Check-Name Split

Across the **71 timed leaves** (`4,097` paired `check_start`/`check_done` events; `26` unpaired `check_start` events from killed/interrupted runs) and the **Post-`suite-time` / `full: [test]` window** (`2026-10-26T13:47:00Z` to `2026-10-29T08:22:28.152Z`, `8` leaves, `525` paired checks):

| Check Name / Category | 71-Leaf Count (Fails / Fail %) | 71-Leaf Sum (`%` of Check Time) | 71-Leaf Mean / Med / p90 | Post-`2026-10-26T13:47Z` Count (Fails) | Post-`2026-10-26T13:47Z` Sum | Post-`2026-10-26T13:47Z` Mean / Med / p90 |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `test` (`checks.test` + `--name test`) | 409 (132 / **32.3%**) | **14.99h** (`899.5m` / **69.2%**) | `132.0s` / `119.7s` / `227.7s` | 33 (3 / 9.1%) | **0.67h** (`40.2m`) | `73.1s` / `68.1s` / `91.7s` |
| `targeted (leaf)` (custom `--name`, `scope: 'leaf'`) | 2,482 (528 / 21.3%) | **5.48h** (`328.8m` / **25.3%**)* | `7.9s` / `0.1s` / `6.2s` | 362 (70 / 19.3%) | **0.16h** (`9.9m`) | `1.6s` / `0.0s` / `3.2s` |
| `targeted (worker)` (`scope: 'worker'`) | 289 (109 / 37.7%) | **0.78h** (`47.0m` / **3.6%**) | `9.8s` / `0.6s` / `26.7s` | 0 (0) | **0.00h** (`0.0m`) | — |
| `format` (`checks.format`) | 326 (68 / **20.9%**) | **0.21h** (`12.5m` / **1.0%**) | `2.3s` / `2.0s` / `3.5s` | 43 (8 / 18.6%) | **0.03h** (`1.5m`) | `2.1s` / `2.1s` / `2.3s` |
| `typecheck` (`checks.typecheck`) | 310 (6 / 1.9%) | **0.21h** (`12.4m` / **1.0%**) | `2.4s` / `2.1s` / `3.4s` | 47 (2 / 4.3%) | **0.03h** (`1.7m`) | `2.2s` / `2.1s` / `2.5s` |
| `setup` (`verify` standalone setup) | 281 (0 / 0.0%) | **0.01h** (`0.3m` / **0.0%**) | `0.1s` / `0.1s` / `0.1s` | 40 (0 / 0.0%) | **0.00h** (`0.1m`) | `0.1s` / `0.1s` / `0.1s` |

*\*Note on `--name test` misuse*: Of the `409` checks recorded with `name: "test"`, **`96` (`23.5%`) finished in `<30s`** (`55` in `plan.synthesis`, `25` in `implement`, `9` in `check.repair`, `6` in `check.fix`) because agents ran targeted single-file proof commands via `akrogon run-check --name test ...`. Because `src/run-check.ts:154` sets `const full = fullChecks(config).includes(opts.name)`, passing `--name test` now forces a 1-second single-file proof into the `max_full_checks: 1` queue behind 70s full-suite runs (`src/admission.ts:144-169`).

---

## 2. The Post's Nine Items Mapped to `akrogon`

| # | Post Item | Applies to `akrogon`? | Measured Cost Now | File (`path:line`) or Process Text Section Involved |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Profile before optimizing — found a 1-year-old cache bug before touching tests** | **Yes — directly and doubly (both in `timing-report.ts` and in `verify.ts`'s tree-receipt reuse).** | **Bug A (`timing-report.ts`)**: `26.53h` of active agent+check time across 14 prerequisite-delayed leaves and 55 merge turns is misclassified as `wait` in `akrogon timing`, zeroing `implPrompted` in `--cohort`.<br>**Bug B (`verify.ts` receipt cache)**: `verify` runs `test` (~70–132s) even when `format` (2.0s) fails, assuming per-command `reuseSource` will reuse `test: 0` on retry — **which fails 100% of the time** because fixing `format`/`typecheck` changes the Git `tree` SHA (`49` red verify runs = **`119.6m` / `2.00h` wasted**). Separately, `merge` verify refuses to reuse a green `leaf` verify receipt on the **identical `tree` SHA** (`run.scope === scope`), re-running full verify on **14 of the last 15 merges (`93.3%`, `19.0m` wasted + 2 flake-induced Seat B wakes)**. | Code: `src/timing-report.ts:84-95`, `src/next.ts:956-957, 979-982, 1172-1174`; `src/verify.ts:162, 204-209, 462, 543-566`.<br>Process text: `issues/chart/verify-waste/CHART.md` (`## Destination`, `## Forks taken`). |
| **2** | **Tests are now part of the agent feedback loop; optimize for verification time** | **Yes — dominant driver of post-code latency.** | Full-suite `test` (`14.99h` = **69.2% of all check time**) is invoked **3 to 5 times per leaf** even when nothing fails: once at end of `implement`, once at end of `check.repair` (even when handing off to `check.fix`!), once at end of `check.fix`, and once at `merge` (even when `tree` is unchanged!). Across 71 leaves (`260` completed real-leaf `verify` runs = **3.66 full `verify` runs per leaf**):<br>- `49` red runs failed `format`/`typecheck` (`119.6m` wasted running `test`).<br>- `35` full-suite runs in `check.repair` before handing to `check.fix` (`72.0m` wasted on intermediate commits A immediately overwrites).<br>- `14/15` recent `merge` runs re-verified the exact tree `leaf` verify just passed (`19.0m` + 2 flake cascades). | Code: `src/verify.ts:162, 462, 543-566`, `src/phase.ts:421-433`, `src/land.ts:153-163`.<br>Process text: `skills/implement-issue/SKILL.md` (`## implement`, `## check.fix`), `skills/check-issue/SKILL.md` (`## check.repair`), `skills/merge-issue/SKILL.md` (`## merge`), `issues/chart/changed-test-proof/CHART.md` (`## Destination`, `## Findings`). |
| **3** | **Avoid fixed `sleep()` calls in tests; poll with 10ms intervals instead** | **Yes — remaining multi-second sleeps and un-bundled fake binaries in top slow test files.** | While `suite-time` (`issues/chart/suite-time/CHART.md` `## Forks taken`) shortened several waits, the latest verify log (`check-test-1793262089319-2316843.log`) shows:<br>- `tests/peer-wait.test.ts` takes **`57.8s` sum** (`22.52s` in one test, `11.26s` in another) because `tests/peer-wait.test.ts:64` symlinks raw `fake-herdr.ts` (cold `bun` startup on every poll tick instead of pre-bundled `fakeHerdrBin` in `tests/isolation.ts:65`) and passes `--budget 12` / `11` (`tests/peer-wait.test.ts:512, 769`).<br>- `tests/session-routing.test.ts:741-761` sleeps `12s` in two tests (`10.25s` each = **`20.50s`**) because `DISCOVERY_DEADLINE_MS = 10_000` in `src/turn.ts:392` has no env override. | Code: `tests/peer-wait.test.ts:64, 512, 769`, `tests/session-routing.test.ts:741-761`, `src/turn.ts:392`, `tests/isolation.ts:65-95`.<br>Process text: `issues/chart/suite-time/CHART.md` (`## Destination`, `## Forks taken`), `tests/AREA.md` (`## Rules`). |
| **4** | **Don't restart bulky servers for every test; boot once and reset state between tests** | **Yes — in `akrogon`, the equivalent of "booting a server per test" is spawning 8 `git` subprocesses per `fixture()` call and cold-booting `bun src/akrogon.ts` per `cli()` call.** | In a single full test suite run (`1,262` tests across `72` files, `1,262.8s` summed test time / `70.1s` wall):<br>- `fixture()` (`tests/helpers.ts:45-74`) is called **`469` times**, spawning **8 sequential `git` subprocesses per call** (`init`, `config email`, `config name`, `add`, `commit`, `branch -M`, `checkout --detach`, `update-ref` = **`3,752` `git` process spawns** per suite run) to create identical initial repo states, plus writing a dead `seedStat` file (`tests/helpers.ts:37-41, 69`) for a retired memory gate (`src/guard.ts`).<br>- `cli()` (`tests/helpers.ts:75-103`) is called **`936` times**, spawning a cold `bun src/akrogon.ts` subprocess each time (parsing/transpiling TypeScript from scratch 936 times instead of running a pre-bundled JS binary like `fakeHerdrBin` in `tests/isolation.ts:65-75` or calling in-process for non-subprocess tests). | Code: `tests/helpers.ts:37-103`, `tests/isolation.ts:65-95`.<br>Process text: `issues/chart/test-time-and-temp/CHART.md` (`## Destination`, `## Forks taken`), `issues/chart/bun-copyfile/CHART.md` (`## Destination`, `## Forks taken`). |
| **5** | **Use dependency injection instead of `mock.module` to avoid global state leakage and run tests in parallel** | **Yes (already practiced for DI, but file-level parallelism is bottlenecked by one 6,168-line monolith file).** | `akrogon` already avoids `mock.module` and runs `bun test --parallel=4` (`issues/config.yaml:9`). However, `bun test --parallel=4` shards **by test file**, and **`tests/next.test.ts` alone contains `256` tests (`6,168` lines) taking `379.4s` of test-case sum (`30.0%` of the entire repository's `1,262.8s` test sum!)**, followed by `tests/verify.test.ts` (`103.5s` sum, `95` tests) and `tests/phase.test.ts` (`75.3s` sum, `61` tests). One worker is pinned to `tests/next.test.ts` for almost the entire 70s wall clock. | Code: `tests/next.test.ts:1-6168`, `issues/config.yaml:9`.<br>Process text: `issues/chart/suite-time/CHART.md` (`## Destination`, `## Forks taken`), `tests/AREA.md` (`## Conventions`). |
| **6** | **Delete tests that don't carry their weight (duplicate setup, low-value assertions)** | **Yes — 71 leaves of mandatory per-criterion proof blocks have accumulated `6,168` lines in `tests/next.test.ts` and `2,519` lines in `tests/verify.test.ts`, plus duplicate CLI subprocess tests for pure functions.** | Every leaf's plan (`skills/plan-issue/SKILL.md` `## plan.synthesis`) requires separate named `-t` proof tests per criterion, and `requireTestChangeTrailers` (`src/verify.ts:288-358`) penalizes editing or consolidating existing tests by requiring `Test-Change:` commit trailers (`350` commits with `Test-Change:` and **`25` empty `git commit --allow-empty` commits** created solely to appease the trailer gate). As a result, seats append brand-new `fixture()` + `cli()` end-to-end tests instead of extending existing table tests or deleting superseded ones. | Code: `src/verify.ts:288-358`, `tests/next.test.ts:1-6168`, `tests/verify.test.ts:1-2519`.<br>Process text: `skills/plan-issue/SKILL.md` (`## plan.synthesis`), `issues/chart/akrogon-test-line/CHART.md` (`## Destination`, `## Forks taken`), `issues/chart/criterion-limits/CHART.md` (`## Destination`, `## Forks taken`). |
| **7** | **Move layout/rendering assertions to pure unit tests instead of full integration setups** | **Yes — in `akrogon`, CLI output formatting, phase/gate refusal messages, and markdown/YAML parsing are tested by spawning `fixture()` (8 `git` calls) + `cli()` (`bun src/akrogon.ts`).** | In `tests/next.test.ts` (`379.4s` sum), `tests/phase.test.ts` (`75.3s` sum), `tests/verify.test.ts` (`103.5s` sum), and `tests/doctor.test.ts` (`32.7s` sum), dozens of tests create full Git repos on disk and spawn `cli()` subprocesses just to assert a refusal line or formatting string that pure functions (`blockDetail`, `eligibility`, `verifyPass`, `formatTimingReport`) return in `<1ms` when called in-process. | Code: `tests/helpers.ts:45-103`, `tests/next.test.ts:1-6168`, `tests/phase.test.ts:1-1990`.<br>Process text: `tests/AREA.md` (`## Structure`, `## Conventions`). |
| **8** | **Make slow tests visible in test runner output so regressions get noticed** | **Partially — `verify-runs.jsonl` records suite wall time, but per-test/per-file slow regressions are invisible unless someone manually parses raw `check-test-*.log` files.** | `akrogon timing` reports aggregate check durations, and `akrogon flaky` parses `verify-runs.jsonl` for red->green transitions (`src/verify.ts:598-704`), but nothing surfaces the top N slowest test files or tests (`>5s`) in `verify` or `timing` output. Consequently, `tests/peer-wait.test.ts` (`22.52s` single test using un-bundled `fake-herdr.ts`) and `tests/session-routing.test.ts` (`2 × 10.25s` fixed deadline sleeps) sat unnoticed inside a 70s suite. | Code: `src/verify.ts:543-596`, `src/timing-report.ts:175-217`.<br>Process text: `issues/chart/suite-time/CHART.md` (`## Destination`, `## Forks taken`). |
| **9** | **Set a hard time budget (e.g. `<60s` wall time) and keep pruning** | **Yes — `suite-time` brought `checks.test` from `~120s` down to `~68s` median (`91.7s` p90), still just above a `<60s` (or `<20s`) budget, while lifecycle overhead outside `checks.test` is the larger 80% iceberg.** | Post-`suite-time` (`2026-10-26T13:47Z` to `2026-10-29`), `checks.test` median is **`68.1s`** (`mean 73.1s`, `p90 91.7s`). Cutting `fixture()` git spawns + pre-bundling `src/akrogon.ts` + fixing the 2 slow test files will drop `checks.test` from `~68s` to **`~15–20s`**. Meanwhile, cutting redundant `verify` runs and phase ping-pong removes **2–3 full `verify` runs and 2–3 agent turns per leaf**. | Code: `issues/config.yaml:8-12`, `src/verify.ts:543-566`.<br>Process text: `issues/chart/suite-time/CHART.md` (`## Destination`), `issues/chart/system-speed/CHART.md` (`## Destination`, `## Decisions taken overnight (2026-10-25)`). |

---

## 3. Material Forks

Each fork below is an explicit operator decision. Where a fork reopens a prior chart decision, the locked chart and the live data justifying reopening are flagged.

### Fork 1: Fail-Fast & Short-First Ordering Inside `akrogon verify`
- **Reopens**: `issues/chart/verify-waste/CHART.md` (`## Forks taken`: kept running all `verify` commands on red so per-command `reuseSource` could reuse green commands on the next run).
- **Why the data justifies reopening**:
  - `verifyCommands` (`src/verify.ts:127-137`) runs `checks` in `issues/config.yaml` key order: `format` (`2.0s`), **`test` (`68–132s`)**, then **`typecheck` (`2.1s`)**.
  - When `format` fails (`20.9%` of all `format` runs!), `verify` still runs `test` (`70–132s`). And when `typecheck` fails, `verify` has *already* run `test`.
  - Across `260` completed real-leaf `verify` runs (`88` red), **`49` (`55.7%` of all red runs)** failed `format` (`48`) or `typecheck` (`3`), burning **`119.6m` (`2.00h`)** of `test` suite wall time.
  - **The mathematical flaw in `verify-waste`**: Per-command `reuseSource` (`src/verify.ts:204-209`) requires `run.tree === tree`. Fixing a `format` failure (`prettier --write`) or a `typecheck` error **always edits a file and changes `tree`**, so a green `test` receipt from a run where `format` or `typecheck` failed has a **0.0% reuse rate**!
- **Options**:
  - **Option 1A (Removes mechanism — Recommended)**: Run non-`full` checks (`format`, `typecheck` — `~2s` each) **before** `full` checks (`test` — `~68s`), and **abort `verify` before starting `full` checks if any non-`full` check fails**; simultaneously delete per-command `reuseSource` (`src/verify.ts:204-224`, `reusedFrom` in `VerifyCommandRun`).
    - *What it could break or invite later*: If a leaf has *both* a formatting error and a broken test, the agent sees the `format` error in `2s`, fixes it, and discovers the test failure on the next `verify` run (`+2s` penalty on double-fault runs, vs saving `70s` on all `49` format/typecheck-only red runs).
  - **Option 1B (Adds mechanism)**: Auto-run `prettier --write` inside `verify` before hashing `tree`, or keep `reuseSource` keyed on AST/content stripping formatting.
    - *What it could break or invite later*: Mutating the worktree inside a verification command violates read-only check semantics and invalidates criterion proof logs recorded before `verify`.

---

### Fork 2: Unifying `leaf` and `merge` Verify Receipts When `merge_checks` Is Empty (and Stopping Tree Mutation at `merge`)
- **Context**: `src/verify.ts:162` (`greenRun`), `src/verify.ts:206` (`reuseSource`), and `src/verify.ts:462` (`requireGreenReceipt`) filter strictly by `run.scope === scope`. In `akrogon`, `merge_checks: {}` and `merge_covers: []` (`issues/config.yaml`), so `verifyCommands(config, 'leaf')` and `verifyCommands(config, 'merge')` are **100% identical** (`format`, `test`, `typecheck`).
- **Live data**:
  - In **14 of the last 15 `merge` verify runs (`93.3%`, covering 12 of the last 13 leaves)**, `merge` ran a full `verify` on the **exact same Git `tree` SHA** that had already passed `leaf` verify at the end of `check.repair` or `check.fix`.
  - Worse, in **both of the last 2 leaves** (`slow-merge-notice` on tree `6dae6d38` and `peer-pane-anchor` on tree `0fabfad7`), that redundant `merge` verify hit a suite flake (`test: 1`), which aborted seatless `akrogon land`, woke Seat B (`wake=red`), and forced a **third** full `verify` on the identical tree!
  - Even when `main` advances by another leaf touching disjoint files, or when Seat B commits `lessons: retire applied lines` (`skills/merge-issue/SKILL.md` `## merge`) touching only `learnings/LESSONS.md`, `tree` changes and forces a full suite rerun.
- **Options**:
  - **Option 2A (Removes mechanism — Recommended)**: Key receipt reuse in `greenRun` / `requireGreenReceipt` (`src/verify.ts:160-169, 456-470`) by **whether the existing green receipt for `tree` covers all commands required by `verifyCommands(config, scope)`** (instead of `run.scope === scope`), and move `learnings/LESSONS.md` retirement out of the pre-verify merge worktree step.
    - *What it could break or invite later*: Nothing when `tree` is identical (the exact same files and commit tree were already proven green against every command in `verifyCommands(config, 'merge')`). When `main` advanced and `git rebase` produced a new `tree`, `run.tree === tree` is naturally false and `merge` verify still runs.
  - **Option 2B (Keep scope separation)**: Keep `run.scope === scope` and run `verify --scope merge` unconditionally.
    - *What it could break or invite later*: Continues burning a full `verify` (`~70s`) on every fast-forward merge and doubles exposure to suite flakes during `akrogon land`.

---

### Fork 3: Collapsing the 4-Hop `check.review -> check.repair (B) -> check.fix (A) -> check.review (B)` Loop
- **Reopens**: `issues/chart/system-speed/CHART.md` (`## Decisions taken overnight (2026-10-25)`: kept the `check.repair` (B) vs `check.fix` (A) split, requiring B to repair unambiguous defects and hand test/criterion/judgment items to A).
- **Why the data justifies reopening**:
  - Across the 71 timed leaves, **`51` (`71.8%`) entered `check.repair`**, and across all **`66` `check.repair` visits**, only **`21` (`31.8%`) transitioned to `merge`** — **`44` (`66.7%`) handed off to `check.fix` (Slot A)** (`30` leaves, `45` `check.fix` visits), followed by another `check.review` visit!
  - Why does `check.repair` hand off to `check.fix` two-thirds of the time? Because `skills/check-issue/SKILL.md` (`## check.repair`) forbids B from changing any existing test expectation, adding a missing test case on existing tools, or updating a proof command (`45` non-empty `## Handed to A` sections in `review-B.md`).
  - Even worse: `skills/check-issue/SKILL.md` (`## check.repair`) instructs B to run `akrogon verify` at the end of `check.repair` **even when B is moving to `check.fix`, not `merge`** (despite `src/phase.ts:431-432` only gating `check.repair -> merge`!). Across those `44` `check.repair -> check.fix` transitions, B ran **35 full `test` suites (`72.0m` = `1.20h`)** on an intermediate commit that Slot A immediately modified and re-verified in `check.fix`!
- **Options**:
  - **Option 3A (Removes mechanism — Collapse `check.repair` and `check.fix` into a single repair phase)**: Delete `check.repair` (or `check.fix`) so `fix` verdicts from `check.review` route directly to **one** seat (either A fixes all review findings and B re-reviews, OR B repairs both code and test findings in `check.repair` without the artificial test-touch prohibition).
    - *What it could break or invite later*:
      - If **A repairs (`check.review -> check.fix -> check.review`)**: Removes `check.repair` (`5.50h` wall, `66` visits, `35` wasted full-suite runs) and the entire `Handed to A` boundary rules in `skills/check-issue/SKILL.md` (`## check.repair`). Risk: trivial 1-line nits that B could have fixed without re-review now take one A turn + one B re-review turn (though B only finished solo on `21/66` visits anyway).
      - If **B repairs all findings in `check.repair` and only routes to `check.fix` when `plan.md` design decisions must be reopened**: B already holds full context from `check.review`; letting B fix missing/updated tests eliminates `~80%+` of `check.fix` visits (`16.20h` wall) AND eliminates the follow-up `check.review#1` re-review turn (`44` visits)! Risk: on tests B edits during `check.repair`, B is both author and final verifier unless those test edits are tiny/bounded.
  - **Option 3B (Minimal fix if keeping both phases)**: In `skills/check-issue/SKILL.md` (`## check.repair`), forbid B from running `akrogon verify` (or entering `check.repair` code edits at all) when `Handed to A` is non-empty — if any item goes to A, route straight to `check.fix` so `verify` runs once at the end of `check.fix`.
    - *What it could break or invite later*: Saves `72.0m` of wasted intermediate `verify` runs immediately, but preserves the 4-phase state machine and two-seat handoff tax.

---

### Fork 4: Dropping Slot A's Blind Self-Review in `check.review` (Round 0)
- **Reopens**: `issues/chart/system-speed/CHART.md` (`## Decisions taken overnight (2026-10-25)`: kept two-seat `check.review` on round 0 while making re-checks B-only).
- **Why the data justifies reopening**:
  - We now have `71` completed leaves of blind round-0 `check.review` data (`review-A.md` vs `review-B.md`):
    - Both Ready/Nits: **`20`** (`28.2%`)
    - Both Fix: **`27`** (`38.0%`)
    - B-only Fix (B voted `fix`, A voted `ready`/`nits`): **`22`** (`31.0%`)
    - A-only Fix (A voted `fix`, B voted `ready`/`nits`): **`2` out of `71` (`2.8%`)** (`worker-test-duty` and `twin-guard`).
  - Inspecting both A-only `fix` leaves (`issues/closed/concurrent-checks/worker-test-duty/review-A.md` and `issues/closed/owner-completion/twin-guard/review-A.md`) shows **neither was a code bug**: both were minor doc/prose wording nits (`skills/AREA.md` phrase in `worker-test-duty` and `docs/guide/next.md` ordering sentence in `twin-guard`).
  - Meanwhile, running Slot A in `check.review#0` costs **71 full agent turns** plus **`2.45h` of two-seat straggler wait** (`124.0s` mean lag between first and second `seat_done` in `check.review#0`).
- **Options**:
  - **Option 4A (Removes mechanism — Recommended)**: Make `check.review` **B-only on all visits** (`seatsFor` in `src/routing.ts:36-38` returns `['B']` for `check.review` unconditionally, just as `check.review` visit `> 0` already does).
    - *What it could break or invite later*: Removes the dual-vendor review on round 0 (relying on independent Reviewer B + mechanical `verify` + criterion proof gates). Across 71 historical leaves, this would have missed `0` code defects and `2` prose wording nits while saving 71 agent turns and `2.45h` of straggler lag.
  - **Option 4B (Keep A+B on visit 0)**: Keep `seatsFor` returning `['A', 'B']` on `visit === 0`.
    - *What it could break or invite later*: Continues paying double review turns and 2-seat synchronization lag on every leaf for a `0/71` unique code-defect catch rate from self-reviewer A.

---

### Fork 5: Pre-Built Template Clone & Pre-Bundled CLI in `tests/helpers.ts` vs Per-Test `git init` + Cold `bun src/akrogon.ts`
- **Context**: `tests/helpers.ts:45-74` (`fixture()`) runs 8 sequential `git` subprocesses on every call (`469 × 8 = 3,752` `git` spawns per suite run) and calls dead `seedStat` (`tests/helpers.ts:37-41, 69`). `tests/helpers.ts:75-103` (`cli()`) spawns `bun src/akrogon.ts` (`936` cold TypeScript startups per suite run).
- **Options**:
  - **Option 5A (Removes per-test setup work — Recommended)**:
    1. In `tests/helpers.ts`, build the base Git template repo **once per test worker process** (lazy singleton in `tmpdir()`) and create each `fixture()` via `cpSync(templateDir, dir, { recursive: true })` (0 `git` subprocesses per `fixture()`, eliminating `3,752` process spawns), and delete dead `seedStat`.
    2. In `tests/isolation.ts:65-95`, pre-bundle `src/akrogon.ts` once per run alongside `fake-herdr.ts` and `fake-busctl.ts` (or invoke `main()` in-process where subprocess isolation is not under test), and fix `tests/peer-wait.test.ts:64` to symlink `fakeHerdrBin` instead of raw `fake-herdr.ts`.
    3. Add an env override (`AKROGON_DISCOVERY_DEADLINE_MS`) in `src/turn.ts:392` so `tests/session-routing.test.ts:741-761` tests discovery timeout in `150ms` instead of `2 × 10.25s = 20.5s`, and lower `tests/peer-wait.test.ts:512, 769` budgets from `11–12s` to `1–2s`.
    - *What it could break or invite later*: Pre-bundling `src/akrogon.ts` in `tests/isolation.ts` adds `~150ms` once at preload start and must rebuild if `src/` mtime is newer than the cached bundle (identical to how `ensureBundled` in `tests/isolation.ts:65-75` already checks `statSync(src).mtimeMs > statSync(out).mtimeMs`!).
  - **Option 5B (Keep spawning `git` x8 and raw `bun src/akrogon.ts` x936)**:
    - *What it could break or invite later*: Suite time stays pinned near `~70s` and grows linearly with every new test added.

---

### Fork 6: Worker Subagent Protocol vs Solo Slot A in `implement`
- **Context**: `skills/implement-issue/SKILL.md` (`## implement`) and `skills/implement-issue/worker-protocol.md` (`# Worker protocol`) instruct Slot A to launch background worker subagents (`akrogon run-check --scope worker`) for multi-group plans and poll/wait for them.
- **Live data**:
  - Across the 73 `implement` visits on the 71 timed leaves, **33 visits used workers (`scope: 'worker'`)** and **40 ran solo (`scope: 'leaf'` only)**:
    - **With workers (`33` visits)**: median `implement` wall **`23.0m`** (`mean 36.6m`), plus `289` worker check runs (`37.7%` fail rate) that Slot A then re-verified on the leaf checkout.
    - **Solo (`40` visits)**: median `implement` wall **`12.3m`** (`mean 31.5m`).
    - In the most recent 8 leaves (`2026-10-26T13:47Z` to `2026-10-29`), Slot A used `0` worker checks and median `implement` wall was **`14.4m`**.
- **Options**:
  - **Option 6A (Removes mechanism — Default to solo `implement` on a single worktree; reserve workers only for explicit multi-package/3+ independent file-group leaves or remove `worker-protocol.md` entirely)**:
    - *What it could break or invite later*: Very large leaves touching 5+ independent subsystems wouldn't parallelize edits across subagents, though `criterion-limits` (`issues/chart/criterion-limits/CHART.md` `## Destination`) already caps leaves at 4 criteria so leaves are small by construction. Removing worker orchestration eliminates subagent spawn overhead, `mktemp`/`nohup` polling ceremonies, and duplicate worker-then-leaf check runs.
  - **Option 6B (Keep current worker protocol)**:
    - *What it could break or invite later*: Continues paying ~2x median `implement` wall time (`23.0m` vs `12.3m`) when A spawns workers on small/medium leaves and waits on `nohup` background loops.

---

## 4. Removal Candidates

Each candidate below is a mechanism, rule, or code path whose measured cost exceeds what it catches, paired with what already catches the same failure.

| # | Mechanism / Rule / Code to Delete or Collapse | Evidence That Cost Exceeds What It Catches | What Currently Catches the Same Failure |
| :--- | :--- | :--- | :--- |
| **R1** | **Per-command `reuseSource` inside `src/verify.ts:204-224` and running `test` when `format`/`typecheck` fails (`src/verify.ts:543-566`)** | Cost: **`119.6m` (`2.00h`)** of wasted full-suite `test` runs across `49` red `verify` runs where `format` (`48`) or `typecheck` (`3`) failed (`55.7%` of all red `verify` runs!). Benefit: **0 minutes saved** on `format`/`typecheck` failures because fixing `format` or `typecheck` mutates a file and changes `tree`, invalidating the `test: 0` receipt 100% of the time. | Whole-run `greenRun(repo, slug, scope, tree, required)` (`src/verify.ts:160-169`) already reuses a green `verify` receipt when `tree` is unchanged; failing fast on `format`/`typecheck` (`~2s`) before running `test` (`~68s`) catches format/type errors in `4s` instead of `74s`. |
| **R2** | **`run.scope === scope` restriction in `greenRun` and `requireGreenReceipt` (`src/verify.ts:162, 462`) when `verifyCommands` are identical** | Cost: **14 of the last 15 `merge` verify runs (`93.3%`, `19.0m` suite wall time)** re-ran `format`, `test`, and `typecheck` on the **exact same Git `tree` SHA** that `leaf` verify had just proven green minutes earlier — and in **both of the last 2 leaves** (`slow-merge-notice`, `peer-pane-anchor`), that redundant `merge` verify flaked (`test: 1`), aborting `akrogon land`, waking Seat B, and forcing a 3rd full `verify` on the same tree. | `greenRun` already checks `run.tree === tree` and `[...required].every((name) => covered.has(name))` (`src/verify.ts:162-167`). Checking command coverage instead of `run.scope === scope` guarantees every merge command passed on that exact `tree` while still running `merge_checks` whenever a repo defines any, or whenever `git rebase` onto `main` changes `tree`. |
| **R3** | **`akrogon verify` instruction inside `skills/check-issue/SKILL.md` (`## check.repair`) when handing off to `check.fix` (or the entire `check.repair` vs `check.fix` split)** | Cost: **`44` of `66` (`66.7%`) `check.repair` visits** handed off to `check.fix` instead of `merge`. Across those `44` visits, Seat B ran **`35` full `test` suites (`72.0m` = `1.20h`)** on an intermediate commit that Seat A immediately modified in `check.fix`. Note that `src/phase.ts:431-432` does **not** even require a green verify receipt for `check.repair -> check.fix` — only the prose in `skills/check-issue/SKILL.md` (`## check.repair`) told B to run `akrogon verify` unconditionally! | `src/phase.ts:421-433` enforces `requireGreenReceipt` on `check.fix -> check.review` and `check.repair -> merge`. Any commit leaving `check.fix` is mechanically verified before `check.review` and `merge`. |
| **R4** | **Slot A blind self-review in `check.review` visit 0 (`src/routing.ts:37`, `skills/check-issue/SKILL.md` `## check.review`)** | Cost: **`71` full agent turns** + **`2.45h` of two-seat straggler wait** (`124.0s` mean lag per visit). Catch rate across all 71 leaves: **`0` code defects** (`2/71` A-only `fix` verdicts, both prose wording nits in `worker-test-duty` and `twin-guard`). | Independent Seat B in `check.review` (`49/71` `fix` verdicts), mechanical `akrogon verify` (`format`, `typecheck`, `test`), and mechanical criterion proof log checks in `src/phase.ts` (`verifyPass`). |
| **R5** | **`requireTestChangeTrailers` (`src/verify.ts:288-358`) and `Test-Change:` commit trailer rule (`skills/implement-issue/SKILL.md` `## implement`, `## check.fix`)** | Cost: **`350` commits** with `Test-Change:` trailers since Oct 12, including **`25` empty commits (`git commit --allow-empty`)** created only because `verify` refused a clean branch for missing a commit-message trailer; actively discourages seats from consolidating or pruning redundant tests in `tests/next.test.ts` (`6,168` lines). Does not block bad test edits (agents mechanically append the trailer or `--allow-empty`). | Reviewer B in `check.review` (`skills/check-issue/SKILL.md` `## check.review`) explicitly audits all `git diff <base>..HEAD -- tests/` hunks against the brief's criteria, and `akrogon verify` runs the full test suite. |
| **R6** | **Dead `seedStat` writer in `tests/helpers.ts:37-41, 69` and 8-subprocess `git init` in `fixture()` (`tests/helpers.ts:45-74`)** | Cost: `seedStat` writes `.akrogon-memory-stat.json` on all **`469` `fixture()` calls** per suite run for a memory-stat gate that was already deleted from `src/guard.ts` (`src/guard.ts:1-6` is just a 6-line re-export shim!). And `fixture()` spawns **`3,752` `git` subprocesses** per suite run to build identical blank repos. | Copying a single lazy per-worker template repo via `cpSync` produces the exact same initial Git repository state in `<1ms` with `0` subprocess spawns; `src/guard.ts` can also be inlined/removed. |
| **R7** | **`--name test` collision with `full: [test]` in `src/run-check.ts:154`** | Cost: **`96` of `409` (`23.5%`)** `name: "test"` runs in `timings.jsonl` were `<30s` targeted proof runs (`55` in `plan.synthesis`, `25` in `implement`) where agents passed `--name test` to `akrogon run-check`. Because `src/run-check.ts:154` checks `fullChecks(config).includes(opts.name)`, naming a 1-second single-file proof `--name test` queues it behind 70s full-suite runs in `max_full_checks: 1` (`src/admission.ts:144-169`). | Reserve `full` queue admission in `src/run-check.ts:154` for when the command matches `config.checks[opts.name]` (or refuse `--name <check>` in `run-check` when `--cmd` differs from `config.checks[name]`), keeping targeted proofs in the fast `max_active_checks` slots. |

---

## 5. Pitfalls Over the Work's Lifetime and What Removes Each

1. **Pitfall 1: Corrupt baseline/cohort metrics hiding real regressions or declaring false wins**
   - *How it happens*: Because `reasonAt` (`src/timing-report.ts:84-89`) never resets `reason = 'none'` on `prompt` or `batch`, any leaf that ever waits on `prerequisite` at `plan.synthesis` has its entire `implement` and `check.*` duration reported as `0s prompted` and `100% wait prerequisite`, and `merge_turn` holder execution is reported as `wait merge_turn`.
   - *What removes it*: Fix `reasonAt` in `src/timing-report.ts:84-89` so `prompt` and `batch` reset `reason = 'none'`, stop recording `wait merge_turn` on the holder in `src/next.ts:956-957, 1172-1174`, and add a regression test in `tests/timing-report.test.ts` using real `dispatchLeaf` event sequences (without hand-written `wait none` rows).

2. **Pitfall 2: Suite time creeping back above 60–90s as new leaves append end-to-end CLI tests**
   - *How it happens*: Each leaf adds 3–5 new `fixture()` + `cli()` tests (especially into `tests/next.test.ts`, now `256` tests / `6,168` lines / `379.4s` sum). Even after a one-time speedup, linear growth in `fixture()` + `cli()` calls and single-file concentration in `tests/next.test.ts` will push wall time back up.
   - *What removes it*:
     1. Replace per-test `git` x8 in `fixture()` with a once-per-worker template `cpSync` and pre-bundle `src/akrogon.ts` in `tests/isolation.ts` (cutting per-test overhead by ~5–10x permanently).
     2. Split `tests/next.test.ts` (`6,168` lines) by domain (`next-dispatch`, `next-merge`, `next-sweep`, `next-wait`) so `bun test --parallel=4` never blocks on a single 380s file.
     3. Print the top 5 slowest test files and any test `>3s` in `akrogon verify` / `akrogon timing` output so slow tests are visible immediately.

3. **Pitfall 3: Optimizing `checks.test` by 30s while still running `verify` 3.7 times per leaf**
   - *How it happens*: Focusing only on `bun test` internals while `verify` still runs `test` after a 2s `format` failure (`49` times), `check.repair` still runs `verify` before handing off to `check.fix` (`35` times), and `merge` still re-runs `verify` on the identical `tree` SHA (`14/15` recent merges).
   - *What removes it*: Fail-fast short-checks-first in `verify` (Fork 1), command-coverage receipt reuse across `leaf`/`merge` on identical `tree` (Fork 2), and removing intermediate `verify` (or collapsing `check.repair`/`check.fix`) when handing to A (Fork 3).

4. **Pitfall 4: Pre-bundled test binaries going stale during `implement` / `check.fix` edits**
   - *How it happens*: If `tests/isolation.ts` pre-bundles `src/akrogon.ts` into `tmpdir()` once, an agent editing `src/*.ts` during `implement` could run tests against a stale bundle if only the entry file's `mtimeMs` is checked.
   - *What removes it*: Check the max `mtimeMs` across `src/` (or pass a lightweight content hash / build into a content-keyed path in `tmpdir()`) in `ensureBundled` (`tests/isolation.ts:65-75`), which takes `<2ms` for the `32` files in `src/` and guarantees zero stale-bundle reads.

---

## 6. Practitioner Questions This Brief Does Not Ask

1. **Why does `check.repair` exist as a separate phase from `check.fix` when `66.7%` (`44/66`) of `check.repair` visits hand off to `check.fix` anyway?**
   - If Reviewer B is trusted to fix production code defects in `src/` during `check.repair` and land straight to `merge`, why is B forbidden from adding or updating the corresponding test in `tests/` (`skills/check-issue/SKILL.md` `## check.repair`), forcing a whole extra `check.fix` (Slot A) + `check.review` (Slot B) cycle on two-thirds of all repaired leaves?

2. **Why does `akrogon verify` run instead of auto-applying `prettier` (or why is `format` a failure gate after `test` rather than a 2-second pre-test gate)?**
   - `20.9%` of all `format` runs fail (`68/326`), and `48` of the `88` red `verify` runs failed `format`. Why spend agent turns and 70-second `test` runs diagnosing `prettier --check` failures instead of failing fast on `format` + `typecheck` in `4s` before `test` starts?

3. **When `merge_checks` and `merge_covers` are empty (`issues/config.yaml`) and `git rebase` onto `main` is a no-op (same Git `tree` SHA), what failure can re-running `akrogon verify --scope merge` possibly catch other than a flaky test?**
   - In `14` of the last `15` merges, `tree` at `merge` was bit-for-bit identical to the `tree` that just passed `leaf` verify, and in the last `2` leaves in a row (`slow-merge-notice`, `peer-pane-anchor`), re-running `verify` on that identical `tree` triggered a suite flake that aborted seatless `akrogon land` and woke Seat B for a 3rd full `verify`.

4. **Did anyone verify `akrogon timing` against raw `issues/timings.jsonl` before using `akrogon timing --cohort` as the `system-speed` stop gate?**
   - Because `reasonAt` (`src/timing-report.ts:84-89`) never resets `reason` on `prompt`, every leaf that ever waited on `prerequisite` has `implPrompted = 0` in `cohortComparison` (`src/timing-report.ts:278-289`), silently skewing the cohort medians used to evaluate speed work.

5. **Why are pure state-machine predicates (`eligibility`, `blockDetail`, `verifyPass`, `formatTimingReport`) tested primarily by spawning `8` `git` processes (`fixture()`) + a cold `bun src/akrogon.ts` subprocess (`cli()`) instead of direct in-process unit calls?**
   - `936` `cli()` spawns and `3,752` `git` spawns per `bun test` run are testing subprocess startup and Git filesystem I/O hundreds of times over rather than `akrogon`'s own logic.
