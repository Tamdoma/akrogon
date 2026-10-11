# Plan: worktree-reconciler

Debate: off (`debate: no`). Synthesized directly from brief.md and design.md. Design wins where it narrows the brief.

## Read-first

- `src/next.ts` — `cleanupRepos` (1500-1511), `cleanupMerged`/`removeLeafTemp`/`closeMergedTab` (809-833), `tab_closed` flow (1614-1624), `ensureWorktree` path check (312-316), `inWorktree` (217), `createSparseWorktree` (281), `panes()` seam via `shell.ts:198`.
- `src/config.ts` — `worktreeStore` (250), `leafTemp` + `AKROGON_LEAF_TEMP_ROOT` (256), `within` (217), `globalHome` (190).
- `src/base-run.ts` — `baseRunSchema` (record fields: `path`, `removed`, `boot_id`, `pid`), `readBaseRuns`.
- `src/state.ts` — `saveState`, `state.batch` schema, phase enum (`merged`, `failed`).
- `src/run-check.ts` — run root `.owner` record `{pid, boot_id, started}`.
- `src/batch.ts` — `attemptId`, `batchMemberSlugs`, store dir `batch-<attempt>`.
- `tests/helpers.ts` — `fixture`, `cli` (sets `AKROGON_LEAF_TEMP_ROOT`), `fakeHerdr`, `tmpdirOf`.
- `tests/next.test.ts` — existing merged-cleanup tests to be changed (1253, 2513, 3928, 3998).
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `README.md`.
- `learnings/LESSONS.md` — herdr stderr parse (already guarded), prefer refusal/reason/side-effect assertions over prose.

## Decisions

