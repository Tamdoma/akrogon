# Landing and completion: blind slot B notes

Read 2026-10-08. No other slot's landing notes read. Container 1a and eligibility 1a/2a are binding. Recommendations below are not operator answers.

## Q1. Who rebases, runs checks and merge_checks, and pushes?

### Pick, reason and cost

Pick the door (A), with B remaining the code reviewer. The operator's direct choice should explicitly include landing to the configured default branch, so the mode completes the small job within the existing A/B sessions. A fetches the configured remote, rebases the isolated branch when necessary, refreshes AKROGON_BASE and effective checks, runs checks and merge_checks, runs the taken phase guards, and records the tested base and head. B's ready/nits verdict must name the actual final committed head. After any rebase producing a different head, B checks the changes against its prior reviewed head and records approval of the new head before A pushes. This adds a review after a changed integration head, but avoids a second approval-reuse mechanism.

Push the exact tested and approved SHA with a normal non-force push to the configured remote/default branch. A successful push plus authenticated remote ancestry read-back establishes delivery. If the remote moves and rejects the push, do not force it or silently claim completion. Preserve the branch and evidence and report that integration must be repeated against the new base. Recovery may resume the same fetch/rebase/check/B-approval sequence, with automatic repetition bounded by the later growth/repair decision. Other push errors are reported with full context. Do not invent an unlimited landing loop.

Cost: direct mode needs its own landing entry point because merge-issue is leaf/attempt-based. Reuse existing guards and check commands rather than duplicating their definitions. A may run the Git commands as the explicitly selected landing actor, but that authority must be stated in the new direct protocol instead of borrowing the leaf merge seat's instructions.

### Rejected options and reasons

- Operator landing as the default: valid when the operator wants to retain publication control, but leaves the direct job waiting for another actor and complicates the already-taken cleanup-before-Closed rule. An approved local commit is not delivered to the remote.
- Calling merge-issue unchanged: its prompt requires leaf and attempt state, and seats must not push under that protocol.
- A pushing a rebased head solely because an earlier head was approved: commits and integration may have changed. Green checks do not replace B's review of conflict-resolution edits.
- Force pushing, pushing a moving branch name instead of the checked SHA, or modifying root main to land: none is needed to fast-forward the reviewed isolated result.

### Evidence, tier/source/date

- operator: issues/chart/direct-mode/INTAKE.md:12, 2026-10-08. The goal is current A implementing and B reviewing after gating.
- operator: issues/chart/direct-mode/forks/container.md:19-23, 2026-10-08. No leaf, door-owned guards, cleanup before Closed.
- better-than-training: skills/merge-issue/SKILL.md:10,25,51-65, 2026-10-08. Existing lifecycle command owns the push, merge checks follow rebase, conflict resolution records range-diff, and fast-forward push serializes competing integrations.
- better-than-training: src/phase.ts:460-475, 2026-10-08. Current landing verifies tested top and pushes a SHA to the configured destination.
- better-than-training: src/config.ts:230-241,270, 2026-10-08. Effective commands wrap setup, and worktree config supplies the base.
- practitioner: Paul Hammant, [Short-Lived Feature Branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/), read earlier this session 2026-10-08. Short review branches integrate with current trunk before delivery. This supports the integration step, not a particular Akrogon actor.

### Pitfalls and removal

- Wrong branch or unreviewed tip lands: configured target and exact tested/B-approved SHA fix the destination and content.
- Concurrent lifecycle merge changes the base: ordinary fast-forward rejection prevents overwrite, then fresh integration and review establish the next valid candidate.
- Rebase resolution escapes review: final-head B approval covers the resolved code.
- Failed push loses work: retain the worktree/branch and mark the chart unfinished. Cleanup happens after verified delivery.
- Setup or base changes invalidate evidence: refresh effective config and base, rerun blocking checks on final head, record outputs.

### Missing questions

Confirm whether selecting direct includes the door's Git publication authority. State that normal coordination operations (Git fetch/push, source closure, optional broadcast) are separate from the code-only ban on implementation needing external/live acceptance calls. Otherwise “code only” could accidentally prohibit the workflow's own delivery operations. Which recovery bound applies after repeated remote races belongs to growth/repair.

## Q2. Are delivered GitHub sources closed, and is a broadcast sent?

### Pick, reason and cost

