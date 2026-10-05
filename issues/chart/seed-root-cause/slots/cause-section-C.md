# Cause section: slot C round (blind)

This round settles how a seed's body carries the suspected cause that the discovery-role lock now requires filing to look for. It comes now because the related-search, root-report and chart-grouping forks all read or write this section. Paths are relative to `/home/ivan/Work/infra/akrogon`. The five framework issues were read with `gh issue view -R Tamdoma/tamdoma-framework` on 2026-10-05.

Cap check used below: by my count `skills/seed-issue/SKILL.md` has about 15 rule sentences today (68 lines), so the whole chart has about 5 sentences left under C1. The discovery-role stop rule needs one or two of them. This round's recommendations cost two rule sentences and put the rest in the body template, which is not rule prose.

### 1 · Does the suspected cause get its own section, or stay inside Observation?

The skill has five fixed sections and no place for a cause (`skills/seed-issue/SKILL.md:30-47`). In the real case the cause went into Observation anyway. #124 cites `checkManifestRule` at `advance-phase.ts:259-278` inside Observation, #126 has a block headed "Parser bug" there, and #128 opens Observation with "Reporter's root-cause statement". A reader cannot tell what was seen from what was inferred, and chart-issues copies the text verbatim as source (`skills/chart-issues/SKILL.md:31`).

Research: operator · `issues/chart/seed-root-cause/INTAKE.md:36`, read 2026-10-05 · the report asks for the cause "as clearly labeled unverified context" · a label is required, only its form is open. practitioner · Simon Tatham, "How to Report Bugs Effectively", https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05 · "make very clear what are actual facts ... and what are speculations", and diagnosis is "not an alternative to giving the symptoms" · it rules out mixing the cause into Observation. better-than-training · `src/pull.ts:67`, read 2026-10-05 · the mirror copies the body whole and parses no sections · a sixth section reaches the door with no code change.

- **1a (recommended)** One new section, `## Suspected cause`, placed last, after Urgency. The five existing sections keep their order and meaning, and Observation holds only what was seen. It wins because the split between seen and inferred becomes visible in every report at the cost of one template block.
- **1b** Keep five sections and allow a labeled cause paragraph inside Observation, as #128 did. No template change. Cost: the label depends on the agent each time, and #124 and #126 show it gets dropped.

Pitfalls avoided: Symptoms shrinking once a cause exists is removed by the lock's rule that symptoms stay complete, with a done-criterion that a test filing with a cause still fills all five sections. Diagnosis leaking back into Observation is removed by a done-criterion that replays the #124 input and checks that the `checkManifestRule` reasoning lands in the new section.

### 2 · Is the section always present, or only when the agent has a supported cause?

Every current section is always present and says "Not provided" when empty (`skills/seed-issue/SKILL.md:28`). The lock says filing posts "the hypothesis or the evidence gap" and that standalone consumers "get an actionable evidence gap" (`forks/discovery-role.md`, Taken). The answer decides whether a missing cause is visible or silent.

Research: operator · `forks/discovery-role.md` Taken, read 2026-10-05 · "Not provided" stays legal and a gap must be actionable · both options must allow an empty cause. practitioner · Tatham, same essay · "Leave out speculations if you want to, but don't leave out facts" · the cause content is optional, which is different from the heading being optional. better-than-training · #126 and #127, read 2026-10-05 · each has its own local cause and #128 lists them only as "contributing", not as symptoms of the shared cause · a report may rightly have no shared cause to state.

- **2a (recommended)** The heading is always present. Its content is a supported hypothesis, or the evidence gap (what would have to be read or run to find the cause), or "Not provided". It wins because an absent heading cannot be told apart from an agent that never looked, and it matches how the other five sections already behave. Cost: every thin report grows by two lines.
- **2b** The section appears only when there is a supported hypothesis. Shorter thin reports. Cost: the evidence gap the lock promises has no home, and the door cannot tell "looked and found nothing" from "did not look".

Pitfalls avoided: An invented cause filling a present heading is removed by "Not provided" and the evidence gap being legal content, with the lock's done-criterion for the unsupported-hypothesis case. A forced single root is removed by question 3's parts.

### 3 · What must the section contain when it does state a cause?

The lock already binds two parts: the section "names each file read and flags installed or vendored copies as not the destination source". The case shows why. Every path in #124 to #127 is an installed copy in the consumer repo (`.claude/workflow/scripts/advance-phase.ts`, `.claude/skills/_shared/libraries/motion-vocabulary/index.js:76`), not a path in tamdoma-framework. #128 also shows one cause did not cover everything: it names one missing state, one separate gate design problem (#125) and two rule conflicts (#126, #127).

