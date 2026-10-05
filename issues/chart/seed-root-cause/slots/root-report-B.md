This round settles whether filing prints a ready line for a separate report about a shared cause. Printing a suggestion is different from creating another issue. The cause stays unverified, the current report keeps its symptoms, and the operator chooses whether to run the line.

### 1 · When should the agent print a ready line for a shared-cause report?

In #56, the reporter had to ask separately before #128 captured the missing variant-choice state. The new locks already preserve suspected causes and related links in each report, so a second report is useful only when it captures a shared problem that the current report and discovered reports do not already cover. `skills/learn-issues/SKILL.md:29` provides the existing pattern: print one runnable seed line describing the mechanism and case, never a fix, and let the operator decide.

Research: operator · `INTAKE.md`, Source: #56 and Source: operator 2026-10-05, plus the discovery-role, cause-section and related-search Taken sections, read 2026-10-05 · The goal is fixing shared causes, while filing creates one unverified report and does not change linked issues · This favors a suggestion rather than automatic second filing. Practitioner · Simon Tatham, software maintainer, [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html), Introduction and known-bugs guidance, read 2026-10-05 · Preserve symptoms, distinguish speculation and consult known reports · This limits the trigger to supported connections not already covered by a found report. Better-than-training · `skills/learn-issues/SKILL.md:18-29` and `skills/seed-issue/SKILL.md:59-67`, read 2026-10-05 · Ready lines are already used, but seed currently creates one issue and then stops · This requires adding the suggestion before the existing final two lines, without another GitHub write.

- **1a (recommended)** After successful filing, print one ready line only when the new symptom and at least one earlier report have evidence for a shared condition, the new report does not already capture that shared problem, and the completed related lookup found no report covering it. Include the suspected condition, concrete cases and issue identities. This gives the operator the missing next step without producing another issue automatically. Cost: limited search can still miss an existing report.
- **1b** Keep the shared suspicion and links in the filed body, but print no extra line. This uses less instruction space and avoids repeated suggestions. Cost: the operator must notice and formulate the separate report themselves.
- **1c** Print a ready line whenever a shared cause is suspected, even when another report already covers it. This makes suggestions easy to generate. Cost: it encourages duplicate reports and repeated root-report suggestions.

For 1a, print nothing extra when the cause is unsupported, related lookup failed, or the current report already covers the shared condition. A found cause report is linked instead. These are content judgments, not matching by a special title or exact wording.

Example, before #128 existed, if inspection connected the abandoned-variant gate in #124 with the abandoned-variant repairs in #127:

```text
/seed-issue Suspected shared condition: choosing one mockup variant early leaves the dropped variants required by later gates. Seen in Tamdoma/tamdoma-framework#124 and Tamdoma/tamdoma-framework#127. Consumer-copy evidence only; destination source is unverified.
```

Once #128 is found to cover that condition, link #128 and print no new root-report line. Do not include #127's photo-serving conflict as something variant choice explains.

Pitfalls avoided: The trigger rejects unsupported shared causes, already-covered reports and recursive suggestions from a report that already captures the shared problem. Done-criteria cover those cases, failed lookup and one supported shared condition, with exactly one issue created and any suggestion printed before the final outcome. No second issue, comment, label or state change occurs automatically.

### 2 · How should a report title describe a suspected shared cause?

The carried title choice separates symptom reports from shared-cause reports. [#128](https://github.com/Tamdoma/tamdoma-framework/issues/128) starts its title with “Root cause,” but its body attributes the statement to the reporter and lists separate contributing problems. The title should preserve the same uncertainty as the body.

Research: operator · cause-section Taken and root-report Carries, read 2026-10-05 · Observation and suspicion remain separate, and the title choice was carried into this fork · This requires titles that describe the report's actual subject without upgrading a suspicion. Practitioner · Tatham, [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html), Introduction, read 2026-10-05 · Facts and speculation must remain distinguishable · This supports marking a causal title as suspected. Better-than-training · `skills/seed-issue/SKILL.md:26` and #128's title/body, inspected during this chart on 2026-10-05 · The existing skill asks for a descriptive title and unverified intake · This supports a small clarification rather than a new report mode.

- **2a (recommended)** A symptom title describes what happened. A shared-cause title describes the suspected condition and keeps uncertainty visible. For example: “Suspected shared cause: dropped mockup variants remain required after selection.” This keeps title and body consistent. Cost: a compact title instruction.
- **2b** All titles describe observed behavior, including reports about shared conditions. For example: “Dropped mockup variants keep blocking later gates.” This avoids a causal claim in the title, but leaves the report's shared-cause purpose to its body.

Pitfalls avoided: Neither option uses an unqualified “Root cause” title for an unverified claim or proposes a fix. Done-criteria check that symptom titles preserve the observed failure and causal titles retain uncertainty, without requiring exact title wording.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check

The new cause section may already provide enough direction, which is the strongest case for 1b. A separate cause report also adds backlog work, so 1a requires a distinct shared problem rather than merely several links. A completed bounded search cannot prove that no covering report exists. That limit stays in the evidence and is the cost of the suggestion. The supported trigger and title clarification should fit two compact instructions, replacing the current finish wording where needed and counting against C1 by function. No new metadata, report mode or dependency is needed. No other slot's round was read.
