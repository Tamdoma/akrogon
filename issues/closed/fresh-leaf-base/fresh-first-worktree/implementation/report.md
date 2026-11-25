# Implementation report: fresh-first-worktree

Serial-solo (one unit in one wave per plan.md), implemented by A, 2026-11-25.

## Branch record

- Base at handoff: `99552b73` (AKROGON_BASE at implement start). Opening refresh rebased onto origin/main `8d0df9dd`; the red-first test commit replayed `36639df1` → `77a151b6` with no conflicts.
- Post-commit refresh: base already current (`8d0df9dd`), no move.
- Committed head: `7adb11a700cac79ad76560670786b84282550ccd`, base `8d0df9dd2cc0274401346de5fb89ccc48174f570`.
- Commits on the leaf branch:
  1. `77a151b6` test: first-allocation replacement, refusal, adoption and reset proofs, red on head (plan.synthesis commit)
  2. `17953b9b` fix: first allocation replaces commit-free leftovers and refuses ones worth keeping
  3. `7adb11a7` test: put the unignored .env hazard on the adopt arm (existing-test correction, exception 1)

## Changed files and reasons

- `src/next.ts` — the leaf. `resetLeafBranch` exported (bound `git update-ref refs/heads/<slug> <target> <expected>`); `ensureWorktree`'s first-allocation gate: HEAD anomaly refusals (detached / other branch / unborn, before the commit check), commit-free detection by `isAncestor(provenSha, trackingSha)`, the replace sequence under `worktreeLock` (`worktreeRemovable` verdict with porcelain file list, locked detection, non-force remove carrying git's stderr, checked-out-elsewhere guard on `registeredWorktrees`, bound reset), then the unchanged creation path; adoption of a branch with own commits byte-identical to before. The `mustCreate` mirror comment now names the replaced leftover's local proof. `provenSha` is read by direct `rev-parse` rather than the imported `branchSha` — no behavior difference for an existing ref, one less zod parse.
- `src/reconcile.ts` — one keyword: `worktreeRemovable` exported, rule unchanged (shared "safe to delete" definition, plan D4).
- `tests/first-allocation.test.ts` — new, the criterion proofs (committed red-first at plan.synthesis).
- `tests/next.test.ts` — the unignored-.env setup now commits the `.gitignore` change so the hazard rides the adopt arm. The design refuses a commit-free leftover with uncommitted changes before any `.env` logic (brief criterion 2), so the old setup could never reach the `.env` refusal it tests; a real unignored hazard only exists on a branch with own commits. One wrong expectation corrected under the implement-issue exception, cited in the commit's `Test-Change` trailer. No other existing test needed changes (scanned every `worktree add` in the suite).
- `src/AREA.md`, `tests/AREA.md` — the two doc lines the plan's checklist names.
- `learnings/LESSONS.md`, `learnings/history/2026-11-24-leaf-worktree-stale-base.md` — lesson retired: line removed, `Applied 2026-11-25 by src/next.ts:315` appended (criterion 6). The gate is the single allocation entry (`ensureWorktree` via `allocate`), so the mechanism is stopped on every reachable path.

## Proof results

All run in the leaf worktree on head `7adb11a7` (rerun after the test-correction commit, since inputs changed), through `akrogon run-check`; logs in this folder. Each criterion proof is `bun test --timeout=120000 ./tests/first-allocation.test.ts -t 'criterion <n>'`:

| Criterion | Result | Log |
|---|---|---|
| 1 (replace clean / ignored-only / branch-only leftovers; base = tracking ref) | green, 4/4 incl. fresh-creation control | `check first-alloc-c1: 0 implementation/check-first-alloc-c1-1795593184230-2322791.log` |
| 2 (dirty / untracked / MERGE_HEAD / locked / 25-file truncation refusals leave everything in place) | green, 5/5 | `check first-alloc-c2: 0 implementation/check-first-alloc-c2-1795593184567-2323825.log` |
| 3 (detached / other-branch / unborn / checked-out-elsewhere refusals move nothing) | green, 4/4 | `check first-alloc-c3: 0 implementation/check-first-alloc-c3-1795593185104-2324736.log` |
| 4 (branch with own commits adopted unchanged, path absent or present) | green, 2/2 | `check first-alloc-c4: 0 implementation/check-first-alloc-c4-1795593185563-2325785.log` |
| 5 (`resetLeafBranch` refuses a moved ref, newer commit stays) | green, 1/1 | `check first-alloc-c5: 0 implementation/check-first-alloc-c5-1795593185723-2326314.log` |
| 6 (lesson line gone, history ends with the Applied line) | green | `check first-alloc-c6: 0 implementation/check-first-alloc-c6-1795593185813-2326447.log` |

Red-first evidence (planning, on the unmodified base) is in plan.md `## Red evidence`; the deliberate-break logs for the two kept behaviors are `implementation/check-first-alloc-break{,2,3}-*.log`.

