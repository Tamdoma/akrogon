# discovery-role, slot A

This round settles who looks for the root cause and how hard filing looks. Every later fork depends on it: the body section, the related search and the chart grouping all change shape with the answer.

### 1 · Where should root-cause work happen?

Today seed-issue forbids diagnosis (`skills/seed-issue/SKILL.md:26`, closed decision D3) and the chart door verifies whatever it imports (`skills/chart-issues/SKILL.md:31,47`). In the Stopsol case the evidence linking four failures existed only in the filing session (tamdoma-framework #124-#128, filed within one hour). The chart door has the destination repo and the operator but not that session.

Research: practitioner · Simon Tatham, How to Report Bugs Effectively (chiark.greenend.org.uk/~sgtatham/bugs.html, 2026-10-05) · diagnosis is "an optional extra, and not an alternative to giving the symptoms" · keeps symptoms mandatory and lets filing add a labeled cause. practitioner · Google SRE Postmortem Culture · the confirmed cause is written after the event by a grounded pass · confirmation stays at the door.

- **1a (recommended)** Both, with different jobs. Filing records the reporter's and agent's suspected cause and related reports as unverified context. The chart door verifies it against live code and groups seeds by cause. Wins because each step uses the context only it has. Cost: two skills and the guide change.
- **1b** Filing only. Cheapest, but nothing checks the hypothesis before it shapes a plan.
- **1c** Chart door only. Keeps today's skill, but the session evidence is gone by import, so the #56 failure repeats.

Pitfalls avoided: a wrong cause steering the plan is removed by the door treating the section as a claim to verify (fork chart-grouping). The closed D3 contradiction is removed by a leaf done-criterion updating the skill, `docs/guide/create.md:84-103` and naming D3 as superseded in the design.

### 2 · How far does filing investigate before it posts?

The skill now reads "only nearby context needed to understand it" (`:26`) and never blocks thin intake (`:28`). The reporter is often in a consumer repo (Stopsol) filing to another repo (tamdoma-framework), so the agent may not be able to read where the cause lives.

Research: practitioner · John Allspaw, The Infinite Hows (kitchensoap.com, 2014-11-14) · ask how the conditions arose, do not build one why-chain · bounds the pass to conditions, allows several. practitioner · Google SRE Effective Troubleshooting (via B) · test a hypothesis against disconfirming evidence · requires a "what would disprove it" line.

- **2a (recommended)** Bounded pass: use what the session already saw plus the files and commands the failure itself names, readable from where the agent runs. Ask how the condition arose and whether it also explains other failures seen this session. Stop there. No reproduction runs, no reading of repos the agent cannot open, and "Not provided" stays legal. Wins because it captures the session's linking evidence in minutes without turning intake into planning.
- **2b** Session only, no new reads. Fastest, but misses the one file read that often separates two causes.
- **2c** Investigate until a cause is demonstrated. Strongest evidence, but slow, can block filing, and invites confident fiction in a skill with no grounding rules.

Pitfalls avoided: intake blocked by investigation is removed by the stop rule and "Not provided". A cross-repo guess is removed by the section stating what was and was not inspected (fork cause-section).

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
A practitioner could argue any agent-written cause anchors readers even when labeled (Tatham allows it, Allspaw warns about constructed causes). The answer is the verification step at the door, not silence at filing, since silence is the measured failure in #56.
