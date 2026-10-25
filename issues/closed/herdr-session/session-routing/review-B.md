# Review B: session-routing

Date: 2026-10-24. Slot B, initial blind check.review. Verdict: **fix**.

Base: `20455420e727de43090f0df2174cd91ed82ca527` (configured AKROGON_BASE and actual merge-base with the local origin/main).
Reviewed head: `0c21547abe46603ef0a65329580ad0e7c32e7057`, tree `27acbf41d3e4ac8a444afdc794110ac469bef359`.

Read brief, design, plan, implementation report, skill references, affected source, tests and docs. Debate is no, so positions-B.md and rebuttal-B.md are absent as expected. No peer review read or peer contacted. No product files changed or commits made. No real herdr calls or model launches. Fixtures used the existing fake-herdr CLI boundary and were removed in finally blocks.

## Fixes

### F1. Cross-session second-seat guard compares workspace IDs without the session

`src/next.ts:479` accepts a foreign pane whenever its tab's workspace_id equals the resolved workspace_id. Workspace IDs are local to each herdr server. Real source: the brief's original hidden-session incident leaves a pane in the leaf worktree in session Y, while session X holds the registered repo workspace. Both sessions can have `w1` without duplicate workspace labels. `next <slug>` reads the foreign pane, treats its foreign w1 as the repo's w1, then creates a second tab and launches another seat. This violates criterion 5 and session-address's session-qualified guard.

Representative CLI proof: a default session with workspace `{workspace_id: w1, label: repo}` and another session with `{workspace_id: w1, label: misc}`, containing a pane in the expected worktree, returned exit 0 and emitted default `tab create`, `agent start`, and `agent prompt`. The existing criterion-5 test uses w9 for the foreign workspace, so it misses this collision.

Evidence: `check review-B-ownership: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-routing/implementation/check-review-B-ownership-1792864920616-277595.log`, read back with akrogon log. The probe succeeds in recording the defect, not in satisfying the criterion. Fix the identity comparison to include the session and add a red-before/green-after regression at this boundary.

### F2. Recorded tab IDs bypass the required worktree-member proof

`src/next.ts:501-507` and `521-526` require memberInside only for label-based matches. A stored tab ID passes solely on workspace membership. Real source: the same stale per-server tab/pane IDs that motivated this leaf can identify an unrelated tab in the newly resolved session's repo workspace. Also, a recorded seat's only shell can have changed directory out of the leaf worktree. On the next pass allocate accepts it, calls process-info, and can close that unrelated shell for being outside the leaf slice. If already boxed, it can instead reuse and prompt the tab without the required cwd evidence. Criterion 6 explicitly requires a member pane inside the leaf worktree for recorded reuse and recorded-pane close.

Representative CLI proof: seed the recorded tab and pane in repo workspace w1 with cwd `/var/elsewhere`, then run `next <slug>`. It returned 0 and issued `--session default pane close w1:p90` before creating and prompting a replacement. Evidence is the second scenario in the same `check review-B-ownership: 0` log above. Require workspace membership AND a member inside the expected worktree independently of how the tab was found. Audit the other acting-use checks named in the design: ownsPane currently still accepts a recorded ID without tab/workspace corroboration, and dispatch's pane get trusts the stored ID.

### F3. The resolved session's second-seat discovery snapshots have no deadline

`allocate` reads `panes(session)` and `tabs(session)` at `src/next.ts:493-494`, and passes those snapshots into secondSeat. Its own-session branch at 456-458 reuses them, bypassing the deadline-bearing reads used for foreign sessions. The list helpers in shell.ts pass no deadline. Real source: the resolved running server answers workspace discovery, then stops answering pane list or tab list. The pass waits indefinitely instead of refusing the repo after 10 seconds, and later repos in an --all pass cannot proceed. This violates criterion 3 and stopped-and-ambiguous Q3, which explicitly includes the guard's pane/tab discovery reads. Apply the existing deadline parameter to the snapshots used by the guard and verify a stalled pane/tab discovery read, not only a stalled workspace read. The existing deadline test delays workspace list and never reaches this path.

### F4. Planned proof omits criterion 7 wake routing and criterion 8 main-red routing

The criterion-7 test in `tests/session-routing.test.ts` only runs next and inspects systemd-run arguments for absent HERDR_SOCKET_PATH. It never runs land or observes its wake/notice calls under the stale parent socket. The criterion-8 test titled “the merge notice and main-red notice go to the resolved session” only exercises the merge notice. The stopped-session test exercises suppression, not successful main-red delivery to the correct running session. Existing green-merge and verify tests cover their original behavior in a default single-session environment, so dropping routing from these paths would remain green. These are outcomes explicitly named by criteria 7 and 8, not optional cases. Add the missing cases using the existing green-merge/verify harnesses and record current green results plus a deliberate break that makes each routing assertion red. This is a missing-case proof item for A under check.repair's handoff rule, not absent machinery.

