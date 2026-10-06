# Handoff review, slot C

Read every draft under `scratchpad/drafts/merge-turn` (ISSUE.md and the five leaves) and checked them against the code at `923c6c9`. Disagreements and gaps only. Each has evidence and a replacement line. Code anchors I checked and found correct are not listed.

## check-setup

**S1 · `advisory` commands are left out with no stated reason.** `advisory` is a third list of commands that seats run in the worktree (`src/config.ts:37`, `skills/init-akrogon/SKILL.md:20`, `skills/implement-issue/SKILL.md:68`). An advisory command run first in a new worktree still borrows the registered checkout's packages. The binding text names only `checks` and `merge_checks`, so this needs a home or an exclusion.
Replacement, brief What: "…prints every `checks`, `merge_checks` and `advisory` command as the locked install followed by the command." If the operator wants the binding text kept literal, add to the design instead: "Excluded: `advisory` commands print unchanged. A seat runs them after `checks`, so the install has already happened."

**S2 · The `sh -c` interface marked (A, to confirm in review) is needed, not optional.** `flock <file> <command> <args>` runs one program. A `setup` such as `bun install --frozen-lockfile && bun run build` would run its second half outside the lock, and a `setup` with a pipe would break the line. `shell-quote` is already used to parse launch lines (`src/next.ts:240`).
Replacement, design: "Printed form: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup quoted with shell-quote> && <check>`. The whole `setup` string always runs inside the lock."

**S3 · Criterion 1 names a place the composition does not depend on.** `effectiveConfig` prints the repo's lists from any directory inside the repo, not only a leaf worktree (`src/config.ts:152-170`).
Replacement, criterion 1: "With `setup` set, `akrogon config` prints each `checks` and `merge_checks` command as the locked install followed by that check, from the registered checkout and from a leaf worktree. With `setup` absent it prints them unchanged."

## nits-before-merge

**N1 · "Before its own move into `merge`" is not a moment B can see in check.review.** In check.review B records a verdict and the command picks the destination from both seats' verdicts (`src/phase.ts:246-250`). If B records first, the move happens on A's call. If B says ok and A says fix, the leaf goes to `check.repair` (`src/routing.ts:32`), where B would record the same Nits a second time.
Replacement, criterion 1: "`skills/check-issue/SKILL.md` tells B to record held reusable Nits (a) in check.review, before it records a verdict that is not `fix`, and (b) in check.repair, before its move to `merge`, recording only Nits it has not already written for this leaf. Both write to the registered checkout's `learnings/LESSONS.md` with a history file, left for the operator to commit."

**N2 · Both this leaf and merge-turn-order edit `skills/merge-issue/SKILL.md` with no order between them.** Both have `blocked-by: []`. This leaf removes the first paragraph of `## merge` (`skills/merge-issue/SKILL.md:35`) and merge-turn-order adds lines to the same section.
Replacement, merge-turn-order `state.yaml`: `blocked-by: [nits-before-merge]`. It costs nothing, since this leaf is prose only.

## merge-turn-order

**T1 · Holder selection cannot live in `src/next.ts`.** The guard in `phaseCommand` needs it, and `next.ts` imports `phase.ts` (`src/next.ts:55`), so `phase.ts` cannot import it back. `src/status.ts` needs it too. The pieces it uses are private to `next.ts` today (`discover` at `:97`, `lookup` at `:175`).
Replacement, design Owned: "holder selection in a module that `src/next.ts`, `src/phase.ts` and `src/status.ts` can all import without a cycle (for example a new `src/turn.ts` built on `src/readiness.ts` and `src/state.ts`), with the eligibility test taken from `dispatchLeaf` (`src/next.ts:585-619`)."

**T2 · "Operator moves (no `--slot`) are never refused" cannot be told apart from seat moves.** From `merge` the command fills in slot B when `--slot` is missing (`src/phase.ts:211-212`), and nothing stops an operator typing `--slot B` or a seat leaving it out. The guard as drafted also refuses `failed`, which the operator and a seat's operator-blocker stop both need for a waiting leaf (`skills/merge-issue/SKILL.md:27`, `src/phase.ts:216-224`).
Replacement, criterion 4: "For a leaf in `merge` that is not the holder, `akrogon phase <slug> merged` (with or without `--check`) and `akrogon phase <slug> check.fix` are refused and name the holder. A move to `failed` is never refused."
Replacement, design: delete "Operator moves (no `--slot`) are never refused by the guard."

