# Slot C map: report 107

## Verdict

**The defect is confirmed. The suspected cause is partly confirmed.**

Paid model proofs can run repeatedly without an approved repeat bound. The report is wrong only in saying the current rule does not classify a paid model call as a billing effect: the grant rule explicitly names billing effects. In practice, its “live-change,” “mutating,” and “new mutation” wording lets a billed read-only session fall into `proofs[]` with `grants: []`, and no code links those records (`skills/chart-issues/SKILL.md:59,63`; `skills/implement-issue/SKILL.md:53`; `skills/check-issue/SKILL.md:35`; `src/readiness.ts`, `grantSchema`, `proofSchema`, and `gaps`).

## Verified evidence

F107-1. Reprocessing the local Claude usage records for 2026-10-17T22:00Z through 2026-10-18T12:30Z, deduplicated by message ID plus request ID, produced 1,333,420,020 input, cache-creation, and cache-read tokens. Paths whose recorded `cwd` was `framework/.temp/proof-34b/consumer*` accounted for 606,977,836 tokens, 45.5%, across 5,636 turns. Framework worktree temporary runs accounted for 492,530,789 tokens, 36.9%, across 7,128 turns. This independently confirms the report's magnitude and concentration (`~/.claude/projects/*/*.jsonl`; local Bun JSONL aggregation described under Source basis).

F107-2. The repeated-run behavior is recorded by the leaves, not inferred only from usage logs. `hub-child-links` reports 16 live replay attempts, each around 30–45 minutes, and says the operator stopped attempt 16 to save spend. `replay-cases` records runs through `live-run-19`. `cadence-capture` records several full runs, a usage-limit delay, and an operator-stopped fourth run (`/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/hub-child-links/hub-child-links/implementation/report.md:29-52,67`; `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/replay-cases/replay-cases/implementation/report.md:35-48`; `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-current/cadence-capture/cadence-capture/implementation/report.md:73-108,137-158`).

F107-3. These leaves explicitly record paid `claude -p` operations as proofs while leaving `grants: []`. Their `proofs[].limits` describe what a model-pin probe proves, not how many billed calls may run (`/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/hub-child-links/hub-child-links/readiness.yaml`; `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/replay-cases/replay-cases/readiness.yaml`; `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-current/cadence-capture/cadence-capture/readiness.yaml`).

F107-4. Current akrogon validation allows that state. `grantSchema` has a free-text `bounds` field and can represent a no-fixture billing grant, while `proofSchema` has no grant reference. `gaps` checks only declared inputs. No other production source consumes grant bounds or relates a proof operation to a grant (`src/readiness.ts:27-49,62-80`; `src/readiness.ts`, `gaps`; repository search for `grants`, `bounds`, and `proofs` under `src/`).

F107-5. The charting process already requires repeat and recovery bounds for a scoped live-change grant, but the implementation and review reuse clauses compare only operation, target, and identity before “mutating.” They do not tell the seat to account for attempts against `bounds` or stop when the bound is exhausted (`skills/chart-issues/SKILL.md:63`; `skills/implement-issue/SKILL.md:53`; `skills/check-issue/SKILL.md:35`).

F107-6. The handoff line reports one live run's sessions, concurrency, estimated elapsed time, and timeout worst case, but is information-only. It does not show the authorized worst case across reruns or impose a repeat bound (`skills/chart-issues/SKILL.md:71`; `issues/chart/proof-cost/forks/proof-run.md:17-22`).

F107-7. The framework replay contribution is also confirmed. The normal replay CLI accepts only `--evidence-dir` and `--print-plan`, then calls `runReplay` from the start. It has no stage-resume option (`/home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/run-satellite-live-replay.ts:1970-1997`, `main`).

F107-8. The report overstates the done-criterion wording as a direct rerun instruction. The implementation rule says to run the exact slow command once per proof pass, but later repairs still require evidence on the final head. The actual gap is no total attempt boundary across passes, not an instruction literally saying “rerun until green” (`skills/implement-issue/SKILL.md:45-53`; `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/hub-child-links/hub-child-links/brief.md:12-16`).

## Root cause

The deeper problem is a split authorization model:

1. `proofs[]` records that an outside operation was tried and what it proves.
2. `grants[]` records permission, effects, and bounds.
3. Billable read-only operations can be placed only in the first record because the process frames the second around mutation.
4. Seats are then told that grants cover reruns without being told to consume or enforce the recorded bound.

That split turns a finite account quota into an untracked proof implementation detail. The schema validates both document shapes but establishes no invariant between them (`skills/chart-issues/SKILL.md:59,63`; `skills/implement-issue/SKILL.md:53`; `src/readiness.ts`, `grantSchema`, `proofSchema`, and `readinessSchema`).

