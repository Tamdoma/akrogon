# Review B: twin-guard

Date: 2026-10-19. Phase: check.review. Verdict: **ready**.

Base: `abfee125b4ab68bec34bd73325c077c12c74fc47`.
Reviewed head: `efe9832bb3595dc30b2b83a0cd909f3ca450d07d`.
Tree: `56d5910ec811358324c28c0f6dad0d92e0a6ab2d`.

## Findings

No Fixes, Nits or operator actions. Reviewed blind against brief, design, plan and implementation report. Debate is off, so no positions-B/rebuttal-B artifacts are expected. No code changed during review.

- C1/C2: `twinConflict` derives the top-level open owner from the validated leaf path and checks existence under closed and parked. `dispatchLeaf` refuses before phase handling, input checks, allocation and prompt delivery. Reporting uses the owner path, so multiple leaves yield one error and a nonzero pass result.
- C3: discovery and dependency lookup remain unchanged. The CLI test dispatches both other-owner leaves, including the dependent of the merged twin leaf.
- C4: every mergeQueue caller passes Repo. Eligibility excludes twins in the initial selection and locked re-check. The CLI proof dispatches m2 while m1 would otherwise win the queue tie. The completion destination refusal remains intact.
- C5: the predicate excludes paths outside issues/open. Explicit closed-owner path dispatch still passes with its open twin present.

Read docs/reference-index.md, src/AREA.md, tests/AREA.md, docs/guide/next.md and docs/guide/files.md. The guide's general eligibility description does not promise owner-name reuse. Its partial reason list omits the new refusal, as explicitly scoped by plan D7, but gives no action that bypasses it. No documentation defect with a concrete consequence today. No AREA.md or lesson files changed in this diff.

## Evidence

Read the saved logs with `akrogon log`. Existing proof is current, so checks were not repeated. The full suite runs the actual CLI against temporary registered repositories, with external Herdr isolated by the existing fixture.

The verify receipt `c1c3bd47-85e9-4895-8d13-a23f691e2b9f` records the reviewed head/tree and the complete planned commands, after the latest test/helper changes:

- `check format: 0 implementation/check-format-1792425646138-321031.log`: formatting passes.
- `check test: 0 implementation/check-test-1792425813506-321031.log`: 1058 pass, 0 fail across 64 files. All seven twin cases and all affected existing fixture cases pass.
- `check typecheck: 0 implementation/check-typecheck-1792425815750-321031.log`: tsc passes.

Pre-code CLI failures establish the bug rather than just a new assertion: each expected exit 1 and observed exit 0. Read back:

- `check twin-slug-refusal: 1 implementation/check-twin-slug-refusal-1792425129153-3019491.log`.
- `check twin-all-refusal: 1 implementation/check-twin-all-refusal-1792425134792-3033387.log`.
- `check twin-merge-queue: 1 implementation/check-twin-merge-queue-1792425148286-3079923.log`.
- `check twin-conflict-forms: 1 implementation/check-twin-conflict-forms-1792425151138-3110006.log` (all three forms fail).

The current full-suite log proves all these outcomes green, plus unchanged closed-path dispatch. Earlier red verify failures came from the colliding fixtures repaired in efe9832b, not an unrelated known-red condition. No skipped tests or runner/config changes appear in the diff.

Review captures, also read back:

- `check review-b-diff: 0 implementation/check-review-b-diff-1792425861900-1264032.log`.
- `check review-b-audit: 0 implementation/check-review-b-audit-1792425905297-1453255.log`.

All relative evidence paths above are under this leaf.

## Test-Change trailers

Checked the path rule in src/test-files.ts and every trailer in base..HEAD. All changed existing test paths are covered. The trailers below are accepted against the locked owner-reuse decision and the actual fixture/command behavior.

### 4eca411d

> Test-Change: tests/next.test.ts locked owner-reuse decision 1a refuses an open owner whose name exists under issues/closed or issues/parked; 'closed owner name does not block an open same-name owner' loses its exit-0 dispatch half, rewritten as 'closed owner twin refuses next <slug> without dispatch', and its closed-path dispatch half becomes 'a closed leaf dispatches by path while its open twin exists'

The old successful open-twin expectation contradicts the design. The closed-path assertion remains covered.

### 5eba845a

> Test-Change: tests/next.test.ts corrected two planned expectations against real fixture output: a refusal inside the dispatch lock creates ~/.akrogon/.lock itself so the twin refusals use expectRefused (no .lock assertion), and the --all tests use an empty closed owner because a closed leaf dispatches legitimately under --all

withLock creates the lock file before refusal. The replacement helper retains state, Herdr-call, worktree and lifecycle-log checks. Empty conflicting folders are explicitly covered by C2, and closed dispatch is covered separately by C5.

### efe9832b

> Test-Change: tests/next.test.ts the twin guard refuses the incidental collisions: 'dep detail labels' moves its merged leaf to closed/tmpmove, 'dormant issue/resting' puts the open leaf under active-issue so parked issue/resting stays unmatched, and 'sourced completion after a failed rename' starts the leaf already merged with the destination occupied, the only state that still reaches completeOwner's throw after the merge-turn gate excludes twins

> Test-Change: tests/keep-rule.test.ts after report-leaf completes owner issue, calm-leaf gets its own calm-issue owner instead of the twin 'issue'