**T3 · The binding "holder check at the start of the merge pass" has no home.** The turn-order rebuttal line says the check runs at the start of the pass and in `merged --check`, so a waiting seat that is prompted by hand stops before a 35-minute run. The draft only guards the move.
Replacement, new criterion: "`skills/merge-issue/SKILL.md` makes `akrogon phase <slug> merged --slot B --check` the first step of a merge pass, and on a waiting leaf that call is refused before any check runs."

**T4 · Criterion 7 does not say where the fallback is observed.**
Replacement, criterion 7: "Two leaves in `merge` with no merge stamp are listed by `akrogon status` in the order of their last `to: merge` records in `issues/log.jsonl`, and the earlier one is prompted."

## merge-batch

**B1 · The command cannot know the tested top by itself.** The draft has the command check "the worktree HEAD equals the recorded top". The holder's seat can add commits after the stack is built: scoped outstanding changes (`skills/merge-issue/SKILL.md:37`), a trailer commit after a `--check` refusal (`:47`), and a conflict resolution when it merges solo (`:41`). The stack top recorded at build time is then not what was tested.
Replacement, design Holder interface: "After green checks B runs `akrogon phase <holder> merged --slot B --check`. Under the lock this records the worktree HEAD as the tested top for the current attempt. B then runs `akrogon phase <holder> merged --slot B`. The command verifies HEAD still equals the tested top and the attempt id is current, pushes, and moves the members and then the holder."

**B2 · Red has no interface.** Brief step 6 says "nothing moves, every member is restored", but the seat is the one that sees the red, and the only red exit today is `akrogon phase <slug> check.fix --slot B` (`skills/merge-issue/SKILL.md:43`, `src/routing.ts:35`). Nothing says what the seat calls for a red batch.
Replacement, design (A, to confirm in review): "On red checks B runs `akrogon phase <holder> check.fix --slot B`. When the current batch has carried members, the command restores every member, marks each solo, moves nobody, leaves the holder in `merge` and prints `batch dissolved, merge solo`. When the batch is the holder alone, the move goes to `check.fix` as today."
Replacement, criterion 3 first clause: "On a red batch the holder's `check.fix` call pushes nothing and moves nobody, and every member ends at its saved base and head marked solo."

**B3 · Nothing says which command call starts the turn, or what happens if the stack build is cut off.** `nextCommand` does all its work inside the global lock (`src/next.ts:774`), and the build must run outside it. A pass that dies between the record write and the last rebase leaves a record with a half-built stack.
Replacement, design: "The pass that is about to prompt a holder with no current batch record writes the record, builds the stack, and only then prompts. A pass that finds a record whose build did not finish restores every member and builds again under a new attempt id."
New criterion: "A pass interrupted during the stack build leaves no member on a half-rebased branch after the next pass, and the holder is prompted only after the build finishes."

**B4 · Criterion 6 names something a seat never sends.** In the holder interface the seat passes no attempt id. The observable fact is that the old seat's command is refused.
Replacement, criterion 6: "After that cleanup, `akrogon phase <old holder> merged --slot B` from the old seat is refused and the remote default branch is unchanged."

**B5 · Criterion 10 is not observable inside akrogon.** The broadcast is a skill action by the seat (`skills/merge-issue/SKILL.md:53`). The command's part is the printed line.
Replacement, criterion 10: "A batch that completes a standalone issue and part of an unfinished epic makes the holder's `merged` call print `issue complete` once for that issue and no `epic complete` line."

**B6 · Briefs must be gathered before the one `merged` call, not as a step after it.** The command now does every member move in one call, and a `merged` move renames a finished owner's folder to `issues/closed` (`src/phase.ts:178-180`).
Replacement, brief step 5: "Green: before its `merged` call, B gathers briefs for every completion owner the batch can close. The call then pushes, moves carried members to `merged` first and the holder last, and prints one completion line per owner."

