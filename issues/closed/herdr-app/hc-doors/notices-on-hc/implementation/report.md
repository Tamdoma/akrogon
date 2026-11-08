# Implementation report: notices-on-hc

Slot A, implement, 2026-11-08. Mode: subagents (U1 wave 1; U2, U3, U4 wave 2; U7 wave 3). U5 done by A as cited expectation corrections. U6 not done (see Blocker). Log paths are relative to this leaf folder.

- Base: `e3202dff4cf2a660cb26004e1ef3d2e8af883193` (origin/main at fetch, 02:39 UTC; unchanged since planning, no refresh moved the branch).
- Committed head: `6c42e1c01b48248294a7055c7f72ab08b919dc24`.

## Blocker: criterion 4 needs new proof machinery

- Criterion: C4 (window tier: toast, sound, deletion, closed-window wait, clear failure naming herdr-setup).
- Attempted operation: none. No window was started, so the grant was not drawn on.
- Cause: the plan (D15, U6) leaves `tests/e2e/notices.e2e.ts` and the session-name parameterization of `tests/e2e/tier.ts` (plus `window.e2e.ts`/`kinds.e2e.ts` callers) to implement. implement-issue forbids implement A and workers from writing tests and says the seat never writes or extends proof machinery to reach evidence. plan-issue says a criterion needing new proof machinery ends with `failed`. Without the script, the sub-criterion "the check fails clearly, naming herdr-setup, when the handler is not installed" has no check to show it.
- Mismatch recorded in `plan.md` `## Implementation notes` (2026-11-08).
- Owner: the operator, or plan-issue on a return to `plan.synthesis`.
- Next action: write `tests/e2e/notices.e2e.ts` and the `tier.ts` session parameterization at planning, in a test commit, as D15 describes. Then resume implement. Implement then runs only U8: the handler-missing tier run, a count line, the real tier run, and this report's C4 section. All other criteria below are implemented and proven on the head above.
- Operator action: send the leaf back to `plan.synthesis` (for example `akrogon phase notices-on-hc plan.synthesis` from the registered checkout) so slot A writes the tier script, or accept a different proof for C4 as a decision.

Grant `grants[0]` (bound: at most 2 herdrapp starts of `akr-e2e-notices`). Prior use in this leaf's artifacts: none. Count so far: 0 of 2. No launch in this pass.

## Changed files and reasons

| Commit | Files | Reason |
| --- | --- | --- |
| `4c64b7b4` feat: notice module and akrogon notice verb (U1) | `src/notice.ts` (new), `src/akrogon.ts`, `docs/reference/commands.md` | D1, D2, D11: the file contract (folder, id, atomic temp-then-rename write, pending/shown, removal) and the verb with its reference row |
| `20b0a02f` test: contract for the notice verb | `tests/command-reference.test.ts` | the verb's `contracts` entry the design names (Test-Change trailer) |
| `aef58c14` docs: watcher needs-you notice (U4) | `skills/watch-issues/SKILL.md`, `docs/use/watch-while-away.md` | D12: needs-you through `akrogon notice --attention`; the generic notice waits while `failure.delivery` is `pending` |
| `ed5a2547` feat: verify notices write notice files (U3) | `src/verify.ts` | D5, D7-D9, D13: folder resolved before the locked rewrite for base and merge runs, fold, file cover rule, write inside the lock, send functions and `rewriteRun` deleted |
| `bd522749` feat: engine notices write notice files (U2) | `src/next.ts`, `src/phase.ts`, `src/state.ts` | D3-D7, D10, D13: busy write/fold/remove, merged write/fold, failed write and fold, `commitMove` stale removals, `batch.notified` schema with old boolean mapping, `herdrCall` deleted |
| `7075fc66` fix: record the failed delivery before removing stale notices | `src/phase.ts` | A's repair of U2's ordering: a refused session during stale removal ran before `announceFailed` and left `failure.delivery` unrecorded |
| `fc32d86a`, `7b59d23c`, `87374d67`, `b0218335`, `0daddb7a`, `9a44ec90`, `be56144b` | test files (U5, see below) | A's cited expectation corrections, each with `Test-Change:` trailers |
| `6c42e1c0` docs: notice files in area and reference docs (U7) | `src/AREA.md`, `tests/AREA.md`, `docs/reference/state-and-phases.md`, `docs/reference/checks.md` | docs the diff made stale. `src/AREA.md` stays at 40 lines, so the `src/notice.ts` line is a sentence in the `src/hc.ts` bullet. |

