# Root report

## Question
Q1. When filing suspects a cause shared with earlier reports, does it print a ready /seed-issue line for the root report, and under what trigger?

### Carries
- From cause-section: rule that a symptom report's title describes the observation, not the cause, while a root report's title states the cause (#128). Costs rule wording against C1.
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Closed decision D3 (issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33) banned diagnosis and overlap checks; this chart partly reverses it.
- Skill cap C1 from the closed leaf: under 300 lines, 4k tokens, 20 rule sentences; skill must run with gh only on every harness.
- Never mark duplicates, comment or close at filing (map, A,B,C).

## Findings
Full rounds: ../slots/root-report-{A,B,C,merged,rebuttal-B,rebuttal-C}.md.
- better-than-training · skills/learn-issues/SKILL.md:29,38-39 · prints runnable /seed-issue lines, files nothing, footer still `Next: none` · same pattern. (A,B,C)
- better-than-training · skills/seed-issue/SKILL.md:26,59,63-67 · one descriptive title, one report, fixed footer with reason slot. (A,B,C)
- better-than-training · ITIL problem management (secondary) · shared cause gets its own linked record. (A,C)
- practitioner · Tatham; Google SRE Effective Troubleshooting, read 2026-10-05 · speculation apart from fact; shared timing is not shared cause. (A,B,C)
- better-than-training · tamdoma-framework #124-#128 titles/bodies · #126 title carries a diagnosis; #127 text linked #124,#125; #128 judged #125 separate. (A,B,C)
- No practitioner source on who opens the cause record or what report count triggers it. (C)
- C grepped src/ non-test .ts for `Next:` / `Last operation`: no parser. Hooks outside src/ unchecked. (C)
- Rebuttals: C moved to 1a with footer reason slot; B moved to 3a with "marking it suspected"; B narrowed suppression to content coverage and fixed 1d cost; C added repeat cost and 1-2 sentence cost.

## Taken
Operator 2026-10-05: "1a | 2a | 3a" (after asking how the trigger works and whether /seed-issue runs twice; answered: the second run is optional copy-paste of the printed line, auto-filing is 1c)

- Q1 = 1a. After the report is created, print one ready `/seed-issue` line before the final two lines. File nothing extra. Footer stays `Next: none`, with its reason slot saying a root report line is printed above. Reason: root report for one copy-paste, one report per run, operator decides.
- Q2 = 2a. Print only when all hold: this report's Suspected cause is a supported hypothesis; at least one other open linked report shares that condition; no found report, open or closed, already covers that shared condition and its cases (judged by content); the related lookup did not fail; this report is not itself a cause statement. Reason: two reports with one supported cause are a problem class; coverage check stops repeats.
- Q3 = 3a. Reword the title clause at `skills/seed-issue/SKILL.md:26`: the title describes what was seen, and names a cause only when the reporter's statement is itself a cause, marking it suspected. No new sentence.

Binding (carry into leaves):
- The line names the suspected condition, the report identities and the evidence limit, never a fix. Running it is a normal filing, no root mode.
- Accepted cost: an ignored line reprints on later qualifying filings with the newest report list.
- Done-criteria: exactly one issue per run; no line after failed creation; replay of #124-#127 prints the line by the second or third report and not after #124 or #126; filing after #128 exists links #128 and prints none; unsupported cause, failed lookup and a cause-statement report print none; replay of #126 input gives a title without the parser diagnosis.
- Trigger plus title cost one to two rule sentences; door recounts C1 before handoff.

Restatement 2026-10-05 (leaf-writing review C D1): "by the second or third report and not after #124 or #126" mixes ordinals and identities, since the third report is #126. Meaning, stated by identity: the line prints after #125 or, at the latest, after #127, and never after #124 or #126.
