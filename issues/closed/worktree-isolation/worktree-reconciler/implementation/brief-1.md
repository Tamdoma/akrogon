# Brief 1: reconcile core — `src/reconcile.ts`, `src/next.ts`, `src/status.ts`

## 1. Goal

Implement plan.md decisions D1–D9 for leaf `worktree-reconciler`: a per-pass reconciler in new `src/reconcile.ts`, called once per repo from `next.ts` cleanup paths, writing a kept report that `src/status.ts` prints.

## 2. Numbered acceptance criteria

1. `reconcile(repo, leaves, panes)` returns `{removed: string[]; kept: {path: string; reason: string}[]}`; `keptReportPath(repo)` returns `<globalHome>/reconcile/<repo>.json`. The kept report is written atomically (tmp + rename) every run.
2. Removal rule (D4) applied to every removal candidate: `git status --porcelain` empty; no `rebase-merge`, `rebase-apply`, `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD` under `git rev-parse --git-path`; `git rev-list --count HEAD --not --branches --remotes` is `0`. Removal is `git worktree remove` without `--force`; a failed removal is a kept entry with the stderr reason, never fatal. `git worktree prune` runs once BEFORE the `worktree list` sweep and once at the end.
3. Kept reasons (D5): `uncommitted changes`, `rebase in progress`, `merge in progress`, `<n> unreachable commits`, `live pane inside`, `active leaf`, `state.batch`, `unknown directory`, `unmanaged worktree`, `unregistered worktree directory`, `pane list unavailable`, `run in progress`, `no .owner record`, `invalid .owner record`, `unknown scratch directory`, `base-run <id> in progress`.
4. Leaf worktrees (D6): active leaf (phase not merged/failed) with worktree under `worktreeStore(repo)` keeps `active leaf`; any leaf with `state.batch` keeps `state.batch`; a live pane whose `cwd` is `within` the worktree keeps `live pane inside`. Active leaf with recorded worktree OUTSIDE the store: removal only when D4 passes, no pane `cwd` inside, no pane with `tab_id === state.tab`, and `state.batch` undefined; on removal `saveState(leaf.path, {...state, worktree: undefined})`. Otherwise keep with the refusal reason. Merged leaf: if `state.tab` set and the `panes` list has a pane with `tab_id === state.tab`, run `herdr tab close <tab>` and keep `live pane inside`; else removal rule, and on removal `git branch -d <slug>` iff `git show-ref --verify --quiet refs/heads/<slug>` exits 0 (a `-d` failure is a kept entry, branch kept). Failed leaf: same removal rule; branch never deleted. Recorded `state.worktree` whose directory is gone → `saveState` clears `worktree`. Recorded path that exists but is not a registered git worktree → keep `unregistered worktree directory`.
5. Store sweep (D7): candidates are dirs under `worktreeStore(repo)` or under `resolve(repo.root, 'issues/worktrees')`, plus registered worktrees from `git worktree list --porcelain` under those two roots (skip `repo.root` and paths already handled as leaf worktrees). `base-<id>` matching a `readBaseRuns` record with `removed === undefined` goes through criterion 2's rule. `batch-<attempt>` matching a live `state.batch.attempt` keeps. Other registered worktrees go through criterion 2 (seat-made variants). Dirs under the two roots not registered as worktrees keep `unknown directory`. Registered worktrees outside both roots keep `unmanaged worktree` (never removed). Unconfirmed base-run entries whose path no longer exists: skip silently. A dir name matching a readable `state.yaml` slug under `issues/open|closed` but absent from the `leaves` arg (foreign leaf) keeps `unknown directory`.
6. Scratch sweep (D8): scratch root is `resolve(leafTemp(repo, 'x'), '..')`. Leaf scratch dir removed (recursive) when leaf is merged (after its tab is dead per criterion 4) or failed, provided no pane `cwd` inside and `panes` not null. Every `run-*` dir inside any scratch dir including `leafTemp(repo, 'checkout')`: read `.owner` JSON `{pid, boot_id, started}`; remove when `process.kill(pid, 0)` throws ESRCH or `boot_id !== ''` differs from `/proc/sys/kernel/random/boot_id`; live → `run in progress`; missing/unreadable `.owner` → `no .owner record` / `invalid .owner record`, kept. Non-leaf, non-`checkout` scratch dirs → `unknown scratch directory`. No age-based rule anywhere.
7. `panes` param is `Pane[] | null` (caller already resolved or failed): null means pane-dependent removals keep `pane list unavailable`; pane-independent removals still run.
8. `next.ts`: rename `cleanupRepos` → `reconcileRepos`; it resolves `await panes().catch(() => null)` once for the call, then per repo `reconcile(repo, discover(repo, invocation).leaves, live)` and writes the kept report. The `tab_closed` path's `removeLeafTemp` call is replaced by the same reconcile call for that repo (reusing the fetched panes). `removeLeafTemp` and `cleanupMerged` are deleted; `closeMergedTab` logic moves into `reconcile`. The pane-hook path's `closeMergedTab(owner.repo, rediscovered)` call must still work — export an equivalent (e.g. `closeMergedTab(repo, leaf, panes)` from `reconcile.ts`) preserving its semantics (close only when a pane of the tab is live; batch members skipped via `batchMemberSlugs`).
9. `status.ts`: `statusCommand` (the bare `akrogon status` path, not the slug detail path) reads `keptReportPath(repo)` per repo — zod-parse `{kept: {path, reason}[]}`, tolerate absent/corrupt file as empty — and prints `Kept: <path> — <reason>` lines immediately before the `console.log(paint('1;4', ...))` repo-name line in the final scan loop. No git or herdr calls in status (existing tests demand no herdr calls).
10. Types strict; no `any`. Follow existing file style: `command`/`run`/`CommandError` from `./shell`, zod schemas at boundaries, no comments unless needed.

