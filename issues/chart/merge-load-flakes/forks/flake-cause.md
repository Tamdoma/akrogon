# Flake cause

## Question
Q1. Who fixes the named framework flakes?
Q2. How does akrogon find out whether host load causes merge failures?

### Carries
- slots/map-merged.md (A,B,C), slots/map-rebuttal-B.md D3-D5, slots/map-rebuttal-C.md R4-R5.
- test-runs Off route: heavy-run slot only on a traced load failure.

## Findings
- better-than-training · framework issues/chart/merge-gate (open, Route pending handoff review, 2026-10-10) imported framework#207 including the seven "load flakes" (INTAKE.md:41-45), but its forks (fail-fast, cheap-checks, selector-lock) do not address them. Changed Q1: an owner already exists in framework; avoid a second framework chart. (A)
- better-than-training · framework issues/chart/bun-spawnsync-stall, Closed 2026-10-08 (4ecbcc8d9, Bun pin) · the nested isolate stall class is already fixed. (A)
- better-than-training · candidate-binding-check review-B.md:508-519 · EPIPE cause unexplained; rerun passed. framework learnings/history/2026-10-08-bun-test-isolate-zombie-stall.md:5-15 · reproduced on base. (B) Causes unproven either way. (B rebuttal D3)
- better-than-training · C proxy from framework log.jsonl 2026-10-07..09: active leaves near the five named flakes 2, 6, 6, 5, 2; mean near bounces 4.0, merges 3.6. Activity, not CPU. (C)
- better-than-training · Linux PSI docs (https://cdn.kernel.org/doc/html/latest/accounting/psi.html), read 2026-10-10 (B); /proc/pressure/{cpu,memory,io} present on this host with cumulative `total=` microsecond counters (A, 2026-10-10). The difference of `total` between gate start and end gives stall time over the whole run, not a snapshot. Answers B D5 (snapshots miss mid-run pressure). (A)
- practitioner · Fowler, Eradicating Non-Determinism in Tests (https://martinfowler.com/articles/nonDeterminism.html); Listfield, Google Testing Blog 2017 (https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html) · flakes come mostly from the test's own timing and resource use; fix in the test. (C)
- Held disagreement: B prefers one bounded idle-vs-loaded comparison; C says rare flakes make one comparison inconclusive (as #53) and prefers per-gate recording.

## Taken
Operator 2026-10-10: "1a | 2a"

- 1a: the named framework flakes (deploy EPIPE, 5 s timeouts, cache miss) become one fork in framework's open merge-gate chart, which already holds framework#207. Not akrogon work. The isolate stall is already closed (bun-spawnsync-stall). Foreclosed: 1b separate framework chart. Delivery: operator relays to the framework door; this chart writes nothing into it.
- 2a: the akrogon command reads /proc/pressure cpu, memory and io `total` counters when a merge attempt starts and when its result is recorded, and stores them on the merge attempt record from merge-attempt-records. Foreclosed: 2b one-time comparison, 2c no recording.
- Binding avoidance steps: no capacity limit is built until records show stall during failing gates; blocked-by merge-attempt-records (a real dependency: the record must exist); #69 stays open on GitHub until the records answer it, so the leaf does not list it in sources.
- Leaf review corrections 2026-10-10 (slots/leaf-review-B.md F4-F5, -C.md F5-F7 in ../clean-merge-gate/slots/), restatements within 2a: start counters and boot id stored on the batch and carried by restacks; end read before push or state change; no field on old batches, absent PSI or reboot; unreadable present file refuses before anything irreversible; one reader with a directory parameter; docs/guide/files.md named. (B,C)
