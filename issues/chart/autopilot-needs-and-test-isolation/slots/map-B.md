# Opening territory map, slot B

Independent map from the supplied intake, binding signposts and inspected source/history. No other slot's map was read. Only this return file was written. Local tests used throwaway fixture cores and stand-in agents, with no paid run or operator-core mutation.

## Findings

- F1: #131 is delivered in source by `47186f90`. Its diff changes the pinned-schema case from `spawnCaptured(['hc', 'schema'])` to a fixture-created core's `core.hc(['schema'])`, refreshes the pinned `Terminal.first_message` property, and cleans up the core. Current `tests/hc-identity.test.ts` retains that change. `tests/hc-fixture.ts` `cleanEnv`, `hcCore`, and the returned `hc` function explicitly bind session/runtime/state instead of relying on the test process's ambient startup environment. That removes the reported operator-core dependency rather than hiding schema differences.
- F2: The private-core isolation fix is broader than the #131 call change. `97034315` separates the core runtime (bus, no systemd link) from the application's discovery runtime (bus, systemd, links to test sockets), and routes scoped seat launches through `tests/core-bin/systemd-run`. Its recorded full-suite observation was unchanged shutdown-unit and real-socket counts. The linked 2026-11-08 lesson confirms that clearing the previous leaked units made previously failing verifies pass. These are historical observations, not a present stress proof.
- F3: Current #130 still spends time on intentional negative delivery outcomes. `tests/hc-delivery.test.ts`'s reported case creates an idle stand-in, waits through unconfirmed startup, sends an implementation task that never starts, checks no resend at an unchanged turn, advances the turn, and exercises late settlement plus another failed send. `src/seat.ts` `firstTask` uses the fixture's existing 3000 ms start-proof setting. `src/hc.ts` `send` delegates to native `hc send`; `src/next.ts` `dispatchSlot` owns settlement, resend guards and the next idle-turn send. Exact contributions from native send, process startup and systemd reconciliation remain unmeasured here.
- F4: The timeout workaround was tried and explicitly undone: `233d01ca` adds 90-second per-test caps; `75f61f00` reverts them. Session signpost 2a forecloses that route and production delivery changes merely to satisfy tests.
- F5: #129 is a real instruction conflict in current source. `SKILL.md` `Open` places signposts before maps, but `Take` schedules the needs sheet after forks settle. `Autopilot` excludes approvals from the initial supply list and later permits missing needs/approvals to park work. `Drain` moves on from such waits. Merely adding “ask early” leaves contrary instructions active.
- F6: The close example in #129 needs current-source treatment. `SKILL.md` `Open` already instructs the door to close identities recorded as delivered or duplicate during the pass; the session's Taken explicitly says that closure is the door's own step. Do not recreate a close-approval barrier from an older installed release when the current contract authorizes that exact close.

## Local observation

Command run at the registered checkout:

```sh
bun test --timeout=30000 --parallel=4 --no-isolate tests/hc-delivery.test.ts tests/hc-identity.test.ts -t 'pinned copy|a working seat'
```

Bun 1.4.4: 2 pass, 10 filtered out, 0 fail, 14 expectations, 14.93 seconds across two files. Terminal `t10r` exited 0 and was removed after collecting output. `git rev-parse HEAD` immediately after collection returned `49d2c91693e321b456857476be74a332f4a1db10`. No source edits were made by B.

Limits: this was one focused run, not the full configured suite, a controlled load experiment, or a before/after comparison. It proves current pinned-schema behavior and current execution of the reported delivery sequence. It does not prove #130's host-load failure is gone, or every spawn in the suite is isolated.

## Material forks, in proposed order

### Q1: Does #130 still need a change after the existing fixture isolation fix?

Options: O1, verify the reported condition on current main and close against the delivering change if it is already removed. O2, if current evidence still shows the causal delay/failure, create one narrow test/fixture leaf. Prefer O1's investigation first, with O2 contingent on its result. A quiet pass alone cannot select closure.

Grounding: F2-F4, the local observation, `hcCore`, `firstTask`, and `dispatchSlot`. This fork decides whether there is any test implementation leaf. A bounded concurrent/load observation and the existing configured runner distinguish current behavior from the historical unit-leak failure. Do not run two copies of this same real-core case concurrently: its teardown stops a repo/slug-derived slice, so identical slugs can interfere across runs.

Low confidence: whether the remaining delay reproduces after `97034315`. No current load failure was observed by B.

### Q2: If #130 remains, which behavior must retain a real-core proof, and which work can the test stop repeating?

Options: O1, keep the real-core case but separate independently meaningful scenarios so one test does not accumulate several negative-delivery windows. O2, use the existing test shim to control a negative delivery reply for the state-settlement scenario, retaining an actual native boundary proof where required. Reject raising deadlines or changing production waits under signpost 2a.

Lean toward O2 only if timing establishes repeated native negative waits as the cause and existing real-core coverage proves the boundary being substituted. Otherwise use O1 where the scenarios genuinely stand alone. Do not choose by line count. Both require independent expected outcomes for no duplicate send and late settlement.

Grounding: `tests/hc-delivery.test.ts` reported case and its separate working-seat case; `tests/hc-shim.sh` already records all calls and can inject the native unavailable refusal for another case; `dispatchSlot` owns the state behavior under test. `hc send --help` exposes no separate start-observation budget: its `--timeout` is for `--wait`, not a demonstrated way to shorten these sends.

