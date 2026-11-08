# Fork: tests (Seat E)

## Q1. Fakes: what replaces `fake-herdr.ts`

1. **Pick:** Replace `tests/fake-herdr.ts` and `tests/fake-busctl.ts` with strict `tests/fake-hc.ts` and `tests/fake-herdr-app.ts` binaries (compiled to per-worker bytecode bundles in `tests/isolation.ts` like `fake-herdr.ts` today), backed by captured real JSON shapes validated against `src/hc.ts` / `hc schema` (`identity` Taken Q1 1a) and throwing on any unplanned command, flag, or unstripped `HC_TERMINAL_*` env var; repurpose `tests/fake-proc.ts` to seed `/proc/<pid>/fd` symlinks for the `session-id` transcript-path resolver; and pair the fakes with real `hc` in a throwaway `HC_SESSION` for the `hc` module/listener/e2e tests (Q2).
   - **Reason:** `tests/helpers.ts:84` (`cli()`) spawns `src/akrogon.ts` as a child process across ~30 concurrent test files (`bun test --timeout=30000 --parallel=4 --no-isolate`). Subprocess binaries (`fake-hc`, `fake-herdr-app`) test the full CLI boundary (argv construction, env stripping of `HC_TERMINAL_ID`/`HC_TERMINAL_SOCKET`/`HC_SCOPE` per `identity` Taken Q1 1a, and Zod parsing) and allow deterministic fault injection (`started: false`, `name_taken`, closed window `"no Herdr window"` vs unexpected `herdr-app ls` errors, multi-session socket discovery, 60s event timeouts) without spawning 30 GUI `herdr-app` windows.
   - **Cost:** Writing `tests/fake-hc.ts` and `tests/fake-herdr-app.ts` and pinning their output schemas to `hc schema` (`identity` Taken Q1 1a).
2. **Rejected options:**
   - **In-process fake at `src/hc.ts` module boundary:** Rejected because `cli()` (`tests/helpers.ts:84`) spawns `akrogon` in a separate process where in-process module mocks do not reach, and mocking `src/hc.ts` bypasses testing `hc` argv, env stripping, and JSON parsing.
   - **Real `hc` (and `herdr-app`) for all 31 test files:** Rejected because `herdr-app` is a 98 MB GUI window (`~/.local/share/herdr-app/herdr-app`) and state-machine tests (`session-routing.test.ts`, `reconcile.test.ts`, `next.test.ts`) need deterministic error/race injection (`deadRead`, `started: false`, `doc.get` conflicts) that a real server cannot synthesize on cue.
3. **Evidence:**
   - `operator`: `forks/signposts.md` (`## Taken` 2a, 7a, 2026-11-06 directions); `forks/identity.md` (`## Taken` Q1 1a); `forks/containment.md` (`## Taken` Q1 1a deleting `busctl`), read 2026-11-07.
   - `practitioner`: Terminal-multiplexer tooling test suites (tmux workspace managers / resurrectors) combine fast PATH-injected fake binaries for state-machine/error-branch matrix tests with isolated socket (`tmux -L <test-sock>`) integration tests against the real server binary, read 2026-11-07.
   - `better-than-training`: `tests/fake-herdr.ts:1-524`, `tests/isolation.ts:50-95`, `tests/helpers.ts:75-154`, `tests/fake-proc.ts:1-35`, `tests/fake-busctl.ts:1-85`, `bunfig.toml:1-4`, `hc --skill` ("Tests need their own `HC_SESSION` and scratch XDG paths"), read 2026-11-07.
4. **Pitfalls:**
   - **Fake `hc` drifts from real `hc` JSON output:** Removed by design part (`identity` Taken Q1 1a: validate fake outputs against the same strict Zod schemas pinned to `hc schema` in `bun test`).
   - **Fake silently accepts an unexpected flag or unstripped `HC_TERMINAL_ID`:** Removed by design part (`fake-hc.ts` and `fake-herdr-app.ts` fail non-zero on any unplanned subcommand/flag or leaked `HC_TERMINAL_*` env var).
5. **Unasked question:** None.

## Q2. Real e2e: stand-in vs paid agents, `test` check vs separate e2e, and Signpost 2a proof

1. **Pick:** Two layers of real e2e:
   - **In the normal `test` check (`bun test`, every verify run, zero paid tokens):** Run real `hc` in a per-test throwaway `HC_SESSION` with scratch `XDG_RUNTIME_DIR`/`XDG_STATE_HOME`/`XDG_CONFIG_HOME` using a **cheap OSC 7501 stand-in script** (`printf "\033]7501;state=working|done|blocked:kind=question\007"`) to test real `hc` behaviors that need no GUI window: `hc schema` pin, `doc.get`/`doc.set` weights helper (`start-and-pane` F1), start with first task + `hc events --terminal` (`delivery` Q1), `systemd-run --user --scope` containment under `akrogon-test-*.slice` (`containment` Q1), `hc send --json` + `<hc from=...>` report, listener on real `hc events` + `--keep` shell detection (`engine-shape` Q2), and `hc kill` + restart under the same name (`start-and-pane` Q4).
   - **In a separate windowed e2e command / charting probe (`herdrapp --session <throwaway>`, before cutover):** Run the GUI-dependent checks against a real throwaway `herdr-app` window (leaf tab adoption and `tab.rename` with window open at start and opened after start per `start-and-pane` Q2/N2; consultant column `terminal.keep` + equal weights; `session-status` mod watching `<appHome>/notices/`, calling `notify()`, and deleting the file per `notices` Q1/Q2) using the stand-in program, plus `signposts` Taken 7a's one smallest live paid run per harness kind (`claude`, `codex`, `pi`, `agy`).
   - **What proves signpost 2a ("shown working" before deleting old herdr):** Both the green `bun test` suite (including the real-`hc` stand-in e2e tests) and a recorded pass of the throwaway-session windowed `herdr-app` + `hc` e2e suite (plus the 7a per-harness live proofs) before the final cutover leaf deletes old `herdr`.
   - **Reason:** Probed live on 2026-11-07 in `HC_SESSION=akr-probe-E`: `hc server start` + `hc ls` + `hc server stop` in scratch XDG dirs takes **13 ms**, and a shell stand-in printing `\033]7501;state=working\007`, `\033]7501;state=done\007`, or `\033]7501;state=blocked:kind=question\007` makes real `herdr-core` report `reported: true`, `turn: 1`, and exact status transitions with zero LLM cost. Meanwhile, GUI window tests (`herdr-app`) cannot run headless in `bun test --parallel=4` and belong in the throwaway-window e2e pass.
   - **Cost:** One OSC 7501 stand-in script in `tests/` for `bun test` real-`hc` integration tests, plus one throwaway-window e2e script for `herdr-app` window/mod verification.
