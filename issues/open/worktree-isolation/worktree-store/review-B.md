# Review B: worktree-store

Date: 2026-10-11
Phase: check.review
Base: `309d742605a0516067840863ffdf3be29b03fc0c`
Reviewed head: `6f709e4a841ce1a84561158901904f493a349387`
Verdict: **ready**

## Findings

No Fixes, Nits, or operator actions. Reviewed the whole diff against brief.md, plan.md, design.md, implementation/report.md, the standing design and affected live contracts. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

The shared createSparseWorktree guard implements D11 without changing the refusal contract. The extra sh -c around each check preserves compound-command behavior and prevents a trailing || branch from running after a guard refusal. The cleanup catch removes a partially configured worktree and propagates failure, rather than hiding it. Sparse configuration stays local to each linked checkout, and buildStack retains its finally cleanup.

## Verification

- V1: `bun test tests/worktree-store.test.ts tests/guard.test.ts tests/config.test.ts tests/batch.test.ts --timeout=30000`: exit 0, 50 pass, 0 fail, 455 assertions. Covers default/tilde paths, absolute config output, sparse creation and clean status, root configuration isolation, sparse rebase, two-member store stack and cleanup, refusal before allocation, ancestor/own-modules guard ordering, nonexistent paths, and real Bun dependency resolution without fetching. Covers all seven done-criteria.
- V2: `bun test tests/init.test.ts tests/sync.test.ts tests/command-reference.test.ts tests/docs-links.test.ts tests/batch-merge.test.ts --timeout=30000`: exit 0, 87 pass, 0 fail, 1948 assertions. Verifies init ignore behavior, sync default-store behavior, command and link contracts, and real merge/restack integration.
- V3: `bun run typecheck`: exit 0. `git diff --check 309d742605a0516067840863ffdf3be29b03fc0c...HEAD`: exit 0.
- V4: `bun src/akrogon.ts guard ancestors`: exit 1, stderr `ancestor /home/ivan/Work/infra/akrogon holds node_modules or package.json`. This is the planned negative scenario, not a failed check. The installed CLI predates guard, so the repository CLI was used.
- V5: Reused implementation/report.md's unchanged full-suite evidence: `bun test --timeout=30000` 729 pass, 0 fail; `AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000` 701 pass, 0 fail; `bun run format` clean after reverting documented unrelated formatter drift. The final extra commit adds only the tests/AREA.md citation trailer. No code change or unresolved concern requires repeating those checks. The plan explicitly authorizes underlying commands in this nested worktree until operator migration S2. No merge_checks or advisory commands are configured.
- V6: Reused recorded deliberate breaks: removing ancestor guard makes the refusal proof red through setup execution, and removing sparse-checkout makes sparse proofs red. No existing regression expectation was removed.

## Documentation and pointers

Read README.md, docs/guide/setup.md, cheat.md, limits.md, docs/reference-index.md, src/AREA.md and tests/AREA.md, plus affected init/chart skill text and the existing worker protocol. The documented default store and guard command match the implementation. Setup's existing description of locked setup remains true with guards around it. Manual worker and chart worktrees remain full by plan D10.

Live repository-root path listing for both changed AREA files found no missing paths:

- src/AREA.md: docs/reference-index.md, src/akrogon.ts, src/config.ts, src/init.ts, src/phase.ts, src/preflight.ts, src/readiness.ts, src/shell.ts, tests/helpers.ts, tests/phase.test.ts all exist.
- tests/AREA.md: docs/reference-index.md, skills/watch-issues, src/shell.ts, tests/command-reference.test.ts, tests/docs-links.test.ts, tests/guard.test.ts, tests/helpers.ts, tests/phase.test.ts, tests/watch-issues-scripts.test.ts all exist.

## Test-Change trailers

Trailers in `309d742605a0516067840863ffdf3be29b03fc0c..6f709e4a841ce1a84561158901904f493a349387`:

