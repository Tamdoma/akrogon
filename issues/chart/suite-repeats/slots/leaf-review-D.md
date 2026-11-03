# Leaf Review: `suite-repeats` — Seat D

## 1. Missing `blocked-by` between `merge-receipt-reuse` and `quick-red-skip`

- **Evidence**:
  - `merge-receipt-reuse/state.yaml` (`blocked-by: []`) and `quick-red-skip/state.yaml` (`blocked-by: []`).
  - `merge-receipt-reuse/design.md` `## Leaf architecture` and `quick-red-skip/design.md` `## Leaf architecture` both own `src/verify.ts` and `tests/verify.test.ts`, editing the same functions and lines: `reuseSource` (`src/verify.ts:242-255`), `greenRun` (`src/verify.ts:212-221`), `verify`'s `--known-red` path (`src/verify.ts:887-899`), and `tests/verify.test.ts:1084-1513` (notably `tests/verify.test.ts:1378-1381` and `1406-1423`, which test `known-red` with `reused` entries and a seeded whole-green base row).
  - Both designs currently hedge on merge order (`merge-receipt-reuse/design.md` `## Binding decisions, verbatim`: `"this leaf only drops scope from reuseSource if it still exists on its base"`; `quick-red-skip/design.md` `## Binding decisions, verbatim`: `"uses that green predicate as it exists on this leaf's base (greenRun)"`). Running both concurrently in separate worktrees guarantees a rebase conflict in `src/verify.ts` and `tests/verify.test.ts`.
- **Proposed change**:
  - In `quick-red-skip/state.yaml`, set `blocked-by: [merge-receipt-reuse]`.
  - In `quick-red-skip/design.md` `## Binding decisions, verbatim`, replace `"uses that green predicate as it exists on this leaf's base (greenRun); the scope removal itself is owned by leaf merge-receipt-reuse, which also drops scope from reuseSource only if reuseSource still exists on its base"` with `"uses the scope-free greenRun predicate delivered by prerequisite leaf merge-receipt-reuse"`.

## 2. Missing binding cost statement in `merge-receipt-reuse/brief.md`

- **Evidence**:
  - `issues/chart/suite-repeats/forks/merge-reuse.md` `## Taken` item 1 (and `merge-receipt-reuse/design.md` `## Binding decisions, verbatim` item 1) requires: `"The brief states the cost: one green sample per tree lands, and merge-time flake flips stop feeding akrogon flaky."`
  - `merge-receipt-reuse/brief.md` (`## What` and `## Why`) omits this cost.
- **Proposed change**:
  - Add to the end of `merge-receipt-reuse/brief.md` `## What`: `"Cost: one green sample per tree lands, and merge-time flake flips on an unchanged tree stop feeding akrogon flaky."`

## 3. False surface overlap on `skills/check-issue/SKILL.md` `## check.repair` and missing copies of per-command reuse / stitch rules in `skills/chart-issues/SKILL.md` and `docs/reference/checks.md`

- **Evidence**:
  - `quick-red-skip/design.md` `## Leaf architecture` claims `skills/check-issue/SKILL.md` (`## check.review`, `## check.repair`) and `skills/implement-issue/SKILL.md` (`## Shared context`, `check.fix`). In `skills/check-issue/SKILL.md` `## check.repair` and `skills/implement-issue/SKILL.md` `## check.fix`, the retry/known-red sentence only delegates to `skills/check-issue/SKILL.md` `## check.review` and `skills/implement-issue/SKILL.md` `## Shared context` respectively; neither section mentions per-command reuse or blocked checks. Listing `skills/check-issue/SKILL.md` `## check.repair` in `quick-red-skip` creates an unnecessary ownership overlap with `repair-verify-merge` (`repair-verify-merge/design.md` `## Leaf architecture`), which edits the adjacent paragraph of `skills/check-issue/SKILL.md` `## check.repair`.
  - `skills/chart-issues/SKILL.md` `## Direct route` (step 3) contains a fourth verbatim copy of the known-red per-command reuse promise (`"reusing each command already green on the base tree under the same name and command text and running only what lacks one"`), which `quick-red-skip/brief.md` `## Done-criteria` 6 and `quick-red-skip/design.md` `## Leaf architecture` omit.
  - `docs/reference/checks.md` `## What runs where`, `## Prove a commit with akrogon verify`, and `## Known red` state as current behavior both per-command reuse (`"Each stage runs only what lacks a green result for that command on the same tree, marking the receipt entry reused"`, `"Reuse is also per command"`, `"reusing each command already green on the base tree"`) and the cross-row gate stitch (`"The gate counts a command green when a completed run holds it green on the same tree under the same name and command text, so entries may come from different runs"`).
- **Proposed change**:
  - In `quick-red-skip/design.md` `## Leaf architecture`, change `skills/implement-issue/SKILL.md` (`## Shared context`, `check.fix`) and `skills/check-issue/SKILL.md` (`## check.review`, `## check.repair`) to `skills/implement-issue/SKILL.md` (`## Shared context`) and `skills/check-issue/SKILL.md` (`## check.review`), leaving `skills/check-issue/SKILL.md` `## check.repair` solely to `repair-verify-merge`; and add `skills/chart-issues/SKILL.md` (`## Direct route`) and `docs/reference/checks.md` (`## What runs where`, `## Prove a commit with akrogon verify`, `## Known red`) to `quick-red-skip/brief.md` `## Done-criteria` 6 and `quick-red-skip/design.md` `## Leaf architecture` (removing `"Open for the plan"` on which red-disposition copies need editing).
  - In `merge-receipt-reuse/design.md` `## Leaf architecture`, move `docs/reference/checks.md` (`## Prove a commit with akrogon verify`, `## Known red`, `## Receipt gates`) from `"Open for the plan"` into `Owned surfaces` so the cross-row stitch and scope-gated receipt prose are updated alongside `src/verify.ts`.
