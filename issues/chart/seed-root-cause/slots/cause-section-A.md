# cause-section, slot A

This round settles what the cause looks like in the issue body, now that filing always makes a one-hop, read-only attempt (discovery-role 1a, 2a). It comes now because related-search, root-report and chart-grouping all read this section.

### 1 · How does the issue body carry the suspected cause?

Today the body has five fixed sections, each always present and "Not provided" when empty (`skills/seed-issue/SKILL.md:28-47`). `akrogon pull` copies only the title and body into seeds (`src/pull.ts:57-75`), so the cause must live in the body to reach the door. #128 split one main cause (#124's missing variant-choice state) from a separate gate problem (#125) and contributing rule conflicts (#126, #127), so one root did not explain all four.

Research: practitioner · Simon Tatham, How to Report Bugs Effectively (https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05) · keep facts and speculation clearly apart, diagnosis never replaces symptoms · cause goes in its own labeled section after the symptoms. practitioner · John Allspaw, The Infinite Hows (kitchensoap.com, 2014-11-14, read 2026-10-05) · causes are conditions, usually several · the section allows a main condition plus contributing ones. practitioner · Google SRE Effective Troubleshooting (sre.google, read 2026-10-05) · a hypothesis needs disconfirming tests · the section names what would disprove it.

- **1a (recommended)** A sixth section `## Suspected cause`, always present, after Urgency. It holds: who suspects it (reporter, agent, or both), one or more conditions marked main or contributing, the evidence (files read with paths, installed copies flagged), what would disprove it, and what was not inspected. When no cause is supported it states the evidence gap instead of "Not provided" alone. Wins because 2a means filing always tries, so the result is always reportable, and it matches the existing fixed-section pattern. Cost: about one template block and two rule sentences.
- **1b** Same section, present only when a cause is supported. Shorter bodies, but "agent tried and found nothing" looks the same as "old skill version", and the door cannot tell an attempt happened.
- **1c** Fold the cause into Observation. No new section, but it mixes fact and guess, which is what #124-#127 already do unlabeled.

Pitfalls avoided: the title anchoring on the guess is removed by a rule that the title describes the observation, not the cause. Symptom loss is removed by keeping all five existing sections unchanged. A stale cause after pull is removed by the door treating the section as a dated claim (fork chart-grouping). Done-criterion: one test filing with a supported cause and one with an evidence gap both carry all six sections.

### 2 · Should the old portability rule come back?

Before `507aff5` the skill said "Describe the pattern that failed, not the one file that happened to expose it", and discouraged raw file paths for the whole report (`git show 507aff5^:skills/seed-issue/SKILL.md:147-155`). The operator wants every consumer repo to fix the root, which is a pattern or contract, not one file. But 2a now requires naming the files read as evidence.

Research: better-than-training · old skill text above, read 2026-10-05 · it applied to the whole report and banned one-off paths as primary evidence · that clashes with symptom facts (Tatham) and with 2a's evidence list, so scope matters. practitioner · Tatham, same essay · keep concrete facts · Observation must keep its paths and commands.

- **2a (recommended)** Return it as one sentence scoped to the cause section: name the failing rule, contract or missing state, with files as evidence for it. Observation keeps concrete facts. Wins because it points the reader at the root and keeps both evidence and symptoms. Cost: one sentence.
- **2b** Return it for the whole report. Cost: Observation loses concrete paths that the door needs to reproduce.
- **2c** Do not return it. Cost: causes get written as "line 42 is wrong", and consumers fix the symptom file.

Pitfalls avoided: the rule shrinking evidence is removed by scoping it to the cause line only, with the evidence list kept.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
An always-present section adds length to every report, including trivial typos. The counter is that the gap line is one sentence, and an empty section tells the door the agent looked. B leaned always present in the map, C leaned optional.