Research: operator · lock in `forks/discovery-role.md` Taken · files read and copy flags are fixed · this question only settles the remaining parts. practitioner · John Allspaw, "The Infinite Hows", https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/, read 2026-10-05 · "Cause is something we construct, not find", ask for "the conditions that allowed an event to take place" · the section asks for conditions, plural, not one root. better-than-training · `skills/chart-issues/SKILL.md:47`, read 2026-10-05 · the door needs file:line evidence for every claim about a mechanism · the files-read list is what the door re-checks.

- **3a (recommended)** Four short parts, written as placeholder lines in the template so they cost no rule sentences: the condition or conditions that allowed the failure, who holds the view (reporter or agent), the files read with copies flagged, and what was not inspected or would disprove it. It wins because each part answers a question the door or a standalone maintainer will otherwise have to ask. Cost: about five template lines.
- **3b** Free prose under the heading, with only the lock's files-read rule. Cheapest. Cost: attribution and the disproof line get dropped, and those are the two parts that stop a guess reading as a finding.
- **3c** Sub-headings for each part. Most uniform. Cost: a heavy shape for thin reports, and it invites filling every sub-heading.

Pitfalls avoided: A confident wrong cause becoming the plan is removed by the attribution and not-inspected lines plus the door's own verification under the lock. A stale file:line from an installed copy is removed by the copy flag, with a done-criterion that a filing from a consumer repo marks `.claude/...` paths as copies. A fix proposal entering as "cause" is removed by keeping "recommended fixes" banned in `skills/seed-issue/SKILL.md:26`, where only the word "diagnosis" is lifted.

### 4 · Does the old portability rule come back?

The prior skill said "Describe the pattern that failed, not the one file that happened to expose it", and its bullets added "Do not use raw one-off file paths unless one is truly required" (`git show 507aff5 -- skills/seed-issue/SKILL.md`, removed lines). That second part now conflicts with the lock, which requires naming each file read. In the case the reports already named the pattern without the rule: #125 is titled "Phase progression should close on checked results, not on dispatch run history".

Research: operator · lock in `forks/discovery-role.md` Taken · file names are required evidence · the old rule cannot return in its old scope. better-than-training · #124 to #127 titles and bodies, read 2026-10-05 · pattern-level titles appeared without the rule, and the file paths were the useful evidence · the rule's intent is partly met already. No practitioner source was searched for on this question.

- **4a (recommended)** No separate rule. Its intent moves into the first placeholder line of the cause section ("the condition or pattern that allowed it"). It wins because it costs zero rule sentences and cannot be read as "leave out file paths". Cost: Observation gets no push toward the pattern.
- **4b** Restore the one sentence, scoped to the cause section only. Explicit. Cost: one of the roughly five remaining rule sentences, for wording the placeholder already carries.
- **4c** Restore it for the whole report, as before. Cost: it pushes agents to drop the paths and commands that `skills/seed-issue/SKILL.md:26` tells them to preserve and the lock requires.

Pitfalls avoided: Agents dropping file evidence is removed by not restoring the "not the one file" wording. Running out of the C1 cap before the related-search and root-report forks is removed by spending no rule sentence here, with the lock's done-criterion that the finished skill still meets C1.

Reply `1a 2a 3a 4a`, or a numbered free-text answer.

Challenge check
- My rule-sentence count (about 15) is my own reading. The closed leaf did not record how it counted. If the leaf counts template lines or counts differently, 3a's cost changes and the door should recount before handoff.
- 2a differs in wording from my map, where I said the cause should be optional. I hold the substance: the content is optional and "Not provided" is legal. Only the heading is fixed.
- A practitioner could argue that a fixed heading invites filler more than an optional one. The removal here rests on the unsupported-hypothesis done-criterion, which tests behavior on one case and does not prove agents never fill it.
- The heading says "cause", singular, while 3a asks for conditions. Allspaw would prefer a heading like "Contributing conditions". I kept the operator's term because #56 and the note both use "root cause".
- "Related: #n" lines also need a home. #125 to #128 put them at the end of Expected behavior. That belongs to the related-search fork, and its answer may add a second section or a line to this one.
- #125 carries a "Reporter's proposal" inside Expected behavior. Whether Expected behavior may hold a proposed design is outside this fork and I did not address it.
