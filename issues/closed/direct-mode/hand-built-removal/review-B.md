# Review B: hand-built-removal

Date: 2026-10-08. Phase: check.review (initial, blind).
Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad.
Reviewed head: 2da133d861de077d575470e8ed2c0c00188da5dc.
Verdict: fix.

## Findings

### F1. Fix: the dispatch guide still promises handbuilt leaves are skipped

Location: `docs/guide/next.md:88`.

Actual source: an operator reading the dispatch guide, including through the new `docs/guide/state.md:46` link, reaches: "A leaf must have valid state and satisfied dependencies. Handbuilt and failed leaves are skipped."

Consequence today: the guide still advertises the removed way to keep work out of dispatch. An operator retaining or adding `hand_built` based on that claim gets an unreadable state, not the documented skip. `readState` now rejects the key through `stateSchema.strictObject`, and dispatch no longer has its former skip branch.

Contract/gap: the design's binding decision deletes hand_built everywhere and makes park the one way to keep work away from agents. D5 explicitly requires removing the term from prose, not just the code path. The changed state guide links directly to this unchanged page.

Evidence: `rg -ni 'hand[ _-]?built' src tests skills docs plugin README.md` returns this line plus only the three intentional criterion-1 test lines. The narrower implementation grep missed the unseparated spelling `Handbuilt`.

Repair: remove the handbuilt claim from that sentence, retaining the failed-leaf behavior. No code change is required.

## Verification

- Read brief, design, plan, implementation report, affected state and dispatch guides, reference index and area pointers. No AREA.md is changed or deleted in the reviewed diff.
- Inspected the entire base-to-head diff, state parsing and migration filter, dispatch, eligibility, mergeQueue, park behavior and the new CLI test. No other code defect found.
- Criterion 1: the CLI test exercises the real status command, asserts nonzero exit and the schema diagnostic's state.yaml path and removed key, and confirms a healthy repo remains visible. The report records fail-before/pass-after. Separating this case from the shared overview fixture preserves its unrelated coverage.
- Criterion 2: `rg -n 'hand_built|hand-built' src tests skills docs plugin README.md` finds only the three intentional rejection-test lines. All dispatch/merge branches are removed. Replacement fixtures preserve their dependency and unfinished-owner purposes.
- Criterion 3: the four named files contain no removed key, and state.md points to whole-issue parking. F1 identifies the remaining affected guide claim.
- Criterion 4: repeated read-only search over state.yaml in issues/open, issues/parked and issues/closed under all ten registered repo roots. No matches, exit 0. No status scan, fetch or record migration was used for this proof.
- Reused implementation checks for the unchanged reviewed head: typecheck rc=0, format rc=0, changed tests 426 pass/0 fail, full suite 533 pass/0 fail. No missing check evidence or code concern warranted another run. The report's reverted unrelated formatter rewrite is outside this diff.
- The plan's literal zero-hit grep across tests conflicts with criterion 1's required key fixture. The three deliberate rejection-test mentions satisfy the intended behavior and are not a defect.

## Test-Change trailers

Commit `2da133d861de077d575470e8ed2c0c00188da5dc` contains:

- `Test-Change: tests/status.test.ts brief criterion 1 (hand_built removed from schema); drop the field from the broken fixture and its absence assertion, hold the manual merge leaf with blocked-by, add an unreadable-leaf case`
- `Test-Change: tests/state.test.ts brief criterion 1 (hand_built is no longer a supported key); drop it from the supported state`
- `Test-Change: tests/next.test.ts brief criterion 2 (no hand_built branch); drop hand-built refusal and arm, hold siblings with blocked-by on a failed leaf`
- `Test-Change: tests/batch-dispatch.test.ts brief criterion 2 (no hand_built branch); hold zz as a failed leaf`

All four existing changed test files match `src/test-files.ts`. Their cited brief criteria authorize removing obsolete assertions and replacing holding fixtures. The remaining blocked-by turn test retains the prior blocked-by arm's assertions. No regression coverage was removed without a source. The docs commit changes no test file.

