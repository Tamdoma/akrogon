# turn-release, merged round (A, B, C)

Sources: slots/turn-release-A.md, -B.md, -C.md.

## Q1. What prompts the next holder?
- 1a (A,B,C recommended): one level-based rule (C, Kubernetes API conventions "level-based rather than edge-based"): every `akrogon next` pass and every `akrogon phase` move ends by asking "who holds this repo's turn now, and is that seat prompted?" and prompts it if not. A busy or already-prompted seat is skipped (`src/next.ts:483-492`), so duplicate passes deliver nothing twice (B,C). Covers all five exits (merged, check.fix, seat failed, dispatch failed, operator move) and any future path. `akrogon phase` must be included because an operator move from a plain shell fires no pane event (C); A's first form (unowned-pane hook) does not cover that and is withdrawn. The wake runs after the move's short state write, outside any enclosing global lock (B, `src/phase.ts:330-333`, `src/state.ts:139-158`). If the new holder's prompt fails three times it goes `failed` in the same pass and the rule picks the next one (C, `src/next.ts:459-465`). Cost: `akrogon phase` gains a prompt step and can report a prompt failure after the move is saved; `next.ts` imports `phase.ts` (`src/next.ts:55`), so the shared step must sit where both can call it without a cycle (A).
- 1b (A,B,C): a wake on each exit path. Cost: a missed path stalls the line with no error.
- 1c (A,B,C): operator runs `akrogon next`. Cost: merges stop while the operator is away.

## Q2. Hung holder, and holder leaving mid-batch
- 2a (A,B,C recommended): no clock, command cleans up, operator decides "hung".
  - Cleanup is part of the Q1 rule (C): a batch record whose holder is no longer in `merge` is reconciled. Fetch; if the tested top is on main, restore nothing and finish members by the existing ancestry test (`skills/merge-issue/SKILL.md:49`); if not, restore every member to its saved base and head, no solo marks, clear the record. A failed fetch restores nothing and reports (B,C).
  - Zombie publisher (B): a `failed` label does not prove the old holder's process stopped. A (new, for rebuttal): the command-owned pre-push check already refuses unless every member is in `merge` (taken shape); extend it to the holder too, checked under the lock right before the push. A late push from a stopped-but-alive process is then refused, so cleanup never needs proof that a process stopped.
  - Silent hang: `akrogon status` names the holder (taken). C adds a notice when a leaf enters `merge` behind a holder, naming the holder and the queue length. Operator stops the agent and runs `akrogon phase <slug> failed --reason ...`; cleanup and wake follow.
  - Holder failed after its push (C): code on main, phase `failed`, and `failed` cannot go straight to `merged` (`src/routing.ts:37-50`). The failure notice says so; operator moves it back to `merge`, where the ancestry test finishes it without a run.
  - Cost: a silent hang blocks all merges in that repo until the operator looks. Larger than before the turn (C).
- 2b (C): time limit on the holder (GitLab "did not complete in time", bors `timeout_sec`). Cost: reopens the 2026-09-18 no-clock lock.
- 2c (C) / B's 2b: seats or the operator restore leftover branches by hand. Cost: manual state repair, or a seat working in other leaves' worktrees.

## Q3. Where does a returning leaf rejoin?
- 3a (A,B,C recommended): new stamp on every move into `merge`, back of the line. Under batching the back costs at most one run. Applies to review-to-merge, repair-to-merge and operator recovery into merge (B). Never inserted into an already-recorded batch (B). GitLab drops a failed MR from the train and it re-enters as new (C).
- 3b (A,B,C): keep the first stamp. Cost: extra field, and a repeatedly red leaf tops every batch.

## Done-criteria (B,C)
- Two leaves in `merge`: moving the holder out by each of the five paths ends with the other leaf's B prompted, no manual `next`; a second pass prompts nobody.
- Failing the holder mid-run leaves every carried branch at its saved head and prompts the next leaf; failing it after the push restores and reruns nothing.
- A returning leaf with two waiting is listed third by `akrogon status`.

## Challenge check
- Every merge queue read uses a timeout (C). 2a keeps the no-clock lock and accepts that a hang blocks the repo until the operator acts.

## After rebuttals
- Zombie publisher (B F1, C, agreed): A's pre-push check alone leaves a gap because today the seat runs the check (`akrogon phase ... merged --check`, `skills/merge-issue/SKILL.md:47`) and then its own `git push` (`:49`) after the lock is dropped (`src/phase.ts:330-334`). Fix that removes the class: the command owns the push. Under the lock it confirms the batch record's attempt id is still current, the holder and every member are still in `merge`, then pushes the recorded top. A seat never runs `git push` for a batch. A late call from an old attempt is refused by attempt id, even if its members later re-entered `merge` (B). Cost: the global lock is held for one push, seconds.
- Stack writes (B F2, accepted): every command-owned branch write of a batch (stack build result, restore) is applied under the lock and checks the attempt id, so an old attempt's unfinished rebase cannot overwrite a restore. Rebase work itself may run outside the lock on a detached checkout; only the ref updates are fenced.
- "Proven stopped" (B withdrew, C rejected): not required. A local command cannot prove an agent stopped, and fencing makes it unnecessary.
- Prompt retries (B F3, accepted): the existing policy counts one delivery attempt per pass across passes (`src/next.ts:436-468`). When a pass commits the capped failure, the same pass reconsiders the next holder. "Three times in the same pass" is withdrawn.
- New done-criterion (C): after the holder is failed and cleanup ran, a push attempt from the old seat does not change main.
