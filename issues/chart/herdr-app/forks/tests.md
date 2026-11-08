# Test fakes and e2e

## Question

Today: `tests/fake-herdr.ts` (524 lines) is a fake `herdr` binary driven by a `FAKE_HERDR` state file, reusing `src/shell.ts` schemas, with `tests/fake-proc.ts` and `tests/fake-busctl.ts` beside it; `tests/isolation.ts` (the bunfig preload) gives each worker a scratch HOME and bytecode bundles of the fakes; 31 files under `tests/` and `skills/` use it; the `test` check runs `bun test --timeout=30000 --parallel=4 --no-isolate` (`issues/config.yaml`), concurrently per file. Real systemd units are already used in tests (`akrogon-test-*.slice`, `tests/run-units.test.ts`). `hc --skill`: "Tests need their own `HC_SESSION` and scratch XDG paths"; never stop the user's core. Signpost 2a: everything old removed, but only after the new path is tested end to end and shown working; 7a: one smallest live run per operation per agent kind at charting, in a throwaway session, within an approved paid budget.

1. Fakes: what replaces `fake-herdr.ts`: one strict fake `hc` (and fake `herdr-app`) binary with captured real JSON that refuses any call a test did not plan, a fake at the engine's hc module boundary, or a real hc core in a throwaway `HC_SESSION` for most tests?
2. Real e2e: which behaviors run against real hc and herdr-app (start with first task, report by `hc send`, listener on `hc events`, kill and restart, tab naming, weights, notices, containment), with real paid agents or a cheap stand-in program, run by the normal `test` check or a separate e2e command, and which run proves signpost 2a's "shown working" before old herdr is deleted?
3. Porting: does each leaf port the tests of what it changes (the engine leaf ports most), or does one test leaf port the fakes first, or a final test leaf?

### Carries

- Signposts: forks/signposts.md `## Taken` (2a e2e before deletion, no fallbacks; 7a probe budget) and its 2026-11-06 directions (closest to today, fewest parts, nothing that works today may break).
- All taken forks' `## Taken` (binding), especially engine-shape (hc module, listener), identity (strict `hc schema` boundary), start-and-pane, delivery, notices, containment, patch-mechanism (tests on both sides, herdr-setup lands first).
- Map: slots/map-merged.md fork "tests".

## Findings

- Merged notes: slots/fork-tests-merged.md (A,B,C,D,E with rebuttal corrections).
- Corrected (C,E probes): a throwaway core starts, runs and stops in about 13 ms; a stand-in script printing OSC 7501 gets real status and turns (`reported: true`, `turn: 1`, `blocked`); every error case is producible on a real core on cue; hc never answers "server not running", since any hc command starts a core.
- Agreed: `herdr-app` is faked (no headless window), strict, refusing unplanned calls; window and paid per-kind tiers are separate attended runs that fail rather than skip; 2a proof before deletion is the full suite plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check; each leaf ports its own tests, the engine leaf lands the shared substrate, the sweep removes obsolete machinery after the proof (wording scope stays with cutover).
- Q1: real throwaway core per fixture plus a stand-in agent, only `herdr-app` faked (C, A after rebuttal) vs a strict fake `hc` binary like today's fake herdr (B,D,E).
- Q2: free real-hc tests inside the normal `test` check (C,E,D after rebuttal, A after rebuttal) vs a separate e2e command (B).

## Taken
Operator 2026-11-07, door t15, verbatim: "1a | 2a | how long is the testing going to last for? Make sure the tests are meaningful and don't take too much time, ok?"

Read as:
- Q1 1a: `tests/fake-herdr.ts` is replaced by a real throwaway hc core per fixture (`HC_SESSION` unique per fixture, scratch XDG runtime and state under the suite root with the socket path under 107 bytes, inherited `HC_TERMINAL_*`/`HC_SCOPE` stripped, stopped on teardown, swept by `tests/isolation.ts`'s subreaper) and a small stand-in agent script that emits OSC 7501 status and does the scripted thing (write a return file, `hc send` its parent, block, exit, stay silent, stay idle). Error cases are produced on the real core (second `--name`, `state=blocked`, idle stand-in for `started: false`, `hc server restart`, `chmod 000` socket, stopped core). Only `herdr-app` is faked: strict, refusing unplanned calls, captures dated and refreshed by the window tier. No fake `hc`. `fake-busctl.ts` goes with `adoptShell`; `fake-proc.ts` keeps only helpers of the new design (resolver fds, leaf-slice identity).
- Q2 2a: the real-hc tests run inside the normal `test` check, so every verify and merge sees an hc regression; separate files, each with its own core; a machine without hc fails the check clearly. The window tier and the paid per-kind tier stay separate attended runs that fail rather than skip.
- Time and meaning (operator condition, binding for every leaf): the `test` check stays about as fast as today (median 75 s, max 121 s over the last 60 verify runs, `issues/verify-runs.jsonl`; a test check took 73-74 s on 2026-11-04, `issues/timings.jsonl`). Real-hc tests wait on hc events or `hc wait`, never sleeps, and each finishes in a few seconds. Each test checks a behavior akrogon relies on from a taken fork (start and first-task proof, delivery and turns, reports, listener wakes, silent-stop bound, restart, containment, notices, weights, session-id path, observe lines); none re-tests hc itself. Tests of removed behavior are deleted, not ported. Done-criterion per leaf: the leaf's verify `test` duration is recorded and compared with today's; a leaf that adds more than about 10 s says why in its evidence.
- Agreed, not asked: 2a proof before deleting old herdr is the full suite green plus one recorded window and per-kind run on the final installed revisions with the loaded mod build observed, plus one real leaf through its whole life, one consultant round and one watcher check, logs kept. Each leaf ports its own tests; the engine leaf lands the fixture core, stand-in and fake `herdr-app`; each leaf names the old tests it replaces; ownership and partial-state guarantees are kept; the sweep removes obsolete machinery after the proof (wording scope stays with cutover).
