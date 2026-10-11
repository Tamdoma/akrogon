# Review A: worktree-reconciler

Base: `64f27d0e3c4ae254a6aafd49ea393033dc677606`
Reviewed head: `46952bfdf63564cb489c28608903f1ec2ed8cba8` (docs commit; implementation `24f21a8`, tests `41813c7`)

## Verification evidence

- Full diff read: `src/reconcile.ts` (new, 437 lines), `src/next.ts`, `src/status.ts`, test + doc diffs.
- AREA listing probe: `src/reconcile.ts`, `tests/reconcile.test.ts`, all other named paths exist.
- Live store probe: `git worktree list --porcelain` shows this leaf's own store dirs registered; `~/.akrogon/scratch/akrogon/` holds live debris the sweeps must handle.
- Checks per report: 774 pass full suite, test_changed 760 pass, format/typecheck logs in `implementation/`. Not rerun — no missing evidence or specific rerun concern.
- Doc behavior: README gained a two-line reconciler claim; `src/AREA.md`/`tests/AREA.md` one line each, all valid.

## Verdict: fix

### Fixes

F1 (from F24 analysis). Store-sweep candidates (`base-<id>`, `batch-<id>`, seat-made variant checkouts, stale leaf-slug dirs) are removed without any live-pane check. `removeWorktree` → `worktreeRemovable` checks porcelain/rebase/reachability only; the candidate loop calls it directly. The brief's keep rule "a live pane inside" applies to every worktree, and seat-made variants are exactly the class a pane can be inside (design names emdash's `-v0`/`-u*` checkouts). Realistic source: an agent or operator pane cwd'd into `~/.akrogon/worktrees/<repo>/<slug>-u7` while a `next` pass sweeps → `git worktree remove` deletes the directory out from under a running process (data loss of in-flight output). Consequence today: live pane's working directory vanishes mid-run. Criterion: brief DC2 "a live pane inside" and design 2a's "live pane is inside" keep. Same gap in `reconcileNeedsPanes`: a repo with only store variants gets `panes=[]`, so the check couldn't help even if present. Fix: run the pane-inside check for removal candidates when `live` is non-null, keep `pane list unavailable` when null and a removal decision needs it, and make `reconcileNeedsPanes` return true when any candidate exists under the roots.

F2. `keptReportPath` writes `<globalHome>/reconcile/<repo>.json`. On production `AKROGON_HOME` is unset, so `globalHome()` = `toolRoot` = the registered akrogon checkout: every `next` pass creates an untracked `reconcile/` directory inside the user's registered repository. Realistic source: running `akrogon next` on this machine; `git status` in `~/Work/infra/akrogon` will list `reconcile/` as untracked noise and `akrogon sync` could commit it. Consequence today: checkout pollution on every repo with the default install layout; `.gitignore` precedent (`.lock`, `paused.yaml` are ignored there but `reconcile/` is not). Fix: park the report under a state dir off the checkout (e.g. `~/.akrogon/reconcile/` or `globalHome()` when `AKROGON_HOME` is set, falling back to `~/.akrogon/`) — needs a location that is never inside a registered checkout.

F3. `mergedWorktree` unconditionally calls `closeTab` for adopted merged leaves (the `leaf.state.worktree === undefined` adoption path in the store sweep), with no `batchMemberSlugs` guard — the leaf loop's `state.batch`/`memberSlugs` keep happens before that branch is reached only when `state.worktree` is set; the adoption path re-enters `mergedWorktree` which closes the tab of any merged leaf with a live tab regardless of carried-batch membership. The merge docs keep a carried member's tab until the record clears. Reachable only if a carried member's store worktree exists while its `state.worktree` is unrecorded; low frequency, wrong side-effect (tab closed while batch in flight). Fix: apply the `memberSlugs`/`state.batch` keep inside `mergedWorktree` or before calling `closeTab` in the adoption path.

F4. README now claims "Every `akrogon next` pass reconciles worktrees…". False as implemented: `reconcileNow` is `input === undefined` OR `outcome === 'skipped'` for single-leaf typed passes — a typed `akrogon next <slug>` that dispatches or waits does not reconcile, and `--resume`/`unpause`/hook paths reconcile only their repo set. Brief DC language says "Every `akrogon next` pass reconciles". Consequence today: operator reads that debris is swept on every pass; it is not. Fix: either run `reconcileRepos` on every touched repo regardless of outcome (preferred — matches the brief) or soften the README line to "every sweep".

### Nits

N1. `removeMergedWorktree` `saveState`s `worktree: undefined` on leaves under `issues/closed`, mutating closed records. Old code left the stale path recorded. Low consequence (the record is more accurate), deferred: a `sync` or record-diff tool may see closed state drift.
N2. Duplicate `kept` entry when a merged leaf's worktree removes but `git branch -d` fails (the removed path appears once from `removeWorktree`'s absence and once with the `-d` stderr). Cosmetic; a `seen` set would dedupe.
N3. `dispatchLeaf` failed-leaf picked-throw gating (`tab===undefined && worktree===undefined || live || cause==='attempts'`) is a behavior change beyond the plan: a typed `next <failed>` with a recorded worktree now waits quietly instead of erroring "needs phase recovery". Justified (reconcile must sweep it), but the error message the operator sees on a failed leaf depends on incidental state. Deferred — consistent behavior would be naming the recovery requirement in the skip report.
N4. `mergedWorktree` keeps `active leaf` for open merged leaves whose owner completes this pass — a one-pass deferral whose semantics differ subtly from `within(open)` checks elsewhere. Cosmetic.
N5. `z.string().parse(tab)` in the `worktree === undefined` closeTab branch is a redundant re-parse of a `z.string().min(1)`-validated field. Style.

## Unverified / deferred

- `pane list unavailable` keep reason has no test (no test drives a `panes()` failure) — matches report's declared limitation; F1 covers the pane-null class.
- `/tmp/akr-*` run roots unswept — design-acknowledged, recorded in plan.md.
