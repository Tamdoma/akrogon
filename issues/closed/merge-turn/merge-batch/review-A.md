# Review A: merge-batch

Base `1edd0c0`; reviewed head `a06e0f8` (8 commits, ~2200 insertions). Verification evidence: `bun test` 472 pass 0 fail, `bun test --changed` 324 pass 0 fail, `bun run typecheck` clean, `bun run format` applied and committed — all run on the reviewed head this session. AREA.md path check: every file `src/AREA.md` names exists.

## Verdict: fix

## Fixes

### F1: a capped holder failure no longer wakes the next leaf in the same pass

- Source: real dispatch — `dispatchSlot`'s `recordFailure` calls `commitMove(..., 'failed')` inside `mergePass` when the third prompt attempt fails, or `unreachable` on a dead pane. The same sequence the merge-turn tests exercise (three `agent_prompt_stalled` responses).
- Defect: `mergePass` returns after its single `dispatchLeaf` for the holder. Before this leaf, `sweep` revisited merge leaves in the same pass via `ordered.push(...)` (added by `f366024 fix: revisit waiting merge leaves when a holder fails`); U2 deleted that block as dead, but the failure site moved with it into `mergePass` and no equivalent revisit exists there.
- Consequence today: when the holder's dispatch caps out, the queue stalls until an unrelated `akrogon next`/`phase` event arrives — a stuck pane blocks the whole repo's merge turn for an arbitrary delay instead of one pass.
- Gap: turn-release Q1 1a states "when a pass commits a capped failure, the same pass reconsiders the next holder" and the merge-turn-order done-criteria require each of the five holder-exit paths to prompt the next leaf's B without a manual `next` — capped prompt failure is one of the five. The updated tests pass because `f1bd1cd` added an extra `next` call (its trailer admits this: "capped-holder paths gain one extra next pass"), weakening the criterion instead of preserving the mechanism.
- Expected: `mergePass` loops back to the queue recomputation after holder dispatch so a phase change (failure by any path, or a completed move) advances the queue in the same pass.

### F2: `applyStack`/`restoreMembers` `reset --hard` destroys uncommitted worktree changes

- Source: a real user/agent action — an uncommitted file or a mid-rebase resolution inside a merge worktree. The suite already treats this as a supported state (`tests/next.test.ts` 'uncommitted work in a merge worktree is left to the merge seat'); a carried member's pane and tab stay live while it waits (design merge-order Q2 2a), so its seat or the operator can legitimately hold dirty work at apply time.
- Defect: `src/batch.ts`'s `move()` runs `git -C <worktree> reset --hard <tip>` unconditionally whenever `leaf.state.worktree` is set. `applyStack` in `mergePass` does this to every member and the holder; `restoreMembers`/`restoreDrifted` do it on every restore path (dissolve, reconcile, interrupted-build, holder-conflict).
- Consequence today: silent destruction of uncommitted work — data loss — in a state the system deliberately supports.
- Gap: brief criterion 11 (a partial run leaves nothing live changed in a way that harms the seat) and the established uncommitted-work invariant. Fix by checking `git -C <worktree> status --porcelain` before each reset: a dirty member is restored/skipped and marked `solo` like a conflict drop; a dirty holder takes the `solo` record path; on restores, a dirty worktree keeps its files while `update-ref` restores the branch.

### F3: `restack`'s locked apply resets members that already left `merge`

- Source: real concurrency — a member is moved to `failed` (seat call or operator) during the unlocked restack build inside `akrogon phase <holder> merged --attempt` after a refused push.
- Defect: in `src/phase.ts` `restack`, the locked apply block maps every recorded member into `appliedMembers` via `findLeaf` and calls `applyStack` on all of them — no `phase === 'merge'` filter. `mergePass`'s apply (`src/next.ts`) filters to members still in `merge`; `batchPush`'s pre-push check refuses when any departed. The restack window skips the equivalent check entirely.
- Consequence today: a member the operator just failed gets its branch `update-ref`'d or its worktree `reset --hard` to a stack it is no longer part of — moving a departed member's branch and (combined with F2) clobbering its worktree state.
- Gap: brief step 6's member-departure rule ("any member leaving `merge` during the run means no push, and the batch dissolves") and criterion 4; the departure must stop the apply, not just the push. Filter the apply list to still-in-`merge` members and refuse/dissolve on a detected departure as `mergePass` does.

