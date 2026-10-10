# Brief: base-run

## What
A new verb `akrogon base-run --base <sha> [--attempt <id>] -- <command> [args...]` owns the base checkout end to end. Before `git worktree add` it appends a record line (repo, leaf, slot, parent attempt if any, supplied base sha, exact command, args, relative cwd, pid, boot_id, start) to the base-run record file next to akrogon's merge attempts record. It runs the location check on the intended canonical target path in the store before allocation (B), creates a detached sparse checkout of the base in the store, runs `setup` and the command inside the constructed env with the calling leaf's current `.env` generation, always transferred: the verb writes the base checkout's `.env` from that generation's declared names before setup (B), runs the own-node_modules guard after setup, sets AKROGON_BASE to the base, writes the log into the leaf's implementation folder as `base-<id>.log` (for a merge-time run, into the merge attempt's issue folder, with the parent attempt id in the record), records end and exit status, removes the checkout in finally and records the removal confirmation. It prints the log path and completion status on stdout. The caller supplies and judges the baseline; the verb never chooses or reuses one.

Caller identity: the calling leaf and slot come from the cwd's worktree (leaf state and the seat's slot), and the relative cwd is the caller's cwd relative to its worktree toplevel, re-applied inside the base checkout; a call from outside a leaf worktree without `--attempt` is refused. (B)

The verb also replaces the hand-made base checkout instructions in akrogon's skill text: `skills/check-issue/SKILL.md` (:18, :63), `skills/implement-issue/SKILL.md` (:25, :38) and `skills/merge-issue/SKILL.md` (:18) each say one `akrogon base-run` command line instead of `mktemp -d` plus `git worktree add`. red-base-wait rewrites on top of this later. (C)

Consumes from worktree-store: the store path, `createSparseWorktree`, `checkLocation(targetPath)` and `akrogon guard`. Consumes from check-env: the constructed env and run root (`akrogon run-check`). Consumes from leaf-env-file: the leaf's `.env` generation and declared names. (B)

## Why
Base checkouts are made and removed today by seat prose with differing paths and cleanup; one was left on tmpfs as a full RAM copy. akrogon red-base-wait's skill rewrites depend on this verb.

## Done-criteria
1. A base-run prints the log path and exit status, the log holds the command's output, the checkout directory no longer exists afterwards, and the record line shows start, end, exit status and removal confirmed; this holds when the command fails.
2. The record line exists before the checkout is created (a run killed during setup leaves a record without end or removal).
3. The checkout is detached at exactly the supplied sha, holds no `issues/`, and AKROGON_BASE inside the command equals the supplied sha.
4. Two base-runs of the same command and base create two fresh checkouts; nothing from the first is reused.
5. A base-run whose intended store target path has an ancestor holding `node_modules` or `package.json` is refused before allocation naming that ancestor, with nothing created; a checkout whose `node_modules` is missing after setup is refused naming it. (B)
6. A merge-time base-run with `--attempt` writes its log under the attempt's issue folder and records the parent attempt id.
7. No skill text in the akrogon repo instructs a seat to create a base checkout by hand; each base rerun instruction is one `akrogon base-run` command line. (C)
8. The base checkout's `.env` holds the calling leaf's current generation of declared names, the record line carries that generation number, the caller's leaf and slot, and the command runs in the same relative cwd it was called from. (B)
