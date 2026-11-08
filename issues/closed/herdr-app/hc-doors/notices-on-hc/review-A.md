# Review A: notices-on-hc

check.review, slot A, 2026-11-08. Base `e3202dff4cf2a660cb26004e1ef3d2e8af883193`, reviewed head `e79eed95aa7e61b29622aed5f750394986a0a0fb` (clean worktree, 18 commits ahead of base).

Verdict: **nits**

## Scope read

`brief.md`, `design.md`, `plan.md` (including Implementation notes, the replan and both operator decisions), `implementation/report.md` (passes 1-3), and the full diff `e3202dff..e79eed95`: `src/notice.ts`, `src/akrogon.ts`, `src/next.ts`, `src/phase.ts`, `src/state.ts`, `src/verify.ts`, `skills/watch-issues/SKILL.md`, docs, and the tests.

## Criteria against evidence

| Criterion | Judgment | Evidence |
| --- | --- | --- |
| C1 each caller writes one notice file atomically; next pass folds deleted as shown and present as pending | met | `writeNotice` writes `.<id>.<pid>.tmp` in the same folder, then renames. Callers: `observeBusy`, `mergeNotice`/`reconcileBatch`, `announceFailed`, the verify locked rewrite, and the `notice` verb. Folds: `observeBusy` pending branch, `dispatchLeaf` failed branch, `mergeNotice` pending, verify `foldShown`. Criterion cases in `notices.test.ts`, `next.test.ts`, `phase.test.ts`, `batch-dispatch.test.ts`, `verify.test.ts` and `slow-merge.test.ts` pass in verify run `d7e99dc2` on the head. |
| C2 cleared notice removed before it shows | met for the named cases | Idle seat (`observeBusy`), moves into failed or merged (busy), and leaving failed (failed and merged files plus `batch.notified` dropped) in `commitMove`. Breaks `busy-noremove` and `no-stale-removal` go red (report). One edge is in N1. |
| C3 `noticeCovers` file rule | met | `noticeCovers(value, folder, id)` at `src/verify.ts:229`, used by `newRedUnits` and `decideSlow`. The pid and boot clauses are gone. Dead-process, shown, error and slow cases pass. Break `error-covers` goes red. |
| C4 window tier | met | `check tier-notices-2: 0`, launch T2. I inspected the artifacts in `implementation/notices-tier-2/`: `closed.png` and `open.png` show the exact toasts, status overlays show `toast` with `errors: []`, `pactl.txt` has a single `new` sink-input in the attention window and none after the silent notice, and `window.log` has shown lines o1-o3. The missing-handler run (`tier-nohandler-2: 1`) names herdr-setup and its install step before any start. `absence.txt` reads `absent`. |
| C5 no `herdr notification` in `src/` or the needs-you line; old lookup kept only for other importers | met | `c5-calls: 0` and `c5-callers: 0` on `6c42e1c0`. Later commits touch only `tests/e2e/`. I grepped `docs/`, `README.md` and the skills: no "notification" left. `repoSession`/`herdrArgv` remain only in `src/shell.ts` and `observe.ts` (watcher-on-hc). |
| C6 test duration and replaced tests | met | 84.6 s against the 75 s median (+9.6 s), explained in the report. Every replaced or ported test is named with its reason. |

Checks: `akrogon verify` on the reviewed head is green (`d7e99dc2-4b4b-4e4c-ab1c-5c0b7818b9ab`: setup, format, typecheck and test 0, 1271 pass). One earlier `inconsistent` red on `6722c4ae` (`tests/hc-identity.test.ts` stale-socket case) has no cause in the diff: `src/hc.ts` and that test are untouched, and `tests/hc-fixture.ts` only gains notice helpers. Its retry was green and both logs are kept in the report. It is not a base red, so nothing was filed. No rerun was needed for this review: no code changed since that verify.

## Grant audit

Readiness `grants[0]`: renewed bound of 4 herdrapp starts of `akr-e2e-notices`. The report has count lines before T1 (2 starts) and T2 (2 starts), each completed with run IDs and outcome. That is 4 of 4. There are two `check-tier-notices*-*.log` files and the missing-handler runs started nothing. The renewal is recorded in plan.md "Operator decision 2". There was no paid activity. Count consistent.

## Docs

- `AREA.md` paths: the one-command listing (`check a-review-area-paths: 0 implementation/check-a-review-area-paths-1794108398401-3696786.log`) shows every repo path the diff added to `src/AREA.md` and `tests/AREA.md` exists. `issues/verify-runs.jsonl` is runtime state already named on that line before the diff. The other unmatched names are existing basenames outside this diff.
- `docs/reference/state-and-phases.md` rows for `busy_notified`, `delivery` and `notified` match `src/next.ts`/`src/phase.ts`. `docs/reference/checks.md` merge-slow wording matches `src/verify.ts`. The `commands.md` row matches the verb. `docs/use/when-work-fails.md:11` and `state-and-phases.md:43` ("shows a desktop notice") stay true. `docs/use/watch-while-away.md:24` and the watch skill line 42 match D12.

## Tests

- Each expectation change cites a design line or real output in its `Test-Change:` trailer. Examples: the `notab` exit 1 with the observed refusal text, the window-log read after stop with T1's 0-byte log, and the fake-herdr-to-core ports citing the standing design line. The deleted `failRename` delivery variant gives its reason (fake herdr's reply; rename failure is a warning on hc).
- No planned test was skipped or filtered. Each plan "implementation:" condition has a deliberate break shown red (seven, report table). Two not re-shown are stated with their reason.

## Fixes

None.

## Nits

- **N1. A busy notice stays pending when its seat exits instead of going idle.** `observeBusy` runs only for live seats (`src/next.ts`, `liveSeat(t)` loop). The pending busy file is removed when the seat goes idle or the leaf moves into failed or merged (D6). Suppose a seat busy over an hour exits or crashes while the window is closed. Then its file waits until the restarted seat goes idle, and could toast once the window opens before that. Deferred: D6 and C2 name "busy seat finished", which the idle observation covers, and no run has shown this sequence. Promoted to a Fix by a real trace (seat exit after a pending busy notice, window opened before the restarted seat's idle pass, stale toast observed) or a reading of the brief that counts an exited seat as finished.
- **N2. The engine tiers were not rerun after the `tier.ts` refactor.** `tests/e2e/window.e2e.ts` and `kinds.e2e.ts` now pass `engine` to `startTier`. Paths and names are byte-identical for `akr-e2e-engine` by construction, and typecheck covers the signatures. Neither tier was run, because their grants belong to engine-on-hc and they are outside the `test` check. Promoted by a failing engine tier run on this tree.

## Lesson recorded

The herdr-app window log was empty while the window ran and complete after `herdrapp session stop`. The line is in `learnings/LESSONS.md`, with `learnings/history/2026-11-08-herdr-app-window-log-while-running.md`, in the registered checkout, left for the operator to commit.