**B7 · Four binding parts have no done-criterion.**
- Leaf arriving during the run (turn-release Q3 3a, "never inserted into an already-recorded batch"). New criterion: "A leaf that enters `merge` after the batch record is written is not in that batch's push and is the next holder or member."
- Failed fetch (turn-release Q2 2a). New criterion: "When the reconcile fetch fails, no branch is restored, the record stays, and the pass reports the fetch error."
- Holder failed after its push (turn-release Q2 2a). New criterion: "A holder failed after its push gets a notice naming the next step, and moving it back to `merge` ends in `merged` with no check run and no push."
- Solo marks clearing (shape step 8). New criterion: "A solo-marked leaf that leaves `merge` and returns is carried in the next batch."

**B8 · Waking dependents and closing tabs cannot be called from `src/phase.ts`.** They live in `src/next.ts` (`dispatchDependents` at `:681`, `closeMergedTab` at `:644`), which `phase.ts` cannot import (`src/next.ts:55`).
Replacement, design Owned: "After the holder's `merged` call returns, the post-move pass in `src/akrogon.ts` (from merge-turn-order) wakes the dependents of every member recorded as moved and closes the carried members' tabs."

**B9 · The push proof is still PENDING** in `readiness.yaml` (first proof: command, date, result, cleanup and limits). The command-owned push is the centre of this leaf. The same entry is PENDING in record-only-reuse. Both need the operator's run recorded before handoff.

## record-only-reuse

**R1 · The tested main has no owner.** Condition 1 compares old main with new main. merge-batch's record holds members, saved base and head, attempt id, tested top, completed moves and solo mark. A member's saved base is its own old base, not the main the stack was built on. This leaf's Owned list has no `src/state.ts`.
Replacement, merge-batch design Owned: "…the batch record schema in `src/state.ts` (members, saved base and head, the main commit the stack was built on, attempt id, tested top, completed moves, solo mark)". Replacement, this design Owned: add "the reuse fields in the batch record in `src/state.ts` (new main, pushable top, decision)".

**R2 · The reuse decision and merge-batch's HEAD check contradict each other.** After a restack the worktree HEAD is the new top, which is not the tested top, so merge-batch's push check (B1) would refuse it. Nothing says how the reused top becomes pushable, or what a second refused push compares against.
Replacement, design: "On a refused push the command restacks, decides and prints `reuse` or `rerun`. On `reuse` it stores the new top as the pushable top beside the unchanged tested top and tested main, and B runs `merged --check` and `merged` again. The push accepts HEAD equal to the pushable top. Every later refused push compares against the original tested top and tested main, never against an earlier reused top."

**R3 · Criterion 5 gives a job to nobody.** The command-owned restack is rebase-or-abort (merge-batch brief step 2), so the command does not resolve a conflict.
Replacement, criterion 5: "A restack conflict, including one in `learnings/history/*`, follows merge-batch's conflict rules, prints `rerun`, and nothing is pushed until a new check run on the new top is green."

**R4 · Criterion 6 is not observable in akrogon as written.** "The evidence" is `review-B.md`, written by the seat.
Replacement, criterion 6: "The command prints the tested SHA, the pushed SHA and the decision, the batch record holds all three, and `skills/merge-issue/SKILL.md` tells B to copy the printed line into `review-B.md`."

**R5 · The literal `git diff` lines only work from the repo root.** `-- .` and `:(exclude)issues` are read relative to the current directory.
Replacement, design: "`git diff --quiet M1 M2 -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`, the same for T1 and T2, and `git diff --quiet M1 M2 -- ':(top)issues/config.yaml'`."

## Cross-leaf

**X1 · `blocked-by` is otherwise real and complete.** merge-batch needs all three earlier leaves, and record-only-reuse needs merge-batch. The one missing edge is N2.

**X2 · No criterion in any leaf names a test file, an assertion, a count of tests or a `merge_checks` command.** Nothing to change there.
