# Opening map, slot A: Tamdoma/akrogon#94

## 1. Verified facts
- F1. The report's path is right and deterministic. In the candidate sweep (src/reconcile.ts, `for (const path of [...candidates].sort())`), a registered store entry whose name is not a leaf slug, not a closed leaf slug (`knownSlugs`), not a recorded `verify-<run>` in progress, not a recorded `batch-<attempt>` and not an active leaf's `<slug>-u<N>` falls through to `removeWorktree` when no live pane cwd is inside. `fork-only-effort-pin` had no `state.yaml`, so it matched none.
- F2. Today the rule is inverted: an unregistered folder in the store is kept as `unknown directory` (tests/reconcile.test.ts:188 "never removed"), while a registered git worktree a person or the door made is removed once clean. The checkout someone made on purpose is the less protected one.
- F3. `worktreeRemovable` (src/reconcile.ts) blocks only on tracked/untracked changes, rebase/merge in progress, and commits unreachable from any branch or remote. Ignored files (`node_modules`, logs) never block, so they are lost with the worktree. A direct attempt between commits passes every check.
- F4. `livePaneInside` compares only herdr pane cwd. The door's pane sits at the repo root, so a direct attempt never has a pane inside.
- F5. Reconcile writes no record of what it removed: `reconcile()` returns `removed`, and `reconcileRepos` (src/next.ts:1322-1341) and the `tab_closed` caller (src/next.ts:1450) drop it. The `kept` report is overwritten each pass. So which caller removed this worktree cannot be proven after the fact. Either fits the window: any `akrogon next` pass on framework, or `upload-kit`'s tab close.
- F6. The direct route removes its own worktree at landing step 8 and on abandon (skills/chart-issues/SKILL.md ## Direct route). It never needs reconcile to clean it.
- F7. Closed-leaf worktrees are already kept (`knownSlugs` check → `unknown directory`). So the only registered worktrees that reach removal without a positive match are ones akrogon did not create.

## 2. Interaction with in-flight #93 leaves
- store-sweep (plan.synthesis) deletes unowned unregistered entries and matches store entries `<slug>` or `<slug>-<anything>` to known slugs longest first (worktree-cleanup/forks/store-hygiene.md Q2). Pitfall: a direct branch named `<finished-leaf-slug>-<x>` would be treated as that leaf's scratch and removed. Whatever #94 decides must win over that prefix match for a registered worktree with its own branch.
- store-hygiene also locks "every deletion needs no process of this user with cwd or open file inside". If store-sweep applies it to every deletion, it narrows F4 for running commands, not for an idle attempt.
- scratch-copy-removal force-removes `verify-*`, `batch-*` and `<slug>-u<N>` by owner record. Those are akrogon kinds, unaffected by a default-keep rule for foreign worktrees.
- Ordering: #94 touches the same sweep loop as store-sweep and scratch-copy-removal. No logical dependency, but the leaves edit the same lines; whichever lands later rebases. Merge order is mechanical, not a blocked-by.
- Contract note: store-hygiene 3a and store-sweep say unprovable items show in plain `akrogon status`. The operator moved that list to `akrogon leftovers` today (uncommitted). store-sweep's brief now names the wrong surface.

## 3. Material forks
### Q1. What may reconcile delete among registered git worktrees in the store?
- 1a (pick) Only akrogon's own kinds with a positive match: a leaf's worktree by leaf state, `verify-*`, `batch-*`, `<slug>-u<N>` by their records. Any other registered worktree is kept and listed by `akrogon leftovers` as a worktree akrogon did not make. Reason: removes the whole problem class (any checkout someone else made), no new record, matches F6. Cost: hand-made or crashed-attempt worktrees stay until a person removes them; `leftovers` shows them. Later: a new akrogon kind must add its own match or it piles up (visible, not destructive).
- 1b Creator writes an owner record (e.g. the direct route writes `<chart>` into a marker), reconcile keeps live owners and removes the rest. Cost: every creator must remember the record; a forgotten record is data loss again, the same failure as a77c260.
- 1c Reconcile reads charts' `Direct attempt` sections and keeps named branches. Cost: couples reconcile to chart markdown; any other hand-made worktree stays exposed.
### Q2. Should reconcile record what it removed?
- 2a (pick) Append each removal (time, repo, path, kind matched, caller) to a log, so a future report can prove the cause. Cost: one small append per removal.
- 2b No record (today). Cost: the next case is unprovable again (F5).
### Q3. Must ignored files block removal?
- Pick: no change under 1a. With 1a, only akrogon kinds are removed, and their ignored files are akrogon's own copies. Raise only if Q1 is not 1a.

## 4. Pitfalls and practitioner questions
- P1. Prefix match in store-sweep removing a direct branch `<slug>-x` (see 2). Removed by: a registered worktree whose branch is not that leaf's is never treated as its scratch; done-criterion.
- P2. A long command's cwd inside a worktree with no pane (F4). Removed by 1a for foreign worktrees; for akrogon kinds by store-hygiene's process check.
- P3. Reproduction test: a clean registered store worktree on a branch with no state survives `next` and a `tab_closed` pass and shows in `leftovers`. Done-criterion.
- P4. Existing framework leftover `~/.akrogon/worktrees/framework/fork-only-effort-pin` (now `uncommitted changes`) is the recreated attempt; nothing to clean by the fix.

## 5. External operations
- None new. git worktree list/remove and herdr pane list are already proven in use. If Q2 logs a caller, no outside call.

## 6. Fog
- Whether any current flow relies on reconcile removing a foreign registered worktree (search: tests pinning that removal, and old migrations such as d333be5 for `issues/worktrees`). Low confidence none does.