```text
Test-Change: tests/AREA.md worktree-store leaf: added one key-file line for tests/guard.test.ts; no existing expectation changed
Test-Change: tests/next.test.ts worktree-store leaf: default store moved out of the checkout to the home worktree store; explicit-root cases keep worktree_root; HOME pinned for spawned next/self-update children and worktree_root pinned in HOME-overridden settlement tests; no expectation intent changed
Test-Change: tests/batch.test.ts worktree-store leaf: stack checkout moved from leaf-temp to the home store; HOME pinned for in-process buildStack; no expectation intent changed
Test-Change: tests/batch-merge.test.ts worktree-store leaf: HOME pinned for in-process buildStack; no expectation intent changed
Test-Change: tests/culprit.test.ts worktree-store leaf: in-store branch worktrees moved to the home store; HOME pinned for in-process buildStack; no expectation intent changed
Test-Change: tests/hold.test.ts worktree-store leaf: in-store branch worktrees moved to the home store; HOME pinned for in-process buildStack; no expectation intent changed
Test-Change: tests/merge-attempts.test.ts worktree-store leaf: in-store branch worktrees moved to the home store; HOME pinned in spawn env and for in-process buildStack; no expectation intent changed
Test-Change: tests/helpers.ts worktree-store leaf: storeDir helper for the home store path; additive only
Test-Change: tests/pause-next.test.ts worktree-store leaf: HOME pinned in cliEnv so spawned next children resolve the home store under the fixture; no expectation intent changed
Test-Change: tests/init.test.ts worktree-store leaf: optional worktree_root, home store default
Test-Change: tests/sync.test.ts worktree-store leaf: optional worktree_root, home store default
Test-Change: tests/helpers.ts worktree-store leaf: new default store and guard composition; pass HOME=f.home in cli() so ~ resolves inside the fixture
Test-Change: tests/config.test.ts worktree-store leaf: new default store and guard composition; unset and ~/x store rows, guards in composed expectations, own node_modules in lock test setup
Test-Change: tests/command-reference.test.ts worktree-store leaf: new default store and guard composition; add guard verb contract
Test-Change: tests/check-names.test.ts worktree-store leaf: new default store and guard composition; create own node_modules in the worktree
Test-Change: tests/run-check.test.ts worktree-store leaf: new default store and guard composition; setup creates node_modules so own-modules guard passes
```

Each citation was checked against its actual diff and the leaf's outcomes. Existing store-path and ignore expectations change because brief criterion 1 and plan D1/D8/D9 replace the old default. HOME pins and explicit roots preserve fixture isolation and settlement tests' identities. Guard composition expectations follow criterion 5 and D4/D5, with setup creating the required local modules before continuing. Batch cleanup expectations follow criterion 3 and D6. Helpers and the AREA line are additive. These changes preserve prior assertions' purposes and cite the source for every changed old test file matched by src/test-files.ts. No unsupported expectation change or deletion was found.

No reusable Nit or new lesson was identified. Code worktree remained clean. No review commits were made.


## Merge verification: 2026-10-11

Attempt: `67918128-6005-4ed4-945b-74ccdcd837a1`.
Refreshed base: `2644046f2407edd9225e06293e4369b4dcfe2405`.
Applied and tested top: `aa40c0562cd048022b15c30c05e198cc75a73832`.
No carried members. No fetch, rebase or commits by B.

`git range-diff 309d742605a0516067840863ffdf3be29b03fc0c..6f709e4a841ce1a84561158901904f493a349387 2644046f2407edd9225e06293e4369b4dcfe2405..aa40c0562cd048022b15c30c05e198cc75a73832` matches all six commits with `=`.

Every configured check ran on this top with refreshed AKROGON_BASE:

- M1: `bun run format`: exit 0. Log: implementation/merge-format.log. It changed only src/status.ts and skills/chart-issues/scripts/peer-wait.ts with the known unrelated Prettier drift documented by both reviews. Those formatter-only changes were inspected and restored to the unchanged recorded top before subsequent checks. No pre-existing changes were present.
- M2: `bun test --timeout=30000`: exit 0, 735 pass, 0 fail, 7714 assertions, 70.76 s. Log: implementation/merge-test.log.
- M3: `bun run typecheck`: exit 0. Log: implementation/merge-typecheck.log.
- M4: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 707 pass, 0 fail, 7469 assertions, 60.59 s. Log: implementation/merge-test_changed.log.

The installed config prints the underlying commands. These are also the plan's authorized pre-S2 checks for this nested worktree. No merge_covers, merge_checks or advisory commands are configured. No external service fixtures or grants were needed. Code worktree is clean after checks.

Completion owner inspected: worktree-isolation/ISSUE.md. Other leaves remain open, so this leaf alone does not complete the issue. Broadcast only if the phase command reports a completion owner.

Merge result: `akrogon phase worktree-store merged --slot B --check --attempt 67918128-6005-4ed4-945b-74ccdcd837a1` returned `ok`. The matching `merged` call returned `moved merged`, exit 0. `git ls-remote origin refs/heads/main` confirms `aa40c0562cd048022b15c30c05e198cc75a73832`; leaf state is merged and code worktree remains clean. No issue/epic completion line was printed, so no broadcast ran. The command reported self-update skipped because the registered checkout is diverged and 26 commits behind origin/main, with `akrogon sync` as its suggested operator action. This did not prevent the merge.
