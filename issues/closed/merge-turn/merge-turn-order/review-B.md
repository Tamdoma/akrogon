# Review B

Date: 2026-10-05
Phase: check.review, initial blind review
Base: 923c6c98fac3f051a54ac27168ea024215652602
Reviewed head: b6f5e644c88e1a5f8bbc118cfa391a261843c97a
Verdict: fix

Read brief, design, plan and implementation/report.md before the diff, plus check-issue/ponytail.md. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No code edits or commits were made.

## Fixes

### F1: A dispatch pass retries the same merge seat twice

Location: src/next.ts:880-886, following the earlier selection/--all/--resume dispatch.
Realistic source: an operator runs `akrogon next --all` while the merge holder's Herdr prompt returns the already-supported retryable `agent_prompt_stalled` response. The first sweep attempts delivery and records failure, then the new final merge sweep attempts the same seat again in the same pass.
Consequence today: one pass consumes two of the three attempts. Two operator passes can fail the leaf, instead of the required three distinct passes. This contradicts design turn-release Q1's retained per-pass retry counting, plan D7, and docs/guide/next.md's one delivery attempt per pending seat per pass contract.
CLI reproduction using tests/helpers.ts fixture/fakeHerdr: allocate aa, bb and cc with `next <slug>`; put aa and bb in merge with bb stamped first; reset B attempts to zero and fake promptScript to two stalled replies. Run `next --all` once.
Observed: exit 0, bb.phase=merge, bb.attempts.B=2, no delivered merge prompts. Expected B attempts=1.
Existing capped-failure test checks only the state after three passes and misses the intermediate retry count. Add a boundary regression asserting attempts after each pass while preserving same-pass queue advancement.

### F2: A capped failure in the final merge sweep can strand the next holder

Location: src/next.ts:676-680 and 880-886, also the single sweep in mergeWake at 687-692.
Realistic source: a normal idle hook for another running leaf triggers the end-of-pass merge sweep. Discovery puts waiting aa before holder bb, because filesystem leaf order differs from merge stamp order. bb starts with two failed delivery attempts and its third supported retryable prompt failure commits failed.
Consequence today: aa was already visited and skipped while bb held the turn. After bb fails, the sweep ends without reconsidering aa. No merge prompt is sent until another unrelated pass arrives. This violates brief done-criterion 6 and the explicit same-pass capped-failure requirement in plan D7.
CLI reproduction: same allocated aa/bb/cc fixture as F1; bb earlier-stamped holder, bb.attempts.B=2, one stalled prompt response. Invoke `next` with HERDR_PANE_ID=cc's A and the valid pane_agent_status_changed idle event (data.type and pane_id included).
Observed: exit 0, bb.phase=failed, bb.attempts.B=0, delivered merge prompts=[]. Expected one merge prompt to aa's B in this pass.
The new test uses aa as holder and bb as waiter in a full sweep, so it cannot catch failure during the final sweep with the waiter visited first. Reconsider the queue after a committed holder failure without retrying a previously attempted seat in the same pass.

### F3: A log append failure can still prevent the post-commit wake

Location: src/next.ts:623-625, unconditional readLog(repo.root) before mergeQueue; src/log.ts:27-31.
Criterion source: brief done-criterion 7 requires a saved holder move followed by a failed log append to prompt the next B. Plan U6 explicitly calls for pointing log.jsonl at a directory. The report substitutes a read-only regular file, leaving the unreadable-log case unproven.
Consequence today: the phase move commits, its append fails, and finally invokes mergeWake, but dispatch reads the same unreadable log and skips the waiting leaf. Even when all eligible leaves have explicit merge_stamp values and need no history to order them, the next holder receives no prompt.
CLI reproduction: allocate aa/bb/cc, stamp bb as holder and aa as waiter, clear prompts, create a directory at issues/log.jsonl, then run `phase bb failed --reason stop --slot B`.
Observed: exit 1 with `Move to failed is committed, but log append failed: EISDIR`; bb.phase=failed; mergeWake reports aa skipped with `EISDIR: illegal operation on a directory, read`; delivered merge prompts=[]. Expected the original phase error to remain visible and aa's B to be prompted, as required by criterion 7.
The read-only-file test passes because reading that log still works. Avoid making fully stamped queue ordering depend on diagnostic history, and prove the planned directory failure scenario. Do not silently replace needed legacy ordering evidence with an empty log.

