# Brief: store-sweep

## What
Every reconcile pass deletes junk in akrogon's own places when ownership proves it safe: unregistered entries in each worktree store and legacy `issues/worktrees` (dangling symlinks and stray files included), finished leaves' temp, dead runs and stray entries in the leaf temp root, the retired `/tmp/akr-<uid>`, store dirs of unregistered repos, retired state and lock files. What it cannot prove safe stays, recorded with the reason and listed by `akrogon leftovers`.

## Why
Operator, Round 2 answer 5 and Round 3: akrogon's folders and outputs must always be clean, without breaking anything. About 475 MB of junk sits on this host today (store-hygiene F1), and reconcile cannot see symlinks or stray files.

Builds on three leaves (B,C,D): scratch-copy-removal's process check and `batch-<id>.owner` record, finished-leaf-processes' slice reader and its slice step earlier in the same pass, and `akrogon leftovers`, whose host block host items join (it replaced kept-status's plain-status lines on 2026-10-15).

## Done-criteria
1. In a repo with no running leaf, a reconcile pass deletes: an unregistered folder, a dangling symlink and a stray file in the store and in the legacy root; the temp of a `merged` or `failed` leaf whose tab is gone; a `run-*` dir with a dead owner; a stray file and `.tmp*` dir in the repo's leaf temp; an empty repo dir in the leaf temp root.
2. A host step in the same pass deletes the retired `/tmp/akr-<uid>`, `~/.akrogon/worktrees/<name>` for a name that is no registered repo (only when it contains no worktree directory, no entry holding a `.git` file; one that does is kept and listed by `akrogon leftovers`) (C), a leaf temp repo dir of no registered repo, `runs/last-start`, a `<file>.<pid>.tmp` of a dead pid, and `~/.akrogon/run.lock` and `~/.akrogon/framework-tests.lock` when no process holds them; each repo pass deletes that repo's `.git/akrogon-base-runs.lock` and `issues/.lock` when no process holds them, and prunes only `kept` report entries for paths that no longer exist; the pass's `removed` entries are never filtered by path existence (B). (C,D)
3. An item tied to a running leaf stays: its temp, a `<slug>-<anything>` store entry, and an unowned entry in that repo.
4. A `run-*` dir or a `batch-<id>.owner` record with a live owner stays in every case, also with no live tab and no running slice for its leaf and when its enclosing folder would otherwise go; a `run-*` dir without `.owner` younger than 60 seconds stays. (B)
5. A `run-*` dir whose owner is dead is deleted while its leaf is still active, also in a pass with the pane list unavailable, as today. (B,C)
6. An item with a live herdr pane inside, or with a process of this user whose cwd or an open file is inside, stays and is recorded with the pane or pid; a pass with the pane list unavailable deletes nothing except a `run-*` dir whose owner is dead. (C)
7. The live locks (`<globalHome>/.lock`, `.git/akrogon-install.lock`, `.git/akrogon-verify-runs.lock`), config, paused and stopped files, `~/.config/akrogon/env`, installed links, `issues/` records and registered worktrees outside the store and legacy root are never deleted. Inside the store and legacy root, a registered worktree is removed only under live-worktree-guard's rule (a leaf worktree under its leaf rules or a scratch kind under scratch-copy-removal's rules), only through `git worktree remove`, and never past a lock; the `<slug>-<anything>` prefix match applies to unregistered entries only.
8. Each kept item appears in `reconcile/<repo>.json`, or `reconcile-host.json` for host items, with its reason and what clears it, and `akrogon leftovers` lists host items too in its host block, also with zero registered repos. (C,D)
9. A delete that fails is reported with its path and error, and no item is reported deleted while it still exists.
10. A pass whose only candidate is a new kind (a dangling symlink, stray file or unknown leaf temp dir) fetches the pane list rather than judging it with an empty one.
