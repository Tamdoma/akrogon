# Intake: clean-merge-gate

## Scope
A green merge gate means the pushed commit passes on a clean checkout.

## Provenance
- GitHub: Tamdoma/akrogon#63. Also in merge-throughput intake, parked there by first-package Q3 3a; operator reopened 2026-10-10, so ownership is here.

## Operator note, verbatim (2026-10-10)
"Reopen everything that needs to be sold. If we need to chart it, let's chart it out.We have to clear the whole backlog."

## Source: Tamdoma/akrogon#63
# Merge gate passed in the leaf worktree but the pushed main failed on a clean checkout (suspected: untracked worktree state hides failures)

Source: Tamdoma/akrogon#63
URL: https://github.com/Tamdoma/akrogon/issues/63

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-09 about 01:58 UTC. Leaf `agent-content-extraction` passed every `checks` and `merge_checks` command at merge and was pushed. The new main `2ccc39534` then failed 4 stage 11/12 tests in `.claude/hooks/tests/composition-spine.test.ts` with ENOENT. The stage11-site scaffold's empty `src/data/_approved/services` and `src/pages/services` folders are not tracked by git, so a clean checkout lacks them. The red main then bounced `finished-site-review` and `deliverable-obligations` at merge and check.fix (3 bounces) until a fix commit `264cc2f5b` landed on main.

## Location
akrogon merge turn: `skills/merge-issue/SKILL.md` lines 41 and 51 ("run every `checks` command then every `merge_checks` command on `HEAD` in the worktree").

## Reproduction
Seen once. Steps: a leaf worktree holds an untracked file or empty folder that a test needs. Merge checks run green in that worktree, the leaf merges, and the same test fails on a clean checkout of main.

## Expected behavior
A green merge gate means the pushed commit passes on a clean checkout.

## Urgency
High when it happens. One red main bounced 3 merge attempts overnight and stalled the queue until an operator fix. Workaround: operator fixes main by hand and moves bounced leaves back to `merge`.

## Suspected cause
Agent view, supported hypothesis: the merge seat reuses the long-lived leaf worktree, which carries untracked and ignored state from implement and check rounds. Nothing checks the gate result against only tracked content, so working-tree leftovers can hide a failure that a clean checkout shows.
Files read: `skills/merge-issue/SKILL.md`, framework `.claude/hooks/tests/composition-spine.test.ts`, commit `264cc2f5b`.
Not inspected: whether the agent-content-extraction worktree actually held those two folders at its merge run (worktree since removed). Disproved if its merge run happened in a clean checkout.
Related reports: Tamdoma/akrogon#62 (bounces from red base, the downstream effect). Searched Tamdoma/akrogon all states: `--author @me` since 2026-10-07 (#58 to #62), "merge checks worktree untracked" (none).

## Agent findings
Opening map: slots/map-merged.md (A,B,C) and rebuttals slots/map-rebuttal-B.md, -C.md.
