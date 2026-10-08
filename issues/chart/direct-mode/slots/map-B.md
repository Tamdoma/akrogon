# Slot B independent territory map

Read 2026-10-08. Repository paths below are relative to /home/ivan/Work/infra/akrogon. No other slot map was read. No repository file was edited. This is a map of choices, not operator answers or an implementation plan.

## Intended outcome and current mechanism

F1. The supplied intake asks for an opt-in repository setting that lets the existing charting A implement a small settled item and existing B review it. Charting and gates remain. C can contribute to charting, but execution involves A and B. It also asks the door to recommend immediate execution or lifecycle handoff at the end. The earlier direct edit is operator-provided context, not evidence that it already implements this mode. Source: supplied map-brief.md, Intake and Context.

F2. The current door always ends at leaf handoff without running next or a chart phase transition (skills/chart-issues/SKILL.md:85). Charts explicitly have no lifecycle state (skills/chart-issues/assets/shapes.md:16). Even no-debate work starts at plan.synthesis (shapes.md:251,259). Thus “skip debate,” “implement inline,” “hand built,” and “continue in the current panes” are different choices. Config implement controls worker delegation, not handoff (src/config.ts:44; skills/implement-issue/SKILL.md:53). Hand-built prevents dispatch (src/next.ts:611).

F3. Existing standalone implementation is only a partial building block. It has no config reads, checker, phase calls, or lifecycle records and still delegates through its worker protocol (skills/implement-issue/SKILL.md:88-90). Normal review needs A and B initially, then B after repairs (src/routing.ts:32,54; skills/check-issue/SKILL.md:10). A B-only immediate review cannot simply call the normal transition: it would record B and await A (src/phase.ts:251,289).

## Material forks, ordered by how much they reshape the rest

Q1. Does “non-handoff” mean no emitted leaf at all, or a regular leaf executed by the already-open consultants?

- O1. Keep execution artifacts with the chart and run a bounded attended A/B path. This most directly matches the wording. It avoids dispatcher allocation, but needs explicit ownership of review, repair, completion, and landing because those currently belong to commands (skills/check-issue/SKILL.md:25; skills/merge-issue/SKILL.md:25). Recommendation to explore first, not an assumed answer.
- O2. Emit one regular leaf and attach the current panes to its existing lifecycle. Reuses readiness and completion state, but is still a handoff in storage and requires allocation/cleanup changes. Allocation currently identifies leaf tabs/worktrees and creates the worktree (src/next.ts:337-355). Merge completion closes a leaf tab after B goes idle (skills/merge-issue/SKILL.md:71), which could close the ongoing chart session if adopted unchanged.
- Practitioner question: Which cost is the operator removing: contract files, new agents losing context, planning rounds, manual dispatch, or all four? The answer should settle Q1 before designing a second workflow. A regular leaf with retained sessions could satisfy continuity without satisfying “no leaves.”

Q2. Does repository configuration permit immediate work, prefer it, or force it when eligible?

- O3. A repo setting permits the end-of-chart choice, default disabled, with the door recommending one route and using the operator's existing or newly supplied concrete authorization. This respects opt-in without turning a recommendation into permission (skills/chart-issues/SKILL.md:69).
- O4. An enabled setting makes immediate execution the preferred route for eligible items. Fewer repeated choices, but it must say whether config itself authorizes coding and landing. Current handoff still has an attended review and command-owned dispatch (skills/chart-issues/SKILL.md:69,85).
- Recommendation: permission to offer, with per-item choice unless the operator explicitly wants standing authorization. Do not conflate this with implement:inline. Config is strict, so a new setting requires schema support and effective output, not only prose in YAML (src/config.ts:38-60,263-269). Repo settings are read from each consuming repository's issues/config.yaml (src/config.ts:164-169), not just Akrogon's own config.
- Lifetime trap removed: record the selected route for an active item. A later setting edit should not silently change the meaning of completed chart decisions or restart work. Existing chart answers preserve corrections rather than inventing taken answers (shapes.md:75).

Q3. What qualifies as small, and what happens when it stops being small?