A second, smaller cause is proof selection. The standing design already says to use the cheapest sufficient boundary, replay recorded model output for chain triggers, and require a live model call only when that behavior is under test. It also says a clean full run is needed only when reuse cannot be shown or whole-run behavior is the subject. The repeated leaves found deterministic runner defects one by one through the most expensive full path, so charting and review did not apply those existing rules strongly enough (`skills/chart-issues/assets/standing-design.md:9-16`; hub and replay implementation reports cited in F107-2).

## Smallest removal and remaining code

D107. **Make billing an external effect, not a subtype of mutation, and make grant reuse bounded.**

The smallest systemic change is prose and audit logic:

- Remove “live-change” and “before mutating” as the gate for grant coverage. Any provider-metered operation, including a read-only model session and sessions launched transitively by a runner, needs an operator-approved `grants[]` entry before its first call (`skills/chart-issues/SKILL.md:63`; `skills/implement-issue/SKILL.md:53`; `skills/check-issue/SKILL.md:35`).
- Replace the broad “reruns ... without asking again” rule with reuse only while the operation, identity, target, effects, and remaining repeat/recovery bound all match. Exhaustion ends the pass through the existing operator-blocker path. Probes and delayed relaunches consume the same bound and cannot create a second unrecorded lane (`skills/implement-issue/SKILL.md:29-35,53`; `skills/check-issue/SKILL.md:29-35`).
- Make the handoff audit refuse a provider-metered operation in a criterion, plan, runner, or `proofs[]` when no grant covers its transitive launches. Show the authorized worst case across all permitted attempts, not only one attempt's session estimate (`skills/chart-issues/SKILL.md:63,71,77`; `skills/chart-issues/assets/shapes.md:349-355`).
- Keep `proofs[].limits` epistemic: what the probe does not prove. It must not double as spend authorization (`skills/chart-issues/SKILL.md:59`; `src/readiness.ts:62-72`).
- Apply the existing cheapest-sufficient and recorded-replay rules before granting a paid run. This removes paid calls when model behavior is not under test rather than merely capping them (`skills/chart-issues/assets/standing-design.md:9-16`).

No readiness schema or production TypeScript change is required for the contract fix. `grantSchema` already supports empty fixtures, operations, billing effects, bounds, and a stop line (`src/readiness.ts:27-49`).

This does not make overspend mechanically impossible against a disobedient shell process. Akrogon does not intercept nested `claude -p` launches, and the framework runner launches them inside `launchSkillSessionAsync` (`/home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/lib/session-trace.ts:160-252`, `launchSkillSessionAsync`). A hard guarantee needs new accounting at the launch boundary or a provider quota. That is a materially larger option.

## Material forks

O107-1. **Contract and audit boundary, recommended.** Reuse the existing grant shape, delete mutation-only ambiguity, and stop seats at the operator-selected bound. This is the smallest change and covers any billable provider, but enforcement remains agent-owned.

O107-2. **Akrogon attempt ledger.** Add a grant identifier and atomic remaining-attempt counter consumed by `akrogon run-check`. This mechanically limits top-level proof passes, but direct commands and hundreds of nested sessions remain invisible unless every runner is changed. It adds lifecycle state, concurrent-seat accounting, recovery behavior, and another failure mode (`src/readiness.ts`, `grantSchema`; framework `run-satellite-live-replay.ts`, `runReplay`).

O107-3. **Provider/runner launch budget.** Enforce a session budget in `launchSkillSessionAsync` and add stage resume to the framework runner. This is the strongest control for this runner, but it is framework-owned, does not generalize to other paid providers, and adds the checkpoint/resume machinery the operator prefers not to add (`/home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/lib/session-trace.ts:160-252`; `/home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/run-satellite-live-replay.ts:1970-1997`).

## Questions

Q107-1. What does an approved bound count: top-level proof attempts, total provider sessions, or both? One replay can launch many sessions, so a pass-only bound can still authorize a large unknown spend (`run-satellite-live-replay.ts:172-186`, phase table; `skills/chart-issues/SKILL.md:71`).

Q107-2. Must every provider-metered session count as a billing effect even when it has no marginal per-call invoice but consumes a subscription quota? The local proof record reports `$0.0857`, and the usage evidence reached an account limit, so this case cannot safely depend on marginal price (`hub-child-links/readiness.yaml`, Sonnet launch proof; `~/.claude/projects/*/*.jsonl` aggregation).

Q107-3. Should the operator choose each leaf's repeat bound, or should akrogon impose a global default? The current grant design records operator approval per leaf, while the prior proof-cost decision foreclosed a generic enforced numeric gate (`skills/chart-issues/SKILL.md:63`; `issues/chart/proof-cost/forks/proof-run.md:17-22`).

