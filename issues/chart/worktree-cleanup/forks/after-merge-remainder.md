# After-merge remainder

## Question
Q1. Stacked merge members: batchPush and finishPush move stacked members to `merged` (src/phase.ts:629-632, :737-742) before reconcileBatch runs, and reconcileBatch adds to `moved` only members still in `merge` (src/next.ts:975), so `closeMergedTab` and `dispatchDependents` (src/next.ts:991-994) skip them. Does a stacked member's tab, and with it its own worktree, stay after merge in practice, and what should close and remove them? A member whose worktree was dirty when `move()` ran keeps its files while its branch moves (src/batch.ts:164-166, `dirty-ref`) and is then kept as `uncommitted changes`: remove it after merge or keep it?

Q2. Should plain `akrogon status` show kept worktrees and their reasons? Today only `akrogon status <slug>` prints them (src/status.ts:352).

Q3. What should reconcile do with unregistered folders in the worktree store, such as `prose-asserts-u1-cmdlogs` (kept as `unknown directory`, src/reconcile.ts:346-353): keep and report, or delete when the name starts with a finished leaf's slug?

### Carries
- Taken: [scratch-copy-removal](scratch-copy-removal.md) (2a, 3a).
- Operator split answer 2026-10-15: `1a`.

## Findings
Full notes: slots/after-merge-{A,B,C,D}.md, merged slots/after-merge-merged.md, rebuttals slots/after-merge-rebuttal-{B,C,D}.md (D: none).
- Members skip the direct close: batchPush/finishPush move them to merged first (src/phase.ts:629-632, :737-742), reconcileBatch closes only `moved` (src/next.ts:975, :991-994) (A,B,C,D). Before 6640ab5 (landed 2026-10-14 17:32Z) `closableMembers` closed them directly (6640ab5~1:src/next.ts:909) (D; C landing time); 9e4c093 restored stacking without it (A check).
- Normal chain today: holder B idle hook closes the holder tab (src/next.ts:1478-1489), holder `tab_closed` reconciles the repo (:1429-1445), `mergedWorktree` closes the member tab and removes its worktree (src/reconcile.ts:235-274), member `tab_closed` dispatches dependents (:1455-1459) (B,C,D).
- Real stacked merges (framework 2026-10-14 06:09Z, 17:01Z) ran pre-6640ab5; member tabs gone within about 4 s (C,D). No stacked merge since 9e4c093 (D).
- Gaps today: holder tab already closed, `akrogon phase` run outside holder B, or holder hook `blocked`/`unknown`: member tab and worktree wait for the next sweep; member tab closed before merge: dependents wait for the next sweep (D; delay, not loss: `--all`/`--resume`/targeted passes dispatch merged leaves' dependents, src/next.ts:844-875, :1382-1428, per B R4, C R2).
- Dirty member (`dirty-ref`, src/batch.ts:164-166): branch moves, files stay; dirt mixes real edits and rebase noise; kept as `uncommitted changes`; `git branch -d` runs only after removal, so the branch stays too (B,C,D). C reproduced: plain remove refuses, `--force` removes (git 2.56.0 scratch repo).
- Plain status: kept entries print only under `akrogon status <slug>` (src/status.ts:352); framework's kept report lists nine paths that no longer exist (C).
- Unregistered store folders today: tool caches `.temp`, `.dcf*.node-gyp`, a hand-made `emdash-conversion-ufix-b`; `prose-asserts-u1-cmdlogs` came from a since-fixed bug (C, D map).

## Taken
Operator, 2026-10-15 (Round 2): `1a | 2a | 3a | 4a | 5 - these need to be deleted and the akrogon folder and what it produces always needs to be clean. You have to check that it's not gonna mess something up, but I want all folders to be clean of junk and leftover files |`

- Q1 (stacked members) → 2a. Reason: the direct close existed until 6640ab5 and was lost when 9e4c093 restored stacking. Binding: when a stacked merge finishes, the merge path closes every merged member's tab and dispatches its dependents, as `closableMembers` did; a test covers a stacked merge whose member tabs close at once. Duplicate dispatch is harmless (already-started leaves are skipped). Foreclosed: relying only on the herdr hook chain.
- Q1 (dirty member worktree) → 3a. Reason: a leaf's own worktree is where seats work; uncommitted files may be real edits. Binding: kept as `uncommitted changes` and shown by Q2. Foreclosed: force-removing a merged leaf's own dirty worktree.
- Q2 → 4a. Binding: plain `akrogon status` prints each kept path and reason per repo, including with no open leaves, only for paths that still exist, labelled as the last cleanup's result; status never runs reconcile; a test covers status with no open leaves and one kept entry.
- Q3 → operator free text: unregistered folders "need to be deleted", and akrogon's folders and outputs must always be clean, after checking deletion cannot break anything. Foreclosed: keep-and-report for junk. Mechanism and scope moved to [store-hygiene](store-hygiene.md).

Correction, operator 2026-10-15, on plain status after kept-status merged: "This is just too much to have now. If these are getting deleted automatically, I don't want to see them in akrogon status. Maybe a new command where they're displayed, like "akrogon leftovers" or something." Then, for the store-sweep brief, `s2a`. Binding, replacing Q2 → 4a's surface: plain `akrogon status` prints no kept lines; `akrogon leftovers` lists, per repo and grouped by reason, kept paths that still exist and need a person, plus host kept units, hiding entries that a later pass clears by itself (active leaf, worker, run, batch holder, live pane, verify in progress; own slice, live run record, live tab, pane list unavailable). `akrogon status <slug>` keeps its `Kept:` lines.


## Proofs
- P5 `herdr tab close <tab_id>`, the call `closeTab` makes (src/reconcile.ts:117). Identity: local user ivan, herdr 0.9.1 socket. Date 2026-10-15. Target: throwaway tab created with `herdr tab create --workspace w8 --cwd <door temp> --label akrproof-tab-<n>` (unfocused, tab w8:tC9). Result: close returns `{"type":"ok"}`, exit 0; `herdr tab list` no longer shows the label. Cleanup: the close itself (checked). Limits: does not prove the `tab_closed` hook fires akrogon for a tab akrogon did not create.
