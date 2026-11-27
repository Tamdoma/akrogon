# Final-shape check, slot C: fresh-worktree-setup

You are slot C. Read /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/forks/setup-before-seat.md, sections `## Findings` (F1-F6) and `## Proposed final shape` (A's picks under autopilot).

Run one focused check. Does any numbered item, as written, break a code path or leave a #158 gap you can name with path, function and inputs? Check in particular:

- The busy test in item 2 against the real seat status values in `src/next.ts`.
- That `move`'s worktree case is the only akrogon path that changes a leaf worktree's files after creation.
- That item 5's removal composes with `createSparseWorktree`'s catch and `tests/first-allocation.test.ts`.

Reply "no blocker" or list blockers only. Do not re-argue picks your rebuttal already recorded as dissent.

Return: write /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/slots/final-check-C.md, then run `hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/slots/final-check-C.md"`.
