# Independent territory map B

Read 2026-09-28. No other slot files read. `A` below means `/home/ivan/Work/infra/akrogon`. `H` means `/home/ivan/Work/infra/herdrdev/herdr`. Local code and installed CLI help are the primary mechanism evidence. The incident reports remain unverified intake.

## #33 · Failed leaf repair routing and a watch that cannot stop

**F1 · This is a missing authorized workflow, not a hung seat.** `A/skills/watch-issues/SKILL.md:38` forbids recovering human prerequisites and treats an already-shown notification as sufficient. Line 39 can retry the failed phase but cannot create its prerequisite repair. Line 53 forbids issue edits. `A/skills/chart-issues/SKILL.md:10` describes an attended door, and line 3 makes it operator-invoked. Calling it autonomously from the watch would change that contract. No timeout or harness restart solves this report.

**F2 · “Reopen the owner” is not executable today.** `A/src/phase.ts:186` rejects all transitions from merged. `A/src/routing.ts:34` gives merged no next phase. `A/src/akrogon.ts:87` exposes no reopen command. Completion can move the entire owner folder and chart to closed (`A/src/phase.ts:171`). Reopening therefore affects lifecycle history and archived containers, not just one phase value. The consumer's instruction at `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-network-simplify/satellite-route/live-replay/design.md:46` promises an operation the lifecycle does not support.

**F3 · The reported owner is not uniquely settled.** The live implementation report names content-batch for gate calibration, research-pools for recording quality, and arch-differentiate-satellite-anatomy for the ban data. It explicitly says B cannot decide intent (`.../live-replay/implementation/report.md:81`). A reproducible defect does not choose whether the data or acceptance rule should change. The watcher should distinguish missing authority from a technical failure. Reading the word “operator” in a reason is insufficient classification.

**F4 · Stop misses the dependency closure.** `A/skills/watch-issues/SKILL.md:45` stops only for no leaves or every remaining leaf being a notified human-prerequisite failure. A dependent in another phase prevents that condition forever. Yet `A/src/next.ts:529` leaves failed leaves waiting, and lines 536–539 refuse to dispatch a dependent until every prerequisite is merged. The Waiting judge at skill line 36 can also call `next` for such an idle dependent and receive a predictable dependency error. Repeating that call cannot make progress.

### Q1 · How much repair routing may the watcher own?

- **A, recommended:** Permit a sanctioned repair door only for already-authorized, fully settled repairs. Reuse an existing matching repair leaf first. Otherwise prepare a concrete routing proposal and notify with the unresolved choice. Do not invent policy decisions or directly edit lifecycle files.
- **B:** Give the watcher authority to choose repair scope and owner, chart it, and dispatch it without an operator round.
- **C:** Keep all repair routing attended and only improve the escalation.

Strongest source: operator intake #33 asks to route a fix or explain why routing is impossible. The concrete report at `implementation/report.md:81` leaves ownership and intended behavior unresolved. Recommend A because it advances authorized work without converting ambiguous implementation evidence into product policy. It requires a narrow explicit authorization contract for the repair door. The existing watch and chart skill do not already grant it.

Pitfalls: A bounded repair proposal is not a completed repair. Do not label the supplied incident autonomously fixable until the data-versus-gate decision is resolved. Credentials, scope changes and policy decisions stay human prerequisites. Preserve the no-clock/no-restart lock and the watch's process-control prohibitions.

### Q2 · Should a merged owner reopen or receive a new repair leaf?

- **A, recommended:** Create a new repair leaf with its own completion evidence and a link to the original owner. Keep merged terminal.
- **B:** Add reopening semantics for merged leaves, including archived owners, old verdicts, worktrees, completed dependents and source closure.

Strongest source: `A/src/phase.ts:171`, `:186` and `A/skills/chart-issues/assets/shapes.md:118`, `:166` already support unique fresh leaves and reject lifecycle ambiguity. A removes the need to reverse completed history.

Pitfalls: Creating a repair leaf is only half the route. The sanctioned operation must hold the failed consumer until repair merge, then resume its recorded failure phase with idle-seat checks. `A/src/routing.ts:35` permits recovery from failed. `A/src/phase.ts:95` resets phase bookkeeping, so replay must remain deliberate. Do not declare new dependencies by editing state from the watcher. Decide the command-owned link between the repair and consumer before handoff. Deduplicate by the original failure and repair outcome so successive ticks do not create more leaves. A merged original dependency does not automatically block on its new repair.

### Q3 · What should the watch do when every unfinished leaf can only wait on a notified human prerequisite?

- **A, recommended:** Explain the root blockers and their dependent closure, notify once for any new unresolved routing decision, then stop the matching watch job. Restart remains operator-invoked.
- **B:** Leave the existing watch active and report only material changes. This can notice an externally completed repair but keeps idle ticks.

Strongest source: `A/skills/watch-issues/SKILL.md:16`, `:38`, `:45` and `A/src/next.ts:536`. A extends the existing stop policy to its actual dependency graph without adding a detector or timer.

Pitfalls: Do not stop merely because all seats are currently idle. A running repair, runnable independent leaf, unreadable inventory, missing dependency or unknown failure prevents proving this condition. Account for merged siblings still retained under an open owner. An earlier `delivery=shown` for the original failure is not evidence that a new routing ambiguity was communicated. After stopping, external repair completion will not magically recreate the cron. The final notification must name how to resume it.

**Destinations:** Two independent outcomes in akrogon. D1 is a sanctioned repair route and consumer resumption. D2 is dependency-aware watch escalation and stopping. D2 can ship without D1. Use separate leaves or charts according to the operator's selected scope. Neither needs a harness restart or a new polling service.

