# Review B: dependents-first

Date: 2026-10-10. Phase: check.review (initial, blind).
Base: `2e78945849eed87c42abd56f224909f4d2050b36`.
Reviewed head: `e8d876833546540257740aec6c377525e2c0d388`.
Verdict: **fix**.

## F1: Remove the prose-wording test

`tests/dependents-first.test.ts:115-122` requires the exact prose word `transitively` in both guides. This is not a command, number, or fixed reference executed literally. The check-issue review contract explicitly rejects akrogon tests of prose/output wording, and the operator's Function over form rule requires judgment of meaning instead.

Realistic source: an ordinary edit to the live operator guide expressing the same ordering. Replacing `directly or transitively` in `docs/guide/merge.md` with `directly or through a chain of prerequisites` preserves C5's documented behavior but fails the assertion at line 119. An in-memory probe of the actual guide printed `originalAssertion: true`, `equivalentWordingAssertion: false`. No repository file was changed for this probe.

Consequence today: the configured blocking `bun test --timeout=30000` contains a gate on prose spelling rather than the documented result. It rejects a valid guide edit and also accepts incorrect ordering text whenever those two tokens remain. This violates the review contract and Function over form, rather than demonstrating C5.

Repair: delete this prose-token test. Keep the four CLI behavior tests and review the guides' meaning directly. C5 is already supported by the status TURN assertions and the correct guide text. The deleted expectation's cited source is C5 (ordering meaning) plus the explicit prohibition above. Record a Test-Change trailer for the deletion.

## Verification and scope

Read the brief, binding design, plan, implementation report, reference index, affected guide pages, shared counter and both ordering callers. Debate is disabled, so no positions/rebuttal artifacts are expected. No peer review was read.

The code follows D1-D4: distinct unmerged dependents are counted once through reverse edges, merged nodes stop traversal, batch records take queue priority, existing queue tie breaks remain, and dispatch retains merged-first and stable tie order. Counts for a selected subset use the full discovered repository graph. Status and phase guards consume the shared queue unchanged. No AREA.md changed.

The merge, next and state guides describe the implemented behavior. C1-C4 and the status part of C5 have CLI boundary coverage. The implementation report records deliberate-break red/green evidence for the four behavioral cases and all configured checks green at the reviewed head (608 full-suite passes, 47 changed-suite passes, typecheck and format pass). No missing check evidence or behavioral concern justified a full-suite rerun.

Reviewer rerun for the test concern: `bun test tests/dependents-first.test.ts --timeout=30000` exited 0, with 5 pass, 0 fail and 15 assertions. The wording probe above shows why a currently green suite does not resolve F1. Worktree remained clean. No operator actions or additional Nits.

## Test-Change trailers

Path classification checked against `src/test-files.ts`. Trailers in base..HEAD:

- `a2b48ea`: `Test-Change: tests/batch-dispatch.test.ts dependents-first ordering: dep blocked-by gains 'holder' so the intended holder keeps the turn; no existing expectation changed`.
- `a2b48ea`: `Test-Change: tests/pause-next.test.ts dependents-first ordering: dep blocked-by gains 'holder' so the intended holder keeps the turn; no existing expectation changed`.
- `e8d8768`: `Test-Change: tests/dependents-first.test.ts typecheck fix: build the fixture as fixture() then spread fakeHerdr's return; no existing expectation changed`.

The two fixture changes are justified by brief criterion 1 and D2: a member with a dependent now outranks the older holder unless counts tie. Adding the holder as another prerequisite preserves the existing batch completion and pause-race assertions while restoring their intended holder identity. The fixture typing change alters no expectation. The feature test file was new at the base and needs no trailer under the changed-old-file rule.

## 2026-10-10 check.repair

Read both initial reviews at `e8d876833546540257740aec6c377525e2c0d388`. F1 was the only Fix. A's N1 is resolved by the same deletion. A's N2 requires no repair because the implementation report preserves the relevant worker evidence. A's N3 records a completed plan update. No operator actions or Handed to A items remain, and B holds no reusable Nit.

Repaired F1 in commit `d6d41c5370e82f85c2c4dbf781f72732a8253346`: deleted the prose-token test and its now-unused path import. Before: four assertions required guide tokens, including `transitively`. After: the file contains only four CLI behavior tests. The initial review's equivalent-wording probe is the before evidence. No runtime behavior changed, so this test-policy repair needs no additional failing behavioral test. The commit carries `Test-Change: tests/dependents-first.test.ts C5 and check-issue prose-test prohibition: remove token assertions that reject equivalent guide wording`.

All required checks completed with exit 0 at the repaired code:

- `bun run format`: pass. It also reformatted the pre-existing `src/status.ts` phaseColor line, which was restored to avoid an unrelated change.
- `bun run typecheck`: pass.
- `bun test --timeout=30000`: 607 pass, 0 fail, 6334 assertions, 47.39 seconds.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with base `2e78945849eed87c42abd56f224909f4d2050b36`: 46 pass, 0 fail, 400 assertions.

Logs: `/tmp/akrogon-1000/dependents-first-9f4bbdae4a46/dependents-first-B.v37EpL/{format,typecheck,test,test_changed}.log`.

C1-C3: the three status TURN cases pass. C4: fake-herdr dispatch-order case passes. C5: status proofs pass, all docs-links cases pass in the full suite, and direct review of merge.md:5, next.md:129 and state.md:50 confirms the documented dependent-count ordering and existing tie rules. C6: all configured checks above pass. Existing deliberate-break evidence remains applicable because the ordering code and four behavior tests are unchanged. No merge_checks run. Final worktree is clean, and the repair diff is limited to the recorded Fix.

## 2026-10-10 merge checks

Attempt: `5014cd9b-435b-4812-8fc6-a9ffffdb223f`. Applied top and tested HEAD: `808a90e14b3b1a53b998127c58a08a02f9ab1b8c`. Refreshed AKROGON_BASE / batch built_on: `d7dd5a14b638736546a4c6defc13b19cf32c2f94`. Batch has no carried members. No fetch, rebase or commit by this seat.

All configured checks exited 0 on the applied stack: `bun run format`; `bun run typecheck`; `bun test --timeout=30000` (607 pass, 0 fail, 6334 assertions, 49.32 seconds); required-base guard followed by `bun test --changed="$AKROGON_BASE" --timeout=30000` (46 pass, 0 fail, 400 assertions). No merge_covers, merge_checks or advisory commands configured. Format's unrelated pre-existing src/status.ts drift was restored, leaving the tested worktree clean.

Logs: `/tmp/akrogon-1000/dependents-first-9f4bbdae4a46/dependents-first-merge.c49XxS/{format,typecheck,test,test_changed}.log`.

Completion-owner inventory: merge-throughput/ISSUE.md lists eight leaves. Besides this holder and already merged bounce-repair-proof, six leaves remain in implement or plan.synthesis. This batch can close no issue or epic, so no completion-owner broadcast is expected.

`akrogon phase dependents-first merged --slot B --check --attempt 5014cd9b-435b-4812-8fc6-a9ffffdb223f` exited 0 and printed `ok`. The subsequent `merged` call under that attempt exited 0 and printed `moved merged`, with no issue/epic completion lines. The command performed the push. No broadcast was required.