- O5. Eligibility is one bounded, independently checkable outcome in one destination, no required decomposition or unresolved decision, judged by A with B's challenge. No line-count or elapsed-time gate. This follows current split-by-outcome rules (skills/chart-issues/SKILL.md:45) and no-fog requirement (shapes.md:267).
- O6. Any one-leaf outcome qualifies. Simpler rule, but one leaf can still require live calls, key production, cleanup, or slow proof (standing-design.md:10,14; skills/chart-issues/SKILL.md:57-65). A single folder does not establish low operational cost.
- Practitioner questions: Do external mutations or unknown-duration proof exclude immediate work, or remain eligible with all existing gates? Does escalation retain the current diff and review evidence, or require a fresh lifecycle implementation? Decide a stop/escalation boundary before coding. Do not quietly split an already-approved immediate item into several leaves.
- Recommendation: conceptual eligibility with recorded reasons. Keep the full route available when dependencies, operational steps, or recovery need its mechanisms. Do not invent a categorical ban on live operations if the operator means to retain all their gates.

Q4. What exactly survives from “all gating,” and what replaces leaf-only machinery?

- O7. Preserve the substantive gates: settled decisions, scoped criteria/design, prerequisite completion, destination refresh and duplicate check, required operation proofs, credential presence, grants, and fixture cleanup. Change artifact location/entry point only where the selected route needs it. These requirements are in skills/chart-issues/SKILL.md:55,57-65,73 and shapes.md:267.
- O8. Treat immediate work as current standalone implement. Lowest initial instruction change, but drops config/checker behavior and cannot meet the intake unchanged (skills/implement-issue/SKILL.md:90). Reject as a faithful implementation.
- Practitioner question: Must immediate work have readiness.yaml and its existing gaps check even without state.yaml? Current pre-handoff draft check can inspect readiness before state exists (skills/chart-issues/SKILL.md:76-83), while status and next checks currently consume leaf records. Carry the binding proof and grant information into the execution artifact, rather than assuming the chart conversation is sufficient.
- Lifetime trap: charts may be local in an unregistered repository, but current handoff requires registration (shapes.md:3). Settle whether immediate mode shares that restriction, especially because the mode is a consuming-repo setting.

Q5. Who repairs, and what counts as independent review?

- O9. A implements and repairs. B reviews the scoped committed diff, requests concrete fixes, and rechecks repairs. C stops after charting. This best matches “A implementer, B reviewer” and preserves a separate reviewer after every authored repair.
- O10. Reuse lifecycle behavior where B repairs most fixes and hands larger items to A. This matches check-issue:73-89, but B becomes author and verifier for its own repairs. Operator should choose this deliberately rather than inheriting it from “similar to lifecycle.”
- Recommendation: O9 for the small attended path. Reuse the existing concrete-defect Fix/Nit bar and evidence rules (skills/check-issue/SKILL.md:49-59), not an improvised weaker review. Record reviewed base/head and evidence. B being a charting consultant does not make it an independent product designer, but it remains a separate code reviewer.
- Practitioner questions: What repair bound applies before holding/escalating? Current fix_rounds is positive and defaults to 3, and lifecycle counts it on B-to-A handoff (src/config.ts:43; src/phase.ts:151,301). Reusing its numeric value without defining what the new route counts is misleading. What happens if B is absent or unavailable? Do not silently downgrade to unreviewed execution.

Q6. Where does A edit, and who lands the reviewed result?

- O11. A uses an isolated short-lived branch/worktree and B reviews a fixed committed head before integration. Protects unrelated edits and prevents unreviewed code reaching default branch. Existing lifecycle uses worktrees from the remote tracking branch (src/next.ts:263-292), requires clean changes and test-change citations at transitions (src/phase.ts:273-277), and serializes tested pushes (src/phase.ts:460-475).
- O12. A edits the current checkout, like the informal example. Less setup, but the workflow must preserve unrelated changes, establish the starting diff, prevent commits/pushes before B approves, and specify what happens when another session edits main. Existing lifecycle protections do not apply without leaf transitions. The earlier informal main edit is context, not a settled requirement.
- Recommendation: O11 unless avoiding worktrees is itself the desired saving. Decide whether immediate completion means reviewed local commit or code pushed to default branch. If pushed, select the owner and integration check rules. Existing merge skill cannot be called unchanged without a leaf and merge attempt (skills/merge-issue/SKILL.md:10,35-45).
- Lifetime trap: concurrent lifecycle merges must not invalidate B's approved head. Recheck integration when the base changes, keep approval tied to the actual landed change, and define cleanup without closing the consultant tab.

