# Signposts return: slot B

Read: INTAKE.md, lifecycle-rules `## Grant reuse and count lines` (4 identical copies), chart-issues `## Take` and the `## Open` needs paragraph, standing-design.md, autopilot.md, check-issue operator-only lines, src/readiness.ts, the triggering grants (now at issues/closed/watch-consultants/watch-consults/readiness.yaml, the issues/open path is gone). Not read: run-check source, config schema.

Proposed ranking for every later pick: (1) no budget blown and no irreversible effect, (2) no operator stop per leaf, (3) fewer rules than today, (4) proof beyond sufficient evidence.

## Questions

Q1. What stays the operator's and what moves to seats?
- O1 Split. The operator approves authority once: identity, account, targets, effects, stop_line, one ceiling. Seats own every count under it.
- O2 Seats own everything, effects and targets included.
- O3 Keep per-leaf grants and only automate renewals.
- Rec O1. All four approvals in the triggering case differ only in the session count. The authority text was copied unchanged four times.

Q2. Hard limit: which operations can a seat budget for itself?
- O1 Paid model launches on already logged-in accounts, plus local writes with a proven cleanup. Live changes, destructive, public, billing, DNS, a new identity or a new target keep per-leaf operator approval.
- O2 O1 plus reversible live changes on throwaway targets.
- O3 Everything a grant covers today.
- Rec O1. Every stop in the intake was a paid session count. O1 cannot cause a loss that cleanup does not undo.

Q3. What form does "a limit the operator never re-approves" take?
- O1 One standing machine-level ceiling, per leaf and per day, counted by the machine, in prompted sessions and minutes per session.
- O2 One ceiling per door session on the needs sheet.
- O3 No number. Seats judge and review audits.
- Rec O1. O2 keeps one stop per session. O3 leaves no budget to blow, so nothing guards it. Dollars do not work as the unit: the accounts are subscriptions with no per-call price.

Q4. At the ceiling, which wins?
- O1 Budget wins: stop, one notice, the operator raises the ceiling once.
- O2 Unblocking wins: warn and continue.
- Rec O1. Below the ceiling a raise needs no operator. The ceiling is the single operator stop left.

Q5. Who judges "enough proof", and is there a floor?
- O1 The seat running the proof decides on recorded evidence and the reviewing seat reads the choice. Floor: the property was observed green at least once on the current model-facing inputs, and a red caused by product behavior never passes.
- O2 Same, with no floor.
- O3 Keep fixed run counts in criteria.
- Rec O1. standing-design already makes sufficiency the model's choice and bans a count standing in for it. The floor keeps "failed on budget" from covering a real red.

Q6. What must a seat show before raising its own budget?
- O1 Only the existing red-launch rule: a free reproduction passes after the repair, or the launch names an observation no earlier run produced.
- O2 A second seat signs off each raise.
- O3 Nothing below the ceiling.
- Rec O1. It is already written, it stops retry loops, and it adds no step.

Q7. Replace or add?
- O1 Replace. Repeat counts leave `grants[]`, and renewal entries, "N more after", the seat-written count audit and "the door never warns and runs" go. One mechanical ceiling check comes in.
- O2 Add an auto-renew layer on top of today's grants.
- Rec O1. The operator asked for removal over stacking, and O2 keeps every rule that caused the stops.

## Angles A might miss

- R1 Classifier (intake finding 5). A seat-written entry under `approved.by: operator` gets refused again, or is a forged approval. A seat's budget needs a record that is the seat's own, and `approved` stays operator-only.
- R2 Self-serving sufficiency. The seat that wants the merge labels its own red as budget-only. Make the cause a machine fact (run ended at a bound or timeout versus a check exit code) handed to the model as evidence, and have the other-model review seat read the choice.
- R3 Total across leaves. A per-leaf ceiling does not bound a watch tier running many leaves, and seat-written count lines already allow "unknown prior use". The count belongs where every covered launch already passes, `akrogon run-check`. Unverified: I did not read run-check.
- R4 Shared subscriptions. Seats and the operator's own sessions draw on the same quota, and exhaustion blocks the operator with no dollar signal. The per-day ceiling matters more than the per-leaf one.
- R5 Cleanup debt grows with runs (grants[1] had to order removal of 11 sessions' records). Cleanup before the next launch should stay a stop.
- R6 Door consistency. autopilot.md holds three lines that keep the door a bottleneck: paid proof calls wait for approval, the door never raises an existing bound in the skill, and a step that changes autopilot's own limits waits for the operator. Change all three together and record the intake as the approval for the third.
- R7 The grant rule lives in four identical files. Check for an existing sync before editing, and do not widen into dedup unless a fork picks it.
- R8 Open leaves carry old-shape grants and criteria that name run counts, and `bounds` is required text in `grantSchema`. Needs a fork: old shape valid until closed, or migrate.
- R9 This chart's own leaves should prove the ceiling with a free stub command, one pass and one deliberate break. No paid launch.
- R10 check-issue: a fresh live run after check.fix becomes a Fix the repair seat runs under standing authority. Only a ceiling or `stop_line` block stays under `Operator actions`.
- R11 Conflict to settle in a fork: the operator said a prose-only finding never needs a new run, while standing-design says a changed prompt or instruction is a changed model-facing input and an unknown effect is investigated, never reused.

## Operator-only needs

- N1 Standing authority approval. Operator words naming the accounts (logged-in harness accounts on this host), operations (paid model launches), effects (session records, trust entries, core state, removed after) and stop_line. The intake delegates the count but names none of these.
- N2 The ceiling numbers and unit, if Q3 takes O1. A cannot supply them (standing-design bound-source line, autopilot's no-number rule). A can propose a conservative default for a one-word yes.
- N3 Keys: none. Paid budget for charting this chart: none foreseen (R9).
