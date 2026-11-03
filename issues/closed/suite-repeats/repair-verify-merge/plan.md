# Plan: repair-verify-merge

Serial-solo: one unit owns both files; A implements directly, no workers.

## Decisions

- **D1** (design Q1, locked): in `skills/check-issue/SKILL.md` `## check.repair`, `akrogon verify` runs only when B's exit is the `merge` move; on `check.fix` or `failed` exits B runs none. Edit: take `then runs \`akrogon verify\` on the committed head, which runs \`checks\` only and writes the receipt the move into \`merge\` requires` out of the every-exit "After repairs" sentence and state it as conditional on the merge exit; the changed-input proof sweep keeps its every-exit wording and the per-Fix evidence paragraphs stay untouched.
- **D2** (design Q2, locked): extend the existing gate test `a repair move into merge needs a green leaf receipt for HEAD` in `tests/receipt-gates.test.ts` with a second `check.repair` leaf (`handed`) whose move to `check.fix` exits 0 with no receipt and lands the leaf in `check.fix`; retitle the test to cover both moves. No prose-matching test.
- **D3** (answers `Open for the plan`): `docs/reference/checks.md` gate table already scopes the leaf receipt to `check.repair` to `merge` only; `docs/reference/state-and-phases.md` line 33 says the same; `docs/examples/autopilot-story.md` narrates no verify on repair handoffs. No doc text change.
- **D4**: `tests/AREA.md` line 17 names `check.review`, `merged --check` and direct-guards but not the `check.repair` gate the file already covers; add `check.repair` to that line.

## Read first

- `issues/open/suite-repeats/repair-verify-merge/brief.md`, `design.md`
- `skills/check-issue/SKILL.md` `## check.repair` (the "After repairs" paragraph, line ~93)
- `tests/receipt-gates.test.ts` (gate test at line ~43)
- `src/phase.ts:431` (the check.repair→merge receipt gate), `src/routing.ts:38` (`check.repair` next: merge, check.fix, failed)
- `docs/reference/checks.md` gate table (~line 74), `docs/reference/state-and-phases.md:33`, `docs/examples/autopilot-story.md`
- Review-walk evidence: `issues/closed/repeat-calls/fewer-repeat-calls/review-B.md`, `issues/closed/killed-run-fixture/abandoned-capture-stop/review-B.md`

## Interfaces used

- `tests/helpers.ts`: `fixture`, `branch` (local helper in the test file), `leaf`, `cli`, `greenReceipt`; `readState`, `saveState` from `src/state.ts`.
- `akrogon phase <slug> <phase> --slot B` from a leaf worktree runs `moveGuards`, then the receipt gate only on `requested === 'merge'`.

## Checklist

| File | Change | Criterion |
| --- | --- | --- |
| `tests/receipt-gates.test.ts` | Add `handed` leaf asserting `check.repair → check.fix` exits 0 with no receipt and lands in `check.fix`; retitle test | 2 |
| `skills/check-issue/SKILL.md` | Make `akrogon verify` conditional on the `merge` exit in `## check.repair` | 1 |
| `tests/AREA.md` | Name `check.repair` in the receipt-gates line | bookkeeping |

Docs affected: `tests/AREA.md` one line (D4); `docs/` needs no change (D3).

### Wave 1 (serial-solo)

- **U1**: owns `skills/check-issue/SKILL.md`, `tests/receipt-gates.test.ts`, `tests/AREA.md`. No shared test resource, no dependencies. Test commit first (`Test-Change` trailer on `tests/receipt-gates.test.ts`), then the skill edit.

## Done-criteria proof

### Criterion 1 — verify directed only on the merge move; sweep stays every-exit; per-Fix evidence unchanged

- **Observation**: `check.review` walk of the changed paragraph against (a) a pure handoff — `issues/closed/repeat-calls/fewer-repeat-calls/review-B.md` 2026-10-26, (b) mixed repairs — `issues/closed/killed-run-fixture/abandoned-capture-stop/review-B.md` 2026-10-28, (c) any one check.repair entry finishing in `merge`. Diff inspection: `git --no-pager diff main -- skills/check-issue/SKILL.md`. Size: minutes. Rerun trigger: any re-check or repair of this leaf.
- **State before**: one "After repairs" sentence runs `akrogon verify` on every check.repair exit (~65 min akrogon, ~51 min framework per run on handoffs nobody gates).
- **State after**: the sentence keeps only the every-exit proof sweep; `akrogon verify` appears conditioned on the `merge` move.
- **Product failure it catches**: B paying an unread full verify on `check.fix`/`failed` exits; or gating the sweep to merge-only, which would strip A's check.fix reuse and the head-attribution boundary.
- **Condition scan on D1** (what must stay / be refused / not happen):
  - Sweep stays every-exit → the edit touches only the verify clause; a violation requires editing the sweep clause, which has no executable boundary — caught by the diff and the criterion-1 review walk. (Traced reason; no case possible.)
  - `check.repair → merge` still refused without a receipt → executable, covered by criterion 2's gate test.
  - No verify on `check.fix`/`failed` exits → prose is the spec; no runtime hook reads it. The executable half (the ungated move the rule relies on) is criterion 2's new case; the prose half is the review walk. (Traced reason.)
  - Per-Fix evidence paragraphs unchanged → the diff is confined to the one paragraph; shown by `git diff` hunk scope in review.

### Criterion 2 — `check.repair → check.fix` succeeds with no receipt; `check.repair → merge` still refuses without one

- **Observation**: `akrogon run-check --name <label> -- bun test tests/receipt-gates.test.ts`, the repo's `test`-check runner on the one file. Boundary: `akrogon phase` transition gates in `src/phase.ts`, observed through the fixture CLI end to end. Size: seconds. Rerun trigger: changes to `src/phase.ts` gates, `src/routing.ts` check.repair next-moves, or this test.
- **State before**: merge move without receipt exits non-zero (`No green leaf verify receipt for <head>`); the check.fix move was unasserted.
- **State after**: `check.fix` move with no receipt exits 0 and the leaf lands in `check.fix`; the merge move still refuses without a receipt and succeeds with a green leaf receipt.
- **Condition scan on D2**: the violation this case exists to catch is a receipt requirement on the `check.fix` move. Shown red at planning by a temporary `src/phase.ts` edit gating `check.fix` the same as `merge` — output below; the edit is discarded before the test commit. A move that left the leaf in `check.repair` is caught by the `readState` assertion. A weakened merge gate is caught by the pre-existing `missing`/`greenReceipt` assertions in the same test.
- **Red evidence** (temporary `src/phase.ts` gate on `check.fix`, reverted before the test commit): `check criterion-2-red: 1` — `implementation/check-criterion-2-red-1793538966122-3047779.log`, `expect((await cli(f, handedMove)).code).toBe(0)` received 1.
- **Green evidence**: `check criterion-2: 0` — `implementation/check-criterion-2-1793538969717-3048599.log` (5 pass). Test committed `ff30851` on `repair-verify-merge` with the `Test-Change` trailer.