## Verification and proof judgment

- The final verify receipt actually on disk is `198d0ef4-6f13-4989-a14e-c88881ff2fdd`, sha `61d2b525e9ed3677a8d1b31fd19ff68de1ac0972`, same tree as reviewed HEAD. Setup, format, test and typecheck all exit 0. The report calls this run 4bf29e7e, but the kept log paths identify the actual receipt unambiguously. Read back all three logs: format `implementation/check-format-1792864469009-3737264.log`, test `implementation/check-test-1792864696141-3737264.log` (1130 pass, 0 fail), typecheck `implementation/check-typecheck-1792864700996-3737264.log`. Their absolute prefix is this leaf folder. No full-check rerun was needed for an unchanged tree with current passing evidence. Earlier flaky reds are superseded by this completed green receipt, not accepted through a known-red pair.
- Read back the reported post-rebase criterion logs c1 through c8 under implementation: c1 `1792861592677-2138303`, c2 `1792861593841-2139367`, c3 `1792861605836-2142043`, c4 `1792861607922-2147102`, c5 `1792861610840-2150692`, c6 `1792861611726-2151436`, c7 `1792861611988-2152391`, c8 `1792861613255-2152650` (each filename is `check-session-routing-cN-<suffix>.log`). All exit 0 and contain real test names. Their coverage is limited by F1-F4.
- Reported proof-filter corrections for c2/c3/c4/c8 select the current intended tests and broaden c2 to the --all result. No planned runner, test or check was disabled. Their commands preserve runner semantics. The title changes do not establish the missing observable outcomes in F4, and no revised-case deliberate-break evidence is recorded there.
- Kept the focused CLI observation through `akrogon run-check --name review-B-ownership -- bun --preload ./tests/isolation.ts <temporary-probe.ts>`, following the configured flocked setup first. Its two scenarios are described in F1/F2, and its kept log records the exact mutations. Temporary probe deleted after the run.

## Documentation and area paths

Opened docs/reference-index.md, both changed AREA.md files and docs/reference/state-and-phases.md. The delivery_error.command update matches routed argv. No other documented behavior was intentionally changed. The “every herdr call” wording has the design's explicit install/self-update exclusions in practice and is not a correctness blocker.

Ran one shell listing of paths named in both AREA.md files from the repository root. Evidence: `check review-B-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-routing/implementation/check-review-B-area-paths-1792864888728-271028.log`, read back. Referenced source/test/doc/skill paths exist. Missing issues/closed, issues/timings.jsonl, issues/verify-runs.jsonl, issues/config.yaml and issues/merge-attempts.jsonl are runtime/authoritative-checkout paths absent in this deliberately sparse worktree, not broken source pointers. No lesson lines were removed.

## Test-Change trailers

The following are Git-parsed trailers in `20455420..HEAD` (blank entries mean no parsed Test-Change trailer). Earlier blank-separated entries were not contiguous trailers, and 0c21547a supplies the final citations.

```text
0c21547a tests/seat-containment.test.ts calls() discovery filter and --session wrapper skip; no existing expectation changed
tests/reconcile.test.ts calls() discovery filter; no existing expectation changed
tests/batch-dispatch.test.ts calls() discovery filter; no existing expectation changed
tests/green-merge.test.ts argv assertions updated to the routed --session argv; expectations equivalent
tests/phase.test.ts argv assertions updated to the routed --session argv; expectations equivalent
tests/release-any-phase.test.ts keep reason became pane list unavailable under session resolution refusal; kept outcome unchanged
tests/AREA.md documents the new session-routing test file; doc line only, no expectation changed
tests/session-routing.test.ts prettier line-wraps after rebase; no expectation changed
tests/pause-next.test.ts deferred-cleanup fixture seeds workspace_id and member pane cwd so the tab stays a closable seat; calls() discovery filter; --session wrapper skip; no existing expectation changed
tests/next.test.ts argv expectations shifted for the --session prefix; calls() discovery filter; fixtures corrected per plan synthesis
tests/fake-herdr.ts gains --session routing, per-session stores, session list --json and failWorkspaceList merge; prettier wraps

61d2b525 
bf6c4a64 tests/fake-herdr.ts line wraps only; no expectation changed

cda19c7d 
18292d79 
f9d44627 tests/dbg4.test.ts removes a debug scratch file committed by accident

3454ecbf tests/pause-next.test.ts race-B prompt barrier wrapper skips --session before matching agent prompt; no expectation changed

d5703235 tests/fake-herdr.ts the session rewrite dropped plugin link's result({}) so it fell through to the unknown-invocation throw, and made pane split ids tab-scoped while suites assert the historical w1:p prefix

6ae30617 tests/next.test.ts two argv expectations shifted for the --session prefix the design now emits (pane list context, delivery_error command)

9c9f74aa 
709ada33 
0564a281 
39a78f4e tests/pause-next.test.ts same calls() discovery filter; no existing expectation changed

775d088e 
7742fe3d tests/fake-herdr.ts session-routing leaf — gains --session routing, per-session stores and session list --json; legacy flat db stays the default session
```