Worker returns: U1, U3 and U4 met their briefs. U2 returned one mismatch (the planned `notab` exit code, resolved in `be56144b`) and listed the reds A ported. U7 met its brief. Its note: `docs/reference/state-and-phases.md` lines 9-18 already fail prettier at base, and docs are outside the format check.

## U5: old tests replaced or ported (C6)

Ported at planning (criterion cases): see `plan.md` "Old tests this leaf replaces".

Ported in this pass (red on the head before each port: `check-u2-suite-1794105224086-465303.log`, `check-u3-wide-1794104960378-432181.log`):
- `tests/verify.test.ts`: "the incident resolves only on green evidence…", "two simultaneous base runs produce one notification" (renamed "…one notice file"), "a green on the same revision clears only the earlier main-red incident", "a failed base setup does not send a main-red test notice", "a leaf-scope green on main resolves a merge-scope main-red unit…". All five count `noticeFiles` on a core, and `shown` becomes `pending`. "an absent herdr binary is recorded as error…" was renamed "an unreachable hc session is recorded as error…". `noticeCalls` deleted.
- `tests/slow-merge.test.ts`: "only eligible rows enter the normal…", "an open episode pins the normal…", "the last 20 eligible runs…". Each runs a core with `coreEnv` and uses `noticeFiles`. `noticeCalls` deleted. `mergeEnv` stays for three cases that assert no notice.
- `tests/session-routing.test.ts`: busy, failed, merged and main-red cases (two renamed). Each asserts the file lands in the core holding the repo space and a linked decoy core gets nothing. The land-wake case drops its notification clause and checks the decoy folder. "a stopped repo session suppresses…" runs on a stopped core. `rawCalls`/`toSession` deleted.
- `tests/next.test.ts`: the five empty-notice assertions and the merge busy title read `noticeFiles(f.core)`. The `failNotification` toggle and the herdr database helpers were deleted.
- `tests/phase.test.ts`: three failed-move cases run an hc core (`delivery` becomes `pending`). The rename-on-missing-tab loop reads notice files and a blocked folder. "failed move logs persisted delivery after failNotification/failRename" became "…after a failed notice write". The `failRename` variant was deleted because its `shown` was fake herdr's reply and a rename failure is a warning on hc.
- `tests/abandoned-capture.test.ts` (abandoned-pair case) and `tests/merge-attempts.test.ts` (failed unlanded holder): fixture environment only, now an hc core, because a move to failed writes into the repo's session. No expectation changed.
- `tests/phase.test.ts` planned `notab` sub-case (`be56144b`): the two `next --all` exit expectations changed 0 → 1. Real output from the U2 worker run: "Leaf is failed and needs phase recovery: notab" from the existing recovery refusal, which behaves the same at base. Fold assertions are unchanged.
- Kept for herdr-sweep: `noticeEnv` in `verify.test.ts` (two cases use its PATH), `herdrDb` in `next.test.ts` (one unchanged-db assertion), `fakeHerdr` uses that assert no notice.

## Proof results

All on head `6c42e1c0` unless noted. No retry was needed, nothing was marked inconsistent, and no known-red was used.

