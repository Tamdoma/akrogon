# Slot B: leaf review and intent loopholes

Reviewed independently against f7baddc and the recorded operator answers. The drafts need corrections before handoff. Most follow existing decisions. The remaining choices concern uncertain peer completion, extending direct repair limits, unfinished main steps after handoff, and concurrent ownership before chart records exist.

Paths below: `draft/` means `/home/ivan/.claude/jobs/6a0d8d81/tmp/drafts/autopilot/`. `chart/` means `issues/chart/autopilot/`. Skill and source-code line references are at f7baddc.

## 1. Leaf review: disagreements

### L1. Delegated answers still fail the written handoff audit

Evidence: `draft/autopilot-mode/brief.md:11` requires A-attributed Taken answers. Its `design.md:55` limits the shapes change to the mode line and Autopilot section. But `skills/chart-issues/assets/shapes.md:93` requires operator words in Taken, `:95` declares a fork without an operator answer open, and `:287` refuses its handoff. Merely changing questions.md's silence rule leaves these direct contradictions.

Fix: make the existing fork shape and preflight recognize a recorded, authorized A answer under autopilot, while retaining the operator-only approval exceptions. Use the central Autopilot rule by reference rather than maintaining several separate authority lists. Also reconcile questions.md:31's wait and :46's turn-ending instructions for the already-decided peer-loss cases. Add this functional consistency to the leaf's criteria.

Disposition: follows Boundary Taken (`chart/forks/boundary.md:30-35`) and Picking Taken (`chart/forks/picking.md:16`). No new operator choice.

### L2. Session equality is insufficient to restore mode after compaction

Evidence: `draft/autopilot-mode/design.md:58` says the same session id continues. `brief.md:10` records switch-on and session identity, while `:15` allows off and changed handed lists. Neither specifies that off and list changes update the persisted mode record. After compaction, the same-session test can restore an earlier on instruction after the operator stopped it.

Fix: persist the latest operator mode and scope changes with provenance in the existing record, including off, and read that effective record before continuing. Session equality establishes continuity only when the latest instruction still authorizes autopilot. Keep consultant losses across resume as already required.

Disposition: follows Switch Taken (`chart/forks/switch.md:22-23`). This needs no new state file or config key.

### L3. The automatic ending excludes valid terminal outcomes

Evidence: `draft/autopilot-mode/brief.md:15` ends mode only when all work is handed off. The same draft supports verified direct landings (`:16`). SKILL.md:85 closes those charts, and :124 permits abandonment as Held. Delivered or duplicate intake may also produce no leaf. Such a handed list can finish without ever satisfying “all handed off.”

Fix: describe completion using the existing terminal outcomes, including direct closure and explicitly abandoned work. Keep unresolved needs and actual unfinished obligations separate. Do not manufacture a Handed off marker for a closed chart. Post-handoff main obligations need the I3 decision below.

Disposition: the ordinary terminal cases follow the existing Direct route and Drain process, preserved by Boundary. This corrects the shorthand rather than expanding autonomy.

### L4. Pane sizing needs its existing qualification

Evidence: `draft/any-consultants/brief.md:12` states that all created peers share the right 35%. SKILL.md:27 qualifies this layout: it holds when A fills its tab, otherwise only A's area is split. The draft's own `readiness.yaml:14` explicitly does not prove the partial-tab case.

Fix: retain the existing qualification in the criterion and resulting text. Do not promise to resize supplied panes or the whole tab. The sequential splitting decision itself is settled and supported by the recorded proof.

Disposition: follows the existing pane-ownership rule. No further operator question or wider proof is needed if the existing limitation is retained.

## 2. Intent loopholes through the process

### I1. Some peer failures never reach the agreed loss rule

Point: questions.md:46 requires reporting an idle/done `budget` with an unproven end signal before another wait. A peer with no return and no supported completion signal can remain in this condition indefinitely. Separately, peer-ask.ts:48-64 can fail to establish an exchange before prompting, and peer-wait.ts:276-285 can exit nonzero without a `failure` outcome.

Draft now: `draft/autopilot-mode/brief.md:14` covers `failure`, `blocked` and refused prompts only. It does not decide these other cases. A missing return is not itself proof of failure.

Resolution proposed: distinguish A's repairable invocation mistakes, unavailable peers, and uncertain completion. Fix an A mistake such as a reused return path without dropping healthy peers. Treat a definitively unavailable named peer as lost, retaining the reason and never inventing its answer. For idle/unproven completion at the existing wait-budget boundary, recommend dropping that peer as unverified and continuing, without cancelling it, re-prompting it or treating a later partial file as an accepted return. This may discard a slow but healthy peer. Normal working-budget waits still continue.