Judgment: brief criteria 1/4/7/8 and the design's explicit routed-argv updates justify next/phase/green-merge expectations and session-aware fake changes. The design's acting-use membership rule justifies the pause-next seeded workspace/cwd. Criterion 2 justifies the release-any-phase refusal keep reason. Wrapper/discovery-log filters preserve the original tested operations. Formatter/doc changes alter no expectations. The debug scratch deletion removes a file added on this branch, with no pre-existing regression lost. No test-path deletion or old expectation change lacks a relevant brief/design source in the final diff. The current cases still have the substantive coverage defects above.

## Operator actions

None. Verdict fix. Request check.repair.


## check.repair — 2026-10-24

Read both initial reviews: review-B.md and check/review-A.md (A: ready, no Fixes). Started from reviewed head 0c21547; repairs end at d7c11afbf5574816d87837d7046d54648f376354. No branch refresh. No locked brief/design changes, real herdr calls, paid launches or operator actions. The chart-only grant is not reused: its bounds explicitly forbid real calls by leaf seats. All proofs use local fake-herdr fixtures with finally cleanup.

### Repaired

- F1: reproduction commit 11a2d1c2, fix 4edc7632. Session identity now participates in the second-seat veto even when workspace IDs collide. `check repair-B-F1-red: 1 implementation/check-repair-B-F1-red-1792865234603-511037.log`; `check repair-B-F1-green: 0 implementation/check-repair-B-F1-green-1792865238905-514830.log`. Before: next exited 0 and launched a second seat. After: exit 1 before tab create.
- F2: reproduction commit 42df01c9, fix 5d9bf69a. Shared ownsTab requires resolved-workspace membership AND a member cwd inside the expected worktree. Recorded ID matches and label matches both use it. Audited the design's acting entry points: hook ownsPane now joins pane -> tab -> workspace and proves the worktree member; dispatch proves the tab once per slot and every pane get rejects a member of another tab; reconcile already enforces both checks and remains unchanged. Added the design-required hook/dispatch step to the plan's implementation notes. `check repair-B-F2-red: 1 implementation/check-repair-B-F2-red-1792865249132-518488.log`; `check repair-B-F2-green: 0 implementation/check-repair-B-F2-green-1792865279341-527098.log`. Before: closes the foreign-cwd recorded pane. After: preserves it and allocates a new tab.
- F3: reproduction commit c671580f, fix 87738ed4. Pane/tab list helpers now carry the existing 10-second deadline, including own-session snapshots and later discovery callers. Agent start/prompt waits are unchanged. `check repair-B-F3-red: 1 implementation/check-repair-B-F3-red-1792865306893-532002.log`; `check repair-B-F3-green: 0 implementation/check-repair-B-F3-green-1792865326971-539758.log`. Before: waits for the stalled command and reports JSON EOF at 12 seconds. After: refuses at the configured 10-second deadline.

Each bug has exactly one added reproduction test, committed before its fix with a Test-Change trailer citing its criterion/source. No old test expectation changed. All six kept logs above were read back with akrogon log. Paths beginning implementation/ are relative to this authoritative leaf folder.

### Current proof

`akrogon run-check --name repair-B-session-routing -- bun test tests/session-routing.test.ts --timeout=30000` on committed head 87738ed4: `check repair-B-session-routing: 0 implementation/check-repair-B-session-routing-1792865337363-541364.log`, read back. 17 pass, 0 fail, including all 14 pre-existing criterion tests B did not write. This reruns the full planned criterion-suite command after the latest test/helper edits. It validates the B repairs without claiming the missing F4 outcomes are covered. Configured flocked frozen-lockfile setup ran before dependency proofs.