Pick source closure after verified remote delivery, using the existing close command with a clear no-leaf reference such as `chart direct-mode commit <full-sha>`. Close only confirmed sources fully delivered by this chart whose other owners have no outstanding work. Preserve identity, delivered SHA and closure results in chart context.

For broadcast, recommend none in the first direct mode. The mode still gives the operator its result and delivery evidence. A configured lifecycle broadcast remains a lifecycle completion behavior until explicitly extended. Cost: small direct deliveries do not notify Discord, even in a repo configured for lifecycle notifications. This must be shown in the route choice, not discovered after landing. If the operator wants notification parity instead, reuse broadcast-issue with an explicit direct completion context and actor. Do not fake an issue/epic complete event or duplicate its sender.

### Rejected options and reasons

- Leaving fully delivered sources open by default: the existing chart door already has a mechanism for marking delivered intake, and no leaf will later close it.
- Closing on B approval before push: review is not remote delivery.
- Closing every imported identity without checking outstanding owners: the same report may contain work owned elsewhere. The low-level close command does not protect source ownership.
- Broadcasting automatically because the repo has targets: the current trigger is completion of an issue/epic by its merge slot, which does not exist here. Expanding that behavior is an operator choice.

### Evidence, tier/source/date

- better-than-training: skills/chart-issues/SKILL.md:35, 2026-10-08. Charting closes delivered/duplicate identities with delivery evidence and exempts identities whose completion owner still owns undelivered work.
- better-than-training: src/pull.ts:104-135,204-207, 2026-10-08. closeCommand requires a registered repo and accepts a delivery reference. closeSource checks identity and remote state but not open leaf ownership.
- better-than-training: src/phase.ts:185-214, 2026-10-08. Lifecycle source closure follows completion of owner leaves and distinguishes shared sources.
- better-than-training: skills/broadcast-issue/SKILL.md:10,14,29,37-43, 2026-10-08. Broadcast is merge-slot work on issue/epic complete, uses configured targets, and built-in retry failure does not reopen completion.

### Pitfalls and removal

- Another owner's incomplete work is hidden by closure: inspect open/closed source ownership plus the chart's confirmed scope before closing. The close command itself supplies no such guard.
- Retry creates duplicate commentary: existing closure reads state and checks its comment on retry (src/pull.ts:135-163). Preserve the stable delivery reference.
- Remote delivered but closure fails: record code delivery and the exact pending closure action separately. Do not rebuild, push again, or erase the remaining action by reporting the whole pass successful.
- Optional notification failure causes redelivery: if broadcasting is selected, use the sender's existing retry and failure semantics. No automatic rerun after its final error.

### Missing questions

Must unresolved source closure delay Closed, or can Closed carry an explicit pending administrative action after code and cleanup are complete? Decide completion semantics. If the operator selects broadcasts, specify actor and trigger in the direct path and retain that skill's failure-is-visible-but-delivery-remains-complete behavior.

## Q3. May direct code change issues/ paths?

### Pick, reason and cost

Keep records in the authoritative main checkout and publish eligible records with akrogon sync. Direct code cannot change issues/ on its branch. This is already taken in container 1a, so Q3 should be a restatement, not a new operator choice. Cost: changing consuming repo issues/config.yaml is an operator/configuration action on main, not eligible direct branch code. A schema change in src/config.ts is ordinary code and can still be eligible.

### Rejected options and reasons

Allowing issues/ branch changes contradicts the existing lock and splits the authoritative record between the chart checkout and execution worktree. Do not make a new exception to hide that contradiction.

### Evidence, tier/source/date

- operator: issues/chart/direct-mode/forks/container.md:21-22, 2026-10-08. No issues/ branch diff is binding.
- better-than-training: src/phase.ts:323-331, 2026-10-08. Existing guard checks code diffs under issues/.
- better-than-training: src/sync.ts:10-33,112-136, 2026-10-08. Sync requires configured default branch and selects eligible issue records before pushing.

### Pitfalls and removal

A chart/report diff accidentally reaches the code branch: keep artifact writes rooted at the authoritative chart folder and invoke the existing no-issues guard before review and landing. Sync does not authorize staging unrelated code or silently overriding operator changes.

### Missing questions

None. This question is settled by container 1a. If the operator explicitly changes that lock later, reopen it with its consequences rather than presenting it as unsettled now.
