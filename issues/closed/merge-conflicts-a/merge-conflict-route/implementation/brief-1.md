# Brief 1: merge-conflict-route — counter condition, tests, skill and guide wording

## 1. Goal

Make `fix_rounds` count only check.review → check.fix moves, so a merge → check.fix move leaves the counter unchanged and can never produce `moved failed`. Update the phase test, three skill lines and five guide sentences to match. Plan decisions D1-D7 in `issues/open/merge-conflicts-a/merge-conflict-route/plan.md`.

## 2. Numbered acceptance criteria

1. `bun test tests/phase.test.ts` passes: the `conflict` case asserts merge → check.fix leaves `fix_rounds` at 0, and a new case shows a leaf in merge with `fix_rounds` equal to the configured cap (1) moves to check.fix with stdout `moved check.fix`, not `moved failed`.
2. `git diff --stat` shows `src/state.ts`, `src/status.ts`, `src/log.ts`, `src/routing.ts` unchanged; `grep -rn merge_rounds src/ tests/` is empty.
3. `grep -n "check.fix" skills/merge-issue/SKILL.md` returns only the red-check line, the dead `moved failed` line 37 and the repair-move footer line; `grep -n -i conflict skills/merge-issue/SKILL.md` returns only lines describing A resolving and recording — none containing `check.fix` or preserving an unfinished rebase for B.
4. The merge-issue conflict sentence names, in order: rebase target, prior reviewed head, resolved head, range-diff.
5. `grep -n -i "conflict" docs/guide/phases.html docs/guide/problems.html docs/guide/in-practice.html docs/guide/merge.html` returns, apart from problems.html:68, only lines naming A resolving; none sends a conflict to check.fix. phases.html:63 says review → fix loops raise `fix_rounds`.
6. implement-issue and check-issue name the rebased head A recorded at merge; neither says "merge-conflict findings" or "rebase/conflict baseline".

## 3. Read-first list

- `src/phase.ts` — `commitMove` fix_rounds ternary (lines 35-40), `transition` capped destination (lines 137-138)
- `tests/phase.test.ts` — `conflict` case at lines 91-93 inside the `review aggregates verdicts` test; `tests/helpers.ts` `leaf()` accepts an `extra` object merged into state.yaml (use `{ fix_rounds: 1 }` for the capped case)
- `skills/merge-issue/SKILL.md` lines 33, 35, 37; `skills/implement-issue/SKILL.md` line 49; `skills/check-issue/SKILL.md` line 43
- `docs/guide/phases.html` lines 63-64, `problems.html` line 64, `in-practice.html` line 129, `merge.html` line 63
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- `src/phase.ts` line ~37: the increment branch `to === 'check.fix' ? recorded.fix_rounds + 1` also requires `recorded.phase === 'check.review'`. Line ~138: `destination === 'check.fix' && state.fix_rounds >= repo.config.fix_rounds` also requires `state.phase === 'check.review'`.
- `tests/phase.test.ts` lines 91-93: `expect(readState(mergePath).fix_rounds).toBe(1)` becomes `.toBe(0)`. Add a sibling leaf in the same test: `leaf(f, '<slug>', 'merge', { fix_rounds: 1 })`, then `phase <slug> check.fix` prints `moved check.fix` and `readState` shows phase `check.fix` (the test sets `fix_rounds: 1` via yaml earlier, so 1 is the cap).
- `skills/merge-issue/SKILL.md` line 33 becomes two lines:
  - `On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-A.md` the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh.`
  - `On red checks, append the failing output, the rebase target commit and the rebased head to `review-A.md`, call `akrogon phase <slug> check.fix --slot A`, and finish with the actual result and repair footer.`
- `skills/merge-issue/SKILL.md` line 35 becomes: `Same-line index conflicts retain both true entries and recheck pointers; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.`
- `skills/implement-issue/SKILL.md` line 49 becomes: `A repair requested from merge starts at the rebased head recorded in `review-A.md` and treats the failing output as the finding.`
- `skills/check-issue/SKILL.md` line 43: `(or recorded rebase/conflict baseline)` becomes `(or the rebased head A recorded at merge)`.
- `docs/guide/phases.html` line 63: `Each loop adds one to `fix_rounds`.` → `Each review → fix loop adds one to `fix_rounds`.` Line 64: `A conflict or red check → `check.fix` instead.` → `A rebase conflict is resolved by A and recorded in review-A.md. A red check → `check.fix` instead.`
- `docs/guide/problems.html` line 64 third cell: `Nothing. It goes to `check.fix`, B resolves, A re-checks.` → `Nothing. A resolves it in the merge, records the resolution in review-A.md and reruns the checks.`
- `docs/guide/in-practice.html` line 129: `Nothing to do. The merge rebase conflicts, the leaf goes to `check.fix`, B resolves it in the same worktree, A re-checks the repair, then merges.` → `Nothing to do. A resolves the conflict in the merge, records it in review-A.md and reruns the checks; only a red check sends the leaf to `check.fix`, and the repair is re-reviewed.`
- `docs/guide/merge.html` line 63 last sentence: `If the rebase conflicts, the leaf goes to `check.fix`, B resolves it, A re-checks.` → `If the rebase conflicts, A resolves it, records it in review-A.md and reruns the checks; only a red check goes to `check.fix`, and the repair is re-reviewed.`

## 5. Do-not, reasons and exceptions

- Do not touch `src/routing.ts`, `src/state.ts`, `src/log.ts`, `src/status.ts` — criterion 2 requires them unchanged; `requiredSlots` already gives the right re-review behavior.
- Do not add a `merge_rounds` field or any merge-side counter — locked design 14a forecloses it.
- Do not change merge-issue line 37 (`moved failed` diagnosis) — it becomes dead text but L4 owns it.
- Do not change problems.html:68, setup.html:67, state.html:85 — design exclusions.
- Do not weaken or delete the failed → implement reset branch in the ternary.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: routing/state/log/status stay untouched, no merge-side counter, line 37 and the excluded guide lines stay, the reset branch stays; any conflict returns as a mismatch, not a scope change.

## 6. Ordered steps

1. `tests/phase.test.ts` — change the conflict assertion to 0 and add the capped-merge case (criteria 1). Run the changed-test command; the new assertions must fail against unmodified `src/phase.ts` (red evidence: paste the failure).
2. `src/phase.ts` — add the two `check.review` conditions (criterion 1). Rerun; green.
3. `skills/merge-issue/SKILL.md` — lines 33 and 35 per section 4 (criteria 3, 4).
4. `skills/implement-issue/SKILL.md` line 49 and `skills/check-issue/SKILL.md` line 43 (criterion 6).
5. `docs/guide/` — the four files per section 4 (criterion 5).
6. Run the criterion greps from section 2 and paste results.

Advisory size: about 7 files and under 30 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=ef698c2d6ad50a9466f125419dbe0e4adaf2ae14`. If the changed-test runner does not pick up `tests/phase.test.ts`, run `bun test tests/phase.test.ts` directly and say so.

## 8. Done-when, evidence and report

All six criteria verified with pasted command output: the red-then-green test evidence, the criterion greps, and `git diff --stat` showing only the listed files. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
