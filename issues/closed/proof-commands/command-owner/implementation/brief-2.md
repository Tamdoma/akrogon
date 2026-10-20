# Worker brief 2 — check-issue: judge corrections, hand corrections to A, direct review

## 1. Goal

Update `skills/check-issue/SKILL.md` so B judges recorded proof-command corrections against the rule defined in `skills/plan-issue/SKILL.md` `plan.synthesis` (naming that section, never restating it), hands needed proof-command corrections to A in `check.repair`, and on the standalone/direct route uses `<chart>/direct/plan.md` for proof mapping and correction judgment. Plan decisions: D5 (B routes, never corrects), D6 (replace `test-proof-rules` wording, not stacked).

Context: the rule (being written in `plan-issue` `plan.synthesis` by a sibling worker) says `plan.md` owns the proof command; A replaces a wrong proof command with one observing the same result, preferring the configured runner; the equivalence guard is that the same tests and cases still run and a deliberate break still fails; a runner command inside a criterion is proof; a product invocation stays locked; a correction never widens a live or paid action. Cite it as "the `plan-issue` `plan.synthesis` proof-command rule".

## 2. Numbered acceptance criteria

1. In the `check.review` red-check paragraph ("During check.review, a red test or check with no cause ..."), the `test-proof-rules` citation is replaced: a unit of the leaf's own done-criteria that is wrong becomes a Fix routed to A under the `plan-issue` `plan.synthesis` proof-command rule.
2. In the `check.review` paragraph where B checks that the implementation report runs planned tests through `plan.md`'s commands, add that B judges each recorded proof-command correction against that rule's equivalence guard by naming the `plan-issue` `plan.synthesis` section — the correction observing the same result with the same tests and cases still running and a deliberate break still failing — without restating the whole rule.
3. In `check.repair`, the exceptions list of Fixes B does not repair gains "a needed proof-command correction under the `plan-issue` `plan.synthesis` proof-command rule", so it lands under `Handed to A` like the other exceptions.
4. In `Standalone review`, where the rules name `plan.md`, the direct route uses `<chart>/direct/plan.md` alongside the draft brief and design, and B judges the proof mapping and any recorded proof-command correction from `<chart>/direct/plan.md` under the `plan-issue` `plan.synthesis` proof-command rule.
5. The file no longer contains the string `test-proof-rules`.

## 3. Read-first list

- `skills/check-issue/SKILL.md` — full file; edit sites: the long red-check paragraph in `check.review`, the "B checks that the implementation report runs the planned tests" paragraph in `check.review`, the first paragraph of `check.repair`, the first paragraph of `Standalone review`.
- `skills/implement-issue/ponytail.md` — style bar.
- Copy the voice of the existing paragraphs: single long sentences, code-spans for file names and commands.

## 4. Change list and needed interfaces

Path owned by this unit: `skills/check-issue/SKILL.md`. No shared test resource, no prerequisites; runs in wave 1.

Interfaces: none beyond the file.

Current `Standalone review` text (edit the substitution sentence): "Where those rules name `plan.md`, `report.md` or `AKROGON_BASE`, use the chart's brief and design, `<chart>/direct/report.md` and `base=`." — extend it so `plan.md` maps to `<chart>/direct/plan.md` (the chart's draft brief and design still supply criteria), and add that B judges the proof mapping and any recorded correction from that file under the `plan-issue` `plan.synthesis` proof-command rule.

Current `check.repair` exceptions sentence: "B repairs every Fix except a change to a locked brief or design decision, a new or widened live action, and any correction of a test expectation." — add a needed proof-command correction to the exception list.

## 5. Do-not, reasons and exceptions

- Do not restate the rule's full text — cite the `plan-issue` `plan.synthesis` section; the rule lives once.
- Do not let B make corrections itself — `check.repair` and the review route corrections to A; the equivalence guard judging stays with B. Exception: none.
- Do not change verdict, Fix/Nit, or known-red machinery; exception: none.
- Do not edit any file other than `skills/check-issue/SKILL.md`; exception: none.
- A conflicting requirement is a mismatch returned to A with evidence and the smallest brief correction; exception: a revised brief from A.

## 6. Ordered steps

1. Read `skills/check-issue/SKILL.md` fully (criteria 1–5).
2. Make the four edits (criteria 1–4).
3. Run the criterion-5 check (section 7).
4. Commit the file: `docs(command-owner): B judges and routes proof-command corrections` or similar conventional form; return the commit ID.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Targeted check after edits, keep output through run-check:

```sh
akrogon run-check --name u2-sweep -- sh -c 'if grep -n "test-proof-rules" skills/check-issue/SKILL.md; then exit 1; else exit 0; fi'
```

No dependencies needed for the grep.

## 8. Done-when, evidence and report

File edited, the grep check green (cite the `check u2-sweep: <exit> <path>` line), commit ID returned. Command output kept only through `akrogon run-check --name <label> -- <cmd>` citing its printed line; `akrogon log <path>` reads a cited log.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
