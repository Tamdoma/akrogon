# Brief 4 (repair): integrate batch semantics into merge/phase tests + two small code fixes

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u4

## 1. Goal

The U2+U3 integration left 11 failures in `bun test --changed`: two small code defects for branchless/worktree-less leaves, and pre-existing tests written for sequential (non-batched) merges. Repair so `bun test --changed` and the named files are green without weakening what the tests verify.

## 2. Failures and required outcome

Current failures (run `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed=$AKROGON_BASE --timeout=30000` to confirm):

A. `tests/phase.test.ts` — 'completion prints only when the owner finishes…', 'completion leaves a chart…', 'asymmetric and empty leaf sources defer until epic completion…', 'an earlier merge_stamp takes the turn over slug order', 'merge turn refusal names the holder…'.
B. `tests/next.test.ts` — 'next recovers only merge-phase work by ancestry against a non-default remote target', 'a live merge retains its completion call after pushing, including a peer retry', 'a leaf re-entering merge queues behind the two leaves stamped earlier'.
C. `tests/batch-dispatch.test.ts` — 'a leaf entering merge after the record was written…', 'a member conflict marks it solo…' (both fail at `phase <holder> merged --slot B` code 1: stale attempt).
D. `tests/batch-merge.test.ts` — 'a red check.fix restores members, marks them solo, keeps the holder in merge and the solo red moves it' (`state.batch` is a fresh memberless record, not undefined).

## 3. Code fixes (do these exactly)

F1. `src/next.ts` ~line 942-956: when building the record, a leaf whose branch does not exist (`branchSha` returns undefined) must not abort the whole batch. Set member `head` to `localBase(repo)` (with `base = head`) instead of skipping the member, and for the holder use `holderHead = (await branchSha(repo, slug)) ?? builtOn` instead of the 'Missing branch for merge holder' report-and-return. Branchless leaves are zero-diff members/holders — the empty-range path in `buildStack` handles them. Keep `applyStack`'s `update-ref` path: it creates the missing branch at apply time.

F2. `src/phase.ts` `batchCheck` and `batchPush` (~lines 383-388 and 433-438): the `state.worktree === undefined` HEAD resolution `git rev-parse refs/heads/<slug>` throws when the branch does not exist yet (record applied with `top == holderHead` skips `applyStack`, leaving no branch). Resolve: use `run` not `command`; on nonzero, fall back to `record.top` (a worktree-less, branchless holder is definitionally at the recorded top — the apply produced it). Keep the worktree `HEAD` path unchanged.

Do not change anything else in `src/`.

## 4. Test repairs

T1. `tests/phase.test.ts` completion tests (the three failing owner-completion tests + 'an earlier merge_stamp'): these tests assert sequential merge completion bookkeeping — that is still valid, but each leaf must not be carried in the prior leaf's batch. Add `solo: true` in the `leaf(f, …, 'merge', { … })` extra object for every merge leaf that must merge separately (in these tests: all of them). `solo` excludes a leaf from carried membership; each still gets its own record and its own `phase <slug> merged` push. Verify each `phase <slug> merged` (no slot, operator path skips attempt/tested_top gates) exits 0.
   'merge turn refusal names the holder…': `phase aa merged --check` runs the batch check on a worktree-less holder; with F2 it resolves to `record.top` and prints `ok`. Keep the assertion. The trailing `phase aa merged` (no slot) pushes the memberless record. Only adjust if F2 changes observed output; report what you saw.

T2. `tests/next.test.ts`:
- 'next recovers…non-default remote target' and 'a live merge retains its completion call…': the test simulates a seat that already pushed and calls `phase <slug> merged --slot B`. Under batching the seat pushes via the command, so the correct call is `phase <slug> merged --slot B --attempt <id>` where `<id>` is read via `readState(path).batch.attempt` (the record exists because an earlier `next`/`mergeWake` wrote it; if in doubt run a bare `next` first). The pushed-HEAD == record.top path pushes 'Everything up-to-date' (code 0) and proceeds to moves. Keep all existing assertions.
- 'a leaf re-entering merge queues behind the two leaves stamped earlier': `cc` merging carries `aa` (it re-entered `merge` before `cc`'s record was written). Expected prompts become `[aa.b, bb.b, cc.b]` (3), and `readState(aa.path).phase` is `merged` after `cc` merges — `aa` lands as a carried member, which is exactly the queued-behind outcome the test asserts. Add a comment naming the design: carried members are not re-prompted (merge-order Q2, brief criterion 12). Keep stamp-order assertions.

T3. `tests/batch-dispatch.test.ts` two failures: both call `phase aa merged --slot B` — a stale-attempt refusal since B calls must carry `--attempt`. Change to the real seat sequence: `phase aa merged --slot B --check --attempt <id>` then `phase aa merged --slot B --attempt <id>` with `<id>` from `readState(path).batch.attempt` (capture after the batch is applied). Keep surrounding assertions.

T4. `tests/batch-merge.test.ts` red-dissolve test: after `check.fix` prints `batch dissolved, merge solo`, the post-call `mergeWake` immediately writes a fresh memberless record for the still-in-merge holder — correct per the brief ("the holder gets a fresh solo pass"). Replace `expect(holderState.batch).toBeUndefined()` with assertions on the new record: `members: []`, `attempt` different from the dissolved one, plus existing phase/`solo`/restored-head assertions. Keep the rest.

## 5. Do-not

- No weakening: keep every assertion that still matches the design; only re-sequence calls and update expectations the design itself changed (batch prompts carrying `attempt`, members merging with the holder, fresh record after dissolve). Cite the design point in each commit trailer.
- Do not touch `src/batch.ts`, `src/state.ts`, `src/turn.ts`, `src/akrogon.ts`, skills or docs.
- Every commit touching an existing test file carries `Test-Change: <path> <source and reason>`; the two src fixes may share one commit or split sensibly — a commit containing only src changes needs no trailer; batch tests/phase test updates can be one commit each.
- `bun test tests/batch.test.ts` is green standalone; its earlier 30s timeout under parallel load is not a defect — do not add retries or timeouts.
- If a failure's real cause turns out to be a code defect beyond F1/F2 (not a stale assumption), fix the code and show fail-before/pass-after; return a mismatch instead of weakening a criterion.

## 6. Ordered steps

Advisory: 6 files, under 35 turns.

1. F1, F2; run `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts tests/phase.test.ts tests/next.test.ts --timeout=30000`, note which failures remain.
2. T1-T4 per file; iterate until those four files are green.
3. `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed=$AKROGON_BASE --timeout=30000` green; `bun x tsc --noEmit` clean.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Green changed-tests run pasted; per-fixture list of what each test update preserves. Commit(s) on the worker HEAD, return commit id(s).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
