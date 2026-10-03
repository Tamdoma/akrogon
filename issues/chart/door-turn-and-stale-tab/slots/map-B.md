# Slot B independent map

Paths below are relative to /home/ivan/Work/infra/akrogon unless absolute. Read on 2026-10-03. #53 is excluded.

## Territory

1. F1 · #54 is a turn-ownership gap, not a missing wait command. assets/questions.md already requires bounded repeated waits and return-file checks (skills/chart-issues/assets/questions.md:44). It does not explicitly prohibit ending A's turn while the peer works. SKILL.md:49 requires the merge/rebuttal sequence, but SKILL.md:85-89 can be read as permission to print a footer and stop on a peer wait.
2. F2 · The observed wait also required both a non-empty file AND idle, contrary to the existing OR completion rule. Session /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/858cdae8-54a7-47d7-ac23-d465b970099b.jsonl:592 records run_in_background=true and that conjunction at 05:19:46Z. Line 595 ends with “Next: none, waiting on B's round2-B.md”. Line 599 records the operator's return at 05:42:15Z. A background process finishing did not continue this exchange.
3. F3 · #55 is a committed transition followed by a presentation failure. src/phase.ts:109-120 saves state and prints the move before renaming a recorded tab when leaving failed. Lines 122-129 append the move even when rename throws. src/shell.ts:48-50 throws on non-zero exit; :98-118 excludes tab_not_found from retryable codes. Retrying a vanished ID cannot restore it.
4. F4 · next already owns allocation recovery. src/next.ts:327-333 matches live tabs by recorded ID or slug plus worktree, :388-394 creates a tab when none matches and persists its ID, and :397-419 allocates/persists seats. phase should not duplicate that ownership. Another rename exists in announceFailed (src/phase.ts:72-83), so a narrowly defined missing-tab policy should address both rename sites while preserving actual notification failures.

## Proposed split

D1 · Two independent issues, one leaf each, same destination akrogon:
- #54 / chart-peer-turn: clarify A's active-turn obligation in the peer exchange and reconcile Drain, Take and Printed footer references. Preserve the existing peer-wait lock unchanged. Verify a delayed peer return proceeds through reading, merging and rebuttal without operator input.
- #55 / phase-missing-tab: settle the rename-error contract, implement only that contract, and verify persisted phase/log, exit status and subsequent next behavior. Include existing-tab rename success and propagation of unrelated Herdr errors.

No dependency between them. Neither needs #53, new orchestration machinery or next allocation changes.

## Fork 1 round (#54)

This settles who keeps the exchange running after a peer starts, because a finished background wait did not resume A.

### 1 · While a prompted peer is working, what must A do, and where does that rule live?

The existing peer rule already provides the wait protocol. The missing guarantee is that A owns continuing it in the same turn through return-file reading and the next exchange step.

Research: operator · #54 intake and named transcript:592,595,599, read 2026-10-03 · a background wait plus final footer stranded the return · make active-turn ownership explicit. Primary corroboration: skills/chart-issues/assets/questions.md:44,48-50 and installed herdr 0.9.3 `herdr agent` help. /home/ivan/.codex/skills/herdr/SKILL.md, “Start and coordinate an agent”, documents settled-state waits and that waits track lifecycle state rather than individual turns.

- **1a (recommended)** A stays in its active turn. After confirmed start, use foreground bounded `herdr agent wait <pane> --timeout <T>` calls, T below the harness command timeout and at most 30000 after prompting. On timeout check the assigned return file and repeat if unfinished. On idle or a non-empty return file, read the file and continue merging, rebuttal or final checking. Put the full rule in questions.md's Blind peer exchange, with short references in SKILL.md Drain/Take and a footer restriction. This closes the demonstrated gap using the existing protocol.
- **1b** Permit A to end its turn only after installing and proving a harness mechanism that resumes A on peer completion. This requires additional machinery and evidence. The observed background loop is insufficient.

Pitfalls: a timeout is a polling interval, not a blocker or permission to end the turn. Preserve the guarded prompt and never automatically re-prompt on its failure. Preserve file OR idle completion, not AND. Idle without a non-empty answer is peer failure. Use a distinct return path so an old file cannot impersonate this response. Background waits, sleep loops and a final footer cannot substitute for active ownership. A may yield for an operator round, a real peer failure or blocked peer, not normal working status.

Reply `1a` or `1b`, or give a free-text choice.

Challenge check: bounded CLI calls do not themselves guarantee the harness keeps A active. The instruction must explicitly cover the interval between calls and every peer exchange, including maps, rebuttals and contract reviews. No overall peer deadline is introduced by this recommendation.

## Fork 2 round (#55)

The intake supplies no expected behavior. This settles whether a vanished presentation target should make a committed move return failure.

### 1 · Should tab_not_found from phase's tab rename fail an already committed transition?

A missing tab is recoverable by next's existing allocation. Other Herdr failures and failed logging remain meaningful failures.

Research: operator · #55 intake, read 2026-10-03 · phase committed but exit 1 prevented chained next, which later succeeded separately · distinguish a vanished tab from other errors. Primary corroboration: src/phase.ts:72-83,109-129; src/shell.ts:107-129; src/next.ts:327-333,388-419; installed herdr 0.9.3 `herdr tab` help confirms rename targets an ID. No mutating calls or lifecycle commands were run.

- **1a (recommended)** Treat only structured tab_not_found from these rename operations as an absent presentation target. Emit a structured warning with command/error context and finish the committed move successfully when its other required operations succeed. Leave reallocation to next. Apply this consistently entering and leaving failed. This preserves live-tab labels and makes the reported chain work without hiding other failures.
- **1b** Remove phase-owned renaming entirely. This eliminates the dependency, but existing tabs lose the failed label and its restoration. Choose only if that behavior is intentionally abandoned.
- **1c** Keep non-zero status and explicitly report that state committed despite rename failure. This preserves strict UI synchronization, but callers still cannot safely use phase && next and must reconcile persisted state.

Pitfalls: do not catch every CommandError, make tab_not_found globally retryable, recreate tabs in phase, or return success after log/notification failure. A preflight tab lookup alone has a close-between-check-and-rename race. In announceFailed, absence must not overwrite or suppress an earlier notification error. No rollback of a saved transition is proposed.

Reply `1a`, `1b` or `1c`, or give a free-text choice.

Challenge check: 1a makes absence an explicit permitted outcome for tab labeling. It does not make every post-commit failure successful. The operator must settle that boundary before implementation, since #55 gave no expected behavior.
