# Design: realistic-review-bar

## Binding decisions, verbatim

### Fix bar (issues/chart/realistic-fix-bar/forks/fix-bar.md)
Operator 2026-09-30: `1a | 2a` (after a plain restatement at the operator's request)

Q1 → 1a. A Fix names the realistic source of its input: a real build, real user action or content, a real integration, or untrusted input an attacker can send. A code trace or representative real output is enough; no production incident is needed. A handcrafted reproduction alone is a Nit with the missing evidence stated. Rarity never downgrades a security, data-loss or concurrency defect with a reachable path.

Q2 → 2a. Failed `checks` commands and scenarios a done-criterion explicitly names still block. Broad promises need Q1's realistic source for a newly invented counterexample. A maintainability Fix needs a concrete consequence today, not a hypothetical future change.

Reason: leaves were looping on handcrafted inputs and hypothetical maintenance (framework offer-join-deploy F12/F16/F17, akrogon epic-broadcast-once F1), costing full repair rounds without production value.

Foreclosed: 1b observed-production-only, 1c unchanged rule, 2b any broken promise blocks, 2c downgrading failed checks or named criteria.

Applies to every Fix trigger in `skills/check-issue/SKILL.md` (`:35,37,41,43,47`) and to re-check at `:53`, for both slots.

### Test bar (issues/chart/realistic-fix-bar/forks/test-bar.md)
Operator 2026-09-30: "1a | 2a | 3a - but how will you qualify and quantify this?" (after two plain restatements at the operator's request)

Q1 → 1a. A leaf writes the smallest set of tests proving every done-criterion (one test may prove several) plus a before/after proof per real bug fixed. Extra negative or edge cases only where a concrete consequence on a realistic path warrants them: broken required outcome, security boundary, data loss, unsafe mutation. Extend existing tests before adding files. The blanket "mandatory negative and edge-case tests" line goes.

Q2 → 2a. Review blocks on tests only when a done-criterion has no test that would catch its failure, a realistic Fix (per fix-bar) has no test, or a test mocks the unit under test. Assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits.

Q3 → 3a. Cheapest level that proves the changed property. End-to-end with an artifact only when browser/runtime behavior or cross-component wiring cannot be shown smaller, or a criterion asks for it. Unchanged-stage evidence is reused with its revision.

Reason: tests that restate code or cover invented inputs cost lifecycle time without production value; the operator's live example is epic-broadcast-once F1.

Foreclosed: 1b mandatory edge tests and per-finding fixtures, 1c no unit tests, 2b any untested failure blocks, 3b end-to-end for every user-visible leaf.

### Success measure (issues/chart/realistic-fix-bar/forks/success-measure.md)
Operator 2026-09-30: `1a | 2a` (after a plain restatement at the operator's request)

Q1 → 1a. Each Fix states its realistic input source, its consequence today, and the criterion, check or gap it hits; a failed check or named criterion cites that instead. A missing-test Fix names the scenario and what existing tests miss. Each Nit states why it is deferred. The implementation report links each done-criterion and each real bug fix to the tests or evidence proving it. The reviewing agent judges content; no parser, fixed fields or scores.

Q2 → 2a. No new code. After the rules land, an attended chart door compares the next 20 completed leaves per repo with the recorded baseline (durations, repair rounds, still-open ages, failures), audits Fix/Nit calls, and counts confirmed escapes attributable to a leaf within 14 days of merge for both cohorts.

Reason: judgment stays with agents per the operator's function-over-form rule; existing logs already give the speed baseline.

Foreclosed: 1b parsed fields or risk scores, 2b stats command or dashboard.

Exclusion for this leaf: Q2's measurement runs at a later chart door and is not leaf work.

### Deferred findings (issues/chart/realistic-fix-bar/forks/deferred-findings.md)
Operator 2026-09-30: "1a - when do I consume this and how so we can check the stats?"

Q1 → 1a. Nits stay in `review-<slot>.md` with the reproduction, why it is deferred, and what evidence would promote it to a Fix. The repair seat does required work for Fixes only; a Nit may disappear incidentally through that repair but gets no separate work or test. No ticket, no new state.

Reason: keeps the existing record, and stops repair rounds being spent on deferred findings.

Foreclosed: 1b a GitHub seed per deferred finding.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md (symlink into this repo's `skills/chart-issues/assets/standing-design.md`, which this leaf edits)

- Auth, secrets, backend mutation: not applicable, no code paths change.
- Tests: this leaf changes skill and guide prose. `skills/check-issue/SKILL.md:45` forbids akrogon tests of prose wording, so no new tests are written. Proof is done-criterion 7 plus the configured checks passing.
- Chain-trigger rule (`standing-design.md:11`): these skills are agent instructions, not a chain stage. No code another leaf owns consumes their output and no recorded model output exists to re-record. The one real call through the consumer is done-criterion 7: a fresh agent reading only the new check-issue text classifies the five recorded cases. Nothing else is required. (A,B)
- User-visible flow: the flow is an agent reading the skill; no browser or CLI output changes, so no end-to-end artifact.
- The leaf is reviewed under the rules in force when its review starts. It must not rely on its own new text to pass review.

## Leaf architecture

Owned surfaces: the files listed in the brief's What. Keep each skill's existing structure and voice; replace rules in place rather than stacking exceptions on old ones. Lines cited in done-criteria are 2026-09-30 positions and may shift.

Exclusions:
- `src/`, command state, `fix_rounds` cap, routing and verdict schema.
- Model or effort configuration.
- `skills/chart-issues/assets/questions.md` peer-wait rule (Tamdoma/akrogon#44, separate intake).
- The framework repository and its running leaves.
- Deleting existing tests anywhere.
- Anything under `issues/`.

Dependencies: none. No external operation, no credentials.
