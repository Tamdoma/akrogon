# Fork notes C: failed-cause build-cause

## Pick

Q1: close #96 as not built, with a reopening condition. Reopen when any of these is recorded: (a) one watch recovery or non-recovery later shown wrong because the class was judged from reason text; (b) a consumer other than the watch tick (a scripted tick, status, a report) needs the class in structured form; (c) `failed` volume rises enough that per-tick re-judgment is a measured cost rather than a rounding error.

Reason: the one class with a proven payoff was `base` (map-merged #96, A: "`base` is the one class with a proven payoff (auto resume)"), and the taken base-red policy removes base reds from `failed` entirely, which is strictly better than classing them. What remains is re-judging roughly 20 failures in 36 days (~0.5/day, issues/log.jsonl count read today), with no observed wrong recovery and both error directions already bounded: a wrongly recovered human stop hits the two-cycle limit (skills/watch-issues/SKILL.md:41), and a wrongly unrecovered leaf still produced the operator notice at failure time. The build is not small against that: a CLI flag and schema field, 11 templated `failed --reason` write sites across the skills plus ad-hoc seat failures, an observe-script change, and a watch rewrite that keeps most of SKILL.md:40 anyway (owner resolution against inventory, dependents, notice bodies all stay). It also keeps the legacy reason-judgment branch (Q2 below), so the prose it was meant to delete mostly survives. I proposed this structured field in the jev-classifier chart when base reds still landed in `failed`; with that class gone, the remaining value is unproven, and building on spec invites seats to guess a kind to satisfy the flag, which is worse than prose because the watch would trust it.

Cost of not building: watch keeps judging one reason line per failed leaf per tick, inside a turn that runs anyway. Reason quality stays load-bearing; the templated sites already force the facts watch looks for ("missing <VAR> blocks...", "<operator action first; ...>"), and free-form blockers stay the weak spot.

## Rejected options

Build now. Costs above, for an unmeasured benefit. Invites later: kind taxonomy creep (each new watch nuance wants a new kind), and confident wrong kinds from seats at ad-hoc failure sites where the class is genuinely not knowable at write time.

Build, storing a recovery verdict (`recoverable: true/false`). A verdict freezes at write time facts that change: an owner-defect failure is recoverable only once the owner merges, and only while seats are idle and the cycle bound allows. The watch would need override rules on top of the verdict, negating it. Facts or nothing (map-merged #96, B, which I accept).

Repurpose the existing `cause` enum as the class. `cause: blocked` is not idle decoration: it drives the dirty-worktree recovery exemption (src/phase.ts:286) and `cause: attempts`, which no current src writer produces (the only writer, src/phase.ts:274, always writes `blocked`), still drives a dispatch guard (src/next.ts:780-784) and may sit in other repos' state files from older command versions. Overloading or shrinking this enum risks breaking legacy records in consumer repos for a watch convenience. Leave it untouched either way; removing the dead `attempts` writer question is separate scope (see Q-a).

Close with no reopening condition. Loses the trigger that makes "not now" checkable; the next misclassification would be re-argued from scratch.

## Q2, if built later (conditional, not my pick)

- Store facts, new field beside `cause`, never inside it: `failure.kind: human | owner | other`, plus `failure.owner: <slug>` required when kind is `owner` and forbidden otherwise. `human` covers credential, permission, operator decision and external step. Derive recoverability at tick time: `human` never recovers; `owner` behaves as human-class when the owner is merged (chart a fix) and as failed-otherwise while unmerged; `other` takes failed-otherwise with the existing seat-idle check and two-cycle bound computed from log.jsonl as today.
- Legacy records without `kind`: watch judges from reason exactly as today. Never default an absent kind to recoverable, and do not make absent-kind notify-only either, since reason-carrying records recover today and that would silently change behavior for every parked consumer-repo leaf (map-merged #96, B). The branch is permanent for as long as old state files can exist, which is part of why Q1 does not pay now.
- Kind passed as a `phase failed` flag, optional at the command and required by the skill templates that know it (missing-VAR and operator-action sites pass `human`); ad-hoc blockers may omit it and fall to the legacy branch rather than guess.
- Breaks/invites: a wrong `human` strands a leaf until the operator phases it by hand (safe direction, noticed); a wrong `other` is bounded by the two-cycle limit; a wrong owner slug sends the existing unresolved-owner path, never an assignment.

## Evidence

- operator · GitHub Tamdoma/akrogon#96 as carried in INTAKE.md, 2026-10-17 · watch re-classifies from free-text reason each tick; urgency low, no observed wrong recovery, pain unmeasured; operator asked for a seed, not charting.
- operator-tier via autopilot pick · issues/chart/base-red/forks/red-base-policy.md Taken, 2026-10-17 · no leaf is marked `failed` for a base red; accepts no assigned repair owner.
- better-than-training · repo read 2026-10-17 · src/state.ts:12-18 `failureSchema` (`cause: blocked|attempts`, phase, slot, reason, delivery); src/phase.ts:266-283 the only failure writer, always `cause: 'blocked'`; src/phase.ts:286 blocked-cause worktree exemption; src/next.ts:777-786 `attempts` still read by dispatch; skills/watch-issues/scripts/observe.ts:250 prints `failed=<cause>@<phase> ... reason="..."` for the tick; 11 `failed --reason` templates across skills; 20 entries into `failed` in issues/log.jsonl.
- better-than-training · skills/watch-issues/SKILL.md:40-41, read 2026-10-17 · the three classes judged from reason, owner resolution against readable inventory with only `phase=merged` counting, unmerged-owner exception routed to failed-otherwise, two-consecutive-unproductive-cycles bound.
- better-than-training · issues/chart/base-red/slots/map-merged.md #96 (A,B), read 2026-10-17 · defer until #98 settles; `base` the one proven-payoff class; store facts and an owner reference, not a verdict; never default an absent class to recoverable; wrong human recovery bounded by the two-cycle limit.

## Pitfalls, and what removes each

P1. Closing not-built hardens into never-built, and a future misjudgment has no home. Removed by recording the reopening conditions in the fork Taken, with (a) requiring only that the wrong call be recorded in a watch or leaf report when noticed.
P2. A seat writes a vague blocker and watch misjudges it every tick in the same direction. Not removed by closing; bounded today by the operator notice at failure time (src/phase.ts:83-104) and the two-cycle limit. The templated reason sites are the mitigation that already exists.
P3. If built later, required-at-command kind forces guesses at novel failure sites. Removed in the Q2 shape by optional flag plus the legacy branch; templates, not the command, carry the requirement.
P4. If built later, kind and reason disagree (kind says human, reason names a fixable owner). Needs one precedence line before build: kind wins for recovery, reason still shown in the notice, disagreement reported as a gap. Stated here so the later leaf does not invent it silently.
P5. Version skew: consumer repos may run older akrogon builds that still write `cause: attempts` or lack the kind flag. Removed by keeping the schema additive (new optional field, enum untouched) in any later build; nothing to do while closed.

## Questions the fork does not ask

Q-a. `cause: attempts` has a reader (src/next.ts:780-784) and no writer in current src. Is that dead code to remove in its own leaf, or a live value still written by older builds in consumer repos? The answer bounds any future schema change and is worth one line in this chart's Taken even while #96 closes.
Q-b. If built, is the flag required by `akrogon phase failed` itself? Required gives complete data and forced guesses; optional gives honest gaps and a permanent legacy branch. Q2 asks which classes, not this, and the answer changes the build's value.
Q-c. Who else would read the class? `akrogon status` prints Failed lines today from the same record. If the operator wants the class visible there, that is a second consumer and changes Q1; if not, watch remains the only reader and the case for building stays thin.