Existing-test correction evidence: `check env-refusal-fix: 0 implementation/check-env-refusal-fix-1795593168624-2321948.log` — both `.env` refusal variants pass with the corrected setup; before the correction the unignored variant was red under this leaf's design (verify run `43787365` test leg, `check-test-1795593129198-2016814.log`).

## Verify

`akrogon verify` on committed head `7adb11a7`: **green** — `verify leaf 7adb11a700cac79ad76560670786b84282550ccd: green`. Legs: setup `check-setup-1795593189165-2326627.log` 0, format `check-format-1795593191861-2326627.log` 0, typecheck `check-typecheck-1795593194419-2326627.log` 0, test `check-test-1795593412562-2326627.log` 0 (1449 tests across 90 files). Wall time for the whole verify: ~4 minutes (1795593189165 → 1795593412562 ms ≈ 223 s of check time plus pass overhead). Criterion proof commands are sized seconds-to-minutes; each took under 2 s of test time per test, whole commands under 5 s.

An earlier verify on `17953b9b` ran red only on the pre-existing `next refuses an .env write over unignored` — cause inside the leaf's design contract, corrected per above; not a base red, no known-red judgment needed. No retries, no inconsistent checks.

## Known limitations

- Design residuals, recorded not fixed (unchanged from design): the local tracking ref misses merges made elsewhere until something fetches; a person checking out the slug branch by hand in the instant between the guard and the reset, outside akrogon's lock; ignored files in a replaced leftover are deleted and reinstalled.
- The git-refusal branch of the removal step (`removal.code !== 0`, e.g. initialized submodules) is carried but not covered by a dedicated test: the brief's criterion-2 list covers dirty, merge-in-progress and locked, and no test beyond the criteria was added. The locked case is proven through the upfront `registeredWorktrees` lock check; the stderr-parsing `includes('lock')` arm covers only a lock acquired between listing and removal (a race window), untested by design.
- No unverified criteria.

## Env / credentials

None needed or touched; no `Missing:` lines, no paid calls, no live runs. No implementation notes were appended to plan.md — no missing constraints, no model-choice readings, no locked-means replacements arose.

## check.repair — 2026-11-25

Slot B handed four Fixes, all inside `ensureWorktree`'s first-allocation gate; one serial unit repaired serial-solo. Head `07261665df2ba8c7010c866ff964da389dcda8f7` on base `8d0df9dd2cc0274401346de5fb89ccc48174f570` (fetched; still an ancestor). Commits added: `7bc852cd` (regression tests, red-first) then `07261665` (the repair).

### The four Fixes