### Handed to A

- F4: missing-case proof exception. Criterion 7 needs land's wake/notice actions with a stale socket, using the existing green-merge harness. Criterion 8 needs successful main-red notice routing to a running resolved session, using the existing verify/fake-herdr harness. Record green current runs and deliberate-break red evidence. No missing machinery or new live grant is needed.

### Follow-up from full verification

First full verify on 87738ed4 was red: `verify test: 1 implementation/check-test-1792865546122-550394.log` (1130 pass, 3 fail), with format/typecheck 0 (`check-format-1792865335190-550394.log`, `check-typecheck-1792865550262-550394.log`). Read the kept logs with akrogon log. These reds have causes in this repair and do not qualify for the unrelated-red retry/known-red rule.

Two failures exposed an F2 regression: an exited pane has no live pane row, but its stored tab can still be corroborated by a surviving member. Commit d7c11af fixes ownership to use the stored tab only when the triggering pane has exited, still requiring the workspace/worktree member proof. `check repair-B-exited-hooks: 0 implementation/check-repair-B-exited-hooks-1792865573043-1206387.log` (both previously red existing hook tests pass), read back. No existing expectation was changed. The repair's source search covers ownsPane, dispatch currentPane, allocate accepted/matches and both reconcile closes.

Current planned criterion-suite proof on d7c11af: `check repair-B-current-proofs: 0 implementation/check-repair-B-current-proofs-1792865589615-1225089.log` (17 pass, 0 fail).

### Handed to A — additional F2 expectation correction

- F2: `tests/next.test.ts` “allocation handles an empty tab” at lines 1990-1993 expects exit 1 and no panes after the recorded tab loses every member. Criterion 6 and plan D5 require that tab to be rejected for reuse because it has no worktree member. The repaired allocator creates a replacement tab and exits 0. Updating this old expectation is explicitly A's responsibility under check.repair, so B leaves it unchanged and carries the red check into check.fix. Keep the interrupted/recreated cases and assert the empty tab is not reused or closed.

### Final verification and handoff

`akrogon verify` on committed head d7c11afbf5574816d87837d7046d54648f376354 completed red, receipt 55ff77a3-40fa-4080-b9c3-3efbe06edf44. `verify format: 0 implementation/check-format-1792865580960-1223101.log`; `verify test: 1 implementation/check-test-1792865881391-1223101.log` (1130 pass, 3 fail); `verify typecheck: 0 implementation/check-typecheck-1792865885794-1223101.log`. Read back all logs using akrogon log. The two hook tests pass in this full run.

Remaining failures: the F2 empty-tab expectation handed to A above; “a leaf re-entering merge queues behind the two leaves stamped earlier” at its 15000ms timeout; “named target equivalence: owner name matches folder path from root, subfolder and worktree” at its 60000ms timeout. The implementation report records these same two timeouts on the original head, but this repair changes dispatch read costs, so I cannot establish the no-plausible-cause judgment needed to classify this run as unrelated-red or accept it via known-red. No green full-check result is claimed. A must keep the configured full checks green after its expectation/proof repairs.

F1-F3 product repairs are committed, their red-before/green-after evidence is kept, and the original planned criterion tests pass on the repaired head. F2's old test expectation correction and F4's missing proof cases remain explicitly handed to A. Working tree clean. No merge_checks run and no merge requested. Move requested: check.fix.


## Re-check — 2026-10-24, round 1

Verdict: **ready**.

Prior reviewed base: 20455420e727de43090f0df2174cd91ed82ca527.
Prior reviewed head: 0c21547abe46603ef0a65329580ad0e7c32e7057.
B repair handoff: d7c11afbf5574816d87837d7046d54648f376354.
Reviewed head: e0a57bd7323b1bfe71a5f1f0a5488df8d185d8c1.
Reviewed tree: 1ea6fcfe577c606e9c2dd24ebcbc8fd9ea1279e5.

Re-read the skill and references, brief, design, plan and updated implementation report. Reviewed the repair range 0c21547..HEAD, resuming B's already-recorded product repair evidence and inspecting A's d7c11af..HEAD diff in full. This check.fix did not refresh/rebase the branch, so the report's historical implementation refresh does not require a new range-diff. This was not a handoff from a rejected merge. Working tree is clean. No product changes or commits during this review.

### Earlier findings