### F4: `batchPush` pushes the worktree HEAD instead of the recorded top for applied records

- Source: a real user action — the operator (or a stray agent) commits inside the holder's worktree after the stack is applied, then runs `akrogon phase <holder> merged` without `--slot`. The operator path intentionally skips the attempt and `tested_top` gates.
- Defect: `batchPush` computes `head` via `mergeHead` and pushes `${head}:refs/heads/<default_branch>`. For a non-`solo` record, `record.top` is the applied, checked stack — `head` can diverge from it by exactly one unreviewed commit, which then lands on the default branch under the command's authority. `--check` saves `tested_top` = HEAD, so a B call can't diverge, but nothing in the no-slot path compares `head` to `record.top`.
- Consequence today: an unchecked commit can be pushed to `main` as part of a batch — the standing design's named data-loss case ("a push of an unchecked top").
- Gap: brief step 6 (push the tested top) and the command-owned push contract; for a non-`solo` record the pushed object and `candidate` should be `record.top`, not `head`.

### F5: `mergeNotice` fires on every pass while a pushed holder stays `failed`

- Source: real dispatch — `akrogon next` runs on every Herdr hook event and `watch-issues` on a 20-minute cron; each pass hits `reconcileBatch` on the failed holder's kept record.
- Defect: in `reconcileBatch`'s landed branch, `holderNow.state.phase === 'failed'` calls `mergeNotice` unconditionally each time the pass runs while the record survives — which is until the operator moves the leaf back to `merge` (the whole point of the notice).
- Consequence today: the operator gets a duplicate desktop notification on every pass until acting — the design calls for "a notice" (brief step 9, criterion 14) and the codebase already one-shots comparable operator signals (`busy_notified`).
- Gap: brief step 9 ("gets a notice") as one-shot semantics; fix by recording that the notice was sent (e.g. a flag or `delivery`-style field on the record) and suppressing repeats.

### F6: no test covers criterion 15 — a solo leaf leaving `merge` and returning is carried

- The leaf's own criterion 15 ("a solo-marked leaf that leaves `merge` and returns is carried in the next batch") has no test. The mechanism is `commitMove`'s `solo: to === 'merge' ? recorded.solo : undefined` line plus member selection filtering on `state.solo` — no existing test would fail if either regressed (the re-entering test in `next.test.ts` never sets `solo`).
- Missing-test Fix: the scenario is a solo-marked member (conflict or dissolve), its move out of `merge` (`failed` or `check.fix`), re-entry, then membership in the next batch record.

## Nits

- N1: `restack` resolves the holder head with `git rev-parse refs/heads/<slug>` via `command` — a branchless holder throws an uncaught `CommandError` mid-restack instead of the `applied:false` reconcile path. Only reachable for a record applied before any holder branch existed (fixture-level), so a Nit: a defensive `run`+fallback would keep the error message honest.
- N2: `phase <holder> check.fix --check` on a record holder routes through `batchCheck` (merged-style checks + `tested_top` write) rather than `check.fix`'s own guards — a check-only call mutates `tested_top`. Harmless today (checkOnly forbids moves) but worth a comment or a dedicated branch.
- N3: `batch.test.ts` timed out once at 30 s under heavy parallel load in a shared suite run; green in isolation and every subsequent run — recorded here so a repeat is investigated rather than shrugged off.
- N4: `mergePass`'s member loop computes `mergeQueue` twice (`queue[0]` check plus `.slice(1)` members) — cosmetic.

## Notes for B

- Trailer check: `Test-Change:` trailers on `7f6c051`, `f1bd1cd`, `a06e0f8` reviewed — each cites a real source (design steps, criteria, or format-only) consistent with the diff.
- The docs/skill rewrite matches shipped strings (`fresh checks required <sha>`, `fresh checks required rebase <slug> onto <sha>`, `batch dissolved, merge solo`, prompt `attempt=<id> top=<sha>`/`solo`) verified against `src/phase.ts`/`src/next.ts` output.
- Worker-noted limitation (batch worktree dirt under `applyStack` when `top === holderHead`) is covered by F2.
