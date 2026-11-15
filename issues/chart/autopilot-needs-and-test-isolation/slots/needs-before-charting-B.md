# Blind fork notes: needs-before-charting, B

Independent answers to Question/Carries only. No Findings or other peers' notes read. Applied the held five-part blind-note definition. Evidence below is source inspected on 2026-11-09; no notice, live call, paid call or agent was launched.

## Q1: Timing, contents and approval specificity

### Pick, reason and cost

D1: Investigate and present one actionable session inventory grouped by handed chart, in the opening response where possible and complete by signposts, before the first map. Include every foreseen key/login/file, account/resource/permission, grant for live changes and paid or nested launches, paid budget, retention, secret-save operation and genuinely human-only action. Say “none” when empty. Reuse the existing record rather than introduce another state machine or command.

Keep the existing sheet's purpose, consuming outcome, exact scope, destination/holder and completion conditions. Bind anticipated consumers to actual leaves later without expanding the requested scope. Keep grant provenance, identity/account, targets, operations including helpers/cleanup, effects, repeat/recovery bounds, stop line and lifetime. A later leaf name is bookkeeping, not new authorization.

D2: Ask early, but allow read-only mapping and design while an already requested item is pending. Block the affected proof until its required input/authority is actually present, and block handoff until its existing prerequisites, presence checks and proof obligations pass. A product-choice answer by A under full autopilot cannot answer an approval item. Silence supplies no approval.

Cost: a route whose permissions/resources cannot yet be specified sufficiently is unavailable under a broad “approve whatever the forks need” request. Prefer a useful bounded route that can be named now. If no such route exists, expose that limit before mapping instead of promising that later approval will be automatic.

### Rejected options

- O1: Keep the first supply list approval-free and add the definitive sheet after forks. This preserves the reported contradiction and misses the operator's cutoff.
- O2: Hold every charting activity until every requested key/action is completed. The operator required early asking, not global serialization of unrelated read-only work. Existing affected-proof/handoff boundaries already prevent unauthorized execution.
- O3: Ask for unrestricted or unspecified future grants. The grant contract expressly requires specific identity, targets, operations, effects and bounds. Early timing cannot erase those guarantees.
- O4: Ask again for every close. Current Open already authorizes delivered/duplicate closure in its stated circumstances, and this session's Taken confirms that step. Inventory only an action that actually needs new operator authority, honoring existing authorization.

### Evidence, tier, source and date

- F1: `operator`, supplied #129 Expected behavior, 2026-11-05 direction inspected 2026-11-09: all needs must be asked before charting, signposts at the latest. This fixes the request deadline, not a new universal wait-for-completion rule.
- F2: `better-than-training`, `skills/chart-issues/SKILL.md` Open, Take and Autopilot, read this session: signposts precede maps; Take currently puts the sheet after forks and separately waits for asynchronous approvals before affected proofs; grants explicitly define scope and reapproval triggers. Reconcile the timing while retaining those safety properties.
- F3: `operator` and `better-than-training`, current session signposts Taken and SKILL.md Open, read this session: approvals remain operator-only, and delivered-identity closure is the door's own prescribed action.

### Pitfalls and removal

- R1: Full autopilot accidentally answers its own approval sheet. Separate A's product picks from operator authorization and preserve pending status until explicit authority exists.
- R2: Pre-map leaf details become a reason to postpone the sheet. Name the consuming chart/outcome and concrete operation up front, then bind final leaf references without changing scope.
- R3: A speculative list asks for every possible credential. Retain only routes whose bounded needs can be named before the cutoff. Record the resulting route limit rather than request blanket power.

### Question the fork should also settle

Q4: Does the same early-inventory rule apply in manual, autopilot and full autopilot? Recommend yes. Full autopilot is the reported failure mode, but a single needs-request deadline avoids contradictory phase rules. Only who answers product questions changes.

## Q2: Late discoveries and visibility

### Pick, reason and cost

D3: First distinguish an item already requested but still pending from a genuinely new need or expanded authorization. The former is an ordinary recorded wait under the original early request. The latter is an early-discovery failure, not permission to issue another request after signposts.

Use a useful route already within recorded scope and authority when one preserves the handed outcome. Otherwise stop that chart before the affected operation, record the unexpected blocker and preserve the other handed work. Do not silently cut the chart's purpose or wait until handoff to report the failure.

D4: At that transition, surface the blocker in the door's terminal immediately. Inside a supported registered hc repo, also publish one existing `akrogon notice --title ... --body ... --attention` notice with the chart, reason and record path. This is an event notification, not a new permission question, reminder loop or expanded grant. Do not claim the notification proves the operator saw it. A new notice carrying a late “please approve/supply X” question would contradict the operator's cutoff even if its UI were more visible.

Cost: an unforeseen prerequisite can leave a chart incomplete until the operator independently changes the situation or directs a later run. No process can guarantee discovery of every future fact. Preserve the stop and the truth about that limit rather than authorizing the missing action.