- D1. New `src/reconcile.ts` exports `reconcile(repo, leaves, panes): Promise<{removed: string[]; kept: {path: string; reason: string}[]}>` and `keptReportPath(repo)`. `leaves` is the caller's `discover` inventory (open+closed). `panes` is `Pane[] | null`; `null` (pane listing failed or herdr absent) means every pane-dependent removal keeps with reason `pane list unavailable` — pane-independent removals (dead-pid run roots, clean merged worktrees with no live tab) still run. Reconcile reads `git worktree list --porcelain`, `readBaseRuns(repo)` and the scratch root `resolve(leafTemp(repo, 'x'), '..')` listing. It is the single owner of all removal decisions. Leaf lookup for foreign-safety collects readable `state.yaml` slugs under `issues/open|closed` directly (foreign leaves are skipped by `discover` but their slugs protect their store dirs); a store dir matching a readable slug absent from `leaves` keeps `unknown directory`.
- D2. Call site: rename `cleanupRepos` → `reconcileRepos` in `src/next.ts`; it calls `reconcile` once per repo (passing `await panes().catch(() => null)` once for the batch of repos) and writes the kept report to `keptReportPath(repo)` (`<globalHome>/reconcile/<repo>.json`). Every `next` pass already reaches `cleanupRepos` (single-leaf, `--all`, `--resume`, unpause); the `tab_closed` path's `removeLeafTemp` call is folded into a `reconcile` call for that repo. `removeLeafTemp` and `cleanupMerged` are deleted; `closeMergedTab` moves into `reconcile` (merged leaf, tab exists, tab has live panes → `herdr tab close`).
- D3. Status: `statusCommand` reads `keptReportPath(repo)` (no git, no herdr — keeps the "without writes or herdr calls" tests green) and prints one line per kept entry before each repo's name line, `Kept: <path> — <reason>` (capital K, matching `Missing:`/`Failed:`). Report file is written atomically (tmp + rename) each reconcile run; absent file → nothing printed.
- D4. Removal rule (applied to any candidate worktree not kept): removable only when `git status --porcelain` is empty (covers sparse worktrees as clean — DC5), no `rebase-merge`/`rebase-apply`/`MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REVERT_HEAD` exists under its `--git-path`, and `git rev-list --count HEAD --not --branches --remotes` is 0. Removal is `git worktree remove` (no `--force`; refused cases are kept reasons, not forced). After each sweep `git worktree prune` runs once.
- D5. Keep reasons, one per kept entry: `uncommitted changes`, `rebase in progress`, `merge in progress`, `<n> unreachable commits` (count from rev-list), `live pane inside`, `active leaf`, `state.batch`, `unknown directory`, `unmanaged worktree`, `unregistered worktree directory`, `pane list unavailable`, `run in progress`, `no .owner record`, `invalid .owner record`, `unknown scratch directory`, `base-run <id> in progress`. A removal `git worktree remove`/`-d` failure is a kept entry with the command's stderr reason, never fatal to the pass.
- D6. Leaf worktrees: for every leaf with `state.worktree` that exists and is a registered worktree — keep when leaf is active (phase not merged/failed) and path is under `worktreeStore(repo)`; a live pane (pane cwd `within` worktree) always keeps; `state.batch` always keeps. Outside the store an active leaf's worktree is migrated: remove only under D4 rules and when no pane cwd and no pane's tab (`state.tab`) is live; then `saveState` with `worktree: undefined` so `ensureWorktree` recreates it sparse under the store — the recorded `pane`/`tab` records stay. Otherwise keep with reason (DC4 refusals). Merged leaf: `closeMergedTab` semantics preserved — tab with live panes → close it, keep worktree+scratch this pass (`live pane inside`); no tab or dead tab → removal rule; on success `git branch -d <slug>` iff `refs/heads/<slug>` exists (failure → kept entry). Failed leaf: same removal rule; branch never deleted.
- D7. Store sweep: every directory under `worktreeStore(repo)` or under the old default `resolve(repo.root, 'issues/worktrees')`, and every registered worktree from `git worktree list --porcelain` under those two roots (skipping `repo.root` and leaf-recorded paths already handled) — `base-<id>` matching an unconfirmed `readBaseRuns` record (`removed === undefined`) goes through D4 (DC6); `batch-<attempt>` matching a live `state.batch.attempt` keeps; anything else registered goes through D4 (seat-made variant checkouts; removable candidates get `git worktree remove`; branch `-d` only via the merged-leaf path in D6). Unregistered dirs under those roots keep `unknown directory`. Registered worktrees outside both roots keep `unmanaged worktree` — reported, never removed. Unconfirmed base-run entries whose path no longer exists are skipped silently.
- D8. Scratch sweep: scratch root = `resolve(leafTemp(repo, 'x'), '..')`. For each leaf, its scratch dir is removed (recursive) when the leaf is merged (after its tab is dead) or failed — provided no pane cwd is inside it and `panes` is not null; the per-leaf `tmp`-named sentinel files inside are discarded (existing tests). For every `run-*` dir inside any scratch dir (live leaf's too, including `leafTemp(repo, 'checkout')`): read `.owner`; dead owner (`process.kill(pid,0)` → ESRCH, or `boot_id` ≠ current `/proc/sys/kernel/random/boot_id`, boot_id '' matches any boot) → remove the run root; live owner → keep `run in progress`; missing/unreadable `.owner` → keep, no removal (no age rule). Scratch dirs not belonging to a leaf or `checkout` → `unknown scratch directory`, never removed.
- D9. Reporting granularity: one sidecar per repo per pass. `removed` list and `kept` list recorded; the status command only surfaces `kept`.
- D10. DC7: `fixture()` in `tests/helpers.ts` registers every created `akrogon-*`/`akrogon-adv-*`/`chart-usage-*`/`akrogon-self-update-*` mkdtemp dir in a module-level registry cleaned by a `process.on('exit')` sweep (covers assertion-killed tests; `clean()` stays the primary path). Proof is a one-line shell diff around `bun test`, so it needs no new machinery.
- D11. Existing tests that change: `next.test.ts` — "dirty merged worktree cleanup drops the leftover and removes the worktree" → dirty merged worktree is kept and reported; "a seat-B idle hook closes the merged leaf tab while the worktree and branch stay" → after the close pass the worktree and branch are gone; "closed tab scratch keeps failed folder and sentinel" → failed leaf scratch is swept when no live panes; "startup retains a merged leaf's worktree…" → merged leaf worktree removed once tab is dead; "sweep scratch catch-up…" → merged leaf worktree assertions updated. Commits touching them carry `Test-Change:` trailers.

## Interfaces

- `reconcile(repo, panes)` — consumed by `next.ts` only.
- `keptReportPath(repo)` — consumed by `status.ts` and `next.ts`.
- Consumed: `worktreeStore`, `leafTemp`, `within`, `globalHome` (config); `readBaseRuns`, `BaseRun` (base-run); `panes`, `Pane`, `command`, `run`, `writeYaml` (shell); `allLeaves`, `saveState`, `Leaf` (state); `batchMemberSlugs` (batch).

## Checklist

Wave 1 — shared kernel (all later units depend on it):
- U1 `src/reconcile.ts` + `src/next.ts` wiring + `src/status.ts` printing. Owns: `src/reconcile.ts`, `src/next.ts`, `src/status.ts`. Implements D1–D9.

Wave 2 (parallel, disjoint paths, all need U1):
- U2 `tests/reconcile.test.ts` — new file covering DC1–DC6 against real git worktrees in the tmp fixture, `akrogon next` passes, `akrogon status` output. Owns: `tests/reconcile.test.ts`.
- U3 `tests/next.test.ts` edits — D11 list. Owns: `tests/next.test.ts`.
- U4 `tests/helpers.ts` exit-registry cleanup + stray-mkdtemp files use it (`tests/install.test.ts`, `tests/chart-usage.test.ts`, `tests/hold.test.ts`, `tests/merge-attempts.test.ts`, `tests/batch-merge.test.ts` keep own worktree cleanup; only home dirs register). Owns: `tests/helpers.ts`, `tests/install.test.ts`, `tests/chart-usage.test.ts`.

Wave 3:
- U5 docs: `src/AREA.md` (reconcile module line), `tests/AREA.md` (reconcile.test.ts line), `README.md` (status kept lines + reconciler note in `next` row). Owns: those files. Deps: U1 for names.

Docs affected: `src/AREA.md`, `tests/AREA.md`, `README.md` — one line each. No `docs/guide/` change (reconciler is internal to `next`/`status`).

## Verification

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| DC1 merged clean → removed, `-d` branch; failed → removed, branch kept | `bun test tests/reconcile.test.ts` — real worktrees, merged/failed leaf states, run `akrogon next`, assert worktree gone, `show-ref` per branch | force-delete, wrong leaf class | seconds | reconcile.ts/next.ts change |
| DC2 kept+reported: dirty, mid-rebase, merge, unreachable N commits, live pane, active leaf, unknown dir | same file + `akrogon status` stdout asserts `kept:` lines | silent removal, missing report | seconds | reconcile.ts/status.ts |
| DC3 dead `.owner` removed, live kept | same file — write `.owner` with dead pid and with `process.pid` | killing live runs, stale-root stock | seconds | reconcile.ts |
| DC4 old in-repo worktree migrated (clean, no panes, no batch) → removed, `state.worktree` cleared, next dispatch recreates sparse under store; refusal cases kept | same file — `git worktree add` at `issues/worktrees/<slug>`, saveState worktree, run `next`, assert store path + sparse marker (`git -C <wt> rev-parse --show-toplevel` + `sparse-checkout list`) | unsafe migration, lost work | seconds | reconcile.ts/next.ts |
| DC5 sparse reads clean | same file — leaf worktree created by `ensureWorktree` (already sparse) survives dirty-check in a keep case and removes cleanly in merged case | treating sparse state as dirt | seconds | reconcile.ts |
| DC6 unconfirmed base-run removed only under D4 | same file — write `issues/base-runs.jsonl` line without `removed`, create `base-<id>` worktree; clean+reachable → removed; dirty → kept | unsafe base-run sweep | seconds | reconcile.ts/base-run.ts |
| DC7 no `/tmp/akrogon-<uid>` debris | `sh -c 'touch /tmp/.leak-mark && bun test --timeout=30000 && test -z "$(find /tmp -maxdepth 1 -name "akrogon-*" -newer /tmp/.leak-mark)"'` from repo root | fixture/child temp leaks | minutes | helpers.ts, any test file |
| Existing checks | `akrogon run-check` wrapped `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE` | drift, type errors, regressions | minutes | every commit |

Slow-run boundaries: DC7 runs the whole suite (~minutes). New reconcile tests are per-case git fixtures (seconds each).

## Red tests to write this pass (A)

- `tests/reconcile.test.ts` — all DC1–DC6 cases above, committed red.
- `tests/next.test.ts` — D11 modified expectations, committed red where they assert old behavior removed by this leaf (dirty-keep, failed-scratch sweep, merged worktree removal timing, seat-B close pass).
- `tests/helpers.ts` registry — additive; alone does not red, so the DC7 proof command is run manually after and recorded.

## Known limitations / notes for review

- `src/run-check.ts:110` currently mkdtemps run roots under `/tmp/akr-` (commit 021a3b4, Chrome socket path). The design's contract ("run root inside per-leaf scratch", consumed by this reconciler) is diverged from by check-env's own landed code. Reconciler sweeps `leafTemp` run roots (base-run's location). `/tmp/akr-*` roots still carry `.owner` but are outside the reconciler's sweep root; the `finally` rmSync in run-check keeps the steady-state clean and killed-run `/tmp/akr-*` debris is out of scope here (framework check-scratch's lane).
- Brief says "run roots whose recorded process is gone are removed"; run-check run roots under `/tmp/akr-` are not swept (above). Noted for review per design-wins rule.
- Registered worktrees outside the store and outside the old `issues/worktrees` default (operator-made, e.g. `~/wt`) are kept with `unmanaged worktree` — reported, never removed. Removal reach extends only to the store root, the old in-repo default root, and leaf-recorded paths anywhere.
- Failed leaf's `state.worktree` outside the store also goes through removal rules (it is not "active"); recorded path cleared only when removal happens. A recorded `state.worktree` whose directory is gone is cleared on the next pass so `ensureWorktree` recreates at the store. A recorded path whose directory exists but is not a registered git worktree keeps `unregistered worktree directory`.
- No age-based removal anywhere.
- `state.batch` on the holder is only cleared by the batch flow; `batch-<attempt>` dirs without a live matching `state.batch` are removal candidates — a crashed merge leaves a stale batch checkout removed next pass.