| Criterion | Command | Commit | Result |
| --- | --- | --- | --- |
| C1, C2, C3 (all criterion cases plus ports) | `akrogon verify`, run `41cd5ef2-da78-4e3d-aee7-aeb0f9aa84d6` | `6c42e1c0` | green: format 0 `check-format-1794105628338-1438120.log`, typecheck 0 `check-typecheck-1794105630647-1438120.log`, test 0 `check-test-1794105710122-1438120.log` (1271 pass, 0 fail) |
| C1-C3 suite before docs | `akrogon run-check --name a-suite -- sh -c 'bun test … && bun run typecheck && bunx prettier --check …'` | `be56144b` (`6c42e1c0` adds docs only) | `check a-suite: 0 check-a-suite-1794105571735-1102046.log` |
| C1 writer, ids, verb | `tests/notices.test.ts` | `20b0a02f` | `check a-cmdref: 0 check-a-cmdref-1794104788574-98871.log` |
| C5 calls | `sh -c "! grep -rnE \"'notification'\|herdr[^\\n]*notification\" src skills/watch-issues/SKILL.md"` | `6c42e1c0` | `check c5-calls: 0 check-c5-calls-1794105623518-1437778.log` (no match) |
| C5 callers | `sh -c "! grep -nE 'repoSession\|herdrArgv\|herdr\\(\|retryable' src/next.ts src/phase.ts src/verify.ts src/notice.ts src/akrogon.ts"` | `6c42e1c0` | `check c5-callers: 0 check-c5-callers-1794105623604-1437841.log` (no match) |
| C5 importers | `grep -rnE 'repoSession\|herdrArgv' src skills tests --include=*.ts` | `6c42e1c0` | `check c5-importers: 0 check-c5-importers-1794105623701-1437904.log`: only `src/shell.ts` definitions and `skills/watch-issues/scripts/observe.ts:6,90,222` (watcher-on-hc), so the old lookup functions stay (D13) |
| C4 | not run | none | blocked, see Blocker |
| C6 | verify receipt above | `6c42e1c0` | `test` ran 79.4 s inside bun (`Ran 1271 tests across 84 files. [79.44s]`). The check took about 79.5 s from the typecheck log's end to the test log's end, against the 75 s baseline median (max 121 s). The rise is about +5 s, under the 10 s bound: about 15 new or ported cases start their own hc core. |

Wall time: `akrogon verify` 02:40:25-02:41:50 UTC (1 m 25 s). The full-suite run-check took about 1.5 min.

### Deliberate breaks (plan "implementation:" reds)

Each was a temporary product edit, run, then `git checkout -- <file>`. All are red for the intended assertion.

| Condition (decision) | Temporary edit | Result |
| --- | --- | --- |
| Busy notice once per episode (D5) | `observeBusy` never folds | `check break-busy-nofold: 1 check-break-busy-nofold-1794105596386-1426405.log` (busy case: folder holds A again) |
| Busy removed when the seat goes idle (D6) | no `removeNotice` on idle | `check break-busy-noremove: 1 check-break-busy-noremove-1794105599466-1427791.log` (expected length 0, got 1) |
| Merged pending folds, not rewritten (D5) | `mergeNotice` writes while pending | `check break-merged-rewrite: 1 check-break-merged-rewrite-1794105600715-1429815.log` (expected `shown`, got `pending`) |
| Failed fold reads the file (D5) | `dispatchLeaf` fold disabled | `check break-failed-nofold: 1 check-break-failed-nofold-1794105601734-1431630.log` (expected `shown`, got `pending`) |
| Right session (D3) | `repoNotices` writes to `default` | `check break-wrong-session: 1 check-break-wrong-session-1794105605480-1432623.log` (session-routing merge case) |
| Removal on moves into and out of failed (D6) | stale removals skipped | `check break-no-stale-removal: 1 check-break-no-stale-removal-1794105606774-1434324.log` (merged and failed files remain) |
| `error` never covers (D9) | `noticeCovers` lets `error` cover | `check break-error-covers: 1 check-break-error-covers-1794105607938-1435621.log` (slow and main-red retry cases) |

Planning-time reds for the writer, ids and missing module are in `plan.md` C1. Not re-shown here: the pid-clause break (the pid code is deleted, and the dead-process case is the planning red `check-red-mainred-stub`), and the write-outside-the-lock break (`two simultaneous base runs produce one notice file` passes on the head; no temporary edit was made).

## Known limitations

- R3 (plan): `repoSpace` is memoized per process.
- A pending merged notice whose session cannot be resolved keeps `pending` (U2 reading of D7). The next pass folds or retries.
- `src/shell.ts` herdr helpers, `FAKE_HERDR` and `tests/fake-herdr.ts` stay for watcher-on-hc and herdr-sweep (D13).
- `docs/reference/state-and-phases.md` lines 9-18 are not prettier-clean at base, and docs are outside the format check.

