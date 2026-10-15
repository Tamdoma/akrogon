# Notes

## Q1: Stacked merge members — closing tabs, dispatching dependents, and removing worktrees

### Establishment: do a stacked member's tab and worktree actually stay after a merge?

**Short answer**:
- On **2026-10-14** (when the two real stacked merges in `tamdoma/framework` ran, before commit `6640ab5`), stacked members' tabs **did close immediately** (within 4 seconds of push) because `src/next.ts` had `closableMembers(repo, batch.members, moved)` (`6640ab5~1:src/next.ts:909-918, 1019, 1059`).
- On **current `HEAD` (`f3557d8`, after commit `9e4c093` on 2026-10-15)**, `9e4c093` (*"feat: stack waiting merge leaves under the holder turn"*) reintroduced stacked `batch.members` **without restoring `closableMembers`**. As a result, the direct post-merge path (`mergeWake` -> `reconcileBatch`) **skips stacked members completely**. Whether a stacked member's tab closes, its worktree is removed, and its dependents are dispatched now depends entirely on an indirect chain of Herdr hook events — and **fails in three concrete scenarios**.

#### 1. Real batch merge logs in `tamdoma/framework` (`2026-10-14`)

Two stacked merges are recorded in `/home/ivan/Work/tamdoma/framework/issues/merge-attempts.jsonl`:
1. **`attempt: ab8e6a2a-c0a2-40fb-b6f4-55502e30a772`** (`2026-10-14T06:09:07.887Z`):
   - `holder: "pass-two-review-notes"`, `members: ["test-port-per-check"]`, `result: "pushed"`.
   - In `framework/issues/timings.jsonl`:
     - `test-port-per-check` entered `merge` at `06:05:45.654Z` (`pane: "%205"`).
     - `pass-two-review-notes` entered `merge` at `06:05:31.894Z` (`pane: "%199"`).
     - Both transitioned `from: "merge", to: "merged"` at `06:09:07.886Z` (`pass-two-review-notes` took `215992ms`, `test-port-per-check` took `202232ms`).
   - In `framework/issues/log.jsonl`:
     - At `06:09:11.896Z` (4.0 seconds after push), `{"kind":"wait","slug":"test-port-per-check","reason":"none"}` was logged by the Herdr `tab_closed` handler (`src/next.ts:1459` -> `dispatchDependents`), proving `test-port-per-check`'s tab was closed right after push.
     - At `06:09:20.114Z`, `{"kind":"wait","slug":"pass-two-review-notes","reason":"none"}` fired when the holder's Seat B went idle and its tab closed.
2. **`attempt: 3b9d71b6-8250-4aea-a57b-986dfeff00c3`** (`2026-10-14T17:01:06.153Z`):
   - `holder: "technical-pack-selection"`, `members: ["favicon-audit"]`, `result: "pushed"`.
   - In `framework/issues/timings.jsonl`:
     - Both `favicon-audit` and `technical-pack-selection` transitioned `from: "merge", to: "merged"` at `17:01:06.152Z`.
   - In `framework/issues/log.jsonl`:
     - At `17:01:10.338Z` (4.2 seconds after push), `{"kind":"wait","slug":"favicon-audit","reason":"none"}` fired from `tab_closed` on `favicon-audit`.
     - At `17:01:15.302Z`, `{"kind":"wait","slug":"technical-pack-selection","reason":"none"}` fired when the holder's tab closed.

**Why those two stacked merges closed member tabs on `2026-10-14`**:
At the time of both merges, `6640ab5~1:src/next.ts:909-918` defined:
```ts
function closableMembers(repo: Repo, members: BatchMember[], moved: Leaf[]): Leaf[] {
  const seen = new Set(moved.map((leaf) => leaf.state.slug));
  const out = [...moved];
  for (const entry of members) {
    if (seen.has(entry.slug)) continue;
    const leaf = findLeaf(repo, entry.slug);
    if (leaf && leaf.state.phase === 'merged' && leaf.state.tab !== undefined) out.push(leaf);
  }
  return out;
}
```
And `reconcileBatch` called `for (const item of closableMembers(repo, batch.members, moved)) await closeMergedTab(repo, item, livePanes)` (`6640ab5~1:src/next.ts:1019, 1059`). Commit `6640ab5` (`2026-10-14T17:46:13+02:00`, *"refactor(merge): serialize merges one leaf at a time"*) deleted `closableMembers`, and commit `9e4c093` (`2026-10-15T09:40:22+02:00`, *"feat: stack waiting merge leaves under the holder turn"*) restored `batch.members` without restoring `closableMembers`. No stacked merge (`members.length > 0`) has executed since `9e4c093`.

#### 2. Complete code trace on current `HEAD` (`f3557d8`) when `akrogon phase <holder> merged` runs

