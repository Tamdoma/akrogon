# Blind fork notes: report-130, B

Read the fork's Question/Carries, not Findings. Applied the held five-part note definition after confirming the named installed questions asset equals the source copy already read. Inspected all ten focused logs and the full-test log. No additional test, live call, agent or source change was made.

## Q1: Is #130 already delivered?

### Pick, reason and cost

D1: Yes. Close #130 naming `97034315`, with the retained observations and their limits. Do not create a delivery-test leaf. That commit removes the demonstrated fixture mechanism that polluted the shared user manager, and current repeated idle, loaded and configured-suite execution no longer exhibits this reported failure. Cost: bounded observations establish the reported condition on this host, not immunity to arbitrary resource starvation or a guarantee that no timing failure can recur.

### Rejected options

- O1: A new leaf merely because the case still takes about 15 seconds. Intentional observation of an unstarted task has a real cost. No current evidence shows that this remaining duration is itself a defect requiring a change.
- O2: Keep the issue open until every suite failure is repaired. That would expand #130 to unrelated outcomes and conflict with signposts 3a/4a. Preserve the actual red suite result separately.
- O3: Raise the cap or shorten a production wait. Foreclosed by signpost 2a and unsupported by the current observations.

### Evidence, tier, source and date

- F1: `better-than-training`, repository source/history, inspected 2026-11-09: `97034315` changes `hcCore` to use separate application/core runtime directories and explicit environments. The core has no systemd link, while seat scopes retain their required path through `tests/core-bin/systemd-run`. `git merge-base --is-ancestor 97034315 HEAD` exited 0 this turn. The commit records unchanged shutdown-unit and real-socket counts after a suite.
- F2: `better-than-training`, measured historical observation, `learnings/history/2026-11-08-hc-shutdown-unit-leak.md`, read earlier this session: clearing 32,575 leaked units made previously failing verifies pass on the same leaf heads. The subsequent suites recreated units before the private-runtime fix. This supplies a causal explanation stronger than CPU-load correlation alone.
- F3: `better-than-training`, current measured logs, 2026-11-09: `slots/evidence/m130-idle-{1..5}.log` all pass, total runtimes 14.92–16.35 seconds. `m130-load-{1..5}.log` all pass, 15.38–15.46 seconds. A's supplied observation supplies the load setup: 32 burners on 32 cores, load 19–30. The small logs contain the pass results and elapsed times, not that setup or load telemetry.
- F4: `better-than-training`, current configured-run log and A's supplied observation, 2026-11-09: `slots/evidence/full-test-2026-11-09.log` ran 1,144 cases at four-way parallelism in 54.84 seconds. Its two failures are both in `tests/hc-listener.test.ts`; no reported delivery-case failure appears. A reports 1,109 shutdown units both before and after. This is evidence about #130 and nonaccumulation, not a green full check: the summary is 1,142 pass, 2 fail.
- F5: `better-than-training`, B's earlier current-code observation, 2026-11-09: the reported case and pinned-schema case passed together with the configured timeout/parallel/no-isolate flags, 14.93 seconds total, exit 0. That focused run alone did not settle the load question; F3/F4 now supply the missing context.

### Pitfalls and what removes them

- R1: Calling the full check green would hide its listener failures. Record both names and retain the log: “a cleared foreground from the real core keeps the listener alive through restart” and “the listener subscribes before its catch-up, wakes on turn end, blocked and exit of labelled terminals only, and folds queued wakes.” Record those outside the handed outcome rather than repairing them here.
- R2: Attributing every possible load failure to the old leak would overstate the result. The close explanation names the removed fixture mechanism and the actual observed load range. A future distinct reproduction remains evidence for new intake.
- R3: A test can pass by skipping the negative state sequence. Existing source still checks unconfirmed startup, unstarted delivery, unchanged-turn suppression and late-turn settlement; this proposal deletes or bypasses none of it. Current passing runs preserve those expectations.

### Question not asked by the fork

Q3: Does the close record retain the test command, tested revision, load setup, unit counts and the full-suite red result together? Keep the supplied setup attributed to A where the raw logs do not contain it. This is evidence recording, not a reason to manufacture implementation work or run more tests.

## Q2: What remains for a leaf, including hd-silent?

### Pick, reason and cost

D2: Nothing remains on the supplied evidence. No scenario split, controlled negative reply, fixed-cost trim or `hd-silent` change. The conditional leaf question ends with D1. Cost: the existing negative-path runtime remains, but no demonstrated failure is left for a leaf to remove.

### Rejected options

- O4: Split the existing sequence now. Moving the same waits across cases does not remove a demonstrated cause and can lose the continuity that proves a failed send is settled after its turn moves.
- O5: Add a controlled `not_started` reply now. That can be a sound future state-machine technique, but here it adds fixture behavior without evidence the real boundary is causing a remaining failure. The existing shim's unavailable reply proves a different path and is not itself proof that native `not_started` semantics are covered elsewhere.
- O6: Include sibling `hd-silent` because it shares the file or historical timeout workaround. That case proves silent-stop retry limits and reset on phase move. Shared file/history alone is not a current defect or a necessary shared-boundary repair under signpost 3a.

### Evidence, tier, source and date

F6: `better-than-training`, inspected source and history, 2026-11-09: `tests/hc-delivery.test.ts` contains separate working-seat, silent-stop and late-settlement scenarios; `src/next.ts` `dispatchSlot` owns the turn guards and settlement; `src/hc.ts` `send` delegates native delivery; `src/seat.ts` `firstTask` uses the fixture's existing start-proof bound. `233d01ca` and `75f61f00` document the attempted and reverted cap increase. None supplies a current residual cause after F1-F4.

### Pitfalls and what removes them

- R4: A supposed “does not depend on machine load” done-criterion would promise unlimited scheduling capacity. If a fresh reproduction justifies a future leaf, its criterion should name the structural cause removed, preserve delivery behavior, and demonstrate that property under a stated bounded concurrent condition using the existing cap. Do not invent a new seconds threshold.
- R5: Changing tests to produce a green suite could drift into listener repair. Separate the observed listener failures from this delivered identity. Their presence prevents a whole-suite green claim, not a targeted #130 closure.

### Question not asked by the fork

Q4: If a later reproduction appears, does it persist with stable shutdown-unit counts and isolated runtimes? That separates a new scheduling/delivery cause from recurrence of the old environmental contamination. Ask it on that evidence, not as work added to this closed outcome now.