Pitfall: splitting a sequence while retaining the same repeated waits can merely move the failure across tests. A controlled reply can make a test circular if it fabricates the very core behavior the test claims to prove. The retained real boundary and observed work removed must be named before either route is selected.

### Q3: What exactly must be established by the end of signposts for #129?

Options: O1, one actionable inventory across all handed outcomes, covering needs and operator-only approvals for the chosen bounded route. O2, conditional inventories covering every material alternative the session intends to keep available. Prefer O1 for fewer speculative credentials and broader grants; an alternative requiring new authority is unavailable after the cutoff.

Grounding: `Open` puts signposts before mapping; `Take` currently demands purpose, consumers, exact permissions/resources, holder destinations and completion conditions, and separately scoped grants. Move discovery/request timing without deleting that useful specificity or the later presence/proof checks. Actual leaf slugs can be bound later to the same approved scope; naming a leaf must not create fresh authority.

Practitioner question: What read-only intake/dependency inspection is allowed before the cutoff so the early inventory can be concrete? This has to be stated without quietly moving the full map/fork interview ahead of signposts. Also distinguish “request received” from “need fulfilled”: an early requested key or approval can legitimately remain pending while unrelated work proceeds, but the affected proof still cannot run.

### Q4: What happens if a later discovery would require a new need or expanded approval?

Options: O1, continue only a useful route already within recorded scope/authority. O2, visibly stop the affected chart when no such useful route exists, retaining the finding and exact missing action. Recommend O1 when it preserves the handed outcome, otherwise O2. Neither option asks a new mid-chart question, invents consent or silently drops the outcome.

Grounding: intake #129's operator deadline, `Take`'s no-unproven-handoff rule, `Autopilot`'s no-dropping rule and `grants`' explicit reapproval triggers. A changed target, identity, operation or bound remains a real authority change even when full autopilot answers product forks. The sheet cannot be described as omniscient.

Practitioner question: Must the chart merely stop, or does the operator's next independently initiated message allow the need to be handled without claiming it was known early? Preserve the session/mode rules and record that this was an unexpected discovery. A wait line alone must not be presented as successful early discovery.

### Q5: How is the new needs timing made consistent and shown to work?

Options: O1, repair the existing opening, Take, Autopilot, Drain and relevant record/docs wording as one contract. O2, append one opening sentence and leave the later rules intact. Recommend O1. O2 retains the root contradiction in F5.

Grounding: `skills/chart-issues/SKILL.md` named sections; `assets/questions.md` prerequisite presentation; `assets/shapes.md` Chart records and Preflight and validation; `docs/use/autopilot.md` Switch it on and What still waits for you; `docs/use/plan-work.md` Set the signposts; `docs/reference/limits.md` What stays your job. Change only restatements affected by this contract, not unrelated process text.

Validation should judge behavior in concrete scenarios: no needs; missing key; paid/live grant; retention/save permission; already-authorized delivered-identity close; later discovery outside approved scope; an early request still pending later. Cover manual signposts and full-autopilot signposts without assuming A can approve anything. Use semantic review, not an exact-phrase/order checker. No new command is justified by the inspected surfaces or signpost 5a.

## Lifetime pitfalls and what removes them

- R1: Repeated runs become slow through leaked dependency resources again. Preserve the `97034315` split-runtime boundary and checked fixture cleanup. Do not restart or clean an operator core to obtain green tests. Grounding: `hcCore`, `stop`, `sweepAbandoned`, and the shutdown-unit lesson.
- R2: An inherited environment makes a private test contact a different core. Use the existing explicit `cleanEnv` and `core.hc` boundary. `tests/isolation.ts`'s libc/process environment synchronization alone is not a substitute for that selected session/runtime. Grounding: the Bun startup-environment lesson and `47186f90`.
- R3: Test speed improves by no longer checking the reported state transitions. Keep no-resend at the same turn, correct address/turn recording and late-start settlement as behavioral requirements. Grounding: `dispatchSlot` and the current reported case. Arbitrary machine-overload immunity is not a defensible done-criterion.
- R4: Early needs becomes blanket consent. Keep the existing grant scope, provenance, bounds and stop line, plus presence checks and real proofs before handoff. Earlier timing changes none of those guarantees. Grounding: `Take` and shapes Preflight and validation.
- R5: One changed skill section is overridden by a contradictory copy. Reconcile only the directly affected skill/assets/docs rules in the same leaf. Grounding: Q5's named surfaces. Broad doc cleanup is unnecessary.
- R6: Source completion is claimed to have repaired running doors. State the existing next-release-link limit at handoff. Grounding: `SKILL.md` Handoff. Release rollout or a new live run is not implied by this session's local-only proof scope.

## Proposed split

- D1: One source issue for #129, with one lifecycle leaf for the complete early-needs contract and its affected assets/docs. Its timing, authorization and late-discovery forks must settle together. Splitting wording and consistency across leaves would create an interim contradictory contract without an independently useful outcome.
- D2: Treat #130 as a verification-first outcome under a test-reliability issue. Create at most one narrow delivery-test/fixture leaf if Q1 proves a remaining cause. Do not merge #129 into this issue and do not make it depend on that leaf merely because test reliability is charted first. If current evidence supports closure, record `97034315` and the observed limits instead of inventing implementation work. Low confidence until the bounded load/configured-run evidence is collected.
- D3: #131 needs verification and closure naming `47186f90`, not a new leaf. The focused current test passed and the private environment boundary is visible in source. No suite-wide spawn audit or pinned-schema permissiveness change is requested.
