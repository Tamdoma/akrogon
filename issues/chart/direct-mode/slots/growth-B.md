# Growth and repair bound: blind slot B notes

Read 2026-10-08. No other slot's growth notes read. Container, eligibility and landing Taken sections are binding. The current growth Carries still labels landing open; its Taken section now settles landing. These notes use that settled section without reopening it.

## Q1. What happens when a direct job grows, and how is double execution prevented?

### Pick, reason and cost

Pick stop-and-preserve, with an attended choice before changing route. When the job needs multiple outcomes, a new product decision, an unfinished dependency, inputs/grants/produces/retained, a live acceptance run, or work outside its approved scope, A stops direct execution and landing. Record the reason, remaining work, branch/worktree, original base, latest committed head, dirty-file state, implementation evidence and latest B-reviewed head/verdict in the chart. Append Held, not Closed. Keep the branch and worktree. Do not delete uncommitted work or force a checkpoint commit merely to make the held state look clean.

A presents the growth as new chart material. The operator can settle a revised eligible direct scope, or approve normal lifecycle contracts after the needed charting. Neither route begins until the operator takes that choice. This does not ask again for the original authorization; it resolves changed scope or route.

If lifecycle is selected, the normal leaf starts at its normal planning phase. Existing direct code and evidence are explicitly linked as candidate work, with the retained branch/head as their source. The implementation may adopt useful commits after checking them against the new plan, but does not inherit a ready verdict or bypass proof because the chart once approved part of it. After valid handoff, record that the direct attempt has ended and name the sole lifecycle owner. Preserve the old branch until its useful work has been adopted or its disposal is explicitly settled. No automatic leaf adoption, state seeding, cherry-pick, or code deletion at the moment growth is discovered.

Cost: an interrupted small job may require another attended decision and retain a worktree until its code has a clear owner. This is less machinery than an automatic migration system and avoids double execution or silent loss.

### Rejected options and reasons

- Continue direct because code already exists: violates the code-only and bounded-outcome choice if the job no longer qualifies.
- Automatically emit a leaf at implement/check/merge: normal handoff does not authorize door-authored lifecycle progress, and the new plan may change the acceptance scope.
- Automatically restart from scratch and delete the direct branch: discards work before judging whether it remains useful.
- Leave both direct and lifecycle active: either may land the same code or close the same source independently.
- Escalate merely because work took longer than expected: size is outcome judgment, not a clock threshold. Growth means changed scope/eligibility or work now judged unsuitable for this attended path, with concrete reasons.

### Evidence: tier, source, date

- operator: issues/chart/direct-mode/forks/eligibility.md, Taken Q1, 2026-10-08. Direct is one bounded outcome, code-only, no unfinished dependency, with no missing human prerequisite and B named.
- operator: issues/chart/direct-mode/forks/container.md:19-23, 2026-10-08. Cleanup precedes Closed; a held undelivered attempt is not a completed delivery.
- better-than-training: skills/chart-issues/assets/shapes.md:35,75, 2026-10-08. Held exists, last marker governs, corrections and unresolved forks remain explicit.
- better-than-training: shapes.md:251,259,267, 2026-10-08. Normal leaves start at plan.synthesis/plan.positions. Worktree, counters and execution progress are command-owned, and handoff requires settled contracts/preflight.
- better-than-training: shapes.md:261-263, 2026-10-08. A source has one completion owner, and identity conflicts are not silently reassigned.
- better-than-training: src/phase.ts:235-238, 2026-10-08. Failed lifecycle seats cannot restart themselves. This is an existing operational pattern supporting an explicit recovery choice, not a command to apply to the no-leaf chart.

### Pitfalls and their removal

- Half-complete code disappears: retain the actual worktree state and identify both committed and uncommitted work.
- An old verdict becomes approval for a larger job: link the evidence as historical candidate evidence and review adopted code against the new contract.
- Two owners execute/close the same source: record the end of the direct attempt and its sole successor before dispatch becomes possible. Normal ownership/collision checks still apply.
- A replacement session resumes the wrong route: durable chart pointer and last Held/Handed off marker name the current owner and next authorized action.
- Cleanup lock causes deletion of an unfinished attempt: cleanup-before-Closed applies to completed delivery, not permission to erase held code.

### Questions the fork misses