Practitioner questions: Can two ticks request the same repair? Can a completed external action be repeated on phase resume? Who chooses between changing bad data and weakening a gate? [Malcolm Featonby, AWS, Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) explains why retrying after uncertain completion can duplicate effects. Practitioner source, publication date not displayed, read 2026-09-28. This supports durable repair identity and reconciliation, not a generic retry engine.

## #34 · Consultant panes in a predictable layout

**F5 · No current skill owns creation or placement.** `A/skills/chart-issues/SKILL.md:24` expects operator-supplied B and C panes. `A/skills/chart-issues/assets/questions.md:44` begins by waiting for an already-named pane. It does not allocate peers, select C's harness or arrange the tab. Naming a peer and starting its harness are separate operations.

**F6 · Fresh layout is supported by the installed CLI.** Read-only help was checked for `herdr pane`, `herdr tab`, `herdr agent`, and split, move, swap, resize, tab create and agent start on 2026-09-28. The supported sequence for an otherwise empty A tab is:

```text
herdr pane split --pane <A> --direction right --ratio 0.5 --cwd <repo> --no-focus
herdr pane split --pane <returned-B> --direction down --ratio 0.5 --cwd <repo> --no-focus
```

These commands were not run. `H/website/src/content/docs/cli-reference.mdx:188` specifies explicit targeting and line 190 gives the new ID at `.result.pane.pane_id`. With only B, omit the second split. This yields the requested left A and right B/C stack without moving existing panes. `herdr agent start` then launches the selected harness in each available shell pane. Installed help requires shell foreground and returns only after interactive readiness. The corresponding contract is at `H/website/src/content/docs/cli-reference.mdx:301`.

**F7 · Existing layouts are a different problem.** The source regression `H/src/app/api/panes.rs:3011` expects a same-tab move to be a no-op. Installed help exposes cross-tab `pane move`, explicit source/target `pane swap`, and relative `pane resize`. Swap changes occupants, not an arbitrary split tree. Resize adjusts existing splits, not topology. No atomic layout-set command appears in the installed pane or tab help. Moving to a temporary tab and back is possible, but it is a multi-step operation with interruption and identity handling. The documented returned move ID must be used (`H/website/src/content/docs/cli-reference.mdx:191`).

### Q4 · Should chart opening create consultants or only arrange panes the operator names?

- **A, recommended:** When the operator requests peers, create missing consultant panes in the requested shape. Keep explicit existing-pane selection available. Do not create peers for a single-slot chart.
- **B:** Require supplied panes as today and arrange only those.
- **C:** Automatically start B and C for every chart.

Strongest source: intake #34 asks for layout when consultants are created. The existing skill at `A/skills/chart-issues/SKILL.md:24` makes peer use explicit. A fixes the repeated setup task without silently changing review cost or peer count. The report's B-only arrangement is marked “Not provided”, so confirm that B occupies the full right half.

Pitfalls: Settle the harness/model/effort source for B and C. Do not assume the lifecycle's two configured seats define a third consultant. Starting an agent is not prompt completion. Preserve the existing readiness and blind-exchange contract at `A/skills/chart-issues/assets/questions.md:44`. Capture IDs from results and record them for chart resume to avoid duplicate peers.

### Q5 · Should the skill rearrange an existing tab with unrelated panes?

- **A, recommended:** Guarantee the layout for newly created peers in a clean chart tab. For an occupied or incompatible tab, preserve it and request a dedicated chart layout rather than moving unrelated work.
- **B:** Authorize rearranging the named A/B/C panes through temporary-tab moves, with recovery from partial completion. Leave unrelated panes alone and specify what geometry is possible when they remain.
- **C:** Add a native same-tab rearrangement operation in Herdr first.

Strongest source: installed CLI help plus `H/src/app/api/panes.rs:3011` and CLI reference line 191. A uses existing primitives and avoids making a layout annoyance into a cross-repository feature. Exact 50/50 whole-tab geometry is impossible while arbitrary unrelated panes retain their geometry, so the contract must choose a boundary.

Pitfalls: Target A explicitly instead of the focused pane. Keep focus unchanged. Do not close existing panes or kill agents to enforce layout. A moved process retains launch-time Herdr environment variables. Use returned identity rather than guessing. Outside Herdr, report the missing layout capability and use the existing single-slot or explicitly supplied-peer workflow.

**Destinations:** One akrogon chart-skill destination under the recommended scope. Herdr becomes a second destination only if native rearrangement of existing same-tab panes is chosen. #33 and #34 are independent.

Practitioner questions: Can setup resume after B is created but before C starts? Who owns peer harness settings? Are all supplied panes safe to move? The strongest sources here are the installed CLI and its own code/docs. No outside practitioner claim is needed to establish those command capabilities.

## Research limits and locks

**S1 · operator, 2026-09-28:** both complete seed reports, the stuck-seat-recovery handoff and its no-time-limit/no-restart decision. No earlier lock is silently reopened. The retained conditional notifier remains unchanged under `A/issues/chart/stall-notifier-removal/forks/delete-notifier.md:24`. Pure silent stalls remain off route under `A/issues/chart/seat-stall-detection/forks/no-akrogon-detector.md:23`.

**S2 · better-than-training, read 2026-09-28:** live akrogon skills/code, the framework leaf contract/report, installed Herdr CLI help, and local Herdr source/docs cited above. No pane mutation or lifecycle command was performed.

**S3 · empty searches:** the akrogon verb surface has no reopen command. Installed Herdr pane/tab help has no atomic layout setter. Same-tab move support is contradicted by the local regression rather than inferred from the report alone. No live layout experiment was run, so the map proposes the documented split sequence without claiming measured geometry on a live tab.
