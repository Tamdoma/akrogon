# Plan: fresh-first-worktree

Slot A synthesis, 2026-11-25. Serial-solo: one unit, implement-issue's rule has A implement it with no workers.

## Sources

- Leaf: `issues/open/fresh-leaf-base/fresh-first-worktree/{brief,design}.md`.
- Chart evidence: `issues/chart/fresh-leaf-base/forks/leftover-worktree.md` — Taken Q1a (remove and recreate, bound reset), Q2a (refuse dirty leftovers), Q3a (no fetch), the two corrections (unborn branch, checked-out guard; HEAD rule order, `update-ref` shape) and charting proofs G1–G4 (git 2.56.1). This checkout runs git 2.56.1, the version the proofs probe.
- Readiness: `readiness.yaml` — `inputs`, `produces`, `grants`, `retained` all empty; both proofs completed and free/local.
- Binding design: the leaf architecture's gate order and replace sequence, the exported bound-reset function, `worktreeRemovable` exported unchanged from `src/reconcile.ts`, one refusal shape, the `mustCreate` mirror comment update, and the lesson retirement.

## Decisions

- **D1 — Commit-free test.** `refs/heads/<slug>` is commit-free when it exists and `isAncestor(repo.root, provenSha, trackingSha)` is true, where `provenSha` is the branch sha captured once by the existing `branchSha(repo, slug)` and `trackingSha` the captured `localBase(repo)`. That covers behind and equal — both are replaced; no distinction is made (fork G1's `rev-list --count` 0 is the same predicate; `isAncestor` is already imported in `src/next.ts` from `src/batch.ts`, so no new helper). "Equal counts as commit-free" in the design is read as exactly this.

- **D2 — Gate order inside `ensureWorktree`, first allocation only.** The gate evaluates only when `leaf.state.worktree === undefined`, after today's path validation (`Not a worktree root`, `Unrelated worktree` stay first and unchanged):
  1. Store path present → read HEAD's symref (`git symbolic-ref -q HEAD` in the path, exit 1 detached). Refuse when: detached (error names path, `detached HEAD at <sha>`), symref not `refs/heads/<slug>` (names path and the branch it is on), or symref `refs/heads/<slug>` while the ref does not resolve (names path and the unborn branch). Runs before the commit-free/adopt fork, so it fires whatever the branch holds (leaf-review correction).
  2. Branch exists and is not commit-free → adopt exactly as today (path present after step 1, or path absent → existing-branch creation arm).
  3. Branch exists and is commit-free → replace path (D4/D5).
  4. No branch, no store path → today's creation arm unchanged.

- **D3 — One refusal shape.** Plain `Error` with a multiline message, matching how every `ensureWorktree` throw reaches the operator through `report()` in `src/next.ts` (`console.error` JSON on the pass's stderr). Fields in the text: `leaf <slug>`, `path <path>`, the reason, git's stderr verbatim when git refused, the porcelain file list when there is one, and the operator step:
  - kept worktree (dirty/rebase/merge/unreachable): `inspect or save the work in <path>, then run: git worktree remove --force <path>`
  - git refusal carrying `lock` in its stderr: `run: git worktree unlock <path>, then: git worktree remove --force <path>`
  - other git refusal (initialized submodules): the same `remove --force` step
  - HEAD anomalies: `inspect <path> and switch it back onto the leaf branch or remove it with: git worktree remove --force <path>`
  - checked-out elsewhere: `switch that worktree off the branch or remove it: git worktree remove <other-path>`
  No new error class: the refusal is terminal for the pass either way and `report()` prints `.message` only.

- **D4 — Replace sequence.** Only under gate case 3:
  1. Capture `provenSha` and `trackingSha` once, before the lock (the `update-ref` old-value bind is the concurrency guard, not the capture point).
  2. Under `withLock(await worktreeLock(repo.root))`:
     a. When the store path exists: apply exported `worktreeRemovable(repo, path)`; `{ok:false}` → refusal naming its `reason`. Then lock detection: `registeredWorktrees(repo.root)` row for the path with `locked !== false` → refusal with the unlock step. Then `git worktree remove <path>` (no `--force`) through `run`; non-zero exit → refusal carrying git's stderr, unlock step when the stderr contains `lock`.
     b. Re-read `registeredWorktrees(repo.root)` and refuse when any row's `branch` is `<slug>`, naming that worktree's path (the checked-out guard; after removal, so the store path itself never trips it).
     c. `resetLeafBranch(repo, slug, trackingSha, provenSha)` (D6).
  3. Lock released, then today's existing-branch creation: `createSparseWorktree(repo, path, slug, {})` — it takes the lock itself and `withLock` is a non-reentrant `flock -x`, so the reset lock is never held across it.
  When the store path is absent the sequence is identical minus step (a): guard, reset, create. A commit-free branch with no checkout anywhere is reset and recreated — the design's replace rule covers branch leftovers exactly like worktree leftovers.

- **D5 — The store path is always registered when validation passes**, because `git rev-parse --show-toplevel` in it already succeeded. So the checked-out guard can only trip on a *different* worktree, which means the store path must be absent (it is removed in (a) otherwise). Criterion 3's third case is unreachable with the store path present; no test pretends otherwise.

- **D6 — `resetLeafBranch` exported from `src/next.ts`.** Signature `resetLeafBranch(repo: Repo, slug: string, target: string, expected: string): Promise<void>`: one call `git update-ref refs/heads/<slug> <target> <expected>` in `repo.root` through `command`, so a moved or deleted ref throws `CommandError` carrying git's stderr — loud by construction, no custom error. Criterion 5 tests this function directly with an `expected` the ref has moved past. `target`/`expected` are shas, never ref names, so no re-resolution race inside git.

- **D7 — HEAD reads.** Detached/anomaly naming uses `git symbolic-ref -q HEAD` (`run`, exit 1 = detached) plus `git rev-parse HEAD` for the detached sha, and `show-ref --verify --quiet refs/heads/<slug>` for ref resolution — the same verification call the creation arm already makes. `symbolic-ref` answers exactly the three states the gate distinguishes (detached / on `refs/heads/<slug>` / on another branch, unborn included) with no stderr parsing.

- **D8 — Porcelain files in dirty refusals.** Read `git -C <path> status --porcelain` once more inside the refusal construction (the `worktreeRemovable` verdict carries only the reason string), take `line.slice(3)` per line, first 20 in order, plus the total count line when over 20 (`25 files, first 20:`). A clean tree holding `MERGE_HEAD` shows no list — matches the design's parenthetical. Ignored files never appear (porcelain excludes them), which is exactly why an ignored-only leftover is replaceable under criterion 1.

- **D9 — `mustCreate` comment only.** `src/next.ts` line ~816 keeps its path-based logic byte-identical; the comment is rewritten to say a replaced leftover passes `checkBase`'s local proof (`localBase`), which is the ref the replace uses, so it gets no new network call. No behavioral change, no network call added (design exclusion: no fetch, no `mustCreate` remote-proof change).

- **D10 — No store removal on any refusal.** Every refusal is thrown before any mutating git call: HEAD checks before everything, `worktreeRemovable` before `remove`, the checkout guard before the reset, and the reset is the only ref mutation — atomic inside `update-ref`. `state.worktree` is recorded only in `ensureWorktree`'s tail after creation and `writeLeafEnv` succeed, so criterion 2/3's "before `state.worktree` is recorded" holds by existing construction; dispatch's seat start is downstream of `allocate`, which the throw prevents. Trace recorded, no case needed beyond the refusal assertions (state file has no `worktree` key, no `hc run` seat-start line in the shim log).

- **D11 — Lesson retirement in this leaf's diff.** Remove the line `- leaf worktree kept at a stale base (2026-11-24): ...` from `learnings/LESSONS.md` and append `Applied <date> by src/next.ts:<gate line>: the first-allocation gate replaces or refuses commit-free leftovers, so no seat opens on a stale base` to `learnings/history/2026-11-24-leaf-worktree-stale-base.md`. The mechanism stops on every reachable path: allocation is the single entry (`ensureWorktree` in `src/next.ts`, called from `allocate` only) and every first allocation now passes the gate. Written at implementation time when the gate line exists.

- **D12 — Proof runner.** All criterion proofs are `akrogon run-check --name <label> -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t '<substring>'` run in the leaf worktree — one direct invocation of the repo's own test runner on a test file new in the leaf's test commit, matching the configured `checks.test` runner semantics for an ad-hoc subset (the `-t` filter only narrows; `--timeout=120000` matches the configured value). `./` prefix matches how the configured rerun-each leg invokes test paths. Criterion 6's proof is the leaf diff itself (below).

- **D13 — Fixture shape.** Tests use `hcFixture()` (real herdr-core, stand-in seats, fake systemctl — the established `tests/next.test.ts` dispatch seam) because allocation is only reachable through `akrogon next`, which resolves the repo's hc space before allocating. `leaf(f, slug, 'plan.synthesis')` writes state with no `worktree` key — first allocation by construction. `advanceMain` makes one commit on main in `f.root` and pushes it, so `refs/remotes/origin/main` moves; the slug branch is cut from the pre-advance sha, making it commit-free-behind. The slug is `build` in every test (per-test fixtures isolate). The reset-function test (criterion 5) uses plain `fixture()` and calls the exported function in-process — no core needed.

- **D14 — Deliberate break shared by criteria 3-checkout and 4.** One temporary edit inside `ensureWorktree`'s creation arm: before `createSparseWorktree`, when the branch exists, `git update-ref refs/heads/<slug> <localBase>` unconditionally (unbound, guard-free). It makes the violation both deliberate breaks need: criterion 3's checked-out case goes red because the branch moves (ref assertion fails — the exact wound G4 probes), and criterion 4 goes red because the branch's own commits are reset away. The edit is discarded before the test commit; red output recorded beside the criteria.

- **D15 — Refusal-file-count shape.** Dirty-refusal assertions match pieces (`leaf build`, the path, `uncommitted changes`, the file names, the operator step) never the whole message — the lessons file warns against wording-coupled assertions (`2026-10-01-failed-stop-guard-wording`). The truncation case writes 25 untracked files `u01`–`u25` and asserts exactly 20 `u\d\d` mentions plus the total `25` — count-shaped, not order-shaped.

## Read-first

- `src/next.ts` — `ensureWorktree` (283–317), `createSparseWorktree` (249–281), `allocate` (454+), `dispatchLeaf`'s `mustCreate`/`checkBase` lines (~816), `report` (92).
- `src/reconcile.ts` — `worktreeRemovable` (private today, exported unchanged), `registeredWorktrees` (already exported, parses `locked`).
- `src/preflight.ts` — `trackingRef`, `localBase` (the captured tracking sha).
- `src/batch.ts` — `branchSha`, `isAncestor` (both already imported by `next.ts`).
- `src/state.ts` — `withLock`, `worktreeLock` (non-reentrant `flock -x`).
- `src/shell.ts` — `run`/`command`/`CommandError` shapes.
- `src/config.ts` — `base` (467: `merge-base HEAD <trackingRef>`), `readRepo` for the in-process criterion-5 test.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `storeDir`; `tests/hc-fixture.ts` — `hcFixture`, `delivered`, `HcFixture.clean`; `tests/next.test.ts` — dispatch test patterns, `hcCalls` shim-log shape.
- `learnings/LESSONS.md` line `leaf worktree kept at a stale base` + `learnings/history/2026-11-24-leaf-worktree-stale-base.md` (retirement targets).
- `issues/chart/fresh-leaf-base/forks/leftover-worktree.md` — the binding evidence verbatim.

## Waves

Serial-solo — one unit. The change is one control-flow region (`ensureWorktree` plus its new helper) and one export line in `src/reconcile.ts`; every test asserts through the same dispatch path. There is nothing a second unit could own without sharing `src/next.ts`.

**U1 — first-allocation gate, bound reset, refusals, lesson retirement, tests.** Owns: `src/next.ts`, `src/reconcile.ts` (one export keyword), `tests/first-allocation.test.ts` (new), `learnings/LESSONS.md`, `learnings/history/2026-11-24-leaf-worktree-stale-base.md`, `src/AREA.md`, `tests/AREA.md`. No shared test resource beyond per-test fixtures, no prerequisite.

Docs: `src/AREA.md` gains the first-allocation gate in the `.env`/worktree bullet of non-obvious patterns (one line); `tests/AREA.md` key-files gains one line for the new test file. Checked human docs carry no contradicting claim: `docs/examples/recovery-story.md` describes adopting a branch *with its own commits* (still exactly true), `skills/chart-issues/assets/direct-route.md`'s growth stop is the same shape (branch with commits on the slug branch — the adopt arm this leaf preserves), `docs/reference/commands.md` and `files.md` describe no first-allocation reuse semantics. No other doc affected.

## Criterion proof map

| # | Criterion result | Boundary and observation | Failure it catches | Command | Size | Rerun trigger |
|---|---|---|---|---|---|---|
| 1 | First allocation of a clean leftover on a commit-free branch, an ignored-files-only leftover, or a bare commit-free branch yields worktree HEAD = `refs/heads/<slug>` = current `refs/remotes/origin/main`; `git merge-base HEAD refs/remotes/origin/main` in the worktree is the tracking sha; leaf's own file absent | Real temp repos (bare remote, clone, real worktrees) through real `akrogon next` dispatch on a real core. Before: HEAD sits at the stale sha. After: all three pointers equal the pushed sha | The #156 stale-base reproduction: a seat starts planning on a base missing landed work | `akrogon run-check --name first-alloc-c1 -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion 1'` | minutes | src/next.ts changed |
| 2 | Dirty/untracked/MERGE_HEAD/locked leftovers on a commit-free branch are left in place byte-identical; allocation fails before `state.worktree` is recorded; error names leaf, path, reason, operator step (+`git worktree unlock` for the lock; +file list when dirty) | Same dispatch path, negative cases. Before: dispatch succeeds and the seat inherits the dirt. After: exit non-zero, state.yaml has no `worktree` key, no `hc run` seat start in the shim log, tree and branch untouched | The withdrawn-attempt dirt problem of #156 carried into a fresh attempt; a destructive delete of operator work | `akrogon run-check --name first-alloc-c2 -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion 2'` | minutes | src/next.ts changed |
| 3 | Detached/other-branch/unborn HEADs and a commit-free branch checked out elsewhere: loud refusal, no ref or worktree changed, error names path and HEAD state or other worktree | Same path. Cases 1–2 fail on base today (today adopts anything); the unborn case errors today for the wrong reason; the checked-out case passes today only because `git worktree add` happens to refuse — deliberate-break red recorded below proves the test discriminates | Seats committing where merge and restack never look; `update-ref` silently moving a branch out from under another checkout (G4 probe) | `akrogon run-check --name first-alloc-c3 -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion 3'` | minutes | src/next.ts changed |
| 4 | A branch with its own commits is adopted unchanged: same HEAD, same branch sha, files kept — store path absent or its HEAD on the branch | Same path, positive control. Passes on base today (kept behavior); deliberate-break red recorded below proves the test discriminates | The direct route's growth-stop handoff breaking: partial work reset away (design's stated consumer) | `akrogon run-check --name first-alloc-c4 -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion 4'` | minutes | src/next.ts changed |
| 5 | `resetLeafBranch` refuses when the ref no longer holds the proven sha, and the newer commit stays on the branch | In-process call with real temp git repos, success and refusal arms. Before: no export exists. After: refusal throws, `refs/heads/<slug>` still points at the newer commit | An unbound/unchecked reset overwriting a branch that moved between proof and reset — the wound G4 demonstrated | `akrogon run-check --name first-alloc-c5 -- bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion 5'` | seconds | src/next.ts reset function changed |
| 6 | `learnings/LESSONS.md` no longer holds the stale-base line; the history file ends with the `Applied` line | The leaf branch diff itself: `git diff "$AKROGON_BASE"...HEAD -- learnings/` inspected at implementation; zero matches of the lesson text in LESSONS.md, `Applied 2026-… by src/next.ts:` present as the history file's last line | The lesson outliving its mechanism's stop (lesson rule Retire violation) | `sh -c '! grep -q "leaf worktree kept at a stale base" learnings/LESSONS.md && tail -1 learnings/history/2026-11-24-leaf-worktree-stale-base.md \| grep -q "^Applied .* by src/next.ts:"'` | seconds | learnings files changed |

No paid calls, no live runs, no model-choice criteria, no new proof machinery — the tests use the repo's existing fixture helpers and the real `git` binary, per standing-design. Budget: free tests; no AKROGON_SESSIONS sizing applies. Rerun triggers are the owning source files; `akrogon verify` at implement end covers the whole suite through the configured runner.

## Condition checks (decisions vs criterion conditions)

- C1 "equal the current tracking ref" — D4: the reset target is the captured `localBase`. A tracking ref that moves mid-allocation yields a worktree at the pre-move ref: the design's named residual (local tracking ref staleness, no fetch by Q3a). Traced, accepted as designed, no case.
- C1 "first allocation" gate scope — D2: the gate is inside `leaf.state.worktree === undefined`. Case: criterion-1 tests assert the recorded state gains `worktree` only on success; criterion-4 tests prove the adopt arm (state.worktree unset too) — together they pin the gate to first allocation without touching later allocations, which no criterion names.
- C2/C3 "before `state.worktree` is recorded / changes no ref or worktree" — D10: throw-before-mutation ordering. Cases: every refusal test asserts state.yaml lacks `worktree`, branch sha unchanged, worktree byte/content unchanged, no `hc run` line. Red at planning: inherent — today dispatch succeeds and records, so every one of these assertions fails on the unmodified base.
- C2 "changed files when there are any, first 20 plus a total count" — D8/D15. Cases: file names in the 2-modified and 25-untracked refusals; the MERGE_HEAD clean-tree case asserts no file list is needed (porcelain empty). The 25-file truncation case is shown red inherently today (no refusal exists).
- C2 locked case "error names `git worktree unlock`" — D4 lock detection. Case: locked-worktree test asserts the unlock step in stderr and that a subsequent unlock+remove leaves the branch intact for a retry. Red inherently.
- C3-checkout guard "before the reset" — D4 ordering inside the lock. Case: the checked-out-elsewhere test asserts the branch sha is bit-identical after the failed allocation — the only assertion the D14 deliberate break violates (red evidence below), proving ordering, not just outcome.
- C5 "refuses when the slug branch no longer holds the sha … the newer commit stays" — D6: single `update-ref` with old-value bind. Case: the criterion-5 test passes an `expected` two commits stale. The unbound-violation variant is exactly the D14 deliberate break, shown red.
- Time: no calendar-dependent expectation anywhere; the `Applied` date is written at implementation, not asserted by any test.

## Tests to write (red-first)

One new file `tests/first-allocation.test.ts`; no existing test file or `checks` command proves any of these behaviors today (verified by reading `tests/next.test.ts`, `tests/worktree-store.test.ts`, `tests/reconcile.test.ts` — none drives first allocation against a commit-free leftover). Local helpers: `advanceMain` (commit+push on main), `branchCut` (slug branch at the pre-advance sha), porcelain/ref readers, refusal assertions shared across cases. All test titles carry their criterion number so the `-t` filters above select exactly their proof set (`criterion 1` also matches the `criterion 1 regression` fresh-creation control — deliberate, it guards the creation arm the replace path reuses).

1. `criterion 1: first allocation replaces a clean leftover on a commit-free branch` — leftover at store path on commit-free-behind branch; asserts HEAD/branch/merge-base equality with the pushed tracking sha, the new main commit's file present, the stale-only state absent, `state.worktree` recorded, one seat task delivered.
2. `criterion 1: first allocation replaces a leftover holding only ignored files` — `junk-deps/` in the common dir's `info/exclude`, junk present; same assertions.
3. `criterion 1: first allocation resets a commit-free branch with no store path` — branch exists, no worktree; same ref assertions.
4. `criterion 1 regression: fresh creation with no branch and no path still starts from the tracking ref` — control for the creation arm the replace reuses (green today, must stay green).
5. `criterion 2: modified tracked file refuses and leaves everything in place` — asserts exit non-zero, stderr pieces (slug, path, `uncommitted changes`, file name, `git worktree remove --force`), tree byte-identical, branch unmoved, no `worktree` in state, no `hc run` seat start.
6. `criterion 2: untracked file refuses` — same shape.
7. `criterion 2: merge in progress on a clean tree refuses with no file list` — `MERGE_HEAD` written into the worktree's real git path (`git rev-parse --git-path MERGE_HEAD`); asserts `merge in progress` reason.
8. `criterion 2: locked worktree refuses naming git worktree unlock` — `git worktree lock`; asserts unlock step, no removal, no reset.
9. `criterion 2: dirty refusal lists the first 20 files with the total count` — 25 untracked files; exactly 20 listed, total 25 present.
10. `criterion 3: detached HEAD refuses whether or not the branch has commits` — parameterized over commit-free and own-commits branches (two cases in one test body sharing assertions); names path and detached state.
11. `criterion 3: leftover on another branch refuses whether or not the slug branch has commits` — same parameterization with the worktree on branch `other`; names path and `other`.
12. `criterion 3: unborn slug branch HEAD refuses naming the unborn branch` — `update-ref -d` the slug branch while checked out (G3/C probe-verified possible), worktree left unborn.
13. `criterion 3: commit-free branch checked out elsewhere refuses and moves nothing` — no store path; branch checked out in a second worktree; asserts stderr, branch sha bit-identical, other worktree intact, no store path created.
14. `criterion 4: branch with own commits is adopted with no store path` — HEAD = the own commit, branch sha unchanged, the commit's file present, dispatch green.
15. `criterion 4: branch with own commits is adopted when the store worktree is clean on it` — same through the path-present arm.
16. `criterion 5: resetLeafBranch refuses a moved ref and keeps the newer commit` — in-process: success arm moves the ref; refusal arm passes an `expected` the ref moved past, asserts throw and branch sha unchanged.

## Red evidence

Tests written red-first 2026-11-25 in the leaf worktree, each run through `akrogon run-check` on the unmodified base (git 2.56.1, the charting proofs' version). Logs kept in the leaf folder under `implementation/`:

- `check first-alloc-c1: 1 implementation/check-first-alloc-c1-1795592475234-1673884.log` — the three replacement cases fail at the HEAD equality assertion: the leftover's HEAD stays at the pre-advance sha (today's reuse-as-found), e.g. expected `bd26c89f…` received `0001a6a9…`. The regression control (fresh creation, no branch) passes on base, as designed.
- `check first-alloc-c2: 1 implementation/check-first-alloc-c2-1795592493878-1675183.log` — all five refusal cases fail at `expect(result.code).not.toBe(0)`: today dispatch succeeds, adopts the dirty/locked/merging leftover and starts the seat — the exact harm of #156. Inherent violation, no temporary edit needed (allocation itself violates every criterion-2 condition today).
- `check first-alloc-c3: 1 implementation/check-first-alloc-c3-1795592496958-1676372.log` — detached and other-branch cases fail at exit 0 (today adopts them); the unborn case fails with today's wrong error (`fatal: Not a valid object name HEAD` from `merge-base`) instead of the unborn refusal; the checked-out-elsewhere case passes on base — kept behavior by accident of `git worktree add`'s refusal, as the design's standing-design reading predicts. Its deliberate-break red:
- `check first-alloc-break3: 1 implementation/check-first-alloc-break3-1795592529742-1680584.log` — under the D14 temporary edit (unconditional unbound `update-ref` of the slug branch before creation, discarded after), the checked-out-elsewhere test fails at the branch-sha-unchanged assertion: the branch moved `95acfbd5… → 980e7a2d…` while checked out in another worktree — the wound the guard exists for, proving the test discriminates.
- `check first-alloc-c4: 0 implementation/check-first-alloc-c4-1795592497418-1677198.log` — both adoption cases pass on base (kept behavior). Their deliberate-break reds:
- `check first-alloc-break: 1 implementation/check-first-alloc-break-1795592514827-1678569.log` and `check first-alloc-break2: 1 implementation/check-first-alloc-break2-1795592524809-1679989.log` — the first placement of the D14 edit covered only the no-store-path arm (path-present adoption stayed green, exposing the gap); repositioned before the `existsSync` split, both adoption cases go red: the branch's own commit is reset away, HEAD no longer the own sha. Both runs recorded; the edit is discarded, verified by `git diff` empty in the worktree.
- `check first-alloc-c5: 1 implementation/check-first-alloc-c5-1795592497584-1677724.log` — `resetLeafBranch is not a function`: the export does not exist. Dynamic import keeps the failure local to this test (the rest of the file's reds stay meaningful on the same commit).

Condition-red note: where a condition's violation is inherent in today's code (no refusal exists, no reset exists, adoption is unconditional), the natural red above is the violation — no temporary edit can violate a condition of code that does not exist. Where the behavior is kept (criterion 3's third case, criterion 4) the D14 edit supplies the violating red. One deviation recorded: criterion 2's 'before `state.worktree` is recorded' and 'left in place unchanged' conditions are proven by the same refusal assertions, not separate edits — today every one of them is violated by construction.

Prettier clean on the test file; `bun run typecheck` shows exactly one error, TS2339 `resetLeafBranch` missing on `src/next` — the intended red, resolved by the implementation's export.

## Env / credentials

`readiness.yaml` has no `produces`, no `grants`, no env names; `akrogon status` prints no `Missing:` lines (checked this pass). Every proof is free and local: temp git repos, throwaway hc cores, the stand-in harness. Nothing to verify, no operator action.

## Restart boundaries

None — no paid rung, no slow suite, no input the seat waits on. The red-first test commit on the leaf branch is the checkpoint if the implementing seat dies mid-phase.

## Open items

None. The design holds no `Open for the plan:` questions; its one open mechanism ("the exact git calls are open for the plan", fork Q1a) is settled by D1/D4/D6/D7. Brief/design conflicts: none found — the brief's criterion texts and the design's architecture agree; the direct-route dependency is preserved as criterion 4.

## Implementation notes

(dated lines go here if a named means is replaced during implementation)
