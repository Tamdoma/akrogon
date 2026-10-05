# root-report, merged round

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

This round settles what filing does when the report it just posted seems to share a cause with earlier reports that nobody has filed as a cause yet. In #56 the reporter had to ask "what's the systemic issue?" before #128 existed. Chart-grouping needs to know whether a separate root report will exist. (A,B,C)

### 1 · Does the agent suggest a root report, file one, or do nothing? And where does the suggestion appear?

The skill files one report and stops (`skills/seed-issue/SKILL.md:59`), and its footer ends `Next: none` (`:63-67`). (A,B,C) learn-issues already prints "one runnable `/seed-issue` line ... never the fix; the operator decides whether to run it. File nothing." (`skills/learn-issues/SKILL.md:29`). (A,B,C) Running the line is a normal filing with the same searches and six sections; no special root mode. (C)

Research: operator · INTAKE.md:36,39 · cause should come out "without the reporter having to ask"; workaround is a hand-filed root issue · a root report is wanted, open point is who starts it. (B,C) better-than-training · ITIL problem management, secondary summaries · the shared cause gets its own record linked to incidents · separate root report, not merging. (A,C) better-than-training · learn-issues:29 · ready line, operator decides · reuse the habit. (A,B,C) No practitioner source on who should open the cause record. (C)

- **1a (recommended, A,B,C)** Print one ready `/seed-issue` line after the report is created, before the final two lines. Footer stays `Next: none`, and its existing reason slot says a root report line is printed above (`:67`), so the last line still points at it. (reason-slot per C rebuttal) File nothing extra. Wins because the cause comes out unasked, one report per run stays, the operator decides, and the footer contract every akrogon skill shares is unchanged. Cost: the root report exists only if the operator runs the line.
- **1b** (C, blind round; C moved to 1a, citing learn-issues ending `Next: none` at `skills/learn-issues/SKILL.md:38-39`) Same, but the line goes on the footer's `Next:` line instead of `none`. Wins on visibility, since the last line is read first. Cost: changes the shared footer meaning. C grepped `src/` and found no parser of `Next:`, but hooks or loops outside `src/` were not checked.
- **1c** File the root report automatically. Cost: breaks "Create one report" (`:59`), and a wrong guess becomes a real issue that cross-references every linked report. (A,B,C)
- **1d** Print nothing. The report still carries the suspected shared condition, links and gap. Cost: the operator must notice and write any separate root report themselves, as in #56. (cost per B rebuttal)

Pitfalls avoided: a run with a shared cause creates exactly one issue (done-criterion). (B,C) The line names the condition and the reports, never a fix, since "recommended fixes" stays banned. (A,B,C) No line after a failed creation (done-criterion). (C)

Example, after #127, before #128 existed:
```text
/seed-issue Suspected root cause: mockup gates keep judging all variants after the operator chose one. Seen in Tamdoma/tamdoma-framework#124 and Tamdoma/tamdoma-framework#127. Consumer-copy evidence only; destination source unverified.
```
("Suspected" and evidence limit per B; condition and identities per A,B,C. The example follows #128's later reading that #125 is separate; #127's own text linked #125, so an agent following that text would also name #125. Either way the line appears by the second or third report. per C rebuttal)

### 2 · When does the agent print the line?

#127 was the first report whose own text tied the variant gate to two earlier reports. #128 later judged #125 a separate problem and #126 unrelated to variant choice. (A,B,C) No practitioner source gives a report count that should trigger a cause record; the threshold is a product choice. (C)

Research: operator · cause-section and related-search locks · supported hypothesis vs gap; links carry reasons; closed reports are evidence · the trigger reuses these. (B,C) practitioner · Google SRE Effective Troubleshooting · shared timing is not shared cause · the trigger needs a stated shared condition, not just same session. (A,B)

- **2a (recommended, A,B,C)** Print only when all hold: this report's Suspected cause is a supported hypothesis; the agent linked at least one other open report for that same condition (open-only per C; B notes it ignores a closed precedent whose condition recurs); no found report, open or closed, already covers that shared condition and its cases, judged by content, not by the presence of causal wording (per B rebuttal); the related lookup did not fail; and this report is not itself a cause statement. Wins because two reports with one supported cause already form a problem class, and the "already stated" check stops repeats once the root exists. Cost: the line can appear at the second report for a cause that later turns out narrower, and if the operator ignores it, every later qualifying filing prints it again with the newest report list (per C rebuttal). (open-only count and cause-statement exclusion per C; lookup-failed exclusion per B)
- **2b** Same, but at least two other open reports. First line after #127 in the case. Cost: with only two related reports the reporter still has to ask. (C)
- **2c** Whenever any report was linked. Cost: a line after nearly every filing, which trains the operator to ignore it. (B,C)

Pitfalls avoided: done-criteria: a filing after #128 exists links #128 and prints no line (C); unsupported cause, failed lookup and a report that is itself a cause print none (B,C); the #124-#127 replay prints one by the second or third report (A).

### 3 · Does the title need a rule?

The skill asks for "one descriptive title" (`:26`). Three of four symptom titles describe what was seen; #126's carries a diagnosis ("parses JSON scripts as JS"). #128's title starts "Root cause:" while its body attributes it to the reporter. (A,B,C)

Research: practitioner · Tatham, read 2026-10-05 · facts and speculation apart; the title is the most-read line, so a guess there anchors hardest. (A,B,C)

- **3a (recommended, A,B,C)** No new sentence. Reword the title clause in `:26`: the title describes what was seen, and names a cause only when the reporter's statement is itself a cause, marking it suspected. ("marking it suspected" per B rebuttal) A report from the printed line then gets a "Suspected root cause: ..." title, because the line is its statement. Wins because one clause covers both kinds with no second mode. Cost: "the statement is itself a cause" is a judgment each time.
- **3b** (B, blind round; B moved to 3a provided uncertainty is kept in the clause) A compact instruction: symptom titles describe what happened; shared-cause titles describe the suspected condition and keep uncertainty visible ("Suspected shared cause: ..."). Cost: a compact instruction against C1.
- **3c** No title rule. Cost: leaks like #126's continue. (A,C)

Pitfalls avoided: done-criterion that a replay of #126's input gives a title without the parser diagnosis (C), and causal titles keep uncertainty (B). A root report's Observation lists the symptoms seen; the cause stays in Suspected cause, labeled unverified, unlike #128. (C)

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- `/seed-issue` is one harness's call syntax; learn-issues and `docs/guide/create.md:93` already print it. (C)
- 2a would have printed after #125 for a cause #128 later called separate. Offering it is not wrong, but it was not the final root. Pick 2b to wait longer. (C)
- A bounded search cannot prove no covering report exists. (B)
- Trigger plus title clause is one to two rule sentences; the door recounts C1 before handoff. (B,C; per C rebuttal)