Suppose holder `H` merges with stacked member `M` (`H.state.batch.members = [{ slug: 'M', ... }]`):

1. **`phaseCommand` -> `batchPush` (`src/phase.ts:575-652`) and `finishPush` (`src/phase.ts:696-749`)**:
   - Under `.lock`, if `remoteHead === batch.tip` (`batchPush` line `589`) or after `push(repo, batch.tip)` succeeds in `finishPush` (`src/phase.ts:710`), `akrogon phase H merged`:
     - Loops over `resolved` members (`src/phase.ts:629-635` or `:737-743`), calling `await move(repo, entry.member.slug, entry.member.tip, entry.leaf)` and setting `entry.leaf.state.phase = 'merged'`, `entry.leaf.state.merge = undefined`, `saveLeaf(entry.leaf)`.
     - Transitions `H` to `phase = 'merged'` (`src/phase.ts:636` or `:744`).
     - Note: `H.state.batch` is **left on `H`** until `reconcileBatch` runs. Neither `batchPush` nor `finishPush` closes tabs, runs `reconcile`, or calls `dispatchDependents`.
2. **`mergeWake` -> `mergePass` -> `mergeTurn` -> `reconcileBatch` (`src/akrogon.ts:86`, `src/next.ts:857-995`)**:
   - Immediately after `phaseCommand` returns in `src/akrogon.ts:85`, line `86` runs `await mergeWake(target, args[1])` (`target = 'H'`, `phase = 'merged'`).
   - `mergeWake` (`src/next.ts:857-884`) does **not** call `reconcile()`. It calls `mergePass(repo, [leaf, ...waiting], ...)` (`:874`).
   - `mergePass` calls `mergeTurn(repo, H, ...)` (`:891`), which sees `H.state.batch` is set and calls `reconcileBatch(repo, H, livePanes)` (`:999`).
   - Inside `reconcileBatch` (`src/next.ts:918-995`):
     - `remoteContains(repo, batch.tip)` is `true` (`:961`).
     - It loops over `batch.members` (`:967-978`), calls `await move(repo, member.slug, member.tip, item)` a **second time** (`:974`), and then checks `if (item.state.phase !== 'merge') continue;` (`:975`).
     - Because Step 1 (`batchPush` / `finishPush`) **already set `item.state.phase = 'merged'`**, line `975` `continue`s for every stacked member! `moved` remains `[]` (line `976` only runs in crash recovery where `git push` succeeded on the remote before `finishPush` could write `phase = 'merged'`).
     - Line `988` clears `holderNow.state.batch = undefined` and saves `H`.
     - Lines `991-994` (`for (const item of moved) { await closeMergedTab(...); await dispatchDependents(...); }`) do **nothing** because `moved` is empty.
     - `mergeTurn` returns `'advanced'` (`:1001`) because `H.state.phase !== 'merge'`.
   - At the end of `akrogon phase H merged`:
     - `H`'s tab is still open (because Seat B in `H` was the running shell calling `akrogon phase H merged`).
     - **`M`'s tab is still open**, **`M`'s worktree is still on disk**, and **`M`'s dependents have NOT been dispatched**.
3. **Hook 1 — Herdr `pane_agent_status_changed` when `H`'s Seat B finishes its turn (`src/next.ts:1461-1495`)**:
   - When the agent in `H.state.pane.B` finishes after running `akrogon phase H merged`, Herdr emits `pane_agent_status_changed` (`status: 'idle'` or `'done'`) for `H.state.pane.B`.
   - `handleHookEvent` finds `owners` owning `H.state.pane.B` (`:1464`) — which is **only `H`**, not `M` (whose pane has been sitting idle in `mergeQueue` since before the merge).
   - Because `H.state.phase === 'merged'` (`:1475`), it calls `await dispatchDependents(H.repo, H.state.slug)` (`:1477`) and `await closeMergedTab(H.repo, H, livePanes)` (`:1489`).
   - Note: `pane_agent_status_changed` does **not** call `reconcile()`, and does nothing for `M`.
