# root-report, slot A

This round settles what filing does when the new report and earlier ones seem to share one cause that nobody has filed yet. It comes after related-search because the trigger is built from the Related line.

### 1 · When the agent suspects a shared cause, what does it do?

In #56 the reporter had to ask "what's the systemic issue?" and file #128 by hand. Under the locks, each report now has a Suspected cause and a Related line, but the skill files one report and stops (`skills/seed-issue/SKILL.md:59`). learn-issues already solves the same shape: it prints a runnable `/seed-issue` line and files nothing (`skills/learn-issues/SKILL.md:29`).

Example the agent prints after posting #127:
```text
Shared cause suspected with #124, #125, #126, #127 and not yet filed. To file it:
/seed-issue Root cause: blueprint has no state for choosing one mockup variant early. Related: Tamdoma/tamdoma-framework#124 #125 #126 #127
```

Research: better-than-training · `skills/learn-issues/SKILL.md:29`, read 2026-10-05 · print a ready line, never file, the operator decides · same pattern fits here. better-than-training · ITIL problem management (secondary summaries) · a problem record is opened separately from incidents and linked to them · supports a separate root report, not merging. practitioner · Google SRE Effective Troubleshooting · shared timing is not shared cause · the trigger needs a stated shared condition, not just same-session.

- **1a (recommended)** Print one ready `/seed-issue` line after posting, only when the Suspected cause names a condition that at least one related report shares and no linked report already states that cause. File nothing. Wins because the reporter gets the root report for one keystroke, the one-report rule stays, and an existing root report is linked instead of duplicated. Cost: about one rule sentence.
- **1b** File the root report automatically. Cost: two issues per run, a wrong shared cause becomes a public issue with no human check.
- **1c** Print nothing; the Related line and chart grouping are enough. Cost: consumers that never chart never get a root report, which misses the operator's goal.

Pitfalls avoided: duplicate root reports are removed by the "no linked report already states it" condition, using the 1a related search. Never mark duplicates, comment or close (carried). Done-criteria: the #124-#127 replay prints the line by the second or third report; an unrelated session prints none; an existing root report suppresses it.

### 2 · Do titles need a rule (symptom title vs cause title)?

A wrong cause in a title anchors every reader and survives as the mirror filename. #124-#127 titles already describe observations, #128's title states the cause because its observation is the shared condition.

Research: better-than-training · #124-#128 titles, read 2026-10-05 · titles already followed this without a rule · low risk today. practitioner · Tatham · facts and speculation apart · the title is the most-read fact.

- **2a (recommended)** Reword the existing title clause in place (`:26` "one descriptive title" becomes "one title describing the observation"). A root report's observation is the shared condition, so its title states it. Wins because it costs no new sentence and keeps guesses out of symptom titles. Cost: none beyond the reword.
- **2b** No change. Cost: nothing stops a confident guess becoming a title.
- **2c** A separate sentence for both cases. Cost: one rule sentence of the remaining budget.

Pitfalls avoided: an anchoring title is removed by the reworded clause, with a done-criterion that a symptom filing with a supported cause keeps the observation in the title.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
The trigger relies on the agent judging that a condition is shared. Agents over-connect same-session failures; #126 and #127 were contributing, not symptoms. The printed line is harmless if wrong because a person decides, and the root report itself goes through the door's verification.
