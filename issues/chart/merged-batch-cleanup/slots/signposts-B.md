# Signposts proposed by B

These are B's recommendations for A to answer under full autopilot, not operator answers. The previous session's limits are proposed defaults, not new grants.

Basis: the intake, the previous signposts' Question and Taken sections, and current `reconcileBatch`, `reconcileRepos`, `broadcastInProgress`, and `closeMergedTab`. The intake establishes the ordering defect. The historical hc change explains why no later event rescued this case, but does not by itself require a listener change.

## Q1. Completion guarantee

Once a pass releases a merged leaf's last cleanup blocker, how directly must it finish cleanup?

- a. Finish eligible cleanup in that invocation, using the existing cleanup path.
- b. Explicitly schedule a separate cleanup invocation, independent of further terminal activity.
- c. Add periodic reconciliation so retained resources eventually clear.

**Recommend a.** Prioritize completion without another scheduling dependency over the smallest textual diff. Keep existing safety vetoes and broadcast retention. This steers orchestration, lock boundaries, inventory freshness, and the acceptance test: one releasing invocation must suffice when cleanup is eligible. It does not require deleting resources while another legitimate blocker remains.

## Q2. Reach of the fix

How much of the release mechanism belongs in this chart?

- a. Only the reported command-owned holder that was already merged before the pass.
- b. Every merged-leaf batch-release route through the directly implicated orchestration, with the same completion guarantee.
- c. All finished-leaf resource retention, including failed leaves and unrelated listener or leftover behavior.

**Recommend b.** Fix the shared ordering problem wherever it can strand an eligible merged leaf, rather than encode this one timeline. This steers fork coverage, allowed files, and regression cases. Failed-batch policy, a listener redesign, and additional diagnostics stay outside the chart unless evidence makes them necessary to deliver this guarantee.

## Q3. Interruption guarantee

Must the fix also guarantee cleanup after the releasing invocation crashes or is killed?

- a. Guarantee completion for a successful invocation and retain existing startup/resume recovery for interruptions.
- b. Add durable cleanup work that survives interruption and arranges its own execution.

**Recommend a.** The report concerns a completed pass leaving no cleanup trigger. It does not establish a missing crash-recovery contract. This steers against new persisted flags, queues, or background owners and keeps proof focused on completed invocations. Existing recovery behavior remains a constraint on any reordering.

## Q4. Proof spending

How much runtime infrastructure should proving the fix require?

- a. Deterministic local tests with isolated repositories and controlled hc/systemd boundaries, plus the repository's required checks.
- b. Also require a disposable private hc session and real runtime teardown rehearsal.
- c. Require replay and cleanup of the reported framework leaf in the operator's live session.

**Recommend a.** Test the invocation ordering, release, and resulting resource cleanup without a second unrelated pass. Check the relevant existing retention protections rather than building a new test framework. This steers fixtures, verification cost, and grants. Escalate to b only if an identified runtime uncertainty cannot be proved by the existing local harness. Do not make live framework cleanup a completion requirement.

## Q5. Historical investigation budget

How much history must be reconstructed before handing the fix?

- a. Establish a current-code reproduction and causal explanation, using the recorded timeline as supporting evidence.
- b. Also identify exactly how old herdr previously supplied the missing cleanup opportunity.

**Recommend a.** Current ordering and the missing autonomous cleanup opportunity are sufficient to frame the fix. This steers fork order and avoids making an old-runtime comparison a blocker. Inspect history only when it can change the implementation or prove a relevant regression constraint.

## Operator-only needs

None foreseen for the recommended route. No keys, paid calls, production-session access, deployment, or manual cleanup grant is needed. Existing stale resources should become eligible through the corrected ordinary path when it next runs. This consultation makes no live mutation and grants none to later work.