## Verification

- `bun test --timeout=30000`: 432 pass, 0 fail, 20 files, exit 0.
- `bun run typecheck`: exit 0.
- `bun run format`: exit 0, every file unchanged.
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed=923c6c98fac3f051a54ac27168ea024215652602 --timeout=30000`: 290 pass, 0 fail, 4 files, exit 0.
- Three additional CLI probes above ran against the reviewed head using the existing fake Herdr boundary. Fixtures were cleaned in finally. Temporary probe deleted after recording results.
- No AREA.md files changed in this diff.
- Documented behavior changed: opened docs/guide/merge.md, next.md and the changed phase/state/limits pages, and followed docs/reference-index.md. The holder/refusal/stamp descriptions match the implemented intent. The one-attempt-per-pass promise is broken by F1 and the automatic wake promise by F2/F3.
- Existing acceptance tests exercise holder-only prompt, retained tabs/panes, guard before worktree access, stamp refresh and status ordering. The green suite does not cover F1-F3's failing scenarios.
- No operator actions or reusable held Nits.

## Test-Change trailers

- b5926eb: `Test-Change: tests/phase.test.ts added holder-guard and stamp coverage plus holder-order sequencing for the new one-holder-per-repo rule; no existing expectation weakened`
- f1060e2: `Test-Change: tests/next.test.ts added merge-turn holder dispatch and wake coverage; no existing expectation weakened`
- 91d2989: `Test-Change: tests/status.test.ts added TURN column coverage; no existing expectation weakened`

Judgment: paths match src/test-files.ts. Phase fixtures' sequential moves replace concurrent successful moves that contradict brief criteria 1/4 and plan D10, retaining completion/source coverage. Next changes add cases without removing expectations. Status columns add the brief's required TURN field. All trailers have sufficient cited outcome or added-only reason.


## 2026-10-05 check.repair

Read both initial reviews for b6f5e644c88e1a5f8bbc118cfa391a261843c97a. A recorded no Fixes. Repaired F1, F2 and F3. No operator actions and nothing handed to A. Final repaired head: e3bdb7d2e823873ae7a14bb449ffe256a2a97707.

### F1 repaired

Test commit: 17ca856. Fix commit: 9a2349d.
Added CLI test `a merge seat consumes only one failed delivery attempt per next pass`. The invocation now records each dispatched repo/slug/phase/slot, so the final sweep cannot dispatch the same seat again in that pass. A new phase has its own key.
Fail-before: `bun test tests/next.test.ts --test-name-pattern 'consumes only one' --timeout=30000` exited 1, expected attempts.B=1, received 2, 0 pass/1 fail.
Pass-after: same command exited 0, 1 pass/0 fail, 9 assertions. First and second passes keep merge with attempts 1 and 2. The third commits failed.

### F2 repaired

Test commit: 74e9e27. Fix commit: 46cf533.
Added CLI test `an idle hook advances past a capped holder after visiting its waiter`. It derives waiter/holder from the fixture directory listing, so the waiter is visited first regardless of filesystem order. A saved merge-to-failed move appends the current merge leaves to the sweep's work list. F1's invocation record prevents repeated attempts while new holders can proceed. Each failed leaf leaves the merge inventory, so advancement terminates.
Fail-before: `bun test tests/next.test.ts --test-name-pattern 'an idle hook advances' --timeout=30000` exited 1, holder reached failed but expected one waiter merge prompt, received [], 0 pass/1 fail.
Pass-after: `bun test tests/next.test.ts --test-name-pattern 'an idle hook advances|consumes only one' --timeout=30000` exited 0, 2 pass/0 fail, 17 assertions, including a second hook pass with no extra merge prompt.

### F3 repaired

Test commit: d21ffa5. Fix commit: e3bdb7d.
Added CLI tests `a saved holder failure wakes the stamped queue when the log is a directory` and `unstamped merge dispatch uses log order and refuses unreadable history`. Queue construction accepts a deferred log reader and invokes it only when an eligible merge leaf lacks its own stamp. Dispatch and phase guards defer reads. Status already needs history for display and passes its parsed log through the same interface. No error is swallowed and legacy ordering still requires readable history.
Fail-before: `bun test tests/next.test.ts --test-name-pattern 'saved holder failure wakes' --timeout=30000` exited 1, holder state saved as failed, expected waiter merge prompt, received [], 0 pass/1 fail.
Pass-after: `bun test tests/next.test.ts --test-name-pattern 'saved holder failure wakes|unstamped merge dispatch' --timeout=30000` exited 0, 2 pass/0 fail, 12 assertions. The original post-commit append error remains visible while the stamped waiter is prompted. An unstamped queue refuses unreadable history and then prompts the leaf with the earlier last-to-merge record when valid history is supplied.

### Required checks on repaired head

- `bun run format`: exit 0, every file unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 436 pass, 0 fail, 20 files, 4714 assertions, 23.43s.
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed=923c6c98fac3f051a54ac27168ea024215652602 --timeout=30000`: exit 0, 294 pass, 0 fail, 4 files, 2527 assertions, 16.68s.
- No merge_checks run in this repair pass.

