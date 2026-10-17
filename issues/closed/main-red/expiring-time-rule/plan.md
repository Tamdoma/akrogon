# Plan: expiring-time-rule

## Decisions

- D1 — Add the rule verbatim from the locked design to `skills/plan-issue/SKILL.md`, in the criterion-test paragraph (line 69, the one beginning "With `plan.md` written"), as a new sentence after "…a case may extend an existing test file.": `A test expectation that would stop holding as calendar time advances injects the time or computes its expected value from the time observed in the same run; deliberate elapsed-time and deadline bounds are unaffected.`
- D2 — Remove `, since main is green by the receipt gate,` from the sentence "A runs only the planned criterion tests, each through `akrogon run-check --name <label> -- <cmd>` …" in the same paragraph and line. The clause is false under known-red-pass; removing it leaves the sentence reading `… -- <cmd>\`, and each new test is shown red …`.
- D3 — No tests are added: the design's interpretation of the standing design for this leaf says proof is reading the changed paragraph and "No vanity tests" applies. Proof commands are grep sweeps over the repo's prose, not test machinery.
- D4 — Consumers need no edit: `skills/check-issue/SKILL.md:69`, `skills/implement-issue/SKILL.md:40` and `skills/merge-issue/SKILL.md:77` reference `test-proof-rules` only by name; they route wrong criterion units to that rule set, they do not copy it.

No `Open for the plan:` questions exist in the design. No brief/design conflict to note: the brief's "stay valid" and the design's "are unaffected" are the same carve-out; the design's verbatim wording wins.

## Read-first

- `skills/plan-issue/SKILL.md` — the criterion-test paragraph (line 69); the only edited file.
- `issues/open/main-red/expiring-time-rule/design.md` — locked rule wording and exclusions.
- `issues/open/main-red/expiring-time-rule/brief.md` — done-criteria.

## Interfaces

- None: prose edit in one file. `test-proof-rules` stays a named reference; no consumer signature changes.

## Units

- U1 (wave 1): owns `skills/plan-issue/SKILL.md`. Implements D1 and D2. No shared test resource, no prerequisites.

Every wave holds exactly one unit: serial-solo. Per implement-issue's serial-solo rule, A implements the plan itself with no workers.

## Checklist

- [ ] `skills/plan-issue/SKILL.md` line-69 paragraph — D1 rule sentence inserted once; D2 clause removed; rest of paragraph unchanged.

## Docs affected

- None: `docs/guide/phases.md:80` describes the synthesis flow without restating the removed clause; `skills/AREA.md` holds no copy of the rule; consumer skills name `test-proof-rules` only.

## Criterion proofs

| Criterion | Test | Command | Observation | Size | Rerun trigger |
| --- | --- | --- | --- | --- | --- |
| 1: the criterion-test paragraph states the rule once, and no other skill restates it | none — skill text (design: no test for prose) | `grep -c "injects the time or computes its expected value" skills/plan-issue/SKILL.md` → `1`; `grep -rn "as calendar time advances\|injects the time\|computes its expected value" skills/ docs/ \| grep -v "plan-issue/SKILL.md"` → empty | Before: rule absent everywhere (verified 2026-10-17). After: the rule sits inside the paragraph beginning "With `plan.md` written", exactly once, and no other file carries a copy. Catches: the line landing outside that paragraph or being duplicated where it can drift. | seconds | any `test-proof-rules` prose edit |
| 2: that paragraph no longer says main is green by the receipt gate | none — skill text | `grep -n "green by the receipt gate" skills/plan-issue/SKILL.md` → empty | Before: clause present at line 69 (verified 2026-10-17). After: clause gone, sentence still grammatical. Catches: a stale "main is green" premise contradicting known-red-pass, which lets work pass while main is red. | seconds | edits to the same paragraph |

## Red run records

None: no criterion tests are written (D3, design interpretation: no behavior changes, "No vanity tests"). Nothing is committed during synthesis; the proof commands above were run directly and their outputs quoted in the Observation column.
