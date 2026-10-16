# Plan: agent-worktrees

Reconcile removes a registered Claude Code agent worktree at `<repo>/.claude/worktrees/agent-<id>` and its branch when the recorded `claude agent` lock's owner pid is provably dead and every commit is landed on the repo's target; everything else keeps today's keep with a reason. `debate: no` — planned directly from the locked design.

## Read first

- `issues/open/leftover-worktrees/agent-worktrees/brief.md`, `design.md` — contract and binding decisions.
- `src/reconcile.ts` — `reconcile()` registered-worktree loop (the `for (const path of registered.keys())` block that keeps out-of-store paths as `unmanaged worktree`), `removeWorktree`, `worktreeRemovable`, `keepLocked`, `livePaneInside`, `dropChecked`, `writeKept`/`writeKeptReport`, `reconcileNeedsPanes`.
- `src/admission.ts` — `liveStartTime`/`startTime` field-22 reader (today module-private).
- `src/config.ts` — `target(repo)` (`<remote>/<default_branch>`), `within`, `worktreeStore`.
- `src/leftovers.ts` — `leftover()` lstat filter (kept entries naming gone paths drop out).
- `tests/reconcile.test.ts`, `tests/helpers.ts` — `dispatchFixture`, `leaf`, `next`, `keptReport`, `branchExists`, `worktreeList`, `procRoot`, real-git fixtures, `AKROGON_PROC_ROOT`.
- `src/next.ts:1336,1461` — `reconcile(repo, leaves, needsPanes ? panesOnce() : [])` call sites.
- `learnings/LESSONS.md` — 2026-09-10 run-the-code lesson: verify by executing, not reading.
- `issues/chart/leftover-worktrees/forks/auto-remove.md` — readiness proofs (locked remove refused, update-ref wrong-old refuses, ignored files do not block).

## Decisions

