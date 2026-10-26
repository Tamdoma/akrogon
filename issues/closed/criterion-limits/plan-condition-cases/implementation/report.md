# Report: plan-condition-cases

Serial-solo run (one wave, one unit); A implemented inline, no workers.

## Changed files

- `skills/plan-issue/SKILL.md` — `## plan.synthesis`: one paragraph inserted between the credentials paragraph and "With `plan.md` written" (D1, verbatim from plan.md). No other file changed (D2: no doc lists plan contents below the level the change alters).

## Commits

- Base `a4fc68d3` (AKROGON_BASE); head `abf1909` `plan-issue: check each plan decision against its criterion's conditions before tests`. Branch was already on `origin/main`; refresh rebase was a no-op.

## Commands and results

- `check skill-text: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-skill-text-1793004636893-2674711.log` — `bun test tests/docs-links.test.ts tests/run-units.test.ts --timeout=30000`, 21 pass 0 fail on head `abf1909` (criterion 1 existing-proof rerun; the leaf diff is the new paragraph, inputs changed since the planning-pass run).
- `akrogon verify` on `abf1909`: `verify format: 0`, `verify test: 0` (1175 pass, 0 fail, 56.80s), `verify typecheck: 0` → `verify leaf abf1909958c01438cc78e662180e8e2eddb115af: green`. Logs: `implementation/check-format-*.log`, `check-test-1793004697459-2676471.log`, `check-typecheck-1793004699878-2676471.log` under the leaf `implementation/`.
- Planning-pass logs: `check plan-skill-text: 0 .../check-plan-skill-text-1793004576458-2668049.log`, `check plan-typecheck: 0 .../check-plan-typecheck-1793004580081-2670437.log` (base health).

## Criteria

1. Proved by review against `skills/plan-issue/SKILL.md` `## plan.synthesis` (standing-design review-judged rule) plus green skill-text assertions above. The inserted paragraph carries every clause the criterion lists; plan.md D1's clause map gives the clause-to-criterion mapping for the reviewer.
2. Reviewer judgment: the plan.md "Walk-through of D1's text over design `## Case`" section applies the paragraph to the recorded case and reaches both required cases — the same-path retried lookup in one process, and two repos with a `herdr tab close` from the first repo's step between the shared `pane list` read and the second repo's use — and reaches that the recorded proofs (four distinct paths; single-repo slice, no write) satisfy neither.

## Limitations

- Criterion 2 has no executable proof by design; it is judged by review alone (the paragraph's trace wording over `## Case`).
- The rule is untested in the field; plan.md's known limits record the judgment surface (shallow trace, weak case) that review now catches via the required `plan.md` record.

No unverified criteria, no known-red, no operator blockers, no credentials touched.
