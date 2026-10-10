# Design: merge-attempt-pressure

## Binding decisions, verbatim

### flake-cause
Operator 2026-10-10: "1a | 2a"

- 1a: the named framework flakes (deploy EPIPE, 5 s timeouts, cache miss) become one fork in framework's open merge-gate chart, which already holds framework#207. Not akrogon work. The isolate stall is already closed (bun-spawnsync-stall). Foreclosed: 1b separate framework chart. Delivery: operator relays to the framework door; this chart writes nothing into it.
- 2a: the akrogon command reads /proc/pressure cpu, memory and io `total` counters when a merge attempt starts and when its result is recorded, and stores them on the merge attempt record from merge-attempt-records. Foreclosed: 2b one-time comparison, 2c no recording.
- Binding avoidance steps: no capacity limit is built until records show stall during failing gates; blocked-by merge-attempt-records (a real dependency: the record must exist); #69 stays open on GitHub until the records answer it, so the leaf does not list it in sources.

Exclusions: 1a is context only. merge-attempt-records merged before this handoff (issues/closed/merge-throughput), so blocked-by is empty; the dependency is satisfied.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Reboot: counters restart at boot, so a start/end boot id mismatch omits the field instead of clamping (B).
- Smallest real boundary: tests read counters through one injectable path (a directory standing in for /proc/pressure with fixed file contents), so increases are exact; no mocked filesystem module.
- Negative cases are consequence driven: criteria 2 and 3 protect in-flight batches across the upgrade and hosts without PSI.
- No vanity tests on schema text.

## Leaf architecture
- Owned: src/attempts.ts (schema field, reading and differencing), src/state.ts batch schema (start counters and boot id), the batch creation site in src/next.ts (beside `started`), the attempt-ending calls in src/phase.ts and src/next.ts (end read before push or state change), tests in the existing attempt-record tests, docs/guide/files.md merge-attempts section. (B,C)
- Interface: optional `pressure: { cpu, memory, io }` on the line, integer microseconds of `some` stall; optional start counters and boot id on the batch; one reader function with a pressure-directory parameter defaulting to /proc/pressure. (C)
- Exclusions: no admission limit, no `full` lines, no avg10/avg60 values, no change to outcomes or other fields, no reading at other times.
- Source: Linux PSI docs https://cdn.kernel.org/doc/html/latest/accounting/psi.html (total is cumulative microseconds); this host exposes /proc/pressure (read 2026-10-10).