- F1 resolved: secondSeat compares session identity as well as workspace_id. Its collision regression passes on the current head.
- F2 resolved: ownsTab requires workspace membership and a worktree member independently of matching by stored ID or label. Hook ownership corroborates the live or surviving recorded tab, and dispatch validates accepted-tab membership. A's b63aac62 corrects only the obsolete empty-tab expectation using criterion 6 and plan D5 as its source. It checks replacement allocation while preserving the orphaned tab and excluding a close of that tab. Interrupted/recreated checks remain intact. Read back `check fix-a-empty-before: 1 implementation/check-fix-a-empty-before-1792866696492-2302171.log` and `check fix-a-empty-after: 0 implementation/check-fix-a-empty-after-1792866707624-2313036.log` (3 cases pass).
- F3 resolved: pane/tab list helpers supply DISCOVERY_DEADLINE_MS, so the own-session snapshots cannot bypass the guard deadline. The stalled-pane regression and the original discovery deadline case pass on the current head.
- F4 resolved: e0a57bd7 adds the missing CLI cases using the existing fake session harness. Land runs under the foreign socket, completes successfully and routes its wake's merged-tab close to main. Main-red verify delivery under the default socket reaches the unique repo workspace in held and persists notice shown. Both tests execute the product boundary, with cleanup in finally. Read back the deliberate-break evidence: `check fix-a-land-wake-break: 1 implementation/check-fix-a-land-wake-break-1792866882049-2417039.log` fails specifically because the expected routed close disappears; `check fix-a-mainred-break: 1 implementation/check-fix-a-mainred-break-1792866885648-2419122.log` fails specifically because no main-red notice reaches held. The mutations are restored in the reviewed tree.

### Current verification

Read back the recorded suite proof: `check fix-a-session-routing: 0 implementation/check-fix-a-session-routing-1792866898436-2420359.log` (19 pass, 0 fail). The later completed full verification on the actual final formatted head independently runs these same cases, so proof does not rely on a test run predating its latest formatting edit.

Verified receipt 20768c69-ec1a-4677-bcd6-fa0ceaaee139 directly from issues/verify-runs.jsonl: sha e0a57bd7323b1bfe71a5f1f0a5488df8d185d8c1, tree 1ea6fcfe577c606e9c2dd24ebcbc8fd9ea1279e5, setup 0, format/test/typecheck 0, completed at 2026-10-24T18:45:53.971Z. The report's short receipt ID and format filename differ, so the actual receipt and paths below are authoritative. Read back all three logs:

- `verify format: 0 implementation/check-format-1792867187903-2935136.log`.
- `verify test: 0 implementation/check-test-1792867546726-2935136.log`: 1135 pass, 0 fail, including all 19 session-routing cases, the empty-tab case, both repaired hook cases, and both previously timed-out merge-queue cases.
- `verify typecheck: 0 implementation/check-typecheck-1792867553970-2935136.log`.

These paths are relative to this authoritative leaf folder. The full command retains the configured `bun test --timeout=30000` scope and runner configuration. No tests are skipped or disabled by the repair. Earlier reds are superseded by the completed current green check set, with no known-red exception claimed. No rerun was needed for an unchanged, fully verified tree.

No AREA.md changes are in the repair range. Reopened the affected state-and-phases reference: no additional documented behavior changed. No lessons were removed. No remaining Fixes, operator actions or reusable Nits. No real herdr calls or model launches were made by this review.

### Repair Test-Change trailers

```text
e0a57bd7 tests/session-routing.test.ts adds one case each for criteria 7 and 8 handed to A in review-B.md F4, on the existing fake-herdr sessions harness; no existing expectation changed

b63aac62 tests/next.test.ts check.fix expectation correction handed to A in review-B.md F2 note; criterion 6 requires the empty tab rejected for reuse, so the pass creates a replacement and keeps the orphaned tab open; interrupted/recreated expectations unchanged

d7c11afb 
87738ed4 tests/session-routing.test.ts F3 reproduction formatting only, no expectation change

c671580f tests/session-routing.test.ts F3 and criterion 3: a running session may answer workspace discovery then stall on pane reads

5d9bf69a 
42df01c9 tests/session-routing.test.ts F2 and brief criterion 6: stale recorded IDs may target another tab in the resolved workspace

4edc7632 
11a2d1c2 tests/session-routing.test.ts F1 and brief criterion 5: hidden sessions use independent workspace IDs, so equal IDs must not permit a second seat
```

All new tests cite F1/F2/F3's brief outcomes or F4's handed-off criterion cases. The F3 formatting trailer changes no expectation. A's only changed old expectation cites criterion 6 and preserves the other cases' assertions. These citations justify the changed paths under src/test-files.ts. No additional expectation correction or test removal is hidden in this repair.

Requested destination: merge, verdict ready.