### Done-criterion proof

1. Holder-only B prompt and waiter's retained tab/panes: existing CLI two-leaf test passed in both final test runs.
2. Holder and each queue place: status TURN tests passed. Additional CLI output below confirms three places.
3. Hand-built and unmerged-dependency exclusions: existing merge dispatch cases passed. Additional CLI probe allocated aa/bb/cc in merge, with earliest aa requiring absent file need.txt. `next --all` exited 0 and prompted only bb B. Probe used a file input and read no .env files.
4. Refused merged/merged --check/check.fix naming holder, failed allowed: phase CLI tests passed.
5. Refusal before worktree guards: phase test passed. The first-act merged --slot B --check instruction remains in skills/merge-issue/SKILL.md before rebase/checks.
6. All five holder-exit CLI cases passed, including redundant second-pass no-prompt checks. New F2 proof covers final-sweep failure with waiter listed first.
7. Both read-only append failure and new directory-log failure tests passed, preserving phase failure while delivering the next stamped holder prompt.
8. Re-entry progression test passed. Additional CLI probe supplied aa's missing file, moved aa to failed and back into merge, then `status` exited 0 and showed aa TURN=3, bb TURN=holder, cc TURN=2.
9. Last-to-merge ordering and no-record suffix status tests passed. New unstamped CLI dispatch test confirms earlier log-record holder gets the prompt.

Additional probe terminal output:

```text
Criterion 3: missing-file aa is excluded; only bb B prompted.
repo
  LEAF   PHASE  AGE  BLOCKED BY  NOTE                         TURN
  issue
     aa  merge  0m               busy A 0h00m                 3
     bb  merge  -                busy A 0h00m · busy B 0h00m  holder
     cc  merge  -                busy A 0h00m                 2
```

Fixtures cleaned in finally, temporary probe deleted, worktree clean. Each new test commit includes its exact tests/next.test.ts Test-Change trailer stating added regression coverage and no changed existing expectation. No existing assertion was removed or weakened. No held reusable Nits to record.


## 2026-10-05 merge

Initial `akrogon phase merge-turn-order merged --slot B --check`: ok. Worktree clean. No held reusable Nits. Readiness has no required inputs or mutation grants.

Rebase target: origin/main, 878d7169004fcba9de73c05b3eb2dac7e4425a06. Prior reviewed/repaired head: e3bdb7d2e823873ae7a14bb449ffe256a2a97707. Resolved head: 1edd0c0b02fa8094f62eb04225b2a624cfa94c01. One conflict in skills/merge-issue/SKILL.md: preserved main's removal of merge-pass Nit recording (now owned by nits-before-merge) and this leaf's first-act turn check. All code and test commits replayed unchanged. AKROGON_BASE refreshed to the rebase target.