4. **Hook 2 — Herdr `tab_closed` when `H`'s tab closes (`src/next.ts:1429-1460`)**:
   - When `closeMergedTab(H.repo, H, livePanes)` in Hook 1 closes `H`'s tab, Herdr emits `tab_closed` for `H`'s `tab_id`.
   - `handleHookEvent` (`src/next.ts:1429-1460`) matches `owners` by `leaf.state.tab === event.tab_id` (`:1432`), loads all leaves in `H.repo` (`:1439`), and calls `await reconcile(H.repo, leaves, { panes: livePanes })` (`:1441`)!
   - What that `reconcile` call does to stacked member `M` (`src/reconcile.ts:293-295` -> `mergedWorktree` at `:235-260`):
     - `M.state.phase === 'merged'` and `H.state.batch` is now `undefined` (`batchSlugs` is empty).
     - `mergedWorktree` sees `tabLive(panes, M.state.tab)` is `true` and calls `await closeTab(worktree, M.state.tab)` (`:245-246`), which closes `M`'s tab!
     - **Case 4a (`M`'s issue moved to `issues/closed`, so `M.open === false`)**: `if (leaf.open)` (`:247`) is `false`, so `mergedWorktree` proceeds directly to `removeMergedWorktree(leaf, worktree)` (`:259`), removing `M`'s worktree (if clean), and when Herdr subsequently fires `tab_closed` for `M`'s tab, `src/next.ts:1459` calls `dispatchDependents(M.repo, M.state.slug)`.
     - **Case 4b (`M`'s issue is still in `issues/open`, e.g. an multi-leaf epic with unmerged siblings, so `M.open === true`)**: `if (leaf.open)` (`:247`) is `true`, so `mergedWorktree` returns `keep(worktree, 'live pane inside')` (`:248`) on the first `reconcile` pass, and relies on Herdr firing a second `tab_closed` event when `M`'s tab finishes closing (`closeTab` at `:246`), which triggers a second `reconcile` pass (`src/next.ts:1441`) that finally calls `removeMergedWorktree(M, worktree)` and `dispatchDependents(M.repo, M.state.slug)`.

#### 3. Three concrete paths where stacked member `M` fails on `HEAD` (`f3557d8`)

1. **Failure Mode A — `H`'s tab is already closed (or `akrogon phase H merged` is run outside `H.state.pane.B`)**:
   - If the operator runs `akrogon phase H merged` from their own terminal, or `H`'s tab was closed before merge, Hook 1 (`pane_agent_status_changed` on `H.state.pane.B`) and Hook 2 (`tab_closed` on `H.state.tab`) **never fire**.
   - Because `reconcileBatch` skipped `M` (Step 2) and `mergeWake` does not call `reconcile()` or `dispatchDependents()`, **`M`'s tab stays open, `M`'s worktree stays on disk, and neither `H`'s nor `M`'s dependents are dispatched** until someone manually runs `akrogon next`.
2. **Failure Mode B — `M`'s tab was already closed before merge, even when `H`'s tab closes normally**:
   - Suppose `M`'s tab was closed while `M` was waiting in the merge queue (`tabLive(panes, M.state.tab) === false`).
   - When `H` merges and `H`'s `tab_closed` fires Hook 2, `reconcile` removes `M`'s worktree — but because `M`'s tab was already dead, `closeTab` does not close a live tab for `M`, so **no `tab_closed` event ever fires for `M`**.
   - Because `dispatchDependents(repo, M.state.slug)` is only called in `reconcileBatch` (`src/next.ts:993`, skipped because `moved` is empty), `pane_agent_status_changed` (`:1477`, never fires for `M`), and `tab_closed` (`:1459`, never fires for `M`), **dependents of `M` (`blocked-by: [M]`) are NEVER dispatched!**
3. **Failure Mode C — `move()` (`src/batch.ts:154-174`) corrupts dirty member worktrees (`dirty-ref`) so `reconcile` keeps them forever**:
   - When `M` is merged as a stacked member, both `batchPush`/`finishPush` (`src/phase.ts:630, 740`) and `reconcileBatch` (`src/next.ts:974`) call `await move(repo, M.slug, M.tip, M)`.
   - Inside `move()` (`src/batch.ts:159-166`):
     - If `git -C <M-worktree> status --porcelain` is non-empty (for example, `M`'s worktree has a single untracked scratch file), `move()` runs:
       ```ts
       await git(repo.root, ['update-ref', `refs/heads/${slug}`, tip]);
       return 'dirty-ref';
       ```
     - Because `<M-worktree>` has `refs/heads/<M>` checked out (`HEAD -> refs/heads/<M>`), updating `refs/heads/<M>` to `M.tip` (which includes `main` + `H`'s commits + `M`'s rebased commits) underneath the live worktree **without updating the worktree's index or working tree** causes `git status --porcelain` in `<M-worktree>` to immediately show **every file changed between `M.head` and `M.tip` as staged/modified in reverse**!
     - Even worse: why is `move()` updating `refs/heads/<M>` and resetting `<M-worktree>` to `M.tip` on merge in the first place when `<M-worktree>` and `refs/heads/<M>` are immediately slated for deletion by `removeMergedWorktree` (`src/reconcile.ts:213-222`)? And if `<M-worktree>` was clean except that `git reset --hard <M.tip>` fails (e.g., an untracked file in `<M-worktree>` collides with a tracked path added on `main` or `H`), `move()` falls back to `update-ref` (`dirty-ref`), leaving `<M-worktree>` permanently dirty so `removeMergedWorktree` (`src/reconcile.ts:46`) keeps it forever as `'uncommitted changes'`.

---

### Five parts for Q1

1. **The pick with its reason and cost**:
   - **Pick**:
     - **Close member tabs, dispatch dependents, and reconcile directly in the merge completion path (`reconcileBatch` / `mergeWake`)**: In `reconcileBatch` (`src/next.ts:967-995`), collect all `batch.members` whose phase is now `'merged'` (not only crash-recovery members that entered `reconcileBatch` still at `phase === 'merge'`) — plus `holderNow` when `holderNow.state.phase === 'merged'` — and for every such leaf call `closeMergedTab(repo, item, livePanes)` and `dispatchDependents(repo, item.state.slug)`, followed by a `reconcile(repo, ...)` pass in `mergeWake` (`src/next.ts:857-884`).
     - **Stop calling `move()` on stacked members when transitioning to `'merged'`, and keep the `removeMergedWorktree` cleanliness check on the leaf worktree itself**: When `batchPush` (`src/phase.ts:630`), `finishPush` (`:740`), or `reconcileBatch` (`src/next.ts:974`) marks a stacked member `'merged'`, do **not** run `move(repo, member.slug, member.tip, leaf)` (which resets `<member-worktree>` to `member.tip` or runs `update-ref refs/heads/<member> <tip>` under a checked-out worktree). `move()` is only needed when a member stays in `phase: 'merge'` (Wait, `move()` is not even called then — `move()` has **no callers at all** except the three `'merged'` transitions!). In `removeMergedWorktree` (`src/reconcile.ts:213-222`), keep `worktreeClean(worktree)` so genuinely uncommitted work in a leaf worktree is preserved (and surfaced by Q2's `Kept:` line), and delete the local branch after worktree removal with `git branch -D <slug>` (or `update-ref` after worktree removal + `branch -d`) since the member's old branch tip was cherry-picked/rebased onto `batch.tip` (`origin/main`) and is therefore not an ancestor of `HEAD` unless moved.
   - **Reason**:
     - Restoring direct tab closure and dependent dispatch in `reconcileBatch` + running `reconcile` in `mergeWake` eliminates Failure Modes A and B completely: stacked members' tabs close, their worktrees are reconciled, and their dependents are dispatched immediately on `akrogon phase <holder> merged`, regardless of whether the holder's or member's tab was still open.
     - Dropping `move()` on `'merged'` transition eliminates the `dirty-ref` index corruption where `git update-ref refs/heads/<member> <tip>` under a checked-out worktree makes the worktree look massively dirty, while keeping `worktreeClean(worktree)` in `removeMergedWorktree` still protects any real uncommitted edits in the leaf worktree.
   - **Cost**:
     - About 20 lines touched across `src/next.ts`, `src/phase.ts`, `src/batch.ts`, and `src/reconcile.ts`, plus updating unit tests in `tests/batch.test.ts` (which currently test `move()` directly) and `tests/reconcile.test.ts`.

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Rely on the existing `tab_closed` / `pane_agent_status_changed` hook chain without changing `reconcileBatch` / `mergeWake`**:
     - *Reason*: Fails whenever the holder's tab is already closed or `akrogon phase <holder> merged` is run outside Seat B (Failure Mode A), and silently drops `dispatchDependents` whenever a stacked member's tab was closed before the merge completed (Failure Mode B).
   - **Rejected Option 2 — Unconditionally `git worktree remove --force` a merged member's `<slug>` worktree in `removeMergedWorktree` even when `worktreeClean` is false**:
     - *Reason*: Unlike `batch-*` scratch copies (which never hold user/agent authoring state), `<slug>` is a primary leaf worktree. If a user or agent left real unpushed/uncommitted files in `<slug>`, force-deleting `<slug>` destroys them silently, whereas keeping genuinely dirty `<slug>` worktrees and surfacing them via Q2 (`Kept: <path> — uncommitted changes`) is safe once `move()` stops artificially corrupting `<slug>` via `dirty-ref`.
   - **Rejected Option 3 — Keep calling `move()` before worktree removal**:
     - *Reason*: `move()` runs `git reset --hard <tip>` in a worktree that is about to be deleted seconds later, and if `status --porcelain` is non-empty, `move()` runs `git update-ref refs/heads/<slug> <tip>` while `<slug>` is checked out in that worktree, desynchronizing the worktree's index from `HEAD` (`dirty-ref`). If `refs/heads/<slug>` needs to advance to `member.tip` so `git branch -d <slug>` succeeds (because `member.head` was rebased onto `holder.tip` and isn't a raw ancestor of `origin/main`), advancing the ref **after** `git worktree remove` (or using `git branch -D <slug>` once `remoteContains` verified the merge) avoids touching the live worktree.

3. **The evidence with tier, source, and date**:
   - **[Tier 1 — Direct runtime logs, 2026-10-14]**: `/home/ivan/Work/tamdoma/framework/issues/merge-attempts.jsonl` (attempts `ab8e6a2a-c0a2-40fb-b6f4-55502e30a772` at `2026-10-14T06:09:07Z` and `3b9d71b6-8250-4aea-a57b-986dfeff00c3` at `2026-10-14T17:01:06Z`), `/home/ivan/Work/tamdoma/framework/issues/timings.jsonl`, and `/home/ivan/Work/tamdoma/framework/issues/log.jsonl` (`wait` events at `06:09:11.896Z` and `17:01:10.338Z`).
   - **[Tier 1 — Git history & source code, 2026-10-14 to 2026-10-15]**:
     - Commit `6640ab5` (`2026-10-14T17:46:13+02:00`, removed `closableMembers` from `src/next.ts`).
     - Commit `9e4c093` (`2026-10-15T09:40:22+02:00`, reintroduced stacked `batch.members` without `closableMembers`).
     - Current `HEAD` (`f3557d8`, `2026-10-15`): `src/phase.ts:629-636, 737-745`, `src/next.ts:857-884, 967-995, 1429-1495`, `src/batch.ts:154-174`, `src/reconcile.ts:213-260`.

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: Because a stacked member's commits were rebased onto the holder's tip in `buildStack`, the member's original branch `refs/heads/<member>` is not a git ancestor of `origin/main` unless `refs/heads/<member>` was updated to `member.tip`. In `removeMergedWorktree` (`src/reconcile.ts:222`), `git branch -d <slug>` fails on a rebased branch if `refs/heads/<slug>` still points to the pre-rebase commit!
     - *What removes it*: Either run `git update-ref refs/heads/<slug> <tip>` **after** `git worktree remove` succeeds (or in `move()` only when the worktree is already removed/clean), or use `git branch -D <slug>` inside `removeMergedWorktree` (which only runs when `leaf.state.phase === 'merged'`).
   - **Pitfall 2**: Calling `dispatchDependents` both in `reconcileBatch` and again when `tab_closed` fires 1–2 seconds later.
     - *What removes it*: `dispatchDependents` (`src/next.ts:1388-1427`) is already idempotent under `.lock` (it checks `Ready` leaves and starts them once, logging `wait` with `reason: 'none'` if already started), and `pane_agent_status_changed` (`:1477`) + `tab_closed` (`:1459`) already call it back-to-back today for every single-leaf merge.
   - **Pitfall 3**: Running `reconcile` in `mergeWake` while the holder's Seat B pane is still alive (because `akrogon phase <holder> merged` was invoked from inside Seat B).
     - *What removes it*: In `mergeWake`, closing stacked members' tabs first (`closeMergedTab`) and then running `reconcile` removes stacked members' worktrees immediately while keeping the holder's worktree as `'live pane inside'` until Seat B goes idle (`pane_agent_status_changed` -> `closeMergedTab` -> `tab_closed` -> `reconcile`). And if `akrogon phase <holder> merged` was run from outside Seat B with no live panes, `mergeWake`'s `reconcile` cleans up **both** the holder and all stacked members immediately.

5. **Any question the peer would ask that the fork does not ask**:
   - Why does `move(repo, slug, tip, leaf)` (`src/batch.ts:154-174`) exist at all when its only callers (`src/phase.ts:630, 740` and `src/next.ts:974`) immediately set `leaf.state.phase = 'merged'`, sentencing both the member's worktree and `refs/heads/<slug>` to deletion? Replacing `move()` on merge with `git branch -D <slug>` (after `git worktree remove` in `removeMergedWorktree`) removes `move()`, `MoveOutcome`, and the entire `dirty-ref` failure class.

---

## Q2: Should plain `akrogon status` show kept worktrees and their reasons?

1. **The pick with its reason and cost**:
   - **Pick**: **Yes** — plain `akrogon status` (`src/status.ts:369-412`, specifically in the per-repo block around lines `384-393` alongside `Failed:` and `Missing:`) should read `readKept(repo)` (`src/reconcile.ts:127-138`), filter to paths that still exist on disk (`existsSync(entry.path)`), and print `Kept: <path> — <reason>` for each kept worktree even when `leaves.length === 0`.
   - **Reason**:
     - Today `readKept(repo)` is only called inside `renderDetail` (`src/status.ts:352`), which only runs for `akrogon status <slug>` and only matches `entry.path === leaf.state.worktree`.
     - That means:
       1. When all leaves in a repo are closed (`no open leaves`, `src/status.ts:409` — the exact situation in `Tamdoma/akrogon#93` for `tamdoma/framework`), kept worktrees are 100% invisible unless the operator inspects `~/.akrogon/reconcile/<repo>.json` by hand.
       2. Kept directories that do **not** match any leaf's `leaf.state.worktree` (such as `batch-*` copies kept for `'uncommitted changes'` or unregistered folders like `prose-asserts-u1-cmdlogs` kept for `'not a registered git worktree'`) are **never shown even in `akrogon status <slug>`** because `renderDetail` filters by `entry.path === leaf.state.worktree` (`src/status.ts:352`)!
   - **Cost**:
     - ~10 lines in `src/status.ts` and a test case in `tests/status.test.ts`.

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Keep `Kept:` only in `akrogon status <slug>` (`renderDetail`)**:
     - *Reason*: Fails completely when the leaf is already closed/merged (operators don't run `akrogon status <closed-slug>` when `akrogon status` prints `no open leaves`) and never shows non-leaf kept paths (`batch-*` or unregistered directories) at all, since no leaf has `leaf.state.worktree === entry.path`.
   - **Rejected Option 2 — Show `Kept:` only under a new flag (e.g. `akrogon status --kept` or `--all`)**:
     - *Reason*: `Failed:` and `Missing:` are already shown unconditionally in plain `akrogon status` (`src/status.ts:384-391`) because they represent abnormal state requiring operator attention; a leftover worktree that `reconcile` refused to delete is the exact same class of anomaly and is empty (`0` lines) in the healthy steady state.

3. **The evidence with tier, source, and date**:
   - **[Tier 1 — Source code, 2026-10-15]**:
     - `src/status.ts:352` (`const kept = readKept(leaf.repo).find((entry) => entry.path === leaf.state.worktree);` — only in `renderDetail`, only matching `leaf.state.worktree`).
     - `src/status.ts:384-411` (`statusCommand` prints `Failed:` and `Missing:` in the repo loop, then prints `no open leaves` at line `409` if `leaves.length === 0`, never calling `readKept(repo)`).
   - **[Tier 1 — Live machine state (`Tamdoma/akrogon#93`), 2026-10-15]**:
     - `/home/ivan/.akrogon/reconcile/framework.json` held 9 kept entries (13 GB on disk) while `akrogon status` on `framework` printed `no open leaves`.

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: `~/.akrogon/reconcile/<repo>.json` is a snapshot from the last `reconcile` run. If an operator sees `Kept: /path/to/wt — uncommitted changes` in `akrogon status`, deletes `/path/to/wt` manually (`git worktree remove --force` or `rm -rf`), and immediately re-runs `akrogon status` (which is read-only and does not run `reconcile`), `readKept(repo)` would still return the deleted path unless checked.
     - *What removes it*: Filter `readKept(repo)` with `fs.existsSync(entry.path)` when rendering in `src/status.ts` (both in `statusCommand` and `renderDetail`).
   - **Pitfall 2**: Duplicate display when an open leaf has a kept worktree (Wait: `reconcile` never records an open non-merged leaf in `KeptEntry[]` — `reconcileWorktree` at `src/reconcile.ts:288-291` returns `{ action: 'active' }`, and `writeKept` at `:329-333` only persists `action === 'kept'`). However, a merged leaf in `issues/open` (waiting on an unmerged sibling in the same issue) *can* have `action === 'kept'` (e.g. `'live pane inside'` while its tab is still open).
     - *What removes it*: In plain `akrogon status`, suppress `'live pane inside'` if the leaf is already rendered as an active row in the table above, or show all `readKept(repo)` entries filtered by `existsSync(entry.path)` after the table (just like `Failed:` and `Missing:`).

5. **Any question the peer would ask that the fork does not ask**:
   - Should `akrogon status` also filter out `readKept(repo)` entries whose directory no longer exists on disk (`!existsSync(entry.path)`), given that `akrogon status` does not trigger a `reconcile` pass? (Yes — included in Pitfall 1 above.)

---

## Q3: What should `reconcile` do with unregistered folders in the worktree store (`prose-asserts-u1-cmdlogs`)?

1. **The pick with its reason and cost**:
   - **Pick**: **Delete unregistered directories inside `worktreeStore(repo)` (`~/.akrogon/worktrees/<repo>`) when they belong to a merged leaf (name matches `<slug>-*` for a known leaf `<slug>` with `phase === 'merged'` and no live pane inside), and keep + report via Q2 any other unregistered directory**.
   - **Reason**:
     - `~/.akrogon/worktrees/<repo>` is `akrogon`'s private managed worktree store (created and owned by `akrogon`, unlike `repo.root`).
     - How `prose-asserts-u1-cmdlogs` got there: during the `prose-asserts` issue (`merged` in `framework` on `2026-10-14T16:40:17Z`), unit worker `u1` (`prose-asserts-u1`) created a sibling scratch directory `../prose-asserts-u1-cmdlogs` inside `~/.akrogon/worktrees/framework/` and later left it unregistered in git (`!registered.has(full)` at `src/reconcile.ts:390`).
     - Because `reconcile.ts:390` checks `if (!registered.has(full)) { decisions.push(keep(full, 'not a registered git worktree')); continue; }` **before** checking whether `entry` matches a known merged leaf prefix (`<slug>-*`), any unregistered directory or half-removed worktree left behind by a merged leaf stays forever.
     - Deleting unregistered `<slug>-*` folders when `<slug>` is `merged` (and no live pane has its cwd inside) cleans up agent-created sibling artifacts and half-torn-down worktrees automatically once the leaf merges, while keeping truly unknown folders and surfacing them in `akrogon status` via Q2.
   - **Cost**:
     - ~15 lines in `src/reconcile.ts` (around lines `389-396`) plus a test in `tests/reconcile.test.ts`.

2. **Each rejected option with its reason**:
   - **Rejected Option 1 — Keep all unregistered directories forever (status quo, relying only on Q2 to make them visible)**:
     - *Reason*: Requires manual `rm -rf` by the operator whenever a worker creates a `<slug>-*` sibling directory or when a `git worktree remove` partially fails after unregistering the git worktree entry but before removing the directory tree.
   - **Rejected Option 2 — Unconditionally `rm -rf` every unregistered entry in `~/.akrogon/worktrees/<repo>` immediately on every `reconcile` pass**:
     - *Reason*: While a leaf `<slug>` is still **active** (`plan`, `Author`, `review`, `merge`), a worker in `<slug>-u1` might actively be using a sibling directory like `<slug>-u1-cmdlogs` during its run. Reaping `<slug>-*` unregistered directories **only after `<slug>` is `merged`** (or when `<slug>-<unit>` is a dead unit of a leaf and has no live pane) avoids deleting files out from under an active worker.

3. **The evidence with tier, source, and date**:
   - **[Tier 1 — Source code, 2026-10-15]**:
     - `src/reconcile.ts:389-396`:
       ```ts
       if (!registered.has(full)) {
         decisions.push(keep(full, 'not a registered git worktree'));
         continue;
       }
       ```
   - **[Tier 1 — Live machine state (`Tamdoma/akrogon#93`), 2026-10-14 to 2026-10-15]**:
     - `/home/ivan/.akrogon/reconcile/framework.json` entry `{"path":"/home/ivan/.akrogon/worktrees/framework/prose-asserts-u1-cmdlogs","reason":"not a registered git worktree"}` (44 KB), left after `prose-asserts` merged at `2026-10-14T16:40:17Z`.

4. **The pitfalls with what removes each**:
   - **Pitfall 1**: Matching `<slug>-*` by prefix could match a longer leaf slug (e.g. leaf `foo` matching `foo-bar`'s worktree `foo-bar` or `foo-bar-u1`).
     - *What removes it*: Match longest known leaf slug first (or check that the directory is not another leaf's `<otherSlug>` / `<otherSlug>-*`), the exact same disambiguation needed for `<slug>-u<N>` unit directories.
   - **Pitfall 2**: Deleting an unregistered `<slug>-*` directory while an active worker of `<slug>` is still reading/writing it.
     - *What removes it*: Only delete unregistered `<slug>-*` directories when the owning leaf `<slug>` has `state.phase === 'merged'` and `!paneInside(panes, full)`.

5. **Any question the peer would ask that the fork does not ask**:
   - What if `git worktree remove --force <dir>` in `removeWorktree` (`src/reconcile.ts:62-75`) unregisters the worktree in `.git/worktrees/` first and is killed (or hits `ENOTEMPTY`) mid-deletion of the working tree? Then on the next `reconcile` pass, `<dir>` (whether `batch-*`, `<slug>`, or `<slug>-u1`) is no longer in `git worktree list --porcelain` (`!registered.has(full)`), so current `reconcile.ts:390` keeps the half-deleted directory forever as `'not a registered git worktree'`! Allowing `reconcile` to `fs.rmSync(full, { recursive: true, force: true })` unregistered `batch-*` (with no active attempt) and unregistered `<slug>` / `<slug>-*` (for merged leaves) closes that exact partial-removal gap too.

---

# Final-shape check

Disagreements with `/home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/scratch-copy-removal.md` (`## Taken`), specifically the new mechanism *"buildStack names its copy after the leaf's recorded build attempt, so reconcile sees a running build and keeps it"*:

1. **Flaw 1 — A single recorded `state.batch.attempt` calls `buildStack` multiple times, causing `batch-<attempt>` path collisions**:
   - **Evidence (`src/next.ts:1054-1127` and `src/phase.ts:663-686`, `2026-10-15`)**:
     - **Path A (`mergeTurn` rebuild loop in `src/next.ts:1076-1127`)**: `mergeTurn` mints `attempt: attemptId()` once at line `1054` and loops (`while (true)` at line `1076`). Inside the loop, line `1078` calls `await buildStack(repo, builtOn, ...)`. If any stacked member's head moved while `buildStack` was running, lines `1097-1110` prune that member from `current.members`, save `current` **with the same `current.attempt`**, return `'rebuild'` (`:1110`), and line `1127` (`if (outcome === 'rebuild') continue;`) immediately calls `buildStack` a second time with the **same `attempt`**!
     - **Path B (`finishPush` -> `restack` in `src/phase.ts:663, 750`)**: When `akrogon phase <holder> merged` finds that `origin/main` advanced (`non-fast-forward`) or a member moved, `batchPush` (`src/phase.ts:615, 644`) keeps the existing `record.attempt` on `leaf.state.batch` (setting `applied: false`) and `finishPush` calls `restack(repo, leaf, record)` (`src/phase.ts:750`), which calls `buildStack` (`src/phase.ts:663`) while `leaf.state.batch.attempt` is still the **old `record.attempt`**!
   - **What breaks**: If `buildStack` names its directory `path.join(worktreeStore(repo), `batch-${attempt}`)` and the previous `buildStack` under the same `attempt` failed to clean up its directory (or overlapped), `createSparseWorktree` (`git worktree add --detach <dir>`) will fail with `fatal: '.../batch-<attempt>' already exists`.
   - **Fix**: Have `buildStack` name the directory `batch-${attempt}-${attemptId()}` (prefix = recorded `attempt`, suffix = per-invocation UUID), and have `reconcile` (`src/reconcile.ts:381`) treat a `batch-*` directory as active if its basename equals `batch-${attempt}` **or** starts with `batch-${attempt}-` for any `attempt` in `batchAttempts`.

2. **Flaw 2 — `restack` (`src/phase.ts:663`) runs `buildStack` outside `.lock` while `state.batch.applied === false`, allowing a concurrent `mergeTurn` to overwrite `state.batch.attempt` and causing `reconcile` to delete `restack`'s worktree mid-build**:
   - **Evidence (`src/phase.ts:609-620, 638-650, 750, 842-844` and `src/next.ts:1019, 1036, 1054`, `2026-10-15`)**:
     - When `batchPush` (`src/phase.ts:609-650`) sees `non-fast-forward` or member drift, it sets `leaf.state.batch = { ...record, applied: false }` inside `.lock`, **releases `.lock` at `src/phase.ts:842`**, and then runs `await finishPush(outcome)` -> `await restack(repo, leaf, record)` -> `await buildStack(...)` **outside `.lock`** (`src/phase.ts:844, 750, 663`).
     - While `restack` is running `buildStack` outside `.lock`, `leaf.state.batch.applied` on disk is `false`. Any concurrent `akrogon next` / hook pass that enters `mergeTurn` (`src/next.ts:1019`) sees `recorded.applied === false`, enters `prepareBatch` (`:1036`), acquires `.lock`, **overwrites `leaf.state.batch` with a brand-new `attempt: attemptId()`** (`:1054, 1063`), and releases `.lock`.
     - If `reconcile` runs while `restack`'s `buildStack` is still executing, `batchAttempts` (`src/reconcile.ts:281-285`) will only contain the new `attempt` written by `mergeTurn` — not `restack`'s `record.attempt`. `reconcile` will therefore see `restack`'s `batch-*` worktree as orphaned and **force-delete `restack`'s worktree while `restack` is actively running git commands inside it**!
   - **Fix**:
     - Either have `batchPush` mint a fresh `attempt: attemptId()` and keep `applied: true` (or a `restacking: true` / `owner` marker) while `finishPush` -> `restack` is in flight so `mergeTurn` does not clobber `state.batch.attempt` while `restack` is running;
     - **Or (simpler and stronger)**: in addition to naming `batch-${attempt}-${runId}`, have `buildStack` write `.owner` (`{ pid: process.pid, boot_id: currentBoot(), started }`) inside `dir` right after `createSparseWorktree`, and have `reconcile`'s `batch-*` branch (`src/reconcile.ts:380-387`) check `!ownerDead(readOwner(full))` before removing a `batch-*` worktree. `reconcile.ts:89-111` **already implements** `readOwner` and `ownerDead`! Checking `ownerDead` in `reconcile` guarantees no live `buildStack` process ever has its scratch worktree deleted out from under it (even during `restack` or direct unit-test calls in `tests/batch.test.ts` where no `leaf.state.batch` exists on disk), and as soon as `buildStack` exits or crashes, `ownerDead` is true (or `attempt` is cleared) and `reconcile` force-removes it regardless of `.git/rebase-merge`.