After lifecycle adoption, who verifies the direct branch is safe to remove, and where is that result recorded? Recommend the door, using adopted-commit evidence and an explicit record in the original chart. Do not make lifecycle sweeps responsible for a worktree they do not track. Also update the growth Carries to reflect the taken landing fork.

## Q2. What counts as a repair round, what is the bound, and what happens on exhaustion?

### Pick, reason and cost

Pick a completed A repair pass followed by B's review as one round. Initial implementation and its first B review are round zero. After B reports Fixes, or landing checks reveal an in-scope failure, A repairs the currently recorded blocking findings together, supplies the required proof and checks, commits the repair, and B reviews the repair under the applicable review rule. Count one pass regardless of how many fixes or commits it contains. A check failure encountered while completing that same repair stays in that round; it does not create an unrecorded sequence of free repair passes.

Use the existing repo fix_rounds value as the maximum number of direct repair passes, recorded with the direct contract at route approval. Track used rounds durably in the chart report/review history, not state.yaml, and do not reset them on session replacement, interrupted proof, or config edits. Before a pass starts, record its round number and source findings. An interrupted pass resumes that numbered pass, not a new allowance. When N passes have been used, B may still approve the Nth result and A may land it. If another repair is required, append Held with the latest findings and preserve the worktree. No N+1 repair, lowered criteria, or automatic switch to lifecycle.

For push contention, choose no automatic non-fast-forward retry. One rejected candidate push holds landing and preserves the branch and evidence. The operator can explicitly authorize a fresh integration attempt or lifecycle route. A new attempt repeats the taken fetch/rebase/check sequence and required conflict review. A clean integration attempt is not a code repair round. Fixing a defect discovered by it is. This keeps remote contention separate from defect repair and removes an unbounded automatic landing loop without introducing another repo setting.

Cost: a single competing merge can require operator recovery despite correct code. An alternative is one automatic reintegration retry, then Held after the second rejected push. That saves one operator intervention but adds another automatic iteration to specify and record. My recommendation remains no automatic retry for the first direct mode.

### Rejected options and reasons

- Count every B Fix as a round: penalizes grouping independent findings and makes reviewer reporting style change the allowance.
- Count every commit or test rerun: those do not measure a repair attempt and can multiply for legitimate proof.
- Copy lifecycle counter semantics literally: lifecycle counts B's check.repair-to-A check.fix handoff, whereas direct A repairs and B reviews. Same limit value, different explicit counting contract.
- Reset the allowance when the harness restarts or config changes: permits an unlimited effective repair loop.
- Automatically escalate on exhaustion: exhaustion identifies a stop, not operator approval for a new contract or route.
- Share the code-repair counter with remote push races: concurrent healthy work could exhaust the defect allowance without any code defect.

### Evidence: tier, source, date

- better-than-training: src/config.ts:43, 2026-10-08. fix_rounds is positive and defaults to 3. Reuse it rather than add configuration.
- better-than-training: src/phase.ts:151,301-311, 2026-10-08. Current lifecycle increments at check.repair-to-check.fix and fails when another such handoff would exceed the cap. It does not count individual findings or arbitrary Git retries.
- better-than-training: skills/check-issue/SKILL.md:63, 2026-10-08. Re-check examines repair differences and confirms earlier findings without reopening unrelated concerns.
- operator: issues/chart/direct-mode/forks/landing.md, Taken Q1, 2026-10-08. Rejected push keeps the branch; this fork sets the retry bound. Clean rebase reruns checks; conflict resolution gets B's focused re-check.
- better-than-training: skills/merge-issue/SKILL.md:47,65, 2026-10-08. Fast-forward integration detects competing delivery, and changed integration requires fresh proof.

### Pitfalls and their removal

- Off-by-one prevents the last permitted repair from landing: approve and land a passing Nth repair; only a further repair is refused.
- Session replacement grants fresh rounds: persistent numbered history and the recorded cap survive replacement.
- Review Nits consume repair work: only Fixes/blocking check failures enter the repair pass, consistent with the existing Fix/Nit bar.
- Repeated rejected pushes consume unlimited work: stop after one rejection and require an explicit new integration authorization.
- Exhaustion silently becomes wider scope: Held plus preserved evidence leads to the attended recovery/growth choice in Q1.

### Questions the fork misses

Should interrupted repair passes resume under the same numbered pass? Recommend yes, with prior work and missing proof identified. This must not permit marking a second complete repair cycle as continuation of the first. An explicit operator decision to grant further attempts must record the new allowance and reason, never silently zero the used-round history.
