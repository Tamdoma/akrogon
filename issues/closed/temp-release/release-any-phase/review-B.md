# Review B

Date: 2026-10-16
Base: `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3`
Reviewed head: `afd3e71823b67ba980aaaf84f3ca3dc51721ed8d`
Verdict: **fix**

Initial blind review. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review read. No code changes or commits made.

## Fixes

### F1 — Criterion 6 lacks a host-only stop proof

`tests/release-any-phase.test.ts:334` seeds only a live-tab leaf and a no-tab leaf. Both must stay. There is no host-only unfinished leaf with a vanished recorded tab and a busy slice, nor a host-only live-run veto case. Criterion 6 explicitly applies criteria 1–4 to the host step. The current test would still pass if the matched-leaf host stop action were removed while the keep reporting stayed. Other criterion tests reconcile the same repository first, which consumes their stop candidates before the host step runs. Thus the required host stop outcome has no test that catches its failure.

Add isolated host scenarios through the existing CLI/fakes, using another registered repository so the current-repo reconcile cannot stop the slice first. Cover the criterion 1 stop and criterion 2 live-run veto at that boundary, retaining the existing keeps. Evidence: source trace in `check review-b-source: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-review-b-source-1792116275119-3143115.log`, plus host and existing test traces in `check review-b-flow: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-review-b-flow-1792116286819-3148301.log` and `check review-b-boundaries: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-review-b-boundaries-1792116294830-3151895.log`.

### F2 — Criterion 7 race is paused before the required interval

`tests/release-any-phase.test.ts:398–402` blocks before fake herdr creates the tab. `allocate` saves the tab only after that call returns (`src/next.ts`, `saveState(leaf.path, tabState)`), then adopts seats. The locked design explicitly requires a pause between tab record and seat adoption. The present green test proves an earlier interval and cannot establish the specified interleaving. Move/add the gate at the existing fake busctl boundary after tab recording and before adoption, assert that recorded state before starting the competing pass, then assert the required slice/temp survival and seat adoption. This is a missing required proof, not a demonstrated product defect. Source and ordering evidence: review-b-source and review-b-flow logs above. Criterion 7 and the design's standing-design interpretation are the blocking contract.

### F3 — Required deliberate-break evidence is missing for criteria 2–8

The design requires each criterion other than criterion 1 to show one deliberate break turning its proof red. The report records only criterion 9's deliberate break. Plan B1–B5 have no recorded execution, and ordinary pre-implementation failures do not show that each current proof detects its intended broken behavior. Run the planned breaks against the final proof content, restore them, and record red/green commands and kept logs. In particular isolate criterion 3's no-temp case: its current sibling has a temp directory, which independently makes `reconcileNeedsPanes` return true before the changed candidate logic. A deliberate break of that candidate logic must turn the no-temp proof red. Use the per-criterion commands required by plan.md when recording the missing evidence. This is material verification required by the locked design, not an extra coverage request.

## Verification

- Current criterion file: **10 pass, 0 fail**, after locked setup. `check review-b-criteria-current: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-review-b-criteria-current-1792116310862-3157284.log`. Read back with `akrogon log`.
- Existing final-head verify receipt `c6920b68-a4a4-4567-9ddb-410fd2696053` matches the reviewed head and records format/test/typecheck exit 0. No full-suite rerun needed. Read back the logs: `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-format-1792116038104-2615913.log`; `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-test-1792116175073-2615913.log` (**965 pass, 0 fail**); `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-typecheck-1792116177109-2615913.log`.
- Traced both reconcile slice loops, sliceKeepReason, temp inventory veto, leftovers filtering, all dispatchLeaf callers and the enclosing global locks. No concrete product defect found in this diff. The blockers above concern required proof.
- Changed behavior docs reviewed: README.md, src/AREA.md, docs/guide/limits.md and docs/reference-index.md. README and area describe the new rule. All repository paths named in changed src/AREA.md exist: `check review-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-review-b-area-paths-1792116275244-3143238.log`, read back with `akrogon log`. No dead-pointer finding.
- No planned check was skipped, filtered or disabled in runner configuration. Per-criterion/mutation proof omissions are F3. No lessons removed. No operator actions or live external mutations required.

## Test-Change trailers

All paths below match src/test-files.ts. Reviewed every trailer in base..HEAD:

