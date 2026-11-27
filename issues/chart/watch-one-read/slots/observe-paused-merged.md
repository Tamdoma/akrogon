# Merged notes: fork observe-paused (map returns used as the blind fork notes)

The three opening maps were written blind and each answered this fork's questions, so they stand as the fork's independent notes. Sources: slots/map-A.md, map-B.md, map-C.md.

## Q1 Where the paused bit goes in observe.ts output

- Line 2 `paused=<true|false>`, always printed, line 1 stays `session=<name>` (A,B). Reason: line 1 and leaf/unreadable formats stay byte-identical, so old skill text and `observeReady` keep working (S4a). The bit is read before any leaf line. Cost: exact-output asserts in tests/hc-observe.test.ts shift.
- Final line `paused=<true|false>` after all leaf and unreadable lines (C). Reason: old output is a byte-for-byte prefix, and a final control line shows the output is complete. Cost: the bit is read last, after the lines it governs.
- Rejected by all: appended to line 1 (breaks HC_SESSION parsing, observeReady), present only when paused (absence as signal), JSON or new fields on rows, non-zero exit when paused.

## Q2 What a paused observe prints

- Short-circuit: `session=` + `paused=true`, no inventory, no seat reads, no leaf or unreadable lines (A,B). Reason: the unsafe act (next/phase/seat command on a paused repo) has no input even if a watcher skips the paused line, and it keeps today's "paused observes nothing" contract.
- Full inventory on either value, transcript discovery read-only (C). Reason: "every leaf line" in the destination. C names the short-circuit as the right pick if the old no-seat-read rule binds.

## Q3 Failure handling

- Read pause with `isPaused(repoKey)` from src/pause.ts inside observe.ts, before any stdout line; a malformed or unreadable paused.yaml exits non-zero with empty stdout and the error naming the file on stderr (A,B,C). No default (S2a).
- The skill says: observe non-zero exit means report the error and act on nothing this check (B,C).
- Every re-observation (Judge merged cleanup, command error, Consult resume) applies the same paused and error rule (B,C).
- Rejected: pause in `akrogon config` (B: a corrupt paused.yaml would break stop.ts and every config reader), `status --json` or a new CLI verb (B,C).

## Q4 Proof

- Free: tests/hc-observe.test.ts on a real core: unpaused, paused (no leaf lines), unpause restores, malformed paused.yaml gives non-zero exit and empty stdout (A,B,C).
- Free: tests/fixtures/watch-hook.sh and watch-agent.sh run observe.ts instead of `akrogon status`; tests/watch-timer.test.ts and the watch-live stand-in cells count checks and hold busy checks on observe calls, assert zero `akrogon status` calls, keep the paused-no-next proof; the doc test flips to "skill does not contain `akrogon status`" (A,B,C).
- Check marker: an observer-only recorder through `OBSERVE_AKROGON` so tick.ts's own `akrogon config` call is not counted or held (B,C). Low confidence that every harness passes OBSERVE_AKROGON to its tool subprocesses; B offers a /proc parent check (B).
- Watcher test envs must carry `AKROGON_HOME`: tests/watch-timer.test.ts `watchUp` and tests/e2e/watch-live.e2e.ts `launchEnvFor` omit it, so observe.ts would read the wrong paused.yaml, in the live e2e the operator's real one (B,C).
- Paid: one pi cell of tests/e2e/watch-live.e2e.ts (the incident harness) with markers moved to observe, zero status calls, and a pause step proving no `next` at the paused turn (B), plus discovery of a leaf staged after an empty check (C).
- Docs: docs/use/watch-while-away.md "What each check does", docs/pictures/watch-loop.svg, skills/AREA.md observe line (B,C).

## Where slots differ

- Q1 line 2 (A,B) vs final line (C).
- Q2 short-circuit (A,B) vs full inventory (C).
- Q4 whether the paid cell adds a pause step (B) or a discovery-after-empty step (C); A had left paid proof to the lifecycle rule.

## Intake corrections (B,C)

- At a registered root, the plain `akrogon status` leaf table is scoped to that repo; the run-line block and nags still show other repos. The two-source cause stands.
- Explicit `next <slug>` and `next --all` both ignore pause (tests/pause-next.test.ts), so the watch's own paused check is the only guard.
- `akrogon unpause` runs its own unpausePass, so a resumed leaf after unpause does not prove the watcher acted (C).
