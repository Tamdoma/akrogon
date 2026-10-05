# cause-section, merged round

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

This round settles how the issue body carries the cause that filing now always looks for (discovery-role 1a, 2a). Related-search, root-report and chart-grouping all read this section, so it comes next. (A,B,C)

### 1 · Where does the cause go, and is it always there?

The body has five fixed sections, always present, "Not provided" when empty (`skills/seed-issue/SKILL.md:28-47`). (A,B,C) In the real case the cause leaked into Observation unlabeled: #124 cites `checkManifestRule` at `advance-phase.ts:259-278` there, #126 has a "Parser bug" block there. (A,B,C) `akrogon pull` copies the body whole (`src/pull.ts:67`), so a new section reaches the door with no code change. (A,C)

Research: operator · INTAKE.md Expected behavior and discovery-role Taken · cause "as clearly labeled unverified context", gap must be actionable · label required, empty cause legal. (B,C) practitioner · Simon Tatham, How to Report Bugs Effectively, https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05 · keep facts and speculation clearly apart, diagnosis never replaces symptoms · separate section, symptoms untouched. (A,B,C)

- **1a (recommended, A,B,C)** New section `## Suspected cause`, placed last after Urgency, heading always present. Content is a supported hypothesis, or "no supported hypothesis" plus the evidence needed next. Bare "Not provided" cannot replace the gap, since filing always attempts; it stays legal only for missing details inside it. (per B rebuttal) Observation holds only what was seen. Wins because seen and inferred are split in every report, and an absent heading cannot be told from an agent that never looked. Cost: every thin report grows by about two lines.
- **1b** Same section, only when a hypothesis is supported. Unresolved attempts go into Location, labeled as agent investigation. (B) Cost: investigation evidence has no fixed home and is spread across sections. (cost per B rebuttal)
- **1c** Labeled paragraph inside Observation, as #128 did. No template change. Cost: the label depends on the agent each time, and #124 and #126 show it gets dropped. (A,C)

Pitfalls avoided: symptom loss is removed by the lock's complete-symptoms rule and a done-criterion that a test filing with a cause still fills all five sections. (per C rebuttal) Diagnosis leaking back is removed by a done-criterion replaying #124's input and checking the `checkManifestRule` reasoning lands in the new section. (C) The title rule (observation, not cause) moves to root-report, since a root report's title must state the cause (#128) and the rule costs wording. (per C rebuttal) Fix proposals stay banned: only "diagnosis" is lifted from `:26`, "recommended fixes" stays. (C)

### 2 · What does the section contain when it states a cause?

The lock fixes two parts: each file read, and installed or vendored copies flagged. Every path in #124-#127 is an installed copy in the consumer repo (`.claude/workflow/scripts/advance-phase.ts`, `.claude/skills/_shared/...`), not tamdoma-framework source. (B,C) #128 named one missing state, one separate gate problem (#125) and two rule conflicts (#126, #127), so one root did not cover all four. (A,B,C)

C1 budget: C counts about 15 rule sentences in the current skill, so about 5 remain for the whole chart. (C) The count method of the closed leaf is unrecorded, so the door recounts before handoff.

Research: practitioner · John Allspaw, The Infinite Hows, https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/, read 2026-10-05 · causes are conditions, ask how · the section lists conditions, plural. (A,C) practitioner · Google SRE, Effective Troubleshooting, https://sre.google/sre-book/effective-troubleshooting/, read 2026-10-05 · test against contrary evidence, shared timing is not shared cause · the section names what would disprove it. (A,B)

- **2a (recommended, A,B,C)** Four short parts written as placeholder lines in the template, not rule prose: the conditions that allowed the failure (main and contributing, several allowed, no claim they explain every symptom), who holds the view (reporter, agent or both), files read with copies flagged, and what was not inspected or would disprove it. Wins because each part answers a question the door or a standalone maintainer would otherwise ask, at about five template lines. Rewording `:26` in place (lift "diagnosis", name six sections) adds no sentence, and the placeholder counts against C1 by function, with the counting method recorded before handoff. (per B, C rebuttals)
- **2b** Free prose with only the lock's files-read rule. Cost: attribution and the disproof line get dropped, and those stop a guess reading as a finding. (C)
- **2c** Sub-headings per part. Cost: heavy for thin reports and invites filling every one. (B,C)

Pitfalls avoided: a stale file:line from an installed copy is removed by the copy flag, with a done-criterion that a filing from a consumer repo flags installed copies from inspected provenance, not from the path name alone, and says when the link to destination source is unverified. (C, provenance rule per B rebuttal) A forced single root is removed by plural conditions. (A,B,C) Done-criteria also cover a reporter suspicion contradicted by inspected evidence, and unrelated symptoms from one session. (B)

### 3 · Does the old "describe the pattern, not the one file" rule return?

Before `507aff5` the skill said "Describe the pattern that failed, not the one file that happened to expose it", and discouraged raw file paths for the whole report (`git show 507aff5^:skills/seed-issue/SKILL.md:147-155`). (A,C) The path part now conflicts with the lock, which requires naming files read. (A,C) The operator wants consumers to fix the root, which is a pattern or contract. (A,B)

Research: better-than-training · old skill text, read 2026-10-05 · whole-report scope banned one-off paths · cannot return in that scope. (A,C) better-than-training · #125 title "Phase progression should close on checked results, not on dispatch run history" · pattern-level wording appeared without the rule. (C) practitioner · Effective Troubleshooting · similar observations do not prove shared cause · a pattern claim must not exceed its evidence. (B)

Slots split in the blind round. After rebuttal B moved to 3a, provided the placeholder carries the qualifier, so 3a is (A,B,C). C notes a report-wide pattern rule would push inference back into Observation.

- **3a (recommended, A,B,C)** No rule sentence. The first placeholder line carries the intent: "the condition or pattern that allowed it, no wider than the evidence shows". Wins because it costs zero of the ~5 remaining rule sentences and cannot be read as "drop file paths". Cost: Observation gets no push toward the pattern.
- **3b** (B, blind round) One qualified rule sentence: "Describe the supported failure pattern alongside the concrete case, without claiming wider impact than the evidence shows." Explicit for every report. Cost: one rule sentence of the remaining budget, partly repeating the placeholder.
- **3c** Restore it for the whole report. Cost: agents drop the paths the lock requires. (A,B,C)

Pitfalls avoided: dropped file evidence is removed by never restoring the "not the one file" wording. (A,C) Running out of C1 before related-search and root-report is removed by spending no rule sentence here (3a) or one (3b), with the lock's done-criterion that the skill still meets C1. (C)

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- A fixed heading may invite filler. The removal is the unsupported-hypothesis done-criterion, which tests one case and does not prove agents never fill it. (B,C)
- The heading says "cause", singular, while 2a asks for conditions. Allspaw would prefer "Contributing conditions". The operator's term is kept. (C)
- Where "Related: #n" lines go belongs to related-search. #125-#128 put them at the end of Expected behavior. (C)
- #125 carries a "Reporter's proposal" in Expected behavior. Whether Expected behavior may hold a proposed design is outside this fork. (C)