> Test-Change: tests/phase.test.ts 'failed container rename retries' starts close-error already merged since a merge-phase twin is refused at the queue gate; the retry assertion changes to absent log.jsonl because no merge move commits in this reproduction

The renames preserve dependency, dormant-selection and cleanup assertions while removing now-forbidden owner collisions. Starting retry fixtures already merged represents the persisted state after a completion failure. It preserves destination refusal, source-closing order and retry coverage. With no phase transition in that fixture, expecting no lifecycle log is correct. The final full suite postdates these changes.

## 2026-10-19 check.repair

Reviewed both initial reviews at efe9832bb3595dc30b2b83a0cd909f3ca450d07d. Repaired A's F1 in commit `5d96fa0941a0606fbf0ebb384204f6d1d2cf414d` (docs/guide/next.md only). The guide now puts the twin-owner refusal first, covers closed/parked and empty conflicts, and explains the once-per-owner error while other owners continue. This corrects B's initial acceptance of the omitted ordering rule. No locked decision or test expectation changed.

Before: "Reasons come in order. A failed leaf needs phase recovery first." After: twin-owner conflicts precede failed-phase handling. Evidence, read back with akrogon log:

- `check repair-b-refusal-before: 0 implementation/check-repair-b-refusal-before-1792425980843-1548619.log`.
- `check repair-b-doc-diff: 0 implementation/check-repair-b-doc-diff-1792425994004-1549536.log`.
- `check repair-b-doc-after: 0 implementation/check-repair-b-doc-after-1792425993881-1549469.log` (git diff --check).
- `check repair-b-commit: 0 implementation/check-repair-b-commit-1792425997882-1550114.log`.
- `check repair-b-head: 0 implementation/check-repair-b-head-1792426035822-1695187.log`.

A's N1 remains deferred: no supported writer produces dangling owner symlinks, so there is no realistic source or requested criterion for that case. No test or issue added for it. The reusable documentation-review lesson matches the existing stale-rule-in-docs lesson; appended this case to the registered checkout's learnings/history/2026-09-11-stale-rule-in-docs.md, left uncommitted for the operator. It is a judgment lesson, so no seed is required.

No Fix handed to A and no operator action is open. C1–C5 test commands, code, fixtures, helpers, config and lockfile are unchanged since their green proof, so no separate targeted rerun is triggered. The required full verification runs on the committed repair head.

`akrogon verify` passed on `5d96fa0941a0606fbf0ebb384204f6d1d2cf414d`, receipt `30f77bae-2f9e-4996-bdbe-2a5ef52f81ed`. Logs read back with akrogon log:

- `verify format: 0 implementation/check-format-1792426000176-1550195.log`.
- `verify test: 0 implementation/check-test-1792426170204-1550195.log`: 1058 pass, 0 fail, including all seven twin cases. This planned proof was written by A and passes on B's repair head.
- `verify typecheck: 0 implementation/check-typecheck-1792426172362-1550195.log`.

Final repair disposition: F1 repaired, no remaining Fixes. Worktree clean. Request merge.

## 2026-10-19 merge attempt 48533a33-9bf6-4190-bb3f-5318eaa6c120

Solo turn. Fetched origin and rebased onto `fe02e2df28bc1836247049cb00d4e045ff21f63f` (origin/main). Prior reviewed/repaired head: `5d96fa0941a0606fbf0ebb384204f6d1d2cf414d`. Resolved head: `96a96979d15bc355115a70f409ec297a9fa81587`.

One conflict in src/next.ts's locked mergeTurn check: preserved main's command-owner/landAlive refusal and passed repo to this leaf's mergeQueue check. No test expectation changed. Range-diff shows the other three commits unchanged and only that context adjustment in the product commit.

- `check merge-b-rebase: 1 implementation/check-merge-b-rebase-1792426228116-2375017.log`: expected conflict, resolved as above.
- `check merge-b-rebase-continue: 0 implementation/check-merge-b-rebase-continue-1792426236905-2375943.log`.
- `check merge-b-range-diff: 0 implementation/check-merge-b-range-diff-1792426246673-2376656.log`: `git range-diff abfee125b4ab68bec34bd73325c077c12c74fc47..5d96fa0941a0606fbf0ebb384204f6d1d2cf414d fe02e2df28bc1836247049cb00d4e045ff21f63f..96a96979d15bc355115a70f409ec297a9fa81587`.
- `check merge-b-retired-lessons: 0 implementation/check-merge-b-retired-lessons-1792426246549-2376578.log`: none removed.

Worktree clean before verification. No operator action or widened live action required.

`akrogon verify --attempt 48533a33-9bf6-4190-bb3f-5318eaa6c120` passed at merge scope on `96a96979d15bc355115a70f409ec297a9fa81587`. Read back all listed check logs:

- `verify format: 0 implementation/check-format-1792426259973-2377840.log`.
- `verify test: 0 implementation/check-test-1792426413180-2377840.log`: 1072 pass, 0 fail across 65 files, including the twin criteria on the combined branch.
- `verify typecheck: 0 implementation/check-typecheck-1792426415361-2377840.log`.

No advisory or merge-only checks configured. Gathered owner-completion/ISSUE.md and both twin-guard and slug-witness briefs; slug-witness is already merged. Ready for the command's checked push and owner completion.