## Operator actions

None.

## check.repair — 2026-10-08

Read both initial review files for head `2da133d861de077d575470e8ed2c0c00188da5dc`. B's F1 was the only Fix. No operator action or handoff to A remains. A's N1 concerns artifact phrasing and does not change acceptance of the proven outcome; B holds no reusable Nit.

F1 repaired in commit `c0f223f` (`docs: remove obsolete handbuilt dispatch claim`).

Before (`docs/guide/next.md:88`):

> A leaf must have valid state and satisfied dependencies. Handbuilt and failed leaves are skipped.

After:

> A leaf must have valid state and satisfied dependencies. Failed leaves are skipped.

Verification at repaired head:

- `bun run format`: exit 0. It rewrote only the previously reported unrelated `src/status.ts` line wrap; that formatter-created change was reverted. Worktree is clean.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 533 pass, 0 fail, 5714 assertions, 34.66 s. Log: `/tmp/akrogon-1000/hand-built-removal-6e1a3cb6a976/tmp.KPCJT1FFEl`.
- `AKROGON_BASE=f57bb356c149ed6b9d87a5e122a79d1b54de15ad bun test --changed="$AKROGON_BASE" --timeout=30000` (base exported before invocation): exit 0, 426 pass, 0 fail, 3911 assertions, 28.64 s. Log: `/tmp/akrogon-1000/hand-built-removal-6e1a3cb6a976/tmp.uGc0scnCqS`.
- Criterion 1: the passing suites include the real CLI removed-key rejection test. Review A already recorded deliberate-break fail/pass for this unchanged test and schema.
- Criterion 2: case-insensitive `rg -ni 'hand[ _-]?built' src tests skills docs plugin README.md` returns only the three intentional rejection-test mentions. The passing suites include dispatch, merge-turn and rewritten fixture coverage.
- Criterion 3: that same scan has no skill or guide hits. `rg -n 'akrogon park' docs/guide/state.md` returns line 46 naming whole-issue parking.
- Criterion 4: repeated read-only state.yaml scan under issues/open, issues/parked and issues/closed of all ten registered roots. No matches, exit 0. No status scan, fetch or record mutation.

No merge_checks run. Repair is complete and ready for merge.

## merge — 2026-10-08

Applied attempt: `4af29370-ab73-4b3e-bf9d-3181ebf9d672`. No carried members.
Refreshed base: `58b9ecda3e9898c33646b7a46c35e0f3322b5878`.
Tested top: `d17029e2b0a8c369ee366a91bf12346141fc508a`, matching the prompt and batch record. No commits, fetch or rebase performed by this seat.

Checks:

- `bun run format`: exit 0. Reverted only its known unrelated phaseColor wrapping in src/status.ts. Worktree clean.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 534 pass, 0 fail, 5728 assertions, 35.27 s. Log: `/tmp/akrogon-1000/hand-built-removal-6e1a3cb6a976/tmp.fWwkNILXBo`.
- `AKROGON_BASE=58b9ecda3e9898c33646b7a46c35e0f3322b5878` exported, then configured `test_changed`: exit 0, 427 pass, 0 fail, 3925 assertions, 30.94 s. Log: `/tmp/akrogon-1000/hand-built-removal-6e1a3cb6a976/tmp.gPXdKF2SVl`.
- No merge_checks or advisory commands configured.
- Removed-term scan still returns only the three intended rejection-test mentions.

Completion-owner context: direct-mode/ISSUE.md lists direct-setting and direct-route as sibling leaves still open. This one-leaf batch cannot complete that issue. No other completion owner is carried.

`akrogon phase hand-built-removal merged --slot B --check --attempt 4af29370-ab73-4b3e-bf9d-3181ebf9d672` returned `ok`, recording the tested top and accepting the stack's test-change trailers.

`akrogon phase hand-built-removal merged --slot B --attempt 4af29370-ab73-4b3e-bf9d-3181ebf9d672` returned `moved merged`, exit 0. No issue/epic completion line was printed, so no broadcast was due. The command performed the push and leaf transition.