- `d76f5f7`: tests/release-any-phase.test.ts — new planned criterion tests, citing planned red baseline and criterion 9 break. Added file needs no exception. Proof completeness is F1–F3.
- `64ca077`: tests/fake-busctl.ts — brief criterion 1 / plan D7, opt-in slice inventory upsert. Appropriate fake boundary for loaded slices after adoption.
- `6f81c77`: tests/release-any-phase.test.ts — correct subprocess temp root. Supported by cli() environment and leafTempRoot(f), no assertion removed.
- `b1f0810`: tests/helpers.ts — shared readable fake systemctl inventory. tests/next.test.ts, tests/pause-next.test.ts, tests/reconcile.test.ts — readable inventory preserves existing deletion assertions under criterion 5. tests/store-sweep-safety.test.ts — same inventory and no-tab busy-slice premise, justified by criterion 1 now stopping a dead-tab busy slice and criterion 4 preserving no-tab slices. Existing assertions retained. These source citations justify the changes.
- `1f4354f`: tests/release-any-phase.test.ts — formatting only, no behavior change.

The final-head verify runs after the last changes to the tests/helpers/fakes. Its green result supersedes earlier failed implementation checks.


## 2026-10-16 check.repair

Base and head unchanged from initial review: `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3` / `afd3e71823b67ba980aaaf84f3ca3dc51721ed8d`. Read both initial reviews: A has no Fixes; B has F1–F3. No operator actions. A's N1/N2 remain nonblocking concerns, not repair work.

All Fixes are missing proof cases/captures/recordings executable by the existing CLI runner and fixtures. The check-issue check.repair rule assigns these to A: “A criterion whose proof lacks only a case, capture or recording that the existing runner and helpers can run goes under `Handed to A`.” No absent machinery or cross-leaf dependency was found. No product repair, code change, commit or additional test run is needed in B's handoff pass. Existing green evidence remains applicable to the unchanged code; the outstanding proof requirements remain open.

Confirmed unchanged clean worktree and existing fixture/CLI boundaries: `check repair-b-handoff-context: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-repair-b-handoff-context-1792117063447-3495120.log`, read back with `akrogon log`.

### Handed to A

- F1 — Criterion 6: missing host-only vanished-tab stop and live-run veto cases. Existing tools: `cli`, `fixture`, registered-repo config, fake systemctl/herdr/proc and live-run fixture pattern. Add another registered repo so its slice reaches the host step without current-repo reconciliation consuming it. Exception: missing criterion proof cases using existing machinery.
- F2 — Criterion 7: missing capture of the required interval after tab recording and before seat adoption. Existing tools: CLI subprocesses, fake busctl/herdr wrapper gates, `readState`, fake unit DB and temp assertions. Gate that interval and assert recorded state before launching the competing pass. Exception: missing criterion proof capture using existing machinery.
- F3 — Criteria 2–8: missing deliberate-break red/green recordings required by design, using plan B1–B5 and per-criterion `akrogon run-check` commands. Existing tools: Bun runner, committed criterion tests and fake helpers. Isolate criterion 3's no-temp case from its temped sibling so the changed needsPanes branch is actually exercised. Restore all deliberate breaks and record current green proof after final test changes. Exception: missing criterion proof cases/recordings using existing machinery.

Requested destination: `check.fix` for A's proof repairs. No move to merge requested.


## 2026-10-16 check.review after check.fix

Verdict: **ready**.
Base: `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3`.
Prior reviewed head: `afd3e71823b67ba980aaaf84f3ca3dc51721ed8d`.
Reviewed repair head: `0bea6beca6a516ef6d6d8cba4009d7370d381253`.

Scope: the single repair commit `0bea6be`, changing only tests/release-any-phase.test.ts. No branch refresh in check.fix, so no range-diff needed. Reviewed the repair diff and current plan implementation notes, report and deliberate-break results. No code changes or commits by B. No documented behavior changed in this repair. No AREA.md or lesson removal in the repair diff.

### Earlier findings

