# Review A: docs-pictures-operations (check.review, initial, blind)

Base: 7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8. Reviewed head: 48ca1da9d3b6570e1df8b79eef09f6494b54d444. The worktree is clean.

## Scope check

- The diff is 10 new files under `docs/pictures/` and nothing else (`git diff --stat`). That matches plan D1 and the design's exclusions: no `issues/`, docs page, test or source change.
- No commit carries a co-author line, and no `Test-Change` trailers are needed.
- Mechanical form (D3-D5), checked across all 10 files:
  - No `<script>`, `<image>`, `foreignObject`, `@import` or `href`. The grep count is 0 per file.
  - The first drawn element is the full card `<rect ... fill="#ffffff" stroke="#d0d7de">` in each file.
  - The smallest font-size is 17 (17 ×9, 18 ×10, 19 ×1).
  - `@keyframes` appears only in change-flow and working-day. Both carry the exact `@media (prefers-reduced-motion: reduce) { .marker { animation: none; } }`.
  - In change-flow the marker's keyframes end at `translate(0,0)`, which is its static spot on "merged".
- Docs: no documented behavior changed, and this leaf edits no page (D9).

## Evidence

- `akrogon verify` on 48ca1da9: `verify leaf 48ca1da9...: green` (1115 pass, 0 fail). Logs: `implementation/check-test-1792765413272-2921828.log`, `implementation/check-typecheck-1792765415728-2921828.log`.
- C1 check, `check svg-wellformed: 0 implementation/check-svg-wellformed-1792765198704-2917111.log`. It was red on base: `check-svg-wellformed-1792764742883-2852854.log`.
- C2: the report lists every reduced-motion, motion and embed run-check log and screenshot path, all exit 0. A read the screenshots of all ten pictures.

## Content against sources

I checked each picture against the plan's content list and the cited sources. Nine match:
- change-flow: `src/routing.ts:33-34`.
- working-day: `skills/chart-issues/SKILL.md`.
- dispatch-order: `src/next.ts:843-847`, `src/turn.ts`.
- control-states: `src/akrogon.ts:133-171`, `src/park.ts:39-43`, `src/leftovers.ts:53-67`.
- watch-loop: `skills/watch-issues/SKILL.md:12-59`.
- releases: `src/self-update.ts:236-243`, `src/rollback.ts:25-38`.
- lessons-flow: `skills/learn-issues/SKILL.md:20-33`.
- verification: `src/verify.ts`, `src/phase.ts:472-489`.
- records-vs-code: `src/next.ts:242`, `src/sync.ts`.

failure-recovery has one wrong claim, recorded as F1 below.

## Findings

### Fix

- F1. `docs/pictures/failure-recovery.svg:25-26` says "work kept on the leaf branch (plan, reviews, code)".
  - Why it is wrong: plan and reviews are never on the leaf branch. A leaf worktree is sparse with `!/issues/` (`src/next.ts:242`), a phase move is refused if the branch touches `issues/` (`src/phase.ts:409-418`), and this leaf's own `plan.md` and `review-A.md` sit in the registered checkout's leaf folder. The leaf's own `records-vs-code.svg` says "leaf branch: code only (issues/ left out)".
  - Realistic source: a reader of docs-use-finish, the page that embeds both failure-recovery and records-vs-code, sees two pictures that contradict each other.
  - Consequence today: the picture states a false fact about where a failed leaf's plan and reviews live, so the reader will look for them on the branch.
  - Hits: C1 ("draws the nodes, edges and roles its spec names, checked … against the spec's named sources") and the design rule that code wins.
  - Repair: label the node "work kept: code on the leaf branch, plan and reviews in the leaf folder" (wrapped). This is a docs-only edit, so no test is needed.
  - Origin: A's own plan wording (plan.md item 5, brief-2).

### Nits

- N1. change-flow does not draw the red-merge path merge → check.fix (`src/routing.ts:35`). The spec does not list it, so this is deferred. It becomes a Fix only if a consumer page states that a merge cannot return to repair.
- N2. dispatch-order's "up to max_active at once" leaves out that a leaf with a live tab bypasses the cap (`src/next.ts:399-403`). This is a beginner simplification, and nothing in the spec asks for it.

## Verdict

fix (F1).