### Rejected options

- O5: Park with only a wait line and pass-end summary. This is the reported days-long visibility failure.
- O6: Send a new late approval question through a toast. Better delivery does not satisfy “nothing after signposts.” If A wants a late-ask exception, identify it as a change to the operator's direction, not an implementation detail.
- O7: Cut unproven operations until handoff can be called complete even when the useful outcome disappears. Take already treats loss of the useful outcome as a scope question; autopilot cannot quietly drop handed work.
- O8: Add watcher polling, a timer or repeated notifications. Existing terminal output, chart records and the notice command cover the transition without new machinery.

### Evidence, tier, source and date

- F4: `operator`, #129 Observation/Expected behavior, supplied intake, inspected 2026-11-09: mid-chart asks parked in summaries were unseen, but the requested fix also sets the deadline. Both properties must hold.
- F5: `better-than-training`, SKILL.md Drain, Take and Autopilot, read this session: other runnable handed charts can continue, unproven promises cannot hand off, grants cannot expand automatically, and A cannot drop a handed chart.
- F6: `better-than-training`, `src/akrogon.ts` notice case and `src/notice.ts` writeNotice, inspected 2026-11-09: the command resolves the current registered repo's hc session and atomically publishes a UUID-named JSON notice with an attention flag. It prints the file path; it does not establish that a person read it. The command requires successful repo/session resolution, so it cannot be mandated unconditionally for outside-hc/unregistered charting. No new product code is needed for the supported case.

### Pitfalls and removal

- R4: A notice failure makes the chart disappear again. Keep the immediate terminal statement and canonical chart blocker regardless of notice delivery. Report a nonzero notice result explicitly. Never treat a failed write as notification success or auto-start/change a core to repair delivery.
- R5: Compaction/resumption floods the operator with the same notice. Publish at the transition that creates the blocker, using the existing chart record to distinguish a new blocker from resumed waiting. Do not add a new deduplication subsystem.
- R6: Notifications disclose secret values. Name only the missing input/authority, purpose and record path. The existing holder/private-save rules remain unchanged.

### Question the fork should also settle

Q5: Is the desired late-discovery policy genuinely “no new ask,” or a visible late-ask exception? On the current operator text it must be the former. A full-autopilot product pick should not blur the two by calling a new approval request a notification.

## Q3: Surfaces and judgment

### Pick, reason and cost

D5: One skill-text leaf updates the directly affected opening, Take, Drain and Autopilot rules together, the signposts explanation in questions, affected chart-record/preflight text in shapes, and the named docs restatements. Keep existing grants/readiness/proofs as the execution boundary. Do not add a command, parser, approval flag or string-matching test.

Judge the resulting behavior through concrete scenario walkthroughs and independent semantic review. Observe the existing notice command in a throwaway local fixture if it becomes a named contract operation; that establishes publication/routing, not end-user perception of a toast. No paid agent run or operator-core mutation is required.

Cost: process text still requires agent judgment. Exact-word or exact-order checks would validate formatting while leaving the actual timing/authority contradictions possible.

### Rejected options

- O9: Add an early sentence but leave Take's late sheet and Autopilot's “no approvals” rule active. That does not remove the conflict.
- O10: Change grant boundaries to make early approval easier, or build a map-refusal command. Neither is needed for the requested behavior, and the latter conflicts with signpost 5a absent a demonstrated code-only requirement.
- O11: Sweep unrelated documentation or run a paid model exercise to test the prose. Scope is this needs contract and its direct restatements.

### Evidence, tier, source and date

- F7: `better-than-training`, subject sections inspected this session, 2026-11-09: SKILL.md Open/Take/Drain/Autopilot; questions' signposts rule; shapes' Autopilot wait lines and Preflight and validation; docs/use/autopilot.md opening/wait rules; docs/use/plan-work.md Set the signposts; docs/reference/limits.md What stays your job. These contain the directly affected timing, record and authority obligations.
- F8: `operator`, session signposts 3a/5a/6a, read this session: the direct boundary is in scope; skill rules are preferred; no live mutations or paid calls are required.

### Pitfalls and removal

- R7: The new cutoff disagrees between manual and automatic signposts. Walk the same scenarios in all three modes and confirm product answers never supply operator authorization.
- R8: Presence checks or handoff readiness are accidentally weakened because needs moved earlier. Retain later verification of the same early-requested items and require actual authority before covered proofs.
- R9: Source completion is described as an update to running doors. Preserve Handoff's next-release-link statement.

### Questions and minimum behavioral cases

Q6: Does the review distinguish “asked before mapping” from “available before the consuming operation”? It should. Cases to judge are: no needs; missing credential; paid/live grant including helpers; retention/private secret-save; existing close authorization; an early request still pending later; expanded operation after signposts; useful authorized alternative; no useful authorized alternative; unsupported or failed notice publication. Assess outcomes and authority, not exact sentences, file order or counts.
