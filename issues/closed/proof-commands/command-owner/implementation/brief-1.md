# Worker brief 1 — plan-issue rule paragraph + implement-issue correction paths

## 1. Goal

Add the leaf's new "proof-command rule" as one paragraph in `skills/plan-issue/SKILL.md` under `plan.synthesis`, and update `skills/implement-issue/SKILL.md` so a wrong proof command is corrected by seat A under that rule instead of stopping the pass. Plan decisions: D1 (rule home and shape), D2 (stop boundary), D3 (correction record), D4 (merge-returned path), D6 (replace `test-proof-rules` wording at each site, not stacked).

## 2. Numbered acceptance criteria

1. `skills/plan-issue/SKILL.md` `plan.synthesis` states the rule once, in a single paragraph, covering every element: a done-criterion locks only its observable result; `plan.md` owns the proof command; A replaces a wrong proof command (one that departs from the repo's configured runner semantics, or is red for a cause outside the leaf while the criterion's result holds) with a command observing the same result, preferring the repo's configured runner; the equivalence guard is that the same tests and cases still run and a deliberate break still fails; A records old command, new command, reason and evidence of that guard in `implementation/report.md` beside the criterion it proves; a runner command already written inside a criterion counts as proof under this rule; an invocation that is itself the product behavior the criterion names stays locked; a correction never widens a live or paid action.
2. `skills/implement-issue/SKILL.md` Shared context: the "A done-criterion still failing during implement or check.fix ..." paragraph's stop applies only when the criterion's result itself cannot be shown within the leaf; a wrong proof command takes correction under the `plan-issue` rule before any failure ending.
3. Same file's "During implement end and check.fix, a red test or check ..." paragraph: the `test-proof-rules` citation is replaced; a wrong proof command is corrected under the `plan-issue` proof-command rule, a criterion whose result cannot be shown still takes the stop.
4. Same file's `implement` test-writing paragraph: "a wrong criterion ends the pass" applies only to a result that cannot be shown; a wrong proof command is corrected under the rule.
5. Same file's `check.fix` merge-returned paragraph: when the rejected run's failure cause is a wrong proof command, the pass keeps the rejected run's recorded evidence, corrects the command under the rule recording old/new/reason/guard evidence in `implementation/report.md`, reruns the corrected command, and a green corrected rerun returns the leaf to review without the old command turning green.
6. Same file's `Direct form`: the door corrects a wrong proof command under the same rule and records it in `<chart>/direct/plan.md`.
7. Neither edited file contains the string `test-proof-rules`.

## 3. Read-first list

- `skills/plan-issue/SKILL.md` — the `plan.synthesis` section; the rule paragraph goes immediately after the "plan.md maps each done-criterion to the observation that proves it" paragraph.
- `skills/implement-issue/SKILL.md` — full file; edit sites are the five paragraphs named above.
- `skills/implement-issue/ponytail.md` — style bar.
- Copy the voice of the existing paragraphs: single long sentences joined by commas and semicolons, code-spans for file names and commands, no bullets inside paragraphs.

## 4. Change list and needed interfaces

Paths owned by this unit: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`. No shared test resource, no prerequisites; runs in wave 1.

Interfaces: none beyond the files. The rule is named "the `plan-issue` `plan.synthesis` proof-command rule" wherever another sentence cites it. Suggested wording for the new `plan.synthesis` paragraph (adjust to fit voice, keep one paragraph):

"A done-criterion locks only its observable result; `plan.md` owns the command that proves it. When a proof command is wrong — it departs from the repo's configured runner semantics, or it is red for a cause outside the leaf while the criterion's result holds — A replaces it with a command that observes the same result, preferring the repo's configured runner, and records the old command, the new command, the reason and the evidence in `implementation/report.md` beside the criterion it proves, on the direct route in `<chart>/direct/plan.md`; a correction holds only under the equivalence guard that the same tests and cases still run and a deliberate break still fails, and B judges a recorded correction against this rule in review. A runner command already written inside a criterion counts as proof under this rule; an invocation that is itself the product behavior the criterion names stays locked. A correction never widens a live or paid action."

For `check.fix` merge-returned: keep the existing paragraph structure; where it treats the reproducing command, add that when the recorded failing output's cause is a wrong proof command, the correction happens first (recorded as above) and the rerun uses the corrected command — the leaf may return to review on the corrected command green without the old command turning green. Keep "keeps its original failure evidence": the rejected run's recorded command, failing output, base and head are still recorded.

## 5. Do-not, reasons and exceptions

- Do not add a second copy of the rule or restate it in `implement-issue` — other skills cite the `plan-issue` `plan.synthesis` section; duplication is exactly what this leaf removes.
- Do not alter criterion text, done-criteria, or any locked-design wording; exception: none, return a mismatch instead.
- Do not weaken the `failed` stops — they still fire when the criterion's result cannot be shown; exception: none.
- Do not widen any live or paid action; do not touch `grants`, `checks`, `merge_checks`; exception: none.
- Do not edit tests, `docs/`, `README.md`, or files outside the two owned paths; exception: none.
- Do not keep the string `test-proof-rules` anywhere; exception: none.
- A conflicting requirement is a mismatch returned to A with evidence and the smallest brief correction; exception: a revised brief from A.

## 6. Ordered steps

1. Read both files fully (criteria 1–7).
2. Edit `skills/plan-issue/SKILL.md`: insert the one-paragraph rule after the "plan.md maps each done-criterion to the observation" paragraph (criterion 1).
3. Edit `skills/implement-issue/SKILL.md` at the four paragraph sites (criteria 2–5).
4. Add the `Direct form` sentence: e.g. after the `run-check --holder` paragraph — "A wrong proof command is corrected under the `plan-issue` `plan.synthesis` proof-command rule and the correction is recorded in `<chart>/direct/plan.md`." (criterion 6).
5. Run the criterion-7 check (section 7).
6. Commit both files in one commit: `docs(command-owner): proof-command rule in plan.synthesis, A corrections in implement` or similar conventional form; return the commit ID.

Advisory size: 2 files, under 12 turns.

## 7. Commands

Targeted check after edits, keep output through run-check:

```sh
akrogon run-check --name u1-sweep -- sh -c 'if grep -rn "test-proof-rules" skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md; then exit 1; else exit 0; fi'
```

Run `bun install --frozen-lockfile` first only if any command needs dependencies; the grep does not.

## 8. Done-when, evidence and report

Both files edited, the grep check green (cite the `check u1-sweep: <exit> <path>` line), commit ID returned. Command output kept only through `akrogon run-check --name <label> -- <cmd>` citing its printed line; `akrogon log <path>` reads a cited log.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