Q7. What remains visible after success, interruption, or escalation?

- O13. Keep scope, chosen route, implementation report, reviewed head/verdict, repairs, tests, and final delivery evidence under the chart. Use existing Closed only for delivered work and Held for unfinished work with reason. The status parser already recognizes these markers (src/status.ts:305-309). It does not distinguish coding from review today.
- O14. Keep full lifecycle records instead. Reuses state/status/recovery, but implies Q1's regular-leaf route and increases overhead.
- Practitioner questions: Is an in-progress immediate status needed, or is chart context sufficient for attended work? Where does a replacement A/B session resume? What marks a scope-expanded item that moves to lifecycle so that both paths cannot execute it? Chart records currently stay after handoff and participate in duplicate detection (shapes.md:35,59).
- Recommendation: retain the smallest durable evidence that lets a replacement session know what is complete and what is next. Do not claim Closed on an approved-but-undelivered diff. Preserve usage across session replacement (shapes.md:126-137), and settle whether immediate implementation/review are included in the existing chart usage window.

Q8. Does immediate delivery include source closure and completion broadcasts?

- O15. Match the operator-visible delivery behavior: close confirmed delivered sources with commit evidence and broadcast if configured, once delivery is proven. But define the completion owner and actor before reusing either command or skill. Existing source closure/folder move is tied to all owner leaves being merged (src/phase.ts:185-218), and broadcasting is tied to printed issue/epic complete events (skills/broadcast-issue/SKILL.md:10,14; skills/merge-issue/SKILL.md:67-69).
- O16. Immediate work produces code and a reviewed report only, leaving external closure/announcement outside this mode. Smaller scope, but may surprise operators who expect “done” to mean the same thing across routes. This is a material product decision, not a missing implementation detail.
- Existing chart door already closes delivered/duplicate identities using akrogon close with delivery evidence (skills/chart-issues/SKILL.md:35). Inspect its ownership guard before selecting it for the new path. No external write or source closure was performed for this map.

## Outside practice and synthesis

P1. Google engineering team, firsthand documented review practice: [Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html), read 2026-10-08. Recommends focused self-contained changes, related tests, and reviewer judgment about size. This supports Q3's conceptual eligibility rather than a file/line threshold. It does not establish that a small change needs Akrogon's full lifecycle.

P2. Paul Hammant's Trunk Based Development practice site: [Short-Lived Feature Branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/), read 2026-10-08. Describes brief change branches shared for review and updated against trunk before landing. This supports Q6's isolation and integration checks, without requiring new long-lived execution sessions.

Both sources favor focused changes and prompt review. Neither endorses replacing review with author checks. Their advice changes with the conceptual size and integration conditions of the change, not whether a tool calls it one leaf. My synthesis is that the useful saving here is retaining A/B context and avoiding dispatch/planning overhead while retaining a bounded contract, a separate code review, and verified delivery. Whether that should keep a lifecycle leaf is the first operator fork.

## Local historical signals, not new rules

R1. B previously caught defects through running temp-repo scenarios that A's reading missed (learnings/LESSONS.md:7). Immediate review should include relevant execution evidence, not just agreement with the chart.
R2. Two reviews previously passed with work uncommitted (learnings/LESSONS.md:10). Bind B's verdict to a committed head and scoped base before delivery.
R3. Skill changes previously left operator docs stale (learnings/LESSONS.md:12). Whatever path is chosen, its shipped scope must include the affected chart/config/phase documentation, not broader documentation cleanup.

## Proposed chart grouping

D1. One destination: an opt-in immediate A/B execution mode in Akrogon, usable by consuming repos through their config. Settle Q1, then Q2/Q3, then the resulting gate/review/landing/recovery/completion contracts. No implementation leaf split can be defended yet because Q1 determines whether the work is principally a skill protocol or lifecycle runtime change (src/config.ts:38-60; src/routing.ts:27-54; skills/chart-issues/SKILL.md:85).

D2. Treat the earlier status-display edit and cleanup of its history as off-route unless the operator adds them. The intake uses it to explain the desired behavior, not to request retroactive review or repair. Source: supplied map-brief.md, Context.