2. **Rejected options:**
   - **Paid LLM agents inside `bun test` (`checks.test`):** Rejected because `akrogon verify` runs `checks.test` on every leaf and retry; paid model calls in unit/check suites are slow, flaky, and violate `SKILL.md:65` grant bounds.
   - **No real `hc` in `bun test` (fakes only until manual cutover):** Rejected because real `hc` with scratch XDG dirs + OSC 7501 stand-in costs 13 ms and zero tokens, catching real `hc` CLI/event/socket regressions on every `verify` run.
3. **Evidence:**
   - `operator`: `forks/signposts.md` (`## Taken` 2a, 7a); `INTAKE.md:156` (throwaway `herdrapp --session` setup), read 2026-11-07.
   - `better-than-training`: Live probe in `HC_SESSION=akr-probe-E` (2026-11-07: `hc server start` + `hc ls --json` + `hc server stop` = 13 ms; `hc run --bg --name standin -- sh -c 'printf "\033]7501;state=working\007"; sleep 0.2; printf "\033]7501;state=done\007"'` -> `hc get standin --json` returned `{"reported":true,"status":{"state":"done"},"turn":1}`; `state=blocked:kind=question` returned `{"status":{"kind":"question","state":"blocked"}}`); `tests/run-units.test.ts` (real systemd slices in `bun test`), read 2026-11-07.
4. **Pitfalls:**
   - **A test's throwaway `hc` core survives after a test timeout or touches the user's `XDG_RUNTIME_DIR`:** Removed by design part (`tests/isolation.ts` sets per-worker `XDG_RUNTIME_DIR`/`XDG_STATE_HOME`/`XDG_CONFIG_HOME` under `suiteRoot` and `sweepSuite()` SIGKILLs all worker descendants on exit).
5. **Unasked question:** None.

## Q3. Porting order across leaves

1. **Pick:** Each leaf ports the tests (and adds its slice of `fake-hc.ts` / `fake-herdr-app.ts` + real-`hc` tests) for the code it changes in the same commit: the engine leaf builds `fake-hc.ts`/`fake-herdr-app.ts` and ports the engine tests; `chart-door` deletes `tests/peer-{ask,create,restart,wait}.test.ts` (`chart-door` Taken Q1 1a) and ports `tests/door-reset.test.ts`; `watcher` ports `skills/watch-issues/scripts/observe.test.ts`; and the final cutover leaf deletes `tests/fake-herdr.ts`, `tests/fake-busctl.ts`, and any remaining old `herdr` references after signpost 2a's e2e proof is recorded.
   - **Reason:** `bun test` is a blocking `checks` command in `issues/config.yaml`; every leaf must pass `akrogon verify` before it can merge (`map-merged.md:27`). Therefore no leaf can change `src/` or `skills/` without updating its tests in the same leaf, and `SKILL.md:371` forbids handing off a leaf whose own changes are not proven by its done-criteria.
   - **Cost:** The engine leaf carries the bulk of the `tests/*.test.ts` migration (~25 files).
2. **Rejected options:**
   - **A separate test leaf ports fakes before the engine leaf:** Rejected because fakes without a consumer do not exercise real engine code, and the engine leaf still has to rewrite the ~25 test files when it switches `src/` to `hc`.
   - **A final test leaf ports tests at the end of the epic:** Rejected because `akrogon verify` runs `bun test` on every leaf; `src/` changes cannot merge while `tests/` still expect `fake-herdr.ts` calls.
3. **Evidence:**
   - `operator`: `forks/signposts.md` (`## Taken` 2a, 6a); `slots/map-merged.md:26-27,41`, read 2026-11-07.
   - `better-than-training`: `akrogon config` (`checks.test` runs `bun test --timeout=30000 --parallel=4 --no-isolate`); `skills/chart-issues/assets/shapes.md:371`, read 2026-11-07.
4. **Pitfalls:**
   - **While `fake-herdr.ts` stays on disk until the final cutover leaf (signpost 6a), `tests/isolation.ts` wastes time building unused bytecode bundles or breaks when `fake-herdr.ts` is finally removed:** Removed by design part (the engine leaf switches `tests/isolation.ts` to build `fake-hc.ts` / `fake-herdr-app.ts` and deletes `fake-busctl.ts`, while the final cutover leaf deletes any remaining old files and asserts `grep -ri herdr` is clean except allowed `herdr-app`/`herdr-core`/`herdr-setup`/`/herdr` names).
5. **Unasked question:** None.
