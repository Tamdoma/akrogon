# Intake: killed-run-fixture

## Scope

Destination repo akrogon. A live run-check killed before its test's own cleanup ran must not let a seat move on while that run's outside fixtures may still exist. Expected outcome is not given by the reporter; fresh A settles it at the fork. One issue expected.

## Provenance

- GitHub: Tamdoma/akrogon#124
- Operator: 2026-10-28 chart-akrogon door message (autopilot switch-on)

## Source: Tamdoma/akrogon#124

# A killed live run under run-check left a Plus test user with cloud data, and the seat reran without cleaning it

Source: Tamdoma/akrogon#124
URL: https://github.com/Tamdoma/akrogon/issues/124

Origin repo: CastrumS/gljive
Lesson history: /home/rudi/Work/akrogon/learnings/history/2026-10-28-killed-run-fixture-leak.md

Unverified intake.

## Observation

Klobuk (CastrumS/gljive) leaf `web-finds`, check.repair, slot B, 2026-10-28. B ran the leaf's live probe `implementation/review-a-cloud-download-probe.ts` through `akrogon run-check --name repair-oa1-cloud-download` (run `9b721d20-1923-456e-883e-8c35297dc3f1`). The probe signs in a throwaway Firebase user, writes a cloud find with a photo, and removes the user in `finally` (`removeFixture`, then `expectGone`).

- `issues/timings.jsonl` has the run's `check_start` at 11:16:22Z and no `check_end`. No `check-repair-oa1-cloud-download-*.log` exists. The capture pair `capture-repair-oa1-cloud-download-9b721d20-1923-456e-883e-8c35297dc3f1-out.log` and `-err.log` stayed in the leaf's `implementation/` folder. The out file printed `test user` `pwa-test-1793186191` and `cloud find` `25f31f97-8101-4251-be53-debb90dfa3c8`, and never `test user removed`.
- B then ran the same probe as `repair-cloud-download`, which passed and cleaned its own user. `review-B.md` names only that second run, and B moved the leaf to check.fix.
- At 11:38Z, slot A's absence read in check.fix found `pwa-test-1793186191` still in Firebase Auth klobuk-920d7, created 11:16:33Z, with claims `{"plus":true}` and its `users/<uid>` data. No process of the run was alive. A removed it with the grant's cleanup and then read 0 `pwa-test-` users.

## Location

- akrogon release 3e49c3d5ddc7a178a9c5ff448015e525b85fb345
- `src/run-check.ts` (`checkedRun`: the capture pair written at launch, `check_end`, the `check <label>:` line)
- `src/scope.ts` (`startRunGuard`)
- Seats that run live fixture tests through `run-check` (check-issue check.repair here)

## Reproduction

1. Through `akrogon run-check`, run a live test that creates an external fixture and removes it in `finally`.
2. Kill the run-check wrapper before the test ends. What killed it here is not recorded. A seat tool timeout is the known way (#120).
3. The fixture stays. The holder keeps only the capture pair, and no `check` line is printed.

Seen once, 2026-10-28.

## Expected behavior

Not provided.

## Urgency

A production test user with the Plus claim, its cloud find and photo stayed for 22 minutes and would have stayed indefinitely. The grant's absence check never ran for it, and the leaf's review record listed only the green rerun. Workaround: after a live run that printed no `check` line, read its capture files and run the plan's killed-run cleanup on the printed IDs. A read of the fixture marker (here `pwa-test-` users) also finds them.

## Suspected cause

Agent view.

- Main condition: when the wrapper dies, the run guard (`src/scope.ts:65-88`) waits on the wrapper pid, then runs `systemctl --user stop <run>.scope`, which ends the test process, so the test's in-process `finally` cleanup does not run.
- Contributing: `checkedRun` writes `check-<label>-*.log`, appends `check_end` and removes the capture pair only after `spawnLogged` returns (`src/run-check.ts:348-357`), and `runCheck` prints `check <label>: <exit> <log>` after that (`src/run-check.ts:192`). A killed run leaves only the capture pair (`src/run-check.ts:303`) and its `check_start` record. No step in the seat flow or before `akrogon phase` looks for a capture pair left in the holder.
- Files read: the installed release copy `~/.akrogon/releases/3e49c3d5ddc7a178a9c5ff448015e525b85fb345/src/run-check.ts` (lines 160-375) and `src/scope.ts` (lines 65-97), not verified to match akrogon main. The leaf probe's `finally` (lines 111-118). The `timings.jsonl` records of run `9b721d20`.
- Not inspected: what killed the wrapper (the seat transcript was not read), and whether `bun test` runs `finally` blocks on SIGTERM. If it does, the stop escalated to SIGKILL or the cleanup itself hung.
- Related reports: Tamdoma/akrogon#120 (closed), a run-check killed by the seat tool timeout kept no log. Its capture files are what kept this run's IDs, and this report is the fixture consequence, not the lost log. Tamdoma/akrogon#89 (closed), a seat tool timeout killing run-check while it waited for the permit. Searched Tamdoma/akrogon, all states, for "run-check killed" (limit 10), plus @me reports since 2026-10-26 (limit 40, none found).

## Source: operator 2026-10-28T12:31Z

Look at the two new pulled issues. Consult with slot b (codex, active in this tab) and chart it on autopilot mode. Nudge the watch-akrogon tab watcher to start the lifecylce.

## Agent findings

Shared opening map, 2026-10-28: [slots/map-A.md](slots/map-A.md), [slots/map-B.md](slots/map-B.md).

- `startRunGuard` (`src/scope.ts`) waits on the wrapper pid, removes the admission record, then `systemctl --user stop <run>.scope` (SIGTERM, escalating after `TimeoutStopSec=5`), so the test's in-process `finally` does not run (A,B; systemd.kill man page, B S1).
- `spawnLogged` gives the child the capture files directly (`Bun.file`), so output keeps flowing with the wrapper dead; `checkedRun` publishes `check-*.log`, `check_end` and unlinks the capture pair only after the child returns (A,B).
- `src/phase.ts` `transition` checks receipts, cleanliness and citations, not leftover capture pairs (B F5). Existing grant schemas carry marker, naming, cleanup identity and absence check, but no per-run cleanup state (B F5).
- The seed's lesson history path `/home/rudi/Work/akrogon/learnings/history/2026-10-28-killed-run-fixture-leak.md` is absent from this repo's main and origin/main (A, 2026-10-28).
- Every live capture writer holds a shared flock on the owner `.lock` until its child exits, and `akrogon pack` already waits on it (A, `src/AREA.md` pack and flock lines).
- B's key question (map Q6): is the promise recovery before rerun or handoff, or cleanup even when no seat returns?