- F1 resolved: the criterion-6 scenario registers `other`, whose gone-tab busy slice and live-run-protected busy slice reach reconcileHost without repo-local reconciliation consuming them. It asserts the former's stop and unit removal and the latter's survival with the live-run keep reason. Existing live-tab and no-tab keeps remain. The host finished-gate break fails on the new stop assertion.
- F2 resolved: criterion 7 now gates fake busctl StartTransientUnit, reached after allocate saves tab state. Before the competitor starts it asserts the new recorded tab and its presence in herdr. Both CLI passes complete and seat count, slice, temp and keep outcomes are asserted. Removing the manual dispatchMergeLeaf lock turns the test red (three adoptions instead of two). The repaired test demonstrates the named interval and changed lock path.
- F3 resolved: B1–B5 and the needsPanes candidate break have recorded red results against the final test content. Criterion 3's no-temp leaf is isolated and fails alone under the candidate break. The final restored file is green. Breaks were run as whole-file commands rather than individual filters; the logs identify each required criterion's red assertion and exercise the same committed proofs, so the material verification gap is closed. Criterion 9's earlier break remains applicable because its proof and product inputs were not changed by the repair.

No new Fix or Nit introduced by the repair. No reusable Nit held by B. A's earlier nonblocking fake-failure concern is outside this repair diff and was not promoted. No operator action remains.

### Evidence

All cited logs were read back with `akrogon log`.

- Repair diff, trailer and final-head receipt: `check recheck-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-recheck-b-diff-1792118717892-483247.log`.
- Deliberate breaks, all with expected nonzero test results:
  - `check break-b1: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b1-1792118356677-4065605.log` (8 failures, including criteria 2, 3 and 8).
  - `check break-b1-needspanes: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b1-needspanes-1792118400546-4088230.log` (isolated no-temp failure).
  - `check break-b2: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b2-1792118420104-4100108.log` (criterion 4 and host no-tab failures).
  - `check break-b3: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b3-1792118436355-4110667.log` (criterion 5 temp survival failure).
  - `check break-b4: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b4-1792118455318-4122301.log` (host stop failure).
  - `check break-b5: 1 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-break-b5-1792118470708-4133564.log` (criterion 7 adoption count failure).
- Restored current proof: `check cfix-final: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-cfix-final-1792118483856-4141685.log` (11 pass, 0 fail).
- Final-head verify receipt `93282d71-5949-4d0f-8855-57ae9aff737c`, sha `0bea6beca6a516ef6d6d8cba4009d7370d381253`, tree `e6f14542833d6e9a83e675fd7a96a0d5e7fb52d4`, records setup and all checks exit 0 after the final test change:
  - `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-format-1792118552190-4175739.log`.
  - `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-test-1792118689270-4175739.log` (966 pass, 0 fail).
  - `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-typecheck-1792118691293-4175739.log`.

No rerun needed: kept final-head results cover the latest tests and helpers. No runner/check configuration was skipped or disabled. Deliberate-break reds are expected proof, followed by the restored green result.

### Repair Test-Change trailer

`0bea6be`: `Test-Change: tests/release-any-phase.test.ts review F1-F3 proof repairs: second-repo host scenarios, busctl-boundary gate for criterion 7, split no-temp criterion 3 case; helper extraction (liveRunRecord, otherRepo); assertions preserved plus host stop/veto and parked-tab additions the review required.` Accepted: F1–F3 and criteria 3, 6, 7 directly justify the changed fixtures and interval. The original combined criterion-3 assertions remain across the split cases. No unrelated expectation removed.


## 2026-10-16 merge

Attempt: `35d7f0a4-cef6-4552-a3cf-9c9d833307bb`. Applied top: `0bea6beca6a516ef6d6d8cba4009d7370d381253`; built on `91a1557cab2bf87f3b8ed6f0586d3aa0010304b3`; no members. Clean worktree and exact top confirmed by `check merge-b-head: 0 /home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase/implementation/check-merge-b-head-1792118781218-513630.log`, read back with akrogon log.

`akrogon verify --attempt 35d7f0a4-cef6-4552-a3cf-9c9d833307bb` returned `reuse receipt 93282d71-5949-4d0f-8855-57ae9aff737c tree=e6f14542833d6e9a83e675fd7a96a0d5e7fb52d4`. This identical-tree receipt records all configured format/test/typecheck checks green, as read back and cited in the preceding review (966 tests pass). No merge_checks, merge_covers or advisory commands configured. No code edits, rebase or commits by B.

`akrogon phase release-any-phase merged --slot B --check --attempt 35d7f0a4-cef6-4552-a3cf-9c9d833307bb` returned `ok`. Completion context gathered for temp-release's sole leaf. Proceeding to the command-owned push and completion.
