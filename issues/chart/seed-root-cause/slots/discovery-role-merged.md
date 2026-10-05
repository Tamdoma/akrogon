# discovery-role, merged round

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

This round settles who looks for the root cause and how far filing looks before it posts. Every later fork depends on it. (A,B,C)

### 1 · Where does root-cause work happen?

Today seed-issue forbids diagnosis (`skills/seed-issue/SKILL.md:26`, closed D3 at `issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33`), and chart-issues is the only step that checks a cause against sources (`skills/chart-issues/SKILL.md:31,47`). (A,B,C) In the #56 case the evidence linking four failures existed only in the filing session, and the agent filed to a repo it was not working in (Stopsol to tamdoma-framework). (A,C) Consumer repos that file but never chart get nothing from door-only work. (B,C)

Research: practitioner · Simon Tatham, How to Report Bugs Effectively · diagnosis is "an optional extra, and not an alternative to giving the symptoms" · filing may add a labeled cause, symptoms stay. (A,B,C) practitioner · Google SRE Postmortem Culture · the confirmed cause, plural, is written later by a grounded pass · confirmation stays at the door. (A,C) practitioner · Google SRE Effective Troubleshooting · hypotheses need confirming and disconfirming tests. (B) better-than-training · ITIL problem management · one problem record links many incidents. (C) better-than-training · `skills/chart-issues/assets/shapes.md:244-246` · one completion owner already carries many identities, so the door needs a grouping rule, not new machinery. (C)

- **1a (recommended, A,B,C)** Both, with different jobs. Filing records a suspected cause and related reports as labeled, unverified context. The door verifies against live code, and groups seeds under one owner only after the operator confirms. Each step uses the context only it has. Cost: two skills and the guide change, and D3 is partly reversed on record.
- **1b** Filing only. The door keeps its existing evidence checks but gets no new duty to pursue unresolved causes. Cost: a cause unresolved at the filing bound has no investigation owner, and the filing agent often cannot read the destination repo. (wording per B rebuttal)
- **1c** Door only. D3 stands, but the session evidence is gone by import, and non-charting consumers get nothing. This misses the operator's "every repo that consumes Akrogon".

Pitfalls avoided: a wrong cause becoming the plan is removed by the door treating it as a claim needing its own file:line evidence (`chart-issues/SKILL.md:47`). (A,B,C) A wrong shared cause closing unrelated issues is removed by operator confirmation before grouping (`:69`). (C) Docs contradicting the skill is removed by a done-criterion updating `docs/guide/create.md:84-103` and naming D3 as superseded. (A,B,C) Done-criteria cover an unsupported hypothesis and symptoms that do not share one cause, with the door reassessing rather than copying. (B) Standalone consumers need an actionable evidence gap, so the report must not assume a chart pass follows. (B)

### 2 · How far does filing investigate before it posts?

The skill reads "only nearby context needed to understand it" (`:26`) and never blocks thin intake (`:28`). (A,B,C) The C1 cap (300 lines, 4k tokens, 20 rule sentences) favors one short stop rule. (B,C) The #128 root report was written from what the session already knew, ten minutes after the last symptom. (C) The chart door itself has stated wrong facts from a narrow grep and a stale checkout (`learnings/LESSONS.md:15,18`). (C)

Research: practitioner · John Allspaw, The Infinite Hows · cause is constructed, ask how · argues against "keep going until the root". (A,C) practitioner · Google SRE Effective Troubleshooting · test against disconfirming evidence, beware correlation · no short pass proves a cause. (A via B, B) No practitioner source on a filing-time budget was found. The bound is a product choice, not consensus. (B,C)

Slots split in the blind round. After rebuttal C moved to 2a with the one-hop, files-only and installed-copy conditions, so 2a is (A,B,C).

- **2a (recommended, A,B,C)** Session evidence plus a read-only trace: open the files the failure names and follow them to the immediate caller or shared contract, from where the agent runs. Stop at a supported hypothesis, or when going on needs unavailable evidence, a reproduction run, broader exploration or a change. Post the hypothesis or the evidence gap. Intent: catch a file read that separates two causes. Files only, no project commands, one hop. The section names each traced path and says when it is an installed or vendored copy rather than the destination repo's source. Cost: variable reading time, and a one-hop trace can miss a distributed cause. (one-hop, files-only and installed-copy rules per C rebuttal)
- **2b** Session evidence plus the nearby context the skill already allows. No commands run to test the cause, nothing read in the destination repo, no hop past nearby context. (C, blind round) Costs one or two sentences and keeps filing fast, and #128 shows session evidence was enough in the measured case. Cost: causes that need a fresh look wait for the door, and "try to discover" becomes mostly synthesis.
- **2c** Deeper read-only investigation, time-boxed at about ten minutes (B) or until the cause is confirmed or declared undetermined (A,C). Finds causes beyond one hop. Cost: the clock is arbitrary or the stop is open-ended, it still cannot read a destination repo the agent lacks, and a longer investigation is easier to over-trust even when labeled.

Common to all options (A,B,C): "Not provided" stays legal, no reproduction runs or reruns with side effects, no installs or edits, symptoms stay complete, the cause section states what was and was not inspected, and the skill still meets C1 with `gh` as the only dependency. Done-criteria check behavior, not wording. (B,C)

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
- If "discover the root cause" means a verified cause before posting, that is 2c. (C)
- Under 1a a consumer that files but never charts keeps an unverified cause in its backlog. (C)
- Allspaw and #128 itself argue against one root. Whether the section allows several conditions belongs to cause-section. (A,C)
- After compaction the skill re-reads itself and the reporter's supplied context (`SKILL.md:6`), but earlier session evidence is lost unless preserved. Belongs to related-search. (C, mechanism per B rebuttal)