Q107-4. Which paid stages truly test model behavior? For deterministic wiring changes, one recorded model output through the real consumer may be sufficient; prompt, model, settings, or output-shape changes require one real call and re-recording (`skills/chart-issues/assets/standing-design.md:10,15`).

Q107-5. Is framework stage resume wanted as a separate product outcome, or is stopping after the approved attempts sufficient? The current runner has no normal resume route (`run-satellite-live-replay.ts:1970-1997`, `main`).

## Lifetime pitfalls

R107-1. A fixed global number silently conflicts with runners of different widths and with the earlier “no enforced numeric gate” lock. Keep the limit inside explicit operator approval unless the new spend evidence is used to reopen that decision (`issues/chart/proof-cost/forks/proof-run.md:17-22`).

R107-2. Counting only `run-check` invocations understates cost because one full replay launches session and batch phases transitively (`run-satellite-live-replay.ts:172-186`; `session-trace.ts:160-252`).

R107-3. Counting child sessions only after launch can stop halfway through a pass and leave unusable evidence. A runner must reserve or preflight its declared maximum before starting if mechanical child-session enforcement is chosen (`skills/chart-issues/SKILL.md:71`; `run-satellite-live-replay.ts:139-160`).

R107-4. Do not ban all live model proof. The standing rule permits it when model behavior is the subject. The control is necessity plus approval plus a bound (`skills/chart-issues/assets/standing-design.md:10,15`).

R107-5. Do not reuse saved artifacts after their producing inputs changed. Existing slow-run policy requires changed stages and consumers to rerun, and requires a clean run when whole-run behavior is under test (`skills/chart-issues/assets/standing-design.md:16`).

R107-6. A delayed relaunch after quota reset is a new attempt, not recovery of the old one. Letting sleep bypass the stop line makes the bound meaningless (`skills/implement-issue/SKILL.md:47,53`).

## Relation to reports 102–106 and earlier charts

S107-1. Report 107 shares report 104's broad symptom: expensive verification is repeated without proportional new delivery. Report 104's cause is speculative merge composition and base-scoped memory; report 107's cause is missing authorization accounting around billable proofs. They need separate charts (`src/batch.ts`, `pickMembers`; `src/attempts.ts`, `redMemberHeads`; evidence above for report 107).

S107-2. Report 107 touches report 105's proof-contract area, but it should not join that chart. Report 105 concerns a proof command incorrectly frozen as the acceptance outcome. A full replay can be a valid outcome when whole-run behavior is actually under test; report 107 concerns necessity, spend approval, and total attempts (`skills/chart-issues/assets/standing-design.md:10,16`; `hub-child-links/brief.md:12-16`).

S107-3. It does not share an implementation mechanism with reports 102, 103, or 106. Their destinations remain state extension tolerance, source completion without a checkout, and content-aware ignored-file collision handling.

S107-4. The earlier `proof-cost` chart made live-run cost visible and required concurrency, but explicitly left the line informational and foreclosed generic numeric gates. The new evidence shows visibility alone did not control repeat spend. A grant-specific authorization bound is a new destination and can be added without changing the earlier concurrency decision (`issues/chart/proof-cost/CHART.md:3-20`; `issues/chart/proof-cost/forks/proof-run.md:17-22`).

S107-5. The earlier `token-spend` chart concerns tokens consumed by the chart-issues door itself, not destination-repository proof runners. `test-runs` concerns valid comparable base-red evidence. Neither owns this mechanism (`issues/chart/token-spend/CHART.md:3-9`; `issues/chart/test-runs/CHART.md:3-20`).

## Source basis

- **Operator tier:** The addendum and original opening brief supply the request and the preference for removing redundant machinery.
- **Unverified intake:** `issues/seeds/107-paid-claude-p-sessions-in-proofs-and.md`.
- **Primary local evidence:** akrogon source, skills, schemas, earlier chart decisions, current framework contracts and implementation reports, and local Claude JSONL usage records.
- **Searches run:** local `rg` and bounded file reads; a recursive readiness/brief inventory; JSONL aggregation over `~/.claude/projects` for the stated UTC window, deduplicated by `message.id + requestId/requestRef` and grouped by recorded `cwd`; no web search.
- **Practitioner, better-than-training, and model-knowledge tiers:** none used.

## Recommended split

Add one independent sixth chart to the five charts in the first map:

**C6. Paid-proof bounds:** Every provider-metered model launch named or transitively used by a leaf is covered before launch by an operator-approved grant, and every seat stops before that grant's total attempt and session bounds are exceeded.

Do not add framework stage resume to this chart. If the operator wants it, chart it separately in the framework repo with the destination “a failed replay resumes from the earliest changed stage using still-valid saved artifacts.” It is not required for C6 and adds machinery rather than removing the authorization gap.

The recommended #102–#106 split is unchanged. C6 is separate and has no dependency on those five charts.
