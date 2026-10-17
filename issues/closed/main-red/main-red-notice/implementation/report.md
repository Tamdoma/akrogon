# Report: main-red-notice

Base: `c9f658b` (`AKROGON_BASE`, still tip at handoff — refresh found branch up to date). Head: `7e08d2b`. Serial-solo run, no workers.

## Changes

- `104c943` tests: six red criterion tests in `tests/verify.test.ts` plus `noticeEnv`/`noticeCalls`/`herdrDb`/`baseRecord` helpers (planned at synthesis, committed before product code).
- `7e08d2b` `src/verify.ts`: `verifyRunSchema` gains optional `notice`; `newRedUnits` computes newly uncovered units inside the finalize lock and reserves `notice: 'pending'` in the same locked write; `sendMainRedNotice` runs the herdr call after the lock and replaces `pending` with the reply reason or `error` in a second locked write; a send failure prints `notice: <error>` and never changes verify's result. `src/AREA.md` names the behavior.

Incident rule as implemented: a unit (scope + command name/string + failing test name) failing in a finalizing `compares` record is new when no completed `compares` record still unresolved holds a covering `notice`. Covering = reason other than `error`, or `pending` whose `pid` is alive on the same `boot_id`. A red record resolves when a completed record with the unit's command green has a sha on landed main (`is-ancestor sha origin/main` at scan time) that is the red sha or a descendant of it — a green on an older revision never clears a newer red, and a leaf head counts only once its revision is main (plan D4).

## Proofs (all criteria, run on `7e08d2b`)

- C1 first uncovered base red notifies once and records the reply — `akrogon run-check --name notice-c1 -- bun test tests/verify.test.ts -t "one main-red notice"` → `check notice-c1: 0` (`implementation/check-notice-c1-1792230535107-3063868.log`): one `notification show "repo main red" --body "1 new red on main: alpha; receipt <run>; chart a repair" --sound none`, base record `notice: "shown"`.
- C2 same unresolved unit silent — `notice-c2` → `check notice-c2: 0` (`implementation/check-notice-c2-1792230537116-3064264.log`): two base runs, one notification, second record no `notice`.
- C3 generation-based clearing — `notice-c3` → `check notice-c3: 0` (`implementation/check-notice-c3-1792230539585-3064772.log`): green leaf head not on main stays silent; once pushed to main it resolves and a new red re-notifies; a green seeded on the older revision finishing later never clears the newer red.
- C4 send failure — `notice-c4` → `check notice-c4: 0` (`implementation/check-notice-c4-1792230541840-3065820.log`): failing herdr keeps exit 0, prints `notice: `, records `error`, next base run sends; absent herdr binary identical.
- C5 reservation dedup and dead pending — `notice-c5` → `check notice-c5: 0` (`implementation/check-notice-c5-1792230544812-3066770.log`): concurrent `--known-red` runs produce one notification; a seeded `pending` with a dead pid/foreign boot does not block the next send.
- Red evidence at plan.synthesis is recorded in `plan.md` (`check-notice-c1..c5` red logs under `implementation/`).

## Checks

- `akrogon verify` on `7e08d2b` → `verify leaf 7e08d2b…: green` (format, test, typecheck all 0; 1010 tests pass). Logs under `implementation/check-{setup,format,test,typecheck}-*`.

## Known limitations

- `shown` is not a read receipt; a missed notice leaves main red until someone looks (locked cost, from the design).
- A green landing on main after a red base run finalized but covering its sha resolves that incident; a unit that was new at that finalize keeps its already-sent notice, so one later notification for a sha older than that green can be suppressed. Rare, self-corrects on the next new sha (plan's open limitation).
- A crash between send and the second locked write can duplicate a notice (accepted in the design).
- `newRedUnits` runs `is-ancestor` and `failedTests` inside the verify-runs lock; the record sets involved are small (one repo's verify runs) and the scan memoizes both per sha pair.

## Unverified criteria

None.
