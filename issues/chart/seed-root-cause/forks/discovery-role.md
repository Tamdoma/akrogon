# Discovery role

## Question
Q1. Where does root-cause work happen: at filing (seed-issue), at import (chart-issues), or both with different jobs?
Q2. How far does filing investigate before it posts (the stopping bound)?

### Carries
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Closed decision D3 (issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33) banned diagnosis and overlap checks; this chart partly reverses it.
- Skill cap C1 from the closed leaf: under 300 lines, 4k tokens, 20 rule sentences; skill must run with gh only on every harness.


## Findings
Full rounds: ../slots/discovery-role-{A,B,C,merged,rebuttal-B,rebuttal-C}.md.
- practitioner · Simon Tatham, How to Report Bugs Effectively, https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05 · diagnosis is an optional extra, never a replacement for symptoms · filing may add a labeled cause. (A,B,C)
- practitioner · Google SRE, Postmortem Culture, https://sre.google/sre-book/postmortem-culture/, read 2026-10-05 · the confirmed cause, plural, is written later by a grounded pass · confirmation stays at the door. (A,C)
- practitioner · Google SRE, Effective Troubleshooting, https://sre.google/sre-book/effective-troubleshooting/, read 2026-10-05 · test hypotheses against disconfirming evidence · read-only inspection can improve a hypothesis but not prove it. (B)
- practitioner · John Allspaw, The Infinite Hows, https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/, read 2026-10-05 · cause is constructed, ask how · argues against "keep going until the root". (A,C)
- better-than-training · ITIL problem management, secondary summaries, 2026-10-05 · one problem record links many incidents · supports two jobs. (C)
- better-than-training · skills/seed-issue/SKILL.md:6,10,26,28; skills/chart-issues/SKILL.md:31,47,69; shapes.md:244-246; learnings/LESSONS.md:15,18 · nearby reads allowed, thin intake legal, door verifies and asks before grouping, door itself has stated stale facts. (A,B,C)
- No practitioner source on a filing-time investigation budget was found. The bound is a product choice. (B,C)
- Rebuttals: B holds 2a, C moved to 2a with one-hop, files-only and installed-copy conditions. B corrected 1b cost, 2c attribution and the compaction mechanism.

## Taken
Operator 2026-10-05: "1a | 2a |"

- Q1 = 1a. Both, with different jobs. Filing records a suspected cause and related reports, labeled unverified. chart-issues verifies the cause against live code with its own file:line evidence and groups seeds under one completion owner only after operator confirmation. Reason: each step uses context only it has (session at filing, code and operator at the door).
- Q2 = 2a. Filing uses session evidence, then opens the files the failure names and follows them one hop to the caller or shared contract. File reads only, no project commands, no installs or edits. Stop at a supported hypothesis or when the next step needs unavailable evidence, a reproduction run or broader exploration. Post the hypothesis or the evidence gap. Reason: a real discovery attempt that stays fast and side-effect free.

Binding (carry into leaves):
- "Not provided" stays legal. Symptoms stay complete when a cause is present.
- The cause section names each file read and flags installed or vendored copies as not the destination source.
- Done-criteria: unsupported hypothesis case, symptoms that do not share one cause (door reassesses, never copies), skill still meets C1 with gh as only dependency, docs/guide/create.md:84-103 updated and closed D3 named as superseded in the design. Done-criteria check behavior, not wording.
- Standalone consumers get an actionable evidence gap; the report never assumes a chart pass follows.

Correction 2026-10-05 (from chart-grouping 1a): chart-issues is not changed, so the door-side done-criterion "symptoms that do not share one cause (door reassesses, never copies)" is dropped from leaf done-criteria; that behavior is existing chart-issues behavior (SKILL.md:47, shapes.md:246). Filing-side done-criteria stand.
