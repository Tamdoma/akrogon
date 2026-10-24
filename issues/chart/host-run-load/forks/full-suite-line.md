# Fork: full-suite-line

## Question

How does akrogon keep cross-repo full suites from running at the same time without slowing targeted checks (#89)?

## Options (from slots/map-A.md, map-B.md, map-C.md)

- O1 one full suite at a time host-wide, FIFO, only for commands each repo marks full; every other run starts at once (B D2, C §4)
- O2 CPU priority for verify runs, no waiting (A K1-O1). Two full suites can still overlap and seat full suites get nothing.
- O3 load or memory gate (rejected by A, B, C: lags, races, removed 2026-10-14)

## Taken (operator 2026-10-24)

Operator words: "but I need it to be faster than before, meaning, only do it for full tests. This is what the seeded issue is about, right=" then "becuase last time everything went behind the line, which made everything excruciatingly slow. Yes, o1, do it".

This amends the 2026-10-13 "no line" decision (permit-bypass/forks/guarantee.md:25-28) for full suites only. Small and targeted runs stay unbounded.

Details decided by A under autopilot:
1. Full = a run whose `--name` is listed in the repo's new config field `full` (names must be keys of `checks` or `merge_checks`). Covers verify's command and a seat's printed check with the same name. Starting values: akrogon [test], framework [verify, cheap], lingua-relay [test]. Config field added only after the new binary is deployed, because repoSchema is strict.
2. Bound: one live full run host-wide. Per command, not per verify run, so setup and akrogon's format and typecheck never wait.
3. Order: a waiting record with `since` is written before waiting; a waiter starts when no live full run exists and it is the oldest live waiter. The check-and-flip runs under an exclusive host lock.
4. Liveness: holders and waiters count only when their pid, start time and boot match (liveRuns). A waiter whose record vanished rewrites it with its original `since`.
5. Nested runs stay exempt (no self-deadlock).
6. Visible: one stderr line naming the holder when a run waits; `akrogon status` lists the live full run and its waiters with repo, leaf, check and age.
7. Not covered: raw seat processes outside run-check (bare vitest, Chromium). Known residual.

## Tests

- Two full runs from two repos sharing one state home: the second starts only after the first ends.
- A non-full run starts at once while a full run holds.
- FIFO across three.
- SIGKILLed holder and SIGKILLed waiter do not block the next.
- Nested full run inside a full run completes.
- Status shows holder and waiter.

## Operator correction 2026-10-24 (status)

"also, make it pretty in status, not ugly. Make it fit the whole status CLI UI, not just random messages. Put it in understandable way in some kind of a table or something, and ONLY if there's waiting."

Detail 6 becomes: `akrogon status` prints a `full suites (one at a time, all repos)` section with the same table renderer and colors as the leaf table (REPO, LEAF, CHECK, STATE, AGE; running first, then `waiting 1`, `waiting 2`), only while at least one full suite waits. The single stderr line on the waiting run stays.

## Rebuttals

- B R1 accepted: a full suite under a run not marked full now takes its own turn (src/admission.ts nested(token, full)); test "a full suite inside a run not marked full waits for the live full suite", shown red on 1f1efac0.
- B R2 partly accepted: `ended` holders already count as running until their record is removed after the unit stops (normal path covered). After a SIGKILLed wrapper the guard stops the scope with TimeoutStopSec=5, so a waiter may start up to ~5 s before the old processes are gone. Accepted residual, not worth a unit-state probe.
- C R1 = B R1, accepted and fixed.
- C R2 accepted for repos: starting `full` values widen to every registered repo whose `test` runs a whole suite: akrogon [test], framework [verify], lingua-relay [test], lens [test], Himne [test], blepsis [test]. framework `cheap` (38 s median) and every `test_changed` stay unmarked, per operator "only do it for full tests". Ad-hoc `--name` runs stay unbounded (detail 7).
- C R3 already covered: `ended` records count as running (src/admission.ts fullSuites sort), and the record is removed only after stopRunUnits returns.
- C R4 accepted residual: a SIGSTOPped head waiter blocks the line. status shows it as `waiting 1`, so the operator sees who blocks. No timeout added.
