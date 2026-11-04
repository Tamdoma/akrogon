# Signposts angles, slot C

Four questions. Each changes several picks across #125 (round drawings), #126 (grant run count) and #127 (proof limits at handoff), and evidence cannot settle it.

Cross-chart fact A should hold while reading: #126 and #127 are one chain on one leaf. An unproven criterion handed off (#127) put the seat in a fix-and-rerun loop, and that loop produced the overspend (#126). Fixing #127 lowers how often #126 triggers. Autopilot also removes both reports' workarounds (operator reads logs, operator reads limits at review): in this mode nothing shown to the operator mid-session gets read.

## Q1. Where does a rule live when the command could check it: command refuses, command shows, or skill text instructs?

- O1a: the command refuses when state it already holds (receipts, readiness.yaml, criteria) breaks the rule. Skills keep only what needs judgment.
- O1b: the command computes and shows the violation, the seat or operator decides.
- O1c: skill text only, the seat accounts for itself (the #107 posture).

Recommended: O1a. #107 already tried O1c for the same pattern and it recurred within a week, and under autopilot O1b's warning has no reader.

Reshapes: #126 bounds field shape (counted number vs prose), where counting happens (run-check receipts vs seat report), run-check exit on a bound hit. #127 whether the handoff audit is a command step or a skill paragraph, and whether proofs link to the criteria they cover as data. #125 stays text by nature, so O1a settles that it gets no test pinning the round shape. One limit on O1a that matches the operator's own rule (mechanical checks validate function, judgment stays with an agent): a run count is a cost record and fits the command, but "did this proof reach the property" is a judgment. For #127 the mechanical part is only the link (each criterion names a proof that claims to cover it), the judgment stays in the handoff review.

## Q2. Who pays to learn an unknown: charting proves the deciding property before handoff, or implementation discovers it under grants?

- O2a: a handoff needs, per done-criterion, a proof that reached the criterion's deciding property, or the criterion narrowed at the handoff review to what was proven. Charting runs the probe.
- O2b: handoff proceeds with the gap recorded, implementation discovers, grants cover the cost.
- O2c: charting probes only when the operator asks at the review.

Recommended: O2a. One charting probe is one paid run. The observed alternative was three stops, five grants, about ten sessions and a dependent leaf blocked seven hours.

Reshapes: #127 audit strictness and the narrowing path at the review. #126 whether charting probes count under a grant and so whether grants exist at chart time, not only on leaves. Chart order (#127 before #126, since this answer sets what #126's counter must cover).

## Q3. Do the fixes apply to currently open leaves and handed-off charts in registered repos, or only to new grants and new handoffs?

- O3a: new grants and new handoffs only. Open leaves keep their prose bounds and no re-audit.
- O3b: open leaves too, so the bounds field needs a tolerant parse or a migration and already-handed charts get re-audited.

Recommended: O3a. Removing over adding: O3b adds a migration or dual parse for one nearly finished leaf.

Reshapes: #126 whether bounds is replaced or an optional field added beside prose, and parse strictness on old readiness.yaml. #127 whether the audit runs on existing handoffs. Both: test fixtures and the release note.

## Q4. Is #125 in this session, and where?

- O4a: last, after #126 and #127 land.
- O4b: dropped this session, re-handed in a manual-mode session.
- O4c: first, so the later rounds of this session carry drawings.

Recommended: O4a. Under autopilot A answers every round, so drawings help nobody this session (O4c buys nothing), but the change is small and the operator already asked for it twice, so drop (O4b) only if the two money charts run long.

Reshapes: session order, and whether #125's round-shape change is text only (fits O1a) with no line budget or test touched.

## Chart order

#127, #126, #125. #127 has the largest cost and a blocked dependent leaf, and its answer on charting probes sets what #126's counter covers. #125 is low urgency and has no reader this session.
