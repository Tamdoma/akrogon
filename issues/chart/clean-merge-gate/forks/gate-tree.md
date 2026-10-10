# Gate tree

## Question
Q1. How does the merge gate stop seeing files and folders the commit does not hold?

### Carries
- slots/map-merged.md (A,B,C), slots/map-rebuttal-B.md D1-D2, slots/map-rebuttal-C.md R1-R3.

## Findings
- better-than-training · src/batch.ts:82-89, src/phase.ts:318-321, read 2026-10-10 · the only pre-gate check is `git status --porcelain`, blind to empty folders and ignored files. (A,B,C)
- better-than-training · framework 0c5d1d7cb, 2ccc39534 composition-spine.test.ts:1444-1456, 264cc2f5b · leaf commit copied into two untracked folders; copyFileSync throws ENOENT without them, so the green gate implies they existed on disk. (C; B,A held "not proven", C rebuts)
- better-than-training · git-clean docs (https://git-scm.com/docs/git-clean), read 2026-10-10 · `-fd` removes untracked files and folders, keeps ignored files without `-x`. After an empty porcelain status, only empty folders remain to remove. (C,B)
- better-than-training · src/batch.ts:124 · move() is skipped for solo holders; mergeTurn (src/next.ts:1037-1050) covers both modes. (C)
- practitioner · Bender, Testing Overview, SWE at Google ch.11 (https://abseil.io/resources/swe-book/html/ch11.html); Kuefler, Build Systems ch.18 (https://abseil.io/resources/swe-book/html/ch18.html), read 2026-10-10 by B · tests should own their environment; correctness tracks declared inputs. Supports B's fresh-checkout preference.
- Held disagreement: B prefers a fresh checkout for the full guarantee; A,C prefer clean -fd because ignored-file leftovers have zero cases and fresh setup runs on the serial slot each attempt.
- Dependency: B says file overlap with batch-limit-repo and merge-attempt-records is not a dependency (skill rule agrees); coordinate by rebase.

## Taken
Operator 2026-10-10: "1a |"

- 1a: when the command hands the merge turn to B (mergeTurn, covering top and solo), it runs `git clean -fd` in the holder worktree after the empty-status check. No `-x`: ignored files stay. Foreclosed: 1b fresh checkout per gate.
- Binding avoidance steps: clean only after git reports a clean status; never `-x`; a fail-first test plants an empty folder and proves the gate tree equals the commit tree in both modes; the leaf states its limit (ignored-file leftovers not covered); file overlap with batch-limit-repo and merge-attempt-records is coordinated by rebase, not blocked-by.
- Correction, operator 2026-10-10 "1a" (leaf review, slots/leaf-review-B.md F1, -C.md F1): the command removes only empty untracked folders (no file at any depth), in every worktree state, found by walking the worktree; it never removes a file or enters ignored paths. This replaces both `git clean -fd` and the clean-status precondition, because a dirty holder is the solo case #63 can hit and `git clean -fd` would delete uncommitted untracked files. (A,B,C)