`git range-diff 923c6c98fac3f051a54ac27168ea024215652602..e3bdb7d2e823873ae7a14bb449ffe256a2a97707 878d7169004fcba9de73c05b3eb2dac7e4425a06..1edd0c0b02fa8094f62eb04225b2a624cfa94c01`:

```text
 1:  ad417e0 =  1:  222e906 merge turn: state stamp field, shared log reader, turn module
 2:  d70de8c !  2:  d919b92 merge turn: docs and skill first-step check
    @@ docs/guide/state.md: That prevents later dispatch. It does not stop an agent alr
      ## skills/merge-issue/SKILL.md ##
     @@ skills/merge-issue/SKILL.md: The merge seat reuses `grants[]` for probes, implementation, repairs, reruns, me
      
    - Turn a Nit B still holds and finds reusable into one line naming mechanism/date/history in the registered checkout's `learnings/LESSONS.md` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn.
    + ## merge
      
     +The first act of the pass is `akrogon phase <slug> merged --slot B --check`; each registered repo holds one merge turn, and a leaf still waiting its turn is refused there naming the current holder, before any check or rebase runs, ending the prompted pass.
     +
 3:  37628cc =  3:  a89528d merge turn: holder guard, merge stamp, committed-move error
 4:  cbd5c0e =  4:  1147b40 status: TURN column naming merge holder and places
 5:  5e0dba7 =  5:  4653756 merge turn: holder-only dispatch and post-move wake
 6:  b5926eb =  6:  8bf7db4 phase tests: merge holder guard, merge_stamp coverage, holder-order sequencing
 7:  f1060e2 =  7:  81f542d test: merge-turn holder dispatch and wake paths in next.test.ts
 8:  91d2989 =  8:  ab447ac test: cover TURN column ordering in status overview
 9:  b6f5e64 =  9:  07d7548 format: prettier output
10:  17ca856 = 10:  e1bb1ed test: reproduce duplicate merge delivery attempts per pass
11:  9a2349d = 11:  922d603 fix: dispatch each seat once per phase per pass
12:  74e9e27 = 12:  f366024 test: reproduce missed wake after final-sweep holder failure
13:  46cf533 = 13:  fa091dc fix: revisit waiting merge leaves when a holder fails
14:  d21ffa5 = 14:  a45ab2e test: reproduce post-commit wake blocked by unreadable history
15:  e3bdb7d = 15:  1edd0c0 fix: read merge history only for eligible unstamped leaves
```


Merge checks on resolved head 1edd0c0b02fa8094f62eb04225b2a624cfa94c01:

- `bun run format`: exit 0, all files unchanged.
- `bun test --timeout=30000`: exit 0, 442 pass, 0 fail, 20 files, 4734 assertions, 23.87s.
- `bun run typecheck`: exit 0.
- `AKROGON_BASE=878d7169004fcba9de73c05b3eb2dac7e4425a06 bun test --changed=878d7169004fcba9de73c05b3eb2dac7e4425a06 --timeout=30000`: exit 0, 294 pass, 0 fail, 4 files, 2527 assertions, 16.35s.
- No configured merge_checks or advisory commands.
- Worktree clean, skill first-act guard present and removed Nit step remains removed.
- Gathered all five completion-owner epic leaf briefs before the merged move: merge-turn-order, merge-batch, record-only-reuse, nits-before-merge and check-setup.

Final `akrogon phase merge-turn-order merged --slot B --check`: ok. `git push origin HEAD:main`: exit 0, fast-forward 878d716..1edd0c0. Fetch and `git merge-base --is-ancestor 1edd0c0b02fa8094f62eb04225b2a624cfa94c01 origin/main`: exit 0, intended head confirmed landed.

Completion command: exit 0, printed only `moved merged`. No issue complete or epic complete line, so no broadcast was invoked.