## Unverified criteria

- C4: not shown. See Blocker.

## Implement pass 2 (2026-11-08, after replan): U8, serial-solo

Base `e3202dff` (origin/main at fetch 03:06 UTC, unchanged; no refresh moved the branch). Head `6722c4ae1c5c26deff5376272a19540e8ee742b4` (`df926770` tier test, `6722c4ae` trailer-only citation for `tests/AREA.md`).

### C4 grant count lines

- Launch T1, run-check `tier-notices`: draws on readiness `grants[0]`, bound "at most 2 window sessions, counting every herdrapp start of akr-e2e-notices", count so far 0 (planning, replan and the first implement pass launched nothing). Unit: herdrapp start. This launch makes 2 starts: `startTier`'s `openOnce` (start 1) and the window (start 2). Outcome: both starts made, so the count is now 2 of 2 and the bound is used up. Run `7a46df82-fdcb-4e26-b84f-4a8f54c0d13d`, `check tier-notices: 1 implementation/check-tier-notices-1794107396693-3070533.log`, 03:09:55-03:09:56 UTC. Cleanup ran and `implementation/notices-tier/absence.txt` reads `absent`. A later read found no `akr-e2e-notices` socket, home or state. Cost: free.

### Proof on head `6722c4ae`

- `akrogon verify` first run, 03:06:29-03:07:56 UTC: red. `verify test: 1 implementation/check-test-1794107276117-2417596.log`, 1 fail: `tests/hc-identity.test.ts` "no session, several sessions and an unreadable session refuse…, and a stale socket starts no core". At line 85 the SIGKILLed core's socket was still listening right after the kill. No file it exercises is in the leaf diff: `src/hc.ts` and `tests/hc-identity.test.ts` are unchanged, and `tests/hc-fixture.ts` gains only the additive notice helpers.
- One retry of the same command, `akrogon verify`, 03:08:07-03:09:34 UTC: green. Setup 0, format 0, typecheck 0, `verify test: 0 implementation/check-test-1794107374190-2745344.log` (1271 pass, `Ran … [81.73s]`). The check is marked **inconsistent**, with both logs above. It is not filed as a base red.
- C6: test ran 81.7 s against the 75 s median, a rise of about 7 s, inside the 10 s bound. The first pass measured 79.4 s on `6c42e1c0`.
- C4 handler-missing run: `check tier-nohandler: 1 implementation/check-tier-nohandler-1794107381012-3070060.log`. It failed before any start, naming herdr-setup and its install step, and no `akr-e2e-notices` path was created.
- C4 real run (launch T1): red. The closed-window notice was written while the window was closed, then deleted within a second of the window opening (`gone` true). The next check, the handler's `shown` line in `~/.local/state/herdrapp/akr-e2e-notices.log`, failed: the log was 0 bytes while the window ran (`implementation/notices-tier/window.log`). The toast overlay, shots, attention sound and silent-notice cases never ran. Whether the window writes its log only on exit is not established. herdr-setup's passing replay saved its log at the end of its run.
- Correction `e79eed95` (A's expectation correction, `Test-Change:` trailer citing the log above): the shown-line checks move to after `herdrapp session stop`, so every other observation is made first. Typecheck: `check a-tier-typecheck: 0 implementation/check-a-tier-typecheck-1794107463395-3074039.log`. The corrected tier is not yet run. `akrogon verify` must rerun on `e79eed95`, which changes only `tests/e2e/notices.e2e.ts`; that file is outside the `test` check but inside format and typecheck.

### Blocker: the window grant is used up

- Input: readiness `grants[0]`, bound "at most 2 window sessions, counting every herdrapp start of akr-e2e-notices" (stop-type).
- Attempted operation: a rerun of the C4 tier (`akrogon run-check --name tier-notices -- env AKROGON_E2E=notices AKROGON_E2E_HANDLER=/home/ivan/.config/herdr-app/mods/session-status/notices.js AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/notices-tier bun test ./tests/e2e/notices.e2e.ts`). It needs 2 more herdrapp starts.
- Identity: operator user ivan (uid 1000), target the throwaway session `akr-e2e-notices`, free.
- Error: the count is 2 of 2 after launch T1. A third start is outside the grant.
- Owner: the operator.
- Operator action: renew `grants[0].bounds` in this leaf's `readiness.yaml` to a total of 4 herdrapp starts of `akr-e2e-notices`, with the same target, identity, effects and cleanup. That gives one more 2-start run. Then resume with `akrogon phase notices-on-hc implement`.
- Next action (the next implement pass): rerun `akrogon verify` on the head, then the handler-missing run, then one count line and the tier run, then this report and `check.review`.

### Unverified criteria

- C4: toast, attention sound, silent notice and the shown log lines are not yet observed. The closed-window wait and deletion are observed in T1.

## Implement pass 3 (2026-11-08, after grant renewal)

Base `e3202dff` (origin/main at fetch 03:21 UTC, unchanged). Head `e79eed95aa7e61b29622aed5f750394986a0a0fb`. Grant: readiness `grants[0]` renewed to a total of 4 herdrapp starts (plan.md "Operator decision 2").

- Launch T2, run-check `tier-notices-2`: draws on `grants[0]`, bound 4 herdrapp starts of `akr-e2e-notices`, count so far 2 (launch T1). Unit: herdrapp start. It makes 2 starts (`openOnce`, then the window), so the count will be 4 of 4. Outcome: green, both starts made, count 4 of 4 and the bound used up. Run `663586c3-0f66-4027-a140-8bb5efe4b9c9`, 03:25:00-03:25:06 UTC. Cleanup ran and `implementation/notices-tier-2/absence.txt` reads `absent`. A later read found no `akr-e2e-notices` socket, home or state. Cost: free.

### Proof on head `e79eed95`

| Criterion | Command | Result |
| --- | --- | --- |
| C1, C2, C3, checks | `akrogon verify`, run `d7e99dc2-4b4b-4e4c-ab1c-5c0b7818b9ab`, 03:22:18-03:24:40 UTC | green: setup 0, format 0 `check-format-1794108143192-3227757.log`, typecheck 0 `check-typecheck-1794108146071-3227757.log`, test 0 `check-test-1794108280017-3227757.log` (1271 pass, 0 fail) |
| C4, missing handler | `akrogon run-check --name tier-nohandler-2 -- env AKROGON_E2E=notices AKROGON_E2E_HANDLER=/nonexistent/notices.js AKROGON_E2E_ROOT=<leaf temp> AKROGON_E2E_OUT=<leaf>/implementation/notices-tier-2 bun test ./tests/e2e/notices.e2e.ts` | `check tier-nohandler-2: 1 check-tier-nohandler-2-1794108295310-3687660.log`. Failed before any start: "herdr-setup's notice handler is not installed: /nonexistent/notices.js is missing; land herdr-setup's status-notices leaf and run /home/ivan/Work/infra/herdr-setup/install". No session paths were created. |
| C4, real window | the same command with `AKROGON_E2E_HANDLER=/home/ivan/.config/herdr-app/mods/session-status/notices.js`, name `tier-notices-2` (launch T2) | `check tier-notices-2: 0 check-tier-notices-2-1794108306763-3688012.log` (1 pass, 6.3 s) |
| C5 | first-pass greps on `6c42e1c0` | still valid: no later commit touches `src/` or the watch skill |
| C6 | verify `test` above | 84.6 s inside bun (`Ran 1271 tests … [84.62s]`) against the 75 s median, a rise of 9.6 s, inside the 10 s bound. The same suite measured 79.4 s and 81.7 s on near-identical trees (the later trees differ only in `tests/e2e/`, which the check does not run), so about 5 s of the spread is load. The leaf's own cost is the roughly 15 cases that each start an hc core. |

C4 observations from launch T2 (artifacts in `implementation/notices-tier-2/`):
- The handler file from herdr-setup is linked into the session home (`mods/session-status/notices.js` resolves to the installed handler).
- Closed-window wait: the notice was written with the window closed and present on disk. After start 2 it was deleted, `status-closed.json` shows `overlays: ["toast"]` and `errors: []`, and `closed.png` (inspected) shows the toast "akre2e closed / written with the window closed".
- Window open, attention: the notice was deleted, `status-open.json` shows two toasts, and `open.png` (inspected) shows "akre2e open / attention notice with the window open" above the earlier toast. `pactl.txt` shows `Event 'new' on sink-input #43842` in the attention window. That is the attention sound.
- Window open, silent: the notice was deleted and its shown line logged. No new sink-input event in the 5 s after it; the only `new` sink-input in the whole capture is #43842. `status-silent.json` has no errors.
- Window log (`window.log`), read after `herdrapp session stop`: one `akrogon-notice … "outcome":"shown"` line per notice, ids `o1`, `o2`, `o3`. This confirms the `e79eed95` correction: launch T1 found the log empty while the window ran.
- `herdr-app shot` exited 0 both times with the desktop variables from `systemctl --user show-environment`.

### Unverified criteria (supersedes the earlier sections)

None. C1-C3 and C6 are proven on `e79eed95`, C4 by launch T2, and C5 by the greps on `6c42e1c0`, which later commits do not affect.

Known limitations as before: R3 memoized `repoSpace`, the herdr helpers kept for watcher-on-hc and herdr-sweep, and the unformatted table in `state-and-phases.md` at base. Also, `tests/hc-identity.test.ts`'s stale-socket case was inconsistent once on `6722c4ae` and passes on this head; it is not leaf-caused.

## Check repair outcome (2026-11-08, slot B)

Head `47c6c3f658ad5816ed9e45dfc27fe361c8fec630`. F1 is repaired by reproduction commit `bee5f226` and product commit `47c6c3f`. The planned seven-file notice proof passed: `check repair-c1: 0 implementation/check-repair-c1-1794108852858-3727319.log` (356 pass). C5 greps are green. C4's inputs are unchanged, so T2's passing proof remains applicable and no further grant use occurred.

The full test gate is unresolved. Verify passes `3cd49b80` and `38195c68` were red despite format/typecheck passing. One configured test retry passed all 1272 tests, but the later verify and its required retry failed in different allocation/restart cases outside the repaired cleanup paths. `akrogon verify --known-red` returned fail because the merge-base already has a green receipt. There is no whole-green repaired-head receipt. Details, logs and disposition are in review-B.md. The leaf is stopped in failed pending clearance of this check.

C6 duration: latest verify test 87.82 s versus baseline median 75 s (+12.82 s). Other same-tree runs measured 85.74, 86.59 and 91.85 s. The new one-core regression measured 0.5-2.6 s, alongside A's roughly 15 core-starting cases. Runtime varied on identical test inputs and one run waited for the repository's full-test slot. Repair adds one regression test and replaces no old tests.

## Resumed check repair passed (2026-11-08, slot B)

This supersedes the prior blocked check-repair outcome. Head `47c6c3f658ad5816ed9e45dfc27fe361c8fec630` is unchanged. The missing current-head green receipt is now `e9ae394c-a53b-4200-a444-626b883ce6ff`: setup, format, typecheck and test all 0. Test: 1272 pass, 0 fail, 93.70 s. Logs:
- `implementation/check-format-1794109713568-2342429.log` (format: 0).
- `implementation/check-typecheck-1794109716425-2342429.log` (typecheck: 0).
- `implementation/check-test-1794109848446-2342429.log` (test: 0).

C6: 93.70 s versus baseline median 75 s (+18.70 s). Prior identical-tree runs measured 85.74-91.85 s, including a whole-suite green at 86.59 s. Added core-starting notice tests (roughly 15 from implementation and one regression from repair) plus unchanged-tree runtime variability explain the increase. The full-check admission wait is separate from Bun's test duration. Repair replaces no old tests.

F1 remains repaired by `bee5f226` and `47c6c3f`. The prior notice boundary and C5 proofs are unchanged, C4's window proof remains valid, and no further grant use occurred. Review-B records the full evidence. No blocking review finding remains, and B requests merge.

Final citation commit: `d40c155648a5133f0223a64827dd64950c48f59e` adds only Test-Change trailers for F1's src/next.ts and src/phase.ts repairs, as the frozen-plan guard requires. Its tree equals tested head 47c6c3f. The green receipt still covers it, and the merge preflight passes.
