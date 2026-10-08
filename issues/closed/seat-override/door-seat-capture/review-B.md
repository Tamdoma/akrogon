# Review B: door-seat-capture

Date: 2026-10-08
Phase: check.review (initial, blind)
Base: `1c3a1ca08e1039f0061be4b7cae6826c5226a81e`
Reviewed head: `e5e67753e82bbbab55089bd1160fea9ea0e7bea1`
Verdict: ready

## Scope and grounding

Read brief, design, plan, implementation report, readiness, standing design and ponytail guidance before judging the diff. `debate: no`; no positions-B.md or rebuttal-B.md is expected. Did not read the peer review.

Reviewed all three changed files against `src/config.ts:12-21,83-148`, the affected human guide and the existing seat guidance in `docs/guide/cheat.md` and `docs/guide/files.md`, reached through `docs/reference-index.md`. No AREA.md changed. No code, test, dependency or unrelated doc changed.

## Verification

- C1: Both index templates contain the specified front matter. The adjacent prose covers optional a/b seats, exact whole-seat fields, trimmed nonblank decoded values without quotes, strict keys at every level, machine harness templates, literal delimiters, per-seat ISSUE/EPIC/repo/machine precedence, index-before-state write order and no state seat field. Each rule agrees with the live parser and resolver. The container-index contract explicitly permits seat configuration.
- C2: The first Handoff paragraph includes the model-sensitive intake/map/design trigger, no-block default, operator-selected owner index, write order and each leaf's effective seats in the review. Concrete trace: an epic handoff with a model-sensitive leaf asks once, records an epic-scoped answer in EPIC.md before leaf state, and displays seats resolved per leaf. An issue-scoped answer goes in ISSUE.md and takes precedence for that issue's leaves. No qualifying work leaves the optional block absent.
- C3: The guide adds exactly one seat-question sentence in the planned section. A Python comparison of every base-tracked chart-issues file's restatement matches, including paths and line numbers, confirmed identical output: 10 matches. A separate comparison confirmed the seats.yaml section and all following shapes.md content are unchanged. `git diff --name-only <base>...HEAD` contains exactly the three owned files. `git status --porcelain` was empty.

The implementation report records `bun run format` and `bun run typecheck` passing, `bun test --timeout=30000` with 533 pass / 0 fail across 25 files, and changed-test runs with no affected tests. Reused this evidence because this is a prose-only diff, the reviewed head matches the report, and inspection found no specific check concern. No additional suite rerun is required by the skill's rerun rule. Presence/absence reads are the planned proof for these prose criteria, with no wording assertions or deliberate test mutation required.

The documented behavior changed as requested: conditional seat capture at handoff, index configuration and effective-seat review. Existing configuration documentation remains consistent. The whitespace removal preserves the brief's literal restatement output and does not alter the surrounding fenced content.

## Test-Change trailers

None in `<base>..HEAD`. No existing file matched by `src/test-files.ts` was changed, so no trailer is required.

## Findings

No Fixes, Nits or unresolved questions. No operator actions or reusable Nit to record.

## Merge verification — 2026-10-08

Attempt: `6e551a93-227d-47f5-b0e8-d7e42eb44860`.
Applied top and tested HEAD: `e5e67753e82bbbab55089bd1160fea9ea0e7bea1`.
Refreshed AKROGON_BASE / built-on target: `1c3a1ca08e1039f0061be4b7cae6826c5226a81e`.
Batch members: none. No fetch, rebase, code edit or commit performed.

Configured checks, in order:
- `bun run format`: exit 0, all files unchanged.
- `bun test --timeout=30000`: exit 0, 533 pass / 0 fail, 25 files, 5717 assertions. Full output: `merge-test.log` beside this review.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, three changed files and no affected tests.

No configured merge_checks or advisory commands. Worktree remains clean. Both reviews contain no Fix. The completion owner is standalone issue `seat-override`; its other leaves `index-seats` and `subagent-seat-model` are already merged. Read all three leaf briefs for completion context.