- D1 (scope, design "Scope"): only registered worktrees at exactly `<repo.root>/.claude/worktrees/agent-<id>` with a lock exactly `claude agent agent-<id> (pid N start T)` and identical `<id>` are candidates; every other registered worktree and every other lock keeps today's handling unchanged.
- D2 (design 1a): owner released iff `liveStartTime(N)` is `undefined` (pid gone) or a string `!== T`. Non-ENOENT read errors (EACCES/EPERM, others) mean not released — the worktree is kept `unmanaged worktree` as today. Export `liveStartTime` from `src/admission.ts`; write no second reader.
- D3 (design 2a): eligibility, all required — `row.branch` defined and `!== repo.config.default_branch`; `git rev-list --merges --count refs/remotes/<target(repo)>..HEAD` is `0`; `git cherry refs/remotes/<target(repo)> HEAD` prints no `+` line; every git call exiting non-zero (missing target included) is a keep. `worktreeRemovable` (clean porcelain, no rebase/merge markers, no unreachable commits) supplies criterion-3's tracked/untracked/in-progress checks and runs inside `removeWorktree` as today.
- D4 (binding avoidance): on an eligible candidate — `live === null` keeps `pane list unavailable`; `livePaneInside` keeps `live pane inside`; then `removeWorktree(path, false, 'ended agent worktree', row.locked)` runs its process/owner vetoes and `worktreeRemovable` unchanged, and only then `git worktree unlock <path>`, then non-force `git worktree remove`. On any failure after the unlock succeeded, best-effort `git worktree lock --reason <row.locked> <path>` restores the worktree as found (a failed unlock itself leaves the lock in place, no re-lock needed). Keep reasons keep today's exact wording where today's checks fire; everything failing D1/D2/D3 falls through to `keep(path, 'unmanaged worktree', ...)`.
- D5 (design 3a): after a successful remove, `git update-ref -d refs/heads/<row.branch> <row.head>`; on exit 0 done, on failure `git rev-parse --verify refs/heads/<row.branch>` — ref gone or pointing elsewhere is the chosen silent keep; still at `row.head` is a real delete failure recorded `keep(repo.root, <stderr>, 'resolve the ref error and delete the branch explicitly')` (repo.root survives `writeKept`'s gone-path pruning; keeping on the removed path would be dropped by it and by `leftovers.ts`).
- D6: `reconcileNeedsPanes` gains one clause — return `true` when `git worktree list --porcelain` names a path under `resolve(repo.root, '.claude/worktrees')` whose basename starts `agent-`. Without it an agent-worktree-only pass calls `reconcile` with `live = []` and the pane veto would silently never fire.
- D7 (proofs): one merged-commit test uses a branch whose commits are all on `origin/main` but whose range contains a merge — `git cherry` ignores merge commits, so only the `rev-list --merges` check keeps it; proven locally. The mid-pass branch-move race (criterion 4) is not injectable in-process: a moved ref makes the worktree dirty and is kept by porcelain before any delete is reached. The binding is covered by the readiness proof (wrong-old refuses) and the ref-lock error path test.

## Interfaces

- `src/admission.ts`: `export function liveStartTime(pid: number): string | undefined` (unchanged body).
- `src/reconcile.ts`: `removeWorktree(path, force, rule, unlock?: string)` — `unlock` is the lock reason; truthy runs unlock before `git worktree remove` and re-locks on a post-unlock failure.
- `src/reconcile.ts`: module-private `agentId(basename)`, `claudeAgentLock(locked)` regexes and the `released` check around `liveStartTime`.

## Changes (all inside `reconcile(repo, leaves, live)` and helpers)

1. `registered.keys()` loop, before `underRoot`/`unmanaged`: agent-path match → lock regex + released check → D3 eligibility (fallthrough `unmanaged worktree` on any failure) → pane vetoes → `removeWorktree` with `row.locked` as `unlock` → on success the D5 branch delete.
2. `removeWorktree` signature + unlock/re-lock block.
3. `reconcileNeedsPanes` agent-dir clause (D6).

## Tests (tests/reconcile.test.ts, added — commit carries `Test-Change: tests/reconcile.test.ts <reason>`)

- T1 `ended claude agent worktree is removed and its landed branch deleted` (C1): worktree `-b agent-<id>` at `main` tip plus a landed same-patch commit, locked `claude agent agent-<id> (pid 4194303 start 0)`; `next --all`; assert dir gone, absent from `git worktree list`, `refs/heads/agent-<id>` deleted, `keptReport` `removed` row has `{path, head: <tip>, rule: 'ended agent worktree'}`.
- T2 `agent worktree with a live lock owner stays` (C2): spawn `sleep 300`, lock `pid <child> start <field-22>`; assert exists, still `locked`, `kept` carries `unmanaged worktree`.
- T3 `agent worktrees failing one check stay locked as unmanaged` (C3): eight locked dirs — `+` commit unlanded, tracked change, untracked file, landed-range merge commit, detached HEAD, lock `claude agent` absent/other form, same lock on `agent-<id>` outside `.claude/worktrees`, pane-inside moved to T4 — each kept, still locked, `unmanaged worktree`.
- T4 `eligible agent worktree stays while a pane or process sits inside` (C3 vetoes + D6): pane cwd inside (fake herdr), fake proc root cwd inside; assert `live pane inside`/`process <pid> inside`, exists, locked.
- T5 `ignored files do not block agent worktree removal` (C5): `.gitignore`d `node_modules/` inside; assert removed, branch deleted.
- T6 `a removed agent worktree with a stuck branch ref reports the delete error and re-lock covers a failed remove` (C4 + avoidance): (a) stale `.git/refs/heads/agent-<id>.lock` makes `update-ref` fail while the ref verifies — kept entry on `repo.root`, worktree still gone; (b) unwritable parent makes `git worktree remove` fail — worktree exists, `git worktree list` shows the original lock reason back, kept entry present.

All tests build on existing fixtures; nothing mocks git. Synthesis red runs, each through `akrogon run-check`:

- T1 `check plan-t1: 1 .../check-plan-t1-1792133116556-1339225.log` — `existsSync(landed)` true on main.
- T2 `check plan-t2: 1 .../check-plan-t2-1792133140500-1399465.log` — red on the recycled-pid removal assertion; the live-owner half keeps today (green in the same run is impossible without release).
- T3 `check plan-t3: 0 .../check-plan-t3-1792133140801-1399924.log` — green today: every listed keep is today's `unmanaged worktree`, so the test guards the new path from day one.
- T4 `check plan-t4: 1 .../check-plan-t4-1792133141042-1400572.log` — no pane veto for this path today.
- T5 `check plan-t5: 1 .../check-plan-t5-1792133123741-1360289.log` — dir kept today.
- T6 `check plan-t6: 1 .../check-plan-t6-1792133141288-1400993.log` — worktree kept today, no delete attempted.

## Criterion → observation map

| C | Observation | Command | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | fs/worktree-list/ref/report before→after | `bun test tests/reconcile.test.ts -t 'ended claude agent worktree'` (planned red) | seconds | any reconcile diff |
| 2 | live-owner keep | `-t 'live lock owner'` | seconds | admission/reconcile diff |
| 3 | 8-way keep matrix + vetoes | `-t 'failing one check'` + `-t 'pane or process sits inside'` | seconds | reconcile diff |
| 4 | bound delete: ref-lock error path + gone ref; race accepted | `-t 'stuck branch ref'` | seconds | D5 code change |
| 5 | ignored file removed | `-t 'ignored files'` | seconds | D3/porcelain change |
| 6 | existing tests stay green | `bun test tests/reconcile.test.ts` | seconds | any reconcile diff |

## Waves

- Wave 1 (serial-solo): `src/admission.ts` export; `src/reconcile.ts` agent branch + `removeWorktree` unlock + `reconcileNeedsPanes`; `tests/reconcile.test.ts` new cases; `README.md:138` + `src/AREA.md` reconcile bullets get the agent-worktree clause. One coherent removal rule, no independent units; implement-issue runs it serial-solo.
- Docs affected: README.md (one clause in the pass paragraph), src/AREA.md (one clause in the reconcile bullet). No guide or skill file enumerates removed worktree kinds.

## Verification

`bun test tests/reconcile.test.ts` green; configured `checks` (`format`, `test`, `typecheck`) run under `akrogon run-check` at implementation; a deliberate-break probe (e.g. dropped owner-liveness check) shows the keep tests catching it.

## Notes and limitations

- Branch-move-between-proof-and-delete is a genuine mid-pass race with no deterministic in-process injection; covered by `update-ref -d` expected-old semantics (readiness proof) and the T6a error path.
- `target(repo)` is the last-fetched tracking ref; a stale ref over-keeps, matching the design's accepted limit.
- Criterion-3 keeps report `unmanaged worktree` (today's wording for that branch), not the keep reason naming the failed check; the lock itself stays on disk as found.

## Implementation notes

2026-10-16 (check.fix, F1): the design's "re-lock on removal failure so the worktree is left as found" is bounded by git, which unregisters a worktree before deleting its files — after such a failure no lock can be re-applied. Decision within the design's intent: the lock restore is best-effort; a worktree that lost registration to a failed remove is left recorded with the removal error and surfaces under the unregistered-entry rules instead of silently vanishing. The planned parent-permission failure is proven: directory left on disk, unregistered, kept entry recorded.

2026-10-16 (check.fix round 2, F1 resolved): the operator revised the binding-avoidance decision in design.md — a proven worktree is disposable, so a failed remove is never undone: re-lock with the original reason while git still registers the worktree; once unregistered, record the remove error as a kept entry. The implementation already does exactly this (best-effort re-lock; remove error kept); no code change needed.
