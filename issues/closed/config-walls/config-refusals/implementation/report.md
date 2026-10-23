# Implementation report: config-refusals

Base: bd996a7ad22225d35328088e7a7d1a1bc0c95d89 (origin/main at implement start)
Committed head: 0e5fc9a303187adaccca738958f384d41f40059e

## check.fix refresh (2026-10-22)

Reviewed base/head: bd996a7a / 0e5fc9a3. check.fix refresh rebased the branch: new base c5e98748b9c79ae75a5e4cd2ddc410462435ffe8, handed-off head 7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8. The rebase replayed the leaf's commits unchanged (new SHAs: tests 977/…, product 1c4af98a→config / guard / init / docs / style commits + repair 7efe3d6); `git range-diff bd996a7a..0e5fc9a3 c5e98748..7efe3d67` shows the same patch set plus the F1 repair.

Repair: review-B F1 — deleted the setup.md prose-wording test from tests/worktree-store.test.ts (commit 7efe3d6, `Test-Change` trailer citing review-B F1). C5 is satisfied by reading the guide; the criterion holds on doc content, which stands unchanged.

Post-repair proof: `akrogon run-check --name f1-recheck -- bun test --timeout=30000 tests/worktree-store.test.ts` → `check f1-recheck: 0` (6 pass). `akrogon verify` on 7efe3d6 → test 1 (1114 pass, 1 fail: `leaf-slices` "merged and failed leaf slices with gone tabs are stopped", a 10 s timing wait), typecheck 0, format 0. The red has no cause in this diff (leaf touches config/guard/init/docs/tests only; leaf-slices exercises systemd slice lifecycle), so one retry under the no-cause rule: `akrogon run-check --name leaf-slices-retry -- bun test --timeout=30000 tests/leaf-slices.test.ts` → `check leaf-slices-retry: 0` (15 pass) — the check is inconsistent (flaky timing wait); both logs: `check-test-1792698407125-1123687.log`, `check-leaf-slices-retry-1792698417884-1729227.log`.
Delegated run: wave 1 = {U1 config.ts, U3 guard.ts, U4 setup.md} in worker worktrees config-refusals-u1/-u2/-u3; wave 2 = {U2 init.ts} in config-refusals-u4 after U1 landed.

## Changed files and reasons

- src/config.ts (1c4af98a, cherry-picked from u1 62c5ee11): private `canonicalPath` (deepest-existing-ancestor realpath + suffix) and `worktreeStore` refusal of a configured `worktree_root` whose canonical store equals or lies inside the canonical checkout — D1/D2.
- src/guard.ts (03990ec2 from u2 bdaf9c23): own-modules refusal appends `; set setup in issues/config.yaml to install dependencies in each fresh checkout` — D4.
- docs/guide/setup.md (ac1ac93d from u3 d9feaabe): `worktree_root` bullet requires a store outside the checkout, drops the in-checkout-gitignored sentence — D5.
- src/init.ts (de33eaa3 from u4 70f4e2d3): `worktreeStore` resolved before `writeRepoConfig`; in-checkout `.gitignore` addition and dead `relative`/`within` imports removed — D3.
- src/guard.ts + src/init.ts (0e5fc9a): prettier wrap only, no behavior change.
- tests/ (7471722, 28effb7): red-first criterion tests and fixture rework; 28effb7 repairs worker findings F1 (remoteFixture default still in-checkout) and F2 (linked-worktree assertion raced the sibling rewrite).

## Commands run

- `akrogon run-check --name w1-u1 -- bun test --timeout=30000 tests/config.test.ts tests/verify.test.ts tests/sync.test.ts` → `check w1-u1: 0` (100 pass, incl. all 9 new refusal cases).
- `akrogon run-check --name w1-u3 -- bun test tests/guard.test.ts` → `check w1-u3: 0`; `akrogon run-check --name w1-u4 -- bun test tests/worktree-store.test.ts` → `check w1-u4: 0`; `akrogon run-check --name w2-u2 -- bun test tests/init.test.ts` → `check w2-u2: 0` (22 pass).
- `akrogon run-check --name criteria -- bun test --timeout=30000` (7 touched files) → `check criteria: 0`, 383 pass on head de33eaa3.
- `akrogon verify` head de33eaa3 → red: test 0 (1112 pass, ~190s wall), typecheck 0, format 1 (prettier wrap in src/guard.ts, src/init.ts) — fixed by 0e5fc9a.
- `akrogon run-check --name c4-guard-recheck -- bun test tests/guard.test.ts tests/init.test.ts` → `check c4-guard-recheck: 0` (29 pass) on 0e5fc9a.
- `akrogon verify` head 0e5fc9a → `verify leaf 0e5fc9a…: green`; test 0 (1112 pass, ~220s wall), typecheck 0, format 0.

## Proof by done-criterion

- C1: config/verify/sync refusal cases — new tests green under `check w1-u1: 0` (commit 1c4af98a) and `check criteria: 0` (de33eaa3); verify creates no checkout asserted by unchanged `git worktree list` and empty receipts.
- C2: external/~/sibling-prefix acceptance — green under the same runs (config store-shape test incl. `repo2` sibling; init acceptedCases).
- C3: init no-write refusal + no store `.gitignore` line — green under `check w2-u2: 0`.
- C4: own-modules path + `setup`/`issues/config.yaml` remedy, exit 1; exit 0 branches unchanged — green under `check w1-u3: 0` and `check c4-guard-recheck: 0` on final head.
- C5: setup.md wording + full `test` check — green under `check w1-u4: 0`; suite green under verify on 0e5fc9a.
- C6: `learnings/history/2026-10-22-in-repo-worktree-store-guard.md` is absent at base bd996a7a and LESSONS.md holds no matching line — nothing written, per the criterion's absent branch.

## Known limitations

- skills/init-akrogon/SKILL.md:80 still mentions "the in-checkout worktree" among init's ignore entries; the design excludes editing it (it proposes no `worktree_root`). Flagged in plan.md for review.
- README:195's conditional "worktree store when inside the checkout" exclusion line is left: the code still defends it, the config making it reachable is now refused.

## Unverified criteria

None — all six criteria carry a green proof on head 0e5fc9a or, for C6, the recorded absent-branch statement.
