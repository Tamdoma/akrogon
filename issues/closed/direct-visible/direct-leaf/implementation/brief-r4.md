# Repair brief R4: keep pending broadcast resources for reviewer replacement

## 1. Goal

Fix only F9 under plan C-D13a, brief criterion 8 and design 13–14.

## 2. Numbered acceptance criteria

1. Before broadcast acknowledgement, retain worktree, temp and slice even when B is gone. Repointing B and running next sends the broadcast with resources still held.
2. After acknowledgement, keep the existing release when B advances or disappears, using B's recorded session. Lifecycle behavior stays unchanged.

## 3. Read-first list

Read review-B.md and plan.md at /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/ (F9/C-D13a), src/reconcile.ts broadcastInProgress, src/state.ts broadcastPending, tests/direct-land.test.ts's replacement case, and /home/ivan/.pi/agent/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Own only src/reconcile.ts. Use the existing broadcastPending guard before the direct-seat branch, then remove its redundant occurrence in the managed branch. A has committed the reproduction. Single repair wave, no other dependencies or shared test resources.

## 5. Do-not, reasons and exceptions

No test edits, unrelated cleanup, full verify, issue-state edits, stash, or process-pattern kills. Return a mismatch and evidence if the existing reproduction is wrong. If WIP commits are needed, squash the returned work to one product commit based on the creation SHA.

## 6. Ordered steps

Install using the locked setup, move the guard, run the targeted commands, and report. Expect one file and under ten turns.

## 7. Commands

- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`
- `akrogon run-check --name r4-replacement -- bun test tests/direct-land.test.ts --timeout=120000 -t 'a pending broadcast keeps cleanup held for a replacement reviewer'`
- `akrogon run-check --name r4-reconcile -- bun test tests/reconcile.test.ts --timeout=120000`
- `bunx prettier --check src/reconcile.ts`

## 8. Done-when, evidence and report

One product commit and worker-report.md in the worker worktree, with the kept check lines and these fields.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit: 4ad80f82a42ec9ffb312e5b0b81a304fd13f9182. Worktree: /home/ivan/.akrogon/worktrees/akrogon/direct-leaf-u1.
