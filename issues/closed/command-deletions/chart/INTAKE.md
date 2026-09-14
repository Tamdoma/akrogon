# Intake: command-deletions

## Scope
Destination: the akrogon command drops every mechanism the process review found to fire never, once, or wrongly, with no change for valid input. One code leaf in the akrogon repo, like `audit-fixes`. Items with no operator fork, accepted with the list: delete `recoverMerge` and refuse an empty diff at `check.review`; delete per-repo `max_active`; `hooked = event !== undefined`.

## Provenance
- Operator: 2026-09-14 chat, "ok, let's chart in that order. Let's go", accepting the L1 list below.

## Source: operator 2026-09-14
L1 Command deletions, one code leaf like audit-fixes. Drop stand-in and the `unknown` jump (all three reviewers agree). `failed` exits to any phase. Delete `recoverMerge`, refuse empty diffs. Drop per-repo `max_active`. Drop the `debate` key. Drop the repo lock. Fix `hooked = event !== undefined`. Every item deletes code.

Goals for this charting: keeping simplicity, not increasing complexity unless it REALLY benefits the process, but even then only minimal. Then cost, then speed.

## Agent findings
Verified against `src/` on 2026-09-14. Reviews: `process-review-claude.md`, `process-review-slot-b.md`, `astra-6-akrogon-audit.md` at the repo root.

1. Stand-in and unknown jump. `seatFor` (src/next.ts:212) sends a slot's third attempt to the peer pane; used at :387 and :504. `dispatchSlot` sets attempts to 2 when a pane is neither busy nor idle (:390-397), and `unknown` is the only such status (`busy` :166, `idle` :169). Fired 11 times across 132 leaves, rescued zero dead panes. framework `batch-skills` log lines 70 and 71: one session recorded B's fix and then A's approval of it. akrogon `status` and `init-issues` reached A:3 within 144 s and 139 s of entering review.
2. `failed` exit. routing.ts:35 allows `implement` only. All three real failures were attempt failures, two in plan phases (`pull-close` plan.positions, `unit-specs-lane` plan.synthesis); both were hand-edited back. `commitMove` (src/phase.ts:20-40) already resets attempts, done, verdict and prompted on every move.
3. `recoverMerge` (src/phase.ts:156-167). 134 merge to merged records, 131 recorded by the merge slot itself. The one firing was framework `migrate-charts`: an empty branch two reviewers passed, "merged" with no checks and no broadcast. It runs `git fetch` with a 60 s retry inside the global lock on every event of a merge leaf. Without it, a merge session that dies after pushing is re-prompted by the next event and records `merged` itself. `requireCodeOnly` (src/phase.ts:148) gains the empty-diff refusal, so an empty branch stops at implement.
4. Per-repo `max_active`. src/config.ts:32, :125-130 (`repo_max_active` in `config` output), src/next.ts:264-283 (`perRepo` counts), :305-306. Unset in all three registered repos. Docs: next.html:65, setup.html:65, cheat.html:89. Tests: config.test.ts:19-56, next.test.ts:543-640.
5. `debate` key. src/state.ts:19 is the only reader. The schema is `strictObject` and `discover` reads open and closed leaves (src/next.ts:114), so an unmigrated state file becomes unreadable and `activeCount` then counts every leaf of that repo as active (:271-275), blocking dispatch machine-wide. 36 akrogon, 96 framework and about 5 pi-extensions state files carry the key.
6. Repo lock. `withRepoLock` (src/state.ts:136). Holders inside the global lock: phase.ts:179-180, sync.ts:9-10, next.ts:481. Alone: pull.ts:43. pull writes only `issues/seeds/*.md` (pull.ts:71-76); no command reads seeds, and sync excludes them from staging (sync.ts:110) and refuses them staged (:29). Cost: one `flock` process per leaf per dispatch, and at herdr startup `next.sh --all` waits behind `pull.sh --all` GitHub pagination.
7. Hook path. src/next.ts:642-643 computes `hooked` from a `paneOwners` discovery over every repo; a typed `next` in a leaf pane then dispatches that leaf only and skips cleanup. With `hooked = event !== undefined` the typed command sweeps the current repo with cleanup, and the hook branch at :686 keeps its pane guard.
