# Slot B review: `akrogon leftovers`

You review an uncommitted change on main in /home/ivan/Work/infra/akrogon as the implementer's reviewer. Do not edit any file except your return file.

## Change
The operator asked to move the kept-by-cleanup list out of plain `akrogon status` (commit 7950450 printed `Kept by last cleanup: <path> — <reason>` lines there) into a new command `akrogon leftovers`. Paths kept only because work still runs there are left out, since a later cleanup removes them.

- `src/leftovers.ts` (new): per repo (current repo when inside one, else all registered), kept entries whose path exists and whose reason is not in-use, grouped by reason, home shortened to `~`. Prints `no leftovers` when empty.
- `src/akrogon.ts`: `leftovers` verb, takes no arguments.
- `src/status.ts`: the plain-board kept lines removed. `akrogon status <slug>` still prints `Kept:` lines.
- tests/status.test.ts, tests/reconcile.test.ts, README.md updated.

Diff: issues/chart/worktree-cleanup/slots/leftovers-review.diff
Keep reasons are set in src/reconcile.ts (`keep(` calls).

## What to check
1. Is the in-use reason set right? Every reason it hides must be removed by a later reconcile pass once the work ends with no person acting. Every reason it shows must need a person. Cite src/reconcile.ts lines.
2. Concrete defects in the code or tests: wrong output, missed repo, vacuous assertion, error swallowed.
3. Anything else that still references the plain-status kept lines and is now stale (skills, docs, tests).

## Return
Write disagreements and defects only, each with file:line evidence and an exact fix, to issues/chart/worktree-cleanup/slots/leftovers-review-B.md. Write `No findings.` if none.
