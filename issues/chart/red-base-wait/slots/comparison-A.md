# Comparison, slot A notes

## Q1 per-test outcomes from arbitrary checks
- Pick: the seat reads both logs and writes one structured comparison file per red check (command and scope, leaf revision, base revision, per unit: name, leaf outcome, base outcome, log line refs, both log paths). The command validates function only when the seat records known-red-on-base: file parses, every field nonblank, both logs exist and are newer than the seat's `prompted_at`. Judgment of which unit is which stays with the seat. A machine reporter (bun `--reporter=junit`) is optional evidence the seat may use, never required. Reason: checks are arbitrary (framework: `hooks:selftest` is `bun test --isolate`, `test:motion-probe` is a node script, `framework:verify` chains stages via `bun run --sequential`, package.json:8,158,165); a parser per output format breaks on the next script. Cost: equivalence remains a judgment; a wrong match lets a leaf through.
- Rejected: configured reporter per check (covers bun test only, not motion-probe or stage runners; config burden on every repo). Command-level exit only (operator chose per test; a new failure inside an already-red command hides).
- Evidence: better-than-training, framework package.json read 2026-10-10; local `bun test --help` 1.4.2; user rule "quality judgment belongs to a thinking agent, mechanical checks validate function only".
- Pitfalls: the file freshness check also removes the #77 stale-log class mechanically (logs older than the pass are refused).

## Q2 non-test and incomplete outcomes
- Pick: the unit is the finest thing the output names (test, stage, or whole command when nothing finer exists). A unit whose leaf or base run is missing, crashed, timed out or never ran is unverified, never known-red; unverified blocks like a leaf failure and takes the normal repair path. A build or setup error red on both sides is known-red only when both runs reached the same terminal error with the same unit named.
- Rejected: treat incomplete base as red (would let leaves through on broken base runs).

## Q3 flakes
- Pick: rerun only the failing units once with the change before any base run (single file or test where the runner allows). Green on rerun: recorded as flaky on the leaf report, not a leaf failure, no base run. Red twice: base run. Saves the base run for flakes. Cost: a leaf-introduced flaky test passes on retry; accepted, Chromium makes the same trade.
- Rejected: no rerun (flakes cost a full base run or block the leaf).

## Added question
- Should a flaky result also go into the red record so the operator sees repeated flakes once? Belongs in red-record.