## 3. Read-first list

- `plan.md` at the leaf folder (D1–D9 authoritative).
- `src/next.ts` lines 780-840 (removeLeafTemp/closeMergedTab/cleanupMerged/sweepAll), 1495-1511 (cleanupRepos), 1600-1700 (hook paths), 205-235 (inWorktree/panes seam).
- `src/config.ts` 217 `within`, 250 `worktreeStore`, 256 `leafTemp`, 190 `globalHome`.
- `src/base-run.ts` — `baseRunSchema`, `readBaseRuns`.
- `src/batch.ts` — `batchMemberSlugs`.
- `src/shell.ts` — `command`, `run`, `Result`, `CommandError`, `writeYaml`, `paneSchema`, `herdr`.
- `src/state.ts` — `Leaf`, `saveState`, `leavesUnder`.
- `src/status.ts` — `statusCommand` repo loop (~line 380).
- `tests/reconcile.test.ts` — the red tests this code must turn green; do not edit.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- New `src/reconcile.ts` — the whole sweep per criteria above.
- `src/next.ts` — `cleanupRepos` rename and rewiring, `removeLeafTemp`/`cleanupMerged` deletion, `tab_closed` path calls reconcile, pane-hook `closeMergedTab` call updated to the exported form.
- `src/status.ts` — kept-report read + `Kept:` lines.
Owns those three files only. No test edits. Prerequisites: none (wave 1). Test resource: `tests/reconcile.test.ts` and `tests/next.test.ts` already encode every behavior; run them under section 7.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file — planned tests belong to A; a red planned test after correct code is a mismatch return, not a test fix.
- Do not use `git worktree remove --force` — force bypasses the refusal rules the criteria require; exception: none.
- Do not remove run roots without `.owner` or with unparseable `.owner` — the plan forbids age-based removal; exception: none.
- Do not call `tabs()`/`workspaces()` in status or reconcile — status must stay read-only w.r.t. herdr; pane info arrives via the `panes` param only. Exception: `herdr tab close` is the one allowed herdr mutation, only for merged leaves with a live tab.
- Do not remove worktrees outside the store and the old `issues/worktrees` root — they keep `unmanaged worktree`; exception: a leaf-recorded `state.worktree` anywhere is handled by criterion 4.
- Do not change `state.pane`, `state.tab` or failure records — only `worktree` may be cleared; exception: none.
- Do not widen scope (no refactor of sweep/dispatch logic beyond the rewiring listed).
- Return a mismatch with evidence rather than changing scope or an interface; the exception is a revised brief from A authorizing that change.
Restated: no test edits, no force, no age-based removal, no extra herdr reads, no out-of-root removals, no record wiping, no scope creep — mismatch to A for anything else.

## 6. Ordered steps

1. Read plan.md and the listed surfaces (criteria 1-9).
2. Write `src/reconcile.ts` (criteria 1-7): small helpers `worktreeRemovable(repo, path): Promise<{ok:true}|{ok:false;reason:string}>`, `livePaneInside(panes, path)`, owner-liveness, scratch/store/leaf sweeps; export `reconcile`, `keptReportPath`, `closeMergedTab`.
3. Edit `src/next.ts` (criterion 8): replace `cleanupMerged`/`removeLeafTemp`/`cleanupRepos` bodies, wire `tab_closed` and pane-hook paths. Delete now-dead imports/helpers (e.g. `removeLeafTemp` uses) but keep `closeMergedTab` callers working via the new export.
4. Edit `src/status.ts` (criterion 9).
5. Run section 7's command; repair within your three files until green or mismatch.
Advisory size: 3 files (1 new ~250-350 lines), under 30 turns.

## 7. Commands

`bun test --changed=64f27d0e3c4ae254a6aafd49ea393033dc677606 --timeout=30000`

Run `bun install --frozen-lockfile` first if `node_modules` is absent in your worktree. If a changed-test selection misses `tests/reconcile.test.ts` or `tests/next.test.ts`, run `bun test tests/reconcile.test.ts tests/next.test.ts --timeout=30000` explicitly — both must pass before you commit.

## 8. Done-when, evidence and report

All criteria 1-9 implemented; `tests/reconcile.test.ts` fully green; `tests/next.test.ts` fully green; changed-test command green; worktree committed on the detached HEAD with a descriptive message (no test files in your diff — if a red test needs a fix that is a mismatch, stop and report it).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