- **F1 (rebase reservation).** Added exported `branchReservation` in `src/next.ts`: the scan over registered worktrees now also probes each worktree's `rebase-merge`/`rebase-apply` `head-name` (through `git rev-parse --git-path`, the same resolution `worktreeRemovable` uses); a match against the leaf branch refuses loudly naming the reserving worktree and the finish-or-remove step, before anything moves. A paused interactive rebase detaches HEAD in its worktree, which is why the symbolic-checkout scan missed it.
- **F2 (mutation order).** The reservation scan now runs before `git worktree remove` inside the lock, and is re-run after the removal before the bound reset (the design's re-read-before-reset intent). A forced second checkout is refused with store worktree, second checkout and ref all untouched.
- **F3 (dirty locked).** The lock state is read alongside the verdict: a dirty locked refusal prepends `git worktree unlock <path>` to the remove step, so the operator step is executable in order.
- **F4 (path quoting).** Every git recovery command the refusal emits quotes its path with `quote()` from `src/shell.ts`; the regression test extracts the emitted unlock command and runs it verbatim against a store path containing spaces, proving the worktree unlocks.

`src/AREA.md`'s next.ts line now records the reservation detection.

### Proof log

- Red-first (test content as committed in `7bc852cd`, fix stashed out): `implementation/check-check-repair-tests-red4-1795594792028-4014735.log` — exactly the four regression tests fail, all 16 originals pass. The rebase red output shows the branch reset before git refused the recreated checkout (`'build' is already used by worktree at …rebase-checkout`), reproducing B's corruption. An earlier red attempt (`…red…`, `…red2…`, `…red3…` logs) is invalidated test scaffolding: the new tests initially missed the leaf folder and the store worktree setup; the tests were corrected and re-validated red before amending the test commit.
- Green: `implementation/check-check-repair-green4-1795594804676-4019278.log` — all 20 tests pass including the four regressions.
- Criterion reruns on the repaired head: `check-repair-c2-…4025003.log`, `check-repair-c3-…4026295.log` (exit 0, criteria 2 and 3 suites including the new shapes).
- Full suite: `akrogon verify` GREEN on head `07261665` (receipt end `2026-11-25T08:24:18Z`; setup/format/typecheck/test all exit 0, 1449 tests plus 1105 changed-file reruns).

### Test-Change trailers

`7bc852cd` and `07261665` carry `Test-Change: tests/first-allocation.test.ts slot B review findings F1-F4` — the realistic source is the operator actions B probed (paused interactive rebase, forced second checkout, locked dirty leftover, spaced `worktree_root`).

## check.repair round 2 — 2026-11-25

Slot B re-reviewed `07261665` and handed three more Fixes: the surviving bisect reservation hole (F1), a symlinked-home store misidentifying itself (F5), and the rebase refusal's destructive force-remove advice (F6). One serial unit repaired serial-solo. Main advanced mid-pass; the branch was rebased onto `origin/main` (`2185ddfc`), head now `f23eb8a2` (`ed63ae45` regression tests red-first, then `f23eb8a2` the repair).

### The three Fixes

- **F1 (bisect reservation).** `branchReservation` now probes each worktree's `BISECT_START` through `git rev-parse --git-path` and matches the leaf slug among its refs. Native git refuses `worktree add` of a branch mid-bisect even though HEAD there is detached, so the symbolic and rebase scans alone could never see it. The test seeds real divergence (an own commit on the branch, rewound ref, two revisions between tip and main) so the bisect pauses mid-range exactly as an operator's would.
- **F5 (symlinked store identity).** The store exclusion in `branchReservation` and the lock lookup now compare `canonicalPath` (exported from `src/config.ts` — realpath of the deepest existing ancestor, so a store that does not exist yet still resolves symlinked ancestors) on both sides. Git registers worktrees by real path; the raw-string comparison let the store pose as another worktree when `$HOME` is a symlink, refusing the only checkout.
- **F6 (destructive advice).** The rebase refusal now offers only `git rebase --continue` / `git rebase --abort`; the force-remove alternative B proved deletes the uncommitted edit that made the paused rebase worth keeping is gone. The regression test places an uncommitted edit on a paused rebase and asserts the refusal text contains no `git worktree remove`.

`src/AREA.md` updated: reservation detection covers rebase and bisect, compared by filesystem identity.

### Proof log

- Red-first (fix stashed out): `implementation/check-check-repair2-tests-red-1795595551604-870424.log` and the refined `check-check-repair2-tests-red2-1795595639585-880181.log` — exactly the three new tests fail (the bisect red shows the ref moved past `stashed` despite the active bisect; the rebase red shows the force-remove text in the refusal; the symlink red exits 1 instead of replacing), all other tests pass. The first red run predates the bisect-divergence correction in the test setup; the committed test content is what red2 validated.
- Green: `implementation/check-check-repair2-green2-1795595788303-905329.log` — all 23 tests pass (one intermediate green run had three regressions caused by `realpathSync` throwing on the not-yet-existing store path, repaired by switching to `canonicalPath` before the green2 run).
- Post-rebase green: `check-repair2-green3-1795595813908-911900.log` — all 23 pass on the rebased head.
- Full suite: `akrogon verify` GREEN on head `f23eb8a2` (format/typecheck/test exit 0; 1120 changed-file reruns).

### Test-Change trailers

`ed63ae45` and `f23eb8a2` carry `Test-Change` trailers citing slot B's round-2 findings and their realistic operator actions (active bisect, symlinked HOME, paused rebase holding uncommitted work).

## check.repair round 3 — 2026-11-25

Slot B repaired F7 itself in `e1aafe4f` (lesson lines restored after the rebase replay) and handed one Fix to A. Head now `ce0cbbd8` on base `2185ddfc` (`2c162643` regression test red-first, then `ce0cbbd8` the repair).

### F8 (prunable registration blocks replacement)

Root cause: round 2's lock-lookup edit never landed. The replacement string was written against unformatted source, prettier had rewrapped the line, and the sed-style substitution silently matched nothing — `realpathSync` stayed on both sides. Git's `worktree list` is path-sorted, so a deleted unrelated worktree whose path sorts before the store is iterated first by the lookup, and `realpathSync` on the missing path aborted allocation with ENOENT. The repair is the one-liner round 2 intended: `canonicalPath` on both sides, which resolves through the deepest existing ancestor and never throws on a missing row — the same comparison the reservation scan already uses.

Two test-authoring corrections during red validation, both caught by the red run itself: the porcelain list is path-sorted rather than registration-ordered (the first draft registered the stale row first but it still sorted after the store, so `.find` short-circuited on the store row and greened for the wrong reason), and `git branch -D` refuses a branch still registered to the pruned worktree (cleanup removed; the fixture teardown handles the temp repos).

### Proof log

- Red-first: `implementation/check-repair3-tests-red2-1795596562679-1915929.log` — allocation exits 1 instead of replacing with the prunable row sorting first. The earlier `check-repair3-tests-red-…` run is the invalid first draft (allocation greened, only the bogus cleanup failed) kept for the record.
- Green: `implementation/check-repair3-green-1795596586513-1923027.log` — all 24 tests pass.
- Criterion 1 rerun: `check-repair3-c1-1795596596065-1932225.log` (exit 0).
- Full suite: `akrogon verify` GREEN on head `ce0cbbd8` (format/typecheck/test exit 0; 1125 changed-file reruns).
