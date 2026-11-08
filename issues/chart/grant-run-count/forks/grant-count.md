# Fork: grant-count

## Question

1. What does a repeat bound count, and who says so?
2. What happens at the bound under signpost 2b, and for which bounds and seats?
3. Where does the running count live, and who may launch when two seats share a phase?
4. Who reads the warning, and what does review do with an overrun?
5. Which seats, operations and renewals does the rule cover?

### Carries

- Signposts (issues/chart/round-drawings/forks/signposts.md, Taken): 1c written rules only; 2b "Allow it with a warning. The task keeps moving, but costs can go over."; 3a one operator-approved charting test; 4a whole family; 5a new grants only; 6a parts the herdr-app move keeps.
- Earlier operator answer, #107 chart issues/chart/paid-proof-bounds/forks/bound-unit.md Taken (2026-10-19): no unit, free-text bounds ("I don't want to overcomplicate the system").
- Intake: Tamdoma/akrogon#126.

## Findings

Blind notes: slots/map-A.md, map-B.md, map-C.md; merged with A's proposed picks in slots/map-merged.md; one rebuttal each, also checking the picks (slots/map-rebuttal-B.md, map-rebuttal-C.md).

Research (better-than-training, inspected 2026-11-04):
- Framework `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` grants[2] "at most 1 known-good recorder run and 1 rerun"; `implementation/report.md` "Initial paid run" reports "1 run + 1 rerun" over runs whose paid batch session ran. Whether "known-good" caused A's miscount is an inference; the miscount itself is recorded. (A,C; B F6 on the inference)
- grants[3], [4] named the unit ("every invocation that reaches a paid session whatever its outcome"); B counted right and stopped (`review-B.md` "Renewed invocation 1/2"). (A,B,C)
- Framework `issues/timings.jsonl`: about 6 paid `record` runs against 4 allowed (from durations; low confidence). (C)
- `src/run-check.ts` (`checkedRun`) and `src/timing.ts` (`appendTiming`) keep per-run logs and `check_start`/`check_end`; no grant or nested-session record, so they are an audit floor. (A,B,C)
- The reuse sentence has four copies (plan-issue, implement-issue, check-issue, merge-issue "Shared context"); standing-design's recorded-output rule stops when no covering grant exists. (B,C)
- check-issue "Shared context": initial review is blind ("do not ... read the peer's current review"), so two review seats cannot see each other's count lines; check.repair already gives live proofs to B. (C X3)
- Grants carry `stop_line` text that can restate a repeat count (grants[3], [4]); a grant can mix repeat counts with spend caps (grants[1]). (C X4, X6)
- implement-issue has no worker-and-grant sentence; a worker sub-brief can hold a paid criterion proof. (B F4, C X7)
- External practice: model-knowledge only, no search run; metered-budget practice (count before spend, unknown is not zero) matches the slots' positions. Low weight.

## Taken

A's picks under autopilot, 2026-11-04 (not operator words).