Authority: unavailable-peer handling is consistent with Picking's reason for continuing (`chart/forks/picking.md:16`). Abandoning an exchange whose end is unproven extends its explicit outcome list and needs an operator decision. Do not silently convert a wait budget into proof of completion. No new timer or polling system is proposed.

### I2. Direct recovery needs a precise boundary

Point: SKILL.md:105-109 requires B's review. Its :119 allows the operator to choose one more repair round after exhaustion, and :123 already supports lifecycle adoption of the existing branch.

Draft now: `draft/autopilot-mode/brief.md:14` removes direct when B is lost, but gives no continuation for an already-created direct branch. Its :11 delegates every operator answer, while `design.md:18` forbids changing autopilot's own limits. Repeatedly answering “one more round” can make the repair bound ineffective.

Resolution proposed: if B is lost after direct work starts, stop direct implementation/landing, preserve and record the partial work, and let A choose the existing lifecycle adoption or abandonment path. Never renumber C into B to evade the loss. The first named B remains B for the session. For repair exhaustion, recommend lifecycle or abandon under the existing bound. Any extra-round authority must be explicitly settled here, rather than assuming A may renew it indefinitely. Preserve the existing two-push-attempt limit as well.

Authority: loss of direct and A choosing the remaining technical route follow Picking Taken and Boundary. Whether the existing “one more round” option is delegated, and what prevents repeated extensions, needs the operator's decision because the general delegation and own-limits restriction pull in different directions.

### I3. A main step can remain after every leaf is handed off

Point: SKILL.md:85 and shapes.md:36-39,281,287 keep work under issues/ on main. A step whose prerequisite is a leaf merge becomes a Pending steps entry, and its source cannot close until the step is verified.

Draft now: `draft/autopilot-mode/brief.md:15` ends autopilot once all work is handed off. The watcher owns lifecycle progress, cannot edit issues/, and this chart excludes watcher changes and new polling (`chart/CHART.md`, Off route). Thus nobody in the proposed unattended run necessarily returns to perform that main step after the merge.

Resolution proposed: perform and verify main steps immediately when their preconditions already hold. Otherwise record the exact remaining edit, check, prerequisite and owner, leave its source open, and explicitly assign the operator to resume the door after the prerequisite lands. Report handoff with pending work, not complete delivery. This uses the existing Pending steps mechanism rather than adding a background door.

Authority: recording and withholding source closure follow the existing process. Requiring a later operator-triggered resumption is an unattended-work limit not stated in the draft's wait list. Ask whether the operator accepts it. If they require these steps to complete without returning, that needs a separately authorized continuation mechanism, not an implied watcher duty.

### I4. Ownership inferred from existing charts has an opening gap

Point: SKILL.md:37 permits seat records to remain in temporary files before chart creation. Both doors can be at their opening map before either appears in the shared chart tree.

Draft now: `draft/autopilot-mode/design.md:59-60` defines other-door ownership only from existing open chart folders and leaves overlap detection to planning. `brief.md:13-14` promises to hold overlapping work and skip shared consultants. Two simultaneously starting doors can both see no existing claim and use the same input or consultant. A pane check before prompting is not a reservation.

Resolution proposed: settle whether switch-on requires the operator to give doors disjoint work and consultant assignments, with overlap checks serving as detection, or whether the implementation must enforce exclusive acquisition. Prefer explicit disjoint assignments for this text-only change, recording them before any peer exchange. Do not describe filesystem scans as an enforced lock. Identify the latest A seat entry when interpreting an existing chart, since SKILL.md:37 appends replacement sessions rather than replacing history.

Authority: holding overlap follows Switch, but the drafts do not establish who wins or how both simultaneous claimants are prevented from acting. Operator choice is needed if exclusion must be guaranteed without relying on their assignments. Mechanical exclusion would exceed the current text-only ownership and require its own scoped decision and proof.

## Walkthrough points that need no additional permission fork

- Open/Drain: selecting technical options, harness arguments when peers must be created, splits, prototypes and destination matches fits Boundary's general delegation. Flaky-test and failed-leaf candidates outside the handed list do not become new intake merely because Open lists them. Registration remains outside this door.
- Take/Handoff: pending credentials, human-only prerequisites and outside-account approvals still hold affected work. A cannot manufacture a grant or waive a proof. Existing valid authority is evaluated against its recorded scope and lifetime. An A-attributed answer must satisfy the fork audit after L1.
- Direct/main actions: choosing an eligible direct route includes its existing push, delivered-source close, broadcast and cleanup authority (SKILL.md:99,109-115). In-scope immediate main steps remain part of today's process. These are not additional reasons to reintroduce attended approval at every technical choice. Source closure must remain tied to actual scoped delivery or duplication.
- After handoff: no new door dispatch, watcher control or monitoring loop is needed. Missing needs and missing human approvals are already accepted waits. The first observed run and operator-only decisions about subsequent use remain as taken.

END loopholes-B
