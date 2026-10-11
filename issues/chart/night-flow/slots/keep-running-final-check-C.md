# Final-shape check, slot C: keep running

Read 2026-10-11. Disagreements and missing pitfalls only. Q1 shape: no disagreement. Scope item 2 and the committed-only boundary in item 3: agreed, with one correction each below.

## F1 Item 5 cites the wrong mechanism, conclusion stands
`src/phase.ts:614-625` clears `tested_top`/`tested_main` in the saved state only. The refusal returns the in-memory `record` untouched (`:626`), and `finishPush` passes that same `pending.record` into `restack` (`:882`), whose reuse check reads `record.tested_main`/`tested_top` (`:660-669`) and compares with `equalOutsideRecordFolders` and `recordConfigEqual`. So a records-only main move keeps the test result through reuse inside the same seat run, not through the clearing. The clearing bites only when the seat process stops between the refusal and the restack: the next run reads state and re-checks in full. Write item 5 as: reuse in-process, full re-check only after a process death. Cite `:626,:660-669,:882`.

## F2 Item 4's checkout move cannot be today's fast-forward
After the replay, the pushed commit is not a descendant of local HEAD (the local record commits were rewritten), so `git merge --ff-only` at `src/self-update.ts:51-53` refuses it every time. The move needs `git reset --keep <pushed>`, which keeps uncommitted edits and aborts when a dirty file differs between HEAD and the target (git reset documentation, model-knowledge, high confidence). The "fast-forward refused" line (`self-update.ts:58`) can keep its wording. Name the command in the leaf so A does not reach for `--ff-only` or `reset --hard`.

## F3 Missing pitfall: an aborted replay must leave nothing behind
Item 6 says a two-sided record conflict stops integration and retries next pass. The replay runs off the working tree (item 4), so it runs in a temporary worktree. On conflict the leaf must `git rebase --abort` and `git worktree remove --force` that worktree before returning the line, or the next pass finds a rebase in progress and a stale entry in `git worktree list` (B Q4 asks exactly this). Place the temporary worktree where S3 places base copies, `~/.akrogon/scratch/<repo>/`, never under the repo root.

## F4 Missing pitfall: leaf branches forked from a rewritten local commit
A leaf worktree created while local main held an unpushed record commit has that commit in its history. After the replay, main carries the same patch under a new SHA. At merge, `buildStack` rebuilds the stack onto `trackingRef` (`src/phase.ts:642-656`). Whether the already-applied record patch is dropped or replays as an empty or conflicting commit depends on how `buildStack` applies members (LC, not read). Verify in the leaf with one test: fork a branch from a local-only record commit, integrate, then merge the branch.

## F5 Scope item 2: fetch cost moves from one repo to all
`self-update.ts:19` is the only thing that limits the step to akrogon. Removing it makes every `--all` and `--resume` pass fetch every registered repo (`src/next.ts:1541-1543` loops `updating`), and every hooked event pass fetch its one repo. That is the same shape akrogon has today, one fetch per pass per repo, so it is safe. The release workflow confirms the committed-only boundary: `~/Work/infra/tamdoma/framework/.github/workflows/release-branch.yml:3-5` runs on every push to main, so integrating record commits causes exactly the releases the handoff push already causes, and committing dirty records per pass would add one release per pass. Item 3 reads the operator right.

## F6 Lock order in item 7 is already the code's order
No disagreement, for the record: `selfUpdate` runs before the pass takes the global `.lock` (`src/next.ts:1541-1543` precedes `:1555`) and before `mergeWake` takes it (`:1382` precedes `:1383`), so install lock outside, global `.lock` inside, same as the fast-forward today (`self-update.ts:51-53`).