1. New grants write each repeat bound with its unit and what consumes one, in plain words (for example "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"; nested units such as sessions per invocation as their own bound). The seat rule counts every covered launch that reaches its paid or live stage, whatever its outcome and whatever the bound's wording; "known-good" or "successful" in a bound never narrows the count. The chart-issues "Take" grant paragraph and the shapes.md `bounds` placeholder say so; `stop_line` never restates a repeat count.
   - Reason: signpost 4a and the evidence (the bound with a unit was kept, the one without was not). Free text stays, so no schema and no fixed form (1c, the 2026-10-19 "no unit" answer's simplicity intent).
   - Pick against an earlier operator answer: bound-unit (2026-10-19) kept bounds with no unit; this pick requires plain-words units in new grants, on today's signpost 4a and the #126 evidence.
   - Rejected: a fixed bound form (C; more form than needed); a schema field (1c, 5a); seat definition alone with free bounds (C X5: two texts would compete).
2. Signpost 2b applies to leaf seats and repeat-count bounds only: before a launch past such a bound the seat writes a warning and continues. Spend caps, operation, target, identity, effects, expiry and every other `stop_line` clause keep their stops; when a launch would cross both a repeat bound and a stop, the stop wins; on old grants a `stop_line` clause that only restates a repeat count reads as the bound (5a, no migration). The chart door keeps the operator approval wait for every paid proof call and signpost 3a's one test; it never warns and runs.
   - Reason: operator wording "The task keeps moving, but costs can go over" (C withdrew its stop reading); B K4a scope; C X2, X4, X6.
   - Rejected: stop at the bound (contradicts 2b); warn and run once (needs the count it lacks); warn-and-run for spend caps (2b's question was about runs; money keeps a hard stop, low-confidence reading recorded).
3. One count line per covered launch in the seat's existing pass artifact, written before the launch (grant entry, bound, count so far, unit) and completed after (outcome, IDs, sessions, cost when known); a seat reads earlier artifacts' lines before its first launch. Prior use that cannot be established is written as unknown with what is unknown, never as a number, and the next launch carries the warning. In check.review no seat launches a covered operation unless `plan.md` names the seat that runs that live proof; check.repair keeps B as today; merge keeps the merge seat.
   - Reason: B F1, F2; C X3 (blind review makes a shared count unreadable, so one owner is the only rule that leaves no unwarned overrun).
   - Rejected: accept the race as a limit (A's first pick; leaves an unwarned overrun); a shared tally file (a new part).
4. The warning goes in the pass artifact and in the seat's visible reply before the launch. Review: a warned overrun is information and the proof stands; an unwarned overrun, a count that does not match `check-<name>-*.log` and `issues/timings.jsonl`, or paid activity the artifacts do not explain is a Fix (correct the accounting), and an Operator action when the next launch needs a renewed grant. Proof-quality and other authorization judgments are unchanged.
   - Reason: B F5, C X1, X8.
5. Family: all four copies of the reuse sentence, standing-design's recorded-output "covering grant" sentence (2b's warn-and-run counts as covered for repeat bounds), and implement-issue "implement": a worker command that can reach a paid session is counted by A, who writes its count line. Every covered operation (paid launches and live changes) counts by its bound's unit. Renewal: a new grant entry states its new total or "N more after <date or commit>", and the next count line names the entry it draws on (chart-issues "Take" grant paragraph). The door's charting probe counts against the leaf grant it runs under.
   - Reason: B R4, F4; C X7, X9; signpost 4a.

Carried: new grants only (5a); no `src/`, schema or new file (1c); the change reaches seats only at the next release link; a provider-side cap (#107's revisit trigger) is an operator account step, Off route.

### Final-shape check, adopted 2026-11-04 (A's picks; slots/final-and-leaf-review-B.md, -C.md)

- Pick 2 (C S1): the warning exception covers repeat-count bounds of a paid operation only; a live-change repeat bound (a second destructive pass, "at most one pass rerun after a failure") keeps its stop.
- Pick 2 (B F1): the old-grant `stop_line` exception is removed. The rule applies to every grant a seat uses; signpost 5a holds because no open leaf in any registered repo holds a grant at handoff (A scanned every `issues/open/**/readiness.yaml`, 2026-11-04: none with `grants`).
- Pick 3 (B F2, C S3): unknown prior use warns only for a repeat count; when it prevents establishing compliance with a stop-type bound (spend cap or any other stop), the seat takes the operator-blocker stop.
- Pick 3 (B F3, C S2): check.review launches no covered operation; live proofs run in implement (A) and check.repair (B) as today; a needed live proof review finds missing from the plan is a Fix for check.repair. No plan-issue hook.
- Pick 4 (C S4): an Operator action is recorded when a stop-type bound or `stop_line` blocks the next launch.
- Pick 3 (C L4): a covered launch runs through `akrogon run-check`, so its log and timing row exist for the audit.
- Merge seat artifact (C L3): `review-B.md`.
- Why wording (B F4): at least three paid-reaching runs under the renewed two-run grant; "about six against four" is a duration-based inference.
