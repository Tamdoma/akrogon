# Handoff review C (implementer view, disagreements only)

Repo cites are at HEAD `fd1b175`. Draft cites are `<leaf>/<file>`.

## recovery-keeps-rounds

- X1. Hidden dependency on b-repair-phase. Its new test says a cap-failed leaf "fails again at the cap on its next routed repair trip" (`recovery-keeps-rounds/brief.md`). Today that trip is check.review to check.fix (`src/phase.ts:231-240`). b-repair-phase moves the increment and cap to check.repair to check.fix. Whichever leaf lands second must rewrite a criterion test of the other. `design.md` says "Dependencies: none" and hands the overlap to the merge seat, which is more than a text conflict.
- X2. Missed touchpoint. `tests/phase.test.ts:105-112` also asserts the reset (`fix_rounds: 0` at line 110 after `phase repair implement` from a cap failure). The draft names only `:824-837`.
- X3. Guess. `docs/guide/state.md` "if it describes the reset": it has no `fix_rounds`, `reset` or `check.fix` text. Drop the conditional.

## b-repair-phase

- X4. Wrong files. `design.md` owns "exhaustive phase lists in `src/status.ts`, `src/next.ts`". Neither file contains `check.fix`. The only phase lists are `src/routing.ts:7-8,30-33,38` and `skills/watch-issues/scripts/observe.ts:11-12`. The implementer has to guess what to change there.
- X5. Guess. `docs/guide/state.md`, `src/AREA.md` and `skills/AREA.md` have no phase text today. The draft does not say what to add, or whether to add anything.
- X6. Existing tests not named. The move check.review to check.fix is asserted at `tests/phase.test.ts:95-116`, `:1098-1117` (cap test, failure `phase: 'check.review'`) and `tests/next.test.ts:1765`. The brief says "updated existing tests" but does not decide the failure `phase` value after the cap moves (`check.repair` or `check.review`). That value is a binding decision the implementer would guess.
- X7. Missing decision. `requiredSlots` (`src/routing.ts:42-44`) and `skills/watch-issues/SKILL.md:34` make check.review B-only when `fix_rounds > 0`. B repairs no longer increment, so a leaf recovered from `failed` into check.review after a B repair asks A and B again. The draft is silent on whether that is intended.
- X8. Contradiction with operator-only-items. That leaf writes the "repair seat finishes doable Fixes first, then one `failed` stop" duty into `skills/implement-issue/SKILL.md` check.fix (A). After this leaf the repair seat is B in check.repair. The brief does not say this leaf moves or rewrites that sentence, and `skills/implement-issue/SKILL.md` check.fix is owned by both leaves.
- X9. Blocked-by output not stated. Shape rule: the dependent's brief states the output it consumes. `b-repair-phase/design.md:38` names the consumed `Operator actions` rule, the brief does not.

## operator-only-items

- X10. Guess that can remove a rule. "Stop rules point to that one rule instead of restating it" covers `skills/implement-issue/SKILL.md:33` and `skills/merge-issue/SKILL.md:27`. Those lines cover the seat's own blocked step, which is a different case from a review finding (`last-forks-C.md` F1). The draft does not say whether the own-step text stays.
- X11. Missed touchpoint. `skills/plan-issue/SKILL.md:29` has the same "physically requires" stop line. The draft neither owns it nor excludes it.
- X12. Shape-rule violation. Criterion 1 is a bare "every configured `checks` command passes" on a prose-only leaf. `shapes.md` allows a repo-wide `checks` criterion only when the chart names the property no smaller test proves, and `issues/chart/check-reruns/CHART.md:4` says charts stop writing repo-health criteria. Same wording in b-repair-phase criterion 3 and concurrent-suite criterion 1.
- X13. Criterion 2 (`rg -n "Operator actions" skills` shows the definition once) is not a `checks` command or a test the leaf adds, and the pointers in the other two skills will also match the phrase. "Once" cannot be judged by that command.

## concurrent-suite

- X14. Criterion 2 (3 back-to-back runs, one round of 4 at once) is a report entry, not a `checks` command or an added test. Same shape problem as X13.
